import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { LobbyLoader } from "@/components/game/LobbyLoader";
import { LobbyList } from "@/components/game/LobbyList";
import { CreateLobbyModal } from "@/components/game/CreateLobbyModal";
import { JoinLobbyModal } from "@/components/game/JoinLobbyModal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Plus } from "lucide-react";
import { fetchLobbies, LobbyData } from "@/services/lobbyApi";
import { useToast } from "@/hooks/use-toast";

const gameNames: Record<string, string> = {
  chess: "Chess",
  checkers: "Checkers",
  durak: "Durak",
};

const GameLobby = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [lobbies, setLobbies] = useState<LobbyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedLobby, setSelectedLobby] = useState<LobbyData | null>(null);
  
  // Wallet state
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const gameName = gameId ? gameNames[gameId] || gameId : "Game";

  // Load wallet address from localStorage
  useEffect(() => {
    const storedAddress = localStorage.getItem("connectedWalletAddress");
    setWalletAddress(storedAddress);

    // Listen for wallet changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "connectedWalletAddress") {
        setWalletAddress(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const loadLobbies = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      const data = await fetchLobbies();
      setLobbies(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load lobbies";
      setError(errorMessage);
      console.error("Error fetching lobbies:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadLobbies();
  }, [loadLobbies, gameId]);

  const handleJoinLobby = (lobby: LobbyData) => {
    setSelectedLobby(lobby);
    setJoinModalOpen(true);
  };

  const handleRefresh = () => {
    loadLobbies(true);
  };

  const handleLobbyCreated = (lobby: LobbyData) => {
    toast({
      title: "Лобби создано",
      description: `Лобби #${lobby.id_lobby} успешно создано`,
    });
    loadLobbies(true);
  };

  const handleJoined = () => {
    toast({
      title: "Подключение",
      description: "Вы успешно подключились к лобби!",
    });
    loadLobbies(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate("/game")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {gameName} Lobbies
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {walletAddress 
                      ? "Выберите лобби или создайте новое"
                      : "Подключите кошелёк для игры"}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleRefresh}
                  disabled={isLoading || isRefreshing}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  Обновить
                </Button>
                
                <Button 
                  onClick={() => setCreateModalOpen(true)}
                  disabled={!walletAddress}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Создать лобби
                </Button>
              </div>
            </div>

            {/* Content */}
            {isLoading ? (
              <LobbyLoader />
            ) : (
              <LobbyList 
                lobbies={lobbies}
                error={error}
                onJoinLobby={handleJoinLobby}
              />
            )}
          </div>
        </div>
      </main>

      {/* Create Lobby Modal */}
      <CreateLobbyModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        walletAddress={walletAddress}
        onLobbyCreated={handleLobbyCreated}
      />

      {/* Join Lobby Modal */}
      <JoinLobbyModal
        open={joinModalOpen}
        onOpenChange={setJoinModalOpen}
        lobby={selectedLobby}
        walletAddress={walletAddress}
        gameId={gameId || "chess"}
        onJoined={handleJoined}
      />
    </div>
  );
};

export default GameLobby;

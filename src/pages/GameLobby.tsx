import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { LobbyLoader } from "@/components/game/LobbyLoader";
import { LobbyList } from "@/components/game/LobbyList";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
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

  const gameName = gameId ? gameNames[gameId] || gameId : "Game";

  const loadLobbies = async (showRefreshIndicator = false) => {
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
  };

  useEffect(() => {
    loadLobbies();
  }, [gameId]);

  const handleJoinLobby = (lobby: LobbyData) => {
    // Future: Implement lobby join logic
    toast({
      title: "Joining lobby",
      description: `Connecting to lobby #${lobby.id_lobby}...`,
    });
    console.log("Joining lobby:", lobby);
  };

  const handleRefresh = () => {
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
                    Select a lobby to join the game
                  </p>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
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
    </div>
  );
};

export default GameLobby;

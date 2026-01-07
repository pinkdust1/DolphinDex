import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { GameLoading } from '@/components/game/GameLoading';
import { LobbyList } from '@/components/game/LobbyList';
import { LobbyActions } from '@/components/game/LobbyActions';
import { CreateLobbyDialog } from '@/components/game/CreateLobbyDialog';
import { JoinLobbyDialog } from '@/components/game/JoinLobbyDialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { GameType, GAMES, Lobby } from '@/types/game';
import { lobbyService } from '@/services/lobbyService';
import { toast } from 'sonner';

const GameLobby = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(true);
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [selectedLobby, setSelectedLobby] = useState<Lobby | null>(null);

  const game = gameId ? GAMES[gameId as GameType] : null;

  const fetchLobbies = useCallback(async () => {
    if (!game) return;
    
    try {
      setIsRefreshing(true);
      const data = await lobbyService.getLobbies(game.id);
      setLobbies(data);
    } catch (error) {
      toast.error('Failed to load lobbies');
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  }, [game]);

  useEffect(() => {
    if (!showLoading && game) {
      fetchLobbies();
    }
  }, [showLoading, game, fetchLobbies]);

  const handleLoadingComplete = useCallback(() => {
    setShowLoading(false);
  }, []);

  const handleJoinLobby = (lobbyId: string) => {
    const walletAddress = localStorage.getItem('xaman_account');
    if (!walletAddress) {
      toast.error('Please connect your wallet to join a lobby');
      return;
    }

    const lobby = lobbies.find(l => l.id === lobbyId);
    if (lobby) {
      setSelectedLobby(lobby);
      setShowJoinDialog(true);
    }
  };

  const handleCreateLobby = () => {
    const walletAddress = localStorage.getItem('xaman_account');
    if (!walletAddress) {
      toast.error('Please connect your wallet to create a lobby');
      return;
    }
    setShowCreateDialog(true);
  };

  const handleLobbyCreated = (newLobby: Lobby) => {
    setLobbies(prev => [newLobby, ...prev]);
    setShowCreateDialog(false);
    toast.success('Lobby created successfully');
  };

  const handleJoinSuccess = () => {
    setShowJoinDialog(false);
    setSelectedLobby(null);
    fetchLobbies();
    toast.success('Joined lobby successfully');
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-24">
          <div className="container mx-auto px-4">
            <Card className="p-12 text-center">
              <h1 className="text-2xl font-bold mb-4">Game not found</h1>
              <Button onClick={() => navigate('/game')}>
                Back to games
              </Button>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (showLoading) {
    return <GameLoading game={game} onComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            {/* Header section */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate('/game')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                    <span className="text-3xl md:text-4xl">{game.icon}</span>
                    {game.name}
                  </h1>
                  <p className="text-muted-foreground">{game.description}</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLobbies}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>

            {/* Lobby list */}
            <LobbyList 
              lobbies={lobbies} 
              isLoading={isLoading} 
              onJoinLobby={handleJoinLobby}
            />

            {/* Bottom actions */}
            <LobbyActions 
              game={game} 
              onCreateLobby={handleCreateLobby}
              isCreating={false}
            />
          </div>
        </div>
      </main>

      {/* Create Lobby Dialog */}
      <CreateLobbyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        game={game}
        onLobbyCreated={handleLobbyCreated}
      />

      {/* Join Lobby Dialog */}
      {selectedLobby && (
        <JoinLobbyDialog
          open={showJoinDialog}
          onOpenChange={setShowJoinDialog}
          lobby={selectedLobby}
          onJoinSuccess={handleJoinSuccess}
        />
      )}
    </div>
  );
};

export default GameLobby;

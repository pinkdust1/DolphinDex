import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { GameLoading } from '@/components/game/GameLoading';
import { LobbyList } from '@/components/game/LobbyList';
import { LobbyActions } from '@/components/game/LobbyActions';
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
  const [isCreating, setIsCreating] = useState(false);

  const game = gameId ? GAMES[gameId as GameType] : null;

  const fetchLobbies = useCallback(async () => {
    if (!game) return;
    
    try {
      setIsRefreshing(true);
      const data = await lobbyService.getLobbies(game.id);
      setLobbies(data);
    } catch (error) {
      toast.error('Ошибка загрузки лобби');
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

  const handleJoinLobby = async (lobbyId: string) => {
    const walletAddress = localStorage.getItem('walletAddress');
    if (!walletAddress) {
      toast.error('Подключите кошелёк для входа в лобби');
      return;
    }

    try {
      await lobbyService.joinLobby(lobbyId);
      toast.success('Вы присоединились к лобби');
    } catch (error) {
      toast.error('Ошибка при входе в лобби');
    }
  };

  const handleCreateLobby = async () => {
    const walletAddress = localStorage.getItem('walletAddress');
    if (!walletAddress) {
      toast.error('Подключите кошелёк для создания лобби');
      return;
    }

    if (!game) return;

    try {
      setIsCreating(true);
      const newLobby = await lobbyService.createLobby(game.id, walletAddress);
      setLobbies(prev => [newLobby, ...prev]);
      toast.success('Лобби создано');
    } catch (error) {
      toast.error('Ошибка при создании лобби');
    } finally {
      setIsCreating(false);
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-24">
          <div className="container mx-auto px-4">
            <Card className="p-12 text-center">
              <h1 className="text-2xl font-bold mb-4">Игра не найдена</h1>
              <Button onClick={() => navigate('/game')}>
                Вернуться к списку игр
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
                  <p className="text-muted-foreground">{game.nameRu}</p>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLobbies}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Обновить</span>
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
              isCreating={isCreating}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameLobby;

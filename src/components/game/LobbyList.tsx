import { Lobby, LobbyStatus } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Clock, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LobbyListProps {
  lobbies: Lobby[];
  isLoading: boolean;
  onJoinLobby: (lobbyId: string) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getStatusText = (status: LobbyStatus): string => {
  switch (status) {
    case 'waiting':
      return 'Ожидает';
    case 'playing':
      return 'В игре';
    case 'finished':
      return 'Завершена';
  }
};

export const LobbyList = ({ lobbies, isLoading, onJoinLobby }: LobbyListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (lobbies.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Нет активных лобби</h3>
        <p className="text-sm text-muted-foreground">
          Создайте новое лобби, чтобы начать игру
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {lobbies.map((lobby) => (
        <Card 
          key={lobby.id} 
          className="p-4 hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-center justify-between gap-4">
            {/* Left: Creator info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <span className="text-sm font-medium">
                  {lobby.creatorName.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate">{lobby.creatorName}</p>
                <p className="text-xs text-muted-foreground font-mono truncate">
                  {lobby.creatorAddress}
                </p>
              </div>
            </div>

            {/* Center: Status & Players */}
            <div className="hidden sm:flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{lobby.playersCount}/{lobby.maxPlayers}</span>
              </div>
              
              <div className="text-sm">
                <span className={
                  lobby.status === 'waiting' 
                    ? 'text-foreground' 
                    : 'text-muted-foreground'
                }>
                  {getStatusText(lobby.status)}
                </span>
              </div>

              {lobby.status === 'playing' && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatTime(lobby.gameTime)}</span>
                </div>
              )}
            </div>

            {/* Right: Action */}
            <Button
              variant={lobby.status === 'waiting' ? 'default' : 'outline'}
              size="sm"
              disabled={lobby.status !== 'waiting'}
              onClick={() => onJoinLobby(lobby.id)}
              className="shrink-0"
            >
              {lobby.status === 'waiting' ? 'Войти' : 'Смотреть'}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Mobile: Status row */}
          <div className="flex sm:hidden items-center gap-4 mt-3 pt-3 border-t border-border text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{lobby.playersCount}/{lobby.maxPlayers}</span>
            </div>
            <span>•</span>
            <span>{getStatusText(lobby.status)}</span>
            {lobby.status === 'playing' && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatTime(lobby.gameTime)}</span>
                </div>
              </>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

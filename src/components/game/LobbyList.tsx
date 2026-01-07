import { Lobby, LobbyStatus, LOBBY_STATUS_CONFIG } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Clock, ArrowRight, Coins } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LobbyListProps {
  lobbies: Lobby[];
  isLoading: boolean;
  onJoinLobby: (lobbyId: string) => void;
}

const formatTime = (startTime: string): string => {
  const start = new Date(startTime);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - start.getTime()) / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getStatusDisplay = (status: LobbyStatus) => {
  return LOBBY_STATUS_CONFIG[status] || { label: status, color: 'text-muted-foreground' };
};

const getPlayersCount = (lobby: Lobby): number => {
  return lobby.opponent_id ? 2 : 1;
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
        <h3 className="text-lg font-semibold mb-2">No active lobbies</h3>
        <p className="text-sm text-muted-foreground">
          Create a new lobby to start playing
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {lobbies.map((lobby) => {
        const creatorName = lobby.creator?.display_name || 'Unknown';
        const creatorAddress = lobby.creator?.wallet_address || '';
        const statusDisplay = getStatusDisplay(lobby.status);
        const playersCount = getPlayersCount(lobby);
        const canJoin = lobby.status === 'waiting_for_player';
        
        return (
          <Card 
            key={lobby.id} 
            className="p-4 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              {/* Left: Creator info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <span className="text-sm font-medium">
                    {creatorName.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{creatorName}</p>
                    <span className="text-xs font-mono text-muted-foreground">
                      {lobby.lobby_code}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {creatorAddress.slice(0, 12)}...
                  </p>
                </div>
              </div>

              {/* Center: Bet, Status & Players */}
              <div className="hidden sm:flex items-center gap-6">
                {lobby.bet_amount > 0 && (
                  <div className="flex items-center gap-1 text-sm font-medium">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span>{lobby.bet_amount} XRP</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{playersCount}/{lobby.max_players}</span>
                </div>
                
                <div className="text-sm">
                  <span className={statusDisplay.color}>
                    {statusDisplay.label}
                  </span>
                </div>

                {lobby.status === 'in_game' && lobby.game_started_at && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(lobby.game_started_at)}</span>
                  </div>
                )}
              </div>

              {/* Right: Action */}
              <Button
                variant={canJoin ? 'default' : 'outline'}
                size="sm"
                disabled={!canJoin}
                onClick={() => onJoinLobby(lobby.id)}
                className="shrink-0"
              >
                {canJoin ? 'Join' : 'Watch'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Mobile: Status row */}
            <div className="flex sm:hidden items-center gap-4 mt-3 pt-3 border-t border-border text-sm text-muted-foreground flex-wrap">
              {lobby.bet_amount > 0 && (
                <>
                  <div className="flex items-center gap-1">
                    <Coins className="h-3.5 w-3.5 text-yellow-500" />
                    <span className="font-medium text-foreground">{lobby.bet_amount} XRP</span>
                  </div>
                  <span>•</span>
                </>
              )}
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>{playersCount}/{lobby.max_players}</span>
              </div>
              <span>•</span>
              <span className={statusDisplay.color}>{statusDisplay.label}</span>
              {lobby.status === 'in_game' && lobby.game_started_at && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatTime(lobby.game_started_at)}</span>
                  </div>
                </>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

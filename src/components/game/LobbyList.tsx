import { Lobby, LobbyStatus } from '@/types/game';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Users, Clock, LogIn } from 'lucide-react';
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

const getStatusBadge = (status: LobbyStatus) => {
  switch (status) {
    case 'waiting':
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
          Ожидает
        </Badge>
      );
    case 'playing':
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          Играют
        </Badge>
      );
    case 'finished':
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground">
          Завершена
        </Badge>
      );
  }
};

export const LobbyList = ({ lobbies, isLoading, onJoinLobby }: LobbyListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 border border-border rounded-lg">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-24 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (lobbies.length === 0) {
    return (
      <div className="text-center py-12 border border-border rounded-lg bg-card">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Нет активных лобби</h3>
        <p className="text-sm text-muted-foreground">
          Создайте новое лобби, чтобы начать игру
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">ID Лобби</TableHead>
            <TableHead className="font-semibold">Создатель</TableHead>
            <TableHead className="font-semibold">Игроки</TableHead>
            <TableHead className="font-semibold">Статус</TableHead>
            <TableHead className="font-semibold">Время</TableHead>
            <TableHead className="font-semibold text-right">Действие</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lobbies.map((lobby) => (
            <TableRow key={lobby.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-mono text-sm">{lobby.id}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{lobby.creatorName}</span>
                  <span className="text-xs text-muted-foreground">{lobby.creatorAddress}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{lobby.playersCount}/{lobby.maxPlayers}</span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(lobby.status)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{lobby.status === 'playing' ? formatTime(lobby.gameTime) : '-'}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  variant={lobby.status === 'waiting' ? 'default' : 'outline'}
                  disabled={lobby.status !== 'waiting'}
                  onClick={() => onJoinLobby(lobby.id)}
                  className="gap-1"
                >
                  <LogIn className="h-4 w-4" />
                  {lobby.status === 'waiting' ? 'Войти' : 'Смотреть'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

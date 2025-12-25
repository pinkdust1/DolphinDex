import { Button } from '@/components/ui/button';
import { GameInfo } from '@/types/game';
import { Users, Trophy, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

interface LobbyActionsProps {
  game: GameInfo;
  onCreateLobby: () => void;
  isCreating: boolean;
}

export const LobbyActions = ({ game, onCreateLobby, isCreating }: LobbyActionsProps) => {
  const handleLeaderboard = () => {
    toast.info('Таблица лидеров скоро будет доступна');
  };

  const handleHelp = () => {
    toast.info('Coming soon', {
      description: 'Раздел помощи находится в разработке',
    });
  };

  return (
    <div className="border border-border rounded-lg bg-card p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
            {game.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Лобби</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {game.name} • до {game.maxPlayers} игроков
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="default"
            onClick={onCreateLobby}
            disabled={isCreating}
            className="flex-1 sm:flex-none"
          >
            <Users className="h-4 w-4 mr-2" />
            Создать лобби
          </Button>
          
          <Button
            variant="outline"
            onClick={handleLeaderboard}
            className="flex-1 sm:flex-none"
          >
            <Trophy className="h-4 w-4 mr-2" />
            Лидеры
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleHelp}
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

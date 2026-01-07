import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GameInfo } from '@/types/game';
import { Plus, Trophy, HelpCircle } from 'lucide-react';
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
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-lg bg-secondary flex items-center justify-center text-3xl">
            {game.icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg">Лобби</h3>
            <p className="text-sm text-muted-foreground">
              {game.name} • до {game.maxPlayers} игроков
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={onCreateLobby}
            disabled={isCreating}
            className="flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 mr-2" />
            Создать лобби
          </Button>
          
          <Button
            variant="outline"
            onClick={handleLeaderboard}
          >
            <Trophy className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Лидеры</span>
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
    </Card>
  );
};

import { Gamepad2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GameItem {
  id: string;
  title: string;
  status: 'live' | 'coming-soon';
}

const games: GameItem[] = [
  { id: 'checkers', title: 'Checkers', status: 'coming-soon' },
  { id: 'chess', title: 'Chess', status: 'coming-soon' },
  { id: 'durak', title: 'Durak', status: 'coming-soon' },
];

export const GameTab = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Gamepad2 className="w-6 h-6 text-foreground" />
        <h2 className="text-xl font-bold text-foreground">Games</h2>
      </div>
      
      <div className="flex flex-col gap-3">
        {games.map((game) => (
          <Card key={game.id} className="bg-card border-border">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{game.title}</CardTitle>
                <Badge 
                  variant={game.status === 'live' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {game.status === 'live' ? 'Live' : 'Soon'}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

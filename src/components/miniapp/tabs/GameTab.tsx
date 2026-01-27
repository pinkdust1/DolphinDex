import { Gamepad2, Trophy, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GameItem {
  id: string;
  title: string;
  description: string;
  players: string;
  status: 'live' | 'coming-soon';
}

const games: GameItem[] = [
  {
    id: 'checkers',
    title: 'Checkers',
    description: 'Classic checkers with TON betting',
    players: '2 Players',
    status: 'coming-soon',
  },
  {
    id: 'chess',
    title: 'Chess',
    description: 'Strategic chess battles for TON',
    players: '2 Players',
    status: 'coming-soon',
  },
  {
    id: 'durak',
    title: 'Durak',
    description: 'Traditional card game with stakes',
    players: '2-6 Players',
    status: 'coming-soon',
  },
];

export const GameTab = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Gamepad2 className="w-6 h-6 text-foreground" />
        <h2 className="text-xl font-bold text-foreground">Games</h2>
      </div>
      
      <p className="text-muted-foreground text-sm">
        Play games and earn TON. Connect your wallet to participate.
      </p>
      
      <div className="flex flex-col gap-3 mt-2">
        {games.map((game) => (
          <Card key={game.id} className="bg-card border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{game.title}</CardTitle>
                <Badge 
                  variant={game.status === 'live' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {game.status === 'live' ? 'Live' : 'Coming Soon'}
                </Badge>
              </div>
              <CardDescription>{game.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{game.players}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4" />
                  <span>TON Rewards</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          More games coming soon! Stay tuned for updates.
        </p>
      </div>
    </div>
  );
};

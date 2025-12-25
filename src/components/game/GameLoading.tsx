import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { GameInfo } from '@/types/game';

interface GameLoadingProps {
  game: GameInfo;
  onComplete: () => void;
}

export const GameLoading = ({ game, onComplete }: GameLoadingProps) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          onComplete();
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="text-6xl mb-4">{game.icon}</div>
        <h1 className="text-3xl font-bold">{game.name}</h1>
        <p className="text-muted-foreground">{game.nameRu}</p>
        
        <div className="w-64 mx-auto space-y-2">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Загрузка...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useEffect, useState } from 'react';
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
    }, 150);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <span className="text-7xl">{game.icon}</span>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            {game.name}
          </h1>
          <p className="text-lg text-muted-foreground">{game.nameRu}</p>
        </div>
        
        <div className="w-80 mx-auto space-y-3">
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div 
              className="h-full bg-foreground transition-all duration-200"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Загрузка данных...
          </p>
        </div>
      </div>
    </div>
  );
};

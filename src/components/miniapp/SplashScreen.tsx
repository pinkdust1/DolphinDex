import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 5;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8">
        {/* Logo */}
        <img
          src={resolvedTheme === 'dark' 
            ? '/src/assets/dolphin-logo-white.png' 
            : '/src/assets/dolphin-logo.png'
          }
          alt="DolphinScan"
          className="w-24 h-24 object-contain"
        />
        
        {/* App Name */}
        <h1 className="text-2xl font-bold text-foreground">DolphinScan</h1>
        
        {/* Progress Bar */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-foreground transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Loading Text */}
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

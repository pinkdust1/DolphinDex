import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { cn } from '@/lib/utils';

type GamePhase = 'idle' | 'reveal_start' | 'hiding' | 'shuffling' | 'picking' | 'revealing' | 'result';

const SHUFFLE_DURATION = 2000;
const SHUFFLE_STEPS = 6;

// SVG Cup component — sticker-like style
const Cup = ({ 
  lifted, 
  hasBall, 
  onClick, 
  disabled, 
  highlight,
  shakeClass,
}: { 
  lifted: boolean; 
  hasBall: boolean; 
  onClick: () => void; 
  disabled: boolean;
  highlight?: 'win' | 'lose' | null;
  shakeClass?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'relative flex flex-col items-center transition-all duration-500 ease-out focus:outline-none',
      !disabled && 'active:scale-95 cursor-pointer',
      disabled && 'cursor-default',
      shakeClass,
    )}
  >
    {/* Cup */}
    <div
      className={cn(
        'transition-all duration-500 ease-out',
        lifted && '-translate-y-12',
      )}
    >
      <svg width="80" height="90" viewBox="0 0 80 90" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cup body */}
        <ellipse cx="40" cy="10" rx="28" ry="8" className="fill-foreground/90" />
        <path
          d="M12 10 C12 10, 16 85, 20 85 L60 85 C64 85, 68 10, 68 10"
          className="fill-foreground/80 stroke-foreground"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Cup rim highlight */}
        <ellipse cx="40" cy="10" rx="24" ry="5" className="fill-foreground/40" />
        {/* Cup bottom */}
        <ellipse cx="40" cy="85" rx="20" ry="5" className="fill-foreground/70" />
        {/* Decorative stripe */}
        <path
          d="M18 35 C18 35, 20 40, 40 40 C60 40, 62 35, 62 35"
          className="stroke-background/30"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Knob on top */}
        <circle cx="40" cy="5" r="5" className="fill-foreground" />
        <circle cx="40" cy="5" r="3" className="fill-foreground/50" />
      </svg>
    </div>

    {/* Ball — only visible when cup is lifted and hasBall */}
    <div
      className={cn(
        'absolute bottom-1 transition-all duration-300',
        lifted && hasBall ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
      )}
    >
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="14" cy="14" r="13" className="fill-foreground" stroke="none" />
        <circle cx="14" cy="14" r="11" className="fill-primary" />
        <ellipse cx="11" cy="10" rx="4" ry="3" className="fill-primary-foreground/40" />
      </svg>
    </div>

    {/* Highlight ring */}
    {highlight && (
      <div className={cn(
        'absolute -inset-2 rounded-2xl border-2 animate-pulse pointer-events-none',
        highlight === 'win' ? 'border-foreground' : 'border-destructive',
      )} />
    )}
  </button>
);

export const ShellGame = () => {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [ballPosition, setBallPosition] = useState(1); // 0, 1, 2
  const [cupOrder, setCupOrder] = useState([0, 1, 2]);
  const [selectedCup, setSelectedCup] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState({ wins: 0, total: 0 });
  const shuffleTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (shuffleTimerRef.current) clearTimeout(shuffleTimerRef.current);
    };
  }, []);

  const startGame = useCallback(() => {
    const newBallPos = Math.floor(Math.random() * 3);
    setBallPosition(newBallPos);
    setCupOrder([0, 1, 2]);
    setSelectedCup(null);
    setWon(false);

    // Phase 1: Show ball
    setPhase('reveal_start');

    // Phase 2: Hide ball
    setTimeout(() => {
      setPhase('hiding');
    }, 1200);

    // Phase 3: Shuffle
    setTimeout(() => {
      setPhase('shuffling');
      
      // Perform shuffles
      let currentOrder = [0, 1, 2];
      let step = 0;
      
      const doShuffle = () => {
        if (step >= SHUFFLE_STEPS) {
          setPhase('picking');
          return;
        }
        // Pick two random different indices to swap
        const i = Math.floor(Math.random() * 3);
        let j = Math.floor(Math.random() * 3);
        while (j === i) j = Math.floor(Math.random() * 3);
        
        const newOrder = [...currentOrder];
        [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
        currentOrder = newOrder;
        setCupOrder([...newOrder]);
        step++;
        
        shuffleTimerRef.current = setTimeout(doShuffle, SHUFFLE_DURATION / SHUFFLE_STEPS);
      };

      doShuffle();
    }, 2000);
  }, []);

  const handlePick = useCallback((visualIndex: number) => {
    if (phase !== 'picking') return;
    
    const actualCup = cupOrder[visualIndex];
    setSelectedCup(visualIndex);
    setPhase('revealing');

    const isWin = actualCup === ballPosition;
    setWon(isWin);

    // Reveal after short delay
    setTimeout(() => {
      setPhase('result');
      setScore(prev => ({
        wins: prev.wins + (isWin ? 1 : 0),
        total: prev.total + 1,
      }));
    }, 600);
  }, [phase, cupOrder, ballPosition]);

  const isLifted = (visualIndex: number) => {
    if (phase === 'reveal_start') {
      // Show all cups lifted to reveal ball position
      return cupOrder[visualIndex] === ballPosition;
    }
    if (phase === 'revealing' || phase === 'result') {
      // Lift all cups to show result
      return true;
    }
    return false;
  };

  const hasBall = (visualIndex: number) => {
    return cupOrder[visualIndex] === ballPosition;
  };

  const getHighlight = (visualIndex: number): 'win' | 'lose' | null => {
    if (phase !== 'result') return null;
    if (visualIndex === selectedCup) {
      return won ? 'win' : 'lose';
    }
    return null;
  };

  const getShakeClass = (visualIndex: number): string => {
    if (phase === 'shuffling') return 'animate-[wiggle_0.3s_ease-in-out_infinite]';
    return '';
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">{t.shellGame}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t.shellGameDesc}</p>
      </div>

      {/* Score */}
      <div className="flex items-center gap-4">
        <div className="bg-secondary rounded-xl px-4 py-2 text-center">
          <p className="text-xs text-muted-foreground">{t.shellWins}</p>
          <p className="text-lg font-bold text-foreground">{score.wins}/{score.total}</p>
        </div>
      </div>

      {/* Cups area */}
      <div className="relative w-full flex items-end justify-center gap-4 min-h-[140px] py-4">
        {/* Shuffle transition wrapper */}
        {[0, 1, 2].map((visualIndex) => (
          <div
            key={visualIndex}
            className={cn(
              'transition-all duration-300 ease-in-out',
              phase === 'shuffling' && 'transition-transform',
            )}
            style={{
              order: visualIndex,
            }}
          >
            <Cup
              lifted={isLifted(visualIndex)}
              hasBall={hasBall(visualIndex)}
              onClick={() => handlePick(visualIndex)}
              disabled={phase !== 'picking'}
              highlight={getHighlight(visualIndex)}
              shakeClass={getShakeClass(visualIndex)}
            />
          </div>
        ))}
      </div>

      {/* Status message */}
      <div className="h-8 flex items-center justify-center">
        {phase === 'idle' && (
          <p className="text-sm text-muted-foreground">{t.shellStart}</p>
        )}
        {phase === 'reveal_start' && (
          <p className="text-sm text-foreground font-medium animate-pulse">{t.shellWatch}</p>
        )}
        {(phase === 'hiding' || phase === 'shuffling') && (
          <p className="text-sm text-foreground font-medium animate-pulse">{t.shellShuffling}</p>
        )}
        {phase === 'picking' && (
          <p className="text-sm text-foreground font-medium">{t.shellPick}</p>
        )}
        {phase === 'result' && (
          <p className={cn(
            'text-base font-bold',
            won ? 'text-foreground' : 'text-destructive',
          )}>
            {won ? t.shellWin : t.shellLose}
          </p>
        )}
      </div>

      {/* Action button */}
      <Button
        onClick={startGame}
        disabled={phase !== 'idle' && phase !== 'result'}
        className="w-full max-w-[240px] h-12 rounded-xl text-[15px] font-bold"
      >
        {phase === 'idle' ? t.shellPlay : phase === 'result' ? t.shellPlayAgain : t.shellPlaying}
      </Button>
    </div>
  );
};

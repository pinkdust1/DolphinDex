import { useTheme } from 'next-themes';
import { ThemeToggle } from '@/components/ThemeToggle';
import dolphinLogoWhite from '@/assets/dolphin-logo-white.png';
import dolphinLogo from '@/assets/dolphin-logo.png';

interface MiniAppHeaderProps {
  title?: string;
}

export const MiniAppHeader = ({ title = 'Dolphin' }: MiniAppHeaderProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border safe-area-top">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <img
            src={resolvedTheme === 'dark' ? dolphinLogoWhite : dolphinLogo}
            alt="Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="text-lg font-semibold text-foreground">{title}</span>
        </div>
        
        <ThemeToggle />
      </div>
    </header>
  );
};

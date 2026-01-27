import { Gamepad2, ShoppingCart, LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export type TabId = 'game' | 'market' | 'profile';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface TabItem {
  id: TabId;
  label: string;
  icon?: LucideIcon;
  isProfile?: boolean;
}

const baseTabs: TabItem[] = [
  { id: 'game', label: 'Game', icon: Gamepad2 },
  { id: 'market', label: 'Market', icon: ShoppingCart },
  { id: 'profile', label: 'Profile', isProfile: true },
];

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      setTelegramUser(tg.initDataUnsafe.user);
    }
  }, []);

  const getDisplayName = () => {
    if (telegramUser?.username) {
      return `@${telegramUser.username}`;
    }
    if (telegramUser?.first_name) {
      return telegramUser.first_name;
    }
    return 'Profile';
  };

  const getInitials = () => {
    if (telegramUser?.first_name) {
      return telegramUser.first_name[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {baseTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors',
                isActive 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.isProfile ? (
                <Avatar className={cn('w-5 h-5', isActive && 'ring-2 ring-foreground')}>
                  <AvatarImage src={telegramUser?.photo_url} alt="Avatar" />
                  <AvatarFallback className="bg-muted text-foreground text-[10px] font-medium">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              ) : (
                Icon && <Icon className={cn('w-5 h-5', isActive && 'scale-110')} />
              )}
              <span className={cn(
                'text-xs font-medium max-w-[80px] truncate',
                isActive && 'font-semibold'
              )}>
                {tab.isProfile ? getDisplayName() : tab.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-12 h-0.5 bg-foreground rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

import { Gamepad2, ShoppingCart, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { useLanguage } from '@/hooks/useLanguage';

export type TabId = 'game' | 'market' | 'profile';

interface TabItem {
  id: TabId;
  labelKey: 'game' | 'market' | 'profile';
  icon?: LucideIcon;
  isProfile?: boolean;
}

const baseTabs: TabItem[] = [
  { id: 'game', labelKey: 'game', icon: Gamepad2 },
  { id: 'market', labelKey: 'market', icon: ShoppingCart },
  { id: 'profile', labelKey: 'profile', isProfile: true },
];

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const { telegramUser, directusUser } = useTelegramUser();
  const { t } = useLanguage();

  const getDisplayName = () => {
    // Prefer Directus data
    if (directusUser?.username) {
      return directusUser.username;
    }
    if (directusUser?.name) {
      return directusUser.name.split(' ')[0]; // First name only for nav
    }
    if (telegramUser?.username) {
      return `@${telegramUser.username}`;
    }
    if (telegramUser?.first_name) {
      return telegramUser.first_name;
    }
    return t.profile;
  };

  const getInitials = () => {
    if (directusUser?.name) {
      return directusUser.name[0].toUpperCase();
    }
    if (telegramUser?.first_name) {
      return telegramUser.first_name[0].toUpperCase();
    }
    return 'U';
  };

  const getPhotoUrl = () => {
    return directusUser?.photo_url || telegramUser?.photo_url || '';
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {baseTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const label = t[tab.labelKey];
          
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
                  <AvatarImage src={getPhotoUrl()} alt="Avatar" />
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
                {tab.isProfile ? getDisplayName() : label}
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

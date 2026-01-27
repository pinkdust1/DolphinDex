import { Gamepad2, ShoppingCart, User, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'game' | 'market' | 'profile';

interface TabItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

const tabs: TabItem[] = [
  { id: 'game', label: 'Game', icon: Gamepad2 },
  { id: 'market', label: 'Market', icon: ShoppingCart },
  { id: 'profile', label: 'Profile', icon: User },
];

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {tabs.map((tab) => {
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
              <Icon className={cn('w-5 h-5', isActive && 'scale-110')} />
              <span className={cn(
                'text-xs font-medium',
                isActive && 'font-semibold'
              )}>
                {tab.label}
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

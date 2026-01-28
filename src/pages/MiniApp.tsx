import { useState, useCallback, useEffect } from 'react';
import { TonConnectProvider } from '@/providers/TonConnectProvider';
import { SplashScreen } from '@/components/miniapp/SplashScreen';
import { MiniAppHeader } from '@/components/miniapp/MiniAppHeader';
import { BottomNav, TabId } from '@/components/miniapp/BottomNav';
import { GameTab } from '@/components/miniapp/tabs/GameTab';
import { MarketTab } from '@/components/miniapp/tabs/MarketTab';
import { ProfileTab } from '@/components/miniapp/tabs/ProfileTab';

const MiniAppContent = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  // Initialize Telegram WebApp and enable fullscreen
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      // Expand to full height
      tg.expand();
      
      // Request fullscreen mode if available
      if (tg.requestFullscreen) {
        tg.requestFullscreen();
      }
      
      // Tell Telegram the app is ready
      tg.ready();
      
      // Log user data for debugging
      console.log('Telegram WebApp initData:', tg.initData);
      console.log('Telegram WebApp initDataUnsafe:', tg.initDataUnsafe);
      console.log('Telegram WebApp user:', tg.initDataUnsafe?.user);
    }
  }, []);

  const handleSplashComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'game':
        return <GameTab />;
      case 'market':
        return <MarketTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <ProfileTab />;
    }
  };

  if (isLoading) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <MiniAppHeader />
      
      {/* Main Content */}
      <main className="pt-14 pb-20 px-4 max-w-lg mx-auto">
        <div className="py-4">
          {renderTabContent()}
        </div>
      </main>
      
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

const MiniApp = () => {
  return (
    <TonConnectProvider>
      <MiniAppContent />
    </TonConnectProvider>
  );
};

export default MiniApp;

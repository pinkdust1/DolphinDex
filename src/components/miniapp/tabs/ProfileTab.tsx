import { Wallet, RefreshCw } from 'lucide-react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { useTelegramUser } from '@/hooks/useTelegramUser';
import { useLanguage } from '@/hooks/useLanguage';
import { LanguageToggle } from '@/components/miniapp/LanguageToggle';

export const ProfileTab = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const { 
    telegramUser, 
    directusUser, 
    isLoading, 
    error, 
    saveWallet, 
    refreshUser 
  } = useTelegramUser();
  const { t } = useLanguage();

  const isConnected = !!wallet;

  // Save wallet to Directus when connected
  useEffect(() => {
    if (wallet?.account?.address && telegramUser) {
      saveWallet(wallet.account.address).then((success) => {
        if (success) {
          console.log('Wallet saved to Directus');
        }
      });
    }
  }, [wallet?.account?.address, telegramUser, saveWallet]);

  const handleConnect = () => {
    tonConnectUI.openModal();
  };

  const handleDisconnect = async () => {
    await tonConnectUI.disconnect();
    toast({
      title: 'Wallet Disconnected',
      description: 'Your TON wallet has been disconnected.',
    });
  };

  const copyAddress = () => {
    if (wallet?.account?.address) {
      navigator.clipboard.writeText(wallet.account.address);
      toast({
        title: 'Copied!',
        description: 'Wallet address copied to clipboard.',
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getDisplayName = () => {
    // Try Telegram data first (most reliable in TMA context)
    const tg = (window as any).Telegram?.WebApp;
    const tgUser = tg?.initDataUnsafe?.user;
    
    if (tgUser?.username) {
      return `@${tgUser.username}`;
    }
    if (tgUser?.first_name) {
      return tgUser.last_name 
        ? `${tgUser.first_name} ${tgUser.last_name}`
        : tgUser.first_name;
    }
    // Fallback to synced data
    if (directusUser?.name) {
      return directusUser.name;
    }
    if (directusUser?.username) {
      return directusUser.username;
    }
    if (telegramUser?.username) {
      return `@${telegramUser.username}`;
    }
    if (telegramUser?.first_name) {
      return telegramUser.last_name 
        ? `${telegramUser.first_name} ${telegramUser.last_name}`
        : telegramUser.first_name;
    }
    return 'User';
  };

  const getInitials = () => {
    if (directusUser?.name) {
      const parts = directusUser.name.split(' ');
      return (parts[0]?.[0] || '') + (parts[1]?.[0] || '');
    }
    if (telegramUser?.first_name) {
      const first = telegramUser.first_name[0] || '';
      const last = telegramUser.last_name?.[0] || '';
      return (first + last).toUpperCase();
    }
    return 'U';
  };

  const getPhotoUrl = () => {
    return directusUser?.photo_url || telegramUser?.photo_url || '';
  };

  const getBalance = () => {
    return directusUser?.balance || '0';
  };

  const getStatus = () => {
    return directusUser?.status || 'active';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={refreshUser}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* User Header */}
      <div className="flex items-center justify-between gap-3 overflow-hidden">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative flex-none w-8 h-8">
            <Avatar className="absolute inset-0 w-8 h-8">
              <AvatarImage src={getPhotoUrl()} alt="User Avatar" className="rounded-full" />
              <AvatarFallback className="bg-muted text-foreground text-xs font-medium">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-[15px] leading-[120%] tracking-[-0.3px] font-bold text-foreground whitespace-nowrap text-ellipsis overflow-hidden">
            {getDisplayName()}
          </div>
        </div>
        <LanguageToggle />
      </div>
      {/* Balance Card */}
      <div className="bg-card rounded-2xl flex justify-between items-center gap-6 px-5 py-4 border border-border">
        <div className="flex flex-col gap-1.5">
          <div className="text-[13px] leading-[20px] font-bold text-muted-foreground tracking-[-0.26px]">
            {t.balance}
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="16" height="16" rx="8" className="fill-foreground"/>
              <path d="M10.7021 4.9248C11.2224 4.92489 11.6522 5.17141 11.8857 5.52246C12.12 5.87474 12.1551 6.33186 11.8877 6.7373L8.55273 11.7939C8.42752 11.9838 8.21079 12.0752 8 12.0752C7.78922 12.0752 7.57253 11.9837 7.44727 11.7939L4.1123 6.7373C3.84467 6.33141 3.88007 5.87461 4.11426 5.52246C4.34791 5.17147 4.77823 4.9248 5.29883 4.9248H10.7021ZM5.29785 5.93848C5.20076 5.93848 5.1287 5.98331 5.0918 6.03906C5.05554 6.09409 5.05107 6.16199 5.09082 6.22266L5.0918 6.22363L6.84375 8.96582L6.8457 8.96777L7.43164 9.95996V5.93848H5.29785ZM8.56738 9.95996L9.15332 8.96875L9.15527 8.9668L10.9062 6.22363L10.9072 6.22266C10.9472 6.16189 10.9426 6.0942 10.9062 6.03906C10.8694 5.98318 10.7974 5.93848 10.7002 5.93848H8.56738V9.95996Z" className="fill-background stroke-background" strokeWidth="0.15"/>
            </svg>
            <div className="text-[16px] leading-normal font-bold text-foreground tracking-[-0.32px]">
              {getBalance()} TON
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4 rounded-xl text-[14px] leading-[20px] tracking-[-0.28px] font-bold"
          >
            {t.topUp}
          </Button>
          <Button 
            variant="secondary"
            size="icon"
            className="bg-secondary hover:bg-secondary/80 text-foreground h-10 w-10 rounded-xl"
            onClick={isConnected ? handleDisconnect : handleConnect}
          >
            <Wallet className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

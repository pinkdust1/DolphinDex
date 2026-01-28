import { Wallet, Copy, LogOut, CheckCircle } from 'lucide-react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export const ProfileTab = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);

  const isConnected = !!wallet;

  useEffect(() => {
    // Get Telegram user data from WebApp
    const tg = (window as any).Telegram?.WebApp;
    
    // Try to get user data
    if (tg?.initDataUnsafe?.user) {
      setTelegramUser(tg.initDataUnsafe.user);
    } else if (tg) {
      // If no user data yet, wait for WebApp to be ready
      const checkUser = () => {
        if (tg.initDataUnsafe?.user) {
          setTelegramUser(tg.initDataUnsafe.user);
        }
      };
      
      // Check immediately and after a short delay
      checkUser();
      const timer = setTimeout(checkUser, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleConnect = () => {
    tonConnectUI.openModal();
  };

  const handleDisconnect = () => {
    tonConnectUI.disconnect();
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
    if (telegramUser?.first_name) {
      const first = telegramUser.first_name[0] || '';
      const last = telegramUser.last_name?.[0] || '';
      return (first + last).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="flex flex-col gap-4">
      {/* User Header */}
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={telegramUser?.photo_url} alt="Avatar" />
          <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-bold text-foreground">{getDisplayName()}</h2>
      </div>
      
      {/* Wallet Card */}
      <Card className="bg-card border-border">
        <CardContent className="pt-4">
          {isConnected && wallet?.account ? (
            <div className="flex flex-col gap-4">
              {/* Wallet Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-foreground" />
                  <span className="text-base font-medium text-foreground">TON Wallet</span>
                </div>
                <div className="flex items-center gap-1 text-green-500">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Connected</span>
                </div>
              </div>

              {/* Wallet Address */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Address</p>
                  <p className="text-sm font-mono text-foreground">
                    {formatAddress(wallet.account.address)}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={copyAddress}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Wallet Info */}
              {wallet.device && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Wallet App</p>
                  <p className="text-sm text-foreground">{wallet.device.appName}</p>
                </div>
              )}
              
              {/* Disconnect Button */}
              <Button 
                variant="destructive" 
                onClick={handleDisconnect}
                className="w-full mt-2"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Disconnect Wallet
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-foreground" />
                <span className="text-base font-medium text-foreground">TON Wallet</span>
              </div>
              <Button 
                onClick={handleConnect}
                size="sm"
              >
                Connect TON Wallet
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

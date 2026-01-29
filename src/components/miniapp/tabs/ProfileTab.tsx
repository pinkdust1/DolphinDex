import { Wallet, Copy, LogOut, CheckCircle, RefreshCw, Coins } from 'lucide-react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { useTelegramUser } from '@/hooks/useTelegramUser';

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
    // Prefer Directus data, fallback to Telegram data
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
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="pt-4">
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* User Header */}
      <div className="flex items-center gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={getPhotoUrl()} alt="Avatar" />
          <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-xl font-bold text-foreground">{getDisplayName()}</h2>
          {directusUser?.username && (
            <p className="text-sm text-muted-foreground">{directusUser.username}</p>
          )}
        </div>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Balance</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              getStatus() === 'active' 
                ? 'bg-green-500/20 text-green-500' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {getStatus()}
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{getBalance()} TON</p>
        </CardContent>
      </Card>
      
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

              {/* Saved to Directus indicator */}
              {directusUser?.tg_wallet && (
                <div className="flex items-center gap-2 text-xs text-green-500">
                  <CheckCircle className="w-3 h-3" />
                  <span>Wallet saved to profile</span>
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

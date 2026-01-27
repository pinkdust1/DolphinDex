import { User, Wallet, Copy, LogOut, CheckCircle, XCircle } from 'lucide-react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

export const ProfileTab = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const isConnected = !!wallet;

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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <User className="w-6 h-6 text-foreground" />
        <h2 className="text-xl font-bold text-foreground">Profile</h2>
      </div>
      
      {/* Wallet Status Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              TON Wallet
            </CardTitle>
            {isConnected ? (
              <div className="flex items-center gap-1 text-green-500">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-muted-foreground">
                <XCircle className="w-4 h-4" />
                <span className="text-sm">Not Connected</span>
              </div>
            )}
          </div>
          <CardDescription>
            {isConnected 
              ? 'Your wallet is connected and ready to use.' 
              : 'Connect your TON wallet to play games and earn rewards.'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isConnected && wallet?.account ? (
            <div className="flex flex-col gap-4">
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
            <Button 
              onClick={handleConnect}
              className="w-full"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect TON Wallet
            </Button>
          )}
        </CardContent>
      </Card>
      
      {/* Stats Card - Placeholder */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Statistics</CardTitle>
          <CardDescription>Your gaming stats and history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Games Played</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Wins</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">TON Earned</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">NFTs Owned</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import xamanWalletIcon from "@/assets/xaman-wallet.png";
import { fetchAddressData } from "@/utils/xrpl";

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WalletConnectDialog = ({ open, onOpenChange }: WalletConnectDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [payloadUuid, setPayloadUuid] = useState<string | null>(null);
  const [deepLink, setDeepLink] = useState<string | null>(null);

  // Format balance with comma separator
  const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    return num.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' xrp';
  };

  // Save wallet address and balance to Directus user_wallet collection
  const saveWalletToDirectus = async (account: string) => {
    try {
      console.log('Fetching balance for wallet:', account);
      
      // Fetch the current balance from XRPL
      const addressData = await fetchAddressData(account);
      const formattedBalance = formatBalance(addressData.balance);
      
      console.log('Saving wallet to Directus:', { adress: account, balance: formattedBalance });
      
      // Save to Directus via the proxy
      const { data, error } = await supabase.functions.invoke('lobby-proxy', {
        body: { 
          action: 'save_wallet',
          adress: account,
          balance: formattedBalance
        }
      });

      if (error) {
        console.error('Failed to save wallet to Directus:', error);
      } else if (data?.success) {
        console.log(`Wallet ${data.action} in Directus successfully`);
      } else {
        console.error('Failed to save wallet:', data?.error);
      }
    } catch (error) {
      console.error('Error saving wallet to Directus:', error);
    }
  };

  const sendWalletDataToDirectus = async (account: string, xamanData: any) => {
    try {
      const walletData = {
        data: {
          account,
          connectedAt: new Date().toISOString(),
          xamanPayload: xamanData,
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      };

      const response = await fetch('https://admin.asapcase.shop/Items/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(walletData),
      });

      if (!response.ok) {
        console.error('Failed to send wallet data to Directus:', response.status);
      } else {
        console.log('Wallet data sent to Directus successfully');
      }
    } catch (error) {
      console.error('Error sending wallet data to Directus:', error);
    }
  };

  useEffect(() => {
    if (!payloadUuid || !open) return;

    const checkStatus = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('xaman-auth', {
          body: { action: 'check', uuid: payloadUuid }
        });

        if (error) throw error;

        if (data.signed && data.account) {
          clearInterval(checkStatus);
          
          // Send all wallet data to Directus (legacy collection)
          await sendWalletDataToDirectus(data.account, data.xamanData);
          
          // Save wallet address and balance to user_wallet collection
          await saveWalletToDirectus(data.account);
          
          toast({
            title: "Wallet Connected!",
            description: `Connected to ${data.account}`,
          });
          localStorage.setItem('xaman_account', data.account);
          // Trigger storage event for same-tab updates
          window.dispatchEvent(new Event('storage'));
          onOpenChange(false);
          resetState();
        }
      } catch (error) {
        console.error('Error checking payload:', error);
      }
    }, 2000);

    return () => clearInterval(checkStatus);
  }, [payloadUuid, open, onOpenChange]);

  const resetState = () => {
    setQrUrl(null);
    setPayloadUuid(null);
    setDeepLink(null);
    setLoading(false);
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('xaman-auth', {
        body: { action: 'create' }
      });

      if (error) throw error;

      setQrUrl(data.qrUrl);
      setPayloadUuid(data.uuid);
      setDeepLink(data.deepLink);
      
      toast({
        title: "Scan QR Code",
        description: "Open XAMAN app and scan the QR code",
      });
    } catch (error) {
      console.error('Error creating payload:', error);
      toast({
        title: "Connection Error",
        description: "Failed to create wallet connection request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Connect Wallet</DialogTitle>
          <DialogDescription className="text-center">
            {qrUrl ? "Scan QR code with XAMAN app" : "Choose your wallet to connect"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 py-4">
          {!qrUrl ? (
            <Button
              onClick={handleConnect}
              variant="outline"
              className="h-14 justify-start gap-4 hover:bg-accent/50 transition-all"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <img 
                  src={xamanWalletIcon} 
                  alt="XAMAN Wallet" 
                  className="w-8 h-8 object-contain"
                />
              )}
              <span className="text-base font-medium">
                {loading ? "Connecting..." : "XAMAN Wallet"}
              </span>
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <img 
                src={qrUrl} 
                alt="QR Code" 
                className="w-64 h-64 rounded-lg border-2 border-border"
              />
              <Button
                onClick={() => window.open(deepLink || '#', '_blank')}
                className="w-full sm:w-auto"
                size="lg"
              >
                Open XAMAN Wallet
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Waiting for confirmation...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

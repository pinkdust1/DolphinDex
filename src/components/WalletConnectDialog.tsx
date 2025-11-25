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

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WalletConnectDialog = ({ open, onOpenChange }: WalletConnectDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [payloadUuid, setPayloadUuid] = useState<string | null>(null);
  const [deepLink, setDeepLink] = useState<string | null>(null);

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
          toast({
            title: "Wallet Connected!",
            description: `Connected to ${data.account}`,
          });
          localStorage.setItem('xaman_account', data.account);
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
              <a 
                href={deepLink || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Open in XAMAN app
              </a>
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

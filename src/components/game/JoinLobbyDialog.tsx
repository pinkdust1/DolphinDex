import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lobby } from '@/types/game';
import { lobbyService } from '@/services/lobbyService';
import { Loader2, Coins, QrCode, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

interface JoinLobbyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lobby: Lobby;
  onJoinSuccess: () => void;
}

export const JoinLobbyDialog = ({ open, onOpenChange, lobby, onJoinSuccess }: JoinLobbyDialogProps) => {
  const [isJoining, setIsJoining] = useState(false);
  const [paymentData, setPaymentData] = useState<{ qrUrl: string; deepLink: string; transactionId: string } | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  // Poll for payment confirmation
  useEffect(() => {
    if (!paymentData) return;

    const interval = setInterval(async () => {
      try {
        setIsCheckingPayment(true);
        const result = await lobbyService.checkPayment(paymentData.transactionId);
        
        if (result.confirmed) {
          clearInterval(interval);
          onJoinSuccess();
        } else if (result.status === 'expired' || result.status === 'failed') {
          clearInterval(interval);
          toast.error('Payment failed or expired');
          setPaymentData(null);
        }
      } catch (error) {
        console.error('Error checking payment:', error);
      } finally {
        setIsCheckingPayment(false);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [paymentData, onJoinSuccess]);

  const handleJoin = async () => {
    const walletAddress = localStorage.getItem('xaman_account');
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsJoining(true);
      const response = await lobbyService.joinLobby(lobby.id, walletAddress);
      
      if (response.success) {
        if (response.requiresPayment && response.payment) {
          setPaymentData({
            qrUrl: response.payment.qrUrl,
            deepLink: response.payment.deepLink,
            transactionId: response.payment.transactionId,
          });
          toast.info('Sign the transaction in Xaman');
        } else {
          onJoinSuccess();
        }
      } else {
        toast.error(response.error || 'Failed to join lobby');
      }
    } catch (error) {
      toast.error('Failed to join lobby');
    } finally {
      setIsJoining(false);
    }
  };

  const creatorName = lobby.creator?.display_name || 'Unknown';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Lobby</DialogTitle>
          <DialogDescription>
            {paymentData ? 'Sign the transaction to place your bet' : `Join ${creatorName}'s game`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {paymentData ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img src={paymentData.qrUrl} alt="Payment QR" className="w-48 h-48 rounded-lg" />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Scan with Xaman app or click below
              </p>
              <Button asChild className="w-full">
                <a href={paymentData.deepLink} target="_blank" rel="noopener noreferrer">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Open Xaman App
                </a>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                {isCheckingPayment ? 'Checking payment status...' : 'Waiting for signature...'}
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Lobby Code</span>
                  <span className="font-mono font-medium">{lobby.lobby_code}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Creator</span>
                  <span className="font-medium">{creatorName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Bet Amount</span>
                  <div className="flex items-center gap-1 font-medium">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span>{lobby.bet_amount} XRP</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleJoin} disabled={isJoining} className="w-full">
                {isJoining ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  `Join & Bet ${lobby.bet_amount} XRP`
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

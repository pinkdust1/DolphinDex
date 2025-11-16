import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import xamanWalletIcon from "@/assets/xaman-wallet.png";

interface WalletConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WalletConnectDialog = ({ open, onOpenChange }: WalletConnectDialogProps) => {
  const handleConnect = () => {
    // Handle wallet connection logic here
    console.log("Connecting to XAMAN Wallet...");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">Connect Wallet</DialogTitle>
          <DialogDescription className="text-center">
            Choose your wallet to connect
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 py-4">
          <Button
            onClick={handleConnect}
            variant="outline"
            className="h-14 justify-start gap-4 hover:bg-accent/50 transition-all"
          >
            <img 
              src={xamanWalletIcon} 
              alt="XAMAN Wallet" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-base font-medium">XAMAN Wallet</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

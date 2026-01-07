import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { GameInfo, Lobby } from '@/types/game';
import { lobbyService } from '@/services/lobbyService';
import { Loader2, Coins } from 'lucide-react';
import { toast } from 'sonner';

interface CreateLobbyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game: GameInfo;
  onLobbyCreated: (lobby: Lobby) => void;
}

export const CreateLobbyDialog = ({ open, onOpenChange, game, onLobbyCreated }: CreateLobbyDialogProps) => {
  const [betAmount, setBetAmount] = useState(10);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    const walletAddress = localStorage.getItem('xaman_account');
    if (!walletAddress) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsCreating(true);
      const response = await lobbyService.createLobby(game.id, walletAddress, betAmount);
      
      if (response.success && response.lobby) {
        onLobbyCreated(response.lobby);
      } else {
        toast.error(response.error || 'Failed to create lobby');
      }
    } catch (error) {
      toast.error('Failed to create lobby');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{game.icon}</span>
            Create Lobby
          </DialogTitle>
          <DialogDescription>
            Set your bet amount and wait for an opponent
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Bet Amount</Label>
              <div className="flex items-center gap-1 text-lg font-semibold">
                <Coins className="h-5 w-5 text-yellow-500" />
                <span>{betAmount} XRP</span>
              </div>
            </div>
            
            <Slider
              value={[betAmount]}
              onValueChange={(value) => setBetAmount(value[0])}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 XRP (Free)</span>
              <span>100 XRP (Max)</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Game</span>
              <span className="font-medium">{game.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Max Players</span>
              <span className="font-medium">{game.maxPlayers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Your Bet</span>
              <span className="font-medium">{betAmount} XRP</span>
            </div>
          </div>

          <Button onClick={handleCreate} disabled={isCreating} className="w-full">
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Lobby'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Player } from "@/hooks/useCheckers";
import { Trophy, Handshake } from "lucide-react";

interface GameOverDialogProps {
  open: boolean;
  winner: Player | "draw" | null;
  onPlayAgain: () => void;
  onClose: () => void;
}

export const GameOverDialog = ({ open, winner, onPlayAgain, onClose }: GameOverDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2">
            {winner === "draw" ? (
              <>
                <Handshake className="h-8 w-8 text-muted-foreground" />
                Draw!
              </>
            ) : (
              <>
                <Trophy className="h-8 w-8 text-amber-500" />
                {winner === "white" ? "White" : "Black"} Wins!
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-center">
            {winner === "draw"
              ? "The game ended in a draw. Neither player could make a move."
              : `Congratulations! ${winner === "white" ? "White" : "Black"} player has won the game.`}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-2 mt-4">
          <Button onClick={onPlayAgain} className="w-full">
            Play Again
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChessPlayer } from "@/hooks/useChess";
import { Trophy, Crown, Swords } from "lucide-react";

interface ChessGameOverDialogProps {
  open: boolean;
  winner: ChessPlayer | "draw" | null;
  isCheckmate: boolean;
  onPlayAgain: () => void;
  onClose: () => void;
}

export const ChessGameOverDialog = ({
  open,
  winner,
  isCheckmate,
  onPlayAgain,
  onClose,
}: ChessGameOverDialogProps) => {
  const getTitle = () => {
    if (winner === "draw") return "Draw!";
    if (isCheckmate) return "Checkmate!";
    return "Game Over!";
  };

  const getDescription = () => {
    if (winner === "draw") return "The game ended in a draw.";
    if (winner === "white") return isCheckmate ? "White wins by checkmate!" : "White wins!";
    if (winner === "black") return isCheckmate ? "Black wins by checkmate!" : "Black wins!";
    return "The game has ended.";
  };

  const getIcon = () => {
    if (winner === "draw") return <Swords className="h-16 w-16 text-muted-foreground" />;
    return isCheckmate 
      ? <Crown className="h-16 w-16 text-yellow-500" />
      : <Trophy className="h-16 w-16 text-yellow-500" />;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <DialogTitle className="text-2xl text-center">{getTitle()}</DialogTitle>
          <DialogDescription className="text-center text-lg">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2 sm:justify-center">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onPlayAgain}>
            Play Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

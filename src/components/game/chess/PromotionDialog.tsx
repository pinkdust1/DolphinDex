import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChessPieceType, ChessPlayer } from "@/hooks/useChess";

interface PromotionDialogProps {
  open: boolean;
  player: ChessPlayer;
  onSelect: (piece: ChessPieceType) => void;
  onClose: () => void;
}

const pieceSymbols = {
  white: { Q: "♕", R: "♖", B: "♗", N: "♘" },
  black: { q: "♛", r: "♜", b: "♝", n: "♞" },
};

export const PromotionDialog = ({
  open,
  player,
  onSelect,
  onClose,
}: PromotionDialogProps) => {
  const pieces = player === "white" 
    ? (["Q", "R", "B", "N"] as ChessPieceType[])
    : (["q", "r", "b", "n"] as ChessPieceType[]);

  const symbols = player === "white" ? pieceSymbols.white : pieceSymbols.black;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-center">Promote Pawn</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-2 py-4">
          {pieces.map((piece) => (
            <Button
              key={piece}
              variant="outline"
              className="h-16 text-4xl hover:bg-primary/20"
              onClick={() => onSelect(piece)}
            >
              <span className={player === "white" ? "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" : "text-gray-900"}>
                {symbols[piece as keyof typeof symbols]}
              </span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

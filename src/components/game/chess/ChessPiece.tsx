import { ChessPieceType, ChessPlayer } from "@/hooks/useChess";
import { cn } from "@/lib/utils";

interface ChessPieceProps {
  piece: ChessPieceType;
  isSelected: boolean;
}

// White pieces use outlined symbols, black pieces use filled symbols
const pieceSymbols: Record<string, string> = {
  // White pieces (uppercase) - outlined symbols
  K: "♔",
  Q: "♕",
  R: "♖",
  B: "♗",
  N: "♘",
  P: "♙",
  // Black pieces (lowercase) - filled symbols
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};

export const ChessPiece = ({ piece, isSelected }: ChessPieceProps) => {
  if (!piece) return null;

  // Check if piece is white (uppercase letters)
  const isWhite = piece === piece.toUpperCase() && piece !== piece.toLowerCase();
  const symbol = pieceSymbols[piece] || "";

  return (
    <div
      className={cn(
        "w-[85%] h-[85%] flex items-center justify-center",
        "text-4xl sm:text-5xl select-none transition-all duration-200",
        isWhite 
          ? "text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]" 
          : "text-gray-900 drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]",
        isSelected && "scale-110 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"
      )}
    >
      {symbol}
    </div>
  );
};

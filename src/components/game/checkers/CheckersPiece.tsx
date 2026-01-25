import { cn } from "@/lib/utils";
import { PieceType } from "@/hooks/useCheckers";
import { Crown } from "lucide-react";

interface CheckersPieceProps {
  piece: PieceType;
  isSelected?: boolean;
}

export const CheckersPiece = ({ piece, isSelected }: CheckersPieceProps) => {
  if (!piece) return null;

  const isWhite = piece === "white" || piece === "whiteKing";
  const isKing = piece === "whiteKing" || piece === "blackKing";

  return (
    <div
      className={cn(
        "w-[85%] h-[85%] rounded-full flex items-center justify-center",
        "transition-all duration-200 ease-out",
        "shadow-lg",
        isWhite
          ? "bg-gradient-to-br from-gray-100 to-gray-300 border-2 border-gray-400"
          : "bg-gradient-to-br from-gray-700 to-gray-900 border-2 border-gray-600",
        isSelected && "ring-4 ring-primary ring-offset-2 ring-offset-background scale-110",
        "cursor-pointer hover:scale-105"
      )}
    >
      {isKing && (
        <Crown
          className={cn(
            "w-5 h-5 sm:w-6 sm:h-6",
            isWhite ? "text-amber-500" : "text-amber-400"
          )}
          fill="currentColor"
        />
      )}
    </div>
  );
};

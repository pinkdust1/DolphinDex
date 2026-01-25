import { cn } from "@/lib/utils";
import { GameState, Position, Move } from "@/hooks/useCheckers";
import { CheckersPiece } from "./CheckersPiece";

interface CheckersBoardProps {
  gameState: GameState;
  onCellClick: (row: number, col: number) => void;
  flipped?: boolean;
}

export const CheckersBoard = ({ gameState, onCellClick, flipped = false }: CheckersBoardProps) => {
  const { board, selectedPiece, validMoves } = gameState;

  const isSelected = (row: number, col: number): boolean => {
    return selectedPiece?.row === row && selectedPiece?.col === col;
  };

  const isValidMoveTarget = (row: number, col: number): Move | undefined => {
    return validMoves.find(m => m.to.row === row && m.to.col === col);
  };

  const isCaptureTarget = (row: number, col: number): boolean => {
    return validMoves.some(m => m.captured?.row === row && m.captured?.col === col);
  };

  // Get rows and cols based on flip state
  const rows = flipped ? [...Array(8).keys()].reverse() : [...Array(8).keys()];
  const cols = flipped ? [...Array(8).keys()].reverse() : [...Array(8).keys()];

  return (
    <div className="aspect-square w-full max-w-[min(90vw,500px)] mx-auto">
      <div className="grid grid-cols-8 gap-0 rounded-lg overflow-hidden shadow-2xl border-4 border-border">
        {rows.map((row) =>
          cols.map((col) => {
            const isDark = (row + col) % 2 === 1;
            const piece = board[row][col];
            const selected = isSelected(row, col);
            const validMove = isValidMoveTarget(row, col);
            const captureTarget = isCaptureTarget(row, col);

            return (
              <div
                key={`${row}-${col}`}
                className={cn(
                  "aspect-square flex items-center justify-center relative",
                  "transition-colors duration-150",
                  isDark
                    ? "bg-amber-800 dark:bg-amber-900"
                    : "bg-amber-100 dark:bg-amber-200",
                  validMove && "cursor-pointer",
                  validMove && !validMove.isCapture && "after:absolute after:inset-[30%] after:rounded-full after:bg-primary/50",
                  validMove?.isCapture && "after:absolute after:inset-[15%] after:rounded-full after:border-4 after:border-primary after:animate-pulse"
                )}
                onClick={() => onCellClick(row, col)}
              >
                {/* Capture indicator on piece being captured */}
                {captureTarget && (
                  <div className="absolute inset-0 bg-red-500/30 animate-pulse" />
                )}

                {piece && (
                  <CheckersPiece piece={piece} isSelected={selected} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

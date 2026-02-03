import { cn } from "@/lib/utils";
import { ChessGameState, ChessMove } from "@/hooks/useChess";
import { ChessPiece } from "./ChessPiece";

interface ChessBoardProps {
  gameState: ChessGameState;
  onCellClick: (row: number, col: number) => void;
  flipped?: boolean;
}

export const ChessBoard = ({ gameState, onCellClick, flipped = false }: ChessBoardProps) => {
  const { board, selectedPiece, validMoves, isCheck, currentPlayer } = gameState;

  const isSelected = (row: number, col: number): boolean => {
    return selectedPiece?.row === row && selectedPiece?.col === col;
  };

  const isValidMoveTarget = (row: number, col: number): ChessMove | undefined => {
    return validMoves.find(m => m.to.row === row && m.to.col === col);
  };

  const isKingInCheck = (row: number, col: number): boolean => {
    if (!isCheck) return false;
    const piece = board[row][col];
    if (!piece) return false;
    const pieceType = piece.toLowerCase();
    const isWhite = piece === piece.toUpperCase();
    return pieceType === "k" && 
      ((currentPlayer === "white" && isWhite) || (currentPlayer === "black" && !isWhite));
  };

  const isLastMove = (row: number, col: number): boolean => {
    if (gameState.moveHistory.length === 0) return false;
    const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];
    return (lastMove.from.row === row && lastMove.from.col === col) ||
           (lastMove.to.row === row && lastMove.to.col === col);
  };

  // Get rows and cols based on flip state
  // When not flipped (white's view): row 0 at top, row 7 at bottom (white pieces closest to player)
  // When flipped (black's view): row 7 at top, row 0 at bottom (black pieces closest to player)
  const rows = flipped ? [...Array(8).keys()].reverse() : [...Array(8).keys()];
  const cols = flipped ? [...Array(8).keys()].reverse() : [...Array(8).keys()];

  // File and rank labels
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

  return (
    <div className="aspect-square w-full max-w-[min(90vw,500px)] mx-auto">
      {/* Board with coordinates */}
      <div className="relative">
        {/* Rank labels (left side) */}
        <div className="absolute -left-6 top-0 h-full flex flex-col">
          {rows.map((row) => (
            <div 
              key={`rank-${row}`} 
              className="flex-1 flex items-center justify-center text-xs text-muted-foreground font-medium"
            >
              {ranks[row]}
            </div>
          ))}
        </div>

        {/* File labels (bottom) */}
        <div className="absolute -bottom-5 left-0 w-full flex">
          {cols.map((col) => (
            <div 
              key={`file-${col}`} 
              className="flex-1 flex items-center justify-center text-xs text-muted-foreground font-medium"
            >
              {flipped ? files[7 - col] : files[col]}
            </div>
          ))}
        </div>

        {/* Chess board */}
        <div className="grid grid-cols-8 gap-0 rounded-lg overflow-hidden shadow-2xl border-4 border-border">
          {rows.map((row) =>
            cols.map((col) => {
              const isDark = (row + col) % 2 === 1;
              const piece = board[row][col];
              const selected = isSelected(row, col);
              const validMove = isValidMoveTarget(row, col);
              const kingCheck = isKingInCheck(row, col);
              const lastMove = isLastMove(row, col);

              return (
                <div
                  key={`${row}-${col}`}
                  className={cn(
                    "aspect-square flex items-center justify-center relative cursor-pointer",
                    "transition-colors duration-150",
                    isDark
                      ? "bg-amber-800 dark:bg-amber-900"
                      : "bg-amber-100 dark:bg-amber-200",
                    selected && "ring-4 ring-inset ring-primary",
                    lastMove && "bg-yellow-400/50 dark:bg-yellow-500/40",
                    kingCheck && "bg-red-500/60 dark:bg-red-600/60"
                  )}
                  onClick={() => onCellClick(row, col)}
                >
                  {/* Valid move indicator */}
                  {validMove && !piece && (
                    <div className="absolute inset-[35%] rounded-full bg-black/20 dark:bg-white/20" />
                  )}

                  {/* Capture indicator */}
                  {validMove && piece && (
                    <div className="absolute inset-1 rounded-full border-4 border-black/30 dark:border-white/30" />
                  )}

                  {piece && (
                    <ChessPiece piece={piece} isSelected={selected} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

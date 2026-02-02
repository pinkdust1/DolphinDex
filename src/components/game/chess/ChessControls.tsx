import { Button } from "@/components/ui/button";
import { ChessGameState, ChessPlayer } from "@/hooks/useChess";
import { Flag, RotateCcw, Crown } from "lucide-react";

interface ChessControlsProps {
  gameState: ChessGameState;
  onReset: () => void;
  onSurrender: () => void;
  playerColor: ChessPlayer;
}

export const ChessControls = ({
  gameState,
  onReset,
  onSurrender,
  playerColor,
}: ChessControlsProps) => {
  const { capturedWhite, capturedBlack, isCheck, isCheckmate, gameOver } = gameState;

  // Calculate material value
  const pieceValues: Record<string, number> = {
    p: 1, P: 1,
    n: 3, N: 3,
    b: 3, B: 3,
    r: 5, R: 5,
    q: 9, Q: 9,
  };

  const whiteCapturedValue = capturedBlack.reduce((sum, p) => sum + (pieceValues[p || ""] || 0), 0);
  const blackCapturedValue = capturedWhite.reduce((sum, p) => sum + (pieceValues[p || ""] || 0), 0);
  const materialAdvantage = whiteCapturedValue - blackCapturedValue;

  return (
    <div className="space-y-4">
      {/* Game status */}
      {isCheck && !isCheckmate && (
        <div className="text-center py-2 px-4 rounded-lg bg-red-500/20 text-red-600 dark:text-red-400 font-semibold animate-pulse">
          ⚠️ Check!
        </div>
      )}

      {/* Captured pieces */}
      <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">White captured:</span>
          <div className="flex flex-wrap gap-0.5 text-xl">
            {capturedBlack.length > 0 ? (
              capturedBlack.map((piece, i) => (
                <span key={i} className="text-gray-800">
                  {piece === "p" ? "♟" : piece === "n" ? "♞" : piece === "b" ? "♝" : piece === "r" ? "♜" : piece === "q" ? "♛" : ""}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">—</span>
            )}
          </div>
          {materialAdvantage > 0 && (
            <span className="text-xs text-green-600">+{materialAdvantage}</span>
          )}
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-muted-foreground">Black captured:</span>
          <div className="flex flex-wrap gap-0.5 text-xl justify-end">
            {capturedWhite.length > 0 ? (
              capturedWhite.map((piece, i) => (
                <span key={i} className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                  {piece === "P" ? "♙" : piece === "N" ? "♘" : piece === "B" ? "♗" : piece === "R" ? "♖" : piece === "Q" ? "♕" : ""}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">—</span>
            )}
          </div>
          {materialAdvantage < 0 && (
            <span className="text-xs text-green-600">+{Math.abs(materialAdvantage)}</span>
          )}
        </div>
      </div>

      {/* Move count */}
      <div className="text-center text-sm text-muted-foreground">
        Move {gameState.fullMoveNumber} • {gameState.moveHistory.length} half-moves
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        {!gameOver && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onSurrender}
            className="gap-2"
          >
            <Flag className="h-4 w-4" />
            Surrender
          </Button>
        )}

        {gameOver && (
          <Button
            variant="default"
            size="sm"
            onClick={onReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            New Game
          </Button>
        )}
      </div>
    </div>
  );
};

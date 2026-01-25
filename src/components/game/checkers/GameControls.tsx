import { Button } from "@/components/ui/button";
import { GameState, Player } from "@/hooks/useCheckers";
import { RotateCcw, Flag, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameControlsProps {
  gameState: GameState;
  onReset: () => void;
  onSurrender: () => void;
  playerColor?: Player;
}

export const GameControls = ({ gameState, onReset, onSurrender, playerColor = "white" }: GameControlsProps) => {
  const { currentPlayer, capturedWhite, capturedBlack, gameOver, winner } = gameState;

  return (
    <div className="w-full space-y-4">
      {/* Turn indicator */}
      <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center",
              currentPlayer === "white"
                ? "bg-gray-100 border-gray-400"
                : "bg-gray-800 border-gray-600"
            )}
          />
          <span className="font-medium">
            {gameOver
              ? winner === "draw"
                ? "Draw!"
                : `${winner === "white" ? "White" : "Black"} wins!`
              : `${currentPlayer === "white" ? "White" : "Black"}'s turn`}
          </span>
        </div>
      </div>

      {/* Score */}
      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-100 border border-gray-400" />
          <span className="text-sm text-muted-foreground">
            Captured: <span className="font-bold text-foreground">{capturedBlack}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Captured: <span className="font-bold text-foreground">{capturedWhite}</span>
          </span>
          <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-600" />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          onClick={onReset}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          {gameOver ? "New Game" : "Restart"}
        </Button>
        
        {!gameOver && (
          <Button
            variant="destructive"
            onClick={onSurrender}
            className="gap-2"
          >
            <Flag className="h-4 w-4" />
            Surrender
          </Button>
        )}
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CheckersBoard } from "@/components/game/checkers/CheckersBoard";
import { GameControls } from "@/components/game/checkers/GameControls";
import { GameOverDialog } from "@/components/game/checkers/GameOverDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Coins, Loader2 } from "lucide-react";
import { useMultiplayerCheckers } from "@/hooks/useMultiplayerCheckers";
import { formatWalletAddress } from "@/services/lobbyApi";

const gameNames: Record<string, string> = {
  chess: "Chess",
  checkers: "Checkers",
  durak: "Durak",
};

const GamePlay = () => {
  const { gameId, lobbyId } = useParams<{ gameId: string; lobbyId: string }>();
  const navigate = useNavigate();
  
  // Get connected wallet from localStorage
  const [playerWallet] = useState(() => localStorage.getItem("xaman_account") || "");
  
  const {
    gameState,
    playerColor,
    isLoading,
    isMyTurn,
    lobbyData,
    handleCellClick,
    resetGame,
    surrender,
  } = useMultiplayerCheckers({
    lobbyId: lobbyId || "",
    playerWallet,
  });
  
  const [showGameOver, setShowGameOver] = useState(false);

  const gameName = gameId ? gameNames[gameId] || gameId : "Game";

  // Show game over dialog when game ends
  useEffect(() => {
    if (gameState.gameOver) {
      setShowGameOver(true);
    }
  }, [gameState.gameOver]);

  const handlePlayAgain = () => {
    resetGame();
    setShowGameOver(false);
  };

  // Only show checkers for now
  if (gameId !== "checkers") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <h1 className="text-2xl font-bold">{gameName}</h1>
              <p className="text-muted-foreground">Coming soon...</p>
              <Button onClick={() => navigate(`/game/${gameId}`)}>
                Back to Lobbies
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Loading game...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(`/game/${gameId}`)}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{gameName}</h1>
                <p className="text-sm text-muted-foreground">Lobby #{lobbyId}</p>
              </div>
              {playerColor && (
                <Badge variant={isMyTurn ? "default" : "secondary"}>
                  {isMyTurn ? "Your turn" : "Opponent's turn"}
                </Badge>
              )}
            </div>

            {/* Players info */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gray-100 border-2 flex items-center justify-center ${playerColor === "white" ? "border-primary ring-2 ring-primary/20" : "border-gray-400"}`}>
                    <Users className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">White {playerColor === "white" && "(You)"}</p>
                    <code className="text-sm">{formatWalletAddress(lobbyData?.creator_wallet || null)}</code>
                  </div>
                </div>
                <span className="text-muted-foreground font-bold">VS</span>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground text-right">Black {playerColor === "black" && "(You)"}</p>
                    <code className="text-sm">{formatWalletAddress(lobbyData?.opponent_wallet || null)}</code>
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-gray-800 border-2 flex items-center justify-center ${playerColor === "black" ? "border-primary ring-2 ring-primary/20" : "border-gray-600"}`}>
                    <Users className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Turn indicator */}
            {!gameState.gameOver && (
              <div className={`text-center py-2 px-4 rounded-lg ${isMyTurn ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {isMyTurn ? "🎯 Your turn - make your move!" : "⏳ Waiting for opponent's move..."}
              </div>
            )}

            {/* Game board */}
            <CheckersBoard
              gameState={gameState}
              onCellClick={handleCellClick}
              flipped={playerColor === "black"}
            />

            {/* Controls */}
            <GameControls
              gameState={gameState}
              onReset={resetGame}
              onSurrender={surrender}
              playerColor={playerColor || "white"}
            />
          </div>
        </div>
      </main>

      {/* Game over dialog */}
      <GameOverDialog
        open={showGameOver}
        winner={gameState.winner}
        onPlayAgain={handlePlayAgain}
        onClose={() => setShowGameOver(false)}
      />
    </div>
  );
};

export default GamePlay;

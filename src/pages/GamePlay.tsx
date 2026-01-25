import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CheckersBoard } from "@/components/game/checkers/CheckersBoard";
import { GameControls } from "@/components/game/checkers/GameControls";
import { GameOverDialog } from "@/components/game/checkers/GameOverDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Coins } from "lucide-react";
import { useCheckers, Player } from "@/hooks/useCheckers";
import { formatWalletAddress } from "@/services/lobbyApi";

const gameNames: Record<string, string> = {
  chess: "Chess",
  checkers: "Checkers",
  durak: "Durak",
};

const GamePlay = () => {
  const { gameId, lobbyId } = useParams<{ gameId: string; lobbyId: string }>();
  const navigate = useNavigate();
  const { gameState, handleCellClick, resetGame, surrender } = useCheckers();
  
  const [showGameOver, setShowGameOver] = useState(false);
  const [playerColor] = useState<Player>("white"); // In multiplayer, this would be assigned
  
  // Mock lobby data - in real implementation, fetch from Directus
  const [lobbyData] = useState({
    id_lobby: lobbyId || "0001",
    player1: "ra3vqn...sgeD",
    player2: "rasqnv...qxEh",
    cost: "10 XRP",
  });

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
                <p className="text-sm text-muted-foreground">Lobby #{lobbyData.id_lobby}</p>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Coins className="h-3 w-3" />
                {lobbyData.cost}
              </Badge>
            </div>

            {/* Players info */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-400 flex items-center justify-center">
                    <Users className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">White</p>
                    <code className="text-sm">{lobbyData.player1}</code>
                  </div>
                </div>
                <span className="text-muted-foreground font-bold">VS</span>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground text-right">Black</p>
                    <code className="text-sm">{lobbyData.player2}</code>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center">
                    <Users className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              </div>
            </Card>

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
              playerColor={playerColor}
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

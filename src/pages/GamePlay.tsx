import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { CheckersBoard } from "@/components/game/checkers/CheckersBoard";
import { GameControls } from "@/components/game/checkers/GameControls";
import { GameOverDialog } from "@/components/game/checkers/GameOverDialog";
import { ChessBoard } from "@/components/game/chess/ChessBoard";
import { ChessControls } from "@/components/game/chess/ChessControls";
import { ChessGameOverDialog } from "@/components/game/chess/ChessGameOverDialog";
import { PromotionDialog } from "@/components/game/chess/PromotionDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Loader2 } from "lucide-react";
import { useMultiplayerCheckers } from "@/hooks/useMultiplayerCheckers";
import { useMultiplayerChess } from "@/hooks/useMultiplayerChess";
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
  
  // Checkers hook
  const checkersGame = useMultiplayerCheckers({
    lobbyId: lobbyId || "",
    playerWallet,
  });

  // Chess hook
  const chessGame = useMultiplayerChess({
    lobbyId: lobbyId || "",
    playerWallet,
  });
  
  const [showGameOver, setShowGameOver] = useState(false);
  const [showChessGameOver, setShowChessGameOver] = useState(false);

  const gameName = gameId ? gameNames[gameId] || gameId : "Game";

  // Show game over dialog when checkers game ends
  useEffect(() => {
    if (gameId === "checkers" && checkersGame.gameState.gameOver) {
      setShowGameOver(true);
    }
  }, [gameId, checkersGame.gameState.gameOver]);

  // Show game over dialog when chess game ends
  useEffect(() => {
    if (gameId === "chess" && chessGame.gameState.gameOver) {
      setShowChessGameOver(true);
    }
  }, [gameId, chessGame.gameState.gameOver]);

  const handleCheckersPlayAgain = () => {
    checkersGame.resetGame();
    setShowGameOver(false);
  };

  const handleChessPlayAgain = () => {
    chessGame.resetGame();
    setShowChessGameOver(false);
  };

  // Determine loading state based on game type
  const isLoading = gameId === "chess" ? chessGame.isLoading : checkersGame.isLoading;

  // Only show supported games
  if (gameId !== "checkers" && gameId !== "chess") {
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

  // Get values based on game type
  const isChess = gameId === "chess";
  const playerColor = isChess ? chessGame.playerColor : checkersGame.playerColor;
  const isMyTurn = isChess ? chessGame.isMyTurn : checkersGame.isMyTurn;
  const lobbyData = isChess ? chessGame.lobbyData : checkersGame.lobbyData;
  const gameOver = isChess ? chessGame.gameState.gameOver : checkersGame.gameState.gameOver;

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
                    <code className="text-sm">{formatWalletAddress(lobbyData?.player1_wallet || null)}</code>
                  </div>
                </div>
                <span className="text-muted-foreground font-bold">VS</span>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground text-right">Black {playerColor === "black" && "(You)"}</p>
                    <code className="text-sm">{formatWalletAddress(lobbyData?.player2_wallet || null)}</code>
                  </div>
                  <div className={`w-8 h-8 rounded-full bg-gray-800 border-2 flex items-center justify-center ${playerColor === "black" ? "border-primary ring-2 ring-primary/20" : "border-gray-600"}`}>
                    <Users className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              </div>
            </Card>

            {/* Turn indicator */}
            {!gameOver && (
              <div className={`text-center py-2 px-4 rounded-lg ${isMyTurn ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {isMyTurn ? "🎯 Your turn - make your move!" : "⏳ Waiting for opponent's move..."}
              </div>
            )}

            {/* Game board - Chess */}
            {isChess && (
              <>
                <ChessBoard
                  gameState={chessGame.gameState}
                  onCellClick={chessGame.handleCellClick}
                  flipped={playerColor === "black"}
                />
                <ChessControls
                  gameState={chessGame.gameState}
                  onReset={chessGame.resetGame}
                  onSurrender={chessGame.surrender}
                  playerColor={playerColor || "white"}
                />
              </>
            )}

            {/* Game board - Checkers */}
            {!isChess && (
              <>
                <CheckersBoard
                  gameState={checkersGame.gameState}
                  onCellClick={checkersGame.handleCellClick}
                  flipped={playerColor === "black"}
                />
                <GameControls
                  gameState={checkersGame.gameState}
                  onReset={checkersGame.resetGame}
                  onSurrender={checkersGame.surrender}
                  playerColor={playerColor || "white"}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Checkers game over dialog */}
      <GameOverDialog
        open={showGameOver}
        winner={checkersGame.gameState.winner}
        onPlayAgain={handleCheckersPlayAgain}
        onClose={() => setShowGameOver(false)}
      />

      {/* Chess game over dialog */}
      <ChessGameOverDialog
        open={showChessGameOver}
        winner={chessGame.gameState.winner}
        isCheckmate={chessGame.gameState.isCheckmate}
        onPlayAgain={handleChessPlayAgain}
        onClose={() => setShowChessGameOver(false)}
      />

      {/* Chess promotion dialog */}
      {chessGame.gameState.promotionPending && (
        <PromotionDialog
          open={true}
          player={chessGame.gameState.currentPlayer}
          onSelect={chessGame.selectPromotion}
          onClose={() => {}}
        />
      )}
    </div>
  );
};

export default GamePlay;

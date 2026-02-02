import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  ChessGameState,
  ChessPlayer,
  ChessMove,
  ChessPieceType,
  createInitialChessState,
  isOwnPiece,
  getLegalMoves,
  applyMove,
  isInCheck,
  checkGameEnd,
  getPieceType,
} from "./useChess";

interface UseMultiplayerChessProps {
  lobbyId: string;
  playerWallet: string;
}

interface ChessGameSessionData {
  id: number;
  lobby_id: string;
  player1_wallet: string;
  player2_wallet: string | null;
  game_state: ChessGameState | null;
  current_turn: string;
  game_status: string;
  winner: string | null;
  last_move_at: string;
}

export const useMultiplayerChess = ({ lobbyId, playerWallet }: UseMultiplayerChessProps) => {
  const [gameState, setGameState] = useState<ChessGameState>(createInitialChessState());
  const [playerColor, setPlayerColor] = useState<ChessPlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [lobbyData, setLobbyData] = useState<{
    player1_wallet: string;
    player2_wallet: string | null;
  } | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastMoveAtRef = useRef<string | null>(null);

  // Fetch or create game session
  const fetchGameSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("lobby-proxy", {
        body: { action: "get_chess_session", lobby_id: lobbyId }
      });

      if (error) {
        console.error("Error fetching chess session:", error);
        return null;
      }

      return data?.data as ChessGameSessionData | null;
    } catch (err) {
      console.error("Error in fetchGameSession:", err);
      return null;
    }
  }, [lobbyId]);

  const createGameSession = useCallback(async (player1: string, player2: string | null) => {
    try {
      const initialState = createInitialChessState();
      const { data, error } = await supabase.functions.invoke("lobby-proxy", {
        body: {
          action: "create_chess_session",
          lobby_id: lobbyId,
          player1_wallet: player1,
          player2_wallet: player2,
          game_state: initialState
        }
      });

      if (error) {
        console.error("Error creating chess session:", error);
        return null;
      }

      return data?.data as ChessGameSessionData | null;
    } catch (err) {
      console.error("Error in createGameSession:", err);
      return null;
    }
  }, [lobbyId]);

  const updateGameSession = useCallback(async (updates: {
    game_state?: ChessGameState;
    current_turn?: string;
    game_status?: string;
    winner?: string | null;
    player2_wallet?: string;
  }) => {
    if (!sessionId) return;

    try {
      const { data, error } = await supabase.functions.invoke("lobby-proxy", {
        body: {
          action: "update_chess_session",
          session_id: sessionId,
          ...updates
        }
      });

      if (error) {
        console.error("Error updating chess session:", error);
      }

      return data?.data as ChessGameSessionData | null;
    } catch (err) {
      console.error("Error in updateGameSession:", err);
      return null;
    }
  }, [sessionId]);

  // Initialize game session
  useEffect(() => {
    const initSession = async () => {
      setIsLoading(true);

      let session = await fetchGameSession();

      if (!session) {
        // Create new session - first player is white
        session = await createGameSession(playerWallet, null);
        if (session) {
          setPlayerColor("white");
        }
      } else {
        // Session exists, determine player color
        if (session.player1_wallet === playerWallet) {
          setPlayerColor("white");
        } else if (session.player2_wallet === playerWallet) {
          setPlayerColor("black");
        } else if (!session.player2_wallet) {
          // Join as player2 (black)
          await updateGameSession({ player2_wallet: playerWallet });
          session.player2_wallet = playerWallet;
          setPlayerColor("black");
        }
      }

      if (session) {
        setSessionId(session.id);
        setLobbyData({
          player1_wallet: session.player1_wallet,
          player2_wallet: session.player2_wallet
        });

        if (session.game_state && session.game_state.board) {
          setGameState(session.game_state);
        }

        lastMoveAtRef.current = session.last_move_at;
      }

      setIsLoading(false);
    };

    initSession();
  }, [lobbyId, playerWallet, fetchGameSession, createGameSession, updateGameSession]);

  // Polling for game state updates
  useEffect(() => {
    if (!sessionId) return;

    const pollGameState = async () => {
      const session = await fetchGameSession();

      if (session && session.last_move_at !== lastMoveAtRef.current) {
        console.log("Chess game state updated from Directus");
        lastMoveAtRef.current = session.last_move_at;

        if (session.game_state && session.game_state.board) {
          setGameState(session.game_state);
        }

        // Update player2 if they joined
        if (session.player2_wallet && !lobbyData?.player2_wallet) {
          setLobbyData({
            player1_wallet: session.player1_wallet,
            player2_wallet: session.player2_wallet
          });
        }
      }
    };

    // Poll every 1.5 seconds
    pollingRef.current = setInterval(pollGameState, 1500);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [sessionId, fetchGameSession, lobbyData]);

  // Check if it's this player's turn
  const isMyTurn = useCallback(() => {
    if (!playerColor) return false;
    return gameState.currentPlayer === playerColor;
  }, [gameState.currentPlayer, playerColor]);

  const handleCellClick = useCallback((row: number, col: number) => {
    // Only allow moves when it's this player's turn
    if (!isMyTurn() || gameState.gameOver || gameState.promotionPending) return;

    setGameState(prev => {
      // Check if clicking on a valid move destination
      if (prev.selectedPiece) {
        const move = prev.validMoves.find(m => m.to.row === row && m.to.col === col);
        if (move) {
          // Check for pawn promotion
          const piece = prev.board[move.from.row][move.from.col];
          const isPawn = getPieceType(piece) === "p";
          const promotionRow = prev.currentPlayer === "white" ? 0 : 7;

          if (isPawn && move.to.row === promotionRow && !move.promotion) {
            // Need to select promotion piece
            return {
              ...prev,
              promotionPending: move.to,
              validMoves: prev.validMoves.filter(m =>
                m.to.row === move.to.row && m.to.col === move.to.col
              ),
            };
          }

          return executeMove(prev, move);
        }
      }

      // Check if clicking on own piece to select it
      const piece = prev.board[row][col];
      if (piece && isOwnPiece(piece, prev.currentPlayer)) {
        const moves = getLegalMoves(
          prev.board,
          row,
          col,
          prev.currentPlayer,
          prev.castlingRights,
          prev.enPassantTarget
        );

        return {
          ...prev,
          selectedPiece: { row, col },
          validMoves: moves,
        };
      }

      // Deselect
      return {
        ...prev,
        selectedPiece: null,
        validMoves: [],
      };
    });
  }, [isMyTurn, gameState.gameOver, gameState.promotionPending]);

  const selectPromotion = useCallback((promotionPiece: ChessPieceType) => {
    if (!isMyTurn()) return;

    setGameState(prev => {
      if (!prev.promotionPending || !prev.selectedPiece) return prev;

      const move: ChessMove = {
        from: prev.selectedPiece,
        to: prev.promotionPending,
        piece: prev.board[prev.selectedPiece.row][prev.selectedPiece.col],
        promotion: promotionPiece,
      };

      return executeMove({ ...prev, promotionPending: null }, move);
    });
  }, [isMyTurn]);

  const executeMove = (prev: ChessGameState, move: ChessMove): ChessGameState => {
    const newBoard = applyMove(prev.board, move);
    const nextPlayer: ChessPlayer = prev.currentPlayer === "white" ? "black" : "white";

    // Update castling rights
    const newCastlingRights = { ...prev.castlingRights };
    const piece = prev.board[move.from.row][move.from.col];
    const pieceType = getPieceType(piece);

    if (pieceType === "k") {
      newCastlingRights[prev.currentPlayer] = { kingSide: false, queenSide: false };
    } else if (pieceType === "r") {
      const backRank = prev.currentPlayer === "white" ? 7 : 0;
      if (move.from.row === backRank) {
        if (move.from.col === 0) {
          newCastlingRights[prev.currentPlayer].queenSide = false;
        } else if (move.from.col === 7) {
          newCastlingRights[prev.currentPlayer].kingSide = false;
        }
      }
    }

    // Check if rook was captured
    if (move.captured) {
      const capturedType = getPieceType(move.captured);
      if (capturedType === "r") {
        const opponentBackRank = nextPlayer === "white" ? 7 : 0;
        if (move.to.row === opponentBackRank) {
          if (move.to.col === 0) {
            newCastlingRights[nextPlayer].queenSide = false;
          } else if (move.to.col === 7) {
            newCastlingRights[nextPlayer].kingSide = false;
          }
        }
      }
    }

    // Update en passant target
    let newEnPassantTarget = null;
    if (pieceType === "p" && Math.abs(move.from.row - move.to.row) === 2) {
      newEnPassantTarget = {
        row: (move.from.row + move.to.row) / 2,
        col: move.from.col,
      };
    }

    // Update captured pieces
    const newCapturedWhite = [...prev.capturedWhite];
    const newCapturedBlack = [...prev.capturedBlack];
    if (move.captured) {
      if (move.captured === move.captured.toUpperCase()) {
        newCapturedWhite.push(move.captured);
      } else {
        newCapturedBlack.push(move.captured);
      }
    }

    // Update half move clock
    let newHalfMoveClock = prev.halfMoveClock + 1;
    if (pieceType === "p" || move.captured) {
      newHalfMoveClock = 0;
    }

    // Check game state
    const check = isInCheck(newBoard, nextPlayer);
    const { isCheckmate, isStalemate } = checkGameEnd(
      newBoard,
      nextPlayer,
      newCastlingRights,
      newEnPassantTarget
    );

    // Check for draw by 50 move rule
    const isDraw = newHalfMoveClock >= 100 || isStalemate;

    const finalMove: ChessMove = {
      ...move,
      isCheck: check,
      isCheckmate,
    };

    const newState: ChessGameState = {
      board: newBoard,
      currentPlayer: nextPlayer,
      selectedPiece: null,
      validMoves: [],
      gameOver: isCheckmate || isDraw,
      winner: isCheckmate ? prev.currentPlayer : (isDraw ? "draw" : null),
      isCheck: check,
      isCheckmate,
      isStalemate,
      castlingRights: newCastlingRights,
      enPassantTarget: newEnPassantTarget,
      halfMoveClock: newHalfMoveClock,
      fullMoveNumber: prev.currentPlayer === "black" ? prev.fullMoveNumber + 1 : prev.fullMoveNumber,
      capturedWhite: newCapturedWhite,
      capturedBlack: newCapturedBlack,
      moveHistory: [...prev.moveHistory, finalMove],
      promotionPending: null,
    };

    // Sync to Directus
    updateGameSession({
      game_state: newState,
      current_turn: nextPlayer,
      game_status: newState.gameOver ? "finished" : "playing",
      winner: newState.winner ? (newState.winner === "white" ? lobbyData?.player1_wallet : lobbyData?.player2_wallet) || null : null,
    });

    return newState;
  };

  const resetGame = useCallback(async () => {
    const initialState = createInitialChessState();
    setGameState(initialState);

    await updateGameSession({
      game_state: initialState,
      current_turn: "white",
      game_status: "playing",
      winner: null,
    });
  }, [updateGameSession]);

  const surrender = useCallback(async () => {
    if (!playerColor) return;

    const winner = playerColor === "white" ? "black" : "white";
    const winnerWallet = winner === "white" 
      ? lobbyData?.player1_wallet 
      : lobbyData?.player2_wallet;

    setGameState(prev => ({
      ...prev,
      gameOver: true,
      winner,
    }));

    await updateGameSession({
      game_status: "finished",
      winner: winnerWallet || null,
    });
  }, [playerColor, lobbyData, updateGameSession]);

  return {
    gameState,
    playerColor,
    isLoading,
    isMyTurn: isMyTurn(),
    lobbyData,
    handleCellClick,
    selectPromotion,
    resetGame,
    surrender,
  };
};

import { useState, useCallback, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GameState, PieceType, Player, Move, Position } from "./useCheckers";

// Initialize standard checkers board
const createInitialBoard = (): PieceType[][] => {
  const board: PieceType[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Place black pieces (top 3 rows)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = "black";
      }
    }
  }
  
  // Place white pieces (bottom 3 rows)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = "white";
      }
    }
  }
  
  return board;
};

const isOwnPiece = (piece: PieceType, player: Player): boolean => {
  if (!piece) return false;
  if (player === "white") return piece === "white" || piece === "whiteKing";
  return piece === "black" || piece === "blackKing";
};

const isOpponentPiece = (piece: PieceType, player: Player): boolean => {
  if (!piece) return false;
  if (player === "white") return piece === "black" || piece === "blackKing";
  return piece === "white" || piece === "whiteKing";
};

const isKing = (piece: PieceType): boolean => {
  return piece === "whiteKing" || piece === "blackKing";
};

const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

const getValidMovesForPiece = (
  board: PieceType[][],
  row: number,
  col: number,
  player: Player,
  mustCapture: boolean = false
): Move[] => {
  const piece = board[row][col];
  if (!piece || !isOwnPiece(piece, player)) return [];
  
  const moves: Move[] = [];
  const isKingPiece = isKing(piece);
  
  const allDirections: number[] = [-1, 1];
  const colDirections = [-1, 1];
  
  if (isKingPiece) {
    // FLYING KING: can move any number of squares diagonally
    // and capture by jumping over opponent piece, landing on any empty square beyond
    
    for (const rowDir of allDirections) {
      for (const colDir of colDirections) {
        let distance = 1;
        let foundOpponent: Position | null = null;
        
        while (true) {
          const newRow = row + rowDir * distance;
          const newCol = col + colDir * distance;
          
          if (!isValidPosition(newRow, newCol)) break;
          
          const targetPiece = board[newRow][newCol];
          
          if (!targetPiece) {
            // Empty square
            if (foundOpponent) {
              // We jumped over an opponent - this is a capture move
              // King can land on any empty square after the captured piece
              moves.push({
                from: { row, col },
                to: { row: newRow, col: newCol },
                captured: foundOpponent,
                isCapture: true,
              });
              // Continue looking for more landing squares in this direction
            } else if (!mustCapture) {
              // Regular move (no capture required)
              moves.push({
                from: { row, col },
                to: { row: newRow, col: newCol },
                isCapture: false,
              });
            }
          } else if (isOpponentPiece(targetPiece, player)) {
            if (foundOpponent) {
              // Already found one opponent in this direction, can't jump two pieces
              break;
            }
            // Found opponent piece - mark it for potential capture
            foundOpponent = { row: newRow, col: newCol };
            // Continue to check if there's an empty square to land on
          } else {
            // Own piece - blocked completely
            break;
          }
          
          distance++;
        }
      }
    }
  } else {
    // REGULAR PIECE: moves forward only, captures in BOTH directions
    
    // Movement directions: white moves up (-1), black moves down (+1)
    const moveDirections: number[] = player === "white" ? [-1] : [1];
    
    // Regular moves (only forward)
    if (!mustCapture) {
      for (const rowDir of moveDirections) {
        for (const colDir of colDirections) {
          const newRow = row + rowDir;
          const newCol = col + colDir;
          
          if (!isValidPosition(newRow, newCol)) continue;
          
          const targetPiece = board[newRow][newCol];
          
          if (!targetPiece) {
            moves.push({
              from: { row, col },
              to: { row: newRow, col: newCol },
              isCapture: false,
            });
          }
        }
      }
    }
    
    // Captures (in ALL directions - backwards capture allowed)
    for (const rowDir of allDirections) {
      for (const colDir of colDirections) {
        const newRow = row + rowDir;
        const newCol = col + colDir;
        
        if (!isValidPosition(newRow, newCol)) continue;
        
        const targetPiece = board[newRow][newCol];
        
        if (isOpponentPiece(targetPiece, player)) {
          const jumpRow = newRow + rowDir;
          const jumpCol = newCol + colDir;
          
          if (isValidPosition(jumpRow, jumpCol) && !board[jumpRow][jumpCol]) {
            moves.push({
              from: { row, col },
              to: { row: jumpRow, col: jumpCol },
              captured: { row: newRow, col: newCol },
              isCapture: true,
            });
          }
        }
      }
    }
  }
  
  return moves;
};

const hasAnyCapture = (board: PieceType[][], player: Player): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const moves = getValidMovesForPiece(board, row, col, player, false);
      if (moves.some(m => m.isCapture)) return true;
    }
  }
  return false;
};

const getAllValidMoves = (board: PieceType[][], player: Player): Move[] => {
  const mustCapture = hasAnyCapture(board, player);
  const allMoves: Move[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const moves = getValidMovesForPiece(board, row, col, player, mustCapture);
      if (mustCapture) {
        allMoves.push(...moves.filter(m => m.isCapture));
      } else {
        allMoves.push(...moves);
      }
    }
  }
  
  return allMoves;
};

const countPieces = (board: PieceType[][], player: Player): number => {
  let count = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (isOwnPiece(board[row][col], player)) count++;
    }
  }
  return count;
};

const checkGameOver = (board: PieceType[][], currentPlayer: Player): { gameOver: boolean; winner: Player | "draw" | null } => {
  const whitePieces = countPieces(board, "white");
  const blackPieces = countPieces(board, "black");
  
  if (whitePieces === 0) return { gameOver: true, winner: "black" };
  if (blackPieces === 0) return { gameOver: true, winner: "white" };
  
  const validMoves = getAllValidMoves(board, currentPlayer);
  if (validMoves.length === 0) {
    return { gameOver: true, winner: currentPlayer === "white" ? "black" : "white" };
  }
  
  return { gameOver: false, winner: null };
};

const createInitialGameState = (): GameState => ({
  board: createInitialBoard(),
  currentPlayer: "white",
  selectedPiece: null,
  validMoves: [],
  gameOver: false,
  winner: null,
  capturedWhite: 0,
  capturedBlack: 0,
  moveHistory: [],
});

interface UseMultiplayerCheckersProps {
  lobbyId: string;
  playerWallet: string;
}

interface GameSessionData {
  id: number;
  lobby_id: string;
  player1_wallet: string;
  player2_wallet: string | null;
  game_state: GameState | null;
  current_turn: string;
  game_status: string;
  winner: string | null;
  last_move_at: string;
}

export const useMultiplayerCheckers = ({ lobbyId, playerWallet }: UseMultiplayerCheckersProps) => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [playerColor, setPlayerColor] = useState<Player | null>(null);
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
        body: { action: "get_game_session", lobby_id: lobbyId }
      });

      if (error) {
        console.error("Error fetching game session:", error);
        return null;
      }

      return data?.data as GameSessionData | null;
    } catch (err) {
      console.error("Error in fetchGameSession:", err);
      return null;
    }
  }, [lobbyId]);

  const createGameSession = useCallback(async (player1: string, player2: string | null) => {
    try {
      const initialState = createInitialGameState();
      const { data, error } = await supabase.functions.invoke("lobby-proxy", {
        body: {
          action: "create_game_session",
          lobby_id: lobbyId,
          player1_wallet: player1,
          player2_wallet: player2,
          game_state: initialState
        }
      });

      if (error) {
        console.error("Error creating game session:", error);
        return null;
      }

      return data?.data as GameSessionData | null;
    } catch (err) {
      console.error("Error in createGameSession:", err);
      return null;
    }
  }, [lobbyId]);

  const updateGameSession = useCallback(async (updates: {
    game_state?: GameState;
    current_turn?: string;
    game_status?: string;
    winner?: string | null;
    player2_wallet?: string;
  }) => {
    if (!sessionId) return;

    try {
      const { data, error } = await supabase.functions.invoke("lobby-proxy", {
        body: {
          action: "update_game_session",
          session_id: sessionId,
          ...updates
        }
      });

      if (error) {
        console.error("Error updating game session:", error);
      }

      return data?.data as GameSessionData | null;
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
        // Create new session - first player to arrive is player1 (white)
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
        console.log("Game state updated from Directus");
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
    if (!isMyTurn() || gameState.gameOver) return;

    setGameState(prev => {
      // Check if clicking on a valid move destination
      if (prev.selectedPiece) {
        const move = prev.validMoves.find(m => m.to.row === row && m.to.col === col);
        if (move) {
          const newBoard = prev.board.map(r => [...r]);
          const piece = newBoard[move.from.row][move.from.col];
          
          newBoard[move.from.row][move.from.col] = null;
          newBoard[move.to.row][move.to.col] = piece;
          
          let newCapturedWhite = prev.capturedWhite;
          let newCapturedBlack = prev.capturedBlack;
          
          if (move.captured) {
            const capturedPiece = newBoard[move.captured.row][move.captured.col];
            newBoard[move.captured.row][move.captured.col] = null;
            
            if (capturedPiece === "white" || capturedPiece === "whiteKing") {
              newCapturedWhite++;
            } else {
              newCapturedBlack++;
            }
          }
          
          // Check for promotion
          if (piece === "white" && move.to.row === 0) {
            newBoard[move.to.row][move.to.col] = "whiteKing";
          } else if (piece === "black" && move.to.row === 7) {
            newBoard[move.to.row][move.to.col] = "blackKing";
          }
          
          // Check for multi-capture
          let nextPlayer: Player = prev.currentPlayer === "white" ? "black" : "white";
          let continueCapture = false;
          
          if (move.isCapture) {
            const additionalCaptures = getValidMovesForPiece(
              newBoard,
              move.to.row,
              move.to.col,
              prev.currentPlayer,
              true
            ).filter(m => m.isCapture);
            
            if (additionalCaptures.length > 0) {
              continueCapture = true;
              nextPlayer = prev.currentPlayer;
            }
          }
          
          const { gameOver, winner } = checkGameOver(newBoard, nextPlayer);
          
          const newState: GameState = {
            ...prev,
            board: newBoard,
            currentPlayer: nextPlayer,
            selectedPiece: continueCapture ? move.to : null,
            validMoves: continueCapture 
              ? getValidMovesForPiece(newBoard, move.to.row, move.to.col, prev.currentPlayer, true).filter(m => m.isCapture)
              : [],
            gameOver,
            winner,
            capturedWhite: newCapturedWhite,
            capturedBlack: newCapturedBlack,
            moveHistory: [...prev.moveHistory, move],
          };

          // Save to Directus
          updateGameSession({
            game_state: newState,
            current_turn: nextPlayer,
            game_status: gameOver ? "finished" : "playing",
            winner: winner as string | null
          });
          
          return newState;
        }
      }
      
      // Check if clicking on own piece to select it (only own pieces for current player)
      const piece = prev.board[row][col];
      if (piece && isOwnPiece(piece, prev.currentPlayer) && isOwnPiece(piece, playerColor!)) {
        const mustCapture = hasAnyCapture(prev.board, prev.currentPlayer);
        let moves = getValidMovesForPiece(prev.board, row, col, prev.currentPlayer, mustCapture);
        
        if (mustCapture) {
          moves = moves.filter(m => m.isCapture);
        }
        
        if (moves.length === 0 && mustCapture) {
          return prev;
        }
        
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
  }, [isMyTurn, playerColor, updateGameSession, gameState.gameOver]);

  const resetGame = useCallback(() => {
    const newState = createInitialGameState();
    setGameState(newState);
    updateGameSession({
      game_state: newState,
      current_turn: "white",
      game_status: "playing",
      winner: null
    });
  }, [updateGameSession]);

  const surrender = useCallback(() => {
    if (!playerColor) return;
    
    const winner = playerColor === "white" ? "black" : "white";
    const newState: GameState = {
      ...gameState,
      gameOver: true,
      winner,
    };
    
    setGameState(newState);
    updateGameSession({
      game_state: newState,
      game_status: "finished",
      winner
    });
  }, [playerColor, gameState, updateGameSession]);

  return {
    gameState,
    playerColor,
    isLoading,
    isMyTurn: isMyTurn(),
    lobbyData,
    handleCellClick,
    resetGame,
    surrender,
  };
};

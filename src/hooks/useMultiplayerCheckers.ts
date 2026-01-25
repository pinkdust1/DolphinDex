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
  
  const directions: number[] = [];
  if (player === "white" || isKingPiece) directions.push(-1);
  if (player === "black" || isKingPiece) directions.push(1);
  
  const colDirections = [-1, 1];
  
  for (const rowDir of directions) {
    for (const colDir of colDirections) {
      const newRow = row + rowDir;
      const newCol = col + colDir;
      
      if (!isValidPosition(newRow, newCol)) continue;
      
      const targetPiece = board[newRow][newCol];
      
      if (!targetPiece && !mustCapture) {
        moves.push({
          from: { row, col },
          to: { row: newRow, col: newCol },
          isCapture: false,
        });
      }
      
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

export const useMultiplayerCheckers = ({ lobbyId, playerWallet }: UseMultiplayerCheckersProps) => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [playerColor, setPlayerColor] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lobbyData, setLobbyData] = useState<{
    creator_id: string;
    opponent_id: string | null;
    creator_wallet?: string;
    opponent_wallet?: string;
  } | null>(null);
  
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Fetch lobby data and determine player color
  useEffect(() => {
    const fetchLobbyData = async () => {
      try {
        // Fetch lobby with player wallet addresses
        const { data: lobby, error } = await supabase
          .from('lobbies')
          .select(`
            id,
            creator_id,
            opponent_id,
            game_state,
            status
          `)
          .eq('lobby_code', lobbyId)
          .single();

        if (error || !lobby) {
          console.error('Error fetching lobby:', error);
          setIsLoading(false);
          return;
        }

        // Fetch player wallet addresses
        const playerIds = [lobby.creator_id, lobby.opponent_id].filter(Boolean) as string[];
        const { data: players } = await supabase
          .from('players')
          .select('id, wallet_address')
          .in('id', playerIds);

        const creatorPlayer = players?.find(p => p.id === lobby.creator_id);
        const opponentPlayer = players?.find(p => p.id === lobby.opponent_id);

        setLobbyData({
          creator_id: lobby.creator_id,
          opponent_id: lobby.opponent_id,
          creator_wallet: creatorPlayer?.wallet_address,
          opponent_wallet: opponentPlayer?.wallet_address,
        });

        // Determine player color based on wallet address
        // Creator plays as white, opponent plays as black
        if (creatorPlayer?.wallet_address === playerWallet) {
          setPlayerColor("white");
        } else if (opponentPlayer?.wallet_address === playerWallet) {
          setPlayerColor("black");
        }

        // Load existing game state if available
        if (lobby.game_state && typeof lobby.game_state === 'object') {
          const savedState = lobby.game_state as unknown as GameState;
          if (savedState.board) {
            setGameState(savedState);
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error in fetchLobbyData:', err);
        setIsLoading(false);
      }
    };

    fetchLobbyData();
  }, [lobbyId, playerWallet]);

  // Subscribe to realtime game state updates
  useEffect(() => {
    if (!lobbyId) return;

    const channel = supabase.channel(`game:${lobbyId}`)
      .on('broadcast', { event: 'game_state' }, ({ payload }) => {
        if (payload?.gameState) {
          console.log('Received game state update:', payload.gameState);
          setGameState(payload.gameState);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [lobbyId]);

  // Broadcast game state to other player
  const broadcastGameState = useCallback(async (newState: GameState) => {
    if (!channelRef.current) return;
    
    await channelRef.current.send({
      type: 'broadcast',
      event: 'game_state',
      payload: { gameState: newState },
    });

    // Also persist to database
    try {
      await supabase
        .from('lobbies')
        .update({ game_state: JSON.parse(JSON.stringify(newState)) })
        .eq('lobby_code', lobbyId);
    } catch (err) {
      console.error('Error saving game state:', err);
    }
  }, [lobbyId]);

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

          // Broadcast the new state
          broadcastGameState(newState);
          
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
  }, [isMyTurn, playerColor, broadcastGameState, gameState.gameOver]);

  const resetGame = useCallback(() => {
    const newState = createInitialGameState();
    setGameState(newState);
    broadcastGameState(newState);
  }, [broadcastGameState]);

  const surrender = useCallback(() => {
    if (!playerColor) return;
    
    const newState: GameState = {
      ...gameState,
      gameOver: true,
      winner: playerColor === "white" ? "black" : "white",
    };
    
    setGameState(newState);
    broadcastGameState(newState);
  }, [playerColor, gameState, broadcastGameState]);

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

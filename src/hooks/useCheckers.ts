import { useState, useCallback } from "react";

export type PieceType = "white" | "black" | "whiteKing" | "blackKing" | null;
export type Player = "white" | "black";

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  captured?: Position;
  isCapture: boolean;
}

export interface GameState {
  board: PieceType[][];
  currentPlayer: Player;
  selectedPiece: Position | null;
  validMoves: Move[];
  gameOver: boolean;
  winner: Player | "draw" | null;
  capturedWhite: number;
  capturedBlack: number;
  moveHistory: Move[];
}

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

// Get all valid moves for a piece (including flying king rules)
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
    // REGULAR PIECE: moves forward only, captures in both directions
    
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

// Check if any piece has a capture available
const hasAnyCapture = (board: PieceType[][], player: Player): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const moves = getValidMovesForPiece(board, row, col, player, false);
      if (moves.some(m => m.isCapture)) return true;
    }
  }
  return false;
};

// Get all valid moves for current player
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

// Count pieces
const countPieces = (board: PieceType[][], player: Player): number => {
  let count = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (isOwnPiece(board[row][col], player)) count++;
    }
  }
  return count;
};

// Check for game over
const checkGameOver = (board: PieceType[][], currentPlayer: Player): { gameOver: boolean; winner: Player | "draw" | null } => {
  const whitePieces = countPieces(board, "white");
  const blackPieces = countPieces(board, "black");
  
  if (whitePieces === 0) return { gameOver: true, winner: "black" };
  if (blackPieces === 0) return { gameOver: true, winner: "white" };
  
  const validMoves = getAllValidMoves(board, currentPlayer);
  if (validMoves.length === 0) {
    // Current player has no moves - they lose
    return { gameOver: true, winner: currentPlayer === "white" ? "black" : "white" };
  }
  
  return { gameOver: false, winner: null };
};

export const useCheckers = () => {
  const [gameState, setGameState] = useState<GameState>({
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

  const selectPiece = useCallback((row: number, col: number) => {
    setGameState(prev => {
      if (prev.gameOver) return prev;
      
      const piece = prev.board[row][col];
      if (!piece || !isOwnPiece(piece, prev.currentPlayer)) {
        return { ...prev, selectedPiece: null, validMoves: [] };
      }
      
      const mustCapture = hasAnyCapture(prev.board, prev.currentPlayer);
      let moves = getValidMovesForPiece(prev.board, row, col, prev.currentPlayer, mustCapture);
      
      // If must capture, only allow capture moves
      if (mustCapture) {
        moves = moves.filter(m => m.isCapture);
      }
      
      // If this piece has no valid moves (but others do), don't select it
      if (moves.length === 0 && mustCapture) {
        return prev;
      }
      
      return {
        ...prev,
        selectedPiece: { row, col },
        validMoves: moves,
      };
    });
  }, []);

  const makeMove = useCallback((move: Move) => {
    setGameState(prev => {
      if (prev.gameOver) return prev;
      
      const newBoard = prev.board.map(r => [...r]);
      const piece = newBoard[move.from.row][move.from.col];
      
      // Move piece
      newBoard[move.from.row][move.from.col] = null;
      newBoard[move.to.row][move.to.col] = piece;
      
      // Handle capture
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
      
      // Check for promotion to king
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
      
      // Check game over
      const { gameOver, winner } = checkGameOver(newBoard, nextPlayer);
      
      return {
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
    });
  }, []);

  const handleCellClick = useCallback((row: number, col: number) => {
    setGameState(prev => {
      if (prev.gameOver) return prev;
      
      // Check if clicking on a valid move destination
      if (prev.selectedPiece) {
        const move = prev.validMoves.find(m => m.to.row === row && m.to.col === col);
        if (move) {
          // Make the move
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
          
          return {
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
        }
      }
      
      // Check if clicking on own piece to select it
      const piece = prev.board[row][col];
      if (piece && isOwnPiece(piece, prev.currentPlayer)) {
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
  }, []);

  const resetGame = useCallback(() => {
    setGameState({
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
  }, []);

  const surrender = useCallback((player: Player) => {
    setGameState(prev => ({
      ...prev,
      gameOver: true,
      winner: player === "white" ? "black" : "white",
    }));
  }, []);

  return {
    gameState,
    selectPiece,
    makeMove,
    handleCellClick,
    resetGame,
    surrender,
  };
};

import { useState, useCallback } from "react";

// Chess piece types: uppercase = white, lowercase = black
// K/k = King, Q/q = Queen, R/r = Rook, B/b = Bishop, N/n = Knight, P/p = Pawn
export type ChessPieceType = 
  | "K" | "Q" | "R" | "B" | "N" | "P"  // White pieces
  | "k" | "q" | "r" | "b" | "n" | "p"  // Black pieces
  | null;

export type ChessPlayer = "white" | "black";

export interface ChessPosition {
  row: number;
  col: number;
}

export interface ChessMove {
  from: ChessPosition;
  to: ChessPosition;
  piece: ChessPieceType;
  captured?: ChessPieceType;
  promotion?: ChessPieceType;
  isCastling?: "kingSide" | "queenSide";
  isEnPassant?: boolean;
  isCheck?: boolean;
  isCheckmate?: boolean;
}

export interface CastlingRights {
  white: { kingSide: boolean; queenSide: boolean };
  black: { kingSide: boolean; queenSide: boolean };
}

export interface ChessGameState {
  board: ChessPieceType[][];
  currentPlayer: ChessPlayer;
  selectedPiece: ChessPosition | null;
  validMoves: ChessMove[];
  gameOver: boolean;
  winner: ChessPlayer | "draw" | null;
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  castlingRights: CastlingRights;
  enPassantTarget: ChessPosition | null;
  halfMoveClock: number;
  fullMoveNumber: number;
  capturedWhite: ChessPieceType[];
  capturedBlack: ChessPieceType[];
  moveHistory: ChessMove[];
  promotionPending: ChessPosition | null;
}

// Initialize standard chess board
const createInitialBoard = (): ChessPieceType[][] => {
  return [
    ["r", "n", "b", "q", "k", "b", "n", "r"],  // Row 0: Black back rank
    ["p", "p", "p", "p", "p", "p", "p", "p"],  // Row 1: Black pawns
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["P", "P", "P", "P", "P", "P", "P", "P"],  // Row 6: White pawns
    ["R", "N", "B", "Q", "K", "B", "N", "R"],  // Row 7: White back rank
  ];
};

const isWhitePiece = (piece: ChessPieceType): boolean => {
  if (!piece) return false;
  return piece === piece.toUpperCase();
};

const isBlackPiece = (piece: ChessPieceType): boolean => {
  if (!piece) return false;
  return piece === piece.toLowerCase();
};

const isOwnPiece = (piece: ChessPieceType, player: ChessPlayer): boolean => {
  if (!piece) return false;
  return player === "white" ? isWhitePiece(piece) : isBlackPiece(piece);
};

const isOpponentPiece = (piece: ChessPieceType, player: ChessPlayer): boolean => {
  if (!piece) return false;
  return player === "white" ? isBlackPiece(piece) : isWhitePiece(piece);
};

const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

const getPieceType = (piece: ChessPieceType): string => {
  if (!piece) return "";
  return piece.toLowerCase();
};

// Find king position
const findKing = (board: ChessPieceType[][], player: ChessPlayer): ChessPosition | null => {
  const king = player === "white" ? "K" : "k";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col] === king) {
        return { row, col };
      }
    }
  }
  return null;
};

// Check if a square is attacked by opponent
const isSquareAttacked = (
  board: ChessPieceType[][],
  row: number,
  col: number,
  byPlayer: ChessPlayer
): boolean => {
  // Check pawn attacks
  const pawnDir = byPlayer === "white" ? 1 : -1;
  for (const dc of [-1, 1]) {
    const pr = row + pawnDir;
    const pc = col + dc;
    if (isValidPosition(pr, pc)) {
      const piece = board[pr][pc];
      if (piece && isOwnPiece(piece, byPlayer) && getPieceType(piece) === "p") {
        return true;
      }
    }
  }

  // Check knight attacks
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  for (const [dr, dc] of knightMoves) {
    const nr = row + dr;
    const nc = col + dc;
    if (isValidPosition(nr, nc)) {
      const piece = board[nr][nc];
      if (piece && isOwnPiece(piece, byPlayer) && getPieceType(piece) === "n") {
        return true;
      }
    }
  }

  // Check king attacks (for adjacent squares)
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const kr = row + dr;
      const kc = col + dc;
      if (isValidPosition(kr, kc)) {
        const piece = board[kr][kc];
        if (piece && isOwnPiece(piece, byPlayer) && getPieceType(piece) === "k") {
          return true;
        }
      }
    }
  }

  // Check sliding pieces (rook, bishop, queen)
  const directions = [
    // Rook/Queen directions
    [-1, 0], [1, 0], [0, -1], [0, 1],
    // Bishop/Queen directions
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ];

  for (let i = 0; i < directions.length; i++) {
    const [dr, dc] = directions[i];
    const isOrthogonal = i < 4;
    
    let r = row + dr;
    let c = col + dc;
    
    while (isValidPosition(r, c)) {
      const piece = board[r][c];
      if (piece) {
        if (isOwnPiece(piece, byPlayer)) {
          const type = getPieceType(piece);
          if (type === "q") return true;
          if (isOrthogonal && type === "r") return true;
          if (!isOrthogonal && type === "b") return true;
        }
        break;
      }
      r += dr;
      c += dc;
    }
  }

  return false;
};

// Check if current player is in check
const isInCheck = (board: ChessPieceType[][], player: ChessPlayer): boolean => {
  const kingPos = findKing(board, player);
  if (!kingPos) return false;
  const opponent = player === "white" ? "black" : "white";
  return isSquareAttacked(board, kingPos.row, kingPos.col, opponent);
};

// Get all pseudo-legal moves for a piece (before filtering for check)
const getPseudoLegalMoves = (
  board: ChessPieceType[][],
  row: number,
  col: number,
  player: ChessPlayer,
  castlingRights: CastlingRights,
  enPassantTarget: ChessPosition | null
): ChessMove[] => {
  const piece = board[row][col];
  if (!piece || !isOwnPiece(piece, player)) return [];

  const moves: ChessMove[] = [];
  const pieceType = getPieceType(piece);

  switch (pieceType) {
    case "p": {
      // Pawn moves
      const direction = player === "white" ? -1 : 1;
      const startRow = player === "white" ? 6 : 1;
      const promotionRow = player === "white" ? 0 : 7;

      // Forward move
      const newRow = row + direction;
      if (isValidPosition(newRow, col) && !board[newRow][col]) {
        if (newRow === promotionRow) {
          // Promotion
          const promotions: ChessPieceType[] = player === "white" 
            ? ["Q", "R", "B", "N"] 
            : ["q", "r", "b", "n"];
          for (const promo of promotions) {
            moves.push({
              from: { row, col },
              to: { row: newRow, col },
              piece,
              promotion: promo,
            });
          }
        } else {
          moves.push({
            from: { row, col },
            to: { row: newRow, col },
            piece,
          });

          // Double move from start
          if (row === startRow) {
            const doubleRow = row + 2 * direction;
            if (!board[doubleRow][col]) {
              moves.push({
                from: { row, col },
                to: { row: doubleRow, col },
                piece,
              });
            }
          }
        }
      }

      // Captures (including en passant)
      for (const dc of [-1, 1]) {
        const captureCol = col + dc;
        if (!isValidPosition(newRow, captureCol)) continue;

        const target = board[newRow][captureCol];
        if (target && isOpponentPiece(target, player)) {
          if (newRow === promotionRow) {
            const promotions: ChessPieceType[] = player === "white" 
              ? ["Q", "R", "B", "N"] 
              : ["q", "r", "b", "n"];
            for (const promo of promotions) {
              moves.push({
                from: { row, col },
                to: { row: newRow, col: captureCol },
                piece,
                captured: target,
                promotion: promo,
              });
            }
          } else {
            moves.push({
              from: { row, col },
              to: { row: newRow, col: captureCol },
              piece,
              captured: target,
            });
          }
        }

        // En passant
        if (enPassantTarget && enPassantTarget.row === newRow && enPassantTarget.col === captureCol) {
          const capturedPawnRow = row;
          const capturedPawn = board[capturedPawnRow][captureCol];
          moves.push({
            from: { row, col },
            to: { row: newRow, col: captureCol },
            piece,
            captured: capturedPawn,
            isEnPassant: true,
          });
        }
      }
      break;
    }

    case "n": {
      // Knight moves
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [dr, dc] of knightMoves) {
        const nr = row + dr;
        const nc = col + dc;
        if (isValidPosition(nr, nc)) {
          const target = board[nr][nc];
          if (!target || isOpponentPiece(target, player)) {
            moves.push({
              from: { row, col },
              to: { row: nr, col: nc },
              piece,
              captured: target || undefined,
            });
          }
        }
      }
      break;
    }

    case "b": {
      // Bishop moves (diagonals)
      const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
      for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;
        while (isValidPosition(r, c)) {
          const target = board[r][c];
          if (!target) {
            moves.push({ from: { row, col }, to: { row: r, col: c }, piece });
          } else if (isOpponentPiece(target, player)) {
            moves.push({ from: { row, col }, to: { row: r, col: c }, piece, captured: target });
            break;
          } else {
            break;
          }
          r += dr;
          c += dc;
        }
      }
      break;
    }

    case "r": {
      // Rook moves (orthogonals)
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;
        while (isValidPosition(r, c)) {
          const target = board[r][c];
          if (!target) {
            moves.push({ from: { row, col }, to: { row: r, col: c }, piece });
          } else if (isOpponentPiece(target, player)) {
            moves.push({ from: { row, col }, to: { row: r, col: c }, piece, captured: target });
            break;
          } else {
            break;
          }
          r += dr;
          c += dc;
        }
      }
      break;
    }

    case "q": {
      // Queen moves (combination of rook and bishop)
      const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1],
        [-1, -1], [-1, 1], [1, -1], [1, 1]
      ];
      for (const [dr, dc] of directions) {
        let r = row + dr;
        let c = col + dc;
        while (isValidPosition(r, c)) {
          const target = board[r][c];
          if (!target) {
            moves.push({ from: { row, col }, to: { row: r, col: c }, piece });
          } else if (isOpponentPiece(target, player)) {
            moves.push({ from: { row, col }, to: { row: r, col: c }, piece, captured: target });
            break;
          } else {
            break;
          }
          r += dr;
          c += dc;
        }
      }
      break;
    }

    case "k": {
      // King moves
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = row + dr;
          const nc = col + dc;
          if (isValidPosition(nr, nc)) {
            const target = board[nr][nc];
            if (!target || isOpponentPiece(target, player)) {
              moves.push({
                from: { row, col },
                to: { row: nr, col: nc },
                piece,
                captured: target || undefined,
              });
            }
          }
        }
      }

      // Castling
      const rights = castlingRights[player];
      const opponent = player === "white" ? "black" : "white";
      const backRank = player === "white" ? 7 : 0;

      if (row === backRank && col === 4) {
        // King side castling
        if (rights.kingSide) {
          if (!board[backRank][5] && !board[backRank][6]) {
            if (!isSquareAttacked(board, backRank, 4, opponent) &&
                !isSquareAttacked(board, backRank, 5, opponent) &&
                !isSquareAttacked(board, backRank, 6, opponent)) {
              moves.push({
                from: { row, col },
                to: { row: backRank, col: 6 },
                piece,
                isCastling: "kingSide",
              });
            }
          }
        }

        // Queen side castling
        if (rights.queenSide) {
          if (!board[backRank][1] && !board[backRank][2] && !board[backRank][3]) {
            if (!isSquareAttacked(board, backRank, 4, opponent) &&
                !isSquareAttacked(board, backRank, 3, opponent) &&
                !isSquareAttacked(board, backRank, 2, opponent)) {
              moves.push({
                from: { row, col },
                to: { row: backRank, col: 2 },
                piece,
                isCastling: "queenSide",
              });
            }
          }
        }
      }
      break;
    }
  }

  return moves;
};

// Apply move to board and return new board
const applyMove = (board: ChessPieceType[][], move: ChessMove): ChessPieceType[][] => {
  const newBoard = board.map(row => [...row]);
  
  // Move piece
  newBoard[move.to.row][move.to.col] = move.promotion || newBoard[move.from.row][move.from.col];
  newBoard[move.from.row][move.from.col] = null;

  // Handle en passant capture
  if (move.isEnPassant) {
    newBoard[move.from.row][move.to.col] = null;
  }

  // Handle castling
  if (move.isCastling) {
    const backRank = move.from.row;
    if (move.isCastling === "kingSide") {
      newBoard[backRank][5] = newBoard[backRank][7];
      newBoard[backRank][7] = null;
    } else {
      newBoard[backRank][3] = newBoard[backRank][0];
      newBoard[backRank][0] = null;
    }
  }

  return newBoard;
};

// Get legal moves (filter pseudo-legal moves that leave king in check)
const getLegalMoves = (
  board: ChessPieceType[][],
  row: number,
  col: number,
  player: ChessPlayer,
  castlingRights: CastlingRights,
  enPassantTarget: ChessPosition | null
): ChessMove[] => {
  const pseudoLegalMoves = getPseudoLegalMoves(board, row, col, player, castlingRights, enPassantTarget);
  
  return pseudoLegalMoves.filter(move => {
    const newBoard = applyMove(board, move);
    return !isInCheck(newBoard, player);
  });
};

// Get all legal moves for player
const getAllLegalMoves = (
  board: ChessPieceType[][],
  player: ChessPlayer,
  castlingRights: CastlingRights,
  enPassantTarget: ChessPosition | null
): ChessMove[] => {
  const allMoves: ChessMove[] = [];
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const moves = getLegalMoves(board, row, col, player, castlingRights, enPassantTarget);
      allMoves.push(...moves);
    }
  }
  
  return allMoves;
};

// Check for checkmate or stalemate
const checkGameEnd = (
  board: ChessPieceType[][],
  player: ChessPlayer,
  castlingRights: CastlingRights,
  enPassantTarget: ChessPosition | null
): { isCheckmate: boolean; isStalemate: boolean } => {
  const legalMoves = getAllLegalMoves(board, player, castlingRights, enPassantTarget);
  
  if (legalMoves.length === 0) {
    if (isInCheck(board, player)) {
      return { isCheckmate: true, isStalemate: false };
    }
    return { isCheckmate: false, isStalemate: true };
  }
  
  return { isCheckmate: false, isStalemate: false };
};

export const createInitialChessState = (): ChessGameState => ({
  board: createInitialBoard(),
  currentPlayer: "white",
  selectedPiece: null,
  validMoves: [],
  gameOver: false,
  winner: null,
  isCheck: false,
  isCheckmate: false,
  isStalemate: false,
  castlingRights: {
    white: { kingSide: true, queenSide: true },
    black: { kingSide: true, queenSide: true },
  },
  enPassantTarget: null,
  halfMoveClock: 0,
  fullMoveNumber: 1,
  capturedWhite: [],
  capturedBlack: [],
  moveHistory: [],
  promotionPending: null,
});

export const useChess = () => {
  const [gameState, setGameState] = useState<ChessGameState>(createInitialChessState());

  const handleCellClick = useCallback((row: number, col: number) => {
    setGameState(prev => {
      if (prev.gameOver || prev.promotionPending) return prev;

      // Check if clicking on a valid move destination
      if (prev.selectedPiece) {
        const move = prev.validMoves.find(m => m.to.row === row && m.to.col === col);
        if (move) {
          // Check if this is a pawn promotion without promotion piece set
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
  }, []);

  const selectPromotion = useCallback((promotionPiece: ChessPieceType) => {
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
  }, []);

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
    let newEnPassantTarget: ChessPosition | null = null;
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
      if (isWhitePiece(move.captured)) {
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
    const isCheck = isInCheck(newBoard, nextPlayer);
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
      isCheck,
      isCheckmate,
    };

    return {
      board: newBoard,
      currentPlayer: nextPlayer,
      selectedPiece: null,
      validMoves: [],
      gameOver: isCheckmate || isDraw,
      winner: isCheckmate ? prev.currentPlayer : (isDraw ? "draw" : null),
      isCheck,
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
  };

  const resetGame = useCallback(() => {
    setGameState(createInitialChessState());
  }, []);

  const surrender = useCallback((player: ChessPlayer) => {
    setGameState(prev => ({
      ...prev,
      gameOver: true,
      winner: player === "white" ? "black" : "white",
    }));
  }, []);

  return {
    gameState,
    handleCellClick,
    selectPromotion,
    resetGame,
    surrender,
  };
};

// Export helper functions for multiplayer hook
export {
  isOwnPiece,
  isOpponentPiece,
  isInCheck,
  getLegalMoves,
  getAllLegalMoves,
  checkGameEnd,
  applyMove,
  getPieceType,
};

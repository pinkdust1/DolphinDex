// Game types supported by the platform
export type GameType = 'chess' | 'checkers' | 'durak';

// Lobby status enum matching database
export type LobbyStatus = 
  | 'waiting_for_player'
  | 'waiting_for_payment'
  | 'in_game'
  | 'finished'
  | 'cancelled';

// Transaction status enum matching database
export type TransactionStatus = 
  | 'pending'
  | 'signed'
  | 'confirmed'
  | 'failed'
  | 'expired';

// Game result enum
export type GameResult = 'win' | 'loss' | 'draw' | 'cancelled';

// Player from database
export interface Player {
  id: string;
  wallet_address: string;
  display_name: string | null;
  avatar_url: string | null;
  total_wins: number;
  total_losses: number;
  total_draws: number;
  total_xrp_won: number;
  total_xrp_lost: number;
  created_at: string;
  updated_at: string;
}

// Lobby from database with relations
export interface Lobby {
  id: string;
  lobby_code: string;
  game_type: GameType;
  creator_id: string;
  opponent_id: string | null;
  status: LobbyStatus;
  bet_amount: number;
  max_players: number;
  game_started_at: string | null;
  game_ended_at: string | null;
  winner_id: string | null;
  game_state: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  // Relations
  creator?: Player;
  opponent?: Player | null;
}

// Game transaction from database
export interface GameTransaction {
  id: string;
  lobby_id: string;
  player_id: string;
  transaction_type: 'bet' | 'payout' | 'refund';
  amount: number;
  xaman_payload_uuid: string | null;
  xrpl_tx_hash: string | null;
  status: TransactionStatus;
  signed_at: string | null;
  confirmed_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// Game history from database
export interface GameHistory {
  id: string;
  lobby_id: string;
  game_type: GameType;
  player1_id: string;
  player2_id: string;
  winner_id: string | null;
  player1_result: GameResult;
  player2_result: GameResult;
  bet_amount: number;
  game_duration_seconds: number | null;
  moves_count: number | null;
  final_game_state: Record<string, unknown> | null;
  played_at: string;
}

// Game info for UI display
export interface GameInfo {
  id: GameType;
  name: string;
  description: string;
  maxPlayers: number;
  icon: string;
}

// Static game configuration
export const GAMES: Record<GameType, GameInfo> = {
  chess: {
    id: 'chess',
    name: 'Chess',
    description: 'Classic strategy board game',
    maxPlayers: 2,
    icon: '♟️',
  },
  checkers: {
    id: 'checkers',
    name: 'Checkers',
    description: 'Traditional board game for two players',
    maxPlayers: 2,
    icon: '⚫',
  },
  durak: {
    id: 'durak',
    name: 'Durak',
    description: 'Popular Russian card game',
    maxPlayers: 6,
    icon: '🃏',
  },
};

// Status display configuration
export const LOBBY_STATUS_CONFIG: Record<LobbyStatus, { label: string; color: string }> = {
  waiting_for_player: { label: 'Waiting for player', color: 'text-foreground' },
  waiting_for_payment: { label: 'Waiting for payment', color: 'text-yellow-500' },
  in_game: { label: 'In game', color: 'text-green-500' },
  finished: { label: 'Finished', color: 'text-muted-foreground' },
  cancelled: { label: 'Cancelled', color: 'text-destructive' },
};

// Payment data from Xaman
export interface PaymentData {
  uuid: string;
  qrUrl: string;
  deepLink: string;
  transactionId: string;
}

// API Response types
export interface CreateLobbyResponse {
  success: boolean;
  lobby?: Lobby;
  message?: string;
  error?: string;
}

export interface JoinLobbyResponse {
  success: boolean;
  requiresPayment: boolean;
  payment?: PaymentData;
  message?: string;
  error?: string;
}

export interface CheckPaymentResponse {
  success: boolean;
  status: TransactionStatus | 'expired';
  confirmed?: boolean;
  txHash?: string;
  message?: string;
  error?: string;
}

export interface GetLobbiesResponse {
  success: boolean;
  lobbies?: Lobby[];
  error?: string;
}

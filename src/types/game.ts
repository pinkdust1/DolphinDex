export type GameType = 'chess' | 'checkers' | 'durak';

export type LobbyStatus = 'waiting' | 'playing' | 'finished';

export interface Lobby {
  id: string;
  creatorName: string;
  creatorAddress: string;
  playersCount: number;
  maxPlayers: number;
  status: LobbyStatus;
  gameTime: number; // in seconds
  createdAt: Date;
  bet?: number;
}

export interface GameInfo {
  id: GameType;
  name: string;
  nameRu: string;
  description: string;
  maxPlayers: number;
  icon: string;
}

export const GAMES: Record<GameType, GameInfo> = {
  chess: {
    id: 'chess',
    name: 'Chess',
    nameRu: 'Шахматы',
    description: 'Classic strategy board game',
    maxPlayers: 2,
    icon: '♟️',
  },
  checkers: {
    id: 'checkers',
    name: 'Checkers',
    nameRu: 'Шашки',
    description: 'Traditional board game for two players',
    maxPlayers: 2,
    icon: '⚫',
  },
  durak: {
    id: 'durak',
    name: 'Durak',
    nameRu: 'Дурак',
    description: 'Popular Russian card game',
    maxPlayers: 6,
    icon: '🃏',
  },
};

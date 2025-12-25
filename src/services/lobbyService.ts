import { Lobby, GameType, LobbyStatus } from '@/types/game';

// Mock data for demonstration
const generateMockLobbies = (gameType: GameType): Lobby[] => {
  const names = ['CryptoKing', 'XRPLMaster', 'DolphinPro', 'BlockchainBoss', 'TokenTrader', 'ChainChamp'];
  const maxPlayers = gameType === 'durak' ? 6 : 2;
  
  return Array.from({ length: 8 }, (_, i) => {
    const status: LobbyStatus = i < 2 ? 'waiting' : i < 6 ? 'playing' : 'finished';
    const playersCount = status === 'waiting' ? 1 : Math.floor(Math.random() * (maxPlayers - 1)) + 2;
    
    return {
      id: `LOBBY-${gameType.toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
      creatorName: names[Math.floor(Math.random() * names.length)],
      creatorAddress: `r${Math.random().toString(36).substring(2, 15)}...`,
      playersCount: Math.min(playersCount, maxPlayers),
      maxPlayers,
      status,
      gameTime: status === 'playing' ? Math.floor(Math.random() * 1800) + 60 : 0,
      createdAt: new Date(Date.now() - Math.random() * 3600000),
      bet: Math.floor(Math.random() * 100) + 10,
    };
  });
};

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const lobbyService = {
  async getLobbies(gameType: GameType): Promise<Lobby[]> {
    // Simulate network delay
    await delay(1500);
    return generateMockLobbies(gameType);
  },

  async createLobby(gameType: GameType, creatorAddress: string): Promise<Lobby> {
    await delay(500);
    const maxPlayers = gameType === 'durak' ? 6 : 2;
    
    return {
      id: `LOBBY-${gameType.toUpperCase()}-${Date.now()}`,
      creatorName: 'You',
      creatorAddress,
      playersCount: 1,
      maxPlayers,
      status: 'waiting',
      gameTime: 0,
      createdAt: new Date(),
      bet: 50,
    };
  },

  async joinLobby(lobbyId: string): Promise<boolean> {
    await delay(500);
    return true;
  },
};

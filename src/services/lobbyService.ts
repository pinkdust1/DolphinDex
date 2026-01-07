import { supabase } from '@/integrations/supabase/client';
import { 
  Lobby, 
  GameType, 
  CreateLobbyResponse, 
  JoinLobbyResponse, 
  CheckPaymentResponse,
  GetLobbiesResponse 
} from '@/types/game';

const USE_MOCK_DATA = true; // Toggle this to switch between mock and real data

// Mock data for demonstration when backend is not ready
const generateMockLobbies = (gameType: GameType): Lobby[] => {
  const names = ['CryptoKing', 'XRPLMaster', 'DolphinPro', 'BlockchainBoss', 'TokenTrader', 'ChainChamp'];
  const maxPlayers = gameType === 'durak' ? 6 : 2;
  
  const statuses: Array<'waiting_for_player' | 'waiting_for_payment' | 'in_game' | 'finished'> = [
    'waiting_for_player', 'waiting_for_player', 'waiting_for_payment', 
    'in_game', 'in_game', 'in_game', 'finished', 'finished'
  ];
  
  return Array.from({ length: 8 }, (_, i) => {
    const status = statuses[i];
    const creatorAddress = `r${Math.random().toString(36).substring(2, 15)}`;
    
    return {
      id: `${gameType}-${i + 1}`,
      lobby_code: `${gameType.toUpperCase().slice(0, 3)}${String(i + 1).padStart(5, '0')}`,
      game_type: gameType,
      creator_id: `creator-${i}`,
      opponent_id: status !== 'waiting_for_player' ? `opponent-${i}` : null,
      status,
      bet_amount: Math.floor(Math.random() * 50) + 5,
      max_players: maxPlayers,
      game_started_at: status === 'in_game' ? new Date(Date.now() - Math.random() * 1800000).toISOString() : null,
      game_ended_at: null,
      winner_id: null,
      game_state: null,
      created_at: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      updated_at: new Date().toISOString(),
      creator: {
        id: `creator-${i}`,
        wallet_address: creatorAddress,
        display_name: names[Math.floor(Math.random() * names.length)],
        avatar_url: null,
        total_wins: Math.floor(Math.random() * 50),
        total_losses: Math.floor(Math.random() * 30),
        total_draws: Math.floor(Math.random() * 10),
        total_xrp_won: Math.random() * 500,
        total_xrp_lost: Math.random() * 200,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };
  });
};

// Simulated API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const lobbyService = {
  // Get lobbies for a specific game type
  async getLobbies(gameType: GameType): Promise<Lobby[]> {
    if (USE_MOCK_DATA) {
      await delay(1000);
      return generateMockLobbies(gameType);
    }

    const { data, error } = await supabase.functions.invoke<GetLobbiesResponse>('game-lobby', {
      body: { action: 'get_lobbies', gameType }
    });

    if (error) throw error;
    if (!data?.success || !data.lobbies) throw new Error(data?.error || 'Failed to fetch lobbies');
    
    return data.lobbies;
  },

  // Create a new lobby
  async createLobby(
    gameType: GameType, 
    walletAddress: string, 
    betAmount: number,
    displayName?: string
  ): Promise<CreateLobbyResponse> {
    if (USE_MOCK_DATA) {
      await delay(500);
      const maxPlayers = gameType === 'durak' ? 6 : 2;
      const mockLobby: Lobby = {
        id: `new-${Date.now()}`,
        lobby_code: `${gameType.toUpperCase().slice(0, 3)}${Date.now().toString().slice(-5)}`,
        game_type: gameType,
        creator_id: 'mock-creator',
        opponent_id: null,
        status: 'waiting_for_player',
        bet_amount: betAmount,
        max_players: maxPlayers,
        game_started_at: null,
        game_ended_at: null,
        winner_id: null,
        game_state: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        creator: {
          id: 'mock-creator',
          wallet_address: walletAddress,
          display_name: displayName || 'You',
          avatar_url: null,
          total_wins: 0,
          total_losses: 0,
          total_draws: 0,
          total_xrp_won: 0,
          total_xrp_lost: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
      return { success: true, lobby: mockLobby, message: 'Lobby created successfully' };
    }

    const { data, error } = await supabase.functions.invoke<CreateLobbyResponse>('game-lobby', {
      body: { 
        action: 'create_lobby', 
        gameType, 
        walletAddress, 
        betAmount,
        displayName 
      }
    });

    if (error) throw error;
    return data || { success: false, error: 'No response from server' };
  },

  // Join an existing lobby (initiates payment if required)
  async joinLobby(
    lobbyId: string, 
    walletAddress: string,
    displayName?: string
  ): Promise<JoinLobbyResponse> {
    if (USE_MOCK_DATA) {
      await delay(500);
      // Simulate payment required
      return {
        success: true,
        requiresPayment: true,
        payment: {
          uuid: 'mock-uuid-123',
          qrUrl: 'https://xumm.app/sign/mock-qr.png',
          deepLink: 'xumm://sign/mock-payload',
          transactionId: 'mock-tx-123',
        },
        message: 'Sign the transaction to place your bet',
      };
    }

    const { data, error } = await supabase.functions.invoke<JoinLobbyResponse>('game-lobby', {
      body: { 
        action: 'join_lobby', 
        lobbyId, 
        walletAddress,
        displayName 
      }
    });

    if (error) throw error;
    return data || { success: false, requiresPayment: false, error: 'No response from server' };
  },

  // Check payment status
  async checkPayment(transactionId: string): Promise<CheckPaymentResponse> {
    if (USE_MOCK_DATA) {
      await delay(500);
      return {
        success: true,
        status: 'pending',
        message: 'Waiting for payment signature',
      };
    }

    const { data, error } = await supabase.functions.invoke<CheckPaymentResponse>('game-lobby', {
      body: { action: 'check_payment', transactionId }
    });

    if (error) throw error;
    return data || { success: false, status: 'failed', error: 'No response from server' };
  },

  // Cancel a lobby (creator only)
  async cancelLobby(lobbyId: string, walletAddress: string): Promise<{ success: boolean; message?: string; error?: string }> {
    if (USE_MOCK_DATA) {
      await delay(500);
      return { success: true, message: 'Lobby cancelled' };
    }

    const { data, error } = await supabase.functions.invoke('game-lobby', {
      body: { action: 'cancel_lobby', lobbyId, walletAddress }
    });

    if (error) throw error;
    return data || { success: false, error: 'No response from server' };
  },
};

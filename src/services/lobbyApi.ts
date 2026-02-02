// Lobby API service for Directus integration
import { supabase } from "@/integrations/supabase/client";

export interface LobbyData {
  id: number;
  id_lobby: string;
  player1: string | null;
  player2: string | null;
  cost: string;
  lobby_status: string;
  start_time: string;
  game_type?: string;
  date_created?: string;
}

interface DirectusResponse {
  data: LobbyData[];
  isMock?: boolean;
}

interface CreateLobbyResponse {
  success: boolean;
  data?: LobbyData;
  error?: string;
}

interface JoinLobbyResponse {
  success: boolean;
  data?: LobbyData;
  error?: string;
}

export async function fetchLobbies(gameType?: string): Promise<LobbyData[]> {
  const { data: funcData, error } = await supabase.functions.invoke("lobby-proxy", {
    body: gameType ? { game_type: gameType } : undefined
  });
  
  if (error) {
    throw new Error(`Failed to fetch lobbies: ${error.message}`);
  }
  
  const result = funcData as DirectusResponse;
  let lobbies = result.data || [];
  
  // Sort by date_created or id descending (newest first)
  // Server should already sort, but ensure client-side as fallback
  lobbies.sort((a, b) => {
    if (a.date_created && b.date_created) {
      return new Date(b.date_created).getTime() - new Date(a.date_created).getTime();
    }
    // Fallback: sort by id descending (higher id = newer)
    return b.id - a.id;
  });
  
  return lobbies;
}

export async function createLobby(player1: string, cost: number, gameType: string = "checkers"): Promise<CreateLobbyResponse> {
  const { data, error } = await supabase.functions.invoke("lobby-proxy", {
    body: {
      action: "create_lobby",
      player1,
      cost,
      game_type: gameType
    }
  });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return data as CreateLobbyResponse;
}

export async function joinLobby(lobbyId: number, player2: string, gameType: string = "checkers"): Promise<JoinLobbyResponse> {
  const { data, error } = await supabase.functions.invoke("lobby-proxy", {
    body: {
      action: "join_lobby",
      lobby_id: lobbyId,
      player2,
      game_type: gameType
    }
  });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return data as JoinLobbyResponse;
}

export function getPlayerCount(lobby: LobbyData): number {
  let count = 0;
  if (lobby.player1) count++;
  if (lobby.player2) count++;
  return count;
}

export function isLobbyAvailable(lobby: LobbyData): boolean {
  return lobby.lobby_status.toLowerCase() === "free";
}

export function formatWalletAddress(address: string | null): string {
  if (!address) return "—";
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

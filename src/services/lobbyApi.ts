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

export async function fetchLobbies(): Promise<LobbyData[]> {
  const { data: funcData, error } = await supabase.functions.invoke("lobby-proxy");
  
  if (error) {
    throw new Error(`Failed to fetch lobbies: ${error.message}`);
  }
  
  const result = funcData as DirectusResponse;
  return result.data || [];
}

export async function createLobby(player1: string, cost: number): Promise<CreateLobbyResponse> {
  const { data, error } = await supabase.functions.invoke("lobby-proxy", {
    body: {
      action: "create_lobby",
      player1,
      cost
    }
  });
  
  if (error) {
    return { success: false, error: error.message };
  }
  
  return data as CreateLobbyResponse;
}

export async function joinLobby(lobbyId: number, player2: string): Promise<JoinLobbyResponse> {
  const { data, error } = await supabase.functions.invoke("lobby-proxy", {
    body: {
      action: "join_lobby",
      lobby_id: lobbyId,
      player2
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

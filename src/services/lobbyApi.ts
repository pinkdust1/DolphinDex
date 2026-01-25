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
}

export async function fetchLobbies(): Promise<LobbyData[]> {
  const { data: funcData, error } = await supabase.functions.invoke("lobby-proxy");
  
  if (error) {
    throw new Error(`Failed to fetch lobbies: ${error.message}`);
  }
  
  const result = funcData as DirectusResponse;
  return result.data || [];
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

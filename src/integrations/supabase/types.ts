export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      game_history: {
        Row: {
          bet_amount: number
          final_game_state: Json | null
          game_duration_seconds: number | null
          game_type: Database["public"]["Enums"]["game_type"]
          id: string
          lobby_id: string
          moves_count: number | null
          played_at: string
          player1_id: string
          player1_result: Database["public"]["Enums"]["game_result"]
          player2_id: string
          player2_result: Database["public"]["Enums"]["game_result"]
          winner_id: string | null
        }
        Insert: {
          bet_amount: number
          final_game_state?: Json | null
          game_duration_seconds?: number | null
          game_type: Database["public"]["Enums"]["game_type"]
          id?: string
          lobby_id: string
          moves_count?: number | null
          played_at?: string
          player1_id: string
          player1_result: Database["public"]["Enums"]["game_result"]
          player2_id: string
          player2_result: Database["public"]["Enums"]["game_result"]
          winner_id?: string | null
        }
        Update: {
          bet_amount?: number
          final_game_state?: Json | null
          game_duration_seconds?: number | null
          game_type?: Database["public"]["Enums"]["game_type"]
          id?: string
          lobby_id?: string
          moves_count?: number | null
          played_at?: string
          player1_id?: string
          player1_result?: Database["public"]["Enums"]["game_result"]
          player2_id?: string
          player2_result?: Database["public"]["Enums"]["game_result"]
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_history_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_history_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_history_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_history_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      game_transactions: {
        Row: {
          amount: number
          confirmed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          lobby_id: string
          player_id: string
          signed_at: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          transaction_type: string
          updated_at: string
          xaman_payload_uuid: string | null
          xrpl_tx_hash: string | null
        }
        Insert: {
          amount: number
          confirmed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          lobby_id: string
          player_id: string
          signed_at?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          transaction_type: string
          updated_at?: string
          xaman_payload_uuid?: string | null
          xrpl_tx_hash?: string | null
        }
        Update: {
          amount?: number
          confirmed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          lobby_id?: string
          player_id?: string
          signed_at?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          transaction_type?: string
          updated_at?: string
          xaman_payload_uuid?: string | null
          xrpl_tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_transactions_lobby_id_fkey"
            columns: ["lobby_id"]
            isOneToOne: false
            referencedRelation: "lobbies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_transactions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      lobbies: {
        Row: {
          bet_amount: number
          created_at: string
          creator_id: string
          game_ended_at: string | null
          game_started_at: string | null
          game_state: Json | null
          game_type: Database["public"]["Enums"]["game_type"]
          id: string
          lobby_code: string
          max_players: number
          opponent_id: string | null
          status: Database["public"]["Enums"]["lobby_status"]
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          bet_amount: number
          created_at?: string
          creator_id: string
          game_ended_at?: string | null
          game_started_at?: string | null
          game_state?: Json | null
          game_type: Database["public"]["Enums"]["game_type"]
          id?: string
          lobby_code: string
          max_players?: number
          opponent_id?: string | null
          status?: Database["public"]["Enums"]["lobby_status"]
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          bet_amount?: number
          created_at?: string
          creator_id?: string
          game_ended_at?: string | null
          game_started_at?: string | null
          game_state?: Json | null
          game_type?: Database["public"]["Enums"]["game_type"]
          id?: string
          lobby_code?: string
          max_players?: number
          opponent_id?: string | null
          status?: Database["public"]["Enums"]["lobby_status"]
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lobbies_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lobbies_opponent_id_fkey"
            columns: ["opponent_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lobbies_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          total_draws: number | null
          total_losses: number | null
          total_wins: number | null
          total_xrp_lost: number | null
          total_xrp_won: number | null
          updated_at: string
          wallet_address: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          total_draws?: number | null
          total_losses?: number | null
          total_wins?: number | null
          total_xrp_lost?: number | null
          total_xrp_won?: number | null
          updated_at?: string
          wallet_address: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          total_draws?: number | null
          total_losses?: number | null
          total_wins?: number | null
          total_xrp_lost?: number | null
          total_xrp_won?: number | null
          updated_at?: string
          wallet_address?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      game_result: "win" | "loss" | "draw" | "cancelled"
      game_type: "chess" | "checkers" | "durak"
      lobby_status:
        | "waiting_for_player"
        | "waiting_for_payment"
        | "in_game"
        | "finished"
        | "cancelled"
      transaction_status:
        | "pending"
        | "signed"
        | "confirmed"
        | "failed"
        | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      game_result: ["win", "loss", "draw", "cancelled"],
      game_type: ["chess", "checkers", "durak"],
      lobby_status: [
        "waiting_for_player",
        "waiting_for_payment",
        "in_game",
        "finished",
        "cancelled",
      ],
      transaction_status: [
        "pending",
        "signed",
        "confirmed",
        "failed",
        "expired",
      ],
    },
  },
} as const

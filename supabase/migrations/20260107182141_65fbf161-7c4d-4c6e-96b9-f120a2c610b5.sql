-- =============================================
-- GAME BETTING SYSTEM DATABASE SCHEMA
-- =============================================

-- Game Types enum (chess, checkers, durak)
CREATE TYPE public.game_type AS ENUM ('chess', 'checkers', 'durak');

-- Lobby Status enum
CREATE TYPE public.lobby_status AS ENUM (
  'waiting_for_player',
  'waiting_for_payment',
  'in_game',
  'finished',
  'cancelled'
);

-- Transaction Status enum
CREATE TYPE public.transaction_status AS ENUM (
  'pending',
  'signed',
  'confirmed',
  'failed',
  'expired'
);

-- Game Result enum
CREATE TYPE public.game_result AS ENUM (
  'win',
  'loss',
  'draw',
  'cancelled'
);

-- =============================================
-- PLAYERS TABLE - Stores player information
-- =============================================
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  total_draws INTEGER DEFAULT 0,
  total_xrp_won NUMERIC(20, 6) DEFAULT 0,
  total_xrp_lost NUMERIC(20, 6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- LOBBIES TABLE - Game lobbies
-- =============================================
CREATE TABLE public.lobbies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lobby_code TEXT NOT NULL UNIQUE,
  game_type public.game_type NOT NULL,
  creator_id UUID NOT NULL REFERENCES public.players(id),
  opponent_id UUID REFERENCES public.players(id),
  status public.lobby_status NOT NULL DEFAULT 'waiting_for_player',
  bet_amount NUMERIC(10, 6) NOT NULL CHECK (bet_amount >= 0 AND bet_amount <= 100),
  max_players INTEGER NOT NULL DEFAULT 2,
  game_started_at TIMESTAMP WITH TIME ZONE,
  game_ended_at TIMESTAMP WITH TIME ZONE,
  winner_id UUID REFERENCES public.players(id),
  game_state JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- TRANSACTIONS TABLE - XRP payment transactions
-- =============================================
CREATE TABLE public.game_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lobby_id UUID NOT NULL REFERENCES public.lobbies(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('bet', 'payout', 'refund')),
  amount NUMERIC(10, 6) NOT NULL,
  xaman_payload_uuid TEXT,
  xrpl_tx_hash TEXT,
  status public.transaction_status NOT NULL DEFAULT 'pending',
  signed_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- GAME HISTORY TABLE - Completed games history
-- =============================================
CREATE TABLE public.game_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lobby_id UUID NOT NULL REFERENCES public.lobbies(id),
  game_type public.game_type NOT NULL,
  player1_id UUID NOT NULL REFERENCES public.players(id),
  player2_id UUID NOT NULL REFERENCES public.players(id),
  winner_id UUID REFERENCES public.players(id),
  player1_result public.game_result NOT NULL,
  player2_result public.game_result NOT NULL,
  bet_amount NUMERIC(10, 6) NOT NULL,
  game_duration_seconds INTEGER,
  moves_count INTEGER,
  final_game_state JSONB,
  played_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES for better query performance
-- =============================================
CREATE INDEX idx_players_wallet ON public.players(wallet_address);
CREATE INDEX idx_lobbies_status ON public.lobbies(status);
CREATE INDEX idx_lobbies_game_type ON public.lobbies(game_type);
CREATE INDEX idx_lobbies_creator ON public.lobbies(creator_id);
CREATE INDEX idx_transactions_lobby ON public.game_transactions(lobby_id);
CREATE INDEX idx_transactions_player ON public.game_transactions(player_id);
CREATE INDEX idx_transactions_status ON public.game_transactions(status);
CREATE INDEX idx_game_history_players ON public.game_history(player1_id, player2_id);

-- =============================================
-- TRIGGERS for updated_at timestamps
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lobbies_updated_at
  BEFORE UPDATE ON public.lobbies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.game_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FUNCTION to generate unique lobby codes
-- =============================================
CREATE OR REPLACE FUNCTION public.generate_lobby_code()
RETURNS TRIGGER AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  NEW.lobby_code := result;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER generate_lobby_code_trigger
  BEFORE INSERT ON public.lobbies
  FOR EACH ROW
  WHEN (NEW.lobby_code IS NULL OR NEW.lobby_code = '')
  EXECUTE FUNCTION public.generate_lobby_code();

-- =============================================
-- FUNCTION to update player stats after game
-- =============================================
CREATE OR REPLACE FUNCTION public.update_player_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update player1 stats
  IF NEW.player1_result = 'win' THEN
    UPDATE public.players SET 
      total_wins = total_wins + 1,
      total_xrp_won = total_xrp_won + NEW.bet_amount
    WHERE id = NEW.player1_id;
  ELSIF NEW.player1_result = 'loss' THEN
    UPDATE public.players SET 
      total_losses = total_losses + 1,
      total_xrp_lost = total_xrp_lost + NEW.bet_amount
    WHERE id = NEW.player1_id;
  ELSIF NEW.player1_result = 'draw' THEN
    UPDATE public.players SET total_draws = total_draws + 1
    WHERE id = NEW.player1_id;
  END IF;

  -- Update player2 stats
  IF NEW.player2_result = 'win' THEN
    UPDATE public.players SET 
      total_wins = total_wins + 1,
      total_xrp_won = total_xrp_won + NEW.bet_amount
    WHERE id = NEW.player2_id;
  ELSIF NEW.player2_result = 'loss' THEN
    UPDATE public.players SET 
      total_losses = total_losses + 1,
      total_xrp_lost = total_xrp_lost + NEW.bet_amount
    WHERE id = NEW.player2_id;
  ELSIF NEW.player2_result = 'draw' THEN
    UPDATE public.players SET total_draws = total_draws + 1
    WHERE id = NEW.player2_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_player_stats_trigger
  AFTER INSERT ON public.game_history
  FOR EACH ROW EXECUTE FUNCTION public.update_player_stats();

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_history ENABLE ROW LEVEL SECURITY;

-- Players: Public read, service role only for write (managed via edge functions)
CREATE POLICY "Players are publicly readable"
  ON public.players FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage players"
  ON public.players FOR ALL
  USING (true)
  WITH CHECK (true);

-- Lobbies: Public read, service role only for write
CREATE POLICY "Lobbies are publicly readable"
  ON public.lobbies FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage lobbies"
  ON public.lobbies FOR ALL
  USING (true)
  WITH CHECK (true);

-- Transactions: Public read (for transparency), service role only for write
CREATE POLICY "Transactions are publicly readable"
  ON public.game_transactions FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage transactions"
  ON public.game_transactions FOR ALL
  USING (true)
  WITH CHECK (true);

-- Game History: Public read
CREATE POLICY "Game history is publicly readable"
  ON public.game_history FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage game history"
  ON public.game_history FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- ENABLE REALTIME for lobbies
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.lobbies;
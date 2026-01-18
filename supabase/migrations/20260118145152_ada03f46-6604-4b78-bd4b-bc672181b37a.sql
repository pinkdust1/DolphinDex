-- Create a public view for player stats that excludes wallet addresses
-- This allows leaderboards to function while protecting sensitive wallet data
CREATE VIEW public.players_public
WITH (security_invoker=on) AS
  SELECT 
    id,
    display_name,
    avatar_url,
    total_wins,
    total_losses,
    total_draws,
    total_xrp_won,
    total_xrp_lost,
    created_at
  FROM public.players;
  -- wallet_address is intentionally excluded to prevent identity correlation

-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Players are publicly readable" ON public.players;

-- Create a restrictive policy that denies direct SELECT access
-- Users must query through the players_public view instead
CREATE POLICY "No direct public access to players"
  ON public.players
  FOR SELECT
  TO anon, authenticated
  USING (false);

-- Grant SELECT on the view to allow public leaderboard access
GRANT SELECT ON public.players_public TO anon, authenticated;
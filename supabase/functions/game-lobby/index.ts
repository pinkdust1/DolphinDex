import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const xamanApiKey = Deno.env.get('XAMAN_API_KEY')!;
const xamanApiSecret = Deno.env.get('XAMAN_API_SECRET')!;

// Escrow wallet address for holding bets (should be configured)
const ESCROW_WALLET = 'rEscrowGameBetWallet'; // TODO: Replace with actual escrow wallet

// Helper function to convert string to hex
function stringToHex(str: string): string {
  return Array.from(new TextEncoder().encode(str))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

interface CreateLobbyRequest {
  action: 'create_lobby';
  walletAddress: string;
  gameType: 'chess' | 'checkers' | 'durak';
  betAmount: number;
  displayName?: string;
}

interface JoinLobbyRequest {
  action: 'join_lobby';
  walletAddress: string;
  lobbyId: string;
  displayName?: string;
}

interface CheckPaymentRequest {
  action: 'check_payment';
  transactionId: string;
}

interface GetLobbiesRequest {
  action: 'get_lobbies';
  gameType: 'chess' | 'checkers' | 'durak';
}

interface CancelLobbyRequest {
  action: 'cancel_lobby';
  lobbyId: string;
  walletAddress: string;
}

type RequestBody = CreateLobbyRequest | JoinLobbyRequest | CheckPaymentRequest | GetLobbiesRequest | CancelLobbyRequest;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body: RequestBody = await req.json();
    console.log('Game lobby request:', body.action);

    // Get or create player
    async function getOrCreatePlayer(walletAddress: string, displayName?: string) {
      // Try to find existing player
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (existingPlayer) {
        return existingPlayer;
      }

      // Create new player
      const { data: newPlayer, error } = await supabase
        .from('players')
        .insert({
          wallet_address: walletAddress,
          display_name: displayName || `Player_${walletAddress.slice(-6)}`,
        })
        .select()
        .single();

      if (error) throw error;
      return newPlayer;
    }

    // Create Xaman payment payload
    async function createPaymentPayload(amount: number, destination: string, memo?: string) {
      const payload = {
        txjson: {
          TransactionType: "Payment",
          Destination: destination,
          Amount: String(Math.floor(amount * 1000000)), // Convert XRP to drops
          ...(memo && {
            Memos: [{
              Memo: {
                MemoData: stringToHex(memo),
              }
            }]
          })
        },
        options: {
          submit: true,
          expire: 300, // 5 minutes to sign
        }
      };

      const response = await fetch('https://xumm.app/api/v1/platform/payload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': xamanApiKey,
          'X-API-Secret': xamanApiSecret,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Xaman API error:', error);
        throw new Error(`Failed to create payment payload: ${response.status}`);
      }

      return await response.json();
    }

    // Check Xaman payload status
    async function checkPayloadStatus(uuid: string) {
      const response = await fetch(`https://xumm.app/api/v1/platform/payload/${uuid}`, {
        headers: {
          'X-API-Key': xamanApiKey,
          'X-API-Secret': xamanApiSecret,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check payload status: ${response.status}`);
      }

      return await response.json();
    }

    // ACTION: Get lobbies
    if (body.action === 'get_lobbies') {
      const { data: lobbies, error } = await supabase
        .from('lobbies')
        .select(`
          *,
          creator:creator_id(id, wallet_address, display_name),
          opponent:opponent_id(id, wallet_address, display_name)
        `)
        .eq('game_type', body.gameType)
        .in('status', ['waiting_for_player', 'waiting_for_payment', 'in_game'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, lobbies }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: Create lobby
    if (body.action === 'create_lobby') {
      const { walletAddress, gameType, betAmount, displayName } = body;

      // Validate bet amount
      if (betAmount < 0 || betAmount > 100) {
        throw new Error('Bet amount must be between 0 and 100 XRP');
      }

      // Get or create player
      const player = await getOrCreatePlayer(walletAddress, displayName);

      // Determine max players based on game type
      const maxPlayers = gameType === 'durak' ? 6 : 2;

      // Create lobby
      const { data: lobby, error: lobbyError } = await supabase
        .from('lobbies')
        .insert({
          game_type: gameType,
          creator_id: player.id,
          bet_amount: betAmount,
          max_players: maxPlayers,
          status: 'waiting_for_player',
        })
        .select(`
          *,
          creator:creator_id(id, wallet_address, display_name)
        `)
        .single();

      if (lobbyError) throw lobbyError;

      console.log('Lobby created:', lobby.lobby_code);

      return new Response(
        JSON.stringify({ 
          success: true, 
          lobby,
          message: 'Lobby created successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: Join lobby (initiates payment)
    if (body.action === 'join_lobby') {
      const { walletAddress, lobbyId, displayName } = body;

      // Get or create player
      const player = await getOrCreatePlayer(walletAddress, displayName);

      // Get lobby
      const { data: lobby, error: lobbyError } = await supabase
        .from('lobbies')
        .select('*, creator:creator_id(wallet_address)')
        .eq('id', lobbyId)
        .single();

      if (lobbyError || !lobby) {
        throw new Error('Lobby not found');
      }

      if (lobby.status !== 'waiting_for_player') {
        throw new Error('Lobby is not available for joining');
      }

      if (lobby.creator_id === player.id) {
        throw new Error('Cannot join your own lobby');
      }

      // Create payment payload if there's a bet
      let paymentData = null;
      if (lobby.bet_amount > 0) {
        const payloadResponse = await createPaymentPayload(
          lobby.bet_amount,
          ESCROW_WALLET,
          `Game bet: ${lobby.lobby_code}`
        );

        // Create transaction record
        const { data: transaction, error: txError } = await supabase
          .from('game_transactions')
          .insert({
            lobby_id: lobby.id,
            player_id: player.id,
            transaction_type: 'bet',
            amount: lobby.bet_amount,
            xaman_payload_uuid: payloadResponse.uuid,
            status: 'pending',
          })
          .select()
          .single();

        if (txError) throw txError;

        // Update lobby status
        await supabase
          .from('lobbies')
          .update({ 
            status: 'waiting_for_payment',
            opponent_id: player.id,
          })
          .eq('id', lobbyId);

        paymentData = {
          uuid: payloadResponse.uuid,
          qrUrl: payloadResponse.refs.qr_png,
          deepLink: payloadResponse.next.always,
          transactionId: transaction.id,
        };
      } else {
        // No bet - directly join and start game
        await supabase
          .from('lobbies')
          .update({ 
            status: 'in_game',
            opponent_id: player.id,
            game_started_at: new Date().toISOString(),
          })
          .eq('id', lobbyId);
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          requiresPayment: lobby.bet_amount > 0,
          payment: paymentData,
          message: lobby.bet_amount > 0 
            ? 'Sign the transaction to place your bet'
            : 'Joined lobby successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: Check payment status
    if (body.action === 'check_payment') {
      const { transactionId } = body;

      // Get transaction
      const { data: transaction, error: txError } = await supabase
        .from('game_transactions')
        .select('*, lobby:lobby_id(*)')
        .eq('id', transactionId)
        .single();

      if (txError || !transaction) {
        throw new Error('Transaction not found');
      }

      if (transaction.status !== 'pending') {
        return new Response(
          JSON.stringify({ 
            success: true, 
            status: transaction.status,
            confirmed: transaction.status === 'confirmed'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check Xaman payload status
      const payloadStatus = await checkPayloadStatus(transaction.xaman_payload_uuid);

      if (payloadStatus.meta.signed) {
        // Update transaction as signed
        await supabase
          .from('game_transactions')
          .update({
            status: 'confirmed',
            xrpl_tx_hash: payloadStatus.response?.txid || null,
            signed_at: new Date().toISOString(),
            confirmed_at: new Date().toISOString(),
          })
          .eq('id', transactionId);

        // Start the game
        await supabase
          .from('lobbies')
          .update({
            status: 'in_game',
            game_started_at: new Date().toISOString(),
          })
          .eq('id', transaction.lobby_id);

        return new Response(
          JSON.stringify({ 
            success: true, 
            status: 'confirmed',
            confirmed: true,
            txHash: payloadStatus.response?.txid,
            message: 'Payment confirmed! Game starting...'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (payloadStatus.meta.expired) {
        await supabase
          .from('game_transactions')
          .update({ status: 'expired' })
          .eq('id', transactionId);

        // Reset lobby status
        await supabase
          .from('lobbies')
          .update({ 
            status: 'waiting_for_player',
            opponent_id: null,
          })
          .eq('id', transaction.lobby_id);

        return new Response(
          JSON.stringify({ 
            success: false, 
            status: 'expired',
            message: 'Payment request expired'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          status: 'pending',
          message: 'Waiting for payment signature'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ACTION: Cancel lobby
    if (body.action === 'cancel_lobby') {
      const { lobbyId, walletAddress } = body;

      // Get lobby
      const { data: lobby, error: lobbyError } = await supabase
        .from('lobbies')
        .select('*, creator:creator_id(wallet_address)')
        .eq('id', lobbyId)
        .single();

      if (lobbyError || !lobby) {
        throw new Error('Lobby not found');
      }

      // Verify ownership
      if (lobby.creator.wallet_address !== walletAddress) {
        throw new Error('Only the creator can cancel this lobby');
      }

      if (lobby.status !== 'waiting_for_player') {
        throw new Error('Cannot cancel lobby in current state');
      }

      // Cancel lobby
      await supabase
        .from('lobbies')
        .update({ status: 'cancelled' })
        .eq('id', lobbyId);

      return new Response(
        JSON.stringify({ success: true, message: 'Lobby cancelled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Error in game-lobby function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

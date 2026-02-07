import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Destination wallet for all bets
const ESCROW_WALLET = "r9Z9NhRT2Y1pxFJ2hpQuzrXCwqmDKcC4dP";

// XRPL node for transaction verification
const XRPL_NODE = "https://xrplcluster.com";

// Directus API URL
const DIRECTUS_URL = "https://admin.asapcase.shop";

// Allowed actions
const ALLOWED_ACTIONS = ['create_payment', 'check_payment', 'verify_transaction'];

// UUID format validation
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// XRPL transaction hash pattern
const TX_HASH_PATTERN = /^[A-F0-9]{64}$/i;

// Convert XRP to drops (1 XRP = 1,000,000 drops)
function xrpToDrops(xrp: number): string {
  return String(Math.floor(xrp * 1000000));
}

// Get Directus headers
function getDirectusHeaders(): Record<string, string> {
  const token = Deno.env.get('DIRECTUS_API_TOKEN');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Get lobby collection name based on game type
function getLobbyCollection(gameType: string): string {
  return gameType === 'chess' ? 'chess_loby_data' : 'loby_data';
}

// Create payment record in Directus
async function createPaymentRecord(
  lobbyId: string,
  gameType: string,
  playerWallet: string,
  playerRole: string,
  amount: number,
  xamanUuid: string
): Promise<{ success: boolean; recordId?: number; error?: string }> {
  try {
    const response = await fetch(`${DIRECTUS_URL}/items/game_payments`, {
      method: 'POST',
      headers: getDirectusHeaders(),
      body: JSON.stringify({
        lobby_id: lobbyId,
        game_type: gameType,
        player_wallet: playerWallet,
        player_role: playerRole,
        amount: amount,
        xaman_uuid: xamanUuid,
        status: 'pending'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to create payment record:', response.status, errorText);
      return { success: false, error: 'Failed to create payment record' };
    }

    const data = await response.json();
    console.log('Created payment record:', data.data?.id);
    return { success: true, recordId: data.data?.id };
  } catch (error) {
    console.error('Error creating payment record:', error);
    return { success: false, error: 'Database error' };
  }
}

// Update payment record status
async function updatePaymentRecord(
  xamanUuid: string,
  status: string,
  txHash?: string,
  errorMessage?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // First find the record by xaman_uuid
    const findResponse = await fetch(
      `${DIRECTUS_URL}/items/game_payments?filter[xaman_uuid][_eq]=${encodeURIComponent(xamanUuid)}`,
      { headers: getDirectusHeaders() }
    );

    if (!findResponse.ok) {
      return { success: false, error: 'Failed to find payment record' };
    }

    const findData = await findResponse.json();
    if (!findData.data || findData.data.length === 0) {
      console.log('Payment record not found for UUID:', xamanUuid);
      return { success: false, error: 'Payment record not found' };
    }

    const recordId = findData.data[0].id;

    // Update the record
    const updateData: Record<string, string | undefined> = { status };
    if (txHash) updateData.tx_hash = txHash;
    if (errorMessage) updateData.error_message = errorMessage;

    const updateResponse = await fetch(`${DIRECTUS_URL}/items/game_payments/${recordId}`, {
      method: 'PATCH',
      headers: getDirectusHeaders(),
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('Failed to update payment record:', updateResponse.status, errorText);
      return { success: false, error: 'Failed to update payment record' };
    }

    console.log('Updated payment record:', recordId, 'status:', status);
    return { success: true };
  } catch (error) {
    console.error('Error updating payment record:', error);
    return { success: false, error: 'Database error' };
  }
}

// Update or create lobby payment status
async function updateLobbyPaymentStatus(
  lobbyId: string,
  gameType: string,
  playerRole: string,
  txHash: string,
  amount: number
): Promise<{ success: boolean; bothPaid?: boolean; error?: string }> {
  try {
    // Check if lobby_payment_status exists for this lobby
    const findResponse = await fetch(
      `${DIRECTUS_URL}/items/lobby_payment_status?filter[lobby_id][_eq]=${encodeURIComponent(lobbyId)}&filter[game_type][_eq]=${encodeURIComponent(gameType)}`,
      { headers: getDirectusHeaders() }
    );

    if (!findResponse.ok) {
      return { success: false, error: 'Failed to check lobby payment status' };
    }

    const findData = await findResponse.json();
    const existingRecord = findData.data?.[0];

    if (existingRecord) {
      // Update existing record
      const updateData: Record<string, string | number | boolean> = {};
      
      if (playerRole === 'creator') {
        updateData.player1_paid = true;
        updateData.player1_tx_hash = txHash;
      } else {
        updateData.player2_paid = true;
        updateData.player2_tx_hash = txHash;
      }
      
      // Calculate new total pot
      const currentPot = parseFloat(existingRecord.total_pot) || 0;
      updateData.total_pot = currentPot + amount;

      // Check if both players have paid
      const player1Paid = playerRole === 'creator' ? true : existingRecord.player1_paid === true || existingRecord.player1_paid === "true";
      const player2Paid = playerRole === 'joiner' ? true : existingRecord.player2_paid === true || existingRecord.player2_paid === "true";
      const bothPaid = player1Paid && player2Paid;

      if (bothPaid) {
        updateData.game_started = true;
      }

      const updateResponse = await fetch(`${DIRECTUS_URL}/items/lobby_payment_status/${existingRecord.id}`, {
        method: 'PATCH',
        headers: getDirectusHeaders(),
        body: JSON.stringify(updateData)
      });

      if (!updateResponse.ok) {
        return { success: false, error: 'Failed to update lobby payment status' };
      }

      console.log('Updated lobby payment status:', existingRecord.id, 'bothPaid:', bothPaid);
      return { success: true, bothPaid };
    } else {
      // Create new record
      const createData: Record<string, string | number | boolean> = {
        lobby_id: lobbyId,
        game_type: gameType,
        player1_paid: playerRole === 'creator',
        player2_paid: playerRole === 'joiner',
        total_pot: amount,
        game_started: false
      };

      if (playerRole === 'creator') {
        createData.player1_tx_hash = txHash;
      } else {
        createData.player2_tx_hash = txHash;
      }

      const createResponse = await fetch(`${DIRECTUS_URL}/items/lobby_payment_status`, {
        method: 'POST',
        headers: getDirectusHeaders(),
        body: JSON.stringify(createData)
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('Failed to create lobby payment status:', createResponse.status, errorText);
        return { success: false, error: 'Failed to create lobby payment status' };
      }

      console.log('Created lobby payment status for lobby:', lobbyId);
      return { success: true, bothPaid: false };
    }
  } catch (error) {
    console.error('Error updating lobby payment status:', error);
    return { success: false, error: 'Database error' };
  }
}

// Update lobby collection with payment status
async function updateLobbyCollection(
  lobbyId: string,
  gameType: string,
  playerRole: string,
  paymentStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const collection = getLobbyCollection(gameType);
    
    // Find lobby by id_lobby
    const findResponse = await fetch(
      `${DIRECTUS_URL}/items/${collection}?filter[id_lobby][_eq]=${encodeURIComponent(lobbyId)}`,
      { headers: getDirectusHeaders() }
    );

    if (!findResponse.ok) {
      return { success: false, error: 'Failed to find lobby' };
    }

    const findData = await findResponse.json();
    if (!findData.data || findData.data.length === 0) {
      console.log('Lobby not found:', lobbyId);
      return { success: false, error: 'Lobby not found' };
    }

    const recordId = findData.data[0].id;
    const updateData: Record<string, string | boolean> = {
      payment_required: true
    };

    if (playerRole === 'creator') {
      updateData.player1_payment_status = paymentStatus;
    } else {
      updateData.player2_payment_status = paymentStatus;
    }

    const updateResponse = await fetch(`${DIRECTUS_URL}/items/${collection}/${recordId}`, {
      method: 'PATCH',
      headers: getDirectusHeaders(),
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      return { success: false, error: 'Failed to update lobby' };
    }

    console.log('Updated lobby collection:', collection, recordId, 'player:', playerRole, 'status:', paymentStatus);
    return { success: true };
  } catch (error) {
    console.error('Error updating lobby collection:', error);
    return { success: false, error: 'Database error' };
  }
}

// Verify transaction on XRPL
async function verifyXrplTransaction(txHash: string, expectedAmount: number, expectedSender: string): Promise<{
  verified: boolean;
  error?: string;
  txData?: {
    sender: string;
    destination: string;
    amount: string;
    status: string;
    validated: boolean;
  };
}> {
  try {
    const response = await fetch(XRPL_NODE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'tx',
        params: [{
          transaction: txHash,
          binary: false
        }]
      })
    });

    if (!response.ok) {
      return { verified: false, error: 'Failed to fetch transaction from XRPL' };
    }

    const data = await response.json();
    
    if (data.result.status !== 'success' || !data.result.validated) {
      return { verified: false, error: 'Transaction not validated on XRPL' };
    }

    const tx = data.result;
    
    // Check transaction type
    if (tx.TransactionType !== 'Payment') {
      return { verified: false, error: 'Invalid transaction type' };
    }

    // Check destination
    if (tx.Destination !== ESCROW_WALLET) {
      return { verified: false, error: 'Invalid destination address' };
    }

    // Check sender
    if (tx.Account !== expectedSender) {
      return { verified: false, error: 'Sender address does not match' };
    }

    // Check amount (in drops)
    const expectedDrops = xrpToDrops(expectedAmount);
    const actualAmount = typeof tx.Amount === 'string' ? tx.Amount : tx.Amount?.value;
    
    if (actualAmount !== expectedDrops) {
      return { 
        verified: false, 
        error: `Amount mismatch: expected ${expectedDrops} drops, got ${actualAmount}` 
      };
    }

    // Check transaction result
    if (tx.meta?.TransactionResult !== 'tesSUCCESS') {
      return { 
        verified: false, 
        error: `Transaction failed: ${tx.meta?.TransactionResult}` 
      };
    }

    return {
      verified: true,
      txData: {
        sender: tx.Account,
        destination: tx.Destination,
        amount: actualAmount,
        status: tx.meta?.TransactionResult,
        validated: tx.validated
      }
    };
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return { verified: false, error: 'Failed to verify transaction' };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action } = body;

    if (!action || typeof action !== 'string' || !ALLOWED_ACTIONS.includes(action)) {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('XAMAN_API_KEY');
    const apiSecret = Deno.env.get('XAMAN_API_SECRET');

    if (!apiKey || !apiSecret) {
      console.error('XAMAN API credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Service configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CREATE PAYMENT - Create a payment request via Xaman
    if (action === 'create_payment') {
      const { amount, sender, lobby_id, game_type, player_role } = body;

      // Validate inputs
      if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 100) {
        return new Response(
          JSON.stringify({ error: 'Amount must be between 0.01 and 100 XRP' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!sender || typeof sender !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Sender address is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!lobby_id) {
        return new Response(
          JSON.stringify({ error: 'Lobby ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!player_role || !['creator', 'joiner'].includes(player_role)) {
        return new Response(
          JSON.stringify({ error: 'Valid player role is required (creator/joiner)' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Creating payment request: ${amount} XRP from ${sender} for lobby ${lobby_id} (${player_role})`);

      // Create Payment transaction payload
      const payload = {
        txjson: {
          TransactionType: "Payment",
          Destination: ESCROW_WALLET,
          Amount: xrpToDrops(amount),
        },
        custom_meta: {
          instruction: `Payment of ${amount} XRP for game bet`,
          blob: JSON.stringify({
            lobby_id,
            game_type: game_type || 'checkers',
            player_role,
            amount,
            timestamp: Date.now()
          })
        }
      };

      const response = await fetch('https://xumm.app/api/v1/platform/payload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
          'X-API-Secret': apiSecret,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('XAMAN API error:', response.status, errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to create payment request' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      console.log('Payment payload created:', data.uuid);

      // Save payment record to Directus
      const paymentRecord = await createPaymentRecord(
        lobby_id,
        game_type || 'checkers',
        sender,
        player_role,
        amount,
        data.uuid
      );

      if (!paymentRecord.success) {
        console.error('Failed to save payment record, but continuing...');
      }

      // Update lobby with pending payment status
      await updateLobbyCollection(lobby_id, game_type || 'checkers', player_role, 'pending');

      return new Response(
        JSON.stringify({
          success: true,
          uuid: data.uuid,
          qrUrl: data.refs.qr_png,
          deepLink: data.next.always,
          amount,
          destination: ESCROW_WALLET,
          paymentRecordId: paymentRecord.recordId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // CHECK PAYMENT - Check if payment was signed
    if (action === 'check_payment') {
      const { uuid, expected_amount, expected_sender, lobby_id, game_type, player_role } = body;

      if (!uuid || typeof uuid !== 'string' || !UUID_PATTERN.test(uuid)) {
        return new Response(
          JSON.stringify({ error: 'Invalid UUID format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const response = await fetch(`https://xumm.app/api/v1/platform/payload/${encodeURIComponent(uuid)}`, {
        headers: {
          'X-API-Key': apiKey,
          'X-API-Secret': apiSecret,
        },
      });

      if (!response.ok) {
        console.error('XAMAN API check error:', response.status);
        return new Response(
          JSON.stringify({ error: 'Failed to check payment status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      console.log('Payment status:', {
        signed: data.meta.signed,
        expired: data.meta.expired,
        resolved: data.meta.resolved,
        uuid
      });

      // If signed, verify the transaction on XRPL
      if (data.meta.signed && data.response?.txid) {
        const txHash = data.response.txid;
        console.log('Verifying transaction on XRPL:', txHash);

        const verification = await verifyXrplTransaction(
          txHash,
          expected_amount,
          expected_sender
        );

        if (verification.verified && lobby_id && game_type && player_role) {
          // Update payment record to verified
          await updatePaymentRecord(uuid, 'verified', txHash);
          
          // Update lobby payment status
          const lobbyStatus = await updateLobbyPaymentStatus(
            lobby_id,
            game_type,
            player_role,
            txHash,
            expected_amount
          );

          // Update lobby collection
          await updateLobbyCollection(lobby_id, game_type, player_role, 'verified');

          return new Response(
            JSON.stringify({
              signed: true,
              expired: data.meta.expired,
              resolved: data.meta.resolved,
              txHash,
              account: data.response.account,
              verified: true,
              txData: verification.txData,
              bothPlayersPaid: lobbyStatus.bothPaid,
              gameCanStart: lobbyStatus.bothPaid
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else if (!verification.verified && lobby_id && player_role) {
          // Update payment record to failed
          await updatePaymentRecord(uuid, 'failed', txHash, verification.error);
          await updateLobbyCollection(lobby_id, game_type || 'checkers', player_role, 'failed');
        }

        return new Response(
          JSON.stringify({
            signed: true,
            expired: data.meta.expired,
            resolved: data.meta.resolved,
            txHash,
            account: data.response.account,
            verified: verification.verified,
            verificationError: verification.error,
            txData: verification.txData
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if rejected or expired
      if (data.meta.resolved && !data.meta.signed) {
        await updatePaymentRecord(uuid, 'failed', undefined, 'Payment rejected by user');
        if (lobby_id && player_role) {
          await updateLobbyCollection(lobby_id, game_type || 'checkers', player_role, 'rejected');
        }
      } else if (data.meta.expired) {
        await updatePaymentRecord(uuid, 'failed', undefined, 'Payment expired');
        if (lobby_id && player_role) {
          await updateLobbyCollection(lobby_id, game_type || 'checkers', player_role, 'expired');
        }
      }

      return new Response(
        JSON.stringify({
          signed: data.meta.signed,
          expired: data.meta.expired,
          resolved: data.meta.resolved,
          rejected: data.meta.resolved && !data.meta.signed,
          account: data.response?.account || null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // VERIFY TRANSACTION - Verify a specific transaction hash
    if (action === 'verify_transaction') {
      const { tx_hash, expected_amount, expected_sender } = body;

      if (!tx_hash || !TX_HASH_PATTERN.test(tx_hash)) {
        return new Response(
          JSON.stringify({ error: 'Invalid transaction hash format' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!expected_amount || typeof expected_amount !== 'number') {
        return new Response(
          JSON.stringify({ error: 'Expected amount is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!expected_sender || typeof expected_sender !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Expected sender is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const verification = await verifyXrplTransaction(tx_hash, expected_amount, expected_sender);

      return new Response(
        JSON.stringify(verification),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in xrp-payment function:', error);
    return new Response(
      JSON.stringify({ error: 'Payment service error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DIRECTUS_URL = 'https://admin.asapcase.shop';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface DirectusUser {
  id?: number;
  id_telergram: string;
  name: string;
  username: string;
  photo_url: string;
  balance?: string;
  inventory?: string;
  tg_wallet?: string;
  processed_tx_hashes?: string;
  total_deposited?: string;
  last_deposit_at?: string;
  deposit_count?: string;
  updated_balance?: string;
  status?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const DIRECTUS_API_TOKEN = Deno.env.get('DIRECTUS_API_TOKEN');
    if (!DIRECTUS_API_TOKEN) {
      throw new Error('DIRECTUS_API_TOKEN is not configured');
    }

    const { action, telegram_user, wallet_address, telegram_id } = await req.json();

    console.log('Action:', action);
    console.log('Telegram user:', telegram_user);
    console.log('Wallet address:', wallet_address);

    if (action === 'sync_user') {
      // Sync Telegram user with Directus
      if (!telegram_user || !telegram_user.id) {
        throw new Error('Telegram user data is required');
      }

      const telegramId = String(telegram_user.id);
      const fullName = telegram_user.last_name 
        ? `${telegram_user.first_name} ${telegram_user.last_name}`
        : telegram_user.first_name;
      const username = telegram_user.username ? `@${telegram_user.username}` : '';
      const photoUrl = telegram_user.photo_url || '';

      // Check if user exists
      const checkResponse = await fetch(
        `${DIRECTUS_URL}/Items/tg_users?filter[id_telergram][_eq]=${telegramId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${DIRECTUS_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!checkResponse.ok) {
        const errorText = await checkResponse.text();
        console.error('Directus check error:', errorText);
        throw new Error(`Failed to check user in Directus: ${checkResponse.status}`);
      }

      const checkData = await checkResponse.json();
      console.log('Existing user check:', checkData);

      let directusUser: DirectusUser;

      if (checkData.data && checkData.data.length > 0) {
        // User exists - update
        const existingUser = checkData.data[0];
        console.log('Updating existing user:', existingUser.id);

        const updateResponse = await fetch(
          `${DIRECTUS_URL}/Items/tg_users/${existingUser.id}`,
          {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${DIRECTUS_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: fullName,
              username: username,
              photo_url: photoUrl,
            }),
          }
        );

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error('Directus update error:', errorText);
          throw new Error(`Failed to update user in Directus: ${updateResponse.status}`);
        }

        const updateData = await updateResponse.json();
        directusUser = updateData.data;
        console.log('User updated:', directusUser);
      } else {
        // User doesn't exist - create
        console.log('Creating new user');

        const createResponse = await fetch(
          `${DIRECTUS_URL}/Items/tg_users`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${DIRECTUS_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id_telergram: telegramId,
              name: fullName,
              username: username,
              photo_url: photoUrl,
              balance: '0',
              inventory: '',
              tg_wallet: '',
              status: 'active',
            }),
          }
        );

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error('Directus create error:', errorText);
          throw new Error(`Failed to create user in Directus: ${createResponse.status}`);
        }

        const createData = await createResponse.json();
        directusUser = createData.data;
        console.log('User created:', directusUser);
      }

      return new Response(
        JSON.stringify({ success: true, user: directusUser }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'save_wallet') {
      // Save TON wallet address
      if (!telegram_id) {
        throw new Error('Telegram ID is required');
      }
      if (!wallet_address) {
        throw new Error('Wallet address is required');
      }

      // Find user by telegram ID
      const checkResponse = await fetch(
        `${DIRECTUS_URL}/Items/tg_users?filter[id_telergram][_eq]=${telegram_id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${DIRECTUS_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!checkResponse.ok) {
        throw new Error(`Failed to find user: ${checkResponse.status}`);
      }

      const checkData = await checkResponse.json();
      
      if (!checkData.data || checkData.data.length === 0) {
        throw new Error('User not found in Directus');
      }

      const existingUser = checkData.data[0];

      // Update wallet address
      const updateResponse = await fetch(
        `${DIRECTUS_URL}/Items/tg_users/${existingUser.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${DIRECTUS_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tg_wallet: wallet_address,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('Directus wallet update error:', errorText);
        throw new Error(`Failed to save wallet: ${updateResponse.status}`);
      }

      const updateData = await updateResponse.json();
      console.log('Wallet saved:', updateData.data);

      return new Response(
        JSON.stringify({ success: true, user: updateData.data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_user') {
      // Get user data from Directus
      if (!telegram_id) {
        throw new Error('Telegram ID is required');
      }

      const response = await fetch(
        `${DIRECTUS_URL}/Items/tg_users?filter[id_telergram][_eq]=${telegram_id}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${DIRECTUS_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get user: ${response.status}`);
      }

      const data = await response.json();
      const user = data.data && data.data.length > 0 ? data.data[0] : null;

      return new Response(
        JSON.stringify({ success: true, user }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error: unknown) {
    console.error('Error in tg-user-sync:', error);
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

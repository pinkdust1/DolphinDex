import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Allowed actions for this endpoint
const ALLOWED_ACTIONS = ['create', 'check'];

// UUID format validation
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST method
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

    const { action, uuid } = body;

    // Validate action
    if (!action || typeof action !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Action is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ALLOWED_ACTIONS.includes(action)) {
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

    if (action === 'create') {
      // Create SignIn payload
      const payload = {
        txjson: {
          TransactionType: "SignIn"
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
        console.error('XAMAN API error:', response.status);
        return new Response(
          JSON.stringify({ error: 'Failed to create authentication request' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      console.log('Payload created:', data.uuid);

      return new Response(
        JSON.stringify({
          uuid: data.uuid,
          qrUrl: data.refs.qr_png,
          deepLink: data.next.always,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'check') {
      // Validate UUID format
      if (!uuid || typeof uuid !== 'string') {
        return new Response(
          JSON.stringify({ error: 'UUID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!UUID_PATTERN.test(uuid)) {
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
          JSON.stringify({ error: 'Failed to check authentication status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      console.log('Payload status:', data.meta.signed, 'for', uuid);

      // Return only necessary data, exclude internal metadata
      return new Response(
        JSON.stringify({
          signed: data.meta.signed,
          account: data.response?.account || null,
          xamanData: {
            meta: {
              signed: data.meta.signed,
              expired: data.meta.expired,
              resolved: data.meta.resolved,
            },
            response: data.response ? {
              account: data.response.account,
              signer: data.response.signer,
            } : null,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in xaman-auth function:', error);
    // Return generic error to avoid leaking internal details
    return new Response(
      JSON.stringify({ error: 'Authentication service error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

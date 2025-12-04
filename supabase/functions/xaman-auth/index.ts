import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action } = body;
    const apiKey = Deno.env.get('XAMAN_API_KEY');
    const apiSecret = Deno.env.get('XAMAN_API_SECRET');

    if (!apiKey || !apiSecret) {
      throw new Error('XAMAN API credentials not configured');
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
        const error = await response.text();
        console.error('XAMAN API error:', error);
        throw new Error(`Failed to create payload: ${response.status}`);
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
      const { uuid } = body;
      
      if (!uuid) {
        throw new Error('UUID is required');
      }

      const response = await fetch(`https://xumm.app/api/v1/platform/payload/${uuid}`, {
        headers: {
          'X-API-Key': apiKey,
          'X-API-Secret': apiSecret,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check payload status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Payload status:', data.meta.signed, 'for', uuid);

      // Return all available data from Xaman
      return new Response(
        JSON.stringify({
          signed: data.meta.signed,
          account: data.response?.account || null,
          // Full Xaman response data
          xamanData: {
            meta: data.meta,
            application: data.application,
            payload: data.payload,
            response: data.response,
            custom_meta: data.custom_meta,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Error in xaman-auth function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

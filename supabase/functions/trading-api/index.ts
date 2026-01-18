import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use the user's server as specified in the requirements
const EXTERNAL_API_BASE = 'http://46.8.236.250:8086/api';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get('endpoint');
    
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: 'Missing endpoint parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the external API URL
    let externalUrl = `${EXTERNAL_API_BASE}/${endpoint}`;
    
    // Forward query parameters (except 'endpoint')
    const params = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      if (key !== 'endpoint') {
        params.append(key, value);
      }
    });
    
    if (params.toString()) {
      externalUrl += `?${params.toString()}`;
    }

    console.log(`Proxying request to: ${externalUrl}`);

    const response = await fetch(externalUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'DolphinScan/1.0',
      },
    });

    if (!response.ok) {
      console.error(`External API error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: `External API error: ${response.statusText}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log(`Successfully fetched data from ${endpoint}`);

    return new Response(
      JSON.stringify({ data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Trading API proxy error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

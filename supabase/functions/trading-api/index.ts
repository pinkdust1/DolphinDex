import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use the user's server as specified in the requirements
const EXTERNAL_API_BASE = 'http://46.8.236.250:8086/api';

// Whitelist of allowed endpoints
const ALLOWED_ENDPOINTS = [
  'ohlc',
  'orderbook',
  'trades',
  'ticker',
  'pairs',
  'markets',
  'stats',
];

// Maximum allowed limit parameter
const MAX_LIMIT = 200;

// Validate endpoint pattern - only allow alphanumeric and underscores
const ENDPOINT_PATTERN = /^[a-zA-Z0-9_-]+$/;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow GET method
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
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

    // Validate endpoint format
    if (!ENDPOINT_PATTERN.test(endpoint)) {
      return new Response(
        JSON.stringify({ error: 'Invalid endpoint format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if endpoint is in whitelist
    if (!ALLOWED_ENDPOINTS.includes(endpoint.toLowerCase())) {
      console.warn(`Blocked endpoint: ${endpoint}`);
      return new Response(
        JSON.stringify({ error: 'Endpoint not allowed' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the external API URL
    let externalUrl = `${EXTERNAL_API_BASE}/${encodeURIComponent(endpoint)}`;
    
    // Forward query parameters (except 'endpoint') with validation
    const params = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      if (key !== 'endpoint') {
        // Sanitize and validate parameters
        const sanitizedValue = value.trim();
        
        // Enforce limit parameter
        if (key === 'limit') {
          const limitNum = parseInt(sanitizedValue, 10);
          if (!isNaN(limitNum)) {
            params.append(key, String(Math.min(limitNum, MAX_LIMIT)));
          }
        } else if (sanitizedValue.length > 0 && sanitizedValue.length <= 500) {
          // Only allow reasonable parameter lengths
          params.append(key, sanitizedValue);
        }
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
      console.error(`External API error: ${response.status}`);
      return new Response(
        JSON.stringify({ error: 'External API error' }),
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
    console.error('Trading API proxy error:', error instanceof Error ? error.message : 'Unknown error');
    // Return generic error to avoid leaking internal details
    return new Response(
      JSON.stringify({ error: 'Request failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

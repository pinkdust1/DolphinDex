import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RPC_URL = "https://xrplcluster.com";

// Whitelist of allowed XRPL RPC methods for this application
const ALLOWED_METHODS = [
  'account_info',
  'account_lines',
  'account_offers',
  'account_tx',
  'account_nfts',
  'book_offers',
  'ledger',
  'ledger_current',
  'ledger_closed',
  'server_info',
  'server_state',
  'tx',
  'submit',
  'fee',
  'gateway_balances',
  'nft_info',
  'nft_history',
  'nft_sell_offers',
  'nft_buy_offers',
];

// Maximum limits for pagination parameters
const MAX_LIMIT = 100;
const MAX_LEDGER_RANGE = 1000;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST method
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { method, params } = body;

    if (!method || typeof method !== 'string') {
      return new Response(
        JSON.stringify({ error: "Method is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate method is in whitelist
    if (!ALLOWED_METHODS.includes(method)) {
      console.warn(`Blocked RPC method: ${method}`);
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize params - ensure it's an array or convert object to array format
    let sanitizedParams = params;
    if (params !== undefined) {
      if (!Array.isArray(params)) {
        if (typeof params === 'object' && params !== null) {
          sanitizedParams = [params];
        } else {
          return new Response(
            JSON.stringify({ error: "Params must be an array or object" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      // Enforce limits on pagination parameters
      sanitizedParams = sanitizedParams.map((param: Record<string, unknown>) => {
        if (typeof param === 'object' && param !== null) {
          const sanitized = { ...param };
          
          // Limit 'limit' parameter
          if (typeof sanitized.limit === 'number' && sanitized.limit > MAX_LIMIT) {
            sanitized.limit = MAX_LIMIT;
          }
          
          // Limit ledger range for account_tx
          if (method === 'account_tx') {
            if (typeof sanitized.ledger_index_min === 'number' && 
                typeof sanitized.ledger_index_max === 'number') {
              const range = sanitized.ledger_index_max - sanitized.ledger_index_min;
              if (range > MAX_LEDGER_RANGE) {
                sanitized.ledger_index_max = sanitized.ledger_index_min + MAX_LEDGER_RANGE;
              }
            }
          }
          
          return sanitized;
        }
        return param;
      });
    }

    console.log(`XRPL RPC request: ${method}`);

    const response = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, params: sanitizedParams }),
    });

    if (!response.ok) {
      throw new Error(`XRPL RPC error: ${response.statusText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("XRPL proxy error:", error);
    // Return generic error message to avoid leaking internal details
    return new Response(
      JSON.stringify({ error: "Request failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

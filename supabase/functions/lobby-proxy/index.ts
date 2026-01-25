import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DIRECTUS_API_URL = "https://admin.asapcase.shop/items/loby_data";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  try {
    console.log("Fetching lobby data from Directus...");
    
    const response = await fetch(DIRECTUS_API_URL, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    console.log("Directus response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Directus error response:", errorText);
      throw new Error(`Directus API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Directus data received:", JSON.stringify(data));

    return new Response(
      JSON.stringify(data),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error fetching lobbies from Directus:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to fetch lobby data",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

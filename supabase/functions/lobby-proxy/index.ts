import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DIRECTUS_API_URL = "https://admin.asapcase.shop/items/loby_data";

// Mock data for demonstration when Directus is unavailable
const MOCK_LOBBIES = [
  {
    id: 1,
    id_lobby: "0001",
    player1: "ra3vqnxHULyMXpcXUNjtEffRfY1hunsgeD",
    player2: null,
    cost: "10 XRP",
    lobby_status: "free",
    start_time: "14:00"
  },
  {
    id: 2,
    id_lobby: "0002",
    player1: "rasqnvSqetu6ffxnJSxq5BaGVkVRcAqxEh",
    player2: "rN7n3473SaZBCG4dFL83w7a1RXtXtbK2D9",
    cost: "25 XRP",
    lobby_status: "busy",
    start_time: "14:30"
  },
  {
    id: 3,
    id_lobby: "0003",
    player1: null,
    player2: null,
    cost: "5 XRP",
    lobby_status: "free",
    start_time: "15:00"
  },
  {
    id: 4,
    id_lobby: "0004",
    player1: "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
    player2: null,
    cost: "50 XRP",
    lobby_status: "waiting",
    start_time: "15:30"
  },
  {
    id: 5,
    id_lobby: "0005",
    player1: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
    player2: "rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf",
    cost: "100 XRP",
    lobby_status: "busy",
    start_time: "16:00"
  }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Allow both GET and POST requests (Supabase functions.invoke uses POST)
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }

  try {
    const directusToken = Deno.env.get("DIRECTUS_API_TOKEN");
    
    if (!directusToken) {
      console.warn("DIRECTUS_API_TOKEN not configured, using mock data");
      return new Response(
        JSON.stringify({ data: MOCK_LOBBIES, isMock: true }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    console.log("Fetching lobby data from Directus with token...");
    
    const response = await fetch(DIRECTUS_API_URL, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${directusToken}`,
      },
    });

    console.log("Directus response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Directus error response:", errorText);
      
      // Return mock data on Directus failure
      console.log("Falling back to mock data due to Directus error");
      return new Response(
        JSON.stringify({ data: MOCK_LOBBIES, isMock: true, reason: "Directus unavailable" }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    const data = await response.json();
    console.log("Directus data received successfully");

    return new Response(
      JSON.stringify({ ...data, isMock: false }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error fetching lobbies from Directus:", error);
    
    // Return mock data on any error
    console.log("Falling back to mock data due to error");
    return new Response(
      JSON.stringify({ 
        data: MOCK_LOBBIES, 
        isMock: true, 
        reason: error instanceof Error ? error.message : "Unknown error"
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DIRECTUS_BASE_URL = "https://admin.asapcase.shop/items";
const DIRECTUS_LOBBY_URL = `${DIRECTUS_BASE_URL}/loby_data`;
const DIRECTUS_USER_WALLET_URL = `${DIRECTUS_BASE_URL}/user_wallet`;

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
    
    // Parse request body for POST requests
    let body = null;
    if (req.method === "POST") {
      try {
        body = await req.json();
      } catch {
        body = null;
      }
    }

    // Check if this is a save_wallet action
    if (body?.action === "save_wallet") {
      if (!directusToken) {
        return new Response(
          JSON.stringify({ error: "DIRECTUS_API_TOKEN not configured", success: false }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500 
          }
        );
      }

      const { adress, balance } = body;
      
      if (!adress) {
        return new Response(
          JSON.stringify({ error: "Wallet address is required", success: false }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }

      console.log("Saving wallet to Directus:", { adress, balance });

      // First, check if wallet already exists
      const checkResponse = await fetch(`${DIRECTUS_USER_WALLET_URL}?filter[adress][_eq]=${adress}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${directusToken}`,
        },
      });

      const existingData = await checkResponse.json();
      
      if (existingData.data && existingData.data.length > 0) {
        // Update existing wallet
        const walletId = existingData.data[0].id;
        console.log("Updating existing wallet:", walletId);
        
        const updateResponse = await fetch(`${DIRECTUS_USER_WALLET_URL}/${walletId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${directusToken}`,
          },
          body: JSON.stringify({ balance }),
        });

        if (!updateResponse.ok) {
          const errorText = await updateResponse.text();
          console.error("Failed to update wallet:", errorText);
          return new Response(
            JSON.stringify({ error: "Failed to update wallet", success: false }),
            { 
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500 
            }
          );
        }

        const updatedWallet = await updateResponse.json();
        console.log("Wallet updated successfully");
        
        return new Response(
          JSON.stringify({ success: true, data: updatedWallet.data, action: "updated" }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200 
          }
        );
      } else {
        // Create new wallet entry
        console.log("Creating new wallet entry");
        
        const createResponse = await fetch(DIRECTUS_USER_WALLET_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${directusToken}`,
          },
          body: JSON.stringify({ adress, balance }),
        });

        if (!createResponse.ok) {
          const errorText = await createResponse.text();
          console.error("Failed to create wallet:", errorText);
          return new Response(
            JSON.stringify({ error: "Failed to create wallet", success: false }),
            { 
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 500 
            }
          );
        }

        const newWallet = await createResponse.json();
        console.log("Wallet created successfully");
        
        return new Response(
          JSON.stringify({ success: true, data: newWallet.data, action: "created" }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200 
          }
        );
      }
    }

    // Default action: fetch lobbies
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
    
    const response = await fetch(DIRECTUS_LOBBY_URL, {
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
    console.error("Error in lobby-proxy:", error);
    
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

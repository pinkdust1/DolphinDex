import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DIRECTUS_BASE_URL = "https://admin.asapcase.shop/items";
const DIRECTUS_LOBBY_URL = `${DIRECTUS_BASE_URL}/loby_data`;
const DIRECTUS_USER_WALLET_URL = `${DIRECTUS_BASE_URL}/user_wallet`;
const DIRECTUS_GAME_SESSIONS_URL = `${DIRECTUS_BASE_URL}/game_sessions`;
// Chess-specific collections
const DIRECTUS_CHESS_LOBBY_URL = `${DIRECTUS_BASE_URL}/chess_loby_data`;
const DIRECTUS_CHESS_SESSIONS_URL = `${DIRECTUS_BASE_URL}/chess_game_sessions`;

// Mock data for demonstration when Directus is unavailable
const MOCK_LOBBIES = [
  {
    id: 1,
    id_lobby: "0001",
    player1: "ra3vqnxHULyMXpcXUNjtEffRfY1hunsgeD",
    player2: null,
    cost: "10 XRP",
    lobby_status: "free",
    start_time: "14:00",
    game_type: "checkers",
    date_created: new Date().toISOString()
  },
  {
    id: 2,
    id_lobby: "0002",
    player1: "rasqnvSqetu6ffxnJSxq5BaGVkVRcAqxEh",
    player2: "rN7n3473SaZBCG4dFL83w7a1RXtXtbK2D9",
    cost: "25 XRP",
    lobby_status: "busy",
    start_time: "14:30",
    game_type: "checkers",
    date_created: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 3,
    id_lobby: "0003",
    player1: null,
    player2: null,
    cost: "5 XRP",
    lobby_status: "free",
    start_time: "15:00",
    game_type: "chess",
    date_created: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 4,
    id_lobby: "0004",
    player1: "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe",
    player2: null,
    cost: "50 XRP",
    lobby_status: "waiting",
    start_time: "15:30",
    game_type: "durak",
    date_created: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 5,
    id_lobby: "0005",
    player1: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
    player2: "rGWrZyQqhTp9Xu7G5Pkayo7bXjH4k4QYpf",
    cost: "100 XRP",
    lobby_status: "busy",
    start_time: "16:00",
    game_type: "chess",
    date_created: new Date(Date.now() - 10800000).toISOString()
  }
];

// Generate a unique lobby ID (4 digits)
function generateLobbyId(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

// Get current time in HH:MM format
function getCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}

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

    // CREATE LOBBY action
    if (body?.action === "create_lobby") {
      if (!directusToken) {
        return new Response(
          JSON.stringify({ error: "DIRECTUS_API_TOKEN not configured", success: false }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500 
          }
        );
      }

      const { player1, cost, game_type } = body;
      
      if (!player1) {
        return new Response(
          JSON.stringify({ error: "Wallet address is required", success: false }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }

      // Validate cost
      const costValue = parseFloat(cost) || 0;
      if (costValue < 0 || costValue > 100) {
        return new Response(
          JSON.stringify({ error: "Cost must be between 0 and 100 XRP", success: false }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }

      const lobbyData = {
        id_lobby: generateLobbyId(),
        player1: player1,
        player2: null,
        cost: costValue === 0 ? "Free" : `${costValue} XRP`,
        lobby_status: "free",
        start_time: getCurrentTime(),
        game_type: game_type || "checkers",
        date_created: new Date().toISOString()
      };

      console.log("Creating lobby in Directus:", lobbyData);

      const createResponse = await fetch(DIRECTUS_LOBBY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${directusToken}`,
        },
        body: JSON.stringify(lobbyData),
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error("Failed to create lobby:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to create lobby", success: false }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500 
          }
        );
      }

      const newLobby = await createResponse.json();
      console.log("Lobby created successfully:", newLobby);
      
      return new Response(
        JSON.stringify({ success: true, data: newLobby.data }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    // JOIN LOBBY action
    if (body?.action === "join_lobby") {
      if (!directusToken) {
        return new Response(
          JSON.stringify({ error: "DIRECTUS_API_TOKEN not configured", success: false }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500 
          }
        );
      }

      const { lobby_id, player2 } = body;
      
      if (!lobby_id || !player2) {
        return new Response(
          JSON.stringify({ error: "Lobby ID and wallet address are required", success: false }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }

      console.log("Joining lobby:", { lobby_id, player2 });

      // First, check if lobby exists and is free
      const checkResponse = await fetch(`${DIRECTUS_LOBBY_URL}/${lobby_id}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${directusToken}`,
        },
      });

      if (!checkResponse.ok) {
        return new Response(
          JSON.stringify({ error: "Lobby not found", success: false }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404 
          }
        );
      }

      const lobbyData = await checkResponse.json();
      
      if (lobbyData.data.lobby_status !== "free") {
        return new Response(
          JSON.stringify({ error: "Lobby is not available", success: false }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }

      // Check that player2 is not the same as player1
      if (lobbyData.data.player1 === player2) {
        return new Response(
          JSON.stringify({ error: "You cannot join your own lobby", success: false }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400 
          }
        );
      }

      // Update lobby with player2 and set status to busy
      const updateResponse = await fetch(`${DIRECTUS_LOBBY_URL}/${lobby_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${directusToken}`,
        },
        body: JSON.stringify({
          player2: player2,
          lobby_status: "busy"
        }),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error("Failed to join lobby:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to join lobby", success: false }),
          { 
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500 
          }
        );
      }

      const updatedLobby = await updateResponse.json();
      console.log("Joined lobby successfully:", updatedLobby);
      
      return new Response(
        JSON.stringify({ success: true, data: updatedLobby.data }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    // GET GAME SESSION action
    if (body?.action === "get_game_session") {
      if (!directusToken) {
        return new Response(
          JSON.stringify({ error: "DIRECTUS_API_TOKEN not configured", success: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      const { lobby_id } = body;
      if (!lobby_id) {
        return new Response(
          JSON.stringify({ error: "Lobby ID is required", success: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      console.log("Getting game session for lobby:", lobby_id);

      const response = await fetch(`${DIRECTUS_GAME_SESSIONS_URL}?filter[lobby_id][_eq]=${lobby_id}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${directusToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to get game session:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to get game session", success: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      const data = await response.json();
      return new Response(
        JSON.stringify({ success: true, data: data.data?.[0] || null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // CREATE GAME SESSION action
    if (body?.action === "create_game_session") {
      if (!directusToken) {
        return new Response(
          JSON.stringify({ error: "DIRECTUS_API_TOKEN not configured", success: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      const { lobby_id, player1_wallet, player2_wallet, game_state } = body;
      
      if (!lobby_id || !player1_wallet) {
        return new Response(
          JSON.stringify({ error: "Lobby ID and player1 wallet are required", success: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      console.log("Creating game session:", { lobby_id, player1_wallet, player2_wallet });

      const sessionData = {
        lobby_id,
        player1_wallet,
        player2_wallet: player2_wallet || null,
        game_state: game_state || null,
        current_turn: "white",
        game_status: "playing",
        winner: null,
        last_move_at: new Date().toISOString(),
      };

      const response = await fetch(DIRECTUS_GAME_SESSIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${directusToken}`,
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to create game session:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to create game session", success: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      const newSession = await response.json();
      console.log("Game session created:", newSession);

      return new Response(
        JSON.stringify({ success: true, data: newSession.data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // UPDATE GAME SESSION action
    if (body?.action === "update_game_session") {
      if (!directusToken) {
        return new Response(
          JSON.stringify({ error: "DIRECTUS_API_TOKEN not configured", success: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      const { session_id, game_state, current_turn, game_status, winner, player2_wallet } = body;
      
      if (!session_id) {
        return new Response(
          JSON.stringify({ error: "Session ID is required", success: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      console.log("Updating game session:", session_id);

      const updateData: Record<string, unknown> = {
        last_move_at: new Date().toISOString(),
      };
      
      if (game_state !== undefined) updateData.game_state = game_state;
      if (current_turn !== undefined) updateData.current_turn = current_turn;
      if (game_status !== undefined) updateData.game_status = game_status;
      if (winner !== undefined) updateData.winner = winner;
      if (player2_wallet !== undefined) updateData.player2_wallet = player2_wallet;

      const response = await fetch(`${DIRECTUS_GAME_SESSIONS_URL}/${session_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${directusToken}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to update game session:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to update game session", success: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      const updatedSession = await response.json();
      console.log("Game session updated:", updatedSession);

      return new Response(
        JSON.stringify({ success: true, data: updatedSession.data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ==================== CHESS GAME SESSIONS ====================

    // GET CHESS GAME SESSION action
    if (body?.action === "get_chess_session") {
      if (!directusToken) {
        return new Response(
          JSON.stringify({ error: "DIRECTUS_API_TOKEN not configured", success: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      const { lobby_id } = body;
      if (!lobby_id) {
        return new Response(
          JSON.stringify({ error: "Lobby ID is required", success: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      console.log("Getting chess game session for lobby:", lobby_id);

      const response = await fetch(`${DIRECTUS_CHESS_SESSIONS_URL}?filter[lobby_id][_eq]=${lobby_id}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${directusToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to get chess session:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to get chess session", success: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      const data = await response.json();
      return new Response(
        JSON.stringify({ success: true, data: data.data?.[0] || null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // CREATE CHESS GAME SESSION action
    if (body?.action === "create_chess_session") {
      if (!directusToken) {
        return new Response(
          JSON.stringify({ error: "DIRECTUS_API_TOKEN not configured", success: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      const { lobby_id, player1_wallet, player2_wallet, game_state } = body;
      
      if (!lobby_id || !player1_wallet) {
        return new Response(
          JSON.stringify({ error: "Lobby ID and player1 wallet are required", success: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      console.log("Creating chess session:", { lobby_id, player1_wallet, player2_wallet });

      const sessionData = {
        lobby_id,
        player1_wallet,
        player2_wallet: player2_wallet || null,
        game_state: game_state || null,
        current_turn: "white",
        game_status: "playing",
        winner: null,
        last_move_at: new Date().toISOString(),
      };

      const response = await fetch(DIRECTUS_CHESS_SESSIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${directusToken}`,
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to create chess session:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to create chess session", success: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      const newSession = await response.json();
      console.log("Chess session created:", newSession);

      return new Response(
        JSON.stringify({ success: true, data: newSession.data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // UPDATE CHESS GAME SESSION action
    if (body?.action === "update_chess_session") {
      if (!directusToken) {
        return new Response(
          JSON.stringify({ error: "DIRECTUS_API_TOKEN not configured", success: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      const { session_id, game_state, current_turn, game_status, winner, player2_wallet } = body;
      
      if (!session_id) {
        return new Response(
          JSON.stringify({ error: "Session ID is required", success: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      console.log("Updating chess session:", session_id);

      const updateData: Record<string, unknown> = {
        last_move_at: new Date().toISOString(),
      };
      
      if (game_state !== undefined) updateData.game_state = game_state;
      if (current_turn !== undefined) updateData.current_turn = current_turn;
      if (game_status !== undefined) updateData.game_status = game_status;
      if (winner !== undefined) updateData.winner = winner;
      if (player2_wallet !== undefined) updateData.player2_wallet = player2_wallet;

      const response = await fetch(`${DIRECTUS_CHESS_SESSIONS_URL}/${session_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${directusToken}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to update chess session:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to update chess session", success: false }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      const updatedSession = await response.json();
      console.log("Chess session updated:", updatedSession);

      return new Response(
        JSON.stringify({ success: true, data: updatedSession.data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
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

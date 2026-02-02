import { supabase } from "@/integrations/supabase/client";
import { Token, OHLCData, OrderBookData, Trade, TimeInterval } from "@/types/trading";

// Helper to decode hex currency codes
const decodeCurrencyCode = (hexCode: string): string => {
  try {
    const currencyBytes = [];
    for (let i = 0; i < hexCode.length; i += 2) {
      const byte = parseInt(hexCode.substring(i, i + 2), 16);
      if (byte === 0) break;
      currencyBytes.push(byte);
    }
    const currency = String.fromCharCode(...currencyBytes.filter(b => b >= 32 && b < 127));
    if (currency.length >= 3 && currency.match(/^[A-Z0-9]+$/)) {
      return currency;
    }
  } catch (e) {
    // Fall through
  }
  return '';
};

// Known token mappings
const issuerToSymbol: Record<string, { symbol: string; name: string; icon: string }> = {
  'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De_524C555344000000000000000000000000000000': { symbol: 'RLUSD', name: 'Ripple USD', icon: '💵' },
};

const extractCurrencyCode = (base: string): string => {
  if (issuerToSymbol[base]) {
    return issuerToSymbol[base].symbol;
  }
  
  const match = base.match(/_([A-F0-9]+)$/);
  if (match) {
    const decoded = decodeCurrencyCode(match[1]);
    if (decoded) return decoded;
  }
  
  const parts = base.split('_');
  if (parts.length > 0 && parts[0].startsWith('r')) {
    return parts[0].substring(0, 8).toUpperCase();
  }
  return base.substring(0, 8).toUpperCase();
};

async function fetchFromProxy<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const queryParams = new URLSearchParams({ endpoint, ...params });
  
  // Direct fetch to edge function with query params
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/trading-api?${queryParams.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data || result;
}

export const tradingApi = {
  async getTokens(interval: TimeInterval = '1h'): Promise<Token[]> {
    try {
      const rawData = await fetchFromProxy<unknown>('tokens', { interval, limit: '200' });
      
      // Handle different API response formats
      const data = Array.isArray(rawData) ? rawData : 
                   (rawData && typeof rawData === 'object' && 'data' in rawData && Array.isArray((rawData as {data: unknown[]}).data)) 
                   ? (rawData as {data: unknown[]}).data : [];
      
      console.log('Tokens API response:', { raw: rawData, parsed: data.length });

      if (!Array.isArray(data) || data.length === 0) {
        console.warn('No tokens data received, using fallback');
        return generateMockTokens();
      }

      // Less aggressive filtering - include tokens with any activity
      const filtered = (data as Array<{
        base: string;
        counter: string;
        price: number;
        change24h: number;
        volume24h: number;
        high24h: number;
        low24h: number;
        exchanges: number;
      }>)
        .filter(item => item && item.counter === 'XRP')
        .sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0));

      const rlusdRaw = filtered.find(item => 
        item.base === 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De_524C555344000000000000000000000000000000'
      ) || filtered.find(item => extractCurrencyCode(item.base) === 'RLUSD');

      const buildToken = (item: typeof filtered[0]): Token => {
        const symbol = extractCurrencyCode(item.base);
        const known = issuerToSymbol[item.base];
        return {
          symbol: known?.symbol ?? symbol,
          name: known?.name ?? symbol,
          icon: known?.icon,
          price: item.price || 0,
          change24h: item.change24h || 0,
          volume24h: item.volume24h || 0,
          high24h: item.high24h,
          low24h: item.low24h,
          base: item.base,
        };
      };

      const tokens: Token[] = [];
      if (rlusdRaw) tokens.push(buildToken(rlusdRaw));

      for (const item of filtered) {
        if (tokens.length >= 200) break; // Increased limit to 200
        if (rlusdRaw && item.base === rlusdRaw.base) continue;
        tokens.push(buildToken(item));
      }

      return tokens.length > 0 ? tokens : generateMockTokens();
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      // Return mock tokens when API is unavailable
      return generateMockTokens();
    }
  },

  async getOHLC(symbol: string, interval: TimeInterval, limit: number = 100): Promise<OHLCData[]> {
    try {
      const rawData = await fetchFromProxy<unknown>('ohlc', { 
        symbol, 
        interval, 
        limit: limit.toString() 
      });
      
      const data = Array.isArray(rawData) ? rawData : 
                   (rawData && typeof rawData === 'object' && 'data' in rawData && Array.isArray((rawData as {data: unknown[]}).data)) 
                   ? (rawData as {data: unknown[]}).data : [];
      
      console.log('OHLC API response:', { raw: typeof rawData, length: data.length });
      return data as OHLCData[];
    } catch (error) {
      console.error('Failed to fetch OHLC:', error);
      // Return mock OHLC data when API is unavailable
      return generateMockOHLC(limit);
    }
  },

  async getOrderBook(symbol: string): Promise<OrderBookData> {
    try {
      const rawData = await fetchFromProxy<unknown>('orderbook', { symbol });
      
      console.log('OrderBook API response:', rawData);
      
      // Handle different response formats - API returns {success, data: {asks, bids}}
      if (rawData && typeof rawData === 'object') {
        const response = rawData as Record<string, unknown>;
        
        // Check if data is nested under 'data' property
        const orderData = (response.data && typeof response.data === 'object') 
          ? response.data as Record<string, unknown>
          : response;
        
        const asks = Array.isArray(orderData.asks) ? orderData.asks : [];
        const bids = Array.isArray(orderData.bids) ? orderData.bids : [];
        
        // Calculate spread from best bid/ask
        const bestBid = bids[0]?.price ?? 0;
        const bestAsk = asks[0]?.price ?? 0;
        const spread = bestAsk > 0 && bestBid > 0 ? Math.abs(bestAsk - bestBid) : 0;
        
        return { asks, bids, spread };
      }
      
      return { asks: [], bids: [], spread: 0 };
    } catch (error) {
      console.error('Failed to fetch orderbook:', error);
      // Return mock orderbook data when API is unavailable
      return generateMockOrderBook();
    }
  },

  async getTrades(symbol: string, limit: number = 50): Promise<Trade[]> {
    try {
      const rawData = await fetchFromProxy<unknown>('exchanges', { symbol, limit: limit.toString() });
      
      const exchanges = Array.isArray(rawData) ? rawData : 
                        (rawData && typeof rawData === 'object' && 'data' in rawData && Array.isArray((rawData as {data: unknown[]}).data)) 
                        ? (rawData as {data: unknown[]}).data : [];
      
      console.log('Trades API response:', { raw: typeof rawData, length: exchanges.length });

      if (!Array.isArray(exchanges)) {
        return generateMockTrades(limit);
      }

      return exchanges.map((ex: Record<string, unknown>, idx: number) => ({
        id: String(ex.tx_hash || idx),
        price: Number(ex.rate) || 0,
        amount: Number(ex.base_amount) || 0,
        time: ex.executed_time ? new Date(String(ex.executed_time)).getTime() : Date.now(),
        side: (idx % 2 === 0 ? 'buy' : 'sell') as 'buy' | 'sell'
      })).sort((a, b) => b.time - a.time);
    } catch (error) {
      console.error('Failed to fetch trades:', error);
      // Return mock trades data when API is unavailable
      return generateMockTrades(limit);
    }
  }
};

// Mock data generators for when API is unavailable
function generateMockOHLC(limit: number): OHLCData[] {
  const now = Date.now();
  const data: OHLCData[] = [];
  let price = 0.4691;
  
  for (let i = limit; i > 0; i--) {
    const variation = (Math.random() - 0.5) * 0.02;
    const open = price;
    const close = price + variation;
    const high = Math.max(open, close) + Math.random() * 0.01;
    const low = Math.min(open, close) - Math.random() * 0.01;
    
    data.push({
      time: now - i * 3600000,
      open,
      high,
      low,
      close
    });
    
    price = close;
  }
  
  return data;
}

function generateMockOrderBook(): OrderBookData {
  const basePrice = 0.4691;
  const asks: Array<{ price: number; amount: number }> = [];
  const bids: Array<{ price: number; amount: number }> = [];
  
  for (let i = 0; i < 15; i++) {
    asks.push({
      price: basePrice + (i + 1) * 0.0005,
      amount: Math.random() * 50000 + 10000
    });
    bids.push({
      price: basePrice - (i + 1) * 0.0005,
      amount: Math.random() * 50000 + 10000
    });
  }
  
  return {
    asks: asks.sort((a, b) => a.price - b.price),
    bids: bids.sort((a, b) => b.price - a.price),
    spread: 0.001
  };
}

function generateMockTrades(limit: number): Trade[] {
  const trades: Trade[] = [];
  const now = Date.now();
  let price = 0.4691;
  
  for (let i = 0; i < limit; i++) {
    price += (Math.random() - 0.5) * 0.002;
    trades.push({
      id: `mock-${i}`,
      price: Math.max(0.001, price),
      amount: Math.random() * 10000 + 1000,
      time: now - i * 30000,
      side: Math.random() > 0.5 ? 'buy' : 'sell'
    });
  }
  
  return trades;
}

function generateMockTokens(): Token[] {
  return [
    { 
      symbol: 'RLUSD', 
      name: 'Ripple USD', 
      price: 0.4691, 
      change24h: -1.2, 
      volume24h: 2600000, 
      high24h: 0.4750,
      low24h: 0.4620,
      icon: '💵', 
      base: 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De_524C555344000000000000000000000000000000' 
    },
    { 
      symbol: 'XDX', 
      name: 'XDX Token', 
      price: 0.0234, 
      change24h: 5.7, 
      volume24h: 1850000, 
      high24h: 0.0245,
      low24h: 0.0218,
      icon: '🔷', 
      base: 'mock_xdx_issuer' 
    },
    { 
      symbol: 'SOLO', 
      name: 'Sologenic', 
      price: 0.1567, 
      change24h: -0.8, 
      volume24h: 980000, 
      high24h: 0.1610,
      low24h: 0.1520,
      icon: '🌟', 
      base: 'mock_solo_issuer' 
    },
  ];
}

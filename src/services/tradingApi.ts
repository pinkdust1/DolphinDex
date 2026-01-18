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
      const data = await fetchFromProxy<Array<{
        base: string;
        counter: string;
        price: number;
        change24h: number;
        volume24h: number;
        high24h: number;
        low24h: number;
        exchanges: number;
      }>>('tokens', { interval });

      const filtered = data
        .filter(item => item.counter === 'XRP' && item.price > 0 && item.volume24h > 0)
        .sort((a, b) => b.volume24h - a.volume24h);

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
          price: item.price,
          change24h: item.change24h,
          volume24h: item.volume24h,
          high24h: item.high24h,
          low24h: item.low24h,
          base: item.base,
        };
      };

      const tokens: Token[] = [];
      if (rlusdRaw) tokens.push(buildToken(rlusdRaw));

      for (const item of filtered) {
        if (tokens.length >= 50) break;
        if (rlusdRaw && item.base === rlusdRaw.base) continue;
        tokens.push(buildToken(item));
      }

      return tokens;
    } catch (error) {
      console.error('Failed to fetch tokens:', error);
      return [
        { symbol: 'RLUSD', name: 'Ripple USD', price: 0.4691, change24h: -1.2, volume24h: 2600000, icon: '💵', base: 'rMxCKbEDwqr76QuheSUMdEGf4B9xJ8m5De_524C555344000000000000000000000000000000' },
      ];
    }
  },

  async getOHLC(symbol: string, interval: TimeInterval, limit: number = 100): Promise<OHLCData[]> {
    try {
      const data = await fetchFromProxy<OHLCData[]>('ohlc', { 
        symbol, 
        interval, 
        limit: limit.toString() 
      });
      return data;
    } catch (error) {
      console.error('Failed to fetch OHLC:', error);
      return [];
    }
  },

  async getOrderBook(symbol: string): Promise<OrderBookData> {
    try {
      const data = await fetchFromProxy<OrderBookData>('orderbook', { symbol });
      return data;
    } catch (error) {
      console.error('Failed to fetch orderbook:', error);
      return { asks: [], bids: [], spread: 0 };
    }
  },

  async getTrades(symbol: string, limit: number = 50): Promise<Trade[]> {
    try {
      const exchanges = await fetchFromProxy<Array<{
        base_amount: number;
        counter_amount: number;
        rate: number;
        executed_time: string;
        buyer: string;
        seller: string;
        tx_hash: string;
      }>>('exchanges', { symbol, limit: limit.toString() });

      return exchanges.map((ex, idx) => ({
        id: ex.tx_hash || `${idx}`,
        price: ex.rate,
        amount: ex.base_amount,
        time: new Date(ex.executed_time).getTime(),
        side: (idx % 2 === 0 ? 'buy' : 'sell') as 'buy' | 'sell'
      })).sort((a, b) => b.time - a.time);
    } catch (error) {
      console.error('Failed to fetch trades:', error);
      return [];
    }
  }
};

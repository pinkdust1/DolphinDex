export interface OHLCData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface OrderBookLevel {
  price: number;
  amount: number;
  total?: number;
}

export interface OrderBookData {
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
  spread: number;
}

export interface Trade {
  id: string;
  price: number;
  amount: number;
  time: number;
  side: 'buy' | 'sell';
}

export interface Token {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h?: number;
  low24h?: number;
  icon?: string;
  base?: string;
}

export type TimeInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d';

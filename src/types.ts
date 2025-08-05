export interface Asset {
  id: number;
  name: string;
  quantity: number;
  pricePerUnit: number;
}

export interface CryptoPrice {
  coinId: string;
  price: number;
  timestamp: string;
}

export interface AssetWithPrice extends Asset {
  currentPrice?: number;
  priceChange?: number;
  priceChangePercentage?: number;
}

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price?: number;
  market_cap?: number;
  price_change_percentage_24h?: number;
}

// New types for price history
export interface PriceHistoryPoint {
  timestamp: number;
  price: number;
  date: string;
}

export interface PriceHistoryData {
  coinId: string;
  coinName: string;
  data: PriceHistoryPoint[];
  loading: boolean;
  error: string | null;
}

 
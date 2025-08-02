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

export interface ESGScore {
  id?: number;
  ticker: string;
  companyName: string;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  totalScore: number;
  lastUpdated: string;
} 
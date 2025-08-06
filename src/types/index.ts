export interface Asset {
  id: number;
  name: string;
  quantity: number;
  pricePerUnit: number;
  purchasePricePerUnit: number;
  initialInvestment: number;
}

export interface AssetFormData {
  name: string;
  quantity: string;
  pricePerUnit: string;
  purchasePricePerUnit: string;
  initialInvestment: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface CryptoPrice {
  coinId: string;
  price: number;
  lastUpdated: string;
}

export interface AssetWithPrice extends Asset {
  currentPrice?: number;
  priceChange?: number;
  priceChangePercent?: number;
}

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
}

export interface PriceHistoryPoint {
  timestamp: number;
  price: number;
}

export interface PriceHistoryData {
  coinId: string;
  data: PriceHistoryPoint[];
}

// New Portfolio Analytics Types
export interface PortfolioMetrics {
  totalValue: number;
  totalInvestment: number;
  roi: number;
  roiPercentage: number;
  sharpeRatio: number;
  volatility: number;
  assetCount: number;
  topPerformer: string;
  worstPerformer: string;
}

export interface AssetPerformance {
  id: number;
  name: string;
  currentValue: number;
  initialInvestment: number;
  roi: number;
  roiPercentage: number;
  weight: number; // Portfolio weight percentage
}

export interface RiskMetrics {
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
  beta: number;
  diversificationScore: number;
} 
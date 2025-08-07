import { Asset, CryptoPrice, AssetWithPrice, Coin, PriceHistoryPoint } from '../types';
import { authService } from './authService';

const API_BASE_URL = '/api/assets';

export const assetService = {
  // Get all assets
  getAllAssets: async (): Promise<Asset[]> => {
    try {
      const response = await fetch(API_BASE_URL, {
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader()
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching assets:', error);
      throw error;
    }
  },

  // Add new asset
  addAsset: async (asset: Omit<Asset, 'id'>): Promise<Asset> => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader()
        },
        body: JSON.stringify(asset),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add asset');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding asset:', error);
      throw error;
    }
  },

  // Update existing asset
  updateAsset: async (id: number, asset: Omit<Asset, 'id'>): Promise<Asset> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader()
        },
        body: JSON.stringify(asset),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update asset');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating asset:', error);
      throw error;
    }
  },

  // Delete asset
  deleteAsset: async (id: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          ...authService.getAuthHeader()
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting asset:', error);
      throw error;
    }
  },

  // Get asset by ID
  getAssetById: async (id: number): Promise<Asset> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch asset');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching asset:', error);
      throw error;
    }
  },

  // Get total portfolio value
  getTotalValue: async (): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE_URL}/total`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch total value');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching total value:', error);
      throw error;
    }
  },

  // Get ROI
  getROI: async (): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE_URL}/roi`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch ROI');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching ROI:', error);
      throw error;
    }
  },

  // Get Sharpe Ratio
  getSharpeRatio: async (): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE_URL}/sharpe`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch Sharpe ratio');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching Sharpe ratio:', error);
      throw error;
    }
  },

  // Get Volatility
  getVolatility: async (): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE_URL}/volatility`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch volatility');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching volatility:', error);
      throw error;
    }
  },

  // Get Max Drawdown
  getMaxDrawdown: async (): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE_URL}/max-drawdown`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch max drawdown');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching max drawdown:', error);
      throw error;
    }
  },

  // Get Beta
  getBeta: async (): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE_URL}/beta`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch beta');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching beta:', error);
      throw error;
    }
  },

  // Get Diversification Score
  getDiversificationScore: async (): Promise<number> => {
    try {
      const response = await fetch(`${API_BASE_URL}/diversification`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch diversification score');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching diversification score:', error);
      throw error;
    }
  },

  // Get Risk Metrics
  getRiskMetrics: async (): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/risk-metrics`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch risk metrics');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching risk metrics:', error);
      throw error;
    }
  },

  // Get crypto price
  getCryptoPrice: async (coinId: string): Promise<number> => {
    try {
      const response = await fetch(`/api/crypto/price/${coinId}`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch price for ${coinId}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching crypto price:', error);
      throw error;
    }
  },

  // Update asset with current crypto price
  updateAssetWithCurrentPrice: async (assetId: number): Promise<AssetWithPrice> => {
    try {
      const response = await fetch(`/api/assets/${assetId}/update-price`, {
        method: 'PUT',
        headers: {
          ...authService.getAuthHeader()
        }
      });
      if (!response.ok) {
        throw new Error('Failed to update asset price');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating asset price:', error);
      throw error;
    }
  },

  // Get all assets with current prices
  getAllAssetsWithPrices: async (): Promise<AssetWithPrice[]> => {
    try {
      // First try the with-prices endpoint
      const response = await fetch(`${API_BASE_URL}/with-prices`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      if (response.ok) {
        return await response.json();
      }
      
      // If that fails, fallback to regular assets and calculate prices on frontend
      console.log('with-prices endpoint not available, using fallback');
      const assets = await assetService.getAllAssets();
      
      // Convert regular assets to AssetWithPrice format
      const assetsWithPrices: AssetWithPrice[] = assets.map(asset => ({
        ...asset,
        currentPrice: asset.pricePerUnit, // Use stored price as current price
        priceChange: 0, // No price change data available
        priceChangePercent: 0
      }));
      
      return assetsWithPrices;
    } catch (error) {
      console.error('Error fetching assets with prices:', error);
      // Final fallback - return empty array
      return [];
    }
  },

  // Calculate total value from assets (client-side calculation)
  calculateTotalValue: (assets: Asset[]): number => {
    return assets.reduce((total, asset) => {
      return total + (asset.quantity * asset.pricePerUnit);
    }, 0);
  },

  // Calculate total value with current prices
  calculateTotalValueWithCurrentPrices: (assets: AssetWithPrice[]): number => {
    return assets.reduce((total, asset) => {
      const price = asset.currentPrice || asset.pricePerUnit;
      return total + (asset.quantity * price);
    }, 0);
  },

  // Get top 300 coins with images and prices
  getTopCoins: async (): Promise<Coin[]> => {
    try {
      const response = await fetch('/api/crypto/top', {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch top coins');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching top coins:', error);
      throw error;
    }
  },

  // Get detailed coin information
  getCoinDetails: async (coinId: string): Promise<Coin> => {
    try {
      const response = await fetch(`/api/crypto/details/${coinId}`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch details for ${coinId}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching coin details:', error);
      throw error;
    }
  },
};

// Price History API - Connects to your Spring Boot backend
export const priceHistoryService = {
  // Fetch historical price data for a specific coin
  async getPriceHistory(coinId: string): Promise<PriceHistoryPoint[]> {
    try {
      console.log('🔍 Fetching price history for:', coinId);
      const response = await fetch(`http://localhost:8080/api/price-history/${coinId}`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch price history for ${coinId}: ${response.statusText}`);
      }
      
      const rawData = await response.json();
      console.log('📊 Raw data received:', rawData);
      console.log('📊 Data length:', rawData.length);
      
      if (!Array.isArray(rawData) || rawData.length === 0) {
        console.warn('⚠️ No data received from backend');
        return [];
      }
      
      // Transform the raw data from [[timestamp, price], ...] to PriceHistoryPoint[]
      const transformedData = rawData.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
        date: new Date(timestamp).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }));
      
      console.log('✅ Transformed data:', transformedData.slice(0, 3)); // Show first 3 items
      return transformedData;
    } catch (error) {
      console.error('❌ Error fetching price history:', error);
      throw error;
    }
  },

  // Get price history with time range (uses your backend's cached data)
  async getPriceHistoryWithRange(coinId: string, days: number = 30): Promise<PriceHistoryPoint[]> {
    try {
      console.log('🔍 Fetching price history with range for:', coinId, 'days:', days);
      
      // Your backend already fetches 90 days of data, so we'll filter on frontend
      const response = await fetch(`http://localhost:8080/api/price-history/${coinId}`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch price history for ${coinId}: ${response.statusText}`);
      }
      
      const rawData = await response.json();
      console.log('📊 Raw data received:', rawData);
      console.log('📊 Data length:', rawData.length);
      
      if (!Array.isArray(rawData) || rawData.length === 0) {
        console.warn('⚠️ No data received from backend for', coinId);
        
        // Try alternative coin ID if the first one failed
        const alternativeIds = {
          'ripple': 'xrp',
          'xrp': 'ripple',
          'bitcoin': 'btc',
          'btc': 'bitcoin',
          'ethereum': 'eth',
          'eth': 'ethereum'
        };
        
        const alternativeId = alternativeIds[coinId.toLowerCase() as keyof typeof alternativeIds];
        if (alternativeId) {
          console.log('🔄 Trying alternative coin ID:', alternativeId);
          return this.getPriceHistoryWithRange(alternativeId, days);
        }
        
        return [];
      }
      
      // Filter data based on the requested days
      const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
      const filteredData = rawData.filter(([timestamp]: [number, number]) => timestamp >= cutoffTime);
      
      console.log('📊 Filtered data length:', filteredData.length);
      
      const transformedData = filteredData.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
        date: new Date(timestamp).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }));
      
      console.log('✅ Transformed data sample:', transformedData.slice(0, 3));
      return transformedData;
    } catch (error) {
      console.error('❌ Error fetching price history with range:', error);
      throw error;
    }
  }
};

// Portfolio Analytics API calls
export const analyticsService = {
  // Get overall portfolio metrics
  getPortfolioMetrics: async (): Promise<any> => {
    try {
      const response = await fetch('/api/assets/metrics', {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      if (!response.ok) throw new Error('Failed to fetch portfolio metrics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching portfolio metrics:', error);
      throw error;
    }
  },

  // Get ROI for the portfolio
  getROI: async (): Promise<number> => {
    try {
      const response = await fetch('/api/assets/roi', {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      if (!response.ok) throw new Error('Failed to fetch ROI');
      return await response.json();
    } catch (error) {
      console.error('Error fetching ROI:', error);
      throw error;
    }
  },

  // Get Sharpe Ratio
  getSharpeRatio: async (): Promise<number> => {
    try {
      const response = await fetch('/api/assets/sharpe', {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      if (!response.ok) throw new Error('Failed to fetch Sharpe ratio');
      return await response.json();
    } catch (error) {
      console.error('Error fetching Sharpe ratio:', error);
      throw error;
    }
  },

  // Get individual asset performance
  getAssetPerformance: async (): Promise<any[]> => {
    try {
      const response = await fetch('/api/assets/performance', {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      if (!response.ok) throw new Error('Failed to fetch asset performance');
      return await response.json();
    } catch (error) {
      console.error('Error fetching asset performance:', error);
      throw error;
    }
  },

  // Get risk metrics
  getRiskMetrics: async (): Promise<any> => {
    try {
      const response = await fetch('/api/assets/risk-metrics', {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      if (!response.ok) throw new Error('Failed to fetch risk metrics');
      return await response.json();
    } catch (error) {
      console.error('Error fetching risk metrics:', error);
      throw error;
    }
  }
};



 
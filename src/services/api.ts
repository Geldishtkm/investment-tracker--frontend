import { Asset, CryptoPrice, AssetWithPrice, Coin, ESGScore } from '../types';

const API_BASE_URL = '/api/assets';

export const assetService = {
  // Get all assets
  getAllAssets: async (): Promise<Asset[]> => {
    try {
      const response = await fetch(API_BASE_URL);
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
      const response = await fetch(`${API_BASE_URL}/${id}`);
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
      const response = await fetch(`${API_BASE_URL}/total`);
      if (!response.ok) {
        throw new Error('Failed to fetch total value');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching total value:', error);
      throw error;
    }
  },

  // Get crypto price
  getCryptoPrice: async (coinId: string): Promise<number> => {
    try {
      const response = await fetch(`/api/crypto/price/${coinId}`);
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
      const response = await fetch(`${API_BASE_URL}/with-prices`);
      if (!response.ok) {
        throw new Error('Failed to fetch assets with prices');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching assets with prices:', error);
      throw error;
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
      const response = await fetch('/api/crypto/top');
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
      const response = await fetch(`/api/crypto/details/${coinId}`);
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

export const esgService = {
  // Get ESG score for a specific company
  async getESGScore(ticker: string): Promise<ESGScore> {
    const response = await fetch(`/api/esg/${ticker}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ESG score for ${ticker}`);
    }
    return response.json();
  },

  // Get companies with high ESG scores
  async getHighESGCompanies(minScore: number): Promise<ESGScore[]> {
    const response = await fetch(`/api/esg/filter?minScore=${minScore}`);
    if (!response.ok) {
      throw new Error('Failed to fetch high ESG companies');
    }
    return response.json();
  },

  // Save or update ESG score
  async saveESGScore(esgScore: ESGScore): Promise<ESGScore> {
    const response = await fetch(`/api/esg`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(esgScore),
    });
    if (!response.ok) {
      throw new Error('Failed to save ESG score');
    }
    return response.json();
  },

  // Delete ESG score
  async deleteESGScore(ticker: string): Promise<void> {
    const response = await fetch(`/api/esg/${ticker}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete ESG score for ${ticker}`);
    }
  },
}; 
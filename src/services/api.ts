import { Asset } from '../types';

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

  // Calculate total value from assets (client-side calculation)
  calculateTotalValue: (assets: Asset[]): number => {
    return assets.reduce((total, asset) => {
      return total + (asset.quantity * asset.pricePerUnit);
    }, 0);
  },
}; 
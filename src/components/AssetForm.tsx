import React, { useState, useEffect } from 'react';
import { Plus, X, DollarSign, Package, Tag, Zap } from 'lucide-react';
import { AssetFormData } from '../types';
import { assetService } from '../services/api';

interface AssetFormProps {
  onAssetAdded: (asset: any) => void;
  onClose: () => void;
}

const AssetForm: React.FC<AssetFormProps> = ({ onAssetAdded, onClose }) => {
  const [formData, setFormData] = useState<AssetFormData>({
    name: '',
    quantity: '',
    pricePerUnit: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calculate total value in real-time
    if (name === 'quantity' || name === 'pricePerUnit') {
      const quantity = name === 'quantity' ? parseFloat(value) || 0 : parseFloat(formData.quantity) || 0;
      const price = name === 'pricePerUnit' ? parseFloat(value) || 0 : parseFloat(formData.pricePerUnit) || 0;
      setCalculatedTotal(quantity * price);
    }

    // Auto-fetch crypto price when name changes
    if (name === 'name' && isCryptoAsset(value)) {
      fetchSuggestedPrice(value);
    }
  };

  const isCryptoAsset = (name: string): boolean => {
    const cryptoKeywords = ['bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'sol', 'cardano', 'ada', 'polkadot', 'dot'];
    return cryptoKeywords.some(keyword => name.toLowerCase().includes(keyword));
  };

  const getCoinId = (name: string): string | null => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('bitcoin') || nameLower.includes('btc')) return 'bitcoin';
    if (nameLower.includes('ethereum') || nameLower.includes('eth')) return 'ethereum';
    if (nameLower.includes('solana') || nameLower.includes('sol')) return 'solana';
    if (nameLower.includes('cardano') || nameLower.includes('ada')) return 'cardano';
    if (nameLower.includes('polkadot') || nameLower.includes('dot')) return 'polkadot';
    return null;
  };

  const fetchSuggestedPrice = async (assetName: string) => {
    try {
      setIsFetchingPrice(true);
      const coinId = getCoinId(assetName);
      if (coinId) {
        const price = await assetService.getCryptoPrice(coinId);
        setSuggestedPrice(price);
      }
    } catch (error) {
      console.error('Error fetching suggested price:', error);
      setSuggestedPrice(null);
    } finally {
      setIsFetchingPrice(false);
    }
  };

  const useSuggestedPrice = () => {
    if (suggestedPrice) {
      setFormData(prev => ({
        ...prev,
        pricePerUnit: suggestedPrice.toString()
      }));
      setCalculatedTotal(parseFloat(formData.quantity) * suggestedPrice);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const assetData = {
        name: formData.name.trim(),
        quantity: parseFloat(formData.quantity),
        pricePerUnit: parseFloat(formData.pricePerUnit)
      };

      // Enhanced validation
      if (!assetData.name) {
        throw new Error('Asset name is required');
      }
      if (assetData.name.length < 2) {
        throw new Error('Asset name must be at least 2 characters long');
      }
      if (isNaN(assetData.quantity) || assetData.quantity <= 0) {
        throw new Error('Quantity must be a positive number');
      }
      if (isNaN(assetData.pricePerUnit) || assetData.pricePerUnit <= 0) {
        throw new Error('Price per unit must be a positive number');
      }
      if (assetData.pricePerUnit > 1000000) {
        throw new Error('Price per unit seems too high. Please verify the amount.');
      }

      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assetData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add asset');
      }

      const newAsset = await response.json();
      onAssetAdded(newAsset);
      
      // Reset form
      setFormData({
        name: '',
        quantity: '',
        pricePerUnit: ''
      });
      setCalculatedTotal(0);
      setSuggestedPrice(null);
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Add New Asset</h2>
            <p className="text-sm text-gray-600 mt-1">Track your investment</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-full hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Asset Name */}
          <div className="form-group">
            <label htmlFor="name" className="form-label flex items-center gap-2">
              <Tag size={16} className="text-blue-600" />
              Asset Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              className="form-input"
              placeholder="e.g., Bitcoin, Apple Stock, Tesla"
              required
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a descriptive name for your asset
            </p>
          </div>

          {/* Suggested Price for Crypto */}
          {isCryptoAsset(formData.name) && suggestedPrice && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Current Market Price</span>
                <span className="text-sm font-bold text-blue-800">
                  ${suggestedPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <button
                type="button"
                onClick={useSuggestedPrice}
                className="btn btn-primary text-sm py-1 px-3 flex-center gap-2"
              >
                <Zap size={12} />
                Use Current Price
              </button>
            </div>
          )}

          {/* Loading indicator for price fetch */}
          {isFetchingPrice && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Fetching current price...</span>
              </div>
            </div>
          )}

          {/* Quantity and Price Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="quantity" className="form-label flex items-center gap-2">
                <Package size={16} className="text-green-600" />
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className="form-input"
                placeholder="0.00"
                step="0.000001"
                min="0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                How much you own
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="pricePerUnit" className="form-label flex items-center gap-2">
                <DollarSign size={16} className="text-purple-600" />
                Price/Unit ($)
              </label>
              <input
                type="number"
                id="pricePerUnit"
                name="pricePerUnit"
                value={formData.pricePerUnit}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className="form-input"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Current price per unit
              </p>
            </div>
          </div>

          {/* Calculated Total */}
          {calculatedTotal > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-green-800 font-medium">Estimated Total Value:</span>
                <span className="text-green-800 font-bold text-lg">
                  ${calculatedTotal.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <strong>Error:</strong> {error}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1 flex-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Add Asset
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetForm; 
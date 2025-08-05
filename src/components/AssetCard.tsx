import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Package, Edit, Trash2, MoreVertical, X, Check, RefreshCw, TrendingDown } from 'lucide-react';
import { Asset, AssetWithPrice } from '../types';
import { assetService } from '../services/api';
import ConfirmModal from './ConfirmModal';
import { findCoinId, isCryptoAsset, getCoinInfo } from '../utils/coinMapping';

interface AssetCardProps {
  asset: Asset;
  onUpdate: (asset: Asset) => void;
  onDelete: (id: number) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [formData, setFormData] = useState({
    name: asset.name,
    quantity: asset.quantity.toString(),
    pricePerUnit: asset.pricePerUnit.toString()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [priceChange, setPriceChange] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [coinImage, setCoinImage] = useState<string | null>(null);

  const totalValue = asset.quantity * asset.pricePerUnit;
  const currentTotalValue = currentPrice ? asset.quantity * currentPrice : totalValue;

  // Fetch current crypto price and image on component mount
  useEffect(() => {
    if (isCryptoAsset(asset.name)) {
      fetchCurrentPrice();
      fetchCoinImage();
    }
  }, [asset.name]);

  const fetchCoinImage = async () => {
    try {
      const coinId = findCoinId(asset.name);
      if (coinId) {
        const coinsData = await assetService.getTopCoins();
        const coin = coinsData.find(c => c.id === coinId);
        if (coin && coin.image) {
          setCoinImage(coin.image);
        }
      }
    } catch (error) {
      console.error('Error fetching coin image:', error);
    }
  };

  const fetchCurrentPrice = async () => {
    try {
      setIsUpdatingPrice(true);
      const coinId = findCoinId(asset.name);
      if (coinId) {
        const price = await assetService.getCryptoPrice(coinId);
        setCurrentPrice(price);
        setPriceChange(price - asset.pricePerUnit);
      }
    } catch (error) {
      console.error('Error fetching current price:', error);
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowActions(false);
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: asset.name,
      quantity: asset.quantity.toString(),
      pricePerUnit: asset.pricePerUnit.toString()
    });
    setError('');
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const updatedAsset = {
        name: formData.name.trim(),
        quantity: parseFloat(formData.quantity),
        pricePerUnit: parseFloat(formData.pricePerUnit)
      };

      // Validation
      if (!updatedAsset.name) {
        throw new Error('Asset name is required');
      }
      if (isNaN(updatedAsset.quantity) || updatedAsset.quantity <= 0) {
        throw new Error('Quantity must be a positive number');
      }
      if (isNaN(updatedAsset.pricePerUnit) || updatedAsset.pricePerUnit <= 0) {
        throw new Error('Price per unit must be a positive number');
      }

      const response = await fetch(`/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedAsset),
      });

      if (!response.ok) {
        throw new Error('Failed to update asset');
      }

      const savedAsset = await response.json();
      onUpdate(savedAsset);
      setIsEditing(false);
      
      // Refresh current price if it's a crypto asset
      if (isCryptoAsset(updatedAsset.name)) {
        fetchCurrentPrice();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await assetService.deleteAsset(asset.id);
      onDelete(asset.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      alert('Error deleting asset: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const formatPriceChange = (change: number): string => {
    const percent = (change / asset.pricePerUnit) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
  };

  if (isEditing) {
    return (
      <div className="glass-card p-6 border-2 border-green-500/30">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold gradient-text">Edit Asset</h3>
          <button
            onClick={handleCancel}
            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
          >
            <X size={20} className="text-gray-300" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="form-label">Asset Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="form-input"
                step="0.000001"
                min="0"
                required
              />
            </div>

            <div>
              <label className="form-label">Price/Unit ($)</label>
              <input
                type="number"
                name="pricePerUnit"
                value={formData.pricePerUnit}
                onChange={handleChange}
                className="form-input"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="btn btn-secondary flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary flex-1 flex-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Saving...'
              ) : (
                <>
                  <Check size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 hover:shadow-lg transition-all duration-300 group relative">
      {/* Action Menu */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical size={16} className="text-gray-300" />
        </button>
        
        {showActions && (
          <div className="absolute right-0 top-10 bg-gray-800/90 backdrop-blur-sm border border-gray-700/50 rounded-lg shadow-lg py-2 z-10 min-w-[120px]">
            {isCryptoAsset(asset.name) && (
              <button
                onClick={fetchCurrentPrice}
                className="w-full px-4 py-2 text-left hover:bg-gray-700/50 flex items-center gap-2 text-sm text-gray-300"
                disabled={isUpdatingPrice}
              >
                <RefreshCw size={14} className={isUpdatingPrice ? 'animate-spin' : ''} />
                {isUpdatingPrice ? 'Updating...' : 'Update Price'}
              </button>
            )}
            <button
              onClick={handleEdit}
              className="w-full px-4 py-2 text-left hover:bg-gray-700/50 flex items-center gap-2 text-sm text-gray-300"
            >
              <Edit size={14} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left hover:bg-gray-700/50 flex items-center gap-2 text-sm text-red-400"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Asset Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {coinImage ? (
            <img 
              src={coinImage} 
              alt={asset.name}
              className="w-12 h-12 rounded-xl object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center ${coinImage ? 'hidden' : ''}`}>
            <Package size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{asset.name}</h3>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-400">
            ${currentTotalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-gray-400">Total Value</div>
        </div>
      </div>

      {/* Price Information */}
      {isCryptoAsset(asset.name) && currentPrice && (
        <div className="mb-4 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-400">Current Price</span>
            <span className="text-sm font-bold text-blue-400">
              ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          {priceChange !== null && (
            <div className="flex items-center gap-2">
              {priceChange >= 0 ? (
                <TrendingUp size={14} className="text-green-400" />
              ) : (
                <TrendingDown size={14} className="text-red-400" />
              )}
              <span className={`text-sm font-medium ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatPriceChange(priceChange)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Asset Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/20">
          <div className="flex items-center gap-2 mb-1">
            <Package size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-400">Quantity</span>
          </div>
          <div className="text-lg font-semibold text-white">
            {asset.quantity.toLocaleString('en-US', { 
              minimumFractionDigits: 0, 
              maximumFractionDigits: 6 
            })}
          </div>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/20">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-400">Price/Unit</span>
          </div>
          <div className="text-lg font-semibold text-white">
            ${asset.pricePerUnit.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </div>
        </div>
      </div>

      {/* Portfolio Share */}
      <div className="pt-4 border-t border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-green-400" />
            <span className="text-sm text-gray-400">Portfolio Share</span>
          </div>
          <div className="text-sm font-medium text-white">
            {((currentTotalValue / 10000) * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Asset"
        message={`Are you sure you want to delete "${asset.name}" from your portfolio? This action cannot be undone.`}
        confirmText="Delete Asset"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
        type="danger"
      />
    </div>
  );
};

export default AssetCard; 
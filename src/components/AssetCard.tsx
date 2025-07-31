import React, { useState } from 'react';
import { TrendingUp, DollarSign, Package, Edit, Trash2, MoreVertical, X, Check } from 'lucide-react';
import { Asset } from '../types';

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

  const totalValue = asset.quantity * asset.pricePerUnit;

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${asset.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/assets/${asset.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }

      onDelete(asset.id);
    } catch (err) {
      alert('Error deleting asset: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  if (isEditing) {
    return (
      <div className="card border-2 border-blue-200 bg-blue-50">
        <div className="flex-between mb-4">
          <h3 className="text-xl font-bold text-blue-800">Edit Asset</h3>
          <button
            onClick={handleCancel}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="form-label text-blue-800">Asset Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input border-blue-300 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label text-blue-800">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="form-input border-blue-300 focus:border-blue-500"
                step="0.000001"
                min="0"
                required
              />
            </div>

            <div>
              <label className="form-label text-blue-800">Price/Unit ($)</label>
              <input
                type="number"
                name="pricePerUnit"
                value={formData.pricePerUnit}
                onChange={handleChange}
                className="form-input border-blue-300 focus:border-blue-500"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
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
    <div className="card hover:shadow-lg transition-all duration-300 group relative">
      {/* Action Menu */}
      <div className="absolute top-4 right-4">
        <button
          onClick={() => setShowActions(!showActions)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical size={16} className="text-gray-600" />
        </button>
        
        {showActions && (
          <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10 min-w-[120px]">
            <button
              onClick={handleEdit}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
            >
              <Edit size={14} />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-red-600"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Asset Header */}
      <div className="flex-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Package size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">{asset.name}</h3>
            <p className="text-sm text-gray-500">Asset #{asset.id}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-gray-500">Total Value</div>
        </div>
      </div>

      {/* Asset Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Package size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Quantity</span>
          </div>
          <div className="text-lg font-semibold text-gray-800">
            {asset.quantity.toLocaleString('en-US', { 
              minimumFractionDigits: 0, 
              maximumFractionDigits: 6 
            })}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-600">Price/Unit</span>
          </div>
          <div className="text-lg font-semibold text-gray-800">
            ${asset.pricePerUnit.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </div>
        </div>
      </div>

      {/* Portfolio Share */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-green-500" />
            <span className="text-sm text-gray-600">Portfolio Share</span>
          </div>
          <div className="text-sm font-medium text-gray-800">
            {((totalValue / 10000) * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetCard; 
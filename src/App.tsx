import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw, Search, Filter, TrendingUp, Zap } from 'lucide-react';
import AssetForm from './components/AssetForm';
import AssetCard from './components/AssetCard';
import PortfolioSummary from './components/PortfolioSummary';
import EmptyState from './components/EmptyState';
import CryptoPriceUpdate from './components/CryptoPriceUpdate';
import { Asset, AssetWithPrice } from './types';

function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'quantity' | 'price'>('name');
  const [assetsWithPrices, setAssetsWithPrices] = useState<AssetWithPrice[]>([]);

  // Fetch assets and total value from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch assets
      const assetsResponse = await fetch('/api/assets');
      if (!assetsResponse.ok) {
        throw new Error('Failed to fetch assets');
      }
      const assetsData = await assetsResponse.json();

      // Fetch total value
      const totalResponse = await fetch('/api/assets/total');
      if (!totalResponse.ok) {
        throw new Error('Failed to fetch total value');
      }
      const totalData = await totalResponse.json();

      setAssets(assetsData);
      setTotalValue(totalData);
      setAssetsWithPrices(assetsData.map((asset: Asset) => ({ ...asset })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle adding new asset
  const handleAssetAdded = (newAsset: Asset) => {
    setAssets(prev => [...prev, newAsset]);
    setAssetsWithPrices(prev => [...prev, { ...newAsset }]);
    // Recalculate total value
    const newTotal = totalValue + (newAsset.quantity * newAsset.pricePerUnit);
    setTotalValue(newTotal);
  };

  // Handle updating asset
  const handleAssetUpdated = (updatedAsset: Asset) => {
    setAssets(prev => prev.map(asset => 
      asset.id === updatedAsset.id ? updatedAsset : asset
    ));
    setAssetsWithPrices(prev => prev.map(asset => 
      asset.id === updatedAsset.id ? { ...updatedAsset } : asset
    ));
    // Recalculate total value
    const newTotal = assets.reduce((total, asset) => {
      if (asset.id === updatedAsset.id) {
        return total + (updatedAsset.quantity * updatedAsset.pricePerUnit);
      }
      return total + (asset.quantity * asset.pricePerUnit);
    }, 0);
    setTotalValue(newTotal);
  };

  // Handle deleting asset
  const handleAssetDeleted = (assetId: number) => {
    const deletedAsset = assets.find(asset => asset.id === assetId);
    setAssets(prev => prev.filter(asset => asset.id !== assetId));
    setAssetsWithPrices(prev => prev.filter(asset => asset.id !== assetId));
    // Recalculate total value
    if (deletedAsset) {
      const newTotal = totalValue - (deletedAsset.quantity * deletedAsset.pricePerUnit);
      setTotalValue(newTotal);
    }
  };

  // Handle crypto price updates
  const handleCryptoPriceUpdate = (updatedAssets: AssetWithPrice[]) => {
    setAssetsWithPrices(prev => {
      const updated = [...prev];
      updatedAssets.forEach(updatedAsset => {
        const index = updated.findIndex(asset => asset.id === updatedAsset.id);
        if (index !== -1) {
          updated[index] = updatedAsset;
        }
      });
      return updated;
    });

    // Recalculate total value with current prices
    const newTotal = updatedAssets.reduce((total, asset) => {
      const price = asset.currentPrice || asset.pricePerUnit;
      return total + (asset.quantity * price);
    }, 0) + assets.filter(asset => !updatedAssets.find(ua => ua.id === asset.id))
      .reduce((total, asset) => total + (asset.quantity * asset.pricePerUnit), 0);

    setTotalValue(newTotal);
  };

  // Handle form close
  const handleCloseForm = () => {
    setShowForm(false);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchData();
  };

  // Filter and sort assets
  const filteredAndSortedAssets = assets
    .filter(asset => 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'value':
          return (b.quantity * b.pricePerUnit) - (a.quantity * a.pricePerUnit);
        case 'quantity':
          return b.quantity - a.quantity;
        case 'price':
          return b.pricePerUnit - a.pricePerUnit;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container">
        {/* Header */}
        <div className="flex-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <TrendingUp size={40} className="text-yellow-400" />
              Portfolio Tracker
            </h1>
            <p className="text-white text-opacity-90">
              Track and manage your investment portfolio with real-time crypto prices
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleRefresh}
              className="btn btn-secondary flex-center gap-2"
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary flex-center gap-2"
            >
              <Plus size={16} />
              Add Asset
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="card mb-6 p-4 bg-red-50 border border-red-200">
            <p className="text-red-700">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Portfolio Summary */}
        <PortfolioSummary totalValue={totalValue} assets={assets} />

        {/* Crypto Price Update Section */}
        <CryptoPriceUpdate 
          assets={assets} 
          onPriceUpdate={handleCryptoPriceUpdate}
        />

        {/* Search and Filter Section */}
        {assets.length > 0 && (
          <div className="card mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'value' | 'quantity' | 'price')}
                  className="form-input min-w-[120px]"
                >
                  <option value="name">Sort by Name</option>
                  <option value="value">Sort by Value</option>
                  <option value="quantity">Sort by Quantity</option>
                  <option value="price">Sort by Price</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Assets Section */}
        <div className="mb-8">
          <div className="flex-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Your Assets ({filteredAndSortedAssets.length})
            </h2>
            {assets.length > 0 && (
              <p className="text-white text-opacity-80">
                Total Value: ${totalValue.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </p>
            )}
          </div>

          {/* Assets Grid */}
          {assets.length === 0 ? (
            <EmptyState onAddAsset={() => setShowForm(true)} />
          ) : filteredAndSortedAssets.length === 0 ? (
            <div className="card text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={48} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                No Assets Found
              </h3>
              <p className="text-gray-600 mb-8">
                No assets match your search criteria. Try adjusting your search terms.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="btn btn-primary"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-2">
              {filteredAndSortedAssets.map((asset) => (
                <AssetCard 
                  key={asset.id} 
                  asset={asset}
                  onUpdate={handleAssetUpdated}
                  onDelete={handleAssetDeleted}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add Asset Form Modal */}
        {showForm && (
          <AssetForm
            onAssetAdded={handleAssetAdded}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </div>
  );
}

export default App; 
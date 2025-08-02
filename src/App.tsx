import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, Search, Filter, TrendingUp, Zap, Coins, 
  BarChart3, PieChart, Shield, Settings, LogOut, Menu, X,
  DollarSign, TrendingDown, Activity, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import AssetCard from './components/AssetCard';
import PortfolioSummary from './components/PortfolioSummary';
import EmptyState from './components/EmptyState';
import CryptoPriceUpdate from './components/CryptoPriceUpdate';
import CoinsPage from './components/CoinsPage';
import { Asset, AssetWithPrice } from './types';

function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'quantity' | 'price'>('name');
  const [assetsWithPrices, setAssetsWithPrices] = useState<AssetWithPrice[]>([]);
  const [currentPage, setCurrentPage] = useState<string>('portfolio');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          updated[index] = { ...updated[index], ...updatedAsset };
        }
      });
      return updated;
    });

    // Recalculate total value with current prices
    const newTotal = updatedAssets.reduce((total, asset) => {
      const price = asset.currentPrice || asset.pricePerUnit;
      return total + (asset.quantity * price);
    }, 0);
    setTotalValue(newTotal);
  };

  const handleRefresh = () => {
    fetchData();
  };

  // Handle navigation
  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    setSidebarOpen(false); // Close sidebar on mobile
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Show Coins Page if currentPage is 'coins' */}
      {currentPage === 'coins' ? (
        <CoinsPage onBack={() => handlePageChange('portfolio')} onAssetAdded={handleAssetAdded} />
      ) : (
        <>
          {/* Portfolio Header */}
          <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <DollarSign size={20} className="text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Investment Tracker
                </h1>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                >
                  <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
                <button 
                  onClick={() => handlePageChange('coins')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  Top Coins
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                <p className="text-red-400">
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
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1 relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search assets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-3 pl-10 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter size={20} className="text-gray-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'name' | 'value' | 'quantity' | 'price')}
                      className="px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Your Assets ({filteredAndSortedAssets.length})
                </h2>
                {assets.length > 0 && (
                  <p className="text-gray-300">
                    Total Value: ${totalValue.toLocaleString('en-US', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </p>
                )}
              </div>

              {/* Assets Grid */}
              {assets.length === 0 ? (
                <EmptyState onAddAsset={() => handlePageChange('coins')} />
              ) : filteredAndSortedAssets.length === 0 ? (
                <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/30 rounded-xl p-12 text-center">
                  <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search size={48} className="text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">
                    No Assets Found
                  </h3>
                  <p className="text-gray-400 mb-8">
                    No assets match your search criteria. Try adjusting your search terms.
                  </p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>
        </>
      )}
    </div>
  );
}

export default App; 
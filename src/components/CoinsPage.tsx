import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Loader2, Coins, Plus, TrendingUp, Sparkles, Star, Zap, Target } from 'lucide-react';
import { Coin, Asset } from '../types';
import { assetService } from '../services/api';
import Toast from './Toast';
import PriceHistoryChart from './PriceHistoryChart';

interface CoinsPageProps {
  onBack: () => void;
  onAssetAdded: (asset: Omit<Asset, 'id'>) => void;
}

const CoinsPage: React.FC<CoinsPageProps> = ({ onBack, onAssetAdded }) => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [filteredCoins, setFilteredCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const coinsPerPage = 50;
  const [quantities, setQuantities] = useState<{ [key: string]: string }>({});
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });
  const [selectedCoinForChart, setSelectedCoinForChart] = useState<Coin | null>(null);

  // Fetch top 300 coins from backend
  const fetchCoins = async () => {
    try {
      setLoading(true);
      setError('');
      const coinsData = await assetService.getTopCoins();
      setCoins(coinsData);
      setFilteredCoins(coinsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch top coins');
      console.error('Error fetching top coins:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load coins on component mount
  useEffect(() => {
    fetchCoins();
  }, []);

  // Filter coins based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCoins(coins);
    } else {
      const filtered = coins.filter(coin =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCoins(filtered);
    }
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, coins]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCoins.length / coinsPerPage);
  const startIndex = (currentPage - 1) * coinsPerPage;
  const endIndex = startIndex + coinsPerPage;
  const currentCoins = filteredCoins.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleViewPriceHistory = (coin: Coin) => {
    setSelectedCoinForChart(coin);
  };

  const handleClosePriceHistory = () => {
    setSelectedCoinForChart(null);
  };

  const handleAddToPortfolio = async (coin: Coin) => {
    const quantity = quantities[coin.id] || '';
    
    if (!quantity.trim()) {
      setToast({
        message: 'Please enter a quantity first',
        type: 'error',
        isVisible: true
      });
      return;
    }

    try {
      const quantityNum = parseFloat(quantity);
      const currentPrice = coin.current_price || 0;
      const purchasePricePerUnit = currentPrice; // Use current market price as purchase price
      const initialInvestment = quantityNum * purchasePricePerUnit;

      // Ensure all required fields are present and valid
      const assetData = {
        name: coin.name,
        quantity: quantityNum,
        pricePerUnit: currentPrice,
        purchasePricePerUnit: purchasePricePerUnit,
        initialInvestment: initialInvestment
      };

      console.log('Adding asset with data:', assetData); // Debug log

      onAssetAdded(assetData);
      
      // Clear the form field
      setQuantities(prev => ({
        ...prev,
        [coin.id]: ''
      }));

      setToast({
        message: `${coin.name} added successfully!`,
        type: 'success',
        isVisible: true
      });
    } catch (error) {
      console.error('Error adding asset:', error);
      setToast({
        message: 'Error adding asset: ' + (error instanceof Error ? error.message : 'Unknown error'),
        type: 'error',
        isVisible: true
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_50%)]"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={onBack}
              className="group relative px-6 py-3 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl text-white font-medium transition-all duration-300 hover:from-gray-800/80 hover:to-gray-700/80 hover:border-gray-600/50 hover:shadow-lg hover:shadow-gray-900/50"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
                <span>Back to Portfolio</span>
              </div>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40">
                <Coins size={24} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Top Coins
              </h1>
            </div>
          </div>

          {/* Loading State */}
          <div className="glass-card p-16 text-center max-w-2xl mx-auto">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg shadow-blue-600/40">
                <Loader2 size={32} className="animate-spin text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full animate-bounce"></div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Loading Top Coins
            </h3>
            <p className="text-gray-300 text-lg">
              Fetching the latest cryptocurrency data...
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 via-purple-600/20 to-blue-600/20 animate-pulse"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={onBack}
              className="group relative px-6 py-3 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl text-white font-medium transition-all duration-300 hover:from-gray-800/80 hover:to-gray-700/80 hover:border-gray-600/50 hover:shadow-lg hover:shadow-gray-900/50"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
                <span>Back to Portfolio</span>
              </div>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-600/40">
                <Coins size={24} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Top Coins
              </h1>
            </div>
          </div>

          {/* Error State */}
          <div className="glass-card p-16 text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/40">
              <Coins size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Error Loading Top Coins
            </h3>
            <p className="text-gray-300 mb-8 text-lg">{error}</p>
            <button
              onClick={fetchCoins}
              className="px-8 py-4 bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md border border-red-500/30"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_50%)]"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="group relative px-6 py-3 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl text-white font-medium transition-all duration-300 hover:from-gray-800/80 hover:to-gray-700/80 hover:border-gray-600/50 hover:shadow-lg hover:shadow-gray-900/50"
            >
              <div className="flex items-center gap-2">
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform duration-300" />
                <span>Back to Portfolio</span>
              </div>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40">
                <Coins size={24} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Top 300 Coins
              </h1>
            </div>
          </div>
          
          {/* Stats */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="px-4 py-2 bg-gradient-to-r from-blue-600/30 to-indigo-600/30 backdrop-blur-sm border border-blue-600/40 rounded-xl">
              <div className="text-sm text-blue-300">Total Coins</div>
              <div className="text-lg font-bold text-white">{coins.length.toLocaleString()}</div>
            </div>
            <div className="px-4 py-2 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 backdrop-blur-sm border border-indigo-600/40 rounded-xl">
              <div className="text-sm text-indigo-300">Filtered</div>
              <div className="text-lg font-bold text-white">{filteredCoins.length.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="glass-card p-8 mb-8 border border-blue-600/30">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <Search size={20} className="text-blue-400" />
            </div>
            <input
              type="text"
              placeholder="Search coins by name, symbol, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-blue-600/40 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {filteredCoins.length.toLocaleString()} of {coins.length.toLocaleString()} coins
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-blue-400" />
              <span className="text-sm text-blue-400">Live Data</span>
            </div>
          </div>
        </div>

        {/* Coins Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {currentCoins.map((coin, index) => (
            <div 
              key={coin.id} 
              className="group relative glass-card hover:shadow-2xl hover:shadow-blue-600/30 transition-all duration-500 overflow-hidden border border-blue-600/30 hover:border-blue-500/50"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative p-6">
                {/* Coin Info Row */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {coin.image ? (
                        <img 
                          src={coin.image} 
                          alt={coin.name}
                          className="w-12 h-12 rounded-2xl object-cover shadow-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg ${coin.image ? 'hidden' : ''}`}>
                        <span className="text-white font-bold text-sm">
                          {coin.symbol.toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors duration-300">
                        {coin.name}
                      </h3>
                      <p className="text-sm text-gray-400 font-medium">
                        {coin.symbol.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Price and Change */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-white mb-1">
                      ${coin.current_price?.toLocaleString('en-US', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 6 
                      })}
                    </div>
                    {coin.price_change_percentage_24h && (
                      <div className={`text-sm font-bold px-2 py-1 rounded-lg ${
                        coin.price_change_percentage_24h >= 0 
                          ? 'bg-green-600/30 text-green-400 border border-green-500/40' 
                          : 'bg-red-600/30 text-red-400 border border-red-500/40'
                      }`}>
                        {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                        {coin.price_change_percentage_24h.toFixed(2)}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Market Cap */}
                {coin.market_cap && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-xl border border-gray-700/50">
                    <div className="text-xs text-gray-400 mb-1">Market Cap</div>
                    <div className="text-sm font-semibold text-white">
                      ${(coin.market_cap / 1e9).toFixed(2)}B
                    </div>
                  </div>
                )}

                {/* Add to Portfolio Section */}
                <div className="space-y-3">
                  {/* Quantity Input */}
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Enter quantity"
                      value={quantities[coin.id] || ''}
                      className="w-full px-4 py-3 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-blue-600/40 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-white placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      step="0.000001"
                      min="0"
                      onChange={(e) => {
                        const value = e.target.value;
                        setQuantities(prev => ({
                          ...prev,
                          [coin.id]: value
                        }));
                      }}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xs text-blue-400 font-bold">
                      {coin.symbol.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewPriceHistory(coin)}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md border border-indigo-500/40 flex items-center justify-center gap-2"
                    >
                      <TrendingUp size={16} />
                      Chart
                    </button>
                    
                    <button
                      onClick={() => handleAddToPortfolio(coin)}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md border border-green-500/40 flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="glass-card p-6 border border-blue-600/30">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages} 
                ({startIndex + 1}-{Math.min(endIndex, filteredCoins.length)} of {filteredCoins.length})
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white font-medium transition-all duration-300 hover:from-gray-800/80 hover:to-gray-700/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/40'
                            : 'bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 text-gray-300 hover:from-gray-800/80 hover:to-gray-700/80'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-gray-700/50 rounded-xl text-white font-medium transition-all duration-300 hover:from-gray-800/80 hover:to-gray-700/80 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={closeToast}
        />

        {/* Price History Chart Modal */}
        {selectedCoinForChart && (
          <PriceHistoryChart
            selectedCoin={selectedCoinForChart}
            onClose={handleClosePriceHistory}
          />
        )}
      </div>
    </div>
  );
};

export default CoinsPage; 
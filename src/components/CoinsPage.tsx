import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Loader2, Coins, Plus } from 'lucide-react';
import { Coin, Asset } from '../types';
import { assetService } from '../services/api';
import Toast from './Toast';

interface CoinsPageProps {
  onBack: () => void;
  onAssetAdded: (asset: Asset) => void;
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

  // Fetch top 300 coins from CoinGecko
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
      const newAsset = await assetService.addAsset({
        name: coin.name, // Use the correct name from API
        quantity: parseFloat(quantity),
        pricePerUnit: coin.current_price || 0
      });

      onAssetAdded(newAsset);
      // Clear the specific coin's quantity
      setQuantities(prev => ({
        ...prev,
        [coin.id]: ''
      }));
      setToast({
        message: `🎉 ${coin.name} successfully added to your portfolio!`,
        type: 'success',
        isVisible: true
      });
    } catch (error) {
      setToast({
        message: 'Error adding asset: ' + (error instanceof Error ? error.message : 'Unknown error'),
        type: 'error',
        isVisible: true
      });
    }
  };





  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={onBack}
              className="btn btn-secondary flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back to Portfolio
            </button>
            <h1 className="text-3xl font-bold text-white">All Coins</h1>
          </div>

          {/* Loading State */}
          <div className="glass-card p-12 text-center">
            <Loader2 size={48} className="animate-spin text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Loading Top Coins...
            </h3>
            <p className="text-gray-400">
              Fetching top 300 coins from CoinGecko API
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={onBack}
              className="btn btn-secondary flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              Back to Portfolio
            </button>
            <h1 className="text-3xl font-bold text-white">All Coins</h1>
          </div>

          {/* Error State */}
          <div className="glass-card p-12 text-center">
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Coins size={48} className="text-red-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Error Loading Top Coins
            </h3>
            <p className="text-gray-400 mb-8">{error}</p>
            <button
              onClick={fetchCoins}
              className="btn btn-primary"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="btn btn-secondary flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Back to Portfolio
          </button>
          <h1 className="text-3xl font-bold text-white">Top 300 Coins</h1>
        </div>

        {/* Search Bar */}
        <div className="glass-card p-6 mb-6">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search coins by name, symbol, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredCoins.length.toLocaleString()} of {coins.length.toLocaleString()} coins
          </div>
        </div>

        {/* Coins Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
          {currentCoins.map((coin) => (
            <div key={coin.id} className="glass-card hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="p-6">
                {/* Coin Info Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {coin.image ? (
                      <img 
                        src={coin.image} 
                        alt={coin.name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center ${coin.image ? 'hidden' : ''}`}>
                      <span className="text-white font-bold text-xs">
                        {coin.symbol.toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-base">
                        {coin.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {coin.symbol.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Price and Change */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      ${coin.current_price?.toLocaleString('en-US', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 6 
                      })}
                    </div>
                    {coin.price_change_percentage_24h && (
                      <div className={`text-sm font-medium ${
                        coin.price_change_percentage_24h >= 0 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                        {coin.price_change_percentage_24h.toFixed(2)}%
                      </div>
                    )}
                  </div>
                </div>

                {/* Add to Portfolio Section */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      placeholder="Enter quantity"
                      value={quantities[coin.id] || ''}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 text-sm text-white placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 font-medium">
                      {coin.symbol.toUpperCase()}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleAddToPortfolio(coin)}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md border border-green-400/20 whitespace-nowrap"
                  >
                    Add to Portfolio
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages} 
                ({startIndex + 1}-{Math.min(endIndex, filteredCoins.length)} of {filteredCoins.length})
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                  className="btn btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

      </div>
    </div>
  );
};

export default CoinsPage; 
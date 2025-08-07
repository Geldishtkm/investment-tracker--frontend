import React, { useState, useEffect } from 'react';
import { assetService } from './services/api';
import { authService } from './services/authService';
import { Asset, AssetWithPrice, User } from './types';
import AssetCard from './components/AssetCard';
import PortfolioSummary from './components/PortfolioSummary';
import EmptyState from './components/EmptyState';
import CoinsPage from './components/CoinsPage';
import AnalyticsPage from './components/AnalyticsPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';

// Inline Toast component for App.tsx
const AppToast: React.FC<{
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}> = ({ type, message, onClose }) => {
  const bgColor = type === 'success' 
    ? 'bg-gradient-to-r from-green-500/90 to-emerald-600/90' 
    : type === 'error'
    ? 'bg-gradient-to-r from-red-500/90 to-red-600/90'
    : 'bg-gradient-to-r from-blue-500/90 to-blue-600/90';
  
  const borderColor = type === 'success' 
    ? 'border-green-400/30' 
    : type === 'error'
    ? 'border-red-400/30'
    : 'border-blue-400/30';

  return (
    <div className={`${bgColor} backdrop-blur-sm border ${borderColor} rounded-xl p-4 shadow-2xl min-w-[320px] max-w-[400px] animate-in slide-in-from-right-full duration-300`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm leading-relaxed">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

type Page = 'portfolio' | 'coins' | 'analytics';
type AuthPage = 'login' | 'register';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetsWithPrices, setAssetsWithPrices] = useState<AssetWithPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('portfolio');
  const [currentAuthPage, setCurrentAuthPage] = useState<AuthPage>('login');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Check authentication on app load
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        loadAssets();
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      console.log('App: Loading assets...'); // Debug log
      
      const assetsData = await assetService.getAllAssets();
      console.log('App: Assets loaded successfully:', assetsData); // Debug log
      setAssets(assetsData);
      
      // Load assets with current prices
      try {
        const assetsWithPricesData = await assetService.getAllAssetsWithPrices();
        console.log('App: Assets with prices loaded successfully:', assetsWithPricesData); // Debug log
        
        // If we got assets with prices, use them; otherwise use regular assets
        if (assetsWithPricesData && assetsWithPricesData.length > 0) {
          setAssetsWithPrices(assetsWithPricesData);
        } else {
          // Fallback to regular assets
          console.log('App: Using regular assets as fallback');
          setAssetsWithPrices(assetsData.map(asset => ({
            ...asset,
            currentPrice: asset.pricePerUnit,
            priceChange: 0,
            priceChangePercent: 0
          })));
        }
      } catch (pricesError) {
        console.log('App: Error loading assets with prices, using fallback:', pricesError);
        // Fallback to regular assets
        setAssetsWithPrices(assetsData.map(asset => ({
          ...asset,
          currentPrice: asset.pricePerUnit,
          priceChange: 0,
          priceChangePercent: 0
        })));
      }
    } catch (error) {
      console.error('App: Error loading assets:', error);
      showToast('error', 'Failed to load assets: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddAsset = async (asset: Omit<Asset, 'id'>) => {
    try {
      console.log('App: Adding asset with data:', asset); // Debug log
      
      const savedAsset = await assetService.addAsset(asset);
      console.log('App: Asset saved successfully:', savedAsset); // Debug log
      
      await loadAssets();
      showToast('success', 'Asset added successfully!');
    } catch (error) {
      console.error('App: Error adding asset:', error);
      showToast('error', 'Failed to add asset: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleUpdateAsset = async (id: number, asset: Omit<Asset, 'id'>) => {
    try {
      await assetService.updateAsset(id, asset);
      await loadAssets();
      showToast('success', 'Asset updated successfully!');
    } catch (error) {
      console.error('Error updating asset:', error);
      showToast('error', 'Failed to update asset');
    }
  };

  const handleDeleteAsset = async (id: number, assetName: string) => {
    try {
      await assetService.deleteAsset(id);
      await loadAssets();
      showToast('success', `${assetName} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting asset:', error);
      showToast('error', `Failed to delete ${assetName}`);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    showToast('success', 'Login successful! Welcome back.');
    loadAssets();
  };

  const handleRegisterSuccess = () => {
    showToast('success', 'Account created successfully! Please log in.');
    setCurrentAuthPage('login');
  };

  const handleLogout = () => {
    authService.removeToken();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAssets([]);
    setAssetsWithPrices([]);
    showToast('success', 'Logged out successfully');
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Show authentication pages if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900">
        {currentAuthPage === 'login' ? (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setCurrentAuthPage('register')}
          />
        ) : (
          <RegisterPage
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setCurrentAuthPage('login')}
          />
        )}
        
        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <AppToast
              key={toast.id}
              type={toast.type}
              message={toast.message}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-green-400">💰 Portfolio Tracker</h1>
              {currentUser && (
                <span className="ml-4 text-sm text-gray-300">
                  Welcome, {currentUser.username}!
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('portfolio')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'portfolio'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                📊 Portfolio
              </button>
              <button
                onClick={() => setCurrentPage('coins')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'coins'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                🪙 Top Coins
              </button>
              <button
                onClick={() => setCurrentPage('analytics')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 'analytics'
                    ? 'bg-green-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                📈 Analytics
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'portfolio' && (
          <>
            <PortfolioSummary assets={assetsWithPrices} />
            {assets.length === 0 ? (
              <EmptyState onAddAsset={() => setCurrentPage('coins')} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {assetsWithPrices.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    onUpdate={(updatedAsset) => handleUpdateAsset(asset.id, {
                      name: updatedAsset.name,
                      quantity: updatedAsset.quantity,
                      pricePerUnit: updatedAsset.pricePerUnit,
                      purchasePricePerUnit: updatedAsset.purchasePricePerUnit,
                      initialInvestment: updatedAsset.initialInvestment
                    })}
                    onDelete={handleDeleteAsset}
                    onShowToast={showToast}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {currentPage === 'coins' && (
          <CoinsPage
            onBack={() => setCurrentPage('portfolio')}
            onAssetAdded={(asset) => handleAddAsset({
              name: asset.name,
              quantity: asset.quantity,
              pricePerUnit: asset.pricePerUnit,
              purchasePricePerUnit: asset.purchasePricePerUnit,
              initialInvestment: asset.initialInvestment
            })}
          />
        )}

        {currentPage === 'analytics' && (
          <AnalyticsPage />
        )}
      </main>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <AppToast
            key={toast.id}
            type={toast.type}
            message={toast.message}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default App; 
import React from 'react';
import { DollarSign, TrendingUp, Package, BarChart3, Target, Activity } from 'lucide-react';
import { Asset, AssetWithPrice } from '../types';

interface PortfolioSummaryProps {
  assets: AssetWithPrice[];
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ assets }) => {
  const assetCount = assets.length;
  const totalValue = assets.reduce((sum, asset) => {
    const currentPrice = asset.currentPrice || asset.pricePerUnit;
    return sum + (asset.quantity * currentPrice);
  }, 0);
  const averageValue = assetCount > 0 ? totalValue / assetCount : 0;
  
  // Calculate additional statistics
  const totalQuantity = assets.reduce((sum, asset) => sum + asset.quantity, 0);
  const averagePrice = assets.length > 0 
    ? assets.reduce((sum, asset) => sum + asset.pricePerUnit, 0) / assets.length 
    : 0;
  
  // Find highest and lowest value assets
  const highestValueAsset = assets.length > 0 
    ? assets.reduce((max, asset) => 
        (asset.quantity * asset.pricePerUnit) > (max.quantity * max.pricePerUnit) ? asset : max
      ) 
    : null;
  
  const lowestValueAsset = assets.length > 0 
    ? assets.reduce((min, asset) => 
        (asset.quantity * asset.pricePerUnit) < (min.quantity * min.pricePerUnit) ? asset : min
      ) 
    : null;

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Portfolio Value */}
        <div className="glass-card p-6 bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign size={24} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Total Value</h3>
                <p className="text-sm text-gray-400">Portfolio worth</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-400">
              ${totalValue.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
          </div>
        </div>

        {/* Number of Assets */}
        <div className="glass-card p-6 bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Package size={24} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Assets</h3>
                <p className="text-sm text-gray-400">Total holdings</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-400">
              {assetCount}
            </div>
          </div>
        </div>

        {/* Average Value */}
        <div className="glass-card p-6 bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 size={24} className="text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Average</h3>
                <p className="text-sm text-gray-400">Per asset</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-400">
              ${averageValue.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      {assets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Detailed Stats */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity size={20} className="text-blue-400" />
              Portfolio Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                <span className="text-gray-400">Total Quantity</span>
                <span className="font-semibold text-white">
                  {totalQuantity.toLocaleString('en-US', { 
                    minimumFractionDigits: 0, 
                    maximumFractionDigits: 6 
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                <span className="text-gray-400">Average Price/Unit</span>
                <span className="font-semibold text-white">
                  ${averagePrice.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Portfolio Diversity</span>
                <span className="font-semibold text-white">
                  {assetCount} {assetCount === 1 ? 'Asset' : 'Assets'}
                </span>
              </div>
            </div>
          </div>

          {/* Top Holdings */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target size={20} className="text-green-400" />
              Top Holdings
            </h3>
            <div className="space-y-4">
              {highestValueAsset && (
                <div className="flex justify-between items-center py-2 border-b border-gray-700/50">
                  <div>
                    <span className="text-gray-400">Highest Value</span>
                    <div className="text-sm text-gray-500">{highestValueAsset.name}</div>
                  </div>
                  <span className="font-semibold text-green-400">
                    ${(highestValueAsset.quantity * highestValueAsset.pricePerUnit).toLocaleString('en-US', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </span>
                </div>
              )}
              {lowestValueAsset && lowestValueAsset.id !== highestValueAsset?.id && (
                <div className="flex justify-between items-center py-2">
                  <div>
                    <span className="text-gray-400">Lowest Value</span>
                    <div className="text-sm text-gray-500">{lowestValueAsset.name}</div>
                  </div>
                  <span className="font-semibold text-orange-400">
                    ${(lowestValueAsset.quantity * lowestValueAsset.pricePerUnit).toLocaleString('en-US', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioSummary; 
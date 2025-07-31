import React from 'react';
import { DollarSign, TrendingUp, Package, BarChart3, Target, Activity } from 'lucide-react';
import { Asset } from '../types';

interface PortfolioSummaryProps {
  totalValue: number;
  assets: Asset[];
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ totalValue, assets }) => {
  const assetCount = assets.length;
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
      <div className="grid grid-3 gap-6">
        {/* Total Portfolio Value */}
        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <DollarSign size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Total Value</h3>
                <p className="text-sm opacity-90">Portfolio worth</p>
              </div>
            </div>
            <div className="text-3xl font-bold">
              ${totalValue.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </div>
          </div>
        </div>

        {/* Number of Assets */}
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Package size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Assets</h3>
                <p className="text-sm opacity-90">Total holdings</p>
              </div>
            </div>
            <div className="text-3xl font-bold">
              {assetCount}
            </div>
          </div>
        </div>

        {/* Average Value */}
        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <BarChart3 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Average</h3>
                <p className="text-sm opacity-90">Per asset</p>
              </div>
            </div>
            <div className="text-3xl font-bold">
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
        <div className="grid grid-2 gap-6">
          {/* Detailed Stats */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              Portfolio Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Total Quantity</span>
                <span className="font-semibold text-gray-800">
                  {totalQuantity.toLocaleString('en-US', { 
                    minimumFractionDigits: 0, 
                    maximumFractionDigits: 6 
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Average Price/Unit</span>
                <span className="font-semibold text-gray-800">
                  ${averagePrice.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Portfolio Diversity</span>
                <span className="font-semibold text-gray-800">
                  {assetCount} {assetCount === 1 ? 'Asset' : 'Assets'}
                </span>
              </div>
            </div>
          </div>

          {/* Top Holdings */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Target size={20} className="text-green-600" />
              Top Holdings
            </h3>
            <div className="space-y-4">
              {highestValueAsset && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <span className="text-gray-600">Highest Value</span>
                    <div className="text-sm text-gray-500">{highestValueAsset.name}</div>
                  </div>
                  <span className="font-semibold text-green-600">
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
                    <span className="text-gray-600">Lowest Value</span>
                    <div className="text-sm text-gray-500">{lowestValueAsset.name}</div>
                  </div>
                  <span className="font-semibold text-orange-600">
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
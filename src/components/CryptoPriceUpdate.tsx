import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, DollarSign, Zap } from 'lucide-react';
import { Asset, AssetWithPrice } from '../types';
import { assetService } from '../services/api';

interface CryptoPriceUpdateProps {
  assets: Asset[];
  onPriceUpdate: (updatedAssets: AssetWithPrice[]) => void;
}

const CryptoPriceUpdate: React.FC<CryptoPriceUpdateProps> = ({ assets, onPriceUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [cryptoAssets, setCryptoAssets] = useState<AssetWithPrice[]>([]);
  const [totalValueChange, setTotalValueChange] = useState<number>(0);
  const [totalValueChangePercent, setTotalValueChangePercent] = useState<number>(0);

  const cryptoKeywords = ['bitcoin', 'btc', 'ethereum', 'eth', 'solana', 'sol', 'cardano', 'ada', 'polkadot', 'dot'];

  const isCryptoAsset = (name: string): boolean => {
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

  const updateAllCryptoPrices = async () => {
    try {
      setIsUpdating(true);
      const cryptoAssetsList = assets.filter(asset => isCryptoAsset(asset.name));
      const updatedAssets: AssetWithPrice[] = [];

      for (const asset of cryptoAssetsList) {
        try {
          const coinId = getCoinId(asset.name);
          if (coinId) {
            const currentPrice = await assetService.getCryptoPrice(coinId);
            const priceChange = currentPrice - asset.pricePerUnit;
            const priceChangePercent = (priceChange / asset.pricePerUnit) * 100;

            updatedAssets.push({
              ...asset,
              currentPrice,
              priceChange,
              priceChangePercent
            });
          }
        } catch (error) {
          console.error(`Error updating price for ${asset.name}:`, error);
          updatedAssets.push(asset);
        }
      }

      setCryptoAssets(updatedAssets);

      // Calculate total value changes
      const originalTotal = cryptoAssetsList.reduce((total, asset) => total + (asset.quantity * asset.pricePerUnit), 0);
      const newTotal = updatedAssets.reduce((total, asset) => {
        const price = asset.currentPrice || asset.pricePerUnit;
        return total + (asset.quantity * price);
      }, 0);

      const change = newTotal - originalTotal;
      const changePercent = originalTotal > 0 ? (change / originalTotal) * 100 : 0;

      setTotalValueChange(change);
      setTotalValueChangePercent(changePercent);

      onPriceUpdate(updatedAssets);
    } catch (error) {
      console.error('Error updating crypto prices:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const cryptoAssetsList = assets.filter(asset => isCryptoAsset(asset.name));
    setCryptoAssets(cryptoAssetsList.map(asset => ({ ...asset })));
  }, [assets]);

  const cryptoAssetsCount = cryptoAssets.length;

  if (cryptoAssetsCount === 0) {
    return null; // Don't show component if no crypto assets
  }

  return (
    <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
      <div className="flex-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Zap size={20} className="text-blue-600" />
            Crypto Market Update
          </h3>
          <p className="text-sm text-gray-600">
            {cryptoAssetsCount} crypto asset{cryptoAssetsCount !== 1 ? 's' : ''} detected
          </p>
        </div>
        <button
          onClick={updateAllCryptoPrices}
          disabled={isUpdating}
          className="btn btn-primary flex-center gap-2"
        >
          <RefreshCw size={16} className={isUpdating ? 'animate-spin' : ''} />
          {isUpdating ? 'Updating...' : 'Update All Prices'}
        </button>
      </div>

      {/* Price Changes Summary */}
      {totalValueChange !== 0 && (
        <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Portfolio Value Change</span>
            <div className="flex items-center gap-2">
              {totalValueChange >= 0 ? (
                <TrendingUp size={16} className="text-green-500" />
              ) : (
                <TrendingDown size={16} className="text-red-500" />
              )}
              <span className={`font-bold ${totalValueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalValueChange >= 0 ? '+' : ''}${totalValueChange.toLocaleString('en-US', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })}
              </span>
              <span className={`text-sm ${totalValueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ({totalValueChangePercent >= 0 ? '+' : ''}{totalValueChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Individual Asset Price Changes */}
      <div className="space-y-2">
        {cryptoAssets.map((asset) => {
          const hasCurrentPrice = asset.currentPrice !== undefined;
          const priceChange = asset.priceChange || 0;
          const priceChangePercent = asset.priceChangePercent || 0;

          return (
            <div key={asset.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                  <DollarSign size={16} className="text-white" />
                </div>
                <div>
                  <span className="font-medium text-gray-800">{asset.name}</span>
                  <div className="text-xs text-gray-500">
                    {asset.quantity} × ${asset.pricePerUnit.toLocaleString('en-US', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                {hasCurrentPrice ? (
                  <div>
                    <div className="font-semibold text-gray-800">
                      ${asset.currentPrice!.toLocaleString('en-US', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })}
                    </div>
                    <div className={`text-xs flex items-center gap-1 ${priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {priceChange >= 0 ? (
                        <TrendingUp size={12} />
                      ) : (
                        <TrendingDown size={12} />
                      )}
                      {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Click update to fetch price</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CryptoPriceUpdate; 
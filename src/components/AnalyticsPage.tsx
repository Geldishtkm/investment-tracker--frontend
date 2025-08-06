import React, { useState, useEffect } from 'react';
import { assetService, analyticsService } from '../services/api';
import { TrendingUp, TrendingDown, BarChart3, PieChart, Target, Zap, Shield, Activity, DollarSign, Percent, Award, TrendingUpIcon } from 'lucide-react';

interface PortfolioMetrics {
  totalValue: number;
  totalInvestment: number;
  roi: number;
  roiPercentage: number;
  sharpeRatio: number;
  volatility: number;
  assetCount: number;
  topPerformer: string;
  worstPerformer: string;
}

interface AssetPerformance {
  id: number;
  name: string;
  currentValue: number;
  initialInvestment: number;
  roi: number;
  roiPercentage: number;
  weight: number;
}

interface RiskMetrics {
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
  beta: number;
  diversificationScore: number;
}

const AnalyticsPage: React.FC = () => {
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [performance, setPerformance] = useState<AssetPerformance[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load real data from backend endpoints
      const [totalValue, roi, sharpeRatio, volatility, maxDrawdown, beta, diversificationScore, assetsWithPrices] = await Promise.all([
        assetService.getTotalValue(),
        assetService.getROI(),
        assetService.getSharpeRatio(),
        assetService.getVolatility(),
        assetService.getMaxDrawdown(),
        assetService.getBeta(),
        assetService.getDiversificationScore(),
        assetService.getAllAssetsWithPrices()
      ]);
      
      // Create portfolio metrics from backend data
      const portfolioMetrics: PortfolioMetrics = {
        totalValue,
        totalInvestment: totalValue - (roi * totalValue), // Calculate from ROI
        roi: roi * totalValue,
        roiPercentage: roi,
        sharpeRatio,
        volatility,
        assetCount: assetsWithPrices.length,
        topPerformer: assetsWithPrices[0]?.name || 'N/A',
        worstPerformer: assetsWithPrices[assetsWithPrices.length - 1]?.name || 'N/A'
      };
      
      setMetrics(portfolioMetrics);
      
      // Create asset performance from backend data
      const assetPerformance: AssetPerformance[] = assetsWithPrices.map(asset => {
        const currentValue = asset.quantity * (asset.currentPrice || asset.pricePerUnit);
        const initialInvestment = asset.quantity * asset.pricePerUnit;
        const assetRoi = currentValue - initialInvestment;
        const assetRoiPercentage = initialInvestment > 0 ? assetRoi / initialInvestment : 0;
        const weight = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
        
        return {
          id: asset.id,
          name: asset.name,
          currentValue,
          initialInvestment,
          roi: assetRoi,
          roiPercentage: assetRoiPercentage,
          weight
        };
      });
      
      setPerformance(assetPerformance);
      
      // Create risk metrics from backend data
      const risk: RiskMetrics = {
        sharpeRatio,
        volatility,
        maxDrawdown,
        beta,
        diversificationScore
      };
      
      setRiskMetrics(risk);
      
    } catch (err) {
      setError('Failed to load analytics data from backend');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${(value * 100).toFixed(2)}%`;
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-blue-950 to-black relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_50%)]"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse shadow-lg shadow-blue-600/40">
                <BarChart3 size={32} className="text-white animate-spin" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Loading Analytics...</h3>
              <p className="text-gray-300">Calculating portfolio metrics</p>
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
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-600/40">
              <BarChart3 size={32} className="text-white" />
            </div>
            <div className="text-red-400 text-xl mb-4">⚠️ {error}</div>
            <button 
              onClick={loadAnalytics}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md border border-blue-500/30"
            >
              Retry
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
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/40">
            <BarChart3 size={24} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Portfolio Analytics
          </h1>
        </div>
        
        {/* Portfolio Overview Cards */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="group relative glass-card p-6 border border-blue-600/30 hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-emerald-600/10 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/40">
                    <DollarSign size={20} className="text-white" />
                  </div>
                  <div className="text-gray-400 text-sm font-medium">Total Portfolio Value</div>
                </div>
                <div className="text-2xl font-bold text-green-400 group-hover:text-green-300 transition-colors duration-300">
                  {formatCurrency(metrics.totalValue)}
                </div>
              </div>
            </div>
            
            <div className="group relative glass-card p-6 border border-blue-600/30 hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/40">
                    <Target size={20} className="text-white" />
                  </div>
                  <div className="text-gray-400 text-sm font-medium">Total Investment</div>
                </div>
                <div className="text-2xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                  {formatCurrency(metrics.totalInvestment)}
                </div>
              </div>
            </div>
            
            <div className="group relative glass-card p-6 border border-blue-600/30 hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/40">
                    <TrendingUp size={20} className="text-white" />
                  </div>
                  <div className="text-gray-400 text-sm font-medium">ROI</div>
                </div>
                <div className={`text-2xl font-bold group-hover:scale-105 transition-transform duration-300 ${
                  metrics.roiPercentage >= 0 ? 'text-green-400 group-hover:text-green-300' : 'text-red-400 group-hover:text-red-300'
                }`}>
                  {formatPercentage(metrics.roiPercentage)}
                </div>
              </div>
            </div>
            
            <div className="group relative glass-card p-6 border border-blue-600/30 hover:border-blue-500/50 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/10 to-rose-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-700 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/40">
                    <Award size={20} className="text-white" />
                  </div>
                  <div className="text-gray-400 text-sm font-medium">Sharpe Ratio</div>
                </div>
                <div className="text-2xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors duration-300">
                  {metrics.sharpeRatio.toFixed(3)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Risk Metrics */}
        {riskMetrics && (
          <div className="glass-card p-8 mb-8 border border-blue-600/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/40">
                <Shield size={20} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Risk Metrics
              </h2>
              <span className="text-sm text-blue-400 bg-blue-600/30 px-3 py-1 rounded-full border border-blue-600/40">
                Backend Calculated
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="group text-center p-4 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl border border-blue-600/30 hover:border-blue-500/50 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-600/40">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <div className="text-gray-400 text-sm font-medium mb-1">Sharpe Ratio</div>
                <div className="text-lg font-bold text-blue-400 group-hover:text-blue-300 transition-colors duration-300">
                  {riskMetrics.sharpeRatio.toFixed(3)}
                </div>
              </div>
              <div className="group text-center p-4 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl border border-indigo-600/30 hover:border-indigo-500/50 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/40">
                  <Activity size={20} className="text-white" />
                </div>
                <div className="text-gray-400 text-sm font-medium mb-1">Volatility</div>
                <div className="text-lg font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors duration-300">
                  {formatPercentage(riskMetrics.volatility)}
                </div>
              </div>
              <div className="group text-center p-4 bg-gradient-to-r from-red-600/20 to-pink-600/20 rounded-2xl border border-red-600/30 hover:border-red-500/50 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-600/40">
                  <TrendingDown size={20} className="text-white" />
                </div>
                <div className="text-gray-400 text-sm font-medium mb-1">Max Drawdown</div>
                <div className="text-lg font-bold text-red-400 group-hover:text-red-300 transition-colors duration-300">
                  {formatPercentage(riskMetrics.maxDrawdown)}
                </div>
              </div>
              <div className="group text-center p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-600/30 hover:border-purple-500/50 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-600/40">
                  <Target size={20} className="text-white" />
                </div>
                <div className="text-gray-400 text-sm font-medium mb-1">Beta</div>
                <div className="text-lg font-bold text-purple-400 group-hover:text-purple-300 transition-colors duration-300">
                  {riskMetrics.beta.toFixed(3)}
                </div>
              </div>
              <div className="group text-center p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-2xl border border-green-600/30 hover:border-green-500/50 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-600/40">
                  <Zap size={20} className="text-white" />
                </div>
                <div className="text-gray-400 text-sm font-medium mb-1">Diversification</div>
                <div className="text-lg font-bold text-green-400 group-hover:text-green-300 transition-colors duration-300">
                  {riskMetrics.diversificationScore.toFixed(1)}/10
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Asset Performance Table */}
        {performance.length > 0 && (
          <div className="glass-card p-8 mb-8 border border-blue-600/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/40">
                <BarChart3 size={20} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Asset Performance
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-600/40">
                    <th className="text-left py-4 px-6 text-blue-300 font-semibold">Asset</th>
                    <th className="text-right py-4 px-6 text-blue-300 font-semibold">Current Value</th>
                    <th className="text-right py-4 px-6 text-blue-300 font-semibold">Initial Investment</th>
                    <th className="text-right py-4 px-6 text-blue-300 font-semibold">ROI</th>
                    <th className="text-right py-4 px-6 text-blue-300 font-semibold">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {performance.map((asset, index) => (
                    <tr key={asset.id} className="border-b border-blue-600/20 hover:bg-blue-600/10 transition-colors duration-300">
                      <td className="py-4 px-6 font-medium text-white">{asset.name}</td>
                      <td className="text-right py-4 px-6 text-green-400 font-semibold">{formatCurrency(asset.currentValue)}</td>
                      <td className="text-right py-4 px-6 text-gray-300">{formatCurrency(asset.initialInvestment)}</td>
                      <td className={`text-right py-4 px-6 font-bold ${
                        asset.roiPercentage >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatPercentage(asset.roiPercentage)}
                      </td>
                      <td className="text-right py-4 px-6 text-blue-400 font-semibold">{asset.weight.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Portfolio Allocation Chart */}
        {performance.length > 0 && (
          <div className="glass-card p-8 border border-blue-600/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/40">
                <PieChart size={20} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Portfolio Allocation
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {performance.map((asset, index) => (
                <div key={asset.id} className="group relative p-6 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-sm rounded-2xl border border-blue-600/30 hover:border-blue-500/50 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-white group-hover:text-blue-300 transition-colors duration-300">
                      {asset.name}
                    </span>
                    <span className="text-sm text-blue-400 font-semibold bg-blue-600/30 px-3 py-1 rounded-full border border-blue-600/40">
                      {asset.weight.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3 mb-3 overflow-hidden">
                    <div 
                      className="h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
                      style={{ 
                        width: `${Math.min(asset.weight, 100)}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                        boxShadow: `0 0 20px ${COLORS[index % COLORS.length]}60`
                      }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatCurrency(asset.currentValue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage; 
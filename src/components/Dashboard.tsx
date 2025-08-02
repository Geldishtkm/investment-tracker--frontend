import React, { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Activity, Calendar, 
  ArrowUpRight, ArrowDownRight, PieChart, BarChart3, Eye, EyeOff,
  RefreshCw, Plus, Minus, LogOut
} from 'lucide-react';
import { Asset } from '../types';

interface DashboardProps {
  assets: Asset[];
  totalValue: number;
  onRefresh: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ assets, totalValue, onRefresh }) => {
  const [showBalance, setShowBalance] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for charts and stats
  const mockData = {
    totalGain: 15420.50,
    totalGainPercent: 12.5,
    dailyChange: 2340.75,
    dailyChangePercent: 2.1,
    monthlyChange: 8920.30,
    monthlyChangePercent: 8.7,
    assetDistribution: [
      { name: 'Bitcoin', value: 45, color: '#f7931a' },
      { name: 'Ethereum', value: 25, color: '#627eea' },
      { name: 'Solana', value: 15, color: '#14f195' },
      { name: 'Cardano', value: 10, color: '#0033ad' },
      { name: 'Others', value: 5, color: '#6c757d' }
    ],
    recentTransactions: [
      { id: 1, type: 'buy', asset: 'Bitcoin', amount: 0.5, price: 45000, date: '2024-01-15', time: '14:30' },
      { id: 2, type: 'sell', asset: 'Ethereum', amount: 2.0, price: 3200, date: '2024-01-14', time: '09:15' },
      { id: 3, type: 'buy', asset: 'Solana', amount: 10.0, price: 95, date: '2024-01-13', time: '16:45' },
      { id: 4, type: 'buy', asset: 'Cardano', amount: 500.0, price: 0.45, date: '2024-01-12', time: '11:20' }
    ],
    performanceData: [
      { date: 'Jan 1', value: 100000 },
      { date: 'Jan 5', value: 105000 },
      { date: 'Jan 10', value: 102000 },
      { date: 'Jan 15', value: 115420 }
    ]
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await onRefresh();
    setTimeout(() => setIsLoading(false), 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Top Navigation */}
      <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 px-6 py-4">
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
              disabled={isLoading}
              className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
            >
              <RefreshCw size={20} className={`${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="p-6">
        {/* Balance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Balance */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/30 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-300">Total Balance</h2>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
              >
                {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            <div className="text-3xl font-bold mb-2">
              {showBalance ? formatCurrency(totalValue) : '••••••••'}
            </div>
            <div className="flex items-center gap-2 text-green-400">
              <TrendingUp size={16} />
              <span className="font-medium">{formatPercent(mockData.totalGainPercent)}</span>
              <span className="text-gray-400">(${formatCurrency(mockData.totalGain)})</span>
            </div>
          </div>

          {/* Daily Change */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Activity size={20} className="text-green-400" />
              </div>
              <div>
                <h3 className="text-sm text-gray-400">Daily Change</h3>
                <div className="text-lg font-bold">{formatCurrency(mockData.dailyChange)}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-green-400">
              <ArrowUpRight size={16} />
              <span className="text-sm font-medium">{formatPercent(mockData.dailyChangePercent)}</span>
            </div>
          </div>

          {/* Monthly Change */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm text-gray-400">Monthly Change</h3>
                <div className="text-lg font-bold">{formatCurrency(mockData.monthlyChange)}</div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-blue-400">
              <ArrowUpRight size={16} />
              <span className="text-sm font-medium">{formatPercent(mockData.monthlyChangePercent)}</span>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <BarChart3 size={20} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold">Portfolio Performance</h3>
            </div>
            <div className="h-64 flex items-end justify-between gap-2">
              {mockData.performanceData.map((point, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-green-500/60 to-green-400/20 rounded-t-lg transition-all duration-300 hover:from-green-400/80"
                    style={{ height: `${(point.value / 120000) * 100}%` }}
                  ></div>
                  <span className="text-xs text-gray-400 mt-2">{point.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Asset Distribution */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <PieChart size={20} className="text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold">Asset Distribution</h3>
            </div>
            <div className="space-y-4">
              {mockData.assetDistribution.map((asset, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: asset.color }}
                    ></div>
                    <span className="text-sm font-medium">{asset.name}</span>
                  </div>
                  <span className="text-sm font-bold">{asset.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl p-6 border border-gray-600/30 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
              <Activity size={20} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold">Recent Transactions</h3>
          </div>
          <div className="space-y-4">
            {mockData.recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/20">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    transaction.type === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {transaction.type === 'buy' ? (
                      <Plus size={16} className="text-green-400" />
                    ) : (
                      <Minus size={16} className="text-red-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{transaction.asset}</div>
                    <div className="text-sm text-gray-400">
                      {transaction.date} at {transaction.time}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {transaction.type === 'buy' ? '+' : '-'}{transaction.amount} {transaction.asset}
                  </div>
                  <div className="text-sm text-gray-400">
                    @ ${transaction.price.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
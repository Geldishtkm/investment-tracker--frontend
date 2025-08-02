import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Loader2, Leaf, Users, Shield, TrendingUp, Plus, Filter, Star } from 'lucide-react';
import { ESGScore } from '../types';
import { esgService } from '../services/api';
import Toast from './Toast';

interface ESGPageProps {
  onBack: () => void;
}

const ESGPage: React.FC<ESGPageProps> = ({ onBack }) => {
  const [esgScores, setEsgScores] = useState<ESGScore[]>([]);
  const [filteredScores, setFilteredScores] = useState<ESGScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [minScore, setMinScore] = useState(70);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const scoresPerPage = 12;

  // Fetch high ESG companies on component mount
  useEffect(() => {
    fetchHighESGCompanies();
  }, [minScore]);

  // Filter scores based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredScores(esgScores);
    } else {
      const filtered = esgScores.filter(score =>
        score.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        score.ticker.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredScores(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, esgScores]);

  const fetchHighESGCompanies = async () => {
    try {
      setLoading(true);
      setError('');
      const scores = await esgService.getHighESGCompanies(minScore);
      setEsgScores(scores);
      setFilteredScores(scores);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ESG scores');
      console.error('Error fetching ESG scores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredScores.length / scoresPerPage);
  const startIndex = (currentPage - 1) * scoresPerPage;
  const endIndex = startIndex + scoresPerPage;
  const currentScores = filteredScores.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-300" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Leaf size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">ESG Analysis</h1>
            </div>
          </div>

          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 size={48} className="animate-spin text-green-400 mx-auto mb-4" />
              <p className="text-gray-400">Loading ESG data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-300" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Leaf size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">ESG Analysis</h1>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md border border-green-400/20 flex items-center gap-2"
          >
            <Plus size={16} />
            Add ESG Score
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="glass-card p-4 mb-6 border border-red-500/30">
            <p className="text-red-400">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-400" />
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="px-4 py-3 bg-gray-700/50 border border-gray-600/30 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value={50}>Min Score: 50+</option>
                <option value={60}>Min Score: 60+</option>
                <option value={70}>Min Score: 70+</option>
                <option value={80}>Min Score: 80+</option>
                <option value={90}>Min Score: 90+</option>
              </select>
            </div>
          </div>
        </div>

        {/* ESG Scores Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              High ESG Companies ({filteredScores.length})
            </h2>
            <p className="text-gray-300">
              Showing companies with ESG score ≥ {minScore}
            </p>
          </div>

          {filteredScores.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Leaf size={48} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                No ESG Scores Found
              </h3>
              <p className="text-gray-400 mb-8">
                No companies match your search criteria or minimum score requirement.
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentScores.map((score) => (
                <div key={score.ticker} className="glass-card p-6 hover:transform hover:scale-105 transition-all duration-300">
                  {/* Company Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{score.companyName}</h3>
                      <p className="text-sm text-gray-400">{score.ticker}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getScoreBgColor(score.totalScore)} ${getScoreColor(score.totalScore)}`}>
                      {score.totalScore}
                    </div>
                  </div>

                  {/* ESG Breakdown */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Leaf size={14} className="text-green-400" />
                        <span className="text-sm text-gray-400">Environmental</span>
                      </div>
                      <span className={`text-sm font-semibold ${getScoreColor(score.environmentalScore)}`}>
                        {score.environmentalScore}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-blue-400" />
                        <span className="text-sm text-gray-400">Social</span>
                      </div>
                      <span className={`text-sm font-semibold ${getScoreColor(score.socialScore)}`}>
                        {score.socialScore}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield size={14} className="text-purple-400" />
                        <span className="text-sm text-gray-400">Governance</span>
                      </div>
                      <span className={`text-sm font-semibold ${getScoreColor(score.governanceScore)}`}>
                        {score.governanceScore}
                      </span>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="pt-3 border-t border-gray-700/50">
                    <p className="text-xs text-gray-500">
                      Updated: {new Date(score.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                Page {currentPage} of {totalPages} 
                ({startIndex + 1}-{Math.min(endIndex, filteredScores.length)} of {filteredScores.length})
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
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
                  className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default ESGPage; 
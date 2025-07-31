import React from 'react';
import { Package, Plus } from 'lucide-react';

interface EmptyStateProps {
  onAddAsset: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddAsset }) => {
  return (
    <div className="card text-center py-12">
      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Package size={48} className="text-blue-600" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-800 mb-4">
        No Assets Yet
      </h3>
      
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Start building your portfolio by adding your first asset. Track stocks, cryptocurrencies, or any other investments.
      </p>
      
      <button
        onClick={onAddAsset}
        className="btn btn-primary flex-center gap-2 mx-auto"
      >
        <Plus size={20} />
        Add Your First Asset
      </button>
    </div>
  );
};

export default EmptyState; 
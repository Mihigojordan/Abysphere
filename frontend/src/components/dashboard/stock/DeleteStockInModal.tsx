// components/dashboard/stockin/DeleteStockInModal.tsx
import React from 'react';
import { X, Package } from 'lucide-react';

interface Props {
  isOpen: boolean;
  stock: any;
  onClose: () => void;
  onDelete: (stock: any) => void;
}

const DeleteStockInModal: React.FC<Props> = ({ isOpen, stock, onClose, onDelete }) => {
  if (!isOpen || !stock) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Delete Stock-In?</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg mb-4">
          <Package className="w-8 h-8 text-red-600" />
          <div>
            <p className="font-medium text-gray-900">{stock.itemName}</p>
            <p className="text-xs text-gray-600">SKU: {stock.sku}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-6">This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg">Cancel</button>
          <button onClick={() => { onDelete(stock); onClose(); }} className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteStockInModal;
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-theme-bg-primary rounded-2xl shadow-2xl max-w-md w-full p-6 border border-theme-border animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-theme-text-primary uppercase tracking-widest">Delete Stock-In?</h3>
          <button onClick={onClose} className="p-2 hover:bg-theme-bg-tertiary rounded-xl transition-colors text-theme-text-secondary hover:text-theme-text-primary">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl mb-4">
          <Package className="w-8 h-8 text-red-600" />
          <div>
            <p className="font-black text-theme-text-primary uppercase tracking-tighter truncate">{stock.itemName || stock.productName}</p>
            <p className="font-mono text-[10px] text-red-500/70">SKU: {stock.sku || 'N/A'}</p>
          </div>
        </div>
        <p className="text-[11px] font-black text-theme-text-secondary uppercase tracking-widest mb-6">This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-theme-text-secondary hover:text-theme-text-primary border border-theme-border rounded-xl transition-all">Cancel</button>
          <button onClick={() => { onDelete(stock); onClose(); }} className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-600/20 transition-all">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteStockInModal;
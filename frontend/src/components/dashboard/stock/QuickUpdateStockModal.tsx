import React, { useState } from 'react';
import { X, Package, Check, Plus, Calendar } from 'lucide-react';
import { type Stock } from '../../../services/stockService';

interface Props {
    isOpen: boolean;
    stock: Stock | null;
    onClose: () => void;
    onUpdate: (id: number, addedQuantity: number, expiryDate?: string) => Promise<void>;
}

const QuickUpdateStockModal: React.FC<Props> = ({ isOpen, stock, onClose, onUpdate }) => {
    const [purchasedQuantity, setPurchasedQuantity] = useState<number>(0);
    const [expiryDate, setExpiryDate] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    React.useEffect(() => {
        if (stock) {
            setPurchasedQuantity(0);
            setExpiryDate(stock.expiryDate ? new Date(stock.expiryDate).toISOString().split('T')[0] : '');
        }
    }, [stock]);

    if (!isOpen || !stock) return null;

    const newTotal = (stock.receivedQuantity || 0) + purchasedQuantity;

    const handleSubmit = async () => {
        if (purchasedQuantity <= 0) return;
        setIsLoading(true);
        try {
            await onUpdate(stock.id, purchasedQuantity, expiryDate || undefined);
            onClose();
        } catch (error) {
            console.error('Failed to update quantity:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-theme-bg-primary rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-theme-border animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-theme-text-primary uppercase tracking-widest">Add Purchased Quantity</h3>
                    <button onClick={onClose} className="p-2 hover:bg-theme-bg-tertiary rounded-xl transition-colors text-theme-text-secondary hover:text-theme-text-primary">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-primary-500/10 border border-primary-500/20 rounded-2xl mb-4">
                    <Package className="h-8 w-8 text-primary-600 flex-shrink-0" />
                    <div className="min-w-0">
                        <p className="font-black text-theme-text-primary uppercase tracking-tighter truncate">{stock.itemName}</p>
                        <p className="font-black text-[10px] text-theme-text-secondary uppercase tracking-widest">Current stock: {stock.receivedQuantity} {stock.unitOfMeasure}</p>
                        {stock.unitCost > 0 && (
                            <p className="font-black text-[10px] text-primary-600 uppercase tracking-widest">Unit cost: Rwf {Number(stock.unitCost).toLocaleString()}</p>
                        )}
                    </div>
                </div>

                {/* Purchased Quantity */}
                <div className="mb-4">
                    <label className="block text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mb-1.5">
                        <Plus className="w-3 h-3 inline mr-1" />
                        Purchased Quantity ({stock.unitOfMeasure || 'PCS'})
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={purchasedQuantity || ''}
                        onChange={(e) => setPurchasedQuantity(Number(e.target.value))}
                        placeholder="Enter quantity purchased..."
                        className="w-full px-4 py-2.5 text-[11px] font-black border border-theme-border rounded-xl bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-theme-text-secondary/50"
                        autoFocus
                    />
                    {purchasedQuantity > 0 && (
                        <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mt-1.5">
                            New total: {stock.receivedQuantity} + {purchasedQuantity} = <strong>{newTotal} {stock.unitOfMeasure || 'PCS'}</strong>
                        </p>
                    )}
                </div>

                {/* Expiry Date */}
                <div className="mb-6">
                    <label className="block text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mb-1.5">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Expiry Date (optional)
                    </label>
                    <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full px-4 py-2.5 text-[11px] font-black border border-theme-border rounded-xl bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-theme-text-secondary hover:text-theme-text-primary border border-theme-border rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || purchasedQuantity <= 0}
                        className="flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-600/20 disabled:opacity-50 transition-all"
                    >
                        {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Check className="w-4 h-4" />}
                        Add Stock
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuickUpdateStockModal;

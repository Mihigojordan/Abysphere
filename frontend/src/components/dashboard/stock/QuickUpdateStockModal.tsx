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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Add Purchased Quantity</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg mb-4">
                    <Package className="h-8 w-8 text-primary-600 flex-shrink-0" />
                    <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{stock.itemName}</p>
                        <p className="text-xs text-gray-600">Current stock: {stock.receivedQuantity} {stock.unitOfMeasure}</p>
                        {stock.unitCost > 0 && (
                            <p className="text-xs text-gray-500">Unit cost: Rwf {Number(stock.unitCost).toLocaleString()}</p>
                        )}
                    </div>
                </div>

                {/* Purchased Quantity */}
                <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        <Plus className="w-3 h-3 inline mr-1" />
                        Purchased Quantity ({stock.unitOfMeasure || 'PCS'})
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={purchasedQuantity || ''}
                        onChange={(e) => setPurchasedQuantity(Number(e.target.value))}
                        placeholder="Enter quantity purchased..."
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        autoFocus
                    />
                    {purchasedQuantity > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                            New total: {stock.receivedQuantity} + {purchasedQuantity} = <strong>{newTotal} {stock.unitOfMeasure || 'PCS'}</strong>
                        </p>
                    )}
                </div>

                {/* Expiry Date */}
                <div className="mb-6">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Expiry Date (optional)
                    </label>
                    <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || purchasedQuantity <= 0}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50"
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

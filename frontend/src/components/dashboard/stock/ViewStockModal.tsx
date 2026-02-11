import React from 'react';
import { X, Package, MapPin, Calendar, DollarSign, AlertTriangle, Tag, Layers, Clock } from 'lucide-react';
import { type Stock } from '../../../services/stockService';

interface Props {
    isOpen: boolean;
    stock: Stock | null;
    onClose: () => void;
}

const ViewStockModal: React.FC<Props> = ({ isOpen, stock, onClose }) => {
    if (!isOpen || !stock) return null;

    const isLowStock = stock.receivedQuantity <= stock.reorderLevel;

    const formatDate = (date?: string | Date): string => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatCurrency = (value: number): string => {
        return `Rwf ${Number(value || 0).toLocaleString()}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{stock.itemName}</h3>
                            <p className="text-xs text-gray-500">SKU: {stock.sku}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Status Badge */}
                <div className="px-5 pt-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${isLowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {isLowStock ? (
                            <><AlertTriangle className="w-3 h-3 mr-1" /> Low Stock</>
                        ) : (
                            'In Stock'
                        )}
                    </span>
                </div>

                {/* Details Grid */}
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem
                            icon={<Layers className="w-4 h-4 text-blue-500" />}
                            label="Quantity"
                            value={`${stock.receivedQuantity} ${stock.unitOfMeasure}`}
                            highlight={isLowStock}
                        />
                        <DetailItem
                            icon={<AlertTriangle className="w-4 h-4 text-orange-500" />}
                            label="Reorder Level"
                            value={`${stock.reorderLevel} ${stock.unitOfMeasure}`}
                        />
                        <DetailItem
                            icon={<DollarSign className="w-4 h-4 text-green-500" />}
                            label="Unit Cost"
                            value={formatCurrency(stock.unitCost)}
                        />
                        <DetailItem
                            icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
                            label="Total Value"
                            value={formatCurrency(stock.totalValue)}
                        />
                        <DetailItem
                            icon={<MapPin className="w-4 h-4 text-purple-500" />}
                            label="Warehouse"
                            value={stock.warehouseLocation || 'N/A'}
                        />
                        <DetailItem
                            icon={<Tag className="w-4 h-4 text-pink-500" />}
                            label="Supplier"
                            value={stock.supplier || 'N/A'}
                        />
                        <DetailItem
                            icon={<Calendar className="w-4 h-4 text-indigo-500" />}
                            label="Received"
                            value={formatDate(stock.receivedDate)}
                        />
                        <DetailItem
                            icon={<Calendar className="w-4 h-4 text-red-500" />}
                            label="Expiry Date"
                            value={formatDate(stock.expiryDate)}
                        />
                    </div>

                    {stock.description && (
                        <div className="pt-3 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-600 mb-1">Description</p>
                            <p className="text-sm text-gray-700">{stock.description}</p>
                        </div>
                    )}

                    <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>Created: {formatDate(stock.createdAt)}</span>
                            <span>•</span>
                            <span>Updated: {formatDate(stock.updatedAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-gray-50 rounded-b-xl border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-white transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const DetailItem = ({ icon, label, value, highlight }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    highlight?: boolean;
}) => (
    <div className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-lg">
        <div className="mt-0.5">{icon}</div>
        <div className="min-w-0">
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-sm font-medium truncate ${highlight ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
        </div>
    </div>
);

export default ViewStockModal;

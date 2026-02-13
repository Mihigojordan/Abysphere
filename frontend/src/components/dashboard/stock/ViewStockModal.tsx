import React from 'react';
import { X, Package, MapPin, Calendar, DollarSign, AlertTriangle, Tag, Layers, Clock } from 'lucide-react';
import { type Stock } from '../../../services/stockService';

import { useLanguage } from '../../../context/LanguageContext';

interface Props {
    isOpen: boolean;
    stock: Stock | null;
    onClose: () => void;
}

const ViewStockModal: React.FC<Props> = ({ isOpen, stock, onClose }) => {
    const { t } = useLanguage();
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-theme-bg-primary rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-theme-border animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-theme-border">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center shadow-lg shadow-primary-500/10">
                            <Package className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-theme-text-primary uppercase tracking-tighter">{stock.itemName}</h3>
                            <p className="font-mono text-[10px] text-primary-500 font-bold bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20 inline-block">{stock.sku}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-theme-bg-tertiary rounded-xl transition-colors text-theme-text-secondary hover:text-theme-text-primary">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Status Badge */}
                <div className="px-6 pt-6">
                    <span className={`inline-flex px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl ${isLowStock ? 'bg-red-500/10 text-red-600 border border-red-500/20' : 'bg-green-500/10 text-green-600 border border-green-500/20'}`}>
                        {isLowStock ? (
                            <><AlertTriangle className="w-3 h-3 mr-2" /> {t('stockIn.lowStockStatus')}</>
                        ) : (
                            t('stockIn.inStock')
                        )}
                    </span>
                </div>

                <div className="p-6 space-y-4">
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
                            icon={<DollarSign className="w-4 h-4 text-emerald-500" />}
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
                        <div className="pt-4 border-t border-theme-border">
                            <p className="text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mb-1.5">Description</p>
                            <p className="text-xs text-theme-text-primary leading-relaxed">{stock.description}</p>
                        </div>
                    )}

                    <div className="pt-4 border-t border-theme-border">
                        <div className="flex items-center gap-2 text-[10px] font-black text-theme-text-secondary uppercase tracking-widest">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Created: {formatDate(stock.createdAt)}</span>
                            <span className="opacity-30 mx-1">|</span>
                            <span>Updated: {formatDate(stock.updatedAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-theme-bg-tertiary rounded-b-2xl border-t border-theme-border">
                    <button
                        onClick={onClose}
                        className="w-full px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-theme-text-secondary hover:text-theme-text-primary border border-theme-border rounded-xl transition-all"
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
    <div className="flex items-start gap-4 p-3 bg-theme-bg-tertiary rounded-2xl border border-theme-border">
        <div className="mt-1">{icon}</div>
        <div className="min-w-0">
            <p className="text-[9px] font-black text-theme-text-secondary uppercase tracking-widest mb-0.5">{label}</p>
            <p className={`text-[11px] font-black tracking-tighter truncate ${highlight ? 'text-red-500' : 'text-theme-text-primary'}`}>{value}</p>
        </div>
    </div>
);

export default ViewStockModal;

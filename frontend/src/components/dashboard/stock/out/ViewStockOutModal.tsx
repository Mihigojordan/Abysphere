import React from 'react';
import { X, Package, DollarSign, Hash, User, Mail, Phone, Calendar, Eye, CreditCard } from 'lucide-react';

interface StockOut {
    id: string;
    stockinId: number | null;
    quantity: number;
    soldPrice: number;
    clientName?: string;
    clientPhone?: string;
    clientEmail?: string;
    paymentMethod?: "MOMO" | "CARD" | "CASH" | null;
    transactionId?: string;
    createdAt: string;
    stockin?: {
        itemName: string;
        sku: string;
        product?: { productName: string; brand?: string };
    };
}

interface ViewStockOutModalProps {
    isOpen: boolean;
    onClose: () => void;
    stockOut: StockOut | null;
}

const ViewStockOutModal: React.FC<ViewStockOutModalProps> = ({ isOpen, onClose, stockOut }) => {
    if (!isOpen || !stockOut) return null;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            maximumFractionDigits: 0
        }).format(price || 0);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPaymentMethodColor = (method?: string | null) => {
        switch (method) {
            case 'MOBILE_MONEY':
            case 'MOMO': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            case 'CARD': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'CASH': return 'bg-green-500/10 text-green-500 border-green-500/20';
            default: return 'bg-theme-bg-tertiary text-theme-text-secondary border-theme-border';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-theme-bg-primary rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-theme-border animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-theme-border bg-theme-bg-tertiary flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary-500/10 p-3 rounded-2xl border border-primary-500/20">
                            <Eye className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-theme-text-primary uppercase tracking-tighter">Sale Transaction</h2>
                            <p className="text-theme-text-secondary text-[10px] font-bold uppercase tracking-widest mt-0.5">ID: {stockOut.transactionId || stockOut.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary p-2 rounded-xl transition-all hover:rotate-90">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {/* Top Section: Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-theme-bg-tertiary p-5 rounded-2xl border border-theme-border flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-theme-text-secondary">
                                <Calendar className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Date & Time</span>
                            </div>
                            <p className="text-xs font-black text-theme-text-primary uppercase tracking-tighter">{formatDate(stockOut.createdAt)}</p>
                        </div>
                        <div className="bg-theme-bg-tertiary p-5 rounded-2xl border border-theme-border flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-theme-text-secondary">
                                <CreditCard className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Payment Method</span>
                            </div>
                            <span className={`inline-flex items-center justify-center w-fit px-3 py-1 text-[9px] font-black rounded-lg border uppercase tracking-widest ${getPaymentMethodColor(stockOut.paymentMethod)}`}>
                                {stockOut.paymentMethod || 'N/A'}
                            </span>
                        </div>
                        <div className="bg-theme-bg-tertiary p-5 rounded-2xl border border-theme-border flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-theme-text-secondary">
                                <Hash className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Transaction Ref</span>
                            </div>
                            <p className="text-xs font-black text-theme-text-primary uppercase tracking-tighter">{stockOut.transactionId || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: Product Info */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black text-theme-text-secondary flex items-center gap-2 uppercase tracking-widest">
                                <Package className="w-4 h-4 text-primary-500" />
                                Product Details
                            </h3>
                            <div className="bg-theme-bg-primary border border-theme-border rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 blur-3xl rounded-full" />
                                <div className="flex items-start gap-4 relative z-10">
                                    <div className="w-14 h-14 bg-primary-500/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-primary-500/20">
                                        <Package className="w-7 h-7 text-primary-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-theme-text-primary text-lg tracking-tighter uppercase leading-tight">{stockOut.stockin?.product?.productName || stockOut.stockin?.itemName}</h4>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="px-2 py-1 bg-theme-bg-tertiary border border-theme-border rounded-lg text-[9px] font-black text-theme-text-secondary uppercase tracking-widest">SKU: {stockOut.stockin?.sku}</span>
                                            {stockOut.stockin?.product?.brand && (
                                                <span className="px-2 py-1 bg-theme-bg-tertiary border border-theme-border rounded-lg text-[9px] font-black text-theme-text-secondary uppercase tracking-widest">{stockOut.stockin?.product?.brand}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-theme-border relative z-10">
                                    <div>
                                        <p className="text-[9px] font-black text-theme-text-secondary uppercase tracking-widest mb-1">Quantity Sold</p>
                                        <p className="text-2xl font-black text-theme-text-primary tracking-tighter">{stockOut.quantity}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-theme-text-secondary uppercase tracking-widest mb-1">Unit Price</p>
                                        <p className="text-2xl font-black text-theme-text-primary tracking-tighter">{formatPrice(stockOut.soldPrice)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Client Info */}
                        <div className="space-y-4">
                            <h3 className="text-[11px] font-black text-theme-text-secondary flex items-center gap-2 uppercase tracking-widest">
                                <User className="w-4 h-4 text-primary-500" />
                                Client Details
                            </h3>
                            <div className="bg-theme-bg-primary border border-theme-border rounded-2xl p-6 space-y-6 shadow-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-theme-bg-tertiary rounded-2xl flex items-center justify-center border border-theme-border">
                                        <User className="w-7 h-7 text-theme-text-secondary" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-theme-text-primary text-lg tracking-tighter uppercase">{stockOut.clientName || 'Walk-in Client'}</h4>
                                        <p className="text-[9px] font-black text-theme-text-secondary uppercase tracking-widest mt-0.5">Identified Customer</p>
                                    </div>
                                </div>
                                <div className="space-y-4 pt-6 border-t border-theme-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-theme-bg-tertiary border border-theme-border flex items-center justify-center">
                                            <Mail className="w-4 h-4 text-theme-text-secondary" />
                                        </div>
                                        <span className="text-[11px] font-bold text-theme-text-primary truncate">{stockOut.clientEmail || 'NO EMAIL PROVIDED'}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-theme-bg-tertiary border border-theme-border flex items-center justify-center">
                                            <Phone className="w-4 h-4 text-theme-text-secondary" />
                                        </div>
                                        <span className="text-[11px] font-bold text-theme-text-primary">{stockOut.clientPhone || 'NO PHONE PROVIDED'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Totals Summary */}
                    <div className="bg-primary-500/5 border border-primary-500/10 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-primary-500/5 blur-3xl rounded-full" />
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
                                <DollarSign className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black text-theme-text-secondary uppercase tracking-widest leading-none mb-2">Total Sale Amount</h4>
                                <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">Calculated quantity × unit price</p>
                            </div>
                        </div>
                        <div className="text-right relative z-10">
                            <p className="text-4xl font-black text-primary-500 tracking-tighter">{formatPrice(stockOut.soldPrice * stockOut.quantity)}</p>
                            <p className="text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mt-1">Currency: RWF</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-theme-border bg-theme-bg-tertiary flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-theme-bg-primary border border-theme-border text-theme-text-primary text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-theme-bg-tertiary transition-all hover:scale-105 active:scale-95"
                    >
                        Close Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewStockOutModal;

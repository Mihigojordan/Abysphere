import React from 'react';
import { X, Package, DollarSign, Hash, User, Mail, Phone, Calendar, Eye, CreditCard } from 'lucide-react';

interface StockOut {
    id: string;
    stockinId: number;
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
            case 'MOMO': return 'bg-yellow-100 text-yellow-800';
            case 'CARD': return 'bg-blue-100 text-blue-800';
            case 'CASH': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-primary-600 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                        <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                            <Eye className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold">Sale Transaction Details</h2>
                            <p className="text-primary-100 text-xs">ID: {stockOut.transactionId || stockOut.id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-10 p-2 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Top Section: Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase">Date & Time</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{formatDate(stockOut.createdAt)}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <CreditCard className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase">Payment Method</span>
                            </div>
                            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getPaymentMethodColor(stockOut.paymentMethod)}`}>
                                {stockOut.paymentMethod || 'N/A'}
                            </span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2 text-gray-500 mb-1">
                                <Hash className="w-4 h-4" />
                                <span className="text-xs font-medium uppercase">Transaction Ref</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{stockOut.transactionId || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left: Product Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wider">
                                <Package className="w-4 h-4 text-primary-600" />
                                Product Information
                            </h3>
                            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Package className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{stockOut.stockin?.product?.productName || stockOut.stockin?.itemName}</h4>
                                        <p className="text-xs text-gray-500">SKU: {stockOut.stockin?.sku}</p>
                                        <p className="text-xs text-gray-500">{stockOut.stockin?.product?.brand}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Quantity Sold</p>
                                        <p className="text-lg font-bold text-gray-900">{stockOut.quantity}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Unit Price</p>
                                        <p className="text-lg font-bold text-gray-900">{formatPrice(stockOut.soldPrice)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Client Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wider">
                                <User className="w-4 h-4 text-primary-600" />
                                Client Information
                            </h3>
                            <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{stockOut.clientName || 'Walk-in Client'}</h4>
                                        <p className="text-xs text-gray-500">Full Name</p>
                                    </div>
                                </div>
                                <div className="space-y-3 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{stockOut.clientEmail || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-600">{stockOut.clientPhone || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Totals Summary */}
                    <div className="bg-primary-50 border border-primary-100 rounded-xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-primary-900 text-lg">Total Sale Amount</h4>
                                <p className="text-primary-700 text-xs">Calculated quantity × unit price</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-black text-primary-600">{formatPrice(stockOut.soldPrice * stockOut.quantity)}</p>
                            <p className="text-primary-700 text-xs">Currency: RWF</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewStockOutModal;

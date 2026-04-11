/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
    Search, Package, Hash, User, Mail, Phone, Calendar,
    RotateCcw, AlertTriangle, Check, ArrowLeft, Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import stockOutService from '../../services/stockoutService';
import salesReturnService from '../../services/salesReturnService';
import useAdminAuth from '../../context/AdminAuthContext';
import useEmployeeAuth from '../../context/EmployeeAuthContext';

// ── Types ────────────────────────────────────────────────────
interface StockIn {
    id: number;
    sku: string;
    itemName: string;
    unitOfMeasure: string;
}

interface StockOutItem {
    id: string;
    transactionId?: string;
    quantity: number;
    soldPrice?: string;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    createdAt: string;
    stockin?: StockIn;
    externalItemName?: string;
    externalSku?: string;
}

interface SelectedItem {
    stockoutId: string;
    quantity: number;
    maxQuantity: number;
    itemName: string;
    sku: string;
    unitPrice: number;
    soldPrice: number;
    soldQuantity: number;
    isExternal?: boolean;
}

interface ValidationErrors {
    [stockoutId: string]: string;
}

const commonReasons = [
    'Defective product',
    'Wrong item ordered',
    'Damaged during shipping',
    'Customer changed mind',
    'Product expired',
    'Size/color mismatch',
    'Quality issues',
    'Not as described',
    'Duplicate order',
    'Other',
];

// ── Component ────────────────────────────────────────────────
const UpsertSalesReturnPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const isEmployee = location.pathname.includes('/employee/');
    const role = isEmployee ? 'employee' : 'admin';

    const { user: adminData } = useAdminAuth();
    const { user: employeeData } = useEmployeeAuth();
    const currentUser = isEmployee ? employeeData : adminData;

    // Form state
    const [transactionId, setTransactionId] = useState<string>(searchParams.get('transactionId') || '');
    const [reason, setReason] = useState<string>('');
    const [soldProducts, setSoldProducts] = useState<StockOutItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [searchError, setSearchError] = useState<string>('');
    const [hasSearched, setHasSearched] = useState<boolean>(false);
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string>('');

    // Auto-search if transactionId is already in URL on mount
    useEffect(() => {
        const txFromUrl = searchParams.get('transactionId');
        if (txFromUrl?.trim()) {
            setTransactionId(txFromUrl);
            handleSearchTransaction(txFromUrl);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Keep URL param in sync when user types
    const handleTransactionIdChange = (val: string) => {
        setTransactionId(val);
        setSearchError('');
        if (val.trim()) {
            setSearchParams({ transactionId: val }, { replace: true });
        } else {
            setSearchParams({}, { replace: true });
        }
    };

    const handleSearchTransaction = async (txId?: string): Promise<void> => {
        const id = (txId ?? transactionId).trim();
        if (!id) {
            setSearchError('Please enter a transaction ID');
            return;
        }
        setIsSearching(true);
        setSearchError('');
        setHasSearched(false);
        setSoldProducts([]);
        setSelectedItems([]);
        try {
            const response: StockOutItem[] = await stockOutService.getStockOutByTransactionId(id);
            if (response && response.length > 0) {
                const available = response.filter(item => item.quantity > 0);
                if (available.length > 0) {
                    setSoldProducts(available);
                    setHasSearched(true);
                } else {
                    setSearchError('All items from this transaction have already been returned');
                    setHasSearched(true);
                }
            } else {
                setSearchError('No products found for this transaction ID');
                setHasSearched(true);
            }
        } catch (error: any) {
            setSearchError(`Failed to find transaction: ${error.message || 'Unknown error'}`);
            setHasSearched(true);
        } finally {
            setIsSearching(false);
        }
    };

    const handleItemSelect = (stockoutId: string, isSelected: boolean): void => {
        if (isSelected) {
            const product = soldProducts.find(p => p.id === stockoutId);
            if (product) {
                const unitPrice = product.soldPrice
                    ? parseFloat(product.soldPrice)
                    : 0;
                setSelectedItems(prev => [...prev, {
                    stockoutId,
                    quantity: 1,
                    maxQuantity: product.quantity,
                    itemName: product.stockin?.itemName || product.externalItemName || 'Unknown Item',
                    sku: product.stockin?.sku || product.externalSku || 'N/A',
                    unitPrice,
                    soldPrice: parseFloat(product.soldPrice || '0'),
                    soldQuantity: product.quantity,
                    isExternal: !product.stockin
                }]);
            }
        } else {
            setSelectedItems(prev => prev.filter(i => i.stockoutId !== stockoutId));
        }
        setValidationErrors(prev => { const e = { ...prev }; delete e[stockoutId]; return e; });
    };

    const handleQuantityChange = (stockoutId: string, quantity: string): void => {
        const num = parseInt(quantity) || 0;
        setSelectedItems(prev =>
            prev.map(item =>
                item.stockoutId === stockoutId
                    ? { ...item, quantity: Math.min(Math.max(0, num), item.maxQuantity) }
                    : item
            )
        );
        if (num > 0) {
            setValidationErrors(prev => { const e = { ...prev }; delete e[stockoutId]; return e; });
        }
    };

    const handleUnitPriceChange = (stockoutId: string, unitPriceStr: string): void => {
        const num = parseFloat(unitPriceStr) || 0;
        setSelectedItems(prev =>
            prev.map(item =>
                item.stockoutId === stockoutId
                    ? { ...item, unitPrice: Math.max(0, num) }
                    : item
            )
        );
    };

    const validateForm = (): boolean => {
        if (!transactionId.trim()) { setSearchError('Transaction ID is required'); return false; }
        if (!reason.trim()) { setSearchError('Return reason is required'); return false; }
        if (selectedItems.length === 0) { setSearchError('Please select at least one item to return'); return false; }

        const errors: ValidationErrors = {};
        let valid = true;
        selectedItems.forEach(item => {
            if (item.quantity <= 0) { errors[item.stockoutId] = 'Quantity must be > 0'; valid = false; }
            if (item.quantity > item.maxQuantity) { errors[item.stockoutId] = `Max: ${item.maxQuantity}`; valid = false; }
        });
        setValidationErrors(errors);
        if (!valid) setSearchError('Fix quantity errors below');
        return valid;
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitError('');
        try {
            await salesReturnService.createSalesReturn({
                transactionId: transactionId.trim(),
                reason: reason.trim(),
                items: selectedItems.map(item => ({ stockoutId: item.stockoutId, quantity: item.quantity, unitPrice: item.unitPrice })),
                adminId: !isEmployee ? (adminData as any)?.id : undefined,
                employeeId: isEmployee ? (employeeData as any)?.id : undefined,
            });
            navigate(`/${role}/dashboard/sales-return-management`);
        } catch (error: any) {
            setSubmitError(error.message || 'Failed to process return');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'RWF' }).format(price);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const totalRefund = selectedItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const totalQty = selectedItems.reduce((s, i) => s + i.quantity, 0);
    const isItemSelected = (id: string) => selectedItems.some(i => i.stockoutId === id);
    const getSelectedItem = (id: string) => selectedItems.find(i => i.stockoutId === id);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ── Header ── */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/${role}/dashboard/sales-return-management`)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-widest transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Sales Returns
                    </button>
                    <span className="text-slate-600">|</span>
                    <div className="flex items-center gap-2 text-white">
                        <RotateCcw className="w-4 h-4 text-blue-400" />
                        <span className="font-semibold text-sm">Process Return</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(`/${role}/dashboard/sales-return-management`)}
                        className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || selectedItems.length === 0 || !reason.trim()}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                        {isSubmitting
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Processing...</>
                            : <><RotateCcw className="w-3.5 h-3.5" />Process Return {selectedItems.length > 0 && `(${selectedItems.length})`}</>
                        }
                    </button>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

                {/* Submit error */}
                {submitError && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        {submitError}
                    </div>
                )}

                {/* User Info */}
                {currentUser && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                        <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="text-xs text-blue-800">
                            <span className="font-semibold">Processing as {role}: </span>
                            {role === 'admin'
                                ? (currentUser as any).adminName
                                : `${(currentUser as any).firstname ?? ''} ${(currentUser as any).lastname ?? ''}`.trim()
                            }
                            {(currentUser as any).email && ` · ${(currentUser as any).email}`}
                        </div>
                    </div>
                )}

                {/* Transaction Search */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Step 1 — Find Transaction</h2>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => handleTransactionIdChange(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchTransaction()}
                            placeholder="e.g., ABTR64943"
                            disabled={isSearching || isSubmitting}
                            className={`flex-1 px-4 py-2.5 border rounded-lg text-sm text-slate-800 focus:ring-2 outline-none transition-all ${isSearching || isSubmitting ? 'bg-slate-100 border-slate-200 cursor-not-allowed opacity-70' : 'border-slate-200 focus:ring-blue-500 focus:border-blue-500'}`}
                        />
                        <button
                            onClick={() => handleSearchTransaction()}
                            disabled={isSearching || isSubmitting || !transactionId.trim()}
                            className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                            {isSearching
                                ? <><Loader2 className="w-4 h-4 animate-spin" />Searching...</>
                                : <><Search className="w-4 h-4" />Search</>
                            }
                        </button>
                    </div>
                    {searchError && (
                        <div className="mt-3 flex items-center gap-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg border border-red-200">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            {searchError}
                        </div>
                    )}
                </div>

                {/* Transaction Info */}
                {hasSearched && soldProducts.length > 0 && (
                    <>
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Transaction Details</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-medium">{soldProducts[0].transactionId}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-medium">{soldProducts[0].clientName || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="font-medium">{formatDate(soldProducts[0].createdAt)}</span>
                                </div>
                                {soldProducts[0].clientEmail && (
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="font-medium">{soldProducts[0].clientEmail}</span>
                                    </div>
                                )}
                                {soldProducts[0].clientPhone && (
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="font-medium">{soldProducts[0].clientPhone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Return Reason */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                                Step 2 — Return Reason <span className="text-red-500">*</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select
                                    value={reason}
                                    onChange={(e) => { setReason(e.target.value); setSearchError(''); }}
                                    className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select reason...</option>
                                    {commonReasons.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                                <input
                                    type="text"
                                    value={reason}
                                    onChange={(e) => { setReason(e.target.value); setSearchError(''); }}
                                    placeholder="Or type a custom reason..."
                                    className="px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Item Selection */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                                Step 3 — Select Items to Return
                            </h2>
                            <div className="space-y-3">
                                {soldProducts.map((product) => {
                                    const isSel = isItemSelected(product.id);
                                    const selItem = getSelectedItem(product.id);
                                    const hasErr = validationErrors[product.id];
                                    const unitPrice = product.soldPrice
                                        ? parseFloat(product.soldPrice) / product.quantity
                                        : 0;

                                    return (
                                        <div
                                            key={product.id}
                                            className={`border rounded-xl p-4 transition-all ${isSel
                                                ? 'border-blue-300 bg-blue-50/50'
                                                : 'border-slate-200 hover:border-blue-200 bg-slate-50/50'
                                                } ${hasErr ? 'border-red-300 bg-red-50/50' : ''}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isSel}
                                                    onChange={(e) => handleItemSelect(product.id, e.target.checked)}
                                                    className="mt-1.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-slate-300"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between mb-2">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-white flex-shrink-0">
                                                                <Package className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-800 text-sm">{product.stockin?.itemName || product.externalItemName || 'Unknown Item'}</p>
                                                                <div className="flex gap-3 text-[10px] text-slate-500 mt-0.5">
                                                                    <span>SKU: <strong className="text-slate-700">{product.stockin?.sku || product.externalSku || 'N/A'}</strong></span>
                                                                    <span>Qty: <strong className="text-slate-700">{product.quantity} {product.stockin?.unitOfMeasure || 'units'}</strong></span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <p className="font-bold text-slate-800 text-sm">{formatPrice(parseFloat(product.soldPrice || '0'))}</p>
                                                            <p className="text-[10px] text-slate-400">{formatPrice(unitPrice)} / unit</p>
                                                        </div>
                                                    </div>

                                                    {isSel && selItem && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: 'auto' }}
                                                            className="mt-3 p-4 bg-white rounded-lg border border-slate-200"
                                                        >
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                                                        Qty to Return <span className="text-red-500">*</span>
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        max={selItem.maxQuantity}
                                                                        value={selItem.quantity}
                                                                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                                                        className={`w-full text-center font-bold px-3 py-2 border rounded-lg text-slate-800 focus:ring-2 outline-none ${hasErr ? 'border-red-300 focus:ring-red-400' : 'border-slate-200 focus:ring-blue-500'}`}
                                                                    />
                                                                    <p className="text-[9px] text-slate-400 text-center mt-1 uppercase tracking-wide">Max: {selItem.maxQuantity}</p>
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                                                                      <span>{selItem.isExternal ? 'Unit Price (Editable)' : 'Total Refund'}</span>
                                                                    </label>
                                                                    {selItem.isExternal ? (
                                                                         <input
                                                                            type="number"
                                                                            min="0"
                                                                            step="0.01"
                                                                            value={selItem.unitPrice}
                                                                            onChange={(e) => handleUnitPriceChange(product.id, e.target.value)}
                                                                            className={`w-full text-center font-bold px-3 py-2 border border-slate-200 rounded-lg text-emerald-600 focus:ring-2 focus:ring-blue-500 outline-none`}
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                                                                            <span className="font-bold text-emerald-600 text-sm">{formatPrice(selItem.unitPrice * selItem.quantity)}</span>
                                                                        </div>
                                                                    )}
                                                                    <p className="text-[9px] text-slate-400 text-center mt-1 uppercase tracking-wide">{formatPrice(selItem.unitPrice)} × {selItem.quantity}</p>
                                                                </div>
                                                            </div>

                                                            {selItem.isExternal && (
                                                                <div className="mt-4 flex items-start gap-2 bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs text-yellow-800">
                                                                    <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                                                                    <p>
                                                                        <strong>Warning:</strong> This is a returned external item. A new stock record will be generated automatically. 
                                                                        Please verify the default sold price and confirm or enter your own unit price for the newly created stock.
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}

                                                    {hasErr && (
                                                        <p className="mt-2 flex items-center gap-1.5 text-red-600 text-[10px] font-medium">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            {hasErr}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Summary */}
                        {selectedItems.length > 0 && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                                <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    Return Summary
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Unique Items', value: selectedItems.length },
                                        { label: 'Total Quantity', value: totalQty },
                                        { label: 'Total Refund', value: formatPrice(totalRefund) },
                                        { label: 'Avg / Unit', value: formatPrice(totalQty > 0 ? totalRefund / totalQty : 0) },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="bg-white rounded-lg border border-emerald-200 p-3 text-center">
                                            <div className="font-bold text-emerald-600 text-lg leading-none">{value}</div>
                                            <div className="text-[9px] text-slate-500 uppercase tracking-wide mt-1">{label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Empty state after search with no results */}
                {hasSearched && soldProducts.length === 0 && !searchError && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <RotateCcw className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="font-bold text-slate-700 mb-1">No Returnable Items</h3>
                        <p className="text-xs text-slate-400">
                            Transaction <strong className="text-slate-600">{transactionId}</strong> has no returnable items.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UpsertSalesReturnPage;

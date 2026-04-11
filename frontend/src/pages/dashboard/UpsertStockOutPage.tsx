/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    ArrowLeft, Plus, Search, ChevronDown, Check, Package,
    ShoppingCart, AlertCircle, Loader2, X,
} from 'lucide-react';
import stockOutService from '../../services/stockoutService';
import stockInService from '../../services/stockService';
import useAdminAuth from '../../context/AdminAuthContext';
import useEmployeeAuth from '../../context/EmployeeAuthContext';

// ── Types ─────────────────────────────────────────────────────
interface StockIn {
    id: number;
    sku: string;
    itemName: string;
    receivedQuantity: number;
    unitCost?: number;
    warehouseLocation: string;
}

type PaymentMethod = 'CARD' | 'MOMO' | 'CASH';

interface SalesEntry {
    stockinId: string;
    quantity: string;
    soldPrice: string;
    isExternal: boolean;
    externalItemName?: string;
    externalSku?: string;
}

interface EntryError {
    stockinId: string;
    quantity: string;
    soldPrice: string;
    externalItemName?: string;
}

// ── SearchableSelect (same as in modal) ──────────────────────
const SearchableSelect: React.FC<{
    options: { value: string; label: string; subLabel?: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
}> = ({ options, value, onChange, placeholder = 'Select item...', error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const selected = options.find(o => o.value === value);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false); setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);

    const filtered = options.filter(o =>
        o.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.subLabel && o.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-3 py-2.5 text-xs border rounded-lg cursor-pointer bg-white transition-colors ${error ? 'border-red-300' : 'border-slate-200'} ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : 'hover:border-slate-300'}`}
            >
                <div className="flex items-center justify-between">
                    <span className={selected ? 'text-slate-800' : 'text-slate-400'}>
                        {selected ? (
                            <span className="flex flex-col">
                                <span>{selected.label}</span>
                                {selected.subLabel && <span className="text-slate-400 text-[10px]">{selected.subLabel}</span>}
                            </span>
                        ) : placeholder}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                            <input ref={inputRef} type="text" placeholder="Search..." value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-7 pr-3 py-1.5 text-xs border border-slate-200 rounded bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {filtered.length === 0
                            ? <div className="px-3 py-4 text-center text-xs text-slate-400">No results found</div>
                            : filtered.map((opt) => (
                                <div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); setSearchTerm(''); }}
                                    className={`px-3 py-2 hover:bg-slate-50 cursor-pointer text-xs ${opt.value === value ? 'bg-blue-50 text-blue-600' : 'text-slate-800'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span>{opt.label}</span>
                                            {opt.subLabel && <p className="text-[10px] text-slate-400 mt-0.5">{opt.subLabel}</p>}
                                        </div>
                                        {opt.value === value && <Check className="h-3 w-3 text-blue-600" />}
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            )}
            {error && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><X className="h-3 w-3" />{error}</p>}
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────
const UpsertStockOutPage: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const isEmployee = location.pathname.includes('/employee/');
    const role = isEmployee ? 'employee' : 'admin';
    const isUpdateMode = !!id;

    const { user: adminData } = useAdminAuth();
    const { user: employeeData } = useEmployeeAuth();

    // Shared state
    const [stockIns, setStockIns] = useState<StockIn[]>([]);
    const [loadingStockIns, setLoadingStockIns] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [showWarnings, setShowWarnings] = useState(false);

    // Client info
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');

    // Create mode: multi-entry
    const [salesEntries, setSalesEntries] = useState<SalesEntry[]>([
        { stockinId: '', quantity: '', soldPrice: '', isExternal: false, externalItemName: '', externalSku: '' },
    ]);
    const [entryErrors, setEntryErrors] = useState<EntryError[]>([]);

    // Update mode: single entry fields
    const [upStockinId, setUpStockinId] = useState('');
    const [upQuantity, setUpQuantity] = useState('');
    const [upSoldPrice, setUpSoldPrice] = useState('');
    const [upIsExternal, setUpIsExternal] = useState(false);
    const [upExternalName, setUpExternalName] = useState('');
    const [upExternalSku, setUpExternalSku] = useState('');
    const [upFieldErrors, setUpFieldErrors] = useState({ stockinId: '', quantity: '', soldPrice: '', externalItemName: '' });

    // Fetch stock-in inventory list
    useEffect(() => {
        const load = async () => {
            setLoadingStockIns(true);
            try {
                const data = await stockInService.getAllStocks();
                const arr = Array.isArray(data) ? data : (data as any)?.data ?? [];
                setStockIns(arr);
            } catch (e) {
                console.error('Failed to load inventory:', e);
            } finally {
                setLoadingStockIns(false);
            }
        };
        load();
    }, []);

    // If update mode, fetch existing stockout
    useEffect(() => {
        if (!isUpdateMode || !id) return;
        const load = async () => {
            try {
                const data = await stockOutService.getStockOutById(id);
                const rec = data?.data ?? data;
                setUpStockinId(rec.stockinId?.toString() ?? '');
                setUpQuantity(rec.quantity?.toString() ?? '');
                setUpSoldPrice(rec.soldPrice?.toString() ?? '');
                setClientName(rec.clientName ?? '');
                setClientEmail(rec.clientEmail ?? '');
                setClientPhone(rec.clientPhone ?? '');
                setPaymentMethod(rec.paymentMethod ?? '');
            } catch (e) {
                console.error('Failed to load stockout:', e);
            }
        };
        load();
    }, [id, isUpdateMode]);

    // ── Validation helpers ──────────────────────────────────
    const validateQty = (qty: string, stockinId?: string) => {
        if (!qty) return 'Quantity is required';
        const n = Number(qty);
        if (isNaN(n) || n <= 0 || !Number.isInteger(n)) return 'Must be a positive whole number';
        if (stockinId) {
            const s = stockIns.find(s => s.id === Number(stockinId));
            if (s && n > s.receivedQuantity) return `Max available: ${s.receivedQuantity}`;
        }
        return '';
    };
    const validatePrice = (p: string) => {
        if (!p) return '';
        const n = Number(p);
        if (isNaN(n) || n < 0) return 'Must be a valid positive number';
        return '';
    };
    const validateEmail = (e: string) => {
        if (!e) return '';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? '' : 'Invalid email';
    };
    const validatePhone = (p: string) => {
        if (!p) return '';
        const c = p.replace(/[\s\-()]/g, '');
        return /^\+?\d{9,15}$/.test(c) ? '' : 'Invalid phone number';
    };

    // ── Entry handlers (create mode) ──────────────────────
    const updateEntry = (index: number, field: keyof SalesEntry, value: any) => {
        const updated = salesEntries.map((e, i) => i === index ? { ...e, [field]: value } : e);
        if (field === 'isExternal') {
            updated[index] = { ...updated[index], stockinId: '', externalItemName: '', externalSku: '', quantity: '' };
        }
        if (field === 'stockinId' && value && !updated[index].isExternal) {
            const s = stockIns.find(s => s.id === Number(value));
            if (s && !updated[index].quantity) {
                updated[index].quantity = String(Math.max(1, Math.floor(s.receivedQuantity / 2)));
            }
        }
        setSalesEntries(updated);
    };

    const addEntry = () => {
        setSalesEntries(prev => [...prev, { stockinId: '', quantity: '', soldPrice: '', isExternal: false, externalItemName: '', externalSku: '' }]);
    };

    const removeEntry = (index: number) => {
        if (salesEntries.length <= 1) return;
        setSalesEntries(prev => prev.filter((_, i) => i !== index));
        setEntryErrors(prev => prev.filter((_, i) => i !== index));
    };

    // ── Submit ─────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowWarnings(true);
        setSubmitError('');

        if (isUpdateMode) {
            const errs = {
                stockinId: upIsExternal ? '' : (!upStockinId ? 'Stock item required' : ''),
                externalItemName: upIsExternal && !upExternalName.trim() ? 'Item name required' : '',
                quantity: validateQty(upQuantity, upIsExternal ? undefined : upStockinId),
                soldPrice: validatePrice(upSoldPrice),
            };
            setUpFieldErrors(errs);
            if (Object.values(errs).some(Boolean)) return;

            setIsSubmitting(true);
            try {
                await stockOutService.updateStockOut(id!, {
                    quantity: Number(upQuantity),
                    soldPrice: upSoldPrice ? Number(upSoldPrice) : undefined,
                    clientName: clientName.trim() || undefined,
                    clientEmail: clientEmail.trim() || undefined,
                    clientPhone: clientPhone.trim() || undefined,
                    paymentMethod: paymentMethod || undefined,
                    adminId: !isEmployee ? (adminData as any)?.id : undefined,
                    employeeId: isEmployee ? (employeeData as any)?.id : undefined,
                });
                navigate(`/${role}/dashboard/stockout-management`);
            } catch (err: any) {
                setSubmitError(err.message || 'Failed to update');
            } finally {
                setIsSubmitting(false);
            }
        } else {
            // Validate all entries
            const errs: EntryError[] = salesEntries.map(e => ({
                stockinId: e.isExternal ? '' : (!e.stockinId ? 'Stock item required' : ''),
                externalItemName: e.isExternal && !e.externalItemName?.trim() ? 'Item name required' : '',
                quantity: validateQty(e.quantity, e.isExternal ? undefined : e.stockinId),
                soldPrice: e.isExternal && !e.soldPrice ? 'Price required for external items' : validatePrice(e.soldPrice),
            }));
            setEntryErrors(errs);
            const emailErr = validateEmail(clientEmail);
            const phoneErr = validatePhone(clientPhone);
            if (errs.some(e => Object.values(e).some(Boolean)) || emailErr || phoneErr) return;

            // Check duplicate stockinIds
            const nonExternal = salesEntries.filter(e => !e.isExternal).map(e => e.stockinId);
            if (new Set(nonExternal).size !== nonExternal.length) {
                setSubmitError('Cannot add the same stock item multiple times');
                return;
            }

            setIsSubmitting(true);
            try {
                const result = await stockOutService.createMultipleStockOut(
                    salesEntries.map(e => ({
                        stockinId: e.isExternal ? (0 as any) : Number(e.stockinId),
                        quantity: Number(e.quantity),
                        soldPrice: e.soldPrice ? Number(e.soldPrice) : undefined,
                        externalItemName: e.isExternal ? e.externalItemName : undefined,
                        externalSku: e.isExternal ? e.externalSku : undefined,
                    })),
                    {
                        clientName: clientName.trim() || undefined,
                        clientEmail: clientEmail.trim() || undefined,
                        clientPhone: clientPhone.trim() || undefined,
                        paymentMethod: paymentMethod || undefined,
                    },
                    {
                        adminId: !isEmployee ? (adminData as any)?.id : undefined,
                        employeeId: isEmployee ? (employeeData as any)?.id : undefined,
                    }
                );
                const txId = (result as any)?.transactionId ?? (result as any)?.data?.transactionId;
                if (txId) {
                    navigate(`/${role}/dashboard/stockout-management/view/${txId}?transactionId=${txId}`);
                } else {
                    navigate(`/${role}/dashboard/stockout-management`);
                }
            } catch (err: any) {
                setSubmitError(err.message || 'Failed to create sale');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const totalRevenue = salesEntries.reduce((s, e) => s + (Number(e.soldPrice) || 0) * (Number(e.quantity) || 0), 0);
    const totalQty = salesEntries.reduce((s, e) => s + (Number(e.quantity) || 0), 0);

    const getStockInfo = (sid: string) => stockIns.find(s => s.id === Number(sid));

    if (loadingStockIns) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading inventory...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* ── Header ── */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(`/${role}/dashboard/stockout-management`)}
                        className="flex items-center gap-2 text-slate-400 hover:text-white text-xs font-semibold uppercase tracking-widest transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Stock Out
                    </button>
                    <span className="text-slate-600">|</span>
                    <div className="flex items-center gap-2 text-white">
                        <ShoppingCart className="w-4 h-4 text-blue-400" />
                        <span className="font-semibold text-sm">{isUpdateMode ? 'Edit Sale' : 'New Sale'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate(`/${role}/dashboard/stockout-management`)}
                        className="px-4 py-2 border border-slate-600 text-slate-300 rounded-lg text-xs font-semibold uppercase tracking-wider hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                    >
                        {isSubmitting
                            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{isUpdateMode ? 'Updating...' : 'Processing...'}</>
                            : <><Check className="w-3.5 h-3.5" />{isUpdateMode ? 'Update Sale' : 'Record Sale'}</>
                        }
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

                    {submitError && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {submitError}
                        </div>
                    )}

                    {/* ── Customer Info ── */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-100">
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Customer Information (Optional)</h2>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { label: 'Client Name', value: clientName, onChange: setClientName, placeholder: 'e.g., John Doe', type: 'text' },
                                { label: 'Client Email', value: clientEmail, onChange: setClientEmail, placeholder: 'e.g., john@email.com', type: 'email', err: showWarnings ? validateEmail(clientEmail) : '' },
                                { label: 'Client Phone', value: clientPhone, onChange: setClientPhone, placeholder: 'e.g., 0781234567', type: 'tel', err: showWarnings ? validatePhone(clientPhone) : '' },
                            ].map(({ label, value, onChange, placeholder, type, err }) => (
                                <div key={label}>
                                    <label className="block text-xs font-medium text-slate-500 mb-1.5">{label}</label>
                                    <input
                                        type={type}
                                        value={value}
                                        onChange={(e) => onChange(e.target.value)}
                                        placeholder={placeholder}
                                        className={`w-full px-3 py-2.5 text-xs border rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${err ? 'border-red-300' : 'border-slate-200'}`}
                                    />
                                    {err && <p className="text-xs text-red-600 mt-1">{err}</p>}
                                </div>
                            ))}
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Payment Method</label>
                                <select
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod | '')}
                                    className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select method...</option>
                                    <option value="CASH">Cash</option>
                                    <option value="MOMO">Mobile Money</option>
                                    <option value="CARD">Card</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* ── Sale Entries ── */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                {isUpdateMode ? 'Sale Details' : 'Sales Entries'}
                            </h2>
                            {!isUpdateMode && (
                                <button type="button" onClick={addEntry}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Item
                                </button>
                            )}
                        </div>

                        <div className="p-6 space-y-4">
                            {isUpdateMode ? (
                                /* ── Update: single entry ── */
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        {(['From Stock', 'External Item'] as const).map((label, i) => (
                                            <button key={label} type="button"
                                                onClick={() => { setUpIsExternal(i === 1); setUpStockinId(''); setUpExternalName(''); setUpExternalSku(''); }}
                                                className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${(i === 1) === upIsExternal ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                    {!upIsExternal ? (
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Stock Item <span className="text-red-500">*</span></label>
                                            <SearchableSelect
                                                options={stockIns.map(s => ({ value: s.id.toString(), label: s.itemName, subLabel: `SKU: ${s.sku} • Available: ${s.receivedQuantity}` }))}
                                                value={upStockinId}
                                                onChange={setUpStockinId}
                                                placeholder="Select stock item"
                                                error={showWarnings ? upFieldErrors.stockinId : ''}
                                            />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Item Name <span className="text-red-500">*</span></label>
                                                <input type="text" value={upExternalName} onChange={e => setUpExternalName(e.target.value)} placeholder="Item name"
                                                    className={`w-full px-3 py-2.5 text-xs border rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${showWarnings && upFieldErrors.externalItemName ? 'border-red-300' : 'border-slate-200'}`} />
                                                {showWarnings && upFieldErrors.externalItemName && <p className="text-xs text-red-600 mt-1">{upFieldErrors.externalItemName}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-slate-500 mb-1.5">SKU</label>
                                                <input type="text" value={upExternalSku} onChange={e => setUpExternalSku(e.target.value)} placeholder="Optional SKU"
                                                    className="w-full px-3 py-2.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Quantity <span className="text-red-500">*</span></label>
                                            <input type="number" min="1" value={upQuantity} onChange={e => setUpQuantity(e.target.value)} placeholder="0"
                                                className={`w-full px-3 py-2.5 text-xs border rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${showWarnings && upFieldErrors.quantity ? 'border-red-300' : 'border-slate-200'}`} />
                                            {showWarnings && upFieldErrors.quantity && <p className="text-xs text-red-600 mt-1">{upFieldErrors.quantity}</p>}
                                            {upStockinId && getStockInfo(upStockinId) && <p className="text-[10px] text-slate-400 mt-1">Available: {getStockInfo(upStockinId)!.receivedQuantity}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Unit Price (RWF)</label>
                                            <input type="number" min="0" value={upSoldPrice} onChange={e => setUpSoldPrice(e.target.value)} placeholder="0"
                                                className={`w-full px-3 py-2.5 text-xs border rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 ${showWarnings && upFieldErrors.soldPrice ? 'border-red-300' : 'border-slate-200'}`} />
                                            {showWarnings && upFieldErrors.soldPrice && <p className="text-xs text-red-600 mt-1">{upFieldErrors.soldPrice}</p>}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* ── Create: multi-entry ── */
                                <>
                                    {salesEntries.map((entry, idx) => {
                                        const err = entryErrors[idx];
                                        const stockInfo = !entry.isExternal && entry.stockinId ? getStockInfo(entry.stockinId) : null;
                                        const lineTotal = (Number(entry.soldPrice) || 0) * (Number(entry.quantity) || 0);

                                        return (
                                            <div key={idx} className="border border-slate-200 rounded-xl p-4 relative">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-white text-[10px] font-bold">{idx + 1}</div>
                                                        <span className="text-xs font-semibold text-slate-600">Item {idx + 1}</span>
                                                        {lineTotal > 0 && <span className="text-xs text-slate-400">= RWF {lineTotal.toLocaleString()}</span>}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex gap-1">
                                                            {['From Stock', 'External'].map((label, i) => (
                                                                <button key={label} type="button"
                                                                    onClick={() => updateEntry(idx, 'isExternal', i === 1)}
                                                                    className={`px-2 py-1 text-[10px] font-medium rounded border transition-colors ${(i === 1) === entry.isExternal ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
                                                                >
                                                                    {label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        {salesEntries.length > 1 && (
                                                            <button type="button" onClick={() => removeEntry(idx)}
                                                                className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div className="md:col-span-1">
                                                        {!entry.isExternal ? (
                                                            <div>
                                                                <label className="block text-[10px] font-medium text-slate-500 mb-1">Item <span className="text-red-500">*</span></label>
                                                                <SearchableSelect
                                                                    options={stockIns.map(s => ({ value: s.id.toString(), label: s.itemName, subLabel: `SKU: ${s.sku} · Avail: ${s.receivedQuantity}` }))}
                                                                    value={entry.stockinId}
                                                                    onChange={(v) => updateEntry(idx, 'stockinId', v)}
                                                                    placeholder="Select item"
                                                                    error={showWarnings ? err?.stockinId : ''}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <div>
                                                                    <label className="block text-[10px] font-medium text-slate-500 mb-1">Item Name <span className="text-red-500">*</span></label>
                                                                    <input type="text" value={entry.externalItemName ?? ''} onChange={e => updateEntry(idx, 'externalItemName', e.target.value)} placeholder="Item name"
                                                                        className={`w-full px-2 py-2 text-xs border rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 ${showWarnings && err?.externalItemName ? 'border-red-300' : 'border-slate-200'}`} />
                                                                    {showWarnings && err?.externalItemName && <p className="text-[10px] text-red-600 mt-0.5">{err.externalItemName}</p>}
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[10px] font-medium text-slate-500 mb-1">SKU</label>
                                                                    <input type="text" value={entry.externalSku ?? ''} onChange={e => updateEntry(idx, 'externalSku', e.target.value)} placeholder="Optional"
                                                                        className="w-full px-2 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-medium text-slate-500 mb-1">Quantity <span className="text-red-500">*</span></label>
                                                        <input type="number" min="1" value={entry.quantity} onChange={e => updateEntry(idx, 'quantity', e.target.value)} placeholder="0"
                                                            className={`w-full px-2 py-2 text-xs border rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 ${showWarnings && err?.quantity ? 'border-red-300' : 'border-slate-200'}`} />
                                                        {stockInfo && <p className="text-[9px] text-slate-400 mt-0.5">Avail: {stockInfo.receivedQuantity}</p>}
                                                        {showWarnings && err?.quantity && <p className="text-[10px] text-red-600 mt-0.5">{err.quantity}</p>}
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-medium text-slate-500 mb-1">Unit Price (RWF){entry.isExternal && <span className="text-red-500"> *</span>}</label>
                                                        <input type="number" min="0" value={entry.soldPrice} onChange={e => updateEntry(idx, 'soldPrice', e.target.value)} placeholder="0"
                                                            className={`w-full px-2 py-2 text-xs border rounded-lg bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 ${showWarnings && err?.soldPrice ? 'border-red-300' : 'border-slate-200'}`} />
                                                        {stockInfo?.unitCost && entry.soldPrice && Number(entry.soldPrice) < Number(stockInfo.unitCost) && (
                                                            <p className="text-[9px] text-amber-600 mt-0.5">Below cost price</p>
                                                        )}
                                                        {showWarnings && err?.soldPrice && <p className="text-[10px] text-red-600 mt-0.5">{err.soldPrice}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <button type="button" onClick={addEntry}
                                        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-xs font-semibold text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Another Item
                                    </button>

                                    {/* Summary */}
                                    {salesEntries.some(e => e.quantity) && (
                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                                                <Package className="w-3.5 h-3.5" />
                                                Transaction Summary
                                            </div>
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
                                                    <div className="font-bold text-slate-800 text-lg">{salesEntries.filter(e => e.stockinId || e.externalItemName).length}</div>
                                                    <div className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">Items</div>
                                                </div>
                                                <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
                                                    <div className="font-bold text-slate-800 text-lg">{totalQty}</div>
                                                    <div className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">Total Qty</div>
                                                </div>
                                                <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
                                                    <div className="font-bold text-blue-600 text-lg">RWF {totalRevenue.toLocaleString()}</div>
                                                    <div className="text-[9px] text-slate-400 uppercase tracking-wide mt-0.5">Revenue</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UpsertStockOutPage;

import React, { useState, useEffect } from 'react';
import { 
    Check, Package, Plus, Trash2, AlertCircle,
    ArrowLeft, TrendingUp, RefreshCw, CheckCircle, Briefcase
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import useAdminAuth from '../../context/AdminAuthContext';
import stockService, { type Stock } from '../../services/stockService';
import proformaService, { type CreateProformaDto, type CreateProformaItemDto } from '../../services/proformaInvoiceService';
import { motion, AnimatePresence } from 'framer-motion';

const CreateProformaForm: React.FC = () => {
    const { id } = useParams<{ id?: string }>();
    const isEdit = !!id;
    const navigate = useNavigate();
    const { user: adminData } = useAdminAuth();
    const role = adminData?.role || 'admin';

    const [isLoading, setIsLoading] = useState(false);
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [stockSearch, setStockSearch] = useState('');
    const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);

    const [formData, setFormData] = useState<CreateProformaDto>({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        expiryDate: undefined,
        paymentTerms: 'COD',
        notes: '',
        discountType: 'FIXED',
        discountValue: 0,
        items: [
            { productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxPct: 0 }
        ],
        createdByAdminId: adminData?.id
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const stockData = await stockService.getAllStocks();
                setStocks(Array.isArray(stockData) ? stockData : []);
                if (isEdit && id) {
                    const pi = await proformaService.getOne(id);
                    setFormData({
                        clientName: pi.clientName,
                        clientEmail: pi.clientEmail || '',
                        clientPhone: pi.clientPhone || '',
                        expiryDate: pi.expiryDate ? new Date(pi.expiryDate) : undefined,
                        paymentTerms: pi.paymentTerms || 'COD',
                        notes: pi.notes || '',
                        discountType: pi.discountType as any || 'FIXED',
                        discountValue: Number(pi.discountValue || 0),
                        items: pi.items.map((it: any) => ({
                            stockId: it.stockId,
                            productName: it.productName,
                            productSku: it.productSku,
                            quantity: Number(it.quantity),
                            unitPrice: Number(it.unitPrice),
                            discountPct: Number(it.discountPct || 0),
                            taxPct: Number(it.taxPct || 0)
                        })),
                        createdByAdminId: pi.createdByAdminId
                    });
                }
            } catch (error) { console.error('Error fetching data:', error); }
        };
        fetchData();
    }, [id, isEdit]);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { productName: '', quantity: 1, unitPrice: 0, discountPct: 0, taxPct: 0 }]
        }));
    };

    const removeItem = (idx: number) => {
        if (formData.items.length === 1) return;
        setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
    };

    const updateItem = (idx: number, field: keyof CreateProformaItemDto, value: any) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[idx] = { ...newItems[idx], [field]: value };
            return { ...prev, items: newItems };
        });
    };

    const selectStockItem = (idx: number, stock: Stock) => {
        updateItem(idx, 'stockId', stock.id);
        updateItem(idx, 'productName', stock.itemName);
        updateItem(idx, 'productSku', stock.sku);
        updateItem(idx, 'unitPrice', stock.unitCost);
        setActiveItemIndex(null);
    };

    const calculateTotal = () => {
        let subtotal = 0;
        let taxTotal = 0;
        formData.items.forEach(it => {
            const itemBase = Number(it.quantity) * Number(it.unitPrice);
            const discount = (itemBase * Number(it.discountPct || 0)) / 100;
            const afterDiscount = itemBase - discount;
            const tax = (afterDiscount * Number(it.taxPct || 0)) / 100;
            subtotal += afterDiscount;
            taxTotal += tax;
        });
        let grand = subtotal + taxTotal;
        if (formData.discountType === 'PERCENTAGE') grand -= (subtotal * Number(formData.discountValue || 0)) / 100;
        else grand -= Number(formData.discountValue || 0);
        return { subtotal, taxTotal, grandTotal: Math.max(0, grand) };
    };

    const handleSubmit = async () => {
        if (!formData.clientName) { showToast('Client Name is required', 'error'); return; }
        setIsLoading(true);
        try {
            if (isEdit && id) await proformaService.update(id, formData);
            else await proformaService.create(formData);
            showToast(`Proforma ${isEdit ? 'updated' : 'created'} successfully`, 'success');
            setTimeout(() => navigate(`/${role}/dashboard/proforma-management`), 1500);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to save', 'error');
        } finally { setIsLoading(false); }
    };

    const { subtotal, grandTotal } = calculateTotal();
    const filteredStocks = stocks.filter(s => s.itemName.toLowerCase().includes(stockSearch.toLowerCase()) || s.sku.toLowerCase().includes(stockSearch.toLowerCase()));

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-red-600 border-red-500 text-white'}`}>
                        {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <p className="text-sm font-medium">{toast.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="px-6 py-4 flex items-center justify-between max-w-[1400px] mx-auto">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><ArrowLeft className="w-5 h-5 text-slate-600" /></button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{isEdit ? 'Update' : 'Create'} Proforma Invoice</h1>
                            <p className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em] mt-0.5">Sales Workflow</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-[1400px] mx-auto space-y-6 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2"><Briefcase className="w-4 h-4 text-primary-600" /><h2 className="text-sm font-bold text-slate-900 uppercase">Client Information</h2></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Client Name *</label>
                                    <input type="text" value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white transition-all" placeholder="Enter Client Name" />
                                </div>
                                <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Expiry Date</label>
                                    <input type="date" value={formData.expiryDate ? (formData.expiryDate as any).toISOString().split('T')[0] : ''} onChange={e => setFormData({ ...formData, expiryDate: e.target.value ? new Date(e.target.value) : undefined })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white transition-all" />
                                </div>
                            </div>
                        </section>

                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2"><Package className="w-4 h-4 text-primary-600" /><h2 className="text-sm font-bold text-slate-900 uppercase">Items</h2></div>
                                <button onClick={addItem} className="flex items-center gap-2 text-primary-600 font-bold text-[11px] uppercase tracking-wider hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-all"><Plus className="w-3.5 h-3.5" />Add Item</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                            <th className="px-6 py-3 w-[40%]">Product Name / Stock</th>
                                            <th className="px-4 py-3 text-center">Qty</th>
                                            <th className="px-4 py-3 text-right">Price</th>
                                            <th className="px-4 py-3 text-right">Total</th>
                                            <th className="px-4 py-3 text-center w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {formData.items.map((it, idx) => (
                                            <tr key={idx} className="group hover:bg-slate-50 transition-colors relative">
                                                <td className="px-6 py-4">
                                                    <div className="relative">
                                                        <input type="text" placeholder="Product Name *" value={it.productName} onChange={e => { updateItem(idx, 'productName', e.target.value); setActiveItemIndex(idx); delete (it as any).stockId; }} onFocus={() => setActiveItemIndex(idx)} className="w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm font-semibold focus:bg-white" />
                                                        <AnimatePresence>
                                                            {activeItemIndex === idx && (
                                                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded shadow-xl max-h-48 overflow-y-auto">
                                                                    <div className="p-2 sticky top-0 bg-white"><input type="text" placeholder="Search stock..." value={stockSearch} onChange={e => setStockSearch(e.target.value)} className="w-full px-3 py-1 text-xs bg-slate-50 rounded" /></div>
                                                                    {filteredStocks.map(s => (
                                                                        <div key={s.id} onClick={() => selectStockItem(idx, s)} className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-xs flex justify-between"><span>{s.itemName}</span><span className="text-slate-400 font-bold">Qty: {s.receivedQuantity}</span></div>
                                                                    ))}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4"><input type="number" value={it.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} className="w-20 mx-auto px-2 py-2 bg-slate-50 border-transparent rounded-lg text-sm font-bold text-center focus:bg-white" /></td>
                                                <td className="px-4 py-4"><input type="number" value={it.unitPrice} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))} className="w-32 ml-auto px-2 py-2 bg-slate-50 border-transparent rounded-lg text-sm font-bold text-right focus:bg-white" /></td>
                                                <td className="px-4 py-4 text-right font-bold text-slate-900">{(Number(it.quantity) * Number(it.unitPrice)).toLocaleString()}</td>
                                                <td className="px-4 py-4 text-center"><button onClick={() => removeItem(idx)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-6">
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 sticky top-24">
                            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-primary-600" /><h2 className="text-sm font-bold text-slate-900 uppercase">Summary</h2></div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest"><span>Subtotal</span><span className="text-slate-900">{subtotal.toLocaleString()}</span></div>
                                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest"><span>Global Discount</span>
                                    <div className="flex gap-2">
                                        <select value={formData.discountType} onChange={e => setFormData({ ...formData, discountType: e.target.value as any })} className="text-[10px] bg-slate-50 border-none rounded uppercase">{['FIXED', 'PERCENTAGE'].map(o => <option key={o} value={o}>{o}</option>)}</select>
                                        <input type="number" value={formData.discountValue} onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })} className="w-16 bg-slate-50 border-none rounded text-right text-xs" />
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center"><span className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em]">Grand Total</span><span className="text-2xl font-black text-slate-900 tracking-tight">RWF {grandTotal.toLocaleString()}</span></div>
                            </div>
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payment Terms</label>
                                    <select value={formData.paymentTerms} onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-900">
                                        {['COD', 'NET 30', 'PREPAID'].map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5"><label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Notes</label>
                                    <textarea rows={3} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-900 focus:bg-white transition-all resize-none" placeholder="Notes..." />
                                </div>
                            </div>
                            <button onClick={handleSubmit} disabled={isLoading} className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}{isLoading ? 'Processing...' : (isEdit ? 'Update' : 'Create') + ' Proforma'}
                            </button>
                        </section>
                    </div>
                </div>
            </main>
            {activeItemIndex !== null && <div className="fixed inset-0 z-40" onClick={() => setActiveItemIndex(null)} />}
        </div>
    );
};

export default CreateProformaForm;

import React, { useState, useEffect, useRef } from 'react';
import { 
    Check, 
    Package, 
    Search, 
    ChevronDown, 
    Plus, 
    Trash2, 
    AlertCircle,
    Calendar,
    ArrowLeft,
    TrendingUp,
    Briefcase,
    RefreshCw,
    CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAdminAuth from '../../context/AdminAuthContext';
import supplierService, { type Supplier } from '../../services/supplierService';
import purchaseOrderService, { type CreatePODto, type CreatePOItemDto } from '../../services/purchaseOrderService';
import { motion, AnimatePresence } from 'framer-motion';

const CreatePOForm: React.FC = () => {
    const navigate = useNavigate();
    const { user: adminData } = useAdminAuth();
    const role = adminData?.role || 'admin';

    const token = localStorage.getItem('token') || '';
    const [isLoading, setIsLoading] = useState(false);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isSupplierDropdownOpen, setIsSupplierDropdownOpen] = useState(false);
    const [supplierSearch, setSupplierSearch] = useState('');
    const [isCreatingSupplier, setIsCreatingSupplier] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const [formData, setFormData] = useState<CreatePODto>({
        supplierId: '',
        orderDate: new Date(),
        expectedDeliveryDate: undefined,
        paymentTerms: 'Net 30',
        deliveryTerms: 'FOB Destination',
        notes: '',
        internalNotes: '',
        items: [
            { productName: '', productSku: '', description: '', orderedQty: 1, unit: 'PCS', unitPrice: 0, discountPct: 0, taxPct: 18 }
        ],
        createdByAdminId: adminData?.id
    });

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchSuppliers = async () => {
            try {
                const data = await supplierService.getAllSuppliers();
                setSuppliers(data);
            } catch (error) {
                console.error('Error fetching suppliers:', error);
            }
        };
        fetchSuppliers();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsSupplierDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreateSupplier = async () => {
        if (!supplierSearch.trim()) return;
        setIsCreatingSupplier(true);
        try {
            const newSupplier = await supplierService.createSupplier({ name: supplierSearch.trim() });
            const updated = await supplierService.getAllSuppliers();
            setSuppliers(updated);
            setFormData(prev => ({ ...prev, supplierId: String(newSupplier.id || '') }));
            setIsSupplierDropdownOpen(false);
            setSupplierSearch('');
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to create supplier', 'error');
        } finally {
            setIsCreatingSupplier(false);
        }
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { productName: '', productSku: '', description: '', orderedQty: 1, unit: 'PCS', unitPrice: 0, discountPct: 0, taxPct: 18 }]
        }));
    };

    const removeItem = (index: number) => {
        if (formData.items.length === 1) return;
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const updateItem = (index: number, field: keyof CreatePOItemDto, value: any) => {
        setFormData(prev => {
            const newItems = [...prev.items];
            newItems[index] = { ...newItems[index], [field]: value };
            return { ...prev, items: newItems };
        });
    };

    const calculateTotals = () => {
        let subtotal = 0;
        let taxTotal = 0;

        formData.items.forEach(item => {
            const itemSubtotal = item.orderedQty * item.unitPrice;
            const discount = (itemSubtotal * (item.discountPct || 0)) / 100;
            const taxableAmount = itemSubtotal - discount;
            const tax = (taxableAmount * (item.taxPct || 0)) / 100;

            subtotal += taxableAmount;
            taxTotal += tax;
        });

        return { subtotal, taxTotal, grandTotal: subtotal + taxTotal };
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.supplierId) newErrors.supplierId = 'Supplier is required';
        
        formData.items.forEach((item, index) => {
            if (!item.productName) newErrors[`item_${index}_name`] = 'Required';
            if (item.orderedQty <= 0) newErrors[`item_${index}_qty`] = 'Invalid';
            if (item.unitPrice < 0) newErrors[`item_${index}_price`] = 'Invalid';
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            showToast('Please fix errors in the form', 'error');
            return;
        }

        setIsLoading(true);
        try {
            const userId = (adminData as any)?.id || '';
            const isEmployee = (adminData as any)?.employeeId !== undefined;
            
            const submitData = {
                ...formData,
                [isEmployee ? 'createdByEmployeeId' : 'createdByAdminId']: userId
            };

            await purchaseOrderService.create(submitData, token);
            showToast('Purchase Order created successfully', 'success');
            setTimeout(() => navigate(`/${role}/dashboard/purchase-management`), 1500);
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to create PO', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const { subtotal, taxTotal, grandTotal } = calculateTotals();
    const selectedSupplier = suppliers.find(s => s.id === formData.supplierId);
    const filteredSuppliers = suppliers.filter(s => 
        s.name.toLowerCase().includes(supplierSearch.toLowerCase()) || 
        s.code.toLowerCase().includes(supplierSearch.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${
                            toast.type === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-red-600 border-red-500 text-white'
                        }`}
                    >
                        {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <p className="text-sm font-medium">{toast.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="px-6 py-4 flex items-center justify-between max-w-[1400px] mx-auto">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Create Purchase Order</h1>
                            <p className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em] mt-0.5">Procurement Workflow</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="p-6 max-w-[1400px] mx-auto space-y-6 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Main Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Supplier and Basic Info */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Briefcase className="w-4 h-4 text-primary-600" />
                                <h2 className="text-sm font-bold text-slate-900 uppercase">General Information</h2>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 relative" ref={dropdownRef}>
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Supplier *</label>
                                    <div 
                                        onClick={() => setIsSupplierDropdownOpen(!isSupplierDropdownOpen)}
                                        className={`flex items-center justify-between w-full px-4 py-2.5 bg-slate-50 border rounded-xl cursor-pointer transition-all ${
                                            errors.supplierId ? 'border-red-300 ring-4 ring-red-500/10' : 'border-slate-100'
                                        }`}
                                    >
                                        <span className={`text-sm ${selectedSupplier ? 'text-slate-900 font-semibold' : 'text-slate-400 font-medium'}`}>
                                            {selectedSupplier ? `${selectedSupplier.name} (${selectedSupplier.code})` : 'Select a Supplier'}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isSupplierDropdownOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                    
                                    <AnimatePresence>
                                        {isSupplierDropdownOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute z-40 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden"
                                            >
                                                <div className="p-2 border-b border-slate-100">
                                                    <div className="relative">
                                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                        <input 
                                                            type="text"
                                                            placeholder="Search suppliers..."
                                                            value={supplierSearch}
                                                            onChange={(e) => setSupplierSearch(e.target.value)}
                                                            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border-transparent rounded-xl focus:bg-white transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="max-h-64 overflow-y-auto">
                                                    {filteredSuppliers.map(s => (
                                                        <div 
                                                            key={s.id}
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, supplierId: s.id || '' }));
                                                                setIsSupplierDropdownOpen(false);
                                                            }}
                                                            className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-center justify-between group transition-colors"
                                                        >
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900">{s.name}</p>
                                                                <p className="text-[10px] font-medium text-slate-400">#{s.code}</p>
                                                            </div>
                                                            {formData.supplierId === s.id && <Check className="w-4 h-4 text-emerald-600" />}
                                                        </div>
                                                    ))}
                                                    {filteredSuppliers.length === 0 && (
                                                        <div className="p-8 text-center">
                                                            <p className="text-sm text-slate-400 font-medium italic">No suppliers found</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Expected Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                        <input 
                                            type="date"
                                            value={formData.expectedDeliveryDate ? (formData.expectedDeliveryDate as any).toISOString().split('T')[0] : ''}
                                            onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value ? new Date(e.target.value) : undefined }))}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Line Items */}
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-primary-600" />
                                    <h2 className="text-sm font-bold text-slate-900 uppercase">Order Items</h2>
                                </div>
                                <button 
                                    onClick={addItem}
                                    className="flex items-center gap-2 text-primary-600 font-bold text-[11px] uppercase tracking-wider hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-all"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Item
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                                            <th className="px-6 py-3 w-[40%]">Product Name / Sku</th>
                                            <th className="px-4 py-3 text-center">Unit</th>
                                            <th className="px-4 py-3 text-center">Quantity</th>
                                            <th className="px-4 py-3 text-right">Unit Price</th>
                                            <th className="px-4 py-3 text-right">Total</th>
                                            <th className="px-4 py-3 text-center w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {formData.items.map((item, idx) => (
                                            <tr key={idx} className="group hover:bg-slate-50/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="space-y-2">
                                                        <input 
                                                            type="text"
                                                            placeholder="Product Name *"
                                                            value={item.productName}
                                                            onChange={(e) => updateItem(idx, 'productName', e.target.value)}
                                                            className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm font-semibold focus:bg-white transition-all ${
                                                                errors[`item_${idx}_name`] ? 'border-red-300' : 'border-transparent'
                                                            }`}
                                                        />
                                                        <input 
                                                            type="text"
                                                            placeholder="SKU (Optional)"
                                                            value={item.productSku}
                                                            onChange={(e) => updateItem(idx, 'productSku', e.target.value)}
                                                            className="w-full px-3 py-1 bg-transparent border-b border-slate-100 text-[11px] font-medium text-slate-500 focus:border-primary-400 outline-none transition-all"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <select 
                                                        value={item.unit}
                                                        onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                                                        className="px-2 py-2 bg-slate-50 border-transparent rounded-lg text-xs font-bold text-slate-600 focus:bg-white outline-none cursor-pointer"
                                                    >
                                                        <option value="PCS">PCS</option>
                                                        <option value="KG">KG</option>
                                                        <option value="LITERS">LITERS</option>
                                                        <option value="BOX">BOX</option>
                                                        <option value="PACK">PACK</option>
                                                    </select>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input 
                                                        type="number"
                                                        value={item.orderedQty}
                                                        onChange={(e) => updateItem(idx, 'orderedQty', Number(e.target.value))}
                                                        className="w-20 mx-auto px-2 py-2 bg-slate-50 border-transparent rounded-lg text-sm font-bold text-center focus:bg-white outline-none transition-all"
                                                    />
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input 
                                                        type="number"
                                                        value={item.unitPrice}
                                                        onChange={(e) => updateItem(idx, 'unitPrice', Number(e.target.value))}
                                                        className="w-32 ml-auto px-2 py-2 bg-slate-50 border-transparent rounded-lg text-sm font-bold text-right focus:bg-white outline-none transition-all"
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <span className="text-sm font-bold text-slate-900">
                                                        {(item.orderedQty * item.unitPrice).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <button 
                                                        onClick={() => removeItem(idx)}
                                                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    {/* Right: Summary and Actions */}
                    <div className="space-y-6">
                        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 sticky top-24">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-primary-600" />
                                <h2 className="text-sm font-bold text-slate-900 uppercase">Order Summary</h2>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Subtotal</span>
                                    <span className="text-slate-900">{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    <span>Tax (18%)</span>
                                    <span className="text-slate-900">{taxTotal.toLocaleString()}</span>
                                </div>
                                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em]">Total Amount</span>
                                    <span className="text-2xl font-black text-slate-900 tracking-tight">RWF {grandTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payment Terms</label>
                                    <select 
                                        value={formData.paymentTerms}
                                        onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white transition-all"
                                    >
                                        <option value="Net 30">Net 30</option>
                                        <option value="Net 60">Net 60</option>
                                        <option value="COD">Cash on Delivery</option>
                                        <option value="Prepaid">Prepaid</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Notes</label>
                                    <textarea 
                                        rows={3}
                                        value={formData.notes}
                                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-900 focus:bg-white transition-all resize-none"
                                        placeholder="Add any specific instructions for the supplier..."
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white py-4 rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-primary-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4"
                            >
                                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                {isLoading ? 'Processing...' : 'Create Purchase Order'}
                            </button>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreatePOForm;

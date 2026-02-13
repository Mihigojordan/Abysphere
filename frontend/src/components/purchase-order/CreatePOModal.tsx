import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, X } from 'lucide-react';
import Modal from '../common/Modal';
import SupplierSelector from '../common/SupplierSelector';
import POItemForm, { POItem } from './POItemForm';
import purchaseOrderService, { type CreatePODto } from '../../services/purchaseOrderService';
import useAdminAuth from '../../context/AdminAuthContext';
// import useEmployeeAuth from '../../context/EmployeeAuthContext'; // If needed for employee creation

interface CreatePOModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreatePOModal: React.FC<CreatePOModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { user: adminData } = useAdminAuth();
    const token = localStorage.getItem('token') || '';

    const [step, setStep] = useState(1); // 1: Supplier & Details, 2: Items
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form Data
    const [supplierId, setSupplierId] = useState('');
    const [supplierName, setSupplierName] = useState('');
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
    const [expectedDate, setExpectedDate] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<POItem[]>([]);

    // Item Form Modal
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            // Reset form on open
            setStep(1);
            setSupplierId('');
            setSupplierName('');
            setOrderDate(new Date().toISOString().split('T')[0]);
            setExpectedDate('');
            setNotes('');
            setItems([]);
            setError('');
        }
    }, [isOpen]);

    const handleAddItem = (item: POItem) => {
        if (editingItemIndex !== null) {
            const newItems = [...items];
            newItems[editingItemIndex] = item;
            setItems(newItems);
            setEditingItemIndex(null);
        } else {
            setItems([...items, item]);
        }
        setIsItemModalOpen(false);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + (item.orderedQty * item.unitPrice), 0);
        const taxAmount = items.reduce((sum, item) => {
            const itemSubtotal = item.orderedQty * item.unitPrice;
            const afterDiscount = itemSubtotal - ((itemSubtotal * item.discountPct) / 100);
            return sum + ((afterDiscount * item.taxPct) / 100);
        }, 0);
        const grandTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

        return { subtotal, taxAmount, grandTotal };
    };

    const { subtotal, taxAmount, grandTotal } = calculateTotals();

    const handleSubmit = async () => {
        if (items.length === 0) {
            setError('Please add at least one item');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const payload: CreatePODto = {
                supplierId,
                orderDate: new Date(orderDate),
                expectedDeliveryDate: expectedDate ? new Date(expectedDate) : undefined,
                notes,
                items: items.map(item => ({
                    productName: item.productName,
                    productSku: item.productSku,
                    description: item.description,
                    orderedQty: item.orderedQty,
                    unit: item.unit,
                    unitPrice: item.unitPrice,
                    discountPct: item.discountPct,
                    taxPct: item.taxPct,
                })),
                createdByAdminId: adminData?.id,
            };

            await purchaseOrderService.create(payload, token);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create Purchase Order');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Create Purchase Order"
            size="2xl"
        >
            <div className="space-y-6">
                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center w-full max-w-sm">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                        <div className={`flex-1 h-0.5 mx-2 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                        <X className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {step === 1 ? (
                    <div className="space-y-4">
                        <SupplierSelector
                            value={supplierId}
                            onChange={(id, supplier) => {
                                setSupplierId(id);
                                setSupplierName(supplier.name);
                            }}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Order Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        value={orderDate}
                                        onChange={(e) => setOrderDate(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Expected Delivery</label>
                                <div className="relative">
                                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        value={expectedDate}
                                        onChange={(e) => setExpectedDate(e.target.value)}
                                        min={orderDate}
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                placeholder="Internal notes or terms..."
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                            <div>
                                <span className="text-xs text-gray-500">Supplier:</span>
                                <span className="ml-2 font-medium text-gray-900">{supplierName}</span>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500">Date:</span>
                                <span className="ml-2 font-medium text-gray-900">{orderDate}</span>
                            </div>
                        </div>

                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-500 border-b">
                                    <tr>
                                        <th className="px-4 py-2 font-medium">Item</th>
                                        <th className="px-4 py-2 font-medium text-right">Qty</th>
                                        <th className="px-4 py-2 font-medium text-right">Price</th>
                                        <th className="px-4 py-2 font-medium text-right">Total</th>
                                        <th className="px-4 py-2 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {items.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-4 py-2">
                                                <div className="font-medium text-gray-900">{item.productName}</div>
                                                {item.productSku && <div className="text-xs text-gray-500">{item.productSku}</div>}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                {item.orderedQty} <span className="text-xs text-gray-500">{item.unit}</span>
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(item.unitPrice)}
                                            </td>
                                            <td className="px-4 py-2 text-right font-medium">
                                                {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(item.lineTotal)}
                                            </td>
                                            <td className="px-4 py-2 text-right">
                                                <button
                                                    onClick={() => removeItem(index)}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-400 italic">
                                                No items added yet
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <button
                            onClick={() => {
                                setEditingItemIndex(null);
                                setIsItemModalOpen(true);
                            }}
                            className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add Item
                        </button>

                        {/* Totals */}
                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <div className="w-64 space-y-2">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>{new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Tax Amount</span>
                                    <span>{new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(taxAmount)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100">
                                    <span>Total</span>
                                    <span className="text-primary-600">{new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(grandTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between pt-6 border-t border-gray-100 mt-6">
                    {step === 2 ? (
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Back
                        </button>
                    ) : (
                        <div /> // Spacer
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        {step === 1 ? (
                            <button
                                type="button"
                                onClick={() => {
                                    if (supplierId) setStep(2);
                                    else setError('Please select a supplier');
                                }}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                            >
                                Next: Add Items
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSubmitting || items.length === 0}
                                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Purchase Order'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Item Form Modal (Nested) */}
            <Modal
                isOpen={isItemModalOpen}
                onClose={() => setIsItemModalOpen(false)}
                title={editingItemIndex !== null ? 'Edit Item' : 'Add Item'}
                size="lg"
            >
                <POItemForm
                    onSave={handleAddItem}
                    onCancel={() => setIsItemModalOpen(false)}
                    initialData={editingItemIndex !== null ? items[editingItemIndex] : undefined}
                />
            </Modal>
        </Modal>
    );
};

export default CreatePOModal;

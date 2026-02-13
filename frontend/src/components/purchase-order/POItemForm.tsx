import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface POItem {
    id?: string;
    productName: string;
    productSku: string;
    description: string;
    orderedQty: number;
    unit: string;
    unitPrice: number;
    discountPct: number;
    taxPct: number;
    lineTotal: number;
}

interface POItemFormProps {
    onSave: (item: POItem) => void;
    onCancel: () => void;
    initialData?: POItem;
}

const POItemForm: React.FC<POItemFormProps> = ({ onSave, onCancel, initialData }) => {
    const [formData, setFormData] = useState<POItem>(
        initialData || {
            productName: '',
            productSku: '',
            description: '',
            orderedQty: 1,
            unit: 'PCS',
            unitPrice: 0,
            discountPct: 0,
            taxPct: 0,
            lineTotal: 0,
        }
    );

    const [errors, setErrors] = useState<Partial<Record<keyof POItem, string>>>({});

    const calculateTotal = (data: POItem) => {
        const subtotal = data.orderedQty * data.unitPrice;
        const discountAmount = (subtotal * data.discountPct) / 100;
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = (afterDiscount * data.taxPct) / 100;
        return afterDiscount + taxAmount; // Total including tax
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        let newValue: any = value;

        if (['orderedQty', 'unitPrice', 'discountPct', 'taxPct'].includes(name)) {
            newValue = parseFloat(value) || 0;
        }

        setFormData(prev => {
            const updated = { ...prev, [name]: newValue };
            return { ...updated, lineTotal: calculateTotal(updated) };
        });

        if (errors[name as keyof POItem]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validate = () => {
        const newErrors: any = {};
        if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
        if (formData.orderedQty <= 0) newErrors.orderedQty = 'Quantity must be greater than 0';
        if (formData.unitPrice < 0) newErrors.unitPrice = 'Price cannot be negative';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSave(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Product Name *</label>
                    <input
                        type="text"
                        name="productName"
                        value={formData.productName}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${errors.productName ? 'border-red-300' : 'border-gray-200'}`}
                        placeholder="e.g. Tilapia Feed Type A"
                    />
                    {errors.productName && <p className="mt-1 text-xs text-red-500">{errors.productName}</p>}
                </div>

                <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">SKU / Code</label>
                    <input
                        type="text"
                        name="productSku"
                        value={formData.productSku}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        placeholder="e.g. FD-001"
                    />
                </div>

                <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        placeholder="Additional details..."
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quantity *</label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            name="orderedQty"
                            value={formData.orderedQty}
                            onChange={handleChange}
                            min="0.1"
                            step="0.1"
                            className={`w-2/3 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${errors.orderedQty ? 'border-red-300' : 'border-gray-200'}`}
                        />
                        <select
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            className="w-1/3 px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                        >
                            <option value="PCS">PCS</option>
                            <option value="KG">KG</option>
                            <option value="LITERS">LTR</option>
                            <option value="BOX">BOX</option>
                            <option value="PACK">PACK</option>
                        </select>
                    </div>
                    {errors.orderedQty && <p className="mt-1 text-xs text-red-500">{errors.orderedQty}</p>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Unit Price (RWF) *</label>
                    <input
                        type="number"
                        name="unitPrice"
                        value={formData.unitPrice}
                        onChange={handleChange}
                        min="0"
                        step="100"
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${errors.unitPrice ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {errors.unitPrice && <p className="mt-1 text-xs text-red-500">{errors.unitPrice}</p>}
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Discount (%)</label>
                    <input
                        type="number"
                        name="discountPct"
                        value={formData.discountPct}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Tax (%)</label>
                    <input
                        type="number"
                        name="taxPct"
                        value={formData.taxPct}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg flex justify-between items-center border border-gray-100">
                <span className="text-sm font-medium text-gray-700">Line Total</span>
                <span className="text-lg font-bold text-primary-600">
                    {new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(formData.lineTotal)}
                </span>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                    {initialData ? 'Update Item' : 'Add Item'}
                </button>
            </div>
        </form>
    );
};

export default POItemForm;

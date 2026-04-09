import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, AlertCircle, Calendar, Package, ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import purchaseOrderService from '../../services/purchaseOrderService';
import grnService, { type CreateGRNDto, type CreateGRNItemDto } from '../../services/grnService';
import useAdminAuth from '../../context/AdminAuthContext';

interface GRNItemState extends CreateGRNItemDto {
    originalOrderedQty: number;
    remainingQty: number;
}

const CreateGRNForm: React.FC = () => {
    const navigate = useNavigate();
    const { user: adminData } = useAdminAuth();
    const role = adminData?.role || 'admin';
    const token = localStorage.getItem('token') || '';

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Step 1: PO Selection
    const [poSearchTerm, setPoSearchTerm] = useState('');
    const [availablePOs, setAvailablePOs] = useState<any[]>([]);
    const [selectedPO, setSelectedPO] = useState<any | null>(null);

    // Step 2: Items
    const [grnItems, setGrnItems] = useState<GRNItemState[]>([]);

    // Step 3: Details & Costs
    const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
    const [notes, setNotes] = useState('');
    const [costBreakdown, setCostBreakdown] = useState({
        shippingCost: 0,
        customsDuties: 0,
        insurance: 0,
        handlingCharges: 0,
        otherFees: 0,
    });

    useEffect(() => {
        loadAvailablePOs();
    }, []);

    useEffect(() => {
        if (step !== 1) return;
        const delay = setTimeout(() => loadAvailablePOs(), 500);
        return () => clearTimeout(delay);
    }, [poSearchTerm]);

    const loadAvailablePOs = async () => {
        setIsLoading(true);
        try {
            const response = await purchaseOrderService.getAll({
                search: poSearchTerm,
                limit: 50,
            }, token);
            // Only show POs that can receive goods
            const eligible = (response.data || []).filter((po: any) =>
                ['APPROVED', 'PARTIALLY_RECEIVED'].includes(po.status)
            );
            setAvailablePOs(eligible);
        } catch {
            // silently fail — table will show empty
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPO = async (po: any) => {
        setIsLoading(true);
        setError('');
        try {
            const fullPO = await purchaseOrderService.getOne(po.id, token);
            const initialItems: GRNItemState[] = fullPO.items.map((item: any) => ({
                poItemId: item.id,
                productName: item.productName,
                productSku: item.productSku,
                description: item.description,
                orderedQty: item.orderedQty,
                receivedQty: item.orderedQty,
                acceptedQty: item.orderedQty,
                rejectedQty: 0,
                unit: item.unit,
                unitCost: item.unitPrice,
                originalOrderedQty: item.orderedQty,
                remainingQty: item.orderedQty,
            }));
            setSelectedPO(po);
            setGrnItems(initialItems);
            setStep(2);
        } catch {
            setError('Failed to load PO details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleItemChange = (index: number, field: keyof GRNItemState, value: any) => {
        const newItems = [...grnItems];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === 'receivedQty') {
            const received = Number(value) || 0;
            const rejected = Number(newItems[index].rejectedQty) || 0;
            newItems[index].acceptedQty = Math.max(0, received - rejected);
        }
        if (field === 'rejectedQty') {
            const rejected = Number(value) || 0;
            const received = Number(newItems[index].receivedQty) || 0;
            newItems[index].acceptedQty = Math.max(0, received - rejected);
        }
        setGrnItems(newItems);
    };

    const handleSubmit = async () => {
        if (!selectedPO) return;
        const hasItems = grnItems.some(i => Number(i.receivedQty) > 0);
        if (!hasItems) { setError('Please receive at least one item'); return; }

        setIsSubmitting(true);
        setError('');
        try {
            const payload: CreateGRNDto = {
                purchaseOrderId: selectedPO.id,
                supplierId: selectedPO.supplier.id,
                receivedDate: new Date(receivedDate),
                receivedByAdminId: adminData?.id,
                notes,
                items: grnItems
                    .filter(i => Number(i.receivedQty) > 0)
                    .map(i => ({
                        poItemId: i.poItemId,
                        productName: i.productName,
                        productSku: i.productSku,
                        description: i.description,
                        orderedQty: i.orderedQty,
                        receivedQty: Number(i.receivedQty),
                        acceptedQty: Number(i.acceptedQty),
                        rejectedQty: Number(i.rejectedQty),
                        unit: i.unit,
                        unitCost: Number(i.unitCost),
                        batchNumber: i.batchNumber,
                        expiryDate: i.expiryDate,
                        qualityStatus: Number(i.rejectedQty) > 0 && Number(i.acceptedQty) > 0
                            ? 'CONDITIONALLY_ACCEPTED'
                            : Number(i.rejectedQty) > 0 && Number(i.acceptedQty) === 0
                            ? 'REJECTED'
                            : 'ACCEPTED',
                        qualityNotes: i.qualityNotes,
                        damageNotes: i.damageNotes,
                    })),
                costBreakdown: {
                    shippingCost: Number(costBreakdown.shippingCost),
                    customsDuties: Number(costBreakdown.customsDuties),
                    insurance: Number(costBreakdown.insurance),
                    handlingCharges: Number(costBreakdown.handlingCharges),
                    otherFees: Number(costBreakdown.otherFees),
                },
            };
            await grnService.create(payload, token);
            navigate(`/${role}/dashboard/grn-management`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create GRN');
        } finally {
            setIsSubmitting(false);
        }
    };

    const stepLabels = ['Select PO', 'Verify Items', 'Costs & Notes'];

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* Header */}
            <div className="sticky top-0 bg-white shadow-sm z-10 border-b border-gray-100">
                <div className="mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(`/${role}/dashboard/grn-management`)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h1 className="text-base font-semibold text-gray-900">New Goods Receiving Note</h1>
                            <p className="text-[10px] text-gray-400">
                                {step === 1 ? 'Select approved PO' : step === 2 ? `Receiving from ${selectedPO?.poNumber}` : 'Finalize costs & notes'}
                            </p>
                        </div>
                    </div>
                    {/* Step indicator */}
                    <div className="flex items-center gap-1">
                        {stepLabels.map((label, i) => (
                            <div key={i} className="flex items-center gap-1">
                                <div className={`flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                    {i + 1}
                                </div>
                                <span className={`text-[10px] font-medium hidden sm:block ${step === i + 1 ? 'text-primary-600' : 'text-gray-400'}`}>{label}</span>
                                {i < 2 && <div className={`w-4 h-px mx-1 ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200'}`} />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* Step 1: PO Selection */}
                {step === 1 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold text-gray-900">Select Approved Purchase Order</h2>
                            <button onClick={loadAvailablePOs} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
                                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search PO number or supplier..."
                                value={poSearchTerm}
                                onChange={(e) => setPoSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                autoFocus
                            />
                        </div>
                        <div className="border border-gray-100 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                            {isLoading ? (
                                <div className="p-6 text-center text-sm text-gray-400">
                                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary-600" />
                                    Loading POs...
                                </div>
                            ) : availablePOs.length === 0 ? (
                                <div className="p-6 text-center text-sm text-gray-400">No approved POs found</div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {availablePOs.map((po) => (
                                        <div
                                            key={po.id}
                                            onClick={() => handleSelectPO(po)}
                                            className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between group transition-colors"
                                        >
                                            <div>
                                                <div className="font-medium text-gray-900 text-sm">{po.poNumber}</div>
                                                <div className="text-xs text-gray-500">{po.supplier.name} · {new Date(po.orderDate).toLocaleDateString()}</div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-600 transition-colors" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Items Verification */}
                {step === 2 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 space-y-4">
                        <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-2 text-sm text-blue-700">
                            <Package className="w-4 h-4 flex-shrink-0" />
                            Receiving items for <span className="font-semibold ml-1">{selectedPO?.poNumber}</span>
                            <span className="text-blue-500 ml-1">· {selectedPO?.supplier?.name}</span>
                        </div>

                        <div className="border rounded-lg overflow-hidden overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 text-gray-500 border-b">
                                    <tr>
                                        <th className="px-3 py-2.5 font-medium">Item</th>
                                        <th className="px-3 py-2.5 font-medium text-center">Ordered</th>
                                        <th className="px-3 py-2.5 font-medium w-24">Received</th>
                                        <th className="px-3 py-2.5 font-medium w-24">Rejected</th>
                                        <th className="px-3 py-2.5 font-medium w-24">Accepted</th>
                                        <th className="px-3 py-2.5 font-medium w-36">Batch / Expiry</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {grnItems.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-3 py-2.5">
                                                <div className="font-medium text-gray-900">{item.productName}</div>
                                                {item.productSku && <div className="text-[10px] text-gray-400">{item.productSku}</div>}
                                            </td>
                                            <td className="px-3 py-2.5 text-center text-gray-600">
                                                {item.orderedQty} <span className="text-gray-400">{item.unit}</span>
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <input
                                                    type="number" min="0"
                                                    className="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-500 text-xs"
                                                    value={item.receivedQty}
                                                    onChange={(e) => handleItemChange(index, 'receivedQty', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <input
                                                    type="number" min="0"
                                                    className="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-red-400 text-red-600 text-xs"
                                                    value={item.rejectedQty}
                                                    onChange={(e) => handleItemChange(index, 'rejectedQty', e.target.value)}
                                                />
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <div className="px-2 py-1 bg-green-50 rounded text-center font-semibold text-green-700 text-xs">
                                                    {item.acceptedQty}
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 space-y-1">
                                                <input
                                                    type="text" placeholder="Batch #"
                                                    className="w-full px-2 py-1 border rounded text-[10px]"
                                                    value={item.batchNumber || ''}
                                                    onChange={(e) => handleItemChange(index, 'batchNumber', e.target.value)}
                                                />
                                                <input
                                                    type="date"
                                                    className="w-full px-2 py-1 border rounded text-[10px]"
                                                    value={item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => handleItemChange(index, 'expiryDate', e.target.value ? new Date(e.target.value) : undefined)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-between pt-2">
                            <button
                                onClick={() => { setStep(1); setSelectedPO(null); }}
                                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                            >
                                Next: Costs & Notes
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Costs & Notes */}
                {step === 3 && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Received Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="date"
                                        value={receivedDate}
                                        onChange={(e) => setReceivedDate(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-2">Landed Costs <span className="text-gray-400">(optional)</span></label>
                            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                {[
                                    { key: 'shippingCost', label: 'Shipping Cost' },
                                    { key: 'customsDuties', label: 'Customs / Duties' },
                                    { key: 'insurance', label: 'Insurance' },
                                    { key: 'handlingCharges', label: 'Handling & Other' },
                                ].map(({ key, label }) => (
                                    <div key={key}>
                                        <span className="text-[10px] text-gray-500">{label}</span>
                                        <input
                                            type="number" min="0"
                                            className="w-full mt-1 px-2 py-1.5 text-sm border rounded-lg"
                                            value={costBreakdown[key as keyof typeof costBreakdown]}
                                            onChange={(e) => setCostBreakdown(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                rows={3}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                                placeholder="Delivery notes, condition..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-between pt-2">
                            <button
                                onClick={() => setStep(2)}
                                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                                Create GRN
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateGRNForm;

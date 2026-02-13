import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, AlertCircle, Calendar, Package } from 'lucide-react';
import Modal from '../common/Modal';
import purchaseOrderService from '../../services/purchaseOrderService';
import grnService, { type CreateGRNDto, type CreateGRNItemDto } from '../../services/grnService';
import useAdminAuth from '../../context/AdminAuthContext';

interface CreateGRNModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// Helper types for local state
interface GRNItemState extends CreateGRNItemDto {
    originalOrderedQty: number; // To show reference
    remainingQty: number; // To show reference
}

const CreateGRNModal: React.FC<CreateGRNModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { user: adminData } = useAdminAuth();
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
        if (isOpen && step === 1) {
            loadAvailablePOs();
        } else if (!isOpen) {
            // Reset state on close
            setStep(1);
            setSelectedPO(null);
            setGrnItems([]);
            setPoSearchTerm('');
            setError('');
            setReceivedDate(new Date().toISOString().split('T')[0]);
            setCostBreakdown({
                shippingCost: 0,
                customsDuties: 0,
                insurance: 0,
                handlingCharges: 0,
                otherFees: 0,
            });
        }
    }, [isOpen, step]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (isOpen && step === 1) {
                loadAvailablePOs();
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [poSearchTerm]);

    const loadAvailablePOs = async () => {
        setIsLoading(true);
        try {
            // Fetch APPROVED and PARTIALLY_RECEIVED POs
            // We might need to make two parallel calls or if backend supports 'OR' logic
            // For now, let's fetch APPROVED. 
            // TODO: Ideally backend should allow status=APPROVED,PARTIALLY_RECEIVED
            const response = await purchaseOrderService.getAll({
                status: 'APPROVED',
                search: poSearchTerm,
                limit: 10
            }, token);
            setAvailablePOs(response.data);
        } catch (err) {
            console.error('Failed to load POs', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPO = async (po: any) => {
        setSelectedPO(po);
        // Fetch full PO details to get items
        try {
            setIsLoading(true);
            const fullPO = await purchaseOrderService.getOne(po.id, token);

            // Map PO items to GRN items
            const initialItems: GRNItemState[] = fullPO.items.map((item: any) => ({
                poItemId: item.id,
                productName: item.productName,
                productSku: item.productSku,
                description: item.description,
                orderedQty: item.orderedQty,
                receivedQty: item.orderedQty, // Default to full receive
                acceptedQty: item.orderedQty, // Default to full accept
                rejectedQty: 0,
                unit: item.unit,
                unitCost: item.unitPrice,
                originalOrderedQty: item.orderedQty,
                remainingQty: item.orderedQty, // Ideally calculate based on previous GRNs
            }));

            setGrnItems(initialItems);
            setStep(2);
        } catch (err) {
            setError('Failed to load PO details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleItemChange = (index: number, field: keyof GRNItemState, value: any) => {
        const newItems = [...grnItems];
        newItems[index] = { ...newItems[index], [field]: value };

        // Auto-calculate accepted/rejected if received changes
        if (field === 'receivedQty') {
            const received = Number(value) || 0;
            const rejected = Number(newItems[index].rejectedQty) || 0;
            newItems[index].acceptedQty = Math.max(0, received - rejected);
        }

        // Auto-calculate accepted if rejected changes
        if (field === 'rejectedQty') {
            const rejected = Number(value) || 0;
            const received = Number(newItems[index].receivedQty) || 0;
            newItems[index].acceptedQty = Math.max(0, received - rejected);
        }

        setGrnItems(newItems);
    };

    const handleSubmit = async () => {
        if (!selectedPO) return;

        // Validation
        const hasItems = grnItems.some(i => i.receivedQty > 0);
        if (!hasItems) {
            setError('Please receive at least one item');
            return;
        }

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
                    .filter(i => i.receivedQty > 0)
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
                        qualityStatus: i.rejectedQty > 0 ? 'PARTIAL' : 'ACCEPTED', // Simple logic
                        qualityNotes: i.qualityNotes,
                        damageNotes: i.damageNotes,
                    })),
                costBreakdown: {
                    shippingCost: Number(costBreakdown.shippingCost),
                    customsDuties: Number(costBreakdown.customsDuties),
                    insurance: Number(costBreakdown.insurance),
                    handlingCharges: Number(costBreakdown.handlingCharges),
                    otherFees: Number(costBreakdown.otherFees),
                }
            };

            await grnService.create(payload, token);
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create GRN');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search Approved POs..."
                    value={poSearchTerm}
                    onChange={(e) => setPoSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    autoFocus
                />
            </div>

            <div className="border border-gray-100 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center text-sm text-gray-500">Loading POs...</div>
                ) : availablePOs.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-400">No approved POs found</div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {availablePOs.map((po) => (
                            <div
                                key={po.id}
                                onClick={() => handleSelectPO(po)}
                                className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between group transition-colors"
                            >
                                <div>
                                    <div className="font-medium text-gray-900">{po.poNumber}</div>
                                    <div className="text-xs text-gray-500">{po.supplier.name} • {new Date(po.orderDate).toLocaleDateString()}</div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-600" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg flex items-center gap-3 text-sm text-blue-700">
                <Package className="w-4 h-4" />
                <span>
                    Receiving items for <span className="font-semibold">{selectedPO?.poNumber}</span>
                </span>
            </div>

            <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-500 border-b">
                        <tr>
                            <th className="px-3 py-2 font-medium">Item</th>
                            <th className="px-3 py-2 font-medium text-center">Ordered</th>
                            <th className="px-3 py-2 font-medium w-24">Received</th>
                            <th className="px-3 py-2 font-medium w-24">Rejected</th>
                            <th className="px-3 py-2 font-medium w-24">Accepted</th>
                            <th className="px-3 py-2 font-medium w-32">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {grnItems.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="px-3 py-2">
                                    <div className="font-medium text-gray-900">{item.productName}</div>
                                    <div className="text-[10px] text-gray-400">{item.productSku}</div>
                                </td>
                                <td className="px-3 py-2 text-center text-gray-600">
                                    {item.orderedQty} {item.unit}
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-primary-500"
                                        value={item.receivedQty}
                                        onChange={(e) => handleItemChange(index, 'receivedQty', e.target.value)}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-2 py-1 border rounded focus:ring-1 focus:ring-red-500 text-red-600"
                                        value={item.rejectedQty}
                                        onChange={(e) => handleItemChange(index, 'rejectedQty', e.target.value)}
                                    />
                                </td>
                                <td className="px-3 py-2">
                                    <div className="px-2 py-1 bg-gray-100 rounded text-center font-medium text-green-600">
                                        {item.acceptedQty}
                                    </div>
                                </td>
                                <td className="px-3 py-2 space-y-1">
                                    <input
                                        type="text"
                                        placeholder="Batch #"
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

            <div className="flex justify-end pt-2">
                <button
                    onClick={() => setStep(3)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700"
                >
                    Next: Costs & Notes
                </button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-4">
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Landed Costs (Optional)</label>
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                        <span className="text-[10px] text-gray-500">Shipping Cost</span>
                        <input
                            type="number"
                            min="0"
                            className="w-full mt-1 px-2 py-1.5 text-sm border rounded"
                            value={costBreakdown.shippingCost}
                            onChange={(e) => setCostBreakdown(prev => ({ ...prev, shippingCost: Number(e.target.value) }))}
                        />
                    </div>
                    <div>
                        <span className="text-[10px] text-gray-500">Customs / Duties</span>
                        <input
                            type="number"
                            min="0"
                            className="w-full mt-1 px-2 py-1.5 text-sm border rounded"
                            value={costBreakdown.customsDuties}
                            onChange={(e) => setCostBreakdown(prev => ({ ...prev, customsDuties: Number(e.target.value) }))}
                        />
                    </div>
                    <div>
                        <span className="text-[10px] text-gray-500">Insurance</span>
                        <input
                            type="number"
                            min="0"
                            className="w-full mt-1 px-2 py-1.5 text-sm border rounded"
                            value={costBreakdown.insurance}
                            onChange={(e) => setCostBreakdown(prev => ({ ...prev, insurance: Number(e.target.value) }))}
                        />
                    </div>
                    <div>
                        <span className="text-[10px] text-gray-500">Handling & Other</span>
                        <input
                            type="number"
                            min="0"
                            className="w-full mt-1 px-2 py-1.5 text-sm border rounded"
                            value={costBreakdown.handlingCharges}
                            onChange={(e) => setCostBreakdown(prev => ({ ...prev, handlingCharges: Number(e.target.value) }))}
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    placeholder="Delivery notes, condition..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
            </div>

            <div className="flex justify-between pt-4">
                <button
                    onClick={() => setStep(2)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                    Back
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {isSubmitting ? <span className="animate-spin">...</span> : 'Create GRN'}
                </button>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={step === 1 ? 'New Goods Receiving Note' : step === 2 ? 'Verify Items' : 'Finalize GRN'}
            size={step === 2 ? '2xl' : 'xl'}
        >
            <div className="pb-2">
                {/* Steps Indicator */}
                <div className="flex items-center justify-center mb-6">
                    <div className="flex items-center w-48">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                        <div className={`flex-1 h-0.5 mx-1 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                        <div className={`flex-1 h-0.5 mx-1 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`} />
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2 mb-4">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
            </div>
        </Modal>
    );
};

export default CreateGRNModal;

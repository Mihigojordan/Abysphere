import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    RefreshCw,
    PackageCheck,
    CheckCircle,
    XCircle,
    AlertCircle,
    Calendar,
    FileText,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import grnService from '../../services/grnService';
import stockService from '../../services/stockService';
import useAdminAuth from '../../context/AdminAuthContext';

const GRNView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: adminData } = useAdminAuth();
    const role = adminData?.role || 'admin';
    const token = localStorage.getItem('token') || '';

    const [grn, setGrn] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const loadGRN = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await grnService.getOne(id, token);
            setGrn(data);
        } catch {
            // handled by empty state
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadGRN(); }, [id]);

    const handleApprove = async () => {
        const res = await Swal.fire({
            title: 'Approve GRN?',
            text: 'This will add accepted items directly into stock.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Approve & Add to Stock',
        });
        if (!res.isConfirmed || !grn) return;

        try {
            // 1. Approve the GRN (updates GRN status → APPROVED)
            await grnService.approve(grn.id, adminData?.id || '', true, token);

            // 2. Set inspectionStatus → APPROVED (approve call doesn't do this)
            await grnService.updateInspection(grn.id, 'APPROVED', 'Approved with GRN', undefined, token);

            // 3. Create a Stock record for every accepted item so it appears in StockInManagement
            const acceptedItems = (grn.items || []).filter(
                (item: any) => (item.acceptedQty ?? 0) > 0 && item.qualityStatus !== 'REJECTED'
            );

            await Promise.allSettled(
                acceptedItems.map((item: any) =>
                    stockService.createStock({
                        sku: item.productSku || `GRN-${grn.grnNumber}-${item.productName.slice(0, 4).toUpperCase()}`,
                        itemName: item.productName,
                        categoryId: item.categoryId || '',
                        supplier: grn.supplier?.name || '',
                        unitOfMeasure: item.unit || 'pcs',
                        receivedQuantity: item.acceptedQty,
                        unitCost: item.unitCost || 0,
                        totalValue: item.acceptedQty * (item.unitCost || 0),
                        warehouseLocation: item.locationId || 'Warehouse',
                        receivedDate: new Date(grn.receivedDate || Date.now()),
                        reorderLevel: 0,
                        expiryDate: item.expiryDate || undefined,
                        adminId: adminData?.id || '',
                    })
                )
            );

            loadGRN();
            Swal.fire({ icon: 'success', title: 'Approved — Items added to stock', timer: 2000, showConfirmButton: false });
        } catch (e: any) {
            Swal.fire('Error', e.response?.data?.message || 'Failed to approve GRN', 'error');
        }
    };

    const handleReject = async () => {
        const { value: reason } = await Swal.fire({ title: 'Reject GRN', input: 'text', inputLabel: 'Reason for rejection', showCancelButton: true });
        if (!reason || !grn) return;
        try {
            await grnService.reject(grn.id, reason, token);
            loadGRN();
            Swal.fire({ icon: 'success', title: 'Rejected', timer: 1500, showConfirmButton: false });
        } catch (e: any) {
            Swal.fire('Error', e.response?.data?.message || 'Failed to reject', 'error');
        }
    };

    const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const formatCurrency = (n?: number) => `RWF ${Number(n || 0).toLocaleString()}`;

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'APPROVED': return 'bg-green-100 text-green-700';
            case 'REJECTED': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const totalLanded = grn ? (
        Number(grn.shippingCost || 0) +
        Number(grn.customsDuties || 0) +
        Number(grn.insurance || 0) +
        Number(grn.handlingCharges || 0) +
        Number(grn.otherFees || 0)
    ) : 0;

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* Header */}
            <div className="sticky top-0 bg-white shadow-sm z-10 border-b border-gray-100">
                <div className="mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(`/${role}/dashboard/grn-management`)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div className="p-1.5 bg-primary-600 rounded-lg">
                            <PackageCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-base font-semibold text-gray-900">
                                {grn ? grn.grnNumber : 'GRN Details'}
                            </h1>
                            <p className="text-[10px] text-gray-400">Goods Receiving Note</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={loadGRN} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        {grn?.status === 'PENDING' && (
                            <>
                                <button
                                    onClick={handleApprove}
                                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                                >
                                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
                                >
                                    <XCircle className="w-3.5 h-3.5" /> Reject
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <RefreshCw className="w-7 h-7 animate-spin text-primary-600 mb-3" />
                    <p className="text-xs font-medium uppercase tracking-widest">Loading...</p>
                </div>
            ) : !grn ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <AlertCircle className="w-8 h-8 mb-3 opacity-30" />
                    <p className="text-sm">GRN not found</p>
                </div>
            ) : (
                <div className="mx-auto px-4 py-5 space-y-4 max-w-4xl">
                    {/* Header Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-1">GRN Number</p>
                            <p className="font-bold text-gray-900">{grn.grnNumber}</p>
                            <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(grn.status)}`}>{grn.status}</span>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-1">Purchase Order</p>
                            <div className="flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5 text-gray-400" />
                                <p className="font-medium text-gray-900">{grn.purchaseOrder?.poNumber}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{grn.supplier?.name}</p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium mb-1">Received Date</p>
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                <p className="font-medium text-gray-900">{formatDate(grn.receivedDate)}</p>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">
                                Inspection: <span className={`font-medium ${grn.inspectionStatus === 'APPROVED' ? 'text-green-600' : 'text-orange-500'}`}>{grn.inspectionStatus}</span>
                            </p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-50">
                            <h2 className="text-sm font-semibold text-gray-900">Items Received</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b">
                                    <tr>
                                        <th className="px-4 py-2.5 font-medium">Product</th>
                                        <th className="px-4 py-2.5 font-medium text-center">Ordered</th>
                                        <th className="px-4 py-2.5 font-medium text-center">Received</th>
                                        <th className="px-4 py-2.5 font-medium text-center">Accepted</th>
                                        <th className="px-4 py-2.5 font-medium text-center">Rejected</th>
                                        <th className="px-4 py-2.5 font-medium">Batch / Expiry</th>
                                        <th className="px-4 py-2.5 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {(grn.items || []).map((item: any, i: number) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">{item.productName}</div>
                                                {item.productSku && <div className="text-[10px] text-gray-400">{item.productSku}</div>}
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-600">{item.orderedQty} <span className="text-gray-400">{item.unit}</span></td>
                                            <td className="px-4 py-3 text-center font-medium text-gray-900">{item.receivedQty}</td>
                                            <td className="px-4 py-3 text-center font-medium text-green-700">{item.acceptedQty}</td>
                                            <td className="px-4 py-3 text-center font-medium text-red-600">{item.rejectedQty || 0}</td>
                                            <td className="px-4 py-3">
                                                {item.batchNumber && <div className="text-gray-700">{item.batchNumber}</div>}
                                                {item.expiryDate && <div className="text-[10px] text-gray-400">{formatDate(item.expiryDate)}</div>}
                                                {!item.batchNumber && !item.expiryDate && <span className="text-gray-300">—</span>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${item.qualityStatus === 'ACCEPTED' ? 'bg-green-100 text-green-700' : item.qualityStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {item.qualityStatus || 'ACCEPTED'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Costs & Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                            <h2 className="text-sm font-semibold text-gray-900 mb-3">Landed Costs</h2>
                            <div className="space-y-2 text-xs">
                                {[
                                    { label: 'Shipping Cost', val: grn.shippingCost },
                                    { label: 'Customs / Duties', val: grn.customsDuties },
                                    { label: 'Insurance', val: grn.insurance },
                                    { label: 'Handling Charges', val: grn.handlingCharges },
                                    { label: 'Other Fees', val: grn.otherFees },
                                ].map(({ label, val }) => (
                                    <div key={label} className="flex justify-between text-gray-600">
                                        <span>{label}</span>
                                        <span className="font-medium">{formatCurrency(val)}</span>
                                    </div>
                                ))}
                                <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-gray-900">
                                    <span>Total Landed</span>
                                    <span>{formatCurrency(totalLanded)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
                            <h2 className="text-sm font-semibold text-gray-900 mb-3">Notes</h2>
                            <p className="text-xs text-gray-600 whitespace-pre-wrap">{grn.notes || '—'}</p>
                            {grn.hasDiscrepancies && (
                                <div className="mt-3 flex items-center gap-2 text-amber-600 text-xs">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    This GRN has discrepancies
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GRNView;

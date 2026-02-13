/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    AlertCircle,
    FileText,
    Send,
    Package,
} from 'lucide-react';
import { motion } from 'framer-motion';
import purchaseOrderService from '../../services/purchaseOrderService';
import useAdminAuth from '../../context/AdminAuthContext';
import CreatePOModal from '../../components/purchase-order/CreatePOModal';

interface PurchaseOrder {
    id: string;
    poNumber: string;
    status: string;
    orderDate: string;
    expectedDeliveryDate?: string;
    supplier: {
        id: string;
        name: string;
        code: string;
    };
    subtotal: number;
    taxAmount: number;
    grandTotal: number;
    _count?: {
        items: number;
        grns: number;
    };
}

const PurchaseOrderDashboard: React.FC = () => {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { user: adminData } = useAdminAuth();
    const token = localStorage.getItem('token') || '';

    const stats = {
        draft: orders.filter(o => o.status === 'DRAFT').length,
        pending: orders.filter(o => o.status === 'PENDING_APPROVAL').length,
        approved: orders.filter(o => o.status === 'APPROVED').length,
        total: orders.length,
    };

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const response = await purchaseOrderService.getAll(
                {
                    search: searchTerm || undefined,
                    status: statusFilter !== 'ALL' ? statusFilter : undefined,
                    page: currentPage,
                    limit: itemsPerPage,
                },
                token
            );
            setOrders(response.data);
            setFilteredOrders(response.data);
            setTotalPages(response.meta.totalPages);
        } catch (error) {
            console.error('Error loading POs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (token) loadOrders();
    }, [token, searchTerm, statusFilter, currentPage]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return 'bg-gray-100 text-gray-700';
            case 'PENDING_APPROVAL':
                return 'bg-yellow-100 text-yellow-700';
            case 'APPROVED':
                return 'bg-green-100 text-green-700';
            case 'PARTIALLY_RECEIVED':
                return 'bg-blue-100 text-blue-700';
            case 'RECEIVED':
                return 'bg-purple-100 text-purple-700';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <CreatePOModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={loadOrders}
            />
            {/* Header */}
            <div className="sticky top-0 bg-white shadow-sm z-10 border-b border-gray-100">
                <div className="mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-primary-600 rounded-lg">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">
                                    Purchase Orders
                                </h1>
                                <p className="text-[10px] text-gray-500">
                                    Manage purchase orders and approvals
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg font-medium text-xs shadow-sm transition-all"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                New PO
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto px-4 py-4 space-y-4">
                {/* Statistics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { title: 'Draft', value: stats.draft, icon: FileText, color: 'gray' },
                        { title: 'Pending', value: stats.pending, icon: AlertCircle, color: 'yellow' },
                        { title: 'Approved', value: stats.approved, icon: CheckCircle, color: 'green' },
                        { title: 'Total POs', value: stats.total, icon: Package, color: 'primary' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded shadow-sm border border-gray-100 p-3"
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 bg-${stat.color}-50 rounded-full`}>
                                    <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">
                                        {stat.title}
                                    </p>
                                    <p className="text-base font-bold text-gray-900">{stat.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Filters & Search */}
                <div className="bg-white rounded shadow-sm border border-gray-100 p-2 px-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search PO number, supplier..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-4 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            >
                                <option value="ALL">All Status</option>
                                <option value="DRAFT">Draft</option>
                                <option value="PENDING_APPROVAL">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="PARTIALLY_RECEIVED">Partially Received</option>
                                <option value="RECEIVED">Received</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-[11px] text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-medium">
                                <tr>
                                    <th className="px-4 py-2.5">PO Number</th>
                                    <th className="px-4 py-2.5">Supplier</th>
                                    <th className="px-4 py-2.5">Date</th>
                                    <th className="px-4 py-2.5">Items</th>
                                    <th className="px-4 py-2.5">Total</th>
                                    <th className="px-4 py-2.5">Status</th>
                                    <th className="px-4 py-2.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredOrders.map((po) => (
                                    <tr key={po.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-2.5">
                                            <div className="font-semibold text-gray-900">{po.poNumber}</div>
                                            <div className="text-[10px] text-gray-400">
                                                ID: {po.id.substring(0, 8)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="font-medium text-gray-900">{po.supplier.name}</div>
                                            <div className="text-[10px] text-gray-400">{po.supplier.code}</div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="text-gray-600">{formatDate(po.orderDate)}</div>
                                            {po.expectedDeliveryDate && (
                                                <div className="text-[10px] text-gray-400">
                                                    Due: {formatDate(po.expectedDeliveryDate)}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="text-gray-600">{po._count?.items || 0} items</div>
                                            {(po._count?.grns || 0) > 0 && (
                                                <div className="text-[10px] text-green-600">
                                                    {po._count?.grns} GRN(s)
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <div className="font-semibold text-gray-900">
                                                {formatCurrency(po.grandTotal)}
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                +{formatCurrency(po.taxAmount)} tax
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5">
                                            <span
                                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                                                    po.status
                                                )}`}
                                            >
                                                {po.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => {
                                                        /* View details */
                                                    }}
                                                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                                                    title="View"
                                                >
                                                    <FileText className="w-3.5 h-3.5" />
                                                </button>
                                                {po.status === 'DRAFT' && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                /* Edit */
                                                            }}
                                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                /* Submit for approval */
                                                            }}
                                                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                                            title="Submit"
                                                        >
                                                            <Send className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                /* Delete */
                                                            }}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredOrders.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan={7} className="py-10 text-center text-gray-400 italic">
                                            No purchase orders found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between bg-white px-4 py-3 border-t rounded-b-lg shadow">
                        <div className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 text-sm border rounded disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1.5 text-sm rounded ${currentPage === pageNum
                                            ? 'bg-primary-600 text-white'
                                            : 'border'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 text-sm border rounded disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PurchaseOrderDashboard;

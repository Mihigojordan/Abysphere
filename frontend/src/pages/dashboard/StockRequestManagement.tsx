/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Download,
    LayoutGrid,
    List,
    Filter,
    RefreshCw,
    Eye,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    X,
    CheckCircle,
    XCircle,
    AlertCircle,
    Package,
    Truck,
    CheckSquare,
    Clock,
    AlertTriangle,
    Edit,
    Check,
    Upload,
    UserCheck,
    Archive,
    Calendar
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';
import requestService, {
    type Request,
    type CreateRequestInput,
    type UpdateRequestInput,
    type ApproveRequestInput,
    type IssueMaterialsInput,
    type ReceiveMaterialsInput
} from '../../services/stockRequestService';
import stockService, { type StockIn } from '../../services/stockInService';
import AddRequestModal from '../../components/dashboard/StockRequest/AddRequestModal';
import EditRequestModal from '../../components/dashboard/StockRequest/EditRequestModal';
import IssueMaterialsModal from '../../components/dashboard/StockRequest/IssueMaterialsModal';
import ReceiveMaterialsModal from '../../components/dashboard/StockRequest/ReceiveMaterialsModal';
import RejectRequestModal from '../../components/dashboard/StockRequest/RejectRequestModal';
import { useSocketEvent } from '../../context/SocketContext';

interface OperationStatus {
    type: 'success' | 'error' | 'info';
    message: string;
}

type ViewMode = 'table' | 'grid' | 'list';

interface RequestItem {
    id: string;
    stock_in_id?: string;
    qtyRequested: number;
    qtyApproved?: number;
    qtyIssued?: number;
    qtyRemaining?: number;
    qtyReceived?: number;
    stockIn?: StockIn;
}

interface Request {
    id: string;
    ref_no: string;
    siteId: string;
    site?: { name: string };
    requestedByAdminId?: string;
    requestedByAdmin?: { adminName: string; adminEmail: string; phone: string; status: string };
    requestedByEmployeeId?: string;
    requestedByEmployee?: { first_name: string; last_name: string; email: string; phone: string; position: string; status: string };
    status: string;
    notes?: string;
    requestItems: RequestItem[];
    createdAt?: string;
    updatedAt?: string;
    receivedAt?: string;
    issuedAt?: string;
    closedAt?: string;
}

interface ApproveRequestResponse {
    success: boolean;
    data: { request: Request };
    message?: string;
}

const StockRequestManagement = ({ role }: { role: 'admin' | 'employee' }) => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [allRequests, setAllRequests] = useState<Request[]>([]);
    const [stockins, setStockins] = useState<StockIn[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');
    const [sortBy, setSortBy] = useState<keyof Request>('siteId');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [itemsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
    const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
    const [operationLoading, setOperationLoading] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const navigate = useNavigate();

    // WebSocket event handlers
    useSocketEvent('requestCreated', (requestData: Request) => {
        setAllRequests((prevRequests) => {
            const exists = prevRequests.some((req) => req.id === requestData.id);
            if (!exists) {
                return [requestData, ...prevRequests];
            }
            return prevRequests;
        });
    });

    useSocketEvent('requestUpdated', (requestData: Request) => {
        setAllRequests((prevRequests) =>
            prevRequests.map((r) => (r.id === requestData.id ? requestData : r))
        );
    });

    useSocketEvent('requestApproved', (requestData: Request) => {
        setAllRequests((prevRequests) =>
            prevRequests.map((r) => (r.id === requestData.id ? requestData : r))
        );
    });

    useSocketEvent('requestRejected', (requestData: Request) => {
        setAllRequests((prevRequests) =>
            prevRequests.map((r) => (r.id === requestData.id ? requestData : r))
        );
    });

    useSocketEvent('materialsIssued', (requestData: Request) => {
        setAllRequests((prevRequests) =>
            prevRequests.map((r) => (r.id === requestData.id ? requestData : r))
        );
    });

    useSocketEvent('materialsReceived', (requestData: Request) => {
        setAllRequests((prevRequests) =>
            prevRequests.map((r) => (r.id === requestData.id ? requestData : r))
        );
    });

    useSocketEvent('requestClosed', (requestData: Request) => {
        setAllRequests((prevRequests) =>
            prevRequests.map((r) => (r.id === requestData.id ? requestData : r))
        );
    });

    useEffect(() => {
        const fetchRequestsAndStockIns = async () => {
            try {
                setLoading(true);
                const [requestResponse, stockInResponse] = await Promise.all([
                    requestService.getAllRequests(),
                    stockService.getAllStockIns()
                ]);
                const requests = Array.isArray(requestResponse.data.requests) ? requestResponse.data.requests : [];
                setAllRequests(requests);
                setStockins(stockInResponse || []);
                setError(null);
            } catch (err: any) {
                const errorMessage = err.message || "Failed to load requests or stock items";
                setError(errorMessage);
                showOperationStatus("error", errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchRequestsAndStockIns();
    }, []);

    useEffect(() => {
        handleFilterAndSort();
    }, [searchTerm, statusFilter, dateFrom, dateTo, sortBy, sortOrder, allRequests]);

    const showOperationStatus = (type: OperationStatus['type'], message: string, duration: number = 3000) => {
        setOperationStatus({ type, message });
        setTimeout(() => setOperationStatus(null), duration);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getRequestedBy = (request: Request) => {
        if (request?.requestedByAdminId && request.requestedByAdmin) {
            return {
                full_name: request.requestedByAdmin.adminName || 'N/A',
                email: request.requestedByAdmin.adminEmail || 'N/A',
                phone: request.requestedByAdmin.phone || 'N/A',
                role: { name: 'ADMIN' },
                active: request.requestedByAdmin.status === 'ACTIVE'
            };
        } else if (request?.requestedByEmployeeId && request.requestedByEmployee) {
            return {
                full_name: `${request.requestedByEmployee.first_name} ${request.requestedByEmployee.last_name}`,
                email: request.requestedByEmployee.email,
                phone: request.requestedByEmployee.phone,
                role: { name: request.requestedByEmployee.position },
                active: request.requestedByEmployee.status === 'ACTIVE'
            };
        }
        return { full_name: 'N/A', email: 'N/A', phone: 'N/A', role: { name: 'N/A' }, active: false };
    };

    const handleFilterAndSort = () => {
        let filtered = [...allRequests];

        if (searchTerm.trim()) {
            filtered = filtered.filter(
                (request) =>
                    request.site?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    request.ref_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    request.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    request.id.includes(searchTerm) ||
                    getRequestedBy(request).full_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((request) => request.status === statusFilter);
        }

        if (dateFrom || dateTo) {
            filtered = filtered.filter((request) => {
                const createdAt = new Date(request.createdAt || 0).getTime();
                const from = dateFrom ? new Date(dateFrom).setHours(0, 0, 0, 0) : -Infinity;
                const to = dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : Infinity;
                return createdAt >= from && createdAt <= to;
            });
        }

        filtered.sort((a, b) => {
            let aValue: any = a[sortBy] ?? '';
            let bValue: any = b[sortBy] ?? '';

            if (sortBy === 'siteId') {
                aValue = a.site?.name ?? '';
                bValue = b.site?.name ?? '';
            } else if (sortBy === 'createdAt') {
                aValue = new Date(a.createdAt).getTime();
                bValue = new Date(b.createdAt).getTime();
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }

            const strA = aValue?.toString()?.toLowerCase();
            const strB = bValue?.toString()?.toLowerCase();
            return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
        });

        setRequests(filtered);
        setCurrentPage(1);
    };

    const handleClearDates = () => {
        setDateFrom('');
        setDateTo('');
    };

    const handleExportPDF = async () => {
        try {
            setOperationLoading(true);
            const date = new Date().toLocaleDateString('en-CA')?.replace(/\//g, '');
            const filename = `stock_requests_export_${date}.pdf`;

            const tableRows = requests.map((request, index) => {
                const totalQuantity = request.requestItems?.reduce((sum, item) => sum + item.qtyRequested, 0) || 0;
                return `
                    <tr style="${index % 2 === 0 ? 'background-color: #f9fafb;' : ''}">
                        <td style="font-size:10px;">${index + 1}</td>
                        <td style="font-size:10px;">${request.ref_no}</td>
                        <td style="font-size:10px;">${request.site?.name || 'N/A'}</td>
                        <td style="font-size:10px;">${getRequestedBy(request).full_name}</td>
                        <td style="font-size:10px;">${totalQuantity}</td>
                        <td style="font-size:10px; color: ${getStatusColor(request.status)};">
                            ${request.status}
                        </td>
                        <td style="font-size:10px;">${formatDate(request.createdAt || '')}</td>
                    </tr>
                `;
            }).join('');

            const htmlContent = `
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 10px; font-size: 10px; }
                        h1 { font-size: 14px; margin-bottom: 5px; }
                        p { font-size: 9px; margin-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; font-size: 10px; }
                        th, td { border: 1px solid #ddd; padding: 4px; text-align: left; vertical-align: middle; }
                        th { background-color: #2563eb; color: white; font-weight: bold; font-size: 10px; }
                    </style>
                </head>
                <body>
                    <h1>Stock Request List</h1>
                    <p>Exported on: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' })}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Ref No</th>
                                <th>Site</th>
                                <th>Requested By</th>
                                <th>Quantity</th>
                                <th>Status</th>
                                <th>Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </body>
                </html>
            `;

            const opt = {
                margin: 0.5,
                filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
            };

            await html2pdf().from(htmlContent).set(opt).save();
            showOperationStatus('success', 'PDF exported successfully');
        } catch (err: any) {
            console.error('Error generating PDF:', err);
            showOperationStatus('error', 'Failed to export PDF');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleAddRequest = () => {
        setSelectedRequest(null);
        setIsAddModalOpen(true);
    };

    const handleEditRequest = (request: Request) => {
        setSelectedRequest(request);
        setIsEditModalOpen(true);
    };

    const handleApproveRequest = (request: Request) => {
        setSelectedRequest(request);
        setIsApproveModalOpen(true);
    };

    const handleRejectRequest = (request: Request) => {
        setSelectedRequest(request);
        setIsRejectModalOpen(true);
    };

    const handleIssueMaterials = (request: Request) => {
        setSelectedRequest(request);
        setIsIssueModalOpen(true);
    };

    const handleReceiveMaterials = (request: Request) => {
        setSelectedRequest(request);
        setIsReceiveModalOpen(true);
    };

    const handleViewRequest = (request: Request) => {
        navigate(request.id);
    };

    const handleDeleteRequest = (request: Request) => {
        setSelectedRequest(request);
        setIsDeleteModalOpen(true);
    };

    const handleApproveSuccess = (response: ApproveRequestResponse) => {
        const updatedRequest = response.data.request;
        setAllRequests((prevRequests) =>
            prevRequests.map((r) =>
                r.id === updatedRequest.id ? updatedRequest : r
            )
        );
        showOperationStatus('success', response.message || `Request #${updatedRequest.ref_no} approved successfully`);
        setIsApproveModalOpen(false);
        setSelectedRequest(null);
    };

    const handleRejectSuccess = (updatedRequest: Request) => {
        setAllRequests((prevRequests) =>
            prevRequests.map((r) => (r.id === updatedRequest.id ? updatedRequest : r))
        );
        showOperationStatus('success', `Request #${updatedRequest.ref_no} rejected successfully`);
        setIsRejectModalOpen(false);
        setSelectedRequest(null);
    };

    const handleIssueSuccess = (updatedRequest: Request) => {
        setAllRequests((prevRequests) =>
            prevRequests.map((r) => (r.id === updatedRequest.id ? updatedRequest : r))
        );
        showOperationStatus('success', `Materials for request #${updatedRequest.ref_no} issued successfully`);
        setIsIssueModalOpen(false);
        setSelectedRequest(null);
    };

    const handleReceiveSuccess = (updatedRequest: Request) => {
        setAllRequests((prevRequests) =>
            prevRequests.map((r) => (r.id === updatedRequest.id ? updatedRequest : r))
        );
        showOperationStatus('success', `Materials for request #${updatedRequest.ref_no} received successfully`);
        setIsReceiveModalOpen(false);
        setSelectedRequest(null);
    };

    const handleSaveRequest = async (data: CreateRequestInput | UpdateRequestInput) => {
        try {
            setOperationLoading(true);
            if (isAddModalOpen) {
                const newRequest = await requestService.createRequest(data as CreateRequestInput);
                if (!newRequest) {
                    throw new Error('No request data returned from createRequest');
                }
                setAllRequests((prevRequests: any) => {
                    const exists = prevRequests.some((req: any) => req.id === newRequest.id);
                    if (!exists) {
                        return [newRequest, ...prevRequests];
                    }
                    return prevRequests;
                });
                showOperationStatus('success', `Request #${newRequest.ref_no} created successfully`);
                setIsAddModalOpen(false);
            } else {
                if (!selectedRequest) {
                    throw new Error('No request selected for update');
                }
                const updatedRequest = await requestService.updateRequest(
                    selectedRequest.id,
                    data as UpdateRequestInput
                );
                setAllRequests((prevRequests) =>
                    prevRequests.map((r) => (r.id === updatedRequest.id ? updatedRequest : r))
                );
                showOperationStatus('success', `Request #${updatedRequest.ref_no} updated successfully`);
                setIsEditModalOpen(false);
            }
        } catch (err: any) {
            console.error('Error in handleSaveRequest:', err);
            showOperationStatus('error', err.message || 'Failed to save request');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleDelete = async (request: Request) => {
        try {
            setOperationLoading(true);
            await requestService.deleteRequest(request.id);
            setAllRequests((prevRequests) => prevRequests.filter((r) => r.id !== request.id));
            showOperationStatus('success', `Request #${request.ref_no} deleted successfully`);
        } catch (err: any) {
            console.error('Error deleting request:', err);
            showOperationStatus('error', err.message || 'Failed to delete request');
        } finally {
            setOperationLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedRequest(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return '#F59E0B';
            case 'APPROVED': return '#10B981';
            case 'PARTIALLY_ISSUED': return '#EAB308';
            case 'ISSUED': return '#2563EB';
            case 'REJECTED': return '#EF4444';
            case 'CLOSED': return '#6B7280';
            default: return '#6B7280';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-3 h-3" />;
            case 'APPROVED': return <CheckCircle className="w-3 h-3" />;
            case 'PARTIALLY_ISSUED': return <AlertTriangle className="w-3 h-3" />;
            case 'ISSUED': return <Truck className="w-3 h-3" />;
            case 'REJECTED': return <XCircle className="w-3 h-3" />;
            case 'CLOSED': return <Archive className="w-3 h-3" />;
            default: return <Package className="w-3 h-3" />;
        }
    };

    const renderActionButtonBasedOnRole = (role: 'admin' | 'employee', request: Request) => {
        const status = request?.status;

        if (['REJECTED', 'CLOSED'].includes(status)) {
            return null;
        }

        const actionButtons = [];

        if ((role === 'employee' && status === 'PENDING') || (role === 'admin' && status === 'APPROVED')) {
            actionButtons.push(
                <button
                    key="edit"
                    onClick={() => handleEditRequest(request)}
                    disabled={operationLoading}
                    className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors disabled:opacity-50"
                    title="Edit Request"
                >
                    <Pencil className="w-4 h-4" />
                </button>
            );
        }

        if (role === 'employee' && ['ISSUED', 'PARTIALLY_ISSUED'].includes(status)) {
            actionButtons.push(
                <button
                    key="receive"
                    onClick={() => handleReceiveMaterials(request)}
                    disabled={operationLoading}
                    className="text-gray-400 hover:text-green-600 p-1.5 rounded-full hover:bg-green-50 transition-colors disabled:opacity-50"
                    title="Receive Materials"
                >
                    <CheckSquare className="w-4 h-4" />
                </button>
            );
        }

        if (role === 'admin') {
            if (status === 'PENDING') {
                actionButtons.push(
                    <div key="approve-reject" className="flex items-center space-x-1">
                        <button
                            key="issue"
                            onClick={() => handleIssueMaterials(request)}
                            disabled={operationLoading}
                            className="text-gray-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition-colors disabled:opacity-50"
                            title="Issue Materials"
                        >
                            <Truck className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleRejectRequest(request)}
                            disabled={operationLoading}
                            className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Reject Request"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    </div>
                );
            }
            if (status === 'APPROVED' || status == 'RECEIVED') {
                actionButtons.push(
                    <button
                        key="issue"
                        onClick={() => handleIssueMaterials(request)}
                        disabled={operationLoading}
                        className="text-gray-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition-colors disabled:opacity-50"
                        title="Issue Materials"
                    >
                        <Truck className="w-4 h-4" />
                    </button>
                );
            }
        }

        return actionButtons.length > 0 ? (
            <div className="flex items-center space-x-1">{actionButtons}</div>
        ) : null;
    };

    const totalPages = Math.ceil(requests.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentRequests = requests.slice(startIndex, endIndex);

    const totalRequests = allRequests.length;
    const closedRequests = allRequests.filter((r) => r.status === 'CLOSED').length;
    const pendingRequests = allRequests.filter((r) => r.status === 'PENDING').length;
    const approvedRequests = allRequests.filter((r) => r.status === 'APPROVED').length;

    const renderTableView = () => (
        <div className="bg-white rounded border border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
                            <th
                                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                    setSortBy('siteId');
                                    setSortOrder(sortBy === 'siteId' && sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Site</span>
                                    <ChevronDown className={`w-3 h-3 ${sortBy === 'siteId' ? 'text-primary-600' : 'text-gray-400'}`} />
                                </div>
                            </th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium">Requested By</th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium">Items</th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium">Status</th>
                            <th
                                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                    setSortBy('createdAt');
                                    setSortOrder(sortBy === 'createdAt' && sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Created At</span>
                                    <ChevronDown className={`w-3 h-3 ${sortBy === 'createdAt' ? 'text-primary-600' : 'text-gray-400'}`} />
                                </div>
                            </th>
                            <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentRequests.map((request, index) => (
                            <tr
                                key={request.id}
                                className={`hover:bg-gray-25 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                            >
                                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                                <td className="py-2 px-2 text-gray-700">{request.site?.name || 'N/A'}</td>
                                <td className="py-2 px-2 text-gray-700">{getRequestedBy(request).full_name}</td>
                                <td className="py-2 px-2 text-gray-700">{`${request.requestItems.length} items` || 'N/A'}</td>
                                <td className="py-2 px-2">
                                    <span
                                        className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full"
                                        style={{
                                            color: getStatusColor(request.status),
                                            backgroundColor: `${getStatusColor(request.status)}20`
                                        }}
                                    >
                                        {getStatusIcon(request.status)}
                                        <span className="ml-1">{request.status?.replace(/_/g, ' ')}</span>
                                    </span>
                                </td>
                                <td className="py-2 px-2 text-gray-700">{formatDate(request.createdAt || '')}</td>
                                <td className="py-2 px-2">
                                    <div className="flex items-center justify-end space-x-1">
                                        <Link
                                            to={`${request.id}`}
                                            className="text-gray-400 hover:text-primary-600 p-1"
                                            title="View More"
                                        >
                                            <Eye className="w-3 h-3" />
                                        </Link>
                                        {renderActionButtonBasedOnRole(role, request)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderGridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {currentRequests.map((request) => (
                <div key={request.id} className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-2 mb-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <Package className="w-4 h-4 text-primary-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 text-xs truncate">{request.site?.name || 'N/A'}</div>
                            <div className="text-gray-500 text-xs truncate">{getRequestedBy(request).full_name}</div>
                        </div>
                    </div>
                    <div className="space-y-1 mb-3">
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <span
                                className="inline-flex items-center px-2 py-0.5 font-semibold rounded-full"
                                style={{
                                    color: getStatusColor(request.status),
                                    backgroundColor: `${getStatusColor(request.status)}20`
                                }}
                            >
                                {getStatusIcon(request.status)}
                                <span className="ml-1">{request.status?.replace(/_/g, ' ')}</span>
                            </span>
                        </div>
                        <div className="text-xs text-gray-600">
                            Items: {request.requestItems.length}
                        </div>
                        <div className="text-xs text-gray-600">
                            Qty: {request.requestItems.reduce((sum, item) => sum + item.qtyRequested, 0)}
                        </div>
                        <div className="text-xs text-gray-600">
                            Created: {formatDate(request.createdAt || '')}
                        </div>
                    </div>
                    <div className="flex items-center justify-end space-x-1">
                        <button
                            onClick={() => handleViewRequest(request)}
                            className="text-gray-400 hover:text-primary-600 p-1"
                            title="View Request"
                        >
                            <Eye className="w-3 h-3" />
                        </button>
                        {renderActionButtonBasedOnRole(role, request)}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderListView = () => (
        <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
            {currentRequests.map((request) => (
                <div
                    key={request.id}
                    className="px-4 py-3 hover:bg-gray-25"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Package className="w-5 h-5 text-primary-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 text-sm truncate">
                                    #{request.ref_no} - {request.site?.name || 'N/A'}
                                </div>
                                <div className="text-gray-500 text-xs truncate">
                                    Requested by: {getRequestedBy(request).full_name}
                                </div>
                                <div className="text-gray-500 text-xs truncate">
                                    Created: {formatDate(request.createdAt || '')}
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:grid grid-cols-2 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
                            <span
                                className="inline-flex items-center px-2 py-0.5 font-semibold rounded-full"
                                style={{
                                    color: getStatusColor(request.status),
                                    backgroundColor: `${getStatusColor(request.status)}20`
                                }}
                            >
                                {getStatusIcon(request.status)}
                                <span className="ml-1">{request.status?.replace(/_/g, ' ')}</span>
                            </span>
                            <button
                                onClick={() => handleViewRequest(request)}
                                className="text-primary-600 hover:text-primary-800"
                                title="View Request"
                            >
                                View More
                            </button>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                            <button
                                onClick={() => handleViewRequest(request)}
                                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                                title="View Request"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            {renderActionButtonBasedOnRole(role, request)}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderPagination = () => {
        const pages: number[] = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="flex items-center justify-between bg-white px-3 py-2 border-t border-gray-200">
                <div className="text-xs text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, requests.length)} of {requests.length}
                </div>
                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="w-3 h-3" />
                    </button>
                    {pages.map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-2 py-1 text-xs rounded ${
                                currentPage === page
                                    ? 'bg-primary-500 text-white'
                                    : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                            aria-label={`Page ${page}`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Next page"
                    >
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 text-xs">
            <AddRequestModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveRequest}
                stockins={stockins}
            />
            <EditRequestModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                request={selectedRequest}
                onSave={handleSaveRequest}
                stockins={stockins}
            />
            <IssueMaterialsModal
                isOpen={isIssueModalOpen}
                onClose={() => {
                    setIsIssueModalOpen(false);
                    setSelectedRequest(null);
                }}
                request={selectedRequest}
                onIssue={handleIssueSuccess}
                role={role}
                stockins={stockins}
            />
            <ReceiveMaterialsModal
                isOpen={isReceiveModalOpen}
                onClose={() => {
                    setIsReceiveModalOpen(false);
                    setSelectedRequest(null);
                }}
                requisition={selectedRequest}
                onReceive={handleReceiveSuccess}
                role={role}
                stockins={stockins}
            />
            <RejectRequestModal
                isOpen={isRejectModalOpen}
                requisition={selectedRequest}
                onClose={() => {
                    setIsRejectModalOpen(false);
                    setSelectedRequest(null);
                }}
                onReject={handleRejectSuccess}
            />
            {operationStatus && (
                <div className="fixed top-4 right-4 z-50">
                    <div
                        className={`flex items-center space-x-2 px-3 py-2 rounded shadow-lg text-xs ${
                            operationStatus.type === 'success'
                                ? 'bg-green-50 border border-green-200 text-green-800'
                                : operationStatus.type === 'error'
                                ? 'bg-red-50 border border-red-200 text-red-800'
                                : 'bg-primary-50 border border-primary-200 text-primary-800'
                        }`}
                    >
                        {operationStatus.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {operationStatus.type === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                        {operationStatus.type === 'info' && <AlertCircle className="w-4 h-4 text-primary-600" />}
                        <span className="font-medium">{operationStatus.message}</span>
                        <button onClick={() => setOperationStatus(null)} className="hover:opacity-70" aria-label="Close notification">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}
            {operationLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
                    <div className="bg-white rounded p-4 shadow-xl">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-700 text-xs font-medium">Processing...</span>
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-white shadow-md">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">Stock Request Management</h1>
                            <p className="text-xs text-gray-500 mt-0.5">Manage stock requests for sites</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={handleExportPDF}
                                disabled={operationLoading || requests.length === 0}
                                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                                title="Export PDF"
                                aria-label="Export to PDF"
                            >
                                <Download className="w-3 h-3" />
                                <span>Export</span>
                            </button>
                            {role === 'employee' && (
                                <button
                                    onClick={handleAddRequest}
                                    disabled={operationLoading}
                                    className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
                                    aria-label="Add new request"
                                >
                                    <Plus className="w-3 h-3" />
                                    <span>New Request</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-4 py-4 space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-primary-100 rounded-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Total Requests</p>
                                <p className="text-lg font-semibold text-gray-900">{totalRequests}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-orange-100 rounded-full flex items-center justify-center">
                                <Clock className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Pending</p>
                                <p className="text-lg font-semibold text-gray-900">{pendingRequests}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckSquare className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Approved</p>
                                <p className="text-lg font-semibold text-gray-900">{approvedRequests}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-zinc-100 rounded-full flex items-center justify-center">
                                <Archive className="w-5 h-5 text-zinc-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Closed</p>
                                <p className="text-lg font-semibold text-gray-900">{closedRequests}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-3">
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search requests..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                    aria-label="Search requests"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center space-x-1 px-2 py-1.5 text-xs border rounded transition-colors ${
                                    showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                                aria-label={showFilters ? 'Hide filters' : 'Show filters'}
                            >
                                <Filter className="w-3 h-3" />
                                <span>Filter</span>
                            </button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [newSortBy, newSortOrder] = e.target.value.split('-') as [keyof Request, 'asc' | 'desc'];
                                    setSortBy(newSortBy);
                                    setSortOrder(newSortOrder);
                                }}
                                className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                aria-label="Sort options"
                            >
                                <option value="siteId-asc">Site (A-Z)</option>
                                <option value="siteId-desc">Site (Z-A)</option>
                                <option value="createdAt-asc">Created At (Oldest First)</option>
                                <option value="createdAt-desc">Created At (Newest First)</option>
                            </select>
                            <div className="flex items-center space-x-1">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'}`}
                                    title="Table View"
                                    aria-label="Switch to table view"
                                >
                                    <LayoutGrid className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'}`}
                                    title="Grid View"
                                    aria-label="Switch to grid view"
                                >
                                    <LayoutGrid className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'}`}
                                    title="List View"
                                    aria-label="Switch to list view"
                                >
                                    <List className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                    {showFilters && (
                        <div className="mt-3">
                            <div className="flex flex-wrap gap-2">
                                <div className="relative">
                                    <Calendar className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                        aria-label="Filter by start date"
                                    />
                                </div>
                                <div className="relative">
                                    <Calendar className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                        aria-label="Filter by end date"
                                    />
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                    aria-label="Filter by status"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="APPROVED">Approved</option>
                                    <option value="PARTIALLY_ISSUED">Partially Issued</option>
                                    <option value="ISSUED">Issued</option>
                                    <option value="REJECTED">Rejected</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                                <button
                                    onClick={handleClearDates}
                                    className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
                                    aria-label="Clear date filters"
                                >
                                    <X className="w-3 h-3" />
                                    <span>Clear Dates</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                        setDateFrom('');
                                        setDateTo('');
                                        setSortBy('siteId');
                                        setSortOrder('asc');
                                    }}
                                    className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
                                    aria-label="Reset all filters"
                                >
                                    <RefreshCw className="w-3 h-3" />
                                    <span>Clear All</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {loading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded p-4 text-center">
                        <p className="text-xs text-red-600">{error}</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-white rounded border border-gray-200 p-6 text-center">
                        <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs text-gray-600">No requests found.</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'table' && renderTableView()}
                        {viewMode === 'grid' && renderGridView()}
                        {viewMode === 'list' && renderListView()}
                        {renderPagination()}
                    </>
                )}
            </div>
        </div>
    );
};

export default StockRequestManagement;
import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
  RefreshCw,
  Grid3X3,
  List,
  Settings,
  Package,
  Clock,
  CheckSquare,
  XSquare,
  Send,
} from "lucide-react";
import assetRequestService from '../../../services/assetRequestService';
import { useSocketEvent } from '../../../context/SocketContext';

type ViewMode = 'table' | 'grid' | 'list';
type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ISSUED' | 'PARTIALLY_ISSUED' | 'CLOSED';
type RequestedItemStatus = 'PENDING' | 'ISSUED' | 'PARTIALLY_ISSUED' | 'PENDING_PROCUREMENT';

interface OperationStatus {
  type: "success" | "error" | "info";
  message: string;
}

interface AssetRequestItem {
  id: string;
  assetId: string;
  quantity: number;
  quantityIssued?: number;
  status?: RequestedItemStatus;
  requestId: string;
  asset?: {
    id: string;
    name: string;
    quantity?: number;  // Updated type to number
    [key: string]: any;
  };
}

interface AssetRequest {
  id: string;
  employeeId: string;
  status: RequestStatus;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    [key: string]: any;
  };
  items?: AssetRequestItem[];
}

interface IssuedItem {
  itemId: string;
  issuedQuantity: number;
}

const RequestAssetsManagement: React.FC<{ role: string }> = ({ role }) => {
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [allRequests, setAllRequests] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<keyof AssetRequest>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [actionConfirm, setActionConfirm] = useState<{request: AssetRequest, action: 'approve' | 'reject'} | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AssetRequest | null>(null);
  const [issuedItems, setIssuedItems] = useState<IssuedItem[]>([]);
  const [showIssueModal, setShowIssueModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, statusFilter, sortBy, sortOrder, allRequests]);

  useSocketEvent('requestCreated', (request: AssetRequest) => {
    setAllRequests((prev) => [...prev, processRequest(request)]);
    showOperationStatus('success', `Request ${request.id} created`);
  });

  useSocketEvent('requestUpdated', (request: AssetRequest) => {
    setAllRequests((prev) =>
      prev.map((r) => (r.id === request.id ? processRequest(request) : r))
    );
    showOperationStatus('success', `Request ${request.id} updated`);
  });

  useSocketEvent('requestDeleted', ({ id }: { id: string }) => {
    setAllRequests((prev) => prev.filter((r) => r.id !== id));
    showOperationStatus('success', `Request ${id} deleted`);
  });

  useSocketEvent('requestStatusChanged', ({ id, status }: { id: string; status: RequestStatus }) => {
    setAllRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    showOperationStatus('info', `Request ${id} status changed to ${status}`);
  });

  const processRequest = (req: AssetRequest): AssetRequest => ({
    ...req,
    employee: {
      ...req.employee,
      full_name: req.employee?.full_name || `${req.employee?.first_name || ''} ${req.employee?.last_name || ''}`.trim(),
    },
    items: req.items?.map((item) => ({
      ...item,
      asset: item.asset
        ? {
            ...item.asset,
            quantity: parseInt(item.asset.quantity ?? "0", 10),
          }
        : undefined,
    })),
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await assetRequestService.getAllRequests();
      setAllRequests(data.map(processRequest));
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load asset requests");
    } finally {
      setLoading(false);
    }
  };

  const showOperationStatus = (type: OperationStatus["type"], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allRequests];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (request) =>
          request.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.items?.some(item => 
            item.asset?.name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(request => request.status === statusFilter);
    }

    filtered.sort((a, b) => {
      if (sortBy === "createdAt") {
        const aDate = new Date(a.createdAt || 0);
        const bDate = new Date(b.createdAt || 0);
        return sortOrder === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }

      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const aStr = aValue ? aValue.toString().toLowerCase() : "";
      const bStr = bValue ? bValue.toString().toLowerCase() : "";
      
      if (sortOrder === "asc") return aStr > bStr ? 1 : aStr < bStr ? -1 : 0;
      else return aStr < bStr ? 1 : aStr > bStr ? -1 : 0;
    });

    setRequests(filtered);
    setCurrentPage(1);
  };

  const handleApproveAndIssue = (request: AssetRequest) => {
    const defaultIssuedItems: IssuedItem[] = (request.items || []).map(item => {
      const available = item.asset?.quantity ?? 0;
      return {
        itemId: item.id,
        issuedQuantity: available > 0 ? Math.min(item.quantity, available) : 0
      };
    });
    setIssuedItems(defaultIssuedItems);
    setSelectedRequest(request);
    setShowIssueModal(true);
    setActionConfirm(null);
  };

  const hasInvalidQuantities = () => {
    return selectedRequest?.items?.some(item => {
      const issued = issuedItems.find(i => i.itemId === item.id)?.issuedQuantity || 0;
      const available = item.asset?.quantity ?? 0;
      return issued > available || issued < 0;
    }) || false;
  };

  const allItemsOutOfStock = (request: AssetRequest | null) => {
    return request?.items?.every(item => (item.asset?.quantity ?? 0) === 0) || false;
  };

  const confirmApproveAndIssue = async () => {
    if (!selectedRequest || hasInvalidQuantities()) return;

    try {
      setOperationLoading(true);
      setShowIssueModal(false);
      const updatedRequest = await assetRequestService.approveAndIssueRequest(
        selectedRequest.id,
        issuedItems
      );
      setAllRequests(prev => prev.map(req => 
        req.id === updatedRequest.id ? processRequest(updatedRequest) : req
      ));
      showOperationStatus("success", `Request ${selectedRequest.id} approved and issued successfully!`);
      setSelectedRequest(null);
      setIssuedItems([]);
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to approve and issue request");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleRejectRequest = async (request: AssetRequest) => {
    try {
      setOperationLoading(true);
      setActionConfirm(null);
      const updatedRequest = await assetRequestService.rejectRequest(request.id);
      setAllRequests(prev => prev.map(req => 
        req.id === updatedRequest.id ? processRequest(updatedRequest) : req
      ));
      showOperationStatus("success", `Request ${request.id} rejected!`);
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to reject request");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleViewRequest = (request: AssetRequest) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const formatDate = (date?: string): string => {
    if (!date) return new Date().toLocaleDateString("en-GB");
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (status: RequestStatus) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckSquare },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', icon: XSquare },
      ISSUED: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Send },
      PARTIALLY_ISSUED: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Package },
      CLOSED: { bg: 'bg-gray-100', text: 'text-gray-800', icon: Package }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        <span>{status}</span>
      </span>
    );
  };

  const updateIssuedQuantity = (itemId: string, quantity: number) => {
    setIssuedItems(prev => 
      prev.map(item => 
        item.itemId === itemId ? { ...item, issuedQuantity: quantity } : item
      )
    );
  };

  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = requests.slice(startIndex, endIndex);

  const stats = {
    total: allRequests.length,
    pending: allRequests.filter(r => r.status === 'PENDING').length,
    approved: allRequests.filter(r => r.status === 'APPROVED').length,
    rejected: allRequests.filter(r => r.status === 'REJECTED').length,
    issued: allRequests.filter(r => r.status === 'ISSUED' || r.status === 'PARTIALLY_ISSUED').length
  };

  const renderTableView = () => (
    <div className="bg-white rounded border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">Employee</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Items</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Status</th>
              <th 
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100 hidden md:table-cell" 
                onClick={() => setSortBy("createdAt")}
              >
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === "createdAt" ? "text-blue-600" : "text-gray-400"}`} />
                </div>
              </th>
              <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentRequests.map((request, index) => (
              <tr key={request.id} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2 text-gray-700">{request.employee?.full_name || 'N/A'}</td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">
                  <div className="max-w-32 truncate" title={request.items?.map(i => `${i.asset?.name} (${i.quantity})`).join(', ')}>
                    {request.items?.length || 0} item(s)
                  </div>
                </td>
                <td className="py-2 px-2 hidden sm:table-cell">
                  {getStatusBadge(request.status)}
                </td>
                <td className="py-2 px-2 text-gray-700 hidden md:table-cell text-xs">
                  {formatDate(request.createdAt)}
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center justify-end space-x-1">
                    <button 
                      onClick={() => handleViewRequest(request)} 
                      className="text-gray-400 hover:text-blue-600 p-1" 
                      title="View Details"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    {request.status === 'PENDING' && (
                      <>
                        <button 
                          onClick={() => setActionConfirm({request, action: 'approve'})} 
                          className="text-gray-400 hover:text-green-600 p-1" 
                          title={allItemsOutOfStock(request) ? "Procure Assets" : "Approve & Issue"}
                        >
                          <CheckSquare className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => setActionConfirm({request, action: 'reject'})} 
                          className="text-gray-400 hover:text-red-600 p-1" 
                          title="Reject"
                        >
                          <XSquare className="w-3 h-3" />
                        </button>
                      </>
                    )}
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
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-700" />
            </div>
            {getStatusBadge(request.status)}
          </div>
          <div className="mb-2">
            <div className="font-medium text-gray-900 text-xs">{request.id}</div>
            <div className="text-gray-500 text-xs">{request.employee?.full_name}</div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="text-xs text-gray-600">{request.items?.length || 0} item(s) requested</div>
            <div className="text-xs text-gray-500">{formatDate(request.createdAt)}</div>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => handleViewRequest(request)} className="text-gray-400 hover:text-blue-600 p-1" title="View">
              <Eye className="w-3 h-3" />
            </button>
            <div className="flex space-x-1">
              {request.status === 'PENDING' && (
                <>
                  <button onClick={() => setActionConfirm({request, action: 'approve'})} className="text-gray-400 hover:text-green-600 p-1" title={allItemsOutOfStock(request) ? "Procure Assets" : "Approve & Issue"}>
                    <CheckSquare className="w-3 h-3" />
                  </button>
                  <button onClick={() => setActionConfirm({request, action: 'reject'})} className="text-gray-400 hover:text-red-600 p-1" title="Reject">
                    <XSquare className="w-3 h-3" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
      {currentRequests.map((request) => (
        <div key={request.id} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-blue-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">{request.id}</div>
                <div className="text-gray-500 text-xs">
                  {request.employee?.full_name} • {request.items?.length || 0} item(s)
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-xs text-gray-600">
              {getStatusBadge(request.status)}
              <span>{formatDate(request.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
              <button 
                onClick={() => handleViewRequest(request)} 
                className="text-gray-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition-colors" 
                title="View"
              >
                <Eye className="w-4 h-4" />
              </button>
              {request.status === 'PENDING' && (
                <>
                  <button 
                    onClick={() => setActionConfirm({request, action: 'approve'})} 
                    className="text-gray-400 hover:text-green-600 p-1.5 rounded-full hover:bg-green-50 transition-colors" 
                    title={allItemsOutOfStock(request) ? "Procure Assets" : "Approve & Issue"}
                  >
                    <CheckSquare className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActionConfirm({request, action: 'reject'})} 
                    className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors" 
                    title="Reject"
                  >
                    <XSquare className="w-4 h-4" />
                  </button>
                </>
              )}
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
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-2 py-1 text-xs rounded ${
                currentPage === page
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-xs">
      <div className="bg-white shadow-md">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Asset Request Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">Review and manage asset requests</p>
            </div>
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="bg-white rounded shadow p-3">
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 text-gray-600" />
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <div>
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-lg font-semibold text-yellow-700">{stats.pending}</p>
              </div>
            </div>
          </div>
          {/* <div className="bg-white rounded shadow p-3">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Approved</p>
                <p className="text-lg font-semibold text-green-700">{stats.approved}</p>
              </div>
            </div>
          </div> */}
          <div className="bg-white rounded shadow p-3">
            <div className="flex items-center space-x-2">
              <XSquare className="w-4 h-4 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">Rejected</p>
                <p className="text-lg font-semibold text-red-700">{stats.rejected}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-3">
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Issued</p>
                <p className="text-lg font-semibold text-blue-700">{stats.issued}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as RequestStatus | 'ALL')}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="ISSUED">Issued</option>
                <option value="PARTIALLY_ISSUED">Partially Issued</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-") as [keyof AssetRequest, "asc" | "desc"];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
              </select>
              <div className="flex items-center border border-gray-200 rounded">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Table View"
                >
                  <List className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="List View"
                >
                  <Settings className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="inline-flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Loading requests...</span>
            </div>
          </div>
        ) : currentRequests.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm || statusFilter !== 'ALL' ? 'No requests found matching your criteria' : 'No asset requests found'}
            </div>
          </div>
        ) : (
          <div>
            {viewMode === 'table' && renderTableView()}
            {viewMode === 'grid' && renderGridView()}
            {viewMode === 'list' && renderListView()}
            {renderPagination()}
          </div>
        )}
      </div>

      {operationStatus && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded shadow-lg text-xs ${
            operationStatus.type === "success" ? "bg-green-50 border border-green-200 text-green-800" :
            operationStatus.type === "error" ? "bg-red-50 border border-red-200 text-red-800" :
            "bg-blue-50 border border-blue-200 text-blue-800"
          }`}>
            {operationStatus.type === "success" && <CheckCircle className="w-4 h-4 text-green-600" />}
            {operationStatus.type === "error" && <XCircle className="w-4 h-4 text-red-600" />}
            {operationStatus.type === "info" && <AlertCircle className="w-4 h-4 text-blue-600" />}
            <span className="font-medium">{operationStatus.message}</span>
            <button onClick={() => setOperationStatus(null)} className="hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {operationLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded p-4 shadow-xl">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700 text-xs font-medium">Processing...</span>
            </div>
          </div>
        </div>
      )}

      {actionConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-4 w-full max-w-sm">
            <div className="flex items-center space-x-2 mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                actionConfirm.action === 'approve' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {actionConfirm.action === 'approve' && <CheckSquare className="w-4 h-4 text-green-600" />}
                {actionConfirm.action === 'reject' && <XSquare className="w-4 h-4 text-red-600" />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {actionConfirm.action === 'approve' && (allItemsOutOfStock(actionConfirm.request) ? 'Procure Assets' : 'Approve & Issue Request')}
                  {actionConfirm.action === 'reject' && 'Reject Request'}
                </h3>
                <p className="text-xs text-gray-500">Confirm your action</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-700 mb-2">
                Are you sure you want to {actionConfirm.action === 'approve' ? (allItemsOutOfStock(actionConfirm.request) ? 'procure' : 'approve and issue') : 'reject'} this request?
              </p>
              <div className="bg-gray-50 rounded p-2 space-y-1">
                <div className="text-xs"><span className="font-medium">Employee:</span> {actionConfirm.request.employee?.full_name}</div>
                <div className="text-xs"><span className="font-medium">Items:</span> {actionConfirm.request.items?.length || 0} item(s)</div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setActionConfirm(null)}
                className="px-3 py-1.5 text-xs text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (actionConfirm.action === 'approve') handleApproveAndIssue(actionConfirm.request);
                  else handleRejectRequest(actionConfirm.request);
                }}
                className={`px-3 py-1.5 text-xs text-white rounded ${
                  actionConfirm.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionConfirm.action === 'approve' && (allItemsOutOfStock(actionConfirm.request) ? 'Procure Assets' : 'Approve & Issue')}
                {actionConfirm.action === 'reject' && 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showIssueModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{allItemsOutOfStock(selectedRequest) ? 'Procure Assets' : 'Approve & Issue Assets'}</h3>
              <button onClick={() => {
                setShowIssueModal(false);
                setSelectedRequest(null);
                setIssuedItems([]);
              }} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-800">
                  <span className="font-medium">Employee:</span> {selectedRequest.employee?.full_name}
                </p>
                <p className="text-xs text-blue-800 mt-1">
                  <span className="font-medium">Description:</span> {selectedRequest.description || 'No description'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set Issue Quantities
                </label>
                <div className="border border-gray-200 rounded divide-y divide-gray-100">
                  {selectedRequest.items?.map((item) => {
                    const issuedItem = issuedItems.find(i => i.itemId === item.id);
                    const issuedQty = issuedItem?.issuedQuantity || 0;
                    const availableQty = item.asset?.quantity ?? 0;
                    const isInvalid = issuedQty > availableQty || issuedQty < 0;
                    const isOutOfStock = availableQty === 0;
                    
                    return (
                      <div key={item.id} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{item.asset?.name || 'Unknown Asset'}</div>
                            <div className="text-xs text-gray-500">Requested: {item.quantity}</div>
                            <div className="text-xs text-gray-600">Available: {availableQty}</div>
                          </div>
                        </div>
                        {isOutOfStock ? (
                          <div className="flex items-center space-x-2">
                            <label className="text-xs text-gray-600 w-24">Issue Quantity:</label>
                            <div className="flex-1">
                              <input
                                type="number"
                                value={0}
                                disabled
                                className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded bg-gray-100 cursor-not-allowed"
                              />
                              <p className="text-xs text-orange-600 mt-1">
                                Item out of stock - Pending Procurement
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <label className="text-xs text-gray-600 w-24">Issue Quantity:</label>
                            <input
                              type="number"
                              value={issuedQty}
                              onChange={(e) => updateIssuedQuantity(item.id, parseInt(e.target.value) || 0)}
                              className={`flex-1 px-2 py-1 text-xs border rounded focus:outline-none focus:ring-1 ${
                                isInvalid ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-blue-500'
                              }`}
                            />
                          </div>
                        )}
                        {isInvalid && !isOutOfStock && (
                          <p className="text-xs text-red-600 mt-1">
                            {issuedQty < 0 ? 'Quantity cannot be negative' : `Quantity exceeds available stock (${availableQty})`}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Items with zero available quantity will be marked for procurement. Other items can be issued partially, and remaining quantities will be marked for procurement.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowIssueModal(false);
                  setSelectedRequest(null);
                  setIssuedItems([]);
                }}
                className="px-4 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmApproveAndIssue}
                disabled={hasInvalidQuantities()}
                className={`px-4 py-2 text-xs rounded text-white ${
                  hasInvalidQuantities() 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {allItemsOutOfStock(selectedRequest) ? 'Procure Assets' : 'Approve & Issue'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Request Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Employee</label>
                <p className="text-xs text-gray-900">{selectedRequest.employee?.full_name || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <p className="text-xs text-gray-900">{selectedRequest.description || 'No description provided'}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Requested Items ({selectedRequest.items?.length || 0})
                </label>
                <div className="border border-gray-200 rounded divide-y divide-gray-100">
                  {selectedRequest.items && selectedRequest.items.length > 0 ? (
                    selectedRequest.items.map((item) => (
                      <div key={item.id} className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{item.asset?.name || 'Unknown Asset'}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900">×{item.quantity}</div>
                            <div className="text-xs text-gray-500">Requested</div>
                          </div>
                        </div>
                        {item.quantityIssued !== undefined && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Issued:</span>
                              <span className="font-medium text-blue-600">×{item.quantityIssued}</span>
                            </div>
                            {item.status && (
                              <div className="mt-1">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                                  item.status === 'ISSUED' ? 'bg-green-100 text-green-800' :
                                  item.status === 'PARTIALLY_ISSUED' ? 'bg-purple-100 text-purple-800' :
                                  item.status === 'PENDING_PROCUREMENT' ? 'bg-orange-100 text-orange-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {item.status}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-gray-500 text-center">No items</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Created At</label>
                  <p className="text-xs text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Updated At</label>
                  <p className="text-xs text-gray-900">{formatDate(selectedRequest.updatedAt)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-700"
              >
                Close
              </button>
              <div className="flex space-x-2">
                {selectedRequest.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setActionConfirm({request: selectedRequest, action: 'approve'});
                      }}
                      className="px-4 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      {allItemsOutOfStock(selectedRequest) ? 'Procure Assets' : 'Approve & Issue'}
                    </button>
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        setActionConfirm({request: selectedRequest, action: 'reject'});
                      }}
                      className="px-4 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestAssetsManagement;
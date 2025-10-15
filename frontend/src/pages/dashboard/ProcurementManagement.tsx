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
  Truck,
  RefreshCw as PartialIcon,
} from "lucide-react";
import assetRequestService from '../../services/assetRequestService';
import { useSocketEvent } from '../../context/SocketContext';

type ViewMode = 'table' | 'grid' | 'list';
type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ISSUED' | 'PARTIALLY_ISSUED' | 'CLOSED';
type RequestedItemStatus = 'PENDING' | 'ISSUED' | 'PARTIALLY_ISSUED' | 'PENDING_PROCUREMENT';
type ProcurementStatus = 'NOT_REQUIRED' | 'REQUIRED' | 'ORDERED' | 'PARTIALLY_ORDERED' | 'COMPLETED';

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
  procurementStatus?: ProcurementStatus;
  requestId: string;
  createdAt?: string;
  updatedAt?: string;
  asset?: {
    id: string;
    name: string;
    quantity?: number;
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

interface ProcurementItem extends AssetRequestItem {
  request: AssetRequest;
}

interface AggregatedProcurementItem {
  assetId: string;
  assetName: string;
  totalNeeded: number;
  procurementStatus: ProcurementStatus;
  items: ProcurementItem[];
  latestCreatedAt: string;
}

const ProcurementManagement: React.FC<{ role: string }> = ({ role }) => {
  const [allRequests, setAllRequests] = useState<AssetRequest[]>([]);
  const [procurementItems, setProcurementItems] = useState<ProcurementItem[]>([]);
  const [aggregatedItems, setAggregatedItems] = useState<AggregatedProcurementItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<ProcurementStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProcurementItem | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [procuredQuantity, setProcuredQuantity] = useState<number>(0);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderedQuantity, setOrderedQuantity] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const items = deriveProcurementItems(allRequests);
    const aggregated = aggregateProcurementItems(items);
    handleFilterAndSort(items, aggregated);
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

  useSocketEvent('requestStatusChanged', ({ id, status }: { id: string; status: string }) => {
    setAllRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return { ...r, status };
        }
        const items = r.items?.map((i) => (i.id === id ? { ...i, status } : i)) || [];
        return { ...r, items };
      })
    );
    showOperationStatus('info', `Status changed to ${status}`);
  });

  useSocketEvent('requestItemUpdated', (item: AssetRequestItem) => {
    setAllRequests((prev) =>
      prev.map((r) => {
        const items = r.items?.map((i) => (i.id === item.id ? item : i)) || [];
        return { ...r, items };
      })
    );
    showOperationStatus('success', `Item ${item.id} updated`);
  });

  useSocketEvent('requestItemProcurementNeeded', (item: AssetRequestItem) => {
    setAllRequests((prev) =>
      prev.map((r) => {
        if (r.id === item.requestId) {
          const items = r.items || [];
          const existing = items.find((i) => i.id === item.id);
          const newItems = existing
            ? items.map((i) => (i.id === item.id ? item : i))
            : [...items, item];
          return { ...r, items: newItems };
        }
        return r;
      })
    );
    showOperationStatus('info', `Item ${item.id} needs procurement`);
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
      setError(err.message || "Failed to load procurement data");
    } finally {
      setLoading(false);
    }
  };

  const deriveProcurementItems = (requests: AssetRequest[]): ProcurementItem[] => {
    return requests.flatMap((r) =>
      (r.items || []).filter((i) => i.procurementStatus && i.procurementStatus !== 'NOT_REQUIRED').map((i) => ({
        ...i,
        request: r,
      }))
    );
  };

  const aggregateProcurementItems = (items: ProcurementItem[]): AggregatedProcurementItem[] => {
    const aggregatedMap = new Map<string, AggregatedProcurementItem>();
    
    items.forEach((item) => {
      const key = item.assetId;
      const existing = aggregatedMap.get(key);
      
      const needed = item.quantity - (item.quantityIssued || 0);
      
      if (existing) {
        existing.totalNeeded += needed;
        existing.items.push(item);
        const itemCreatedAt = new Date(item.createdAt || 0).getTime();
        const existingCreatedAt = new Date(existing.latestCreatedAt || 0).getTime();
        if (itemCreatedAt > existingCreatedAt) {
          existing.latestCreatedAt = item.createdAt || existing.latestCreatedAt;
        }
        // Use the most advanced status, but for simplicity, keep first
      } else {
        aggregatedMap.set(key, {
          assetId: item.assetId,
          assetName: item.asset?.name || 'N/A',
          totalNeeded: needed,
          procurementStatus: item.procurementStatus as ProcurementStatus,
          items: [item],
          latestCreatedAt: item.createdAt || new Date().toISOString(),
        });
      }
    });

    return Array.from(aggregatedMap.values());
  };

  const handleFilterAndSort = (items = deriveProcurementItems(allRequests), aggregatedItems = aggregateProcurementItems(items)) => {
    let filtered = [...aggregatedItems];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (item) =>
          item.assetName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.items.some((i) => 
            i.request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            i.request.employee?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((item) => item.procurementStatus === statusFilter);
    }

    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      if (sortBy === "createdAt") {
        aValue = new Date(a.latestCreatedAt || 0).getTime();
        bValue = new Date(b.latestCreatedAt || 0).getTime();
      } else if (sortBy === "asset.name") {
        aValue = a.assetName.toLowerCase() || "";
        bValue = b.assetName.toLowerCase() || "";
      } else if (sortBy === "quantity") {
        aValue = a.totalNeeded;
        bValue = b.totalNeeded;
      }
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    setProcurementItems(items);
    setAggregatedItems(filtered);
    setCurrentPage(1);
  };

  const neededQuantity = (item: ProcurementItem) => item.quantity - (item.quantityIssued || 0);

  const aggregateNeeded = (aggItem: AggregatedProcurementItem) => aggItem.totalNeeded;

  const handleViewItem = (item: ProcurementItem) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const confirmMarkOrdered = async () => {
    if (!selectedItem) return;
    try {
      setOperationLoading(true);
      setShowOrderModal(false);
      const response = await assetRequestService.updateProcurementStatus(selectedItem.assetId, orderedQuantity);
      showOperationStatus("success", `Successfully marked ${response.asset.name} as ordered for ${orderedQuantity} units`);
      loadData();
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to mark as ordered");
    } finally {
      setOperationLoading(false);
      setSelectedItem(null);
      setOrderedQuantity(0);
    }
  };

  const confirmCompleteProcurement = async () => {
    if (!selectedItem) return;
    try {
      setOperationLoading(true);
      setShowCompleteModal(false);
      const response = await assetRequestService.updateProcurementStatus(selectedItem.assetId, procuredQuantity);
      showOperationStatus("success", `Procurement completed for ${response.asset.name} - ${procuredQuantity} units added`);
      loadData();
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to complete procurement");
    } finally {
      setOperationLoading(false);
      setSelectedItem(null);
      setProcuredQuantity(0);
    }
  };

  const showOperationStatus = (type: "success" | "error" | "info", message: string) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), 5000);
  };

  const formatDate = (date?: string): string => {
    if (!date) return new Date().toLocaleDateString("en-GB");
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: ProcurementStatus) => {
    const statusConfig = {
      REQUIRED: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      ORDERED: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Truck },
      PARTIALLY_ORDERED: { bg: 'bg-purple-100', text: 'text-purple-800', icon: PartialIcon },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckSquare },
    };
    const config = statusConfig[status] || statusConfig.REQUIRED;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        <span>{status}</span>
      </span>
    );
  };

  const totalPages = Math.ceil(aggregatedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAggregatedItems = aggregatedItems.slice(startIndex, endIndex);

  const stats = {
    total: aggregatedItems.length,
    required: aggregatedItems.filter((i) => i.procurementStatus === 'REQUIRED').length,
    ordered: aggregatedItems.filter((i) => i.procurementStatus === 'ORDERED' || i.procurementStatus === 'PARTIALLY_ORDERED').length,
    completed: aggregatedItems.filter((i) => i.procurementStatus === 'COMPLETED').length,
  };

  const renderTableView = () => (
    <div className="bg-white rounded border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">Asset</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Total Needed</th>
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
            {currentAggregatedItems.map((item, index) => (
              <tr key={item.assetId} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2 text-gray-700">{item.assetName}</td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{item.totalNeeded}</td>
                <td className="py-2 px-2 hidden sm:table-cell">
                  {getStatusBadge(item.procurementStatus)}
                </td>
                <td className="py-2 px-2 text-gray-700 hidden md:table-cell text-xs">
                  {formatDate(item.latestCreatedAt)}
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center justify-end space-x-1">
                    <button 
                      onClick={() => handleViewItem(item.items[0])} 
                      className="text-gray-400 hover:text-blue-600 p-1" 
                      title="View Details"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    {item.procurementStatus === 'REQUIRED' && (
                      <button 
                        onClick={() => {
                          setSelectedItem(item.items[0]);
                          setOrderedQuantity(item.totalNeeded);
                          setShowOrderModal(true);
                        }} 
                        className="text-gray-400 hover:text-blue-600 p-1" 
                        title="Mark as Ordered"
                      >
                        <Truck className="w-3 h-3" />
                      </button>
                    )}
                    {(item.procurementStatus === 'ORDERED' || item.procurementStatus === 'PARTIALLY_ORDERED') && (
                      <button 
                        onClick={() => {
                          setSelectedItem(item.items[0]);
                          setProcuredQuantity(item.totalNeeded);
                          setShowCompleteModal(true);
                        }} 
                        className="text-gray-400 hover:text-green-600 p-1" 
                        title="Complete Procurement"
                      >
                        <CheckSquare className="w-3 h-3" />
                      </button>
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
      {currentAggregatedItems.map((item) => (
        <div key={item.assetId} className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-4 h-4 text-blue-700" />
            </div>
            {getStatusBadge(item.procurementStatus)}
          </div>
          <div className="mb-2">
            <div className="font-medium text-gray-900 text-xs">{item.assetName}</div>
            <div className="text-gray-500 text-xs">{item.items[0].request.employee?.full_name}</div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="text-xs text-gray-600">Needed: {item.totalNeeded}</div>
            <div className="text-xs text-gray-500">{formatDate(item.latestCreatedAt)}</div>
          </div>
          <div className="flex items-center justify-between">
            <button onClick={() => handleViewItem(item.items[0])} className="text-gray-400 hover:text-blue-600 p-1" title="View">
              <Eye className="w-3 h-3" />
            </button>
            <div className="flex space-x-1">
              {item.procurementStatus === 'REQUIRED' && (
                <button 
                  onClick={() => {
                    setSelectedItem(item.items[0]);
                    setOrderedQuantity(item.totalNeeded);
                    setShowOrderModal(true);
                  }} 
                  className="text-gray-400 hover:text-blue-600 p-1" 
                  title="Mark as Ordered"
                >
                  <Truck className="w-3 h-3" />
                </button>
              )}
              {(item.procurementStatus === 'ORDERED' || item.procurementStatus === 'PARTIALLY_ORDERED') && (
                <button 
                  onClick={() => {
                    setSelectedItem(item.items[0]);
                    setProcuredQuantity(item.totalNeeded);
                    setShowCompleteModal(true);
                  }} 
                  className="text-gray-400 hover:text-green-600 p-1" 
                  title="Complete Procurement"
                >
                  <CheckSquare className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
      {currentAggregatedItems.map((item) => (
        <div key={item.assetId} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Package className="w-5 h-5 text-blue-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm">{item.assetName}</div>
                <div className="text-gray-500 text-xs">
                  {item.items[0].request.employee?.full_name} • Needed: {item.totalNeeded}
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-xs text-gray-600">
              {getStatusBadge(item.procurementStatus)}
              <span>{formatDate(item.latestCreatedAt)}</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
              <button 
                onClick={() => handleViewItem(item.items[0])} 
                className="text-gray-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition-colors" 
                title="View"
              >
                <Eye className="w-4 h-4" />
              </button>
              {item.procurementStatus === 'REQUIRED' && (
                <button 
                  onClick={() => {
                    setSelectedItem(item.items[0]);
                    setOrderedQuantity(item.totalNeeded);
                    setShowOrderModal(true);
                  }} 
                  className="text-gray-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition-colors" 
                  title="Mark as Ordered"
                >
                  <Truck className="w-4 h-4" />
                </button>
              )}
              {(item.procurementStatus === 'ORDERED' || item.procurementStatus === 'PARTIALLY_ORDERED') && (
                <button 
                  onClick={() => {
                    setSelectedItem(item.items[0]);
                    setProcuredQuantity(item.totalNeeded);
                    setShowCompleteModal(true);
                  }} 
                  className="text-gray-400 hover:text-green-600 p-1.5 rounded-full hover:bg-green-50 transition-colors" 
                  title="Complete Procurement"
                >
                  <CheckSquare className="w-4 h-4" />
                </button>
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
          Showing {startIndex + 1}-{Math.min(endIndex, aggregatedItems.length)} of {aggregatedItems.length}
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
              <h1 className="text-lg font-semibold text-gray-900">Procurement Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">Review and manage procurement items</p>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
                <p className="text-xs text-gray-600">Required</p>
                <p className="text-lg font-semibold text-yellow-700">{stats.required}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-3">
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Ordered</p>
                <p className="text-lg font-semibold text-blue-700">{stats.ordered}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-3">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Completed</p>
                <p className="text-lg font-semibold text-green-700">{stats.completed}</p>
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
                  placeholder="Search procurement items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ProcurementStatus | 'ALL')}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value="REQUIRED">Required</option>
                <option value="ORDERED">Ordered</option>
                <option value="PARTIALLY_ORDERED">Partially Ordered</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-") as [string, "asc" | "desc"];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="asset.name-asc">Asset A-Z</option>
                <option value="asset.name-desc">Asset Z-A</option>
                <option value="quantity-desc">Quantity High-Low</option>
                <option value="quantity-asc">Quantity Low-High</option>
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
              <span className="text-xs">Loading procurement items...</span>
            </div>
          </div>
        ) : aggregatedItems.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm || statusFilter !== 'ALL' ? 'No procurement items found matching your criteria' : 'No procurement items found'}
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

      {showOrderModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Mark as Ordered</h3>
              <button onClick={() => setShowOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-800">
                  <span className="font-medium">Asset:</span> {selectedItem.asset?.name}
                </p>
                <p className="text-xs text-blue-800 mt-1">
                  <span className="font-medium">Needed:</span> {aggregateNeeded(aggregatedItems.find(i => i.assetId === selectedItem.assetId)!)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordered Quantity
                </label>
                <input
                  type="number"
                  value={orderedQuantity}
                  onChange={(e) => setOrderedQuantity(parseInt(e.target.value) || 0)}
                  min={1}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {orderedQuantity < 1 && (
                  <p className="text-xs text-red-600 mt-1">Quantity must be at least 1</p>
                )}
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> This will update the procurement status accordingly.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmMarkOrdered}
                disabled={orderedQuantity < 1}
                className={`px-4 py-2 text-xs rounded text-white ${
                  orderedQuantity < 1 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirm Order
              </button>
            </div>
          </div>
        </div>
      )}

      {showCompleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Complete Procurement</h3>
              <button onClick={() => setShowCompleteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-800">
                  <span className="font-medium">Asset:</span> {selectedItem.asset?.name}
                </p>
                <p className="text-xs text-blue-800 mt-1">
                  <span className="font-medium">Needed:</span> {neededQuantity(selectedItem)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Procured Quantity
                </label>
                <input
                  type="number"
                  value={procuredQuantity}
                  onChange={(e) => setProcuredQuantity(parseInt(e.target.value) || 0)}
                  min={1}
                  max={neededQuantity(selectedItem) * 2}
                  className="w-full px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {procuredQuantity < 1 && (
                  <p className="text-xs text-red-600 mt-1">Quantity must be at least 1</p>
                )}
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> This will add the procured quantity to stock and issue to the request.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="px-4 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmCompleteProcurement}
                disabled={procuredQuantity < 1}
                className={`px-4 py-2 text-xs rounded text-white ${
                  procuredQuantity < 1 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Procurement Item Details</h3>
              <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Procurement Status</label>
                  {getStatusBadge(selectedItem.procurementStatus as ProcurementStatus)}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Item Status</label>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800`}>
                    {selectedItem.status || 'N/A'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Asset</label>
                <p className="text-xs text-gray-900">{selectedItem.asset?.name || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Requested Quantity</label>
                  <p className="text-xs text-gray-900">{selectedItem.quantity}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Issued Quantity</label>
                  <p className="text-xs text-gray-900">{selectedItem.quantityIssued || 0}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Needed Quantity</label>
                <p className="text-xs text-gray-900">{neededQuantity(selectedItem)}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Request Description</label>
                <p className="text-xs text-gray-900">{selectedItem.request.description || 'No description provided'}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Employee</label>
                <p className="text-xs text-gray-900">{selectedItem.request.employee?.full_name || 'N/A'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Created At</label>
                  <p className="text-xs text-gray-900">{formatDate(selectedItem.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Updated At</label>
                  <p className="text-xs text-gray-900">{formatDate(selectedItem.updatedAt)}</p>
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
                {selectedItem.procurementStatus === 'REQUIRED' && (
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setOrderedQuantity(neededQuantity(selectedItem));
                      setShowOrderModal(true);
                    }}
                    className="px-4 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Mark Ordered
                  </button>
                )}
                {(selectedItem.procurementStatus === 'ORDERED' || selectedItem.procurementStatus === 'PARTIALLY_ORDERED') && (
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setProcuredQuantity(neededQuantity(selectedItem));
                      setShowCompleteModal(true);
                    }}
                    className="px-4 py-2 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementManagement;
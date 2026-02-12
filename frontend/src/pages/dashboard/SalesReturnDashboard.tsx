/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Eye,
  Package,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  RefreshCw,
  TrendingUp,
  List,
  Grid3X3,
  Settings,
  ShoppingCart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import salesReturnService, {
  type SalesReturnResponse as ServiceSalesReturn,
  type SalesReturnStatistics,
} from '../../services/salesReturnService';
import UpsertSalesReturnModal from '../../components/dashboard/salesReturn/UpsertSalesReturnModal';
import ViewSalesReturnModal from '../../components/dashboard/salesReturn/ViewSalesReturnModal';
import useEmployeeAuth from '../../context/EmployeeAuthContext';
import useAdminAuth from '../../context/AdminAuthContext';
import CreditNoteComponent from '../../components/dashboard/salesReturn/CreditNote';

// ──────────────────────────────────────────────────────────────
// Types & Interfaces
// ──────────────────────────────────────────────────────────────
interface StockIn {
  id: number;
  sku: string;
  itemName: string;
  unitOfMeasure: string;
}
interface StockOut {
  id: string;
  transactionId?: string;
  quantity: number;
  soldPrice?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  createdAt: string;
  stockin?: StockIn;
}
interface SalesReturnItem {
  id: string;
  stockoutId: string;
  quantity: number;
  stockout?: StockOut;
}
interface SalesReturn extends ServiceSalesReturn {
  id: string;
  transactionId: string;
  reason: string;
  createdAt: string;
  items: SalesReturnItem[];
}
interface Filters {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  reason: string;
  startDate: string;
  endDate: string;
}
interface OperationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}
interface SalesReturnManagementProps {
  role: 'admin' | 'employee';
}
type ViewMode = 'table' | 'grid' | 'list';

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────
const SalesReturnManagement: React.FC<SalesReturnManagementProps> = ({ role }) => {
  // ── State ─────────────────────────────────────────────────────
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>([]);
  const [filteredSalesReturns, setFilteredSalesReturns] = useState<SalesReturn[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedSalesReturn, setSelectedSalesReturn] = useState<SalesReturn | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [statistics, setStatistics] = useState<SalesReturnStatistics | null>(null);
  const [filters, setFilters] = useState<Filters>({
    dateRange: 'all',
    reason: 'all',
    startDate: '',
    endDate: '',
  });
  const [isCreditNoteOpen, setIsCreditNoteOpen] = useState<boolean>(false);
  const [salesReturnId, setSalesReturnId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const { user: employeeData } = useEmployeeAuth();
  const { user: adminData } = useAdminAuth();

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);

  // ── Effects ───────────────────────────────────────────────────
  useEffect(() => {
    fetchSalesReturns();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, salesReturns, filters]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const saleId = params.get('salesReturnId');
    if (saleId?.trim()) {
      setSalesReturnId(saleId);
      setIsCreditNoteOpen(true);
    }
  }, []);

  // ── Date Range Logic ──────────────────────────────────────────
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (filters.dateRange) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 86400000 - 1) };
      case 'week':
        return { start: startOfWeek, end: new Date(startOfWeek.getTime() + 7 * 86400000 - 1) };
      case 'month':
        return { start: startOfMonth, end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59) };
      case 'custom':
        return {
          start: filters.startDate ? new Date(filters.startDate) : null,
          end: filters.endDate ? new Date(filters.endDate + 'T23:59:59') : null,
        };
      default:
        return { start: null, end: null };
    }
  };

  // ── Helpers ───────────────────────────────────────────────────
  const updateSearchParam = (key: string, value?: string): void => {
    const params = new URLSearchParams(window.location.search);
    if (!value) params.delete(key);
    else params.set(key, value);
    window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
  };

  const handleCloseCreditModal = (): void => {
    setIsCreditNoteOpen(false);
    setSalesReturnId(null);
    updateSearchParam('salesReturnId');
  };

  const fetchSalesReturns = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await salesReturnService.getAllSalesReturns();
      const dataArray: SalesReturn[] =
        Array.isArray(response)
          ? response
          : response?.data && Array.isArray(response.data)
            ? response.data
            : [];
      setSalesReturns(dataArray);
      setFilteredSalesReturns(dataArray);
      setStatistics(salesReturnService.calculateReturnStatistics(dataArray));
    } catch (error: any) {
      console.error('Error fetching sales returns:', error);
      showOperationStatus('error', `Failed to fetch sales returns: ${error.message}`);
      setSalesReturns([]);
      setFilteredSalesReturns([]);
      setStatistics(null);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = useCallback((): void => {
    const list = Array.isArray(salesReturns) ? salesReturns : [];
    const { start, end } = getDateRange();

    const filtered = list.filter((sr) => {
      const searchMatch =
        !searchTerm ||
        sr.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sr.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sr.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sr.items?.some((i) =>
          i.stockout?.stockin?.itemName?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      let dateMatch = true;
      if (filters.dateRange !== 'all' && start && end) {
        const d = new Date(sr.createdAt).getTime();
        dateMatch = d >= start.getTime() && d <= end.getTime();
      }

      const reasonMatch =
        filters.reason === 'all' ||
        (filters.reason === 'no-reason' && !sr.reason) ||
        (filters.reason !== 'no-reason' && sr.reason?.toLowerCase().includes(filters.reason.toLowerCase()));

      return searchMatch && dateMatch && reasonMatch;
    });

    setFilteredSalesReturns(filtered);
    setCurrentPage(1);
  }, [searchTerm, salesReturns, filters]);

  const showOperationStatus = (
    type: OperationStatus['type'],
    message: string,
    duration = 5000
  ): void => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleAddSalesReturn = async (returnData: any): Promise<void> => {
    setIsLoading(true);
    try {
      if (!adminData?.id && !employeeData?.id) throw new Error('User authentication required');
      const requestData = {
        transactionId: returnData.transactionId,
        reason: returnData.reason,
        createdAt: returnData.createdAt,
        items: returnData.items || [],
        adminId: role === 'admin' && adminData?.id ? adminData.id : undefined,
        employeeId: role === 'employee' && employeeData?.id ? employeeData.id : undefined,
      };
      if (!requestData.transactionId) throw new Error('Transaction ID is required');
      if (!requestData.items?.length) throw new Error('At least one item must be provided');
      const response = await salesReturnService.createSalesReturn(requestData);
      updateSearchParam('salesReturnId', response.salesReturn.id);
      setSalesReturnId(response.salesReturn.id);
      setIsCreditNoteOpen(true);
      await fetchSalesReturns();
      setIsAddModalOpen(false);
      showOperationStatus('success', 'Sales return processed successfully!');
    } catch (error: any) {
      const msg =
        error.message.includes('required') ? 'Please fill all required fields' :
          error.message.includes('authentication') ? 'Please log in again' :
            `Failed to process sales return: ${error.message}`;
      showOperationStatus('error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const openViewModal = (sr: SalesReturn): void => {
    setSelectedSalesReturn(sr);
    setIsViewModalOpen(true);
  };

  const formatDate = (dateString: string): string =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getTotalItemsCount = (sr: SalesReturn): number => sr.items?.length || 0;
  const getTotalQuantity = (sr: SalesReturn): number =>
    sr.items?.reduce((s, i) => s + (i.quantity || 0), 0) || 0;
  const getProductNames = (sr: SalesReturn): string => {
    if (!sr.items?.length) return 'No items';
    const names = sr.items
      .map((i) => i.stockout?.stockin?.itemName)
      .filter((n): n is string => !!n)
      .slice(0, 2);
    return sr.items.length > 2
      ? `${names.join(', ')} +${sr.items.length - 2} more`
      : names.join(', ') || 'Unknown';
  };

  // ── Pagination ─────────────────────────────────────────────────
  const safeList = Array.isArray(filteredSalesReturns) ? filteredSalesReturns : [];
  const totalPages = Math.ceil(safeList.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentItems = safeList.slice(startIdx, endIdx);
  const getPageNumbers = (): number[] => {
    const max = 5;
    let start = Math.max(1, currentPage - Math.floor(max / 2));
    let end = Math.min(totalPages, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // ── Sub-Components ─────────────────────────────────────────────
  const StatisticsCards = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        { title: 'Total Returns', value: statistics?.totalReturns ?? 0, icon: RotateCcw, color: 'blue' },
        { title: 'Total Items', value: statistics?.totalItems ?? 0, icon: Package, color: 'green' },
        { title: 'Total Qty', value: statistics?.totalQuantity ?? 0, icon: ShoppingCart, color: 'purple' },
        { title: 'Avg/Return', value: statistics?.averageItemsPerReturn ?? 0, icon: TrendingUp, color: 'orange' },
      ].map((s, i) => (
        <div key={i} className="bg-white rounded shadow p-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 bg-${s.color}-100 rounded-full flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 text-${s.color}-600`} />
            </div>
            <div>
              <p className="text-xs text-gray-600">{s.title}</p>
              <p className="text-lg font-semibold text-gray-900">{s.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const PaginationComponent = () => (
    <div className="flex items-center justify-between py-4 border-t border-gray-200 bg-gray-50 px-6">
      <p className="text-sm text-gray-600">
        Showing {startIdx + 1}–{Math.min(startIdx + itemsPerPage, safeList.length)} of {safeList.length}
      </p>
      <div className="flex gap-2">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
          className="px-3 py-1.5 border rounded disabled:opacity-50 hover:bg-gray-100">
          <ChevronLeft size={16} />
        </button>
        {getPageNumbers().map((p) => (
          <button
            key={p}
            onClick={() => setCurrentPage(p)}
            className={`px-3 py-1.5 rounded ${currentPage === p ? 'bg-primary-600 text-white' : 'border hover:bg-gray-100'}`}
          >
            {p}
          </button>
        ))}
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
          className="px-3 py-1.5 border rounded disabled:opacity-50 hover:bg-gray-100">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  const ActionButtons = ({ sr }: { sr: SalesReturn }) => (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => openViewModal(sr)}
        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
        title="View Details"
      >
        <Eye size={16} />
      </button>
    </div>
  );

  // ── View Renderers ─────────────────────────────────────────────
  const TableView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-gray-600">Date</th>
              <th className="px-5 py-3 text-left font-medium text-gray-600">Transaction ID</th>
              <th className="px-5 py-3 text-left font-medium text-gray-600">Products</th>
              <th className="px-5 py-3 text-right font-medium text-gray-600">Items</th>
              <th className="px-5 py-3 text-right font-medium text-gray-600">Qty</th>
              <th className="px-5 py-3 text-left font-medium text-gray-600 pl-8">Reason</th>
              <th className="px-5 py-3 text-center font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.map((sr) => (
              <tr key={sr.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 text-gray-600 whitespace-nowrap">{formatDate(sr.createdAt).split(',')[0]}</td>
                <td className="px-5 py-4 font-medium text-gray-900">{sr.transactionId || 'N/A'}</td>
                <td className="px-5 py-4 max-w-xs">
                  <span className="text-gray-900 line-clamp-1 text-xs">{getProductNames(sr)}</span>
                </td>
                <td className="px-5 py-4 text-right">{getTotalItemsCount(sr)}</td>
                <td className="px-5 py-4 text-right font-medium">{getTotalQuantity(sr)}</td>
                <td className="px-5 py-4 pl-8">
                  {sr.reason ? (
                    <span className="text-gray-600 line-clamp-1 italic">{sr.reason}</span>
                  ) : (
                    <span className="text-gray-400 italic">No reason</span>
                  )}
                </td>
                <td className="px-5 py-4 text-center">
                  <ActionButtons sr={sr} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationComponent />
    </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {currentItems.map((sr) => (
        <motion.div
          key={sr.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-primary-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-xs truncate">{sr.transactionId || '—'}</p>
                <p className="text-[10px] text-gray-500">{formatDate(sr.createdAt).split(',')[0]}</p>
              </div>
            </div>
            <ActionButtons sr={sr} />
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Items:</span>
              <span className="font-medium text-gray-900">{getTotalItemsCount(sr)} ({getTotalQuantity(sr)} qty)</span>
            </div>
            <div className="text-gray-600 line-clamp-2 min-h-[2rem]">
              {getProductNames(sr)}
            </div>
            {sr.reason && (
              <div className="bg-gray-50 p-2 rounded text-[10px] text-gray-500 italic line-clamp-2">
                "{sr.reason}"
              </div>
            )}
          </div>
        </motion.div>
      ))}
      <div className="col-span-full">
        <PaginationComponent />
      </div>
    </div>
  );

  const ListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
      {currentItems.map((sr) => (
        <motion.div
          key={sr.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-6 py-3 hover:bg-gray-50 flex items-center justify-between"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5 text-primary-600" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{sr.transactionId || '—'}</p>
              <p className="text-xs text-gray-500 truncate">{getProductNames(sr)}</p>
            </div>
          </div>
          <div className="flex items-center gap-8 text-xs text-gray-600 px-4">
            <div className="text-center">
              <p className="font-bold text-gray-900">{getTotalQuantity(sr)}</p>
              <p className="text-[10px]">Qty</p>
            </div>
            <div className="text-right whitespace-nowrap hidden sm:block">
              <p>{formatDate(sr.createdAt).split(',')[0]}</p>
              <p className="text-[10px]">{sr.reason ? 'Return' : 'General'}</p>
            </div>
          </div>
          <ActionButtons sr={sr} />
        </motion.div>
      ))}
      <PaginationComponent />
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-theme-bg-secondary text-xs text-theme-text-primary transition-colors duration-200">
      {/* Toast Notification */}
      <AnimatePresence>
        {operationStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg bg-green-50 border border-green-200 text-green-800 text-sm"
          >
            <Check size={16} />
            <span className="font-medium">{operationStatus.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <CreditNoteComponent
        isOpen={isCreditNoteOpen}
        onClose={handleCloseCreditModal}
        salesReturnId={salesReturnId}
      />

      {/* Header Section */}
      <div className="bg-white shadow-md">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Sales Return Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">Process returns & track inventory movement</p>
            </div>
            {/* View Mode Switcher */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              {[
                { mode: 'table' as ViewMode, icon: List, title: 'Table' },
                { mode: 'grid' as ViewMode, icon: Grid3X3, title: 'Grid' },
                { mode: 'list' as ViewMode, icon: Settings, title: 'List' },
              ].map(({ mode, icon: Icon, title }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2.5 transition-colors ${viewMode === mode ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'}`}
                  title={title}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Statistics Cards */}
        {statistics && <StatisticsCards />}

        {/* Search + Controls */}
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 gap-3">
            <div className="flex items-center space-x-2 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search transaction, reason, product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Date Filter Buttons */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded">
                {(['all', 'today', 'week', 'month', 'custom'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setFilters(prev => ({
                        ...prev,
                        dateRange: opt,
                        startDate: opt !== 'custom' ? '' : prev.startDate,
                        endDate: opt !== 'custom' ? '' : prev.endDate,
                      }));
                    }}
                    className={`px-2 py-1 text-xs font-medium rounded capitalize transition-colors ${filters.dateRange === opt
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    {opt === 'all' ? 'All Time' : opt}
                  </button>
                ))}
              </div>

              {/* Custom Date Inputs */}
              {filters.dateRange === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(p => ({ ...p, startDate: e.target.value }))}
                    className="px-2 py-1 text-xs border border-gray-200 rounded"
                  />
                  <span className="text-gray-500 text-xs text-center">to</span>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(p => ({ ...p, endDate: e.target.value }))}
                    className="px-2 py-1 text-xs border border-gray-200 rounded"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchSalesReturns}
                disabled={isLoading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium"
              >
                <Plus className="w-3 h-3" />
                <span>Process Return</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading / Empty / Views */}
        {isLoading ? (
          <div className="bg-white rounded border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Loading returns...</p>
          </div>
        ) : safeList.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-12 text-center">
            <RotateCcw className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base font-semibold mb-2">No returns found</h3>
            <p className="text-xs text-gray-600 mb-6">
              {searchTerm || filters.dateRange !== 'all' ? 'Try adjusting filters' : 'Start processing your first return'}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary-600 text-white text-xs px-4 py-2 rounded"
            >
              Process First Return
            </button>
          </div>
        ) : (
          <>
            {viewMode === 'table' && <TableView />}
            {viewMode === 'grid' && <GridView />}
            {viewMode === 'list' && <ListView />}
          </>
        )}
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <UpsertSalesReturnModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setSelectedSalesReturn(null);
          }}
          onSubmit={handleAddSalesReturn}
          isLoading={isLoading}
          title="Process Sales Return"
          currentUser={role === 'admin' ? adminData : employeeData}
          userRole={role}
        />
      )}
      {isViewModalOpen && selectedSalesReturn && (
        <ViewSalesReturnModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedSalesReturn(null);
          }}
          salesReturn={selectedSalesReturn}
        />
      )}
    </div>
  );
};

export default SalesReturnManagement;
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Eye,
  Package,
  Hash,
  Check,
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FileText,
  Filter,
  RefreshCw,
  TrendingUp,
  List,
  Grid3X3,
  X,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import salesReturnService, {
  type SalesReturn as ServiceSalesReturn,
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

  const truncateId = (id: string): string => (id ? `${id.substring(0, 8)}...` : 'N/A');
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {[
        { title: 'Total Returns', value: statistics?.totalReturns ?? 0, icon: RotateCcw, color: 'blue' },
        { title: 'Total Items', value: statistics?.totalItems ?? 0, icon: Package, color: 'green' },
        { title: 'Total Qty', value: statistics?.totalQuantity ?? 0, icon: TrendingUp, color: 'orange' },
        { title: 'Avg Items/Return', value: statistics?.averageItemsPerReturn ?? 0, icon: Hash, color: 'purple' },
      ].map((s, i) => (
        <motion.div
          key={s.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{s.title}</p>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            </div>
            <div className={`w-12 h-12 bg-${s.color}-100 rounded-lg flex items-center justify-center`}>
              <s.icon className={`w-6 h-6 text-${s.color}-600`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const PaginationComponent = () => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
      <p className="text-sm text-gray-600">
        Showing {startIdx + 1} to {Math.min(endIdx, safeList.length)} of {safeList.length} entries
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => currentPage > 1 && setCurrentPage(c => c - 1)}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 px-3 py-2 text-sm border rounded-md transition-colors ${
              currentPage === 1
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <ChevronLeft size={16} /> Prev
          </motion.button>
          {getPageNumbers().map((p) => (
            <motion.button
              key={p}
              whileHover={{ scale: 1.05 }}
              onClick={() => setCurrentPage(p)}
              className={`px-3 py-2 text-sm rounded-md transition-colors ${
                currentPage === p
                  ? 'bg-primary-600 text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {p}
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => currentPage < totalPages && setCurrentPage(c => c + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-1 px-3 py-2 text-sm border rounded-md transition-colors ${
              currentPage === totalPages
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Next <ChevronRight size={16} />
          </motion.button>
        </div>
      )}
    </div>
  );

  // ── View Renderers ─────────────────────────────────────────────
  const TableView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentItems.map((sr, idx) => (
            <motion.tr
              key={sr.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hover:bg-gray-50"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {startIdx + idx + 1}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {sr.transactionId || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  <div className="font-medium">{getTotalItemsCount(sr)} items</div>
                  <div className="text-gray-500">{getTotalQuantity(sr)} qty</div>
                </div>
              </td>
              <td className="px-6 py-4 max-w-xs">
                <span className="text-sm text-gray-900 line-clamp-2">{getProductNames(sr)}</span>
              </td>
              <td className="px-6 py-4 max-w-xs">
                {sr.reason ? (
                  <span className="text-sm text-gray-600 line-clamp-2">{sr.reason}</span>
                ) : (
                  <span className="text-sm text-gray-400 italic">No reason</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {formatDate(sr.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => openViewModal(sr)}
                  className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                  title="View"
                >
                  <Eye size={16} />
                </motion.button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
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
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm truncate">{truncateId(sr.id)}</p>
                <p className="text-xs text-gray-500">{sr.transactionId || '—'}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => openViewModal(sr)}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
            >
              <Eye size={16} />
            </motion.button>
          </div>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">{getTotalItemsCount(sr)}</span> items ({getTotalQuantity(sr)} qty)</p>
            <p className="line-clamp-2">{getProductNames(sr)}</p>
            {sr.reason && <p className="text-xs text-gray-500 line-clamp-2">{sr.reason}</p>}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>{formatDate(sr.createdAt)}</span>
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
          className="px-6 py-4 hover:bg-gray-50 flex items-center justify-between"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{sr.transactionId || '—'}</p>
              <p className="text-sm text-gray-500 truncate">{getProductNames(sr)}</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <span>{getTotalItemsCount(sr)} items</span>
            <span>{getTotalQuantity(sr)} qty</span>
            <span>{formatDate(sr.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => openViewModal(sr)}
              className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
            >
              <Eye size={16} />
            </motion.button>
          </div>
        </motion.div>
      ))}
      <PaginationComponent />
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Toast */}
      <AnimatePresence>
        {operationStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50"
          >
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm ${
                operationStatus.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : operationStatus.type === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-primary-50 border border-primary-200 text-primary-800'
              }`}
            >
              {operationStatus.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              <span className="font-medium">{operationStatus.message}</span>
              <motion.button whileHover={{ scale: 1.1 }} onClick={() => setOperationStatus(null)}>
                <X size={14} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CreditNoteComponent
        isOpen={isCreditNoteOpen}
        onClose={handleCloseCreditModal}
        salesReturnId={salesReturnId}
      />

      <div className="mx-auto ">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-lg">
              <RotateCcw className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sales Return Management</h1>
              <p className="text-gray-600">Process returns & track inventory</p>
            </div>
          </div>
          {/* View Mode Switcher */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setViewMode('table')}
              className={`p-2 transition-colors ${
                viewMode === 'table' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:text-primary-600'
              }`}
              title="Table View"
            >
              <List className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:text-primary-600'
              }`}
              title="Grid View"
            >
              <Grid3X3 className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:text-primary-600'
              }`}
              title="List View"
            >
              <Settings className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Stats */}
        {statistics && <StatisticsCards />}

        {/* Search + Controls */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by transaction, reason, ID, or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Date Filter Buttons */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
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
                    className={`px-3 py-1.5 text-xs font-medium rounded capitalize transition-colors ${
                      filters.dateRange === opt
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
                    className="px-3 py-1.5 text-xs border rounded"
                  />
                  <span className="text-gray-500 text-sm">to</span>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(p => ({ ...p, endDate: e.target.value }))}
                    className="px-3 py-1.5 text-xs border rounded"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={fetchSalesReturns}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} /> Refresh
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm"
              >
                <Plus size={20} /> Process Return
              </motion.button>
            </div>
          </div>
        </div>

        {/* Loading / Empty */}
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Loading sales returns…</p>
          </div>
        ) : safeList.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <RotateCcw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No returns found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filters.dateRange !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'No returns have been processed yet.'}
            </p>
            {!searchTerm && filters.dateRange === 'all' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                <Plus size={20} /> Process First Return
              </motion.button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'table' && <TableView />}
            {viewMode === 'grid' && <GridView />}
            {viewMode === 'list' && <ListView />}
          </>
        )}

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
    </div>
  );
};

export default SalesReturnManagement;
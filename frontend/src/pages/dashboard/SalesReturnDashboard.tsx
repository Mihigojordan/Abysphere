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
import { useLanguage } from '../../context/LanguageContext';

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
  const { t } = useLanguage();

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
      showOperationStatus('error', `${t('salesReturn.fetchError')}: ${error.message}`);
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
      if (!adminData?.id && !employeeData?.id) throw new Error(t('salesReturn.authRequired'));
      const requestData = {
        transactionId: returnData.transactionId,
        reason: returnData.reason,
        createdAt: returnData.createdAt,
        items: returnData.items || [],
        adminId: role === 'admin' && adminData?.id ? adminData.id : undefined,
        employeeId: role === 'employee' && employeeData?.id ? employeeData.id : undefined,
      };
      if (!requestData.transactionId) throw new Error(t('salesReturn.transactionIdRequired'));
      if (!requestData.items?.length) throw new Error(t('salesReturn.itemRequired'));
      const response = await salesReturnService.createSalesReturn(requestData);
      updateSearchParam('salesReturnId', response.salesReturn.id);
      setSalesReturnId(response.salesReturn.id);
      setIsCreditNoteOpen(true);
      await fetchSalesReturns();
      setIsAddModalOpen(false);
      showOperationStatus('success', t('salesReturn.success'));
    } catch (error: any) {
      const msg =
        error.message.includes('required') ? t('salesReturn.fillFields') :
          error.message.includes('authentication') ? t('salesReturn.loginAgain') :
            `${t('salesReturn.error')}: ${error.message}`;
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {[
        { title: t('salesReturn.totalReturns'), value: statistics?.totalReturns ?? 0, icon: RotateCcw, color: 'primary' },
        { title: t('salesReturn.totalItems'), value: statistics?.totalItems ?? 0, icon: Package, color: 'emerald' },
        { title: t('salesReturn.totalQty'), value: statistics?.totalQuantity ?? 0, icon: ShoppingCart, color: 'amber' },
      ].map((s, i) => (
        <div key={i} className="bg-theme-bg-primary rounded border border-theme-border p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className={`p-3 bg-${s.color}-500/10 rounded-full flex items-center justify-center`}>
              <s.icon className={`w-5 h-5 text-${s.color}-600`} />
            </div>
            <div>
              <p className="text-[10px] text-theme-text-secondary">{s.title}</p>
              <p className="text-lg font-semibold text-theme-text-primary">{s.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const PaginationComponent = () => (
    <div className="flex items-center justify-between py-3 border-t border-theme-border bg-theme-bg-secondary px-6">
      <p className="text-[10px] text-theme-text-secondary">
        Showing {startIdx + 1}–{Math.min(startIdx + itemsPerPage, safeList.length)} of {safeList.length}
      </p>
      <div className="flex gap-2">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
          className="p-1.5 border border-theme-border rounded bg-theme-bg-primary text-theme-text-primary disabled:opacity-50 hover:bg-theme-bg-tertiary transition-colors">
          <ChevronLeft size={14} />
        </button>
        {getPageNumbers().map((p) => (
          <button
            key={p}
            onClick={() => setCurrentPage(p)}
            className={`px-3 py-1 text-[10px] font-medium rounded transition-all ${currentPage === p ? 'bg-primary-600 text-white shadow-sm' : 'border border-theme-border bg-theme-bg-primary text-theme-text-primary hover:bg-theme-bg-tertiary'}`}
          >
            {p}
          </button>
        ))}
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
          className="p-1.5 border border-theme-border rounded bg-theme-bg-primary text-theme-text-primary disabled:opacity-50 hover:bg-theme-bg-tertiary transition-colors">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );

  const ActionButtons = ({ sr }: { sr: SalesReturn }) => (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => openViewModal(sr)}
        className="p-1.5 text-theme-text-secondary hover:text-primary-600 hover:bg-primary-500/10 rounded transition-colors"
        title={t('salesReturn.viewDetails')}
      >
        <Eye size={14} />
      </button>
    </div>
  );

  // ── View Renderers ─────────────────────────────────────────────
  const TableView = () => (
    <div className="bg-theme-bg-primary rounded border border-theme-border overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead className="bg-theme-bg-secondary border-b border-theme-border">
            <tr>
              <th className="px-5 py-2.5 text-left font-semibold text-theme-text-secondary uppercase tracking-wider">{t('salesReturn.date')}</th>
              <th className="px-5 py-2.5 text-left font-semibold text-theme-text-secondary uppercase tracking-wider">{t('salesReturn.transactionId')}</th>
              <th className="px-5 py-2.5 text-left font-semibold text-theme-text-secondary uppercase tracking-wider">{t('salesReturn.products')}</th>
              <th className="px-5 py-2.5 text-right font-semibold text-theme-text-secondary uppercase tracking-wider">{t('salesReturn.items')}</th>
              <th className="px-5 py-2.5 text-right font-semibold text-theme-text-secondary uppercase tracking-wider">{t('salesReturn.qty')}</th>
              <th className="px-5 py-2.5 text-left font-semibold text-theme-text-secondary uppercase tracking-wider pl-8">{t('salesReturn.reason')}</th>
              <th className="px-5 py-2.5 text-center font-semibold text-theme-text-secondary uppercase tracking-wider">{t('salesReturn.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border">
            {currentItems.map((sr) => (
              <tr key={sr.id} className="hover:bg-theme-bg-tertiary transition-colors">
                <td className="px-5 py-3 text-theme-text-secondary whitespace-nowrap">{formatDate(sr.createdAt).split(',')[0]}</td>
                <td className="px-5 py-3 font-medium text-theme-text-primary">{sr.transactionId || 'N/A'}</td>
                <td className="px-5 py-3 max-w-xs">
                  <span className="text-theme-text-primary line-clamp-1">{getProductNames(sr)}</span>
                </td>
                <td className="px-5 py-3 text-right text-theme-text-primary">{getTotalItemsCount(sr)}</td>
                <td className="px-5 py-3 text-right font-medium text-theme-text-primary">{getTotalQuantity(sr)}</td>
                <td className="px-5 py-3 pl-8">
                  {sr.reason ? (
                    <span className="text-theme-text-secondary line-clamp-1 italic">{sr.reason}</span>
                  ) : (
                    <span className="text-theme-text-tertiary italic">{t('salesReturn.noReason')}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-center">
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-theme-bg-primary rounded border border-theme-border p-4 hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-500/10 rounded-full flex items-center justify-center">
                <RotateCcw className="w-4 h-4 text-primary-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-theme-text-primary text-[11px] truncate">{sr.transactionId || '—'}</p>
                <p className="text-[10px] text-theme-text-secondary">{formatDate(sr.createdAt).split(',')[0]}</p>
              </div>
            </div>
            <ActionButtons sr={sr} />
          </div>
          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between border-b border-theme-border/50 pb-2">
              <span className="text-theme-text-secondary">{t('salesReturn.items')}:</span>
              <span className="font-semibold text-theme-text-primary">{getTotalItemsCount(sr)} ({getTotalQuantity(sr)} {t('salesReturn.qty')})</span>
            </div>
            <div className="text-theme-text-secondary line-clamp-2 min-h-[2.5rem] py-1">
              {getProductNames(sr)}
            </div>
            {sr.reason && (
              <div className="bg-theme-bg-secondary p-2 rounded text-[10px] text-theme-text-secondary italic line-clamp-2 border border-theme-border/50">
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
    <div className="bg-theme-bg-primary rounded border border-theme-border divide-y divide-theme-border shadow-sm">
      {currentItems.map((sr) => (
        <motion.div
          key={sr.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-6 py-3 hover:bg-theme-bg-tertiary flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-9 h-9 bg-primary-500/10 rounded-full flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-4 h-4 text-primary-600" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-theme-text-primary text-xs truncate">{sr.transactionId || '—'}</p>
              <p className="text-[10px] text-theme-text-secondary truncate">{getProductNames(sr)}</p>
            </div>
          </div>
          <div className="flex items-center gap-8 text-[10px] text-theme-text-secondary px-4">
            <div className="text-center">
              <p className="font-bold text-theme-text-primary">{getTotalQuantity(sr)}</p>
              <p className="text-[9px] uppercase tracking-wider">{t('salesReturn.qty')}</p>
            </div>
            <div className="text-right whitespace-nowrap hidden sm:block">
              <p className="text-theme-text-primary font-medium">{formatDate(sr.createdAt).split(',')[0]}</p>
              <p className="text-[9px] uppercase tracking-wider">{sr.reason ? t('salesReturn.return') : t('salesReturn.general')}</p>
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
    <div className="min-h-screen bg-theme-bg-secondary text-[10px] text-theme-text-primary">
      {/* Toast Notification */}
      <AnimatePresence>
        {operationStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded border shadow-xl ${operationStatus.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                : operationStatus.type === 'error'
                  ? 'bg-red-500/10 border-red-500/20 text-red-500'
                  : 'bg-primary-500/10 border-primary-500/20 text-primary-500'
              }`}
          >
            {operationStatus.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
            <span className="font-semibold text-xs">{operationStatus.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <CreditNoteComponent
        isOpen={isCreditNoteOpen}
        onClose={handleCloseCreditModal}
        salesReturnId={salesReturnId}
      />

      {/* Header Section */}
      <div className="bg-theme-bg-primary border-b border-theme-border sticky top-0 z-30 shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-bold text-theme-text-primary">{t('salesReturn.title')}</h1>
              <p className="text-[10px] text-theme-text-secondary mt-0.5">{t('salesReturn.subtitle')}</p>
            </div>
            {/* View Mode Switcher */}
            <div className="flex items-center bg-theme-bg-secondary border border-theme-border rounded overflow-hidden">
              {[
                { mode: 'table' as ViewMode, icon: List, title: t('salesReturn.tableView') },
                { mode: 'grid' as ViewMode, icon: Grid3X3, title: t('salesReturn.gridView') },
                { mode: 'list' as ViewMode, icon: Settings, title: t('salesReturn.listView') },
              ].map(({ mode, icon: Icon, title }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`p-2 transition-all ${viewMode === mode ? 'bg-primary-600 text-white' : 'text-theme-text-secondary hover:bg-theme-bg-tertiary'}`}
                  title={title}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-4 space-y-4 max-w-[1600px] mx-auto">
        {/* Statistics Cards */}
        {statistics && <StatisticsCards />}

        {/* Search + Controls */}
        <div className="bg-theme-bg-primary rounded border border-theme-border p-3 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="w-3 h-3 text-theme-text-secondary absolute left-2 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('salesReturn.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-48 pl-7 pr-3 py-1.5 text-[10px] bg-theme-bg-secondary border border-theme-border rounded text-theme-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-theme-text-tertiary"
                />
              </div>

              {/* Date Filter Buttons */}
              <div className="flex gap-1 bg-theme-bg-secondary p-1 rounded border border-theme-border">
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
                    className={`px-2 py-1 text-[10px] font-medium rounded capitalize transition-all ${filters.dateRange === opt
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary'
                      }`}
                  >
                    {opt === 'all' ? t('stockIn.allTime') :
                      opt === 'today' ? t('stockIn.today') :
                        opt === 'week' ? t('stockIn.week') :
                          opt === 'month' ? t('stockIn.month') : t('stockIn.custom')}
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
                    className="px-2 py-1 text-[10px] bg-theme-bg-secondary border border-theme-border text-theme-text-primary rounded focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                  <span className="text-theme-text-secondary text-[10px]">{t('stockIn.to')}</span>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(p => ({ ...p, endDate: e.target.value }))}
                    className="px-2 py-1 text-[10px] bg-theme-bg-secondary border border-theme-border text-theme-text-primary rounded focus:ring-1 focus:ring-primary-500 outline-none"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={fetchSalesReturns}
                disabled={isLoading}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-1 px-4 py-2 text-theme-text-secondary border border-theme-border rounded bg-theme-bg-primary hover:bg-theme-bg-tertiary disabled:opacity-50 transition-colors"
                title={t('salesReturn.refresh')}
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="font-semibold text-[10px] uppercase tracking-wider">{t('salesReturn.refresh')}</span>
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-3 h-3" />
                <span className="font-semibold text-[10px] uppercase tracking-wider">{t('salesReturn.processReturn')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading / Empty / Views */}
        {isLoading ? (
          <div className="bg-theme-bg-primary rounded border border-theme-border p-12 text-center shadow-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent mb-4"></div>
            <p className="text-theme-text-secondary text-[11px]">{t('salesReturn.loading')}</p>
          </div>
        ) : safeList.length === 0 ? (
          <div className="bg-theme-bg-primary rounded border border-theme-border p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-theme-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-theme-border">
              <RotateCcw className="w-8 h-8 text-theme-text-tertiary" />
            </div>
            <h3 className="text-sm font-bold text-theme-text-primary mb-2">{t('salesReturn.noReturnsFound')}</h3>
            <p className="text-[10px] text-theme-text-secondary max-w-xs mx-auto mb-6">
              {searchTerm || filters.dateRange !== 'all' ? t('salesReturn.adjustFilters') : t('salesReturn.startProcessing')}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white text-[10px] font-semibold uppercase tracking-widest px-6 py-2.5 rounded shadow-sm transition-all"
            >
              {t('salesReturn.processFirst')}
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {viewMode === 'table' && <TableView />}
            {viewMode === 'grid' && <GridView />}
            {viewMode === 'list' && <ListView />}
          </motion.div>
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
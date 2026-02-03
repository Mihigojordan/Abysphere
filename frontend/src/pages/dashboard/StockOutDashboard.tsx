import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit3,
  Eye,
  ShoppingCart,
  DollarSign,
  Package,
  CreditCard,
  TrendingUp,
  Check,
  AlertTriangle,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  List,
  Grid3X3,
  Table as TableIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import stockOutService from '../../services/stockoutService';
import stockInService from '../../services/stockService';
import UpsertStockOutModal from '../../components/dashboard/stock/out/UpsertStockOutModal';
import useEmployeeAuth from '../../context/EmployeeAuthContext';
import useAdminAuth from '../../context/AdminAuthContext';
import InvoiceComponent from '../../components/dashboard/stock/out/InvoiceComponent';

// ── Types ─────────────────────────────────────────────────────
interface StockIn {
  id: number;
  sku: string;
  itemName: string;
  product?: { productName: string; brand?: string };
  unitOfMeasure: string;
  receivedQuantity: number;
  unitCost?: number;
  warehouseLocation: string;
}

interface StockOut {
  id: string;
  stockinId: number;
  quantity: number;
  soldPrice: number;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
  stockin?: {
    itemName: string;
    sku: string;
    product?: { productName: string; brand?: string };
  };
}

interface Filters {
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  startDate: string;
  endDate: string;
}

type ViewMode = 'table' | 'grid' | 'list';

const StockOutManagement: React.FC<{ role: 'admin' | 'employee' }> = ({ role }) => {
  const [stockOuts, setStockOuts] = useState<StockOut[]>([]);
  const [filteredStockOuts, setFilteredStockOuts] = useState<StockOut[]>([]);
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStockOut, setSelectedStockOut] = useState<StockOut | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [filters, setFilters] = useState<Filters>({
    dateRange: 'all',
    startDate: '',
    endDate: '',
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { user: employeeData } = useEmployeeAuth();
  const { user: adminData } = useAdminAuth();

  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalTransactions: 0,
    averageOrderValue: 0,
    todaySales: 0,
    todayRevenue: 0,
  });

  // ── Fetch Data ───────────────────────────────────────────────
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [searchTerm, stockOuts, filters]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trId = params.get('transactionId');
    if (trId) {
      setTransactionId(trId);
      setIsInvoiceOpen(true);
    }
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [outs, ins] = await Promise.all([
        stockOutService.getAllStockOuts(),
        stockInService.getAllStocks(),
      ]);
      setStockOuts(outs);
      setFilteredStockOuts(outs);
      setStockIns(Array.isArray(ins) ? ins : []);
      calculateStats(outs);
    } catch (err: any) {
      showNotification(`Failed to load data: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Stats & Filters ──────────────────────────────────────────
  const calculateStats = (data: StockOut[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalSales = data.reduce((sum, item) => sum + item.quantity, 0);
    const totalRevenue = data.reduce((sum, item) => sum + item.quantity * item.soldPrice, 0);
    const totalTransactions = data.length;
    const averageOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const todayData = data.filter((item) => {
      const itemDate = new Date(item.createdAt);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === today.getTime();
    });

    const todaySales = todayData.reduce((sum, item) => sum + item.quantity, 0);
    const todayRevenue = todayData.reduce((sum, item) => sum + item.quantity * item.soldPrice, 0);

    setStats({
      totalSales,
      totalRevenue,
      totalTransactions,
      averageOrderValue,
      todaySales,
      todayRevenue,
    });
  };

  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (filters.dateRange) {
      case 'today': return { start: today, end: new Date(today.getTime() + 86400000 - 1) };
      case 'week': return { start: startOfWeek, end: new Date(startOfWeek.getTime() + 7 * 86400000 - 1) };
      case 'month': return { start: startOfMonth, end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59) };
      case 'custom':
        return {
          start: filters.startDate ? new Date(filters.startDate) : null,
          end: filters.endDate ? new Date(filters.endDate + 'T23:59:59') : null,
        };
      default: return { start: null, end: null };
    }
  };

  const applyFiltersAndSearch = useCallback(() => {
    const { start, end } = getDateRange();

    const filtered = stockOuts.filter(item => {
      const searchMatch =
        !searchTerm ||
        item.stockin?.product?.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.stockin?.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.clientPhone?.includes(searchTerm) ||
        item.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());

      let dateMatch = true;
      if (filters.dateRange !== 'all' && start && end) {
        const itemDate = new Date(item.createdAt).getTime();
        dateMatch = itemDate >= start.getTime() && itemDate <= end.getTime();
      }

      return searchMatch && dateMatch;
    });

    setFilteredStockOuts(filtered);
    setCurrentPage(1);
  }, [searchTerm, stockOuts, filters]);

  // ── Helpers ──────────────────────────────────────────────────
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const updateSearchParam = (key: string, value?: string) => {
    const params = new URLSearchParams(window.location.search);
    if (!value) params.delete(key);
    else params.set(key, value);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  const handleCloseInvoice = () => {
    setIsInvoiceOpen(false);
    setTransactionId(null);
    updateSearchParam('transactionId');
  };

  const openEditModal = (stockOut: StockOut) => {
    setSelectedStockOut(stockOut);
    setIsAddModalOpen(true);
  };

  // Unified Create & Edit Handler
  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const userInfo: any = {};
      if (role === 'admin') userInfo.adminId = adminData?.id;
      if (role === 'employee') userInfo.employeeId = employeeData?.id;

      let response;

      if (selectedStockOut) {
        // EDIT EXISTING SALE
        await stockOutService.updateStockOut(selectedStockOut.id, { ...data, ...userInfo });
        showNotification('Sale updated successfully!', 'success');
      } else if (data.salesArray?.length > 0) {
        // MULTIPLE ITEMS
        response = await stockOutService.createMultipleStockOut(data.salesArray, data.clientInfo || {}, userInfo);
        showNotification(`Sale of ${data.salesArray.length} items recorded!`, 'success');
      } else {
        // SINGLE ITEM
        response = await stockOutService.createStockOut({ ...data, ...userInfo });
        showNotification('Sale recorded successfully!', 'success');
      }

      if (response?.transactionId && !selectedStockOut) {
        updateSearchParam('transactionId', response.transactionId);
        setTransactionId(response.transactionId);
        setIsInvoiceOpen(true);
      }

      await fetchData();
      setIsAddModalOpen(false);
      setSelectedStockOut(null);
    } catch (err: any) {
      showNotification(`Error: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(price || 0);

  // Pagination
  const totalPages = Math.ceil(filteredStockOuts.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const currentItems = filteredStockOuts.slice(startIdx, startIdx + itemsPerPage);

  // Sub-Components
  const ViewModeSwitcher = () => (
    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
      {[
        { mode: 'table' as ViewMode, icon: TableIcon, title: 'Table' },
        { mode: 'grid' as ViewMode, icon: Grid3X3, title: 'Grid' },
        { mode: 'list' as ViewMode, icon: List, title: 'List' },
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
  );

  const StatsCard = ({ title, value, icon, color }: any) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded ${color}`}>{icon}</div>
      </div>
      <p className="text-xs text-gray-600 font-medium">{title}</p>
      <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );

  const ActionButtons = ({ item }: { item: StockOut }) => (
    <div className="flex items-center gap-3">
      <button onClick={() => openEditModal(item)} className="text-amber-600 hover:text-amber-700">
        <Edit3 size={16} />
      </button>
      <button className="text-gray-500 hover:text-primary-600">
        <Eye size={16} />
      </button>
    </div>
  );

  const TableView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-gray-600">Date</th>
              <th className="px-5 py-3 text-left font-medium text-gray-600">Product</th>
              <th className="px-5 py-3 text-left font-medium text-gray-600">Client</th>
              <th className="px-5 py-3 text-right font-medium text-gray-600">Qty</th>
              <th className="px-5 py-3 text-right font-medium text-gray-600">Price</th>
              <th className="px-5 py-3 text-right font-medium text-gray-600">Total</th>
              <th className="px-5 py-3 text-center font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 text-gray-600">{formatDate(item.createdAt)}</td>
                <td className="px-5 py-4">
                  <div className="font-medium">{item.stockin?.product?.productName || item.stockin?.itemName}</div>
                  <div className="text-xs text-gray-500">{item.stockin?.sku}</div>
                </td>
                <td className="px-5 py-4 text-gray-700">{item.clientName || 'Walk-in'}</td>
                <td className="px-5 py-4 text-right font-medium">{item.quantity}</td>
                <td className="px-5 py-4 text-right">{formatPrice(item.soldPrice)}</td>
                <td className="px-5 py-4 text-right font-bold text-green-600">{formatPrice(item.soldPrice * item.quantity)}</td>
                <td className="px-5 py-4 text-center">
                  <ActionButtons item={item} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination />
    </div>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {currentItems.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-full flex-center">
                <ShoppingCart size={18} className="text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 truncate">{item.stockin?.product?.productName || item.stockin?.itemName}</p>
                <p className="text-xs text-gray-500">{item.transactionId || '—'}</p>
              </div>
            </div>
            <ActionButtons item={item} />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Qty:</span>
              <span className="font-medium">{item.quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price:</span>
              <span>{formatPrice(item.soldPrice)}</span>
            </div>
            <div className="flex justify-between font-bold text-green-600">
              <span>Total:</span>
              <span>{formatPrice(item.soldPrice * item.quantity)}</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
            <span>{item.clientName || 'Walk-in'}</span>
            <span>{formatDate(item.createdAt)}</span>
          </div>
        </motion.div>
      ))}
      <div className="col-span-full"><Pagination /></div>
    </div>
  );

  const ListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
      {currentItems.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="w-10 h-10 bg-primary-50 rounded-full flex-center flex-shrink-0">
              <ShoppingCart size={18} className="text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{item.stockin?.product?.productName || item.stockin?.itemName}</p>
              <p className="text-sm text-gray-500 truncate">{item.clientName || 'Walk-in'} • {formatDate(item.createdAt)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-green-600">{formatPrice(item.soldPrice * item.quantity)}</p>
            <p className="text-xs text-gray-500">{item.quantity} × {formatPrice(item.soldPrice)}</p>
          </div>
          <ActionButtons item={item} />
        </motion.div>
      ))}
      <Pagination />
    </div>
  );

  const Pagination = () => (
    <div className="flex items-center justify-between py-4 border-t border-gray-200 bg-gray-50 px-6">
      <p className="text-sm text-gray-600">
        Showing {startIdx + 1}–{Math.min(startIdx + itemsPerPage, filteredStockOuts.length)} of {filteredStockOuts.length}
      </p>
      <div className="flex gap-2">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
          className="px-3 py-1.5 border rounded disabled:opacity-50 hover:bg-gray-100">
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const page = i + Math.max(1, currentPage - 2);
          if (page > totalPages) return null;
          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1.5 rounded ${currentPage === page ? 'bg-primary-600 text-white' : 'border hover:bg-gray-100'}`}
            >
              {page}
            </button>
          );
        })}
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
          className="px-3 py-1.5 border rounded disabled:opacity-50 hover:bg-gray-100">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg text-white text-sm font-medium bg-green-600"
          >
            <Check size={18} />
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      <InvoiceComponent isOpen={isInvoiceOpen} onClose={handleCloseInvoice} transactionId={transactionId} />

      <div className="mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-600 rounded-xl">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stock Out Management</h1>
              <p className="text-gray-600">Record sales & track inventory movement</p>
            </div>
          </div>
          <ViewModeSwitcher />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatsCard title="Total Revenue" value={formatPrice(stats.totalRevenue)} icon={<DollarSign size={18} className="text-white" />} color="bg-green-500" />
          <StatsCard title="Units Sold" value={stats.totalSales} icon={<Package size={18} className="text-white" />} color="bg-blue-500" />
          <StatsCard title="Transactions" value={stats.totalTransactions} icon={<CreditCard size={18} className="text-white" />} color="bg-purple-500" />
          <StatsCard title="Avg Order" value={formatPrice(stats.averageOrderValue)} icon={<TrendingUp size={18} className="text-white" />} color="bg-orange-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs font-medium text-blue-900">Today's Sales</p>
            <p className="text-xl font-bold text-blue-700 mt-1">{stats.todaySales} units</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-xs font-medium text-green-900">Today's Revenue</p>
            <p className="text-xl font-bold text-green-700 mt-1">{formatPrice(stats.todayRevenue)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search product, client, phone, transaction..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                {(['all', 'today', 'week', 'month', 'custom'] as const).map(opt => (
                  <button
                    key={opt}
                    onClick={() => setFilters(p => ({
                      ...p,
                      dateRange: opt,
                      startDate: opt !== 'custom' ? '' : p.startDate,
                      endDate: opt !== 'custom' ? '' : p.endDate,
                    }))}
                    className={`px-4 py-2 text-sm font-medium rounded capitalize transition-colors
                      ${filters.dateRange === opt ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'}`}
                  >
                    {opt === 'all' ? 'All Time' : opt}
                  </button>
                ))}
              </div>

              {filters.dateRange === 'custom' && (
                <div className="flex items-center gap-2">
                  <input type="date" value={filters.startDate} onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))} className="px-3 py-2 border rounded" />
                  <span className="text-gray-500">to</span>
                  <input type="date" value={filters.endDate} onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))} className="px-3 py-2 border rounded" />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={fetchData} disabled={isLoading}
                className="flex items-center gap-2 px-5 py-2.5 border rounded-lg hover:bg-gray-50 disabled:opacity-50">
                <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} /> Refresh
              </button>
              <button
                onClick={() => { setSelectedStockOut(null); setIsAddModalOpen(true); }}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm"
              >
                <Plus size={20} /> Record Sale
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-4 border-primary-600 mb-4"></div>
            <p>Loading sales...</p>
          </div>
        ) : filteredStockOuts.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center border">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No sales found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filters.dateRange !== 'all' ? 'Try adjusting filters' : 'Start recording your first sale'}
            </p>
            <button onClick={() => { setSelectedStockOut(null); setIsAddModalOpen(true); }} className="bg-primary-600 text-white px-6 py-3 rounded-lg">
              Record First Sale
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

      <UpsertStockOutModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedStockOut(null);
        }}
        onSubmit={handleSubmit}
        stockOut={selectedStockOut}
        stockIns={stockIns}
        isLoading={isLoading}
        title={selectedStockOut ? 'Edit Sale' : 'New Sale'}
      />
    </div>
  );
};

export default StockOutManagement;
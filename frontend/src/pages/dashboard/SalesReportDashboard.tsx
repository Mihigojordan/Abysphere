import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit3,
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
  LayoutGrid,
  Table as TableIcon,
  List,
} from 'lucide-react';

import stockOutService from '../../services/stockoutService';
import stockInService from '../../services/stockService';
import UpsertStockOutModal from '../../components/dashboard/stock/out/UpsertStockOutModal';
import useEmployeeAuth from '../../context/EmployeeAuthContext';
import useAdminAuth from '../../context/AdminAuthContext';
import InvoiceComponent from '../../components/dashboard/stock/out/InvoiceComponent';

// Types (unchanged)
interface StockIn { /* ... */ }
interface StockOut { /* ... */ }
interface Stats { /* ... */ }

type ViewMode = 'table' | 'grid' | 'list';

const StockOutManagement: React.FC<{ role: 'admin' | 'employee' }> = ({ role }) => {
  const [stockOuts, setStockOuts] = useState<StockOut[]>([]);
  const [filteredStockOuts, setFilteredStockOuts] = useState<StockOut[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStockOut, setSelectedStockOut] = useState<StockOut | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isInvoiceNoteOpen, setIsInvoiceNoteOpen] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  // New: View Mode State
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // Good for grid/list

  // Stats & Auth
  const [stats, setStats] = useState<Stats>({ totalSales: 0, totalRevenue: 0, totalTransactions: 0, averageOrderValue: 0, todaySales: 0, todayRevenue: 0 });
  const { user: employeeData } = useEmployeeAuth();
  const { user: adminData } = useAdminAuth();

  // Fetch + Search + Stats (unchanged logic)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [stockOutData, stockInData] = await Promise.all([
          stockOutService.getAllStockOuts(),
          stockInService.getAllStocks(),
        ]);
        setStockOuts(stockOutData);
        setFilteredStockOuts(stockOutData);
        calculateStats(stockOutData);
      } catch (error: any) {
        showNotification(`Failed to fetch data: ${error.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = stockOuts.filter(item =>
      [item.stockin?.product?.productName, item.stockin?.itemName, item.stockin?.sku, item.clientName, item.clientPhone, item.transactionId]
        .some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredStockOuts(filtered);
    setCurrentPage(1);
  }, [searchTerm, stockOuts]);

  // Pagination
  const totalPages = Math.ceil(filteredStockOuts.length / itemsPerPage);
  const currentItems = filteredStockOuts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const calculateStats = (data: StockOut[]) => { /* unchanged */ };
  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => { /* unchanged */ };
  const formatPrice = (price: number) => new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF', maximumFractionDigits: 0 }).format(price || 0);
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  // View Mode Toggle Buttons
  const ViewToggle = () => (
    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
      {[
        { mode: 'table' as ViewMode, icon: TableIcon, label: 'Table' },
        { mode: 'grid' as ViewMode, icon: LayoutGrid, label: 'Grid' },
        { mode: 'list' as ViewMode, icon: List, label: 'List' },
      ].map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all ${
            viewMode === mode
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title={label}
        >
          <Icon size={14} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );

  // === 1. Table View (Desktop Default) ===
  const TableView = () => (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Product</th>
              <th className="px-4 py-3 text-left">Client</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary-100 rounded flex-center"><ShoppingCart size={14} className="text-primary-600" /></div>
                    <div>
                      <div className="font-medium">{item.stockin?.product?.productName || item.stockin?.itemName}</div>
                      <div className="text-xs text-gray-500">{item.stockin?.sku}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-700">{item.clientName || '—'}</td>
                <td className="px-4 py-3 text-right font-medium">{item.quantity}</td>
                <td className="px-4 py-3 text-right">{formatPrice(item.soldPrice)}</td>
                <td className="px-4 py-3 text-right font-medium">{formatPrice(item.soldPrice * item.quantity)}</td>
                <td className="px-4 py-3 text-gray-600 text-xs">{formatDate(item.createdAt)}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => { setSelectedStockOut(item); setIsEditModalOpen(true); }} className="text-blue-600 hover:text-blue-800">
                    <Edit3 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // === 2. Grid View (Cards) ===
  const GridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {currentItems.map((item) => (
        <div key={item.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex-center"><ShoppingCart size={16} className="text-primary-600" /></div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  {item.stockin?.product?.productName || item.stockin?.itemName}
                </h3>
                <p className="text-xs text-gray-500">{item.stockin?.sku}</p>
              </div>
            </div>
            <button onClick={() => { setSelectedStockOut(item); setIsEditModalOpen(true); }} className="text-gray-500 hover:text-blue-600">
              <Edit3 size={16} />
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-gray-600">Client:</span> <span className="font-medium">{item.clientName || 'Walk-in'}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Qty:</span> <strong>{item.quantity}</strong></div>
            <div className="flex justify-between"><span className="text-gray-600">Total:</span> <strong className="text-green-600">{formatPrice(item.soldPrice * item.quantity)}</strong></div>
            <div className="text-gray-500 text-xs pt-1 border-t">{formatDate(item.createdAt)}</div>
          </div>
        </div>
      ))}
    </div>
  );

  // === 3. List View (Compact Mobile) ===
  const ListView = () => (
    <div className="space-y-3">
      {currentItems.map((item) => (
        <div key={item.id} className="bg-white rounded-lg border p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex-center flex-shrink-0"><ShoppingCart size={16} className="text-primary-600" /></div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">
                {item.stockin?.product?.productName || item.stockin?.itemName}
              </h4>
              <div className="text-xs text-gray-500 space-y-1 mt-1">
                <div>{item.clientName ? `${item.clientName} • ` : ''}{item.quantity} × {formatPrice(item.soldPrice)}</div>
                <div>{formatDate(item.createdAt)}</div>
              </div>
            </div>
          </div>
          <div className="text-right ml-3">
            <div className="font-bold text-green-600">{formatPrice(item.soldPrice * item.quantity)}</div>
            <button onClick={() => { setSelectedStockOut(item); setIsEditModalOpen(true); }} className="mt-2 text-blue-600">
              <Edit3 size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // Pagination Component (shared)
  const Pagination = () => (
    <div className="flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 rounded-lg text-sm">
      <p className="text-gray-600">Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredStockOuts.length)} of {filteredStockOuts.length}</p>
      <div className="flex items-center gap-2">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded hover:bg-white disabled:opacity-50"><ChevronLeft size={16} /></button>
        <span className="px-3">{currentPage} / {totalPages || 1}</span>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages || 1, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded hover:bg-white disabled:opacity-50"><ChevronRight size={16} /></button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
      {notification && /* notification toast */}
      <InvoiceComponent isOpen={isInvoiceNoteOpen} onClose={() => { setIsInvoiceNoteOpen(false); setTransactionId(null); }} transactionId={transactionId} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-lg"><ShoppingCart className="w-6 h-6 text-white" /></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Stock Out Management</h1>
              <p className="text-sm text-gray-600">Record and track all sales</p>
            </div>
          </div>

          {/* View Toggle + Add Button */}
          <div className="flex items-center gap-3">
            <ViewToggle />
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-lg font-medium">
              <Plus size={16} /> Record Sale
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Your existing StatsCard components */}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search product, client, phone, transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600"></div>
          </div>
        ) : filteredStockOuts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No sales yet. Record your first sale!</p>
          </div>
        ) : (
          <>
            {/* Conditional Rendering Based on View Mode */}
            {viewMode === 'table' && <TableView />}
            {viewMode === 'grid' && <GridView />}
            {viewMode === 'list' && <ListView />}

            {filteredStockOuts.length > itemsPerPage && <Pagination />}
          </>
        )}

        {/* Modals */}
        <UpsertStockOutModal /* ...unchanged */ />
      </div>
    </div>
  );
};

export default StockOutManagement;
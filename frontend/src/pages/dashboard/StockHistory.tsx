import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Calendar, Download, ArrowLeft, RefreshCw, CheckCircle, XCircle, AlertCircle, X, ChevronLeft, ChevronRight, Filter, Search, ArrowUpCircle, ArrowDownCircle, Settings } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import stockService, { type Stock, type StockHistoryRecord } from '../../services/stockService';
import { useSocketEvent } from '../../context/SocketContext';

interface OperationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface Props {
  role: 'admin' | 'employee';
}

const StockHistoryAll: React.FC<Props> = ({ role }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [history, setHistory] = useState<StockHistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState<string>(searchParams.get('endDate') || '');
  const [currentPage, setCurrentPage] = useState<number>(parseInt(searchParams.get('page') || '1', 10));
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [movementFilter, setMovementFilter] = useState<'ALL' | 'IN' | 'OUT' | 'ADJUSTMENT'>('ALL');
  const itemsPerPage = 20;
  const pdfContentRef = useRef<HTMLDivElement>(null);

  // Fetch all stock history
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const records = await stockService.getStockHistory();
        setHistory(records || []);
        setError(null);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load stock history';
        console.error('Error fetching stock history:', err);
        setError(errorMessage);
        showOperationStatus('error', errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Update URL search params when filters or page change
  useEffect(() => {
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', startDate);
    if (endDate) params.set('endDate', endDate);
    if (currentPage !== 1) params.set('page', currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [startDate, endDate, currentPage, setSearchParams]);

  // WebSocket event handlers
  useSocketEvent('stockHistoryCreated', async () => {
    const records = await stockService.getStockHistory();
    setHistory(records || []);
    showOperationStatus('success', 'New stock history record added');
  });

  useSocketEvent('stockUpdated', async (stockData: Stock) => {
    const records = await stockService.getStockHistory();
    setHistory(records || []);
    showOperationStatus('success', `Stock item ${stockData.itemName} updated`);
  });

  // Operation status handler
  const showOperationStatus = (type: OperationStatus['type'], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  // Format date
  const formatDate = (date?: Date | string): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format currency in Rwf
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined || value === null) return 'N/A';
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
    }).format(value);
  };

  // Get created by
  const getCreatedBy = (record: StockHistoryRecord): string => {
    const admin = record.createdByAdmin;
    const employee = record.createdByEmployee;
    if (record.createdByAdminId && admin) {
      return admin.adminName || 'N/A';
    } else if (record.createdByEmployeeId && employee) {
      return `${employee.first_name} ${employee.last_name}`;
    }
    return 'N/A';
  };

  // Check if record is within date range
  const isWithinDateRange = (record: StockHistoryRecord, start: string, end: string): boolean => {
    if (!record.createdAt || !start || !end) return true;
    const recordDate = new Date(record.createdAt).getTime();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).setHours(23, 59, 59, 999);
    return recordDate >= startTime && recordDate <= endTime;
  };

  // Filtered + searched data
  const filteredHistory = useMemo(() => {
    return history.filter((record) => {
      // Movement type filter
      if (movementFilter !== 'ALL' && record.movementType !== movementFilter) return false;

      // Date range filter
      if (startDate && endDate && !isWithinDateRange(record, startDate, endDate)) return false;

      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const productName = record.stock?.itemName?.toLowerCase() || '';
        const notes = record.notes?.toLowerCase() || '';
        const createdBy = getCreatedBy(record).toLowerCase();
        const sourceType = record.sourceType?.toLowerCase() || '';
        if (!productName.includes(term) && !notes.includes(term) && !createdBy.includes(term) && !sourceType.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }, [history, movementFilter, startDate, endDate, searchTerm]);

  // Stats
  const stats = useMemo(() => {
    const inRecords = filteredHistory.filter(r => r.movementType === 'IN');
    const outRecords = filteredHistory.filter(r => r.movementType === 'OUT');
    const adjustmentRecords = filteredHistory.filter(r => r.movementType === 'ADJUSTMENT');
    const totalIn = inRecords.reduce((sum, r) => sum + Number(r.qtyChange || 0), 0);
    const totalOut = outRecords.reduce((sum, r) => sum + Number(r.qtyChange || 0), 0);
    return {
      totalIn,
      totalOut,
      netChange: totalIn - totalOut,
      inCount: inRecords.length,
      outCount: outRecords.length,
      adjustmentCount: adjustmentRecords.length,
    };
  }, [filteredHistory]);

  // Handle date filter
  const handleFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    if (!startDate || !endDate) {
      showOperationStatus('info', 'Date filter cleared');
    } else {
      showOperationStatus('success', 'Date filter applied');
    }
  };

  // Clear date filter
  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
    setSearchParams({}, { replace: true });
    showOperationStatus('info', 'Date filter cleared');
  };

  // Export to PDF
  const handleExportPDF = async () => {
    try {
      setOperationLoading(true);
      const date = new Date().toLocaleDateString('en-CA').replace(/\//g, '');
      const filename = `stock_history_all_${date}.pdf`;

      const tableRows = filteredHistory.map((record, index) => `
        <tr>
          <td style="font-size:10px;">${index + 1}</td>
          <td style="font-size:10px;">${record.stock?.itemName || 'N/A'}</td>
          <td style="font-size:10px;">${record.movementType}</td>
          <td style="font-size:10px;">${record.sourceType}</td>
          <td style="font-size:10px;">${(Number(record.qtyBefore) || 0).toFixed(3)} ${record.stock?.unitOfMeasure || ''}</td>
          <td style="font-size:10px;">${(Number(record.qtyChange) || 0).toFixed(3)} ${record.stock?.unitOfMeasure || ''}</td>
          <td style="font-size:10px;">${(Number(record.qtyAfter) || 0).toFixed(3)} ${record.stock?.unitOfMeasure || ''}</td>
          <td style="font-size:10px;">${record.unitPrice !== undefined ? formatCurrency(Number(record.unitPrice)) : 'N/A'}</td>
          <td style="font-size:10px;">${record.notes || 'N/A'}</td>
          <td style="font-size:10px;">${getCreatedBy(record)}</td>
          <td style="font-size:10px;">${formatDate(record.createdAt)}</td>
        </tr>
      `).join('');

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
            tr:nth-child(even) { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>All Stock History${movementFilter !== 'ALL' ? ` — ${movementFilter} Movements` : ''}</h1>
          <p>Exported on: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' })}</p>
          ${startDate && endDate ? `<p>Filtered: ${startDate} to ${endDate}</p>` : ''}
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Movement Type</th>
                <th>Source Type</th>
                <th>Qty Before</th>
                <th>Qty Change</th>
                <th>Qty After</th>
                <th>Unit Price</th>
                <th>Notes</th>
                <th>Created By</th>
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
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
      };

      await html2pdf().from(htmlContent).set(opt).save();
      showOperationStatus('success', 'Stock history exported successfully');
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      showOperationStatus('error', 'Failed to export stock history');
    } finally {
      setOperationLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const records = await stockService.getStockHistory();
      setHistory(records || []);
      setError(null);
      showOperationStatus('success', 'Data refreshed');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to refresh data';
      setError(errorMessage);
      showOperationStatus('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Movement type badge
  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'IN':
        return 'bg-green-100 text-green-800';
      case 'OUT':
        return 'bg-red-100 text-red-800';
      case 'ADJUSTMENT':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500 text-xs">
          <div className="inline-flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading stock history...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-xs">
      {/* Operation Status */}
      {operationStatus && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`flex items-center space-x-2 px-3 py-2 rounded shadow-lg text-xs ${operationStatus.type === 'success'
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
            <button onClick={() => setOperationStatus(null)} className="hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Operation Loading */}
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

      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Stock History</h1>
              <p className="text-xs text-gray-500 mt-0.5">Track all stock movement transactions</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate(`/${role}/dashboard/stock-management`)}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50"
                title="Back to Stock Management"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExportPDF}
                disabled={operationLoading || filteredHistory.length === 0}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Export PDF"
              >
                <Download className="w-3 h-3" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-full flex items-center justify-center">
                <ArrowUpCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Stock In</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalIn.toFixed(1)}</p>
                <p className="text-xs text-gray-400">{stats.inCount} movements</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 rounded-full flex items-center justify-center">
                <ArrowDownCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Stock Out</p>
                <p className="text-lg font-semibold text-gray-900">{stats.totalOut.toFixed(1)}</p>
                <p className="text-xs text-gray-400">{stats.outCount} movements</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Net Change</p>
                <p className={`text-lg font-semibold ${stats.netChange >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {stats.netChange >= 0 ? '+' : ''}{stats.netChange.toFixed(1)}
                </p>
                <p className="text-xs text-gray-400">{stats.adjustmentCount} adjustments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search + Movement Filter + Date Filter */}
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search product, notes, user..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-56 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            {/* Movement Type Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded">
              {(['ALL', 'IN', 'OUT', 'ADJUSTMENT'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => { setMovementFilter(type); setCurrentPage(1); }}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${movementFilter === type
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  {type === 'ALL' ? 'All' : type}
                </button>
              ))}
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button
                onClick={handleFilter}
                className="px-3 py-1.5 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 text-xs"
              >
                Apply
              </button>
              {(startDate || endDate) && (
                <button
                  onClick={handleClearFilter}
                  className="px-3 py-1.5 text-gray-500 hover:text-gray-700 border border-gray-200 rounded hover:bg-gray-50 text-xs"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stock History Table */}
        <div className="bg-white rounded border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2 text-primary-600" />
              Stock Movement History ({filteredHistory.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">Product Name</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">Movement</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">Source</th>
                  <th className="text-right py-2 px-2 text-gray-600 font-medium">Qty Before</th>
                  <th className="text-right py-2 px-2 text-gray-600 font-medium">Qty Change</th>
                  <th className="text-right py-2 px-2 text-gray-600 font-medium">Qty After</th>
                  {role === 'admin' && (
                    <th className="text-right py-2 px-2 text-gray-600 font-medium">Unit Price</th>
                  )}
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">Notes</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">By</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedHistory.length === 0 ? (
                  <tr>
                    <td colSpan={role === 'admin' ? 11 : 10} className="px-2 py-8 text-center text-xs text-gray-500">
                      No stock history records found
                    </td>
                  </tr>
                ) : (
                  paginatedHistory.map((record, index) => (
                    <tr key={record.id} className="hover:bg-gray-25">
                      <td className="py-2 px-2 text-gray-700">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="py-2 px-2 text-gray-900 font-medium">{record.stock?.itemName || 'N/A'}</td>
                      <td className="py-2 px-2">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getMovementBadge(record.movementType)}`}>
                          {record.movementType}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-gray-700">{record.sourceType}</td>
                      <td className="py-2 px-2 text-gray-700 text-right">
                        {(Number(record.qtyBefore) || 0).toFixed(1)} {record.stock?.unitOfMeasure || ''}
                      </td>
                      <td className="py-2 px-2 text-right">
                        <span className={record.movementType === 'OUT' ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                          {record.movementType === 'OUT' ? '-' : '+'}{(Number(record.qtyChange) || 0).toFixed(1)} {record.stock?.unitOfMeasure || ''}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-gray-700 text-right font-medium">
                        {(Number(record.qtyAfter) || 0).toFixed(1)} {record.stock?.unitOfMeasure || ''}
                      </td>
                      {role === 'admin' && (
                        <td className="py-2 px-2 text-gray-700 text-right">
                          {record.unitPrice !== undefined && record.unitPrice !== null ? formatCurrency(Number(record.unitPrice)) : 'N/A'}
                        </td>
                      )}
                      <td className="py-2 px-2 text-gray-700 max-w-[120px] truncate" title={record.notes || ''}>
                        {record.notes || '—'}
                      </td>
                      <td className="py-2 px-2 text-gray-700">{getCreatedBy(record)}</td>
                      <td className="py-2 px-2 text-gray-700">{formatDate(record.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredHistory.length > itemsPerPage && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-gray-600 text-xs">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredHistory.length)} of {filteredHistory.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>Previous</span>
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 7) {
                      page = i + 1;
                    } else if (currentPage <= 4) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      page = totalPages - 6 + i;
                    } else {
                      page = currentPage - 3 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-2 py-1 text-xs rounded ${currentPage === page
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockHistoryAll;
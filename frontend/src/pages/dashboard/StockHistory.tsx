import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Package, Calendar, Download, ArrowLeft, RefreshCw, CheckCircle, XCircle, AlertCircle, X, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import stockService, { type StockIn, type StockHistory } from '../../services/stockInService';
import { useSocketEvent } from '../../context/SocketContext';

interface OperationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ExtendedStockHistory extends StockHistory {
  stockIn?: StockIn;
}

interface Props {
  role: 'admin' | 'employee';
}

const StockHistoryAll: React.FC<Props> = ({ role }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [history, setHistory] = useState<ExtendedStockHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ExtendedStockHistory[]>([]);
  const [stockIns, setStockIns] = useState<StockIn[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>(searchParams.get('startDate') || '');
  const [endDate, setEndDate] = useState<string>(searchParams.get('endDate') || '');
  const [currentPage, setCurrentPage] = useState<number>(parseInt(searchParams.get('page') || '1', 10));
  const itemsPerPage = 20;
  const pdfContentRef = useRef<HTMLDivElement>(null);

  // Fetch all stock history and stock items
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const extendedHistory = await stockService.getAllStockHistory();
        setHistory(extendedHistory || []);
        // Apply filters from URL params
        const filtered = startDate && endDate
          ? extendedHistory.filter((record) => isWithinDateRange(record, startDate, endDate))
          : extendedHistory;
        setFilteredHistory(filtered || []);
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
  useSocketEvent('stockHistoryCreated', async (historyData: ExtendedStockHistory) => {
    console.log('Stock history created via WebSocket:', historyData);
    const extendedHistory = await stockService.getAllStockHistory();
    setHistory(extendedHistory || []);
    // Apply filters from URL params
    const filtered = startDate && endDate
      ? extendedHistory.filter((record) => isWithinDateRange(record, startDate, endDate))
      : extendedHistory;
    setFilteredHistory(filtered || []);
    showOperationStatus('success', 'New stock history record added');
  });

  useSocketEvent('stockInUpdated', async (stockInData: StockIn) => {
    const extendedHistory = await stockService.getAllStockHistory();
    setHistory(extendedHistory || []);
    // Apply filters from URL params
    const filtered = startDate && endDate
      ? extendedHistory.filter((record) => isWithinDateRange(record, startDate, endDate))
      : extendedHistory;
    setFilteredHistory(filtered || []);
    showOperationStatus('success', `Stock item ${stockInData.productName} updated`);
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

  // Format price
  const formatPrice = (value: number | undefined): string => {
    if (value === undefined || value === null) return 'N/A';
    return `$${value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };

  // Get created by
  const getCreatedBy = (history: ExtendedStockHistory): string => {
    const admin = history.createdByAdmin;
    const employee = history.createdByEmployee;
    if (history.createdByAdminId && admin) {
      return admin.adminName || 'N/A';
    } else if (history.createdByEmployeeId && employee) {
      return `${employee.first_name} ${employee.last_name}`;
    }
    return 'N/A';
  };

  // Check if record is within date range
  const isWithinDateRange = (record: ExtendedStockHistory, start: string, end: string): boolean => {
    if (!record.createdAt || !start || !end) return true;
    const recordDate = new Date(record.createdAt).getTime();
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).setHours(23, 59, 59, 999);
    return recordDate >= startTime && recordDate <= endTime;
  };

  // Handle date filter
  const handleFilter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setFilteredHistory(history);
      setCurrentPage(1);
      showOperationStatus('info', 'Date filter cleared');
      return;
    }
    const filtered = history.filter((record) => isWithinDateRange(record, startDate, endDate));
    setFilteredHistory(filtered);
    setCurrentPage(1);
    showOperationStatus('success', 'Date filter applied');
  };

  // Clear date filter
  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    setFilteredHistory(history);
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
          <td style="font-size:10px;">${record.stockIn?.productName || 'N/A'}</td>
          <td style="font-size:10px;">${record.movementType}</td>
          <td style="font-size:10px;">${record.sourceType}</td>
          <td style="font-size:10px;">${record.qtyBefore.toFixed(3)} ${record.stockIn?.unit || ''}</td>
          <td style="font-size:10px;">${record.qtyChange.toFixed(3)} ${record.stockIn?.unit || ''}</td>
          <td style="font-size:10px;">${record.qtyAfter.toFixed(3)} ${record.stockIn?.unit || ''}</td>
          <td style="font-size:10px;">${formatPrice(record.unitPrice)}</td>
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
          <h1>All Stock History</h1>
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
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
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
      const [historyData, stockInData] = await Promise.all([
        stockService.getAllStockHistory(),
        stockService.getAllStockIns(),
      ]);
      
      const extendedHistory = historyData.map((record) => ({
        ...record,
        stockIn: stockInData.find((stock) => stock.id === record.stockInId),
      }));
      setHistory(extendedHistory || []);
      setStockIns(stockInData || []);
      // Apply current filter to refreshed data
      const filtered = startDate && endDate
        ? extendedHistory.filter((record) => isWithinDateRange(record, startDate, endDate))
        : extendedHistory;
      setFilteredHistory(filtered || []);
      setCurrentPage(parseInt(searchParams.get('page') || '1', 10));
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
              <h1 className="text-lg font-semibold text-gray-900">All Stock History</h1>
              <p className="text-xs text-gray-500 mt-0.5">View all stock movement history</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate('/stock')}
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

      {/* Date Filter */}
      <div className="px-4 py-4">
        <div className="bg-white rounded border border-gray-200 p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center mb-3">
            <Filter className="w-4 h-4 mr-2 text-primary-600" />
            Filter by Date
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleFilter}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 text-xs"
              >
                Apply Filter
              </button>
              <button
                onClick={handleClearFilter}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 text-xs"
                disabled={!startDate && !endDate}
              >
                Clear Filter
              </button>
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
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">Movement Type</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">Source Type</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">Qty Before</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">Qty Change</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">Qty After</th>
                  {role === 'admin' && (
                    <th className="text-left py-2 px-2 text-gray-600 font-medium">Unit Price</th>
                  )}
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">Notes</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">Created By</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedHistory.map((record, index) => (
                  <tr key={record.id} className="hover:bg-gray-25">
                    <td className="py-2 px-2 text-gray-700">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="py-2 px-2 text-gray-700">{record.stockIn?.productName || 'N/A'}</td>
                    <td className={`py-2 px-2 text-gray-700 ${record.movementType === 'OUT' ? 'text-red-600' : 'text-green-600'}`}>
                      {record.movementType}
                    </td>
                    <td className="py-2 px-2 text-gray-700">{record.sourceType}</td>
                    <td className="py-2 px-2 text-gray-700">
                      {(Number(record.qtyBefore) || 0).toFixed(3)} {record.stockIn?.unit || ''}
                    </td>
                    <td className="py-2 px-2 text-gray-700">
                      <span className={record.movementType === 'OUT' ? 'text-red-600' : 'text-green-600'}>
                        {record.movementType === 'OUT' ? '-' : '+'}{(Number(record.qtyChange) || 0).toFixed(3)} {record.stockIn?.unit || ''}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-gray-700">
                      {(Number(record.qtyAfter) || 0).toFixed(3)} {record.stockIn?.unit || ''}
                    </td>
                    {role === 'admin' && (
                      <td className="py-2 px-2 text-gray-700">
                        {record.unitPrice !== undefined ? formatPrice(Number(record.unitPrice)) : 'N/A'}
                      </td>
                    )}
                    <td className="py-2 px-2 text-gray-700">{record.notes || 'N/A'}</td>
                    <td className="py-2 px-2 text-gray-700">{getCreatedBy(record)}</td>
                    <td className="py-2 px-2 text-gray-700">{formatDate(record.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-2 py-1 text-xs rounded ${
                        currentPage === page
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-600 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
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

        {filteredHistory.length === 0 && (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500 text-xs">
            No stock history records found
          </div>
        )}
      </div>
    </div>
  );
};

export default StockHistoryAll;
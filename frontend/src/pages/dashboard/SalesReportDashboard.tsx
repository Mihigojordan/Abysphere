import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, Filter, Calendar, DollarSign, Package, TrendingUp, X } from 'lucide-react';
import stockOutService, { type StockOut, type PaymentMethod } from '../../services/stockoutService';

const SalesReportPage = () => {
  const [stockOuts, setStockOuts] = useState<StockOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | 'ALL'>('ALL');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [dateRangeMode, setDateRangeMode] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');

  useEffect(() => {
    fetchStockOuts();
  }, []);

  const fetchStockOuts = async () => {
    try {
      setLoading(true);
      const data = await stockOutService.getAllStockOuts();
      setStockOuts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Date Range Logic ──────────────────────────────────────────
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (dateRangeMode) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 86400000 - 1) };
      case 'week':
        return { start: startOfWeek, end: new Date(startOfWeek.getTime() + 7 * 86400000 - 1) };
      case 'month':
        return { start: startOfMonth, end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59) };
      case 'custom':
        return {
          start: dateRange.start ? new Date(dateRange.start) : null,
          end: dateRange.end ? new Date(dateRange.end + 'T23:59:59') : null,
        };
      default:
        return { start: null, end: null };
    }
  };

  const filteredData = useMemo(() => {
    return stockOuts.filter(item => {
      const matchesSearch =
        item.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.clientEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.clientPhone?.includes(searchTerm) ||
        item.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesPayment = filterMethod === 'ALL' || item.paymentMethod === filterMethod;

      const { start, end } = getDateRange();
      const matchesDate = (() => {
        if (!start && !end) return true;
        const itemDate = new Date(item.createdAt || '').getTime();
        if (start && end) return itemDate >= start.getTime() && itemDate <= end.getTime();
        if (start) return itemDate >= start.getTime();
        if (end) return itemDate <= end.getTime();
        return true;
      })();

      return matchesSearch && matchesPayment && matchesDate;
    });
  }, [stockOuts, searchTerm, filterMethod, dateRangeMode, dateRange]);

  const stats = useMemo(() => {
    const totalSales = filteredData.reduce((sum, item) =>
      sum + (Number(item.soldPrice) * item.quantity), 0);
    const totalQuantity = filteredData.reduce((sum, item) => sum + item.quantity, 0);
    const avgTransaction = filteredData.length > 0 ? totalSales / filteredData.length : 0;
    return {
      totalSales,
      totalQuantity,
      totalTransactions: filteredData.length,
      avgTransaction
    };
  }, [filteredData]);

  const exportToCSV = () => {
    const headers = ['Transaction ID', 'Date', 'Client Name', 'Client Phone', 'Client Email', 'Quantity', 'Unit Price', 'Total', 'Payment Method'];
    const rows = filteredData.map(item => [
      item.transactionId || '',
      new Date(item.createdAt || '').toLocaleDateString(),
      item.clientName || '',
      item.clientPhone || '',
      item.clientEmail || '',
      item.quantity,
      item.soldPrice || 0,
      (Number(item.soldPrice) * item.quantity).toFixed(2),
      item.paymentMethod || ''
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF'
    }).format(amount);
  };

  const getPaymentMethodColor = (method?: PaymentMethod) => {
    switch (method) {
      case 'MOMO': return 'bg-yellow-100 text-yellow-800';
      case 'CARD': return 'bg-blue-100 text-blue-800';
      case 'CASH': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sales Report</h1>
              <p className="text-gray-600">Track and analyze all stock-out transactions</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Sales', value: formatCurrency(stats.totalSales), icon: DollarSign, color: 'green' },
            { title: 'Total Quantity', value: stats.totalQuantity, icon: Package, color: 'blue' },
            { title: 'Transactions', value: stats.totalTransactions, icon: TrendingUp, color: 'purple' },
            { title: 'Avg Transaction', value: formatCurrency(stats.avgTransaction), icon: Calendar, color: 'orange' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by client, email, phone, or ID..."
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
                      setDateRangeMode(opt);
                      if (opt !== 'custom') {
                        setDateRange({ start: '', end: '' });
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded capitalize transition-colors ${
                      dateRangeMode === opt
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {opt === 'all' ? 'All Time' : opt}
                  </button>
                ))}
              </div>

              {/* Custom Date Inputs */}
              {dateRangeMode === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))}
                    className="px-3 py-1.5 text-xs border rounded"
                  />
                  <span className="text-gray-500 text-sm">to</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))}
                    className="px-3 py-1.5 text-xs border rounded"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value as PaymentMethod | 'ALL')}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-primary-500"
              >
                <option value="ALL">All Methods</option>
                <option value="MOMO">Mobile Money</option>
                <option value="CARD">Card</option>
                <option value="CASH">Cash</option>
              </select>

              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <p className="text-red-800">{error}</p>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No sales transactions found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.transactionId || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(item.createdAt || '').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.clientName || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div>{item.clientPhone || '-'}</div>
                        <div className="text-xs text-gray-400">{item.clientEmail || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {formatCurrency(Number(item.soldPrice) || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                        {formatCurrency((Number(item.soldPrice) || 0) * item.quantity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPaymentMethodColor(item.paymentMethod)}`}>
                          {item.paymentMethod || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredData.length} of {stockOuts.length} transactions
        </div>
      </div>
    </div>
  );
};

export default SalesReportPage;
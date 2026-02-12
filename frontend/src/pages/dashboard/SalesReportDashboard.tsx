import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, Filter, Calendar, DollarSign, Package, TrendingUp, X } from 'lucide-react';
import stockOutService, { type StockOut, PaymentMethod } from '../../services/stockoutService';

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
      case PaymentMethod.MOMO: return 'bg-yellow-100 text-yellow-800';
      case PaymentMethod.CARD: return 'bg-blue-100 text-blue-800';
      case PaymentMethod.CASH: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg-secondary flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-theme-text-secondary">Loading sales data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg-secondary text-xs text-theme-text-primary transition-colors duration-200">
      {/* Header Section */}
      <div className="bg-theme-bg-primary shadow-md border-b border-theme-border transition-colors duration-200">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-theme-text-primary">Sales Report</h1>
              <p className="text-xs text-theme-text-secondary mt-0.5">Track and analyze all stock-out transactions</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-1 px-4 py-2 text-theme-text-secondary hover:text-theme-text-primary border border-theme-border rounded hover:bg-theme-bg-tertiary"
                title="Export CSV"
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: 'Total Sales', value: formatCurrency(stats.totalSales), icon: DollarSign, color: 'green' },
            { title: 'Total Quantity', value: stats.totalQuantity, icon: Package, color: 'blue' },
            { title: 'Transactions', value: stats.totalTransactions, icon: TrendingUp, color: 'purple' },
            { title: 'Avg Transaction', value: formatCurrency(stats.avgTransaction), icon: Calendar, color: 'orange' },
          ].map((stat, i) => (
            <div key={i} className="bg-theme-bg-primary rounded shadow border border-theme-border p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 bg-${stat.color}-100 rounded-full flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-xs text-theme-text-secondary">{stat.title}</p>
                  <p className="text-lg font-semibold text-theme-text-primary">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="bg-theme-bg-primary rounded border border-theme-border p-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 gap-3">
            <div className="flex items-center space-x-2 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="w-3 h-3 text-theme-text-secondary absolute left-2 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by client, email, phone, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-theme-border rounded bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Date Filter Buttons */}
              <div className="flex gap-1 bg-theme-bg-tertiary p-1 rounded">
                {(['all', 'today', 'week', 'month', 'custom'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setDateRangeMode(opt);
                      if (opt !== 'custom') {
                        setDateRange({ start: '', end: '' });
                      }
                    }}
                    className={`px-2 py-1 text-xs font-medium rounded capitalize transition-colors ${dateRangeMode === opt
                      ? 'bg-theme-bg-primary text-primary-600 shadow-sm'
                      : 'text-theme-text-secondary hover:text-theme-text-primary'
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
                    className="px-2 py-1 text-xs border border-theme-border rounded bg-theme-bg-primary text-theme-text-primary"
                  />
                  <span className="text-theme-text-secondary text-xs">to</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))}
                    className="px-2 py-1 text-xs border border-theme-border rounded bg-theme-bg-primary text-theme-text-primary"
                  />
                </div>
              )}
            </div>

            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value as PaymentMethod | 'ALL')}
              className="px-3 py-1.5 text-xs border border-theme-border rounded font-medium bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="ALL">All Methods</option>
              <option value="MOMO">Mobile Money</option>
              <option value="CARD">Card</option>
              <option value="CASH">Cash</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-theme-bg-primary rounded border border-theme-border">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-theme-bg-tertiary border-b border-theme-border">
                <tr>
                  <th className="text-left py-2 px-2 text-theme-text-secondary font-medium">Transaction ID</th>
                  <th className="text-left py-2 px-2 text-theme-text-secondary font-medium">Date</th>
                  <th className="text-left py-2 px-2 text-theme-text-secondary font-medium">Client</th>
                  <th className="text-left py-2 px-2 text-theme-text-secondary font-medium">Contact</th>
                  <th className="text-right py-2 px-2 text-theme-text-secondary font-medium">Qty</th>
                  <th className="text-right py-2 px-2 text-theme-text-secondary font-medium">Unit Price</th>
                  <th className="text-right py-2 px-2 text-theme-text-secondary font-medium">Total</th>
                  <th className="text-center py-2 px-2 text-theme-text-secondary font-medium">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-2 py-8 text-center text-xs text-theme-text-secondary">
                      No sales transactions found
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-theme-bg-tertiary">
                      <td className="py-2 px-2 text-theme-text-secondary font-mono">
                        {item.transactionId || '-'}
                      </td>
                      <td className="py-2 px-2 text-theme-text-secondary">
                        {new Date(item.createdAt || '').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-2 px-2 text-theme-text-primary">
                        {item.clientName || '-'}
                      </td>
                      <td className="py-2 px-2 text-theme-text-secondary">
                        <div>{item.clientPhone || '-'}</div>
                        <div className="text-xs text-theme-text-secondary">{item.clientEmail || ''}</div>
                      </td>
                      <td className="py-2 px-2 text-theme-text-secondary text-right">
                        {item.quantity}
                      </td>
                      <td className="py-2 px-2 text-theme-text-secondary text-right">
                        {formatCurrency(Number(item.soldPrice) || 0)}
                      </td>
                      <td className="py-2 px-2 text-theme-text-secondary text-right font-medium">
                        {formatCurrency((Number(item.soldPrice) || 0) * item.quantity)}
                      </td>
                      <td className="py-2 px-2">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getPaymentMethodColor(item.paymentMethod)}`}>
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
      </div>
    </div>
  );
};

export default SalesReportPage;
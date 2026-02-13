import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, DollarSign, Package, TrendingUp } from 'lucide-react';
import stockOutService, { type StockOut, PaymentMethod } from '../../services/stockoutService';
import { useLanguage } from '../../context/LanguageContext';

const SalesReportPage = () => {
  const [stockOuts, setStockOuts] = useState<StockOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<PaymentMethod | 'ALL'>('ALL');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [dateRangeMode, setDateRangeMode] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const { t } = useLanguage();

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('salesReport.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-xs">
      {/* Header Section */}
      <div className="bg-white shadow-md">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{t('salesReport.title')}</h1>
              <p className="text-xs text-gray-500 mt-0.5">{t('salesReport.subtitle')}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50"
                title={t('salesReport.export')}
              >
                <Download className="w-3 h-3" />
                <span>{t('salesReport.export')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { title: t('salesReport.totalSales'), value: formatCurrency(stats.totalSales), icon: DollarSign, color: 'green' },
            { title: t('salesReport.totalQuantity'), value: stats.totalQuantity, icon: Package, color: 'blue' },
            { title: t('salesReport.transactions'), value: stats.totalTransactions, icon: TrendingUp, color: 'purple' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded shadow p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 bg-${stat.color}-100 rounded-full flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-xs text-gray-600">{stat.title}</p>
                  <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 gap-3">
            <div className="flex items-center space-x-2 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('salesReport.searchPlaceholder')}
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
                      setDateRangeMode(opt);
                      if (opt !== 'custom') {
                        setDateRange({ start: '', end: '' });
                      }
                    }}
                    className={`px-2 py-1 text-xs font-medium rounded capitalize transition-colors ${dateRangeMode === opt
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
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
              {dateRangeMode === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))}
                    className="px-2 py-1 text-xs border border-gray-200 rounded"
                  />
                  <span className="text-gray-500 text-xs">{t('stockIn.to')}</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))}
                    className="px-2 py-1 text-xs border border-gray-200 rounded"
                  />
                </div>
              )}
            </div>

            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value as PaymentMethod | 'ALL')}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded font-medium focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="ALL">{t('salesReport.allMethods')}</option>
              <option value="MOMO">{t('salesReport.momo')}</option>
              <option value="CARD">{t('salesReport.card')}</option>
              <option value="CASH">{t('salesReport.cash')}</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">{t('salesReport.transactionId')}</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">{t('salesReport.date')}</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">{t('salesReport.client')}</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">{t('salesReport.contact')}</th>
                  <th className="text-right py-2 px-2 text-gray-600 font-medium">{t('salesReport.qty')}</th>
                  <th className="text-right py-2 px-2 text-gray-600 font-medium">{t('salesReport.unitPrice')}</th>
                  <th className="text-right py-2 px-2 text-gray-600 font-medium">{t('salesReport.total')}</th>
                  <th className="text-center py-2 px-2 text-gray-600 font-medium">{t('salesReport.payment')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-2 py-8 text-center text-xs text-gray-500">
                      {t('salesReport.noTransactions')}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-25">
                      <td className="py-2 px-2 text-gray-700 font-mono">
                        {item.transactionId || '-'}
                      </td>
                      <td className="py-2 px-2 text-gray-700">
                        {new Date(item.createdAt || '').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-2 px-2 text-gray-900">
                        {item.clientName || '-'}
                      </td>
                      <td className="py-2 px-2 text-gray-700">
                        <div>{item.clientPhone || '-'}</div>
                        <div className="text-xs text-gray-500">{item.clientEmail || ''}</div>
                      </td>
                      <td className="py-2 px-2 text-gray-700 text-right">
                        {item.quantity}
                      </td>
                      <td className="py-2 px-2 text-gray-700 text-right">
                        {formatCurrency(Number(item.soldPrice) || 0)}
                      </td>
                      <td className="py-2 px-2 text-gray-700 text-right font-medium">
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
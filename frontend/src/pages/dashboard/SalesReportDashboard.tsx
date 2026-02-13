import React, { useState, useEffect, useMemo } from 'react';
import { Search, Download, DollarSign, Package, TrendingUp, FileText, Calendar } from 'lucide-react';
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
      case PaymentMethod.MOMO: return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case PaymentMethod.CARD: return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case PaymentMethod.CASH: return 'bg-green-500/10 text-green-600 dark:text-green-400';
      default: return 'bg-theme-bg-tertiary text-theme-text-secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg-secondary flex items-center justify-center">
        <div className="bg-theme-bg-primary rounded-xl p-8 shadow-lg text-center border border-theme-border">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-theme-text-secondary text-sm">{t('salesReport.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg-secondary">
      {/* Gradient Header */}
      <div className="bg-theme-bg-primary border-b border-theme-border shadow-sm">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{t('salesReport.title')}</h1>
                <p className="text-primary-100 text-xs mt-0.5">{t('salesReport.subtitle')}</p>
              </div>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-xs font-medium"
            >
              <Download className="w-4 h-4" />
              <span>{t('salesReport.export')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-theme-bg-primary rounded-xl border border-theme-border p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-theme-text-secondary">{t('salesReport.totalSales')}</p>
                <p className="text-xl font-bold text-theme-text-primary mt-0.5">{formatCurrency(stats.totalSales)}</p>
              </div>
            </div>
          </div>

          <div className="bg-theme-bg-primary rounded-xl border border-theme-border p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-theme-text-secondary">{t('salesReport.totalQuantity')}</p>
                <p className="text-xl font-bold text-theme-text-primary mt-0.5">{stats.totalQuantity.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-theme-bg-primary rounded-xl border border-theme-border p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-theme-text-secondary">{t('salesReport.transactions')}</p>
                <p className="text-xl font-bold text-theme-text-primary mt-0.5">{stats.totalTransactions.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-theme-bg-primary rounded-xl border border-theme-border shadow-sm">
          <div className="p-4 border-b border-theme-border">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <Search className="h-4 w-4 text-primary-600" />
              </div>
              <h2 className="text-sm font-semibold text-theme-text-primary">Filters</h2>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-theme-text-secondary absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={t('salesReport.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-56 pl-9 pr-3 py-2.5 text-xs border border-theme-border rounded-lg bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Date Filter Buttons */}
                <div className="flex gap-1 bg-theme-bg-tertiary p-1 rounded-lg">
                  {(['all', 'today', 'week', 'month', 'custom'] as const).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setDateRangeMode(opt);
                        if (opt !== 'custom') {
                          setDateRange({ start: '', end: '' });
                        }
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-colors ${
                        dateRangeMode === opt
                          ? 'bg-theme-bg-primary text-primary-600 shadow-sm border border-theme-border'
                          : 'text-theme-text-secondary hover:text-theme-text-primary'
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
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-theme-text-secondary absolute left-2.5 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))}
                        className="pl-8 pr-3 py-2 text-xs border border-theme-border rounded-lg bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <span className="text-theme-text-secondary text-xs">{t('stockIn.to')}</span>
                    <div className="relative">
                      <Calendar className="w-3.5 h-3.5 text-theme-text-secondary absolute left-2.5 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))}
                        className="pl-8 pr-3 py-2 text-xs border border-theme-border rounded-lg bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method Filter */}
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value as PaymentMethod | 'ALL')}
                className="px-3 py-2.5 text-xs border border-theme-border rounded-lg bg-theme-bg-primary text-theme-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ALL">{t('salesReport.allMethods')}</option>
                <option value="MOMO">{t('salesReport.momo')}</option>
                <option value="CARD">{t('salesReport.card')}</option>
                <option value="CASH">{t('salesReport.cash')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-theme-bg-primary rounded-xl border border-theme-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-theme-bg-tertiary border-b border-theme-border">
                <tr>
                  <th className="text-left py-3 px-4 text-theme-text-secondary font-medium">{t('salesReport.transactionId')}</th>
                  <th className="text-left py-3 px-4 text-theme-text-secondary font-medium">{t('salesReport.date')}</th>
                  <th className="text-left py-3 px-4 text-theme-text-secondary font-medium">{t('salesReport.client')}</th>
                  <th className="text-left py-3 px-4 text-theme-text-secondary font-medium">{t('salesReport.contact')}</th>
                  <th className="text-right py-3 px-4 text-theme-text-secondary font-medium">{t('salesReport.qty')}</th>
                  <th className="text-right py-3 px-4 text-theme-text-secondary font-medium">{t('salesReport.unitPrice')}</th>
                  <th className="text-right py-3 px-4 text-theme-text-secondary font-medium">{t('salesReport.total')}</th>
                  <th className="text-center py-3 px-4 text-theme-text-secondary font-medium">{t('salesReport.payment')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="p-3 bg-theme-bg-tertiary rounded-full mb-3">
                          <FileText className="w-6 h-6 text-theme-text-secondary" />
                        </div>
                        <p className="text-sm text-theme-text-secondary">{t('salesReport.noTransactions')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-theme-bg-tertiary/50 transition-colors">
                      <td className="py-3 px-4 text-theme-text-primary font-mono text-[11px]">
                        {item.transactionId || '-'}
                      </td>
                      <td className="py-3 px-4 text-theme-text-secondary">
                        {new Date(item.createdAt || '').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-4 text-theme-text-primary font-medium">
                        {item.clientName || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-theme-text-primary">{item.clientPhone || '-'}</div>
                        {item.clientEmail && (
                          <div className="text-[10px] text-theme-text-secondary mt-0.5">{item.clientEmail}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-theme-text-primary text-right tabular-nums">
                        {item.quantity.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-theme-text-secondary text-right tabular-nums">
                        {formatCurrency(Number(item.soldPrice) || 0)}
                      </td>
                      <td className="py-3 px-4 text-theme-text-primary text-right font-semibold tabular-nums">
                        {formatCurrency((Number(item.soldPrice) || 0) * item.quantity)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 text-[10px] font-semibold rounded-full ${getPaymentMethodColor(item.paymentMethod)}`}>
                          {item.paymentMethod || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with Summary */}
          {filteredData.length > 0 && (
            <div className="px-4 py-3 bg-theme-bg-tertiary border-t border-theme-border">
              <div className="flex items-center justify-between">
                <p className="text-xs text-theme-text-secondary">
                  Showing <span className="font-medium text-theme-text-primary">{filteredData.length}</span> transactions
                </p>
                <div className="flex items-center gap-6">
                  <div className="text-xs text-theme-text-secondary">
                    Total Qty: <span className="font-semibold text-theme-text-primary">{stats.totalQuantity.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-theme-text-secondary">
                    Grand Total: <span className="font-bold text-primary-600">{formatCurrency(stats.totalSales)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReportPage;

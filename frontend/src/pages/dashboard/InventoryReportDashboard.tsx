import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Package,
  DollarSign,
  AlertTriangle,
  Warehouse,
} from 'lucide-react';
import stockService, { type Stock } from '../../services/stockService';
import { useLanguage } from '../../context/LanguageContext';

const InventoryReportPage = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRangeMode, setDateRangeMode] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const { t } = useLanguage();

  // --------------------------------------------------------------------
  // FETCH DATA
  // --------------------------------------------------------------------
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await stockService.getAllStocks();   // <-- note: returns Stock[]
        setStocks(Array.isArray(data) ? data : [data]);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load inventory');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // --------------------------------------------------------------------
  // DATE RANGE LOGIC
  // --------------------------------------------------------------------
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

  // --------------------------------------------------------------------
  // FILTERED DATA + STATS
  // --------------------------------------------------------------------
  const filteredData = useMemo(() => {
    return stocks.filter((item) => {
      // Search
      const matchesSearch =
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.warehouseLocation.toLowerCase().includes(searchTerm.toLowerCase());

      // Date (receivedDate)
      const { start, end } = getDateRange();
      const itemDate = new Date(item.receivedDate).getTime();
      const matchesDate = (() => {
        if (!start && !end) return true;
        if (start && end) return itemDate >= start.getTime() && itemDate <= end.getTime();
        if (start) return itemDate >= start.getTime();
        if (end) return itemDate <= end.getTime();
        return true;
      })();

      return matchesSearch && matchesDate;
    });
  }, [stocks, searchTerm, dateRangeMode, dateRange]);

  const stats = useMemo(() => {
    const totalValue = filteredData.reduce((sum, s) => sum + Number(s.totalValue), 0);
    const totalQty = filteredData.reduce((sum, s) => sum + s.receivedQuantity, 0);
    const lowStock = filteredData.filter((s) => s.receivedQuantity <= s.reorderLevel).length;
    const avgUnitCost = totalQty ? totalValue / totalQty : 0;

    return { totalValue, totalQty, lowStock, avgUnitCost };
  }, [filteredData]);

  // --------------------------------------------------------------------
  // EXPORT CSV
  // --------------------------------------------------------------------
  const exportToCSV = () => {
    const headers = [
      'SKU',
      'Item Name',
      'Category',
      'Supplier',
      'UoM',
      'Qty',
      'Unit Cost',
      'Total Value',
      'Location',
      'Received Date',
      'Reorder Level',
    ];

    const rows = filteredData.map((s) => [
      s.sku,
      s.itemName,
      s.categoryId ?? '',
      s.supplier ?? '',
      s.unitOfMeasure,
      s.receivedQuantity,
      Number(s.unitCost).toFixed(2),
      Number(s.totalValue).toFixed(2),
      s.warehouseLocation,
      new Date(s.receivedDate).toLocaleDateString(),
      s.reorderLevel,
    ]);

    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // --------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-RW', { style: 'currency', currency: 'RWF' }).format(amount);

  const getStockStatus = (qty: number, reorder: number) => {
    if (qty === 0) return { label: t('inventoryReport.outOfStock'), color: 'bg-red-100 text-red-800' };
    if (qty <= reorder) return { label: t('inventoryReport.low'), color: 'bg-yellow-100 text-yellow-800' };
    return { label: t('inventoryReport.inStock'), color: 'bg-green-100 text-green-800' };
  };

  // --------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-theme-bg-secondary flex items-center justify-center transition-colors duration-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-theme-text-secondary">{t('inventoryReport.loading')}</p>
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
              <h1 className="text-lg font-semibold text-theme-text-primary">{t('inventoryReport.title')}</h1>
              <p className="text-xs text-theme-text-secondary mt-0.5">{t('inventoryReport.subtitle')}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-1 px-4 py-2 text-theme-text-secondary hover:text-theme-text-primary border border-theme-border rounded hover:bg-theme-bg-tertiary"
                title={t('inventoryReport.export')}
              >
                <Download className="w-3 h-3" />
                <span>{t('inventoryReport.export')}</span>
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
            { title: t('inventoryReport.totalValue'), value: formatCurrency(stats.totalValue), icon: DollarSign, color: 'green' },
            { title: t('inventoryReport.totalQty'), value: stats.totalQty, icon: Package, color: 'blue' },
            { title: t('inventoryReport.lowStock'), value: stats.lowStock, icon: AlertTriangle, color: 'orange' },
            { title: t('inventoryReport.avgCost'), value: formatCurrency(stats.avgUnitCost), icon: Warehouse, color: 'purple' },
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
                  placeholder={t('inventoryReport.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-theme-border rounded bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Date Buttons */}
              <div className="flex gap-1 bg-theme-bg-tertiary p-1 rounded">
                {(['all', 'today', 'week', 'month', 'custom'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setDateRangeMode(opt);
                      if (opt !== 'custom') setDateRange({ start: '', end: '' });
                    }}
                    className={`px-2 py-1 text-xs font-medium rounded capitalize transition-colors ${dateRangeMode === opt
                      ? 'bg-theme-bg-primary text-primary-600 shadow-sm'
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

              {/* Custom Date */}
              {dateRangeMode === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange((p) => ({ ...p, start: e.target.value }))}
                    className="px-2 py-1 text-xs border border-theme-border rounded bg-theme-bg-primary text-theme-text-primary"
                  />
                  <span className="text-theme-text-secondary text-xs">{t('stockIn.to')}</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange((p) => ({ ...p, end: e.target.value }))}
                    className="px-2 py-1 text-xs border border-theme-border rounded bg-theme-bg-primary text-theme-text-primary"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-theme-bg-primary rounded border border-theme-border">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-theme-bg-tertiary border-b border-theme-border">
                <tr>
                  <th className="text-left py-2 px-2 text-theme-text-secondary font-medium">{t('inventoryReport.sku')}</th>
                  <th className="text-left py-2 px-2 text-theme-text-secondary font-medium">{t('inventoryReport.item')}</th>
                  <th className="text-left py-2 px-2 text-theme-text-secondary font-medium">{t('inventoryReport.location')}</th>
                  <th className="text-right py-2 px-2 text-theme-text-secondary font-medium">{t('inventoryReport.qty')}</th>
                  <th className="text-right py-2 px-2 text-theme-text-secondary font-medium">{t('inventoryReport.unitCost')}</th>
                  <th className="text-right py-2 px-2 text-theme-text-secondary font-medium">{t('inventoryReport.value')}</th>
                  <th className="text-center py-2 px-2 text-theme-text-secondary font-medium">{t('inventoryReport.status')}</th>
                  <th className="text-left py-2 px-2 text-theme-text-secondary font-medium">{t('inventoryReport.received')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-2 py-8 text-center text-xs text-theme-text-secondary">
                      {t('inventoryReport.noItems')}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((s) => {
                    const status = getStockStatus(s.receivedQuantity, s.reorderLevel);
                    return (
                      <tr key={s.id} className="hover:bg-theme-bg-tertiary">
                        <td className="py-2 px-2 text-theme-text-secondary font-mono">{s.sku}</td>
                        <td className="py-2 px-2">
                          <div className="text-theme-text-primary">{s.itemName}</div>
                          {s.supplier && <div className="text-xs text-theme-text-secondary">{s.supplier}</div>}
                        </td>
                        <td className="py-2 px-2 text-theme-text-secondary">{s.warehouseLocation}</td>
                        <td className="py-2 px-2 text-theme-text-secondary text-right">
                          {s.receivedQuantity} {s.unitOfMeasure}
                        </td>
                        <td className="py-2 px-2 text-theme-text-secondary text-right">
                          {formatCurrency(Number(s.unitCost))}
                        </td>
                        <td className="py-2 px-2 text-theme-text-secondary text-right font-medium">
                          {formatCurrency(Number(s.totalValue))}
                        </td>
                        <td className="py-2 px-2">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-theme-text-secondary">
                          {new Date(s.receivedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryReportPage;
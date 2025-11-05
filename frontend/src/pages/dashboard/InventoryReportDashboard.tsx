import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Download,
  Package,
  DollarSign,
  AlertTriangle,
  Warehouse,
  Calendar,
  X,
} from 'lucide-react';
import stockService, { type Stock } from '../../services/stockService';

const InventoryReportPage = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRangeMode, setDateRangeMode] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

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
    if (qty === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (qty <= reorder) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  // --------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto so.stockinId">
        {/* ── Header ── */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Report</h1>
              <p className="text-gray-600">Full overview of received stock and current levels</p>
            </div>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: 'Total Inventory Value', value: formatCurrency(stats.totalValue), icon: DollarSign, color: 'green' },
            { title: 'Total Quantity', value: stats.totalQty, icon: Package, color: 'blue' },
            { title: 'Low / Out of Stock', value: stats.lowStock, icon: AlertTriangle, color: 'red' },
            { title: 'Avg Unit Cost', value: formatCurrency(stats.avgUnitCost), icon: Warehouse, color: 'purple' },
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

        {/* ── Search + Filters ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search SKU, name, supplier, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Date Buttons */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {(['all', 'today', 'week', 'month', 'custom'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setDateRangeMode(opt);
                      if (opt !== 'custom') setDateRange({ start: '', end: '' });
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

              {/* Custom Date */}
              {dateRangeMode === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange((p) => ({ ...p, start: e.target.value }))}
                    className="px-3 py-1.5 text-xs border rounded"
                  />
                  <span className="text-gray-500 text-sm">to</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange((p) => ({ ...p, end: e.target.value }))}
                    className="px-3 py-1.5 text-xs border rounded"
                  />
                </div>
              )}
            </div>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-sm"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
            <p className="text-red-800">{error}</p>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* ── Table ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No inventory items match the current filters
                    </td>
                  </tr>
                ) : (
                  filteredData.map((s) => {
                    const status = getStockStatus(s.receivedQuantity, s.reorderLevel);
                    return (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.sku}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div>{s.itemName}</div>
                          {s.supplier && <div className="text-xs text-gray-500">{s.supplier}</div>}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{s.warehouseLocation}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                          {s.receivedQuantity} {s.unitOfMeasure}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                          {formatCurrency(Number(s.unitCost))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                          {formatCurrency(Number(s.totalValue))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
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

        {/* ── Footer ── */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {filteredData.length} of {stocks.length} items
        </div>
      </div>
    </div>
  );
};

export default InventoryReportPage;
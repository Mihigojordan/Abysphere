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
    <div className="min-h-screen bg-gray-50 text-xs">
      {/* Header Section */}
      <div className="bg-white shadow-md">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Inventory Report</h1>
              <p className="text-xs text-gray-500 mt-0.5">Full overview of received stock and current levels</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={exportToCSV}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50"
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
            { title: 'Total Inventory Value', value: formatCurrency(stats.totalValue), icon: DollarSign, color: 'green' },
            { title: 'Total Quantity', value: stats.totalQty, icon: Package, color: 'blue' },
            { title: 'Low / Out of Stock', value: stats.lowStock, icon: AlertTriangle, color: 'orange' },
            { title: 'Avg Unit Cost', value: formatCurrency(stats.avgUnitCost), icon: Warehouse, color: 'purple' },
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
                  placeholder="Search SKU, name, supplier, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Date Buttons */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded">
                {(['all', 'today', 'week', 'month', 'custom'] as const).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setDateRangeMode(opt);
                      if (opt !== 'custom') setDateRange({ start: '', end: '' });
                    }}
                    className={`px-2 py-1 text-xs font-medium rounded capitalize transition-colors ${dateRangeMode === opt
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
                    className="px-2 py-1 text-xs border border-gray-200 rounded"
                  />
                  <span className="text-gray-500 text-xs">to</span>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange((p) => ({ ...p, end: e.target.value }))}
                    className="px-2 py-1 text-xs border border-gray-200 rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">SKU</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">Item</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">Location</th>
                  <th className="text-right py-2 px-2 text-gray-600 font-medium">Qty</th>
                  <th className="text-right py-2 px-2 text-gray-600 font-medium">Unit Cost</th>
                  <th className="text-right py-2 px-2 text-gray-600 font-medium">Total Value</th>
                  <th className="text-center py-2 px-2 text-gray-600 font-medium">Status</th>
                  <th className="text-left py-2 px-2 text-gray-600 font-medium">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-2 py-8 text-center text-xs text-gray-500">
                      No inventory items match the current filters
                    </td>
                  </tr>
                ) : (
                  filteredData.map((s) => {
                    const status = getStockStatus(s.receivedQuantity, s.reorderLevel);
                    return (
                      <tr key={s.id} className="hover:bg-gray-25">
                        <td className="py-2 px-2 text-gray-700 font-mono">{s.sku}</td>
                        <td className="py-2 px-2">
                          <div className="text-gray-900">{s.itemName}</div>
                          {s.supplier && <div className="text-xs text-gray-500">{s.supplier}</div>}
                        </td>
                        <td className="py-2 px-2 text-gray-700">{s.warehouseLocation}</td>
                        <td className="py-2 px-2 text-gray-700 text-right">
                          {s.receivedQuantity} {s.unitOfMeasure}
                        </td>
                        <td className="py-2 px-2 text-gray-700 text-right">
                          {formatCurrency(Number(s.unitCost))}
                        </td>
                        <td className="py-2 px-2 text-gray-700 text-right font-medium">
                          {formatCurrency(Number(s.totalValue))}
                        </td>
                        <td className="py-2 px-2">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-gray-700">
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
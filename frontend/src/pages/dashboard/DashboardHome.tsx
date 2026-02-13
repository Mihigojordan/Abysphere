import React, { useState, useEffect } from 'react';
import {
  Users, Package, DollarSign, TrendingUp, AlertCircle,
  RefreshCw,
  TrendingDown, Activity, ArrowUpRight, ArrowDownRight,
  Calendar, ChevronDown, X
} from 'lucide-react';

import clientService from '../../services/clientService';
import assetService from '../../services/assetService';
import supplierService from '../../services/supplierService';
import employeeService from '../../services/employeeService';
import stockService from '../../services/stockInService';
import stockOutService from '../../services/stockoutService';
import salesReturnService from '../../services/salesReturnService';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
function formatCurrency(amount: number | bigint, currency = "RWF", locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0, // RWF typically has no cents
    maximumFractionDigits: 0
  }).format(amount);
}

// Date Filter Types
type DateFilterOption = 'all' | 'today' | 'week' | 'month' | '3month' | 'year' | 'custom';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

const dateFilterOptions: { value: DateFilterOption; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: '3month', label: 'Last 3 Months' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

const getDateRange = (filter: DateFilterOption, customRange?: DateRange): DateRange => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (filter) {
    case 'today':
      return { start: today, end: now };
    case 'week': {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return { start: weekAgo, end: now };
    }
    case 'month': {
      const monthAgo = new Date(today);
      monthAgo.setDate(monthAgo.getDate() - 30);
      return { start: monthAgo, end: now };
    }
    case '3month': {
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return { start: threeMonthsAgo, end: now };
    }
    case 'year': {
      const yearAgo = new Date(today);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return { start: yearAgo, end: now };
    }
    case 'custom':
      return customRange || { start: null, end: null };
    case 'all':
    default:
      return { start: null, end: null };
  }
};

// Date Filter Component
const DateFilter: React.FC<{
  selectedFilter: DateFilterOption;
  onFilterChange: (filter: DateFilterOption) => void;
  customRange: DateRange;
  onCustomRangeChange: (range: DateRange) => void;
}> = ({ selectedFilter, onFilterChange, customRange, onCustomRangeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const selectedLabel = dateFilterOptions.find(opt => opt.value === selectedFilter)?.label || 'All Time';

  const handleFilterSelect = (filter: DateFilterOption) => {
    onFilterChange(filter);
    if (filter === 'custom') {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-theme-bg-primary border border-theme-border rounded-lg hover:bg-theme-bg-tertiary transition-colors text-sm"
      >
        <Calendar className="w-4 h-4 text-primary-500" />
        <span className="text-theme-text-primary font-medium">{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-theme-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-theme-bg-primary border border-theme-border rounded-lg shadow-lg z-20 py-1">
          {dateFilterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleFilterSelect(option.value)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-theme-bg-tertiary transition-colors ${selectedFilter === option.value
                ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 font-medium'
                : 'text-theme-text-primary'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Custom Date Range Picker */}
      {showCustomPicker && selectedFilter === 'custom' && (
        <div className="absolute right-0 mt-2 p-4 bg-theme-bg-primary border border-theme-border rounded-lg shadow-lg z-20 w-72">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-theme-text-primary">Custom Range</span>
            <button
              onClick={() => setShowCustomPicker(false)}
              className="p-1 hover:bg-theme-bg-tertiary rounded"
            >
              <X className="w-4 h-4 text-theme-text-secondary" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-theme-text-secondary mb-1">Start Date</label>
              <input
                type="date"
                value={customRange.start ? customRange.start.toISOString().split('T')[0] : ''}
                onChange={(e) => onCustomRangeChange({
                  ...customRange,
                  start: e.target.value ? new Date(e.target.value) : null
                })}
                className="w-full px-3 py-2 text-sm border border-theme-border rounded-lg bg-theme-bg-secondary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs text-theme-text-secondary mb-1">End Date</label>
              <input
                type="date"
                value={customRange.end ? customRange.end.toISOString().split('T')[0] : ''}
                onChange={(e) => onCustomRangeChange({
                  ...customRange,
                  end: e.target.value ? new Date(e.target.value) : null
                })}
                className="w-full px-3 py-2 text-sm border border-theme-border rounded-lg bg-theme-bg-secondary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Backdrop for closing dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};



const StatCard = ({ title, value, change, trend, icon: Icon, color, subtitle, link }: any) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (link) {
      navigate(link);
    }
  };

  return (
    <div
      className={`bg-theme-bg-primary rounded-lg shadow-sm border border-theme-border p-3 hover:shadow-md transition-all ${link ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium text-theme-text-secondary uppercase tracking-wide">{title}</p>
          <p className="text-xl font-bold text-theme-text-primary mt-0.5 truncate">{value}</p>
          {subtitle && <p className="text-[9px] text-theme-text-secondary mt-0.5">{subtitle}</p>}
          {change !== undefined && (
            <p className={`text-[10px] mt-1 font-semibold flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {change}%
            </p>
          )}
        </div>
        <div className={`p-2 rounded-lg ${color} flex-shrink-0`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
};
const DashboardHome: React.FC<{ role: 'ADMIN' | 'EMPLOYEE' }> = ({ role }) => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [customDateRange, setCustomDateRange] = useState<DateRange>({ start: null, end: null });
  const [rawData, setRawData] = useState<{
    clients: any[];
    employees: any[];
    assets: any[];
    stockIns: any[];
    stockOuts: any[];
    returns: any[];
    suppliers: any[];
  }>({
    clients: [],
    employees: [],
    assets: [],
    stockIns: [],
    stockOuts: [],
    returns: [],
    suppliers: [],
  });
  const [stats, setStats] = useState({
    totalClients: 0,
    totalEmployees: 0,
    totalSuppliers: 0,
    totalStockValue: 0,
    totalStockItems: 0,
    todaySales: 0,
    weekSales: 0,
    monthSales: 0,
    avgOrderValue: 0,
    lowStock: 0,
    outOfStock: 0,
    pendingReturns: 0,
    totalReturnsValue: 0,
    profitMargin: 0,
    totalAssets: 0,
    totalProfit: 0,
    totalStockRecords: 0 // Track distinct stock request items for accurate counts
  });



  // SAFELY GET ARRAY FROM ANY API RESPONSE
  const safeArray = (data: any): any[] => {
    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data)) return data.data;
    if (data?.items && Array.isArray(data.items)) return data.items;
    return [];
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [
          rawClientsData, rawEmployeesData, rawAssetsData,
          rawStockInsData, rawStockOutsData, rawReturnsData, rawSuppliersData
        ] = await Promise.all([
          clientService.getAllClients(),
          employeeService.getAllEmployees(),
          assetService.getAllAssets(),
          stockService.getAllStockIns(),
          stockOutService.getAllStockOuts(),
          salesReturnService.getAllSalesReturns(),
          supplierService.getAllSuppliers(),
        ]);

        setRawData({
          clients: safeArray(rawClientsData),
          employees: safeArray(rawEmployeesData),
          assets: safeArray(rawAssetsData),
          stockIns: safeArray(rawStockInsData),
          stockOuts: safeArray(rawStockOutsData),
          returns: safeArray(rawReturnsData),
          suppliers: safeArray(rawSuppliersData),
        });

      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const id = setInterval(loadData, 30000);
    return () => clearInterval(id);
  }, []);

  // Filter data based on date range
  const filterByDate = (items: any[], dateField: string = 'createdAt') => {
    const range = getDateRange(dateFilter, customDateRange);
    if (!range.start && !range.end) return items;

    return items.filter((item: any) => {
      const itemDate = new Date(item[dateField]);
      if (range.start && itemDate < range.start) return false;
      if (range.end && itemDate > range.end) return false;
      return true;
    });
  };

  // Calculate filtered stats
  useEffect(() => {
    const { clients, employees, assets, stockIns, stockOuts, returns, suppliers } = rawData;

    // Apply date filter
    const filteredClients = filterByDate(clients);
    const filteredEmployees = filterByDate(employees);
    const filteredStockIns = filterByDate(stockIns);
    const filteredStockOuts = filterByDate(stockOuts);
    const filteredReturns = filterByDate(returns);
    const filteredSuppliers = filterByDate(suppliers);
    const filteredAssets = filterByDate(assets);

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today); monthAgo.setDate(monthAgo.getDate() - 30);

    // REVENUE (from filtered stock outs)
    const todayRevenue = filteredStockOuts
      .filter((s: any) => s.createdAt?.startsWith(todayStr))
      .reduce((sum: number, s: any) => sum + (Number(s.soldPrice) || 0) * (Number(s.quantity) || 0), 0);

    const weekRevenue = filteredStockOuts
      .filter((s: any) => new Date(s.createdAt) >= weekAgo)
      .reduce((sum: number, s: any) => sum + (Number(s.soldPrice) || 0) * (Number(s.quantity) || 0), 0);

    const monthRevenue = filteredStockOuts
      .filter((s: any) => new Date(s.createdAt) >= monthAgo)
      .reduce((sum: number, s: any) => sum + (Number(s.soldPrice) || 0) * (Number(s.quantity) || 0), 0);

    const totalCost = filteredStockOuts.reduce((sum: number, s: any) => {
      const stockIn = s.stockin;
      return sum + (Number(stockIn?.unitCost) || 0) * (Number(s.quantity) || 0);
    }, 0);

    const totalRevenue = filteredStockOuts.reduce((sum: number, s: any) =>
      sum + (Number(s.soldPrice) || 0) * (Number(s.quantity) || 0), 0);

    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;
    const avgOrder = filteredStockOuts.length > 0 ? totalRevenue / filteredStockOuts.length : 0;

    const lowStockItems = filteredStockIns.filter((s: any) =>
      s.reorderLevel && s.quantity > 0 && s.quantity <= s.reorderLevel);
    const outOfStockItems = filteredStockIns.filter((s: any) => s.quantity === 0);

    const returnsValue = filteredReturns.reduce((sum: number, r: any) => sum + (Number(r.refundAmount) || 0), 0);
    const totalStockValue = filteredStockIns.reduce((s: number, i: any) =>
      s + (Number(i.unitPrice) || 0) * (Number(i.quantity) || 0), 0);
    const totalStockItems = filteredStockIns.reduce((s: number, i: any) => s + (Number(i.quantity) || 0), 0);
    const totalAssetsValue = filteredAssets.reduce((s: number, a: any) => s + (Number(a.value) || 0), 0);

    setStats({
      totalClients: filteredClients.length,
      totalEmployees: filteredEmployees.length,
      totalSuppliers: filteredSuppliers.length,
      totalStockValue: Math.round(totalStockValue),
      totalStockItems: Math.round(totalStockItems),
      totalStockRecords: filteredStockIns.length,
      todaySales: Math.round(todayRevenue),
      weekSales: Math.round(weekRevenue),
      monthSales: Math.round(monthRevenue),
      avgOrderValue: Math.round(avgOrder),
      lowStock: lowStockItems.length,
      outOfStock: outOfStockItems.length,
      pendingReturns: filteredReturns.length,
      totalReturnsValue: Math.round(returnsValue),
      profitMargin: Math.round(profitMargin * 10) / 10,
      totalAssets: Math.round(totalAssetsValue),
      totalProfit: Math.round(totalProfit)
    });
  }, [rawData, dateFilter, customDateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-theme-bg-secondary">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin mr-3" />
        <span className="text-lg text-theme-text-primary">{t('dashboard.loading')}</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg-secondary text-theme-text-primary transition-colors duration-200">
      {/* HEADER */}
      <div className="bg-theme-bg-primary shadow-sm border-b border-theme-border sticky top-0 z-10 transition-colors duration-200">
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-theme-text-primary">{t('dashboard.title')}</h1>
            <p className="text-[10px] text-theme-text-secondary">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <DateFilter
              selectedFilter={dateFilter}
              onFilterChange={setDateFilter}
              customRange={customDateRange}
              onCustomRangeChange={setCustomDateRange}
            />
            <button onClick={() => window.location.reload()} className="p-1.5 hover:bg-theme-bg-tertiary rounded-lg text-theme-text-primary">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* KPI ROW - 12 CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* BLUE CARDS (Total 9: 4 existing + 5 new/moved) */}
          <StatCard
            title={t('dashboard.todaySales')}
            value={`${formatCurrency(stats.todaySales)}`}
            change={18}
            trend="up"
            icon={DollarSign}
            color="bg-primary-500"
            subtitle={t('dashboard.dailyRevenue')}
            link="/admin/dashboard/stockout-management"
          />
          <StatCard
            title={t('dashboard.weekSales')}
            value={`${formatCurrency(stats.weekSales)}`}
            change={15}
            trend="up"
            icon={TrendingUp}
            color="bg-primary-500"
            subtitle={t('dashboard.weeklyRevenue')}
            link="/admin/dashboard/stockout-management"
          />
          <StatCard
            title={t('dashboard.clients')}
            value={stats.totalClients}
            change={12}
            trend="up"
            icon={Users}
            color="bg-primary-500"
            link="/admin/dashboard/client-management"
          />
          <StatCard
            title={t('dashboard.stockItems')}
            value={stats.totalStockItems.toLocaleString()}
            icon={Package}
            color="bg-primary-500"
            subtitle={t('dashboard.totalUnits')}
            link="/admin/dashboard/stock-alerts"
          />
          <StatCard
            title={t('dashboard.employees')}
            value={stats.totalEmployees}
            change={5}
            trend="up"
            icon={Users}
            color="bg-primary-500"
            link="/admin/dashboard/employee-management"
          />
          <StatCard
            title={t('dashboard.suppliers')}
            value={stats.totalSuppliers}
            change={8}
            trend="up"
            icon={TrendingUp}
            color="bg-primary-500"
            link="/admin/dashboard/supplier-management"
          />
          <StatCard
            title={t('dashboard.totalAssets')} // Ensure translation key or fallback
            value={`${formatCurrency(stats.totalAssets)}`}
            icon={DollarSign}
            color="bg-primary-500"
            link="/admin/dashboard/asset-management"
          />
          <StatCard
            title={t('dashboard.totalProfit')}
            value={`${formatCurrency(stats.totalProfit)}`}
            change={8.5}
            trend="up"
            icon={TrendingUp}
            color="bg-primary-500"
            link="/admin/dashboard/reports/sales"
          />

          {/* YELLOW CARD (1) */}
          <StatCard
            title={t('dashboard.lowStock')}
            value={stats.lowStock}
            icon={AlertCircle}
            color="bg-yellow-500"
            subtitle={t('dashboard.needReorder')}
            link="/admin/dashboard/stock-alerts"
          />

          {/* RED CARDS (3: 2 existing + 1 new) */}
          <StatCard
            title={t('dashboard.outOfStock')}
            value={stats.outOfStock}
            icon={TrendingDown}
            color="bg-red-500"
            subtitle={t('dashboard.zeroInventory')}
            link="/admin/dashboard/stock-alerts"
          />
          <StatCard
            title={t('dashboard.returns')}
            value={stats.pendingReturns}
            icon={RefreshCw}
            color="bg-red-500"
            subtitle={t('dashboard.pending')}
            link="/admin/dashboard/sales-return-management"
          />
          <StatCard
            title={t('dashboard.returnsValue')}
            value={`${formatCurrency(stats.totalReturnsValue)}`}
            icon={DollarSign}
            color="bg-red-500"
            subtitle={t('dashboard.refunds')}
            link="/admin/dashboard/sales-return-management"
          />
        </div>

        {/* INSIGHTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-theme-bg-primary p-4 rounded-lg shadow-sm border border-theme-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-theme-text-primary">
              <Package className="w-4 h-4 text-teal-600" /> {t('dashboard.stockHealth')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary-500 rounded-lg"><Package className="w-4 h-4 text-white" /></div>
                  <div><p className="text-xs font-medium text-theme-text-primary">Good</p></div>
                </div>
                {/* Calculate using total RECORDS not quantity */}
                <p className="text-lg font-bold text-primary-700 dark:text-primary-400">{Math.max(0, stats.totalStockRecords - stats.lowStock - stats.outOfStock)}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500 rounded-lg"><AlertCircle className="w-4 h-4 text-white" /></div>
                  <div><p className="text-xs font-medium text-theme-text-primary">Warning</p></div>
                </div>
                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{stats.lowStock}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500 rounded-lg"><TrendingDown className="w-4 h-4 text-white" /></div>
                  <div><p className="text-xs font-medium text-theme-text-primary">Critical</p></div>
                </div>
                <p className="text-lg font-bold text-red-700 dark:text-red-400">{stats.outOfStock}</p>
              </div>
            </div>
          </div>

          <div className="bg-theme-bg-primary p-4 rounded-lg shadow-sm border border-theme-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-theme-text-primary">
              <DollarSign className="w-4 h-4 text-primary-600" /> {t('dashboard.financialSummary')}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-medium text-theme-text-primary">{t('dashboard.monthSales')}</p>
                  <TrendingUp className="w-4 h-4 text-primary-600" />
                </div>
                <p className="text-xl font-bold text-primary-700 dark:text-primary-400">{formatCurrency(stats.monthSales)}</p>
                <p className="text-[10px] text-theme-text-secondary mt-1">{t('dashboard.monthlyRevenue')}</p>
              </div>

              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-medium text-theme-text-primary">{t('dashboard.stockValue')}</p>
                </div>
                <p className="text-xl font-bold text-primary-700 dark:text-primary-400">{formatCurrency(stats.totalStockValue)}</p>
                <p className="text-[10px] text-theme-text-secondary mt-1">{t('dashboard.totalInventory')}</p>
              </div>

              <div className="p-3 bg-teal-50 dark:bg-primary-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-medium text-theme-text-secondary">{t('dashboard.profitMargin')}</p>
                </div>
                <p className="text-lg font-bold text-teal-700 dark:text-teal-400">{stats.profitMargin}%</p>
              </div>

              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-medium text-theme-text-secondary">{t('dashboard.avgOrder')}</p>
                </div>
                <p className="text-lg font-bold text-primary-700 dark:text-primary-400">{formatCurrency(stats.avgOrderValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-theme-bg-primary p-3 rounded-lg shadow-sm border border-theme-border">
          <div className="flex items-center justify-between text-[10px] text-theme-text-secondary">
            <p>{t('dashboard.lastUpdated')}: {new Date().toLocaleTimeString()}</p>
            <p className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {t('dashboard.autoRefresh')}
            </p>
            <p>{t('dashboard.roleLabel')}: {role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
import React, { useState, useEffect } from 'react';
import {
  Users, Package, DollarSign, TrendingUp, AlertCircle,
  Truck, RefreshCw,
  ShoppingCart, TrendingDown, Activity, Layers, ArrowUpRight, ArrowDownRight
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
    totalProfit: 0  // ADD THIS LINE
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
          rawClients, rawEmployees, rawAssets,
          rawStockIns, rawStockOuts, rawReturns, rawSuppliers
        ] = await Promise.all([
          clientService.getAllClients(),
          employeeService.getAllEmployees(),
          assetService.getAllAssets(),
          stockService.getAllStockIns(),
          stockOutService.getAllStockOuts(),
          salesReturnService.getAllSalesReturns(),
          supplierService.getAllSuppliers(),
        ]);

        const clients = safeArray(rawClients);
        const employees = safeArray(rawEmployees);
        const assets = safeArray(rawAssets);
        const stockIns = safeArray(rawStockIns);
        const stockOuts = safeArray(rawStockOuts);
        const returns = safeArray(rawReturns);
        const suppliers = safeArray(rawSuppliers);

        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today); monthAgo.setDate(monthAgo.getDate() - 30);

        // REVENUE
        const todayRevenue = stockOuts
          .filter((s: any) => s.createdAt?.startsWith(todayStr))
          .reduce((sum: number, s: any) => sum + (Number(s.soldPrice) || 0) * (Number(s.quantity) || 0), 0);

        const weekRevenue = stockOuts
          .filter((s: any) => new Date(s.createdAt) >= weekAgo)
          .reduce((sum: number, s: any) => sum + (Number(s.soldPrice) || 0) * (Number(s.quantity) || 0), 0);

        const monthRevenue = stockOuts
          .filter((s: any) => new Date(s.createdAt) >= monthAgo)
          .reduce((sum: number, s: any) => sum + (Number(s.soldPrice) || 0) * (Number(s.quantity) || 0), 0);

        const totalCost = stockOuts.reduce((sum: number, s: any) => {
          const stockIn = s.stockin;
          console.log('one ', stockIn, sum);

          return sum + (Number(stockIn?.unitCost) || 0) * (Number(s.quantity) || 0);
        }, 0);

        const totalRevenue = stockOuts.reduce((sum: number, s: any) =>
          sum + (Number(s.soldPrice) || 0) * (Number(s.quantity) || 0), 0);

        const totalProfit = totalRevenue - totalCost;  // ADD THIS LINE
        console.log('total profit :', totalProfit);
        console.log('total revenue :', totalRevenue);
        console.log('total cost: ', stockOuts);

        const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;
        const avgOrder = stockOuts.length > 0 ? totalRevenue / stockOuts.length : 0;

        const lowStockItems = stockIns.filter((s: any) =>
          s.reorderLevel && s.quantity > 0 && s.quantity <= s.reorderLevel);
        const outOfStockItems = stockIns.filter((s: any) => s.quantity === 0);

        const returnsValue = returns.reduce((sum: number, r: any) => sum + (Number(r.refundAmount) || 0), 0);
        const totalStockValue = stockIns.reduce((s: number, i: any) =>
          s + (Number(i.unitPrice) || 0) * (Number(i.quantity) || 0), 0);
        const totalStockItems = stockIns.reduce((s: number, i: any) => s + (Number(i.quantity) || 0), 0);
        const totalAssetsValue = assets.reduce((s: number, a: any) => s + (Number(a.value) || 0), 0);

        // UPDATE ALL STATE
        setStats({
          totalClients: clients.length,
          totalEmployees: employees.length,
          totalSuppliers: suppliers.length,
          totalStockValue: Math.round(totalStockValue),
          totalStockItems: Math.round(totalStockItems),
          todaySales: Math.round(todayRevenue),
          weekSales: Math.round(weekRevenue),
          monthSales: Math.round(monthRevenue),
          avgOrderValue: Math.round(avgOrder),
          lowStock: lowStockItems.length,
          outOfStock: outOfStockItems.length,
          pendingReturns: returns.length,
          totalReturnsValue: Math.round(returnsValue),
          profitMargin: Math.round(profitMargin * 10) / 10,
          totalAssets: Math.round(totalAssetsValue),
          totalProfit: Math.round(totalProfit)
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
          <div className="flex gap-2">
            {/* <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" /> Export
            </button> */}
            <button onClick={() => window.location.reload()} className="p-1.5 hover:bg-theme-bg-tertiary rounded-lg text-theme-text-primary">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* KPI ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
            title={t('dashboard.employees')}
            value={stats.totalEmployees}
            change={5}
            trend="up"
            icon={Users}
            color="bg-indigo-500"
            link="/admin/dashboard/employee-management"
          />
          <StatCard
            title={t('dashboard.suppliers')}
            value={stats.totalSuppliers}
            change={8}
            trend="up"
            icon={Truck}
            color="bg-orange-500"
            link="/admin/dashboard/supplier-management"
          />
        </div>

        {/* KPI ROW 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title={t('dashboard.todaySales')}
            value={`${formatCurrency(stats.todaySales)}`}
            change={18}
            trend="up"
            icon={DollarSign}
            color="bg-green-500"
            subtitle={t('dashboard.dailyRevenue')}
            link="/admin/dashboard/stockout-management"
          />
          <StatCard
            title={t('dashboard.weekSales')}
            value={`${formatCurrency(stats.weekSales)}`}
            change={15}
            trend="up"
            icon={TrendingUp}
            color="bg-emerald-500"
            subtitle={t('dashboard.weeklyRevenue')}
            link="/admin/dashboard/stockout-management"
          />
          <StatCard
            title={t('dashboard.monthSales')}
            value={`${formatCurrency(stats.monthSales)}`}
            change={22}
            trend="up"
            icon={Activity}
            color="bg-teal-500"
            subtitle={t('dashboard.monthlyRevenue')}
            link="/admin/dashboard/reports/sales"
          />
          <StatCard
            title={t('dashboard.avgOrder')}
            value={`${formatCurrency(stats.avgOrderValue)}`}
            icon={ShoppingCart}
            color="bg-cyan-500"
            subtitle={t('dashboard.perTransaction')}
            link="/admin/dashboard/stockout-management"
          />
        </div>

        {/* KPI ROW 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title={t('dashboard.stockValue')}
            value={`${formatCurrency(stats.totalStockValue)}`}
            icon={Package}
            color="bg-primary-600"
            subtitle={t('dashboard.totalInventory')}
            link="/admin/dashboard/stockin-management"
          />
          <StatCard
            title={t('dashboard.stockItems')}
            value={stats.totalStockItems.toLocaleString()}
            icon={Layers}
            color="bg-indigo-600"
            subtitle={t('dashboard.totalUnits')}
            link="/admin/dashboard/stockin-management"
          />
          <StatCard
            title={t('dashboard.lowStock')}
            value={stats.lowStock}
            icon={AlertCircle}
            color="bg-yellow-500"
            subtitle={t('dashboard.needReorder')}
            link="/admin/dashboard/stockin-management"
          />
          <StatCard
            title={t('dashboard.outOfStock')}
            value={stats.outOfStock}
            icon={TrendingDown}
            color="bg-red-500"
            subtitle={t('dashboard.zeroInventory')}
            link="/admin/dashboard/stockin-management"
          />
        </div>

        {/* KPI ROW 4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title={t('dashboard.returns')}
            value={stats.pendingReturns}
            icon={RefreshCw}
            color="bg-amber-500"
            subtitle={t('dashboard.pending')}
            link="/admin/dashboard/sales-return-management"
          />
          <StatCard
            title={t('dashboard.returnsValue')}
            value={`${formatCurrency(stats.totalReturnsValue)}`}
            icon={DollarSign}
            color="bg-orange-600"
            subtitle={t('dashboard.refunds')}
            link="/admin/dashboard/sales-return-management"
          />
          <StatCard
            title={t('dashboard.totalProfit')}
            value={`${formatCurrency(stats.totalProfit)}`}
            change={8.5}
            trend="up"
            icon={TrendingUp}
            color="bg-emerald-600"
            subtitle={t('dashboard.revenueCost')}
            link="/admin/dashboard/reports/sales"
          />
          <StatCard
            title={t('dashboard.profitMargin')}
            value={`${stats.profitMargin}%`}
            change={3.2}
            trend="up"
            icon={TrendingUp}
            color="bg-green-600"
            subtitle={t('dashboard.overallMargin')}
            link="/admin/dashboard/reports/sales"
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
                  <div><p className="text-xs font-medium text-theme-text-primary">{t('dashboard.healthyStock')}</p><p className="text-[10px] text-theme-text-secondary">{t('dashboard.aboveReorder')}</p></div>
                </div>
                <p className="text-lg font-bold text-primary-700 dark:text-primary-400">{stats.totalStockItems - stats.lowStock - stats.outOfStock}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500 rounded-lg"><AlertCircle className="w-4 h-4 text-white" /></div>
                  <div><p className="text-xs font-medium text-theme-text-primary">{t('dashboard.lowStock')}</p><p className="text-[10px] text-theme-text-secondary">{t('dashboard.needReorder')}</p></div>
                </div>
                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{stats.lowStock}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500 rounded-lg"><TrendingDown className="w-4 h-4 text-white" /></div>
                  <div><p className="text-xs font-medium text-theme-text-primary">{t('dashboard.outOfStock')}</p><p className="text-[10px] text-theme-text-secondary">{t('dashboard.immediateAction')}</p></div>
                </div>
                <p className="text-lg font-bold text-red-700 dark:text-red-400">{stats.outOfStock}</p>
              </div>
            </div>
          </div>

          <div className="bg-theme-bg-primary p-4 rounded-lg shadow-sm border border-theme-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-theme-text-primary">
              <DollarSign className="w-4 h-4 text-green-600" /> {t('dashboard.financialSummary')}
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-medium text-theme-text-primary">{t('dashboard.monthSales')}</p>
                  <TrendingUp className="w-4 h-4 text-primary-600" />
                </div>
                <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">{formatCurrency(stats.monthSales)}</p>
                <p className="text-[10px] text-theme-text-secondary mt-1">{t('dashboard.monthlyRevenue')}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                  <p className="text-[10px] font-medium text-theme-text-secondary mb-1">{t('dashboard.stockValue')}</p>
                  <p className="text-lg font-bold text-primary-700 dark:text-primary-400">{formatCurrency(stats.totalStockValue)}</p>
                </div>

              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-teal-50 dark:bg-primary-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                  <p className="text-[10px] font-medium text-theme-text-secondary mb-1">{t('dashboard.profitMargin')}</p>
                  <p className="text-lg font-bold text-teal-700 dark:text-teal-400">{stats.profitMargin}%</p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-[10px] font-medium text-theme-text-secondary mb-1">{t('dashboard.avgOrder')}</p>
                  <p className="text-lg font-bold text-orange-700 dark:text-orange-400">{formatCurrency(stats.avgOrderValue)}</p>
                </div>
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
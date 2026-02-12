import React, { useState, useEffect } from 'react';
import {
  Users, Package, DollarSign, TrendingUp, AlertCircle, Building2,
  Truck, RefreshCw, Download, BarChart3, PieChart as PieChartIcon,
  ShoppingCart, TrendingDown, Activity, Layers, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart
} from 'recharts';




import clientService from '../../services/clientService';
import assetService from '../../services/assetService';
import supplierService from '../../services/supplierService';
import employeeService from '../../services/employeeService';
import stockService from '../../services/stockInService';
import stockOutService from '../../services/stockoutService';
import salesReturnService from '../../services/salesReturnService';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e'];
function formatCurrency(amount, currency = "RWF", locale = "en-USD") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0, // RWF typically has no cents
    maximumFractionDigits: 0
  }).format(amount);
}

const SafeTooltip = ({ active, payload, label, formatter }: any) => {
  if (!active || !payload || !payload[0]) return null;
  const value = payload[0].value;
  return (
    <div className="bg-gray-900 p-2 border border-gray-700 rounded shadow-xl">
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className="font-bold text-white text-xs">
        {formatter ? formatter(value) : value}
      </p>
    </div>
  );
};

const MultiTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="bg-gray-900 p-2 border border-gray-700 rounded shadow-xl">
      <p className="text-[10px] text-gray-400 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="font-bold text-xs" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
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

  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [monthlySales, setMonthlySales] = useState<any[]>([]);
  const [stockByCategory, setStockByCategory] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [supplierPerformance, setSupplierPerformance] = useState<any[]>([]);
  const [stockInOutTrend, setStockInOutTrend] = useState<any[]>([]);
  const [revenueVsCost, setRevenueVsCost] = useState<any[]>([]);
  const [clientActivity, setClientActivity] = useState<any[]>([]);
  const [productPerformance, setProductPerformance] = useState<any[]>([]);
  const [returnsAnalysis, setReturnsAnalysis] = useState<any[]>([]);

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
  console.log('one ',stockIn,sum);
  
  return sum + (Number(stockIn?.unitCost) || 0) * (Number(s.quantity) || 0);
}, 0);

const totalRevenue = stockOuts.reduce((sum: number, s: any) => 
  sum + (Number(s.soldPrice) || 0) * (Number(s.quantity) || 0), 0);

const totalProfit = totalRevenue - totalCost;  // ADD THIS LINE
console.log('total profit :',totalProfit);
console.log('total revenue :',totalRevenue);
console.log('total cost: ',stockOuts);

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

        // CHARTS
        const catMap: any = {};
        stockIns.forEach((i: any) => {
          const cat = i.stockcategory?.name || 'Uncategorized';
          catMap[cat] = (catMap[cat] || 0) + (Number(i.quantity) || 0);
        });
        const pieData = Object.entries(catMap)
          .map(([name, value]) => ({ name, value: Number(value) }))
          .sort((a: any, b: any) => b.value - a.value);

        const prodMap: any = {};
        stockOuts.forEach((s: any) => {
          const name = s.stockin?.productName || s.productName || 'Unknown';
          prodMap[name] = (prodMap[name] || 0) + (Number(s.quantity) || 0);
        });
        const top8 = Object.entries(prodMap)
          .sort((a: any, b: any) => (b[1] as number) - (a[1] as number))
          .slice(0, 8)
          .map(([name, qty]) => ({ name, qty }));

        const supMap: any = {};
        stockIns.forEach((i: any) => {
          const sup = i.supplier?.name || 'No Supplier';
          supMap[sup] = (supMap[sup] || 0) + (Number(i.quantity) || 0);
        });
        const supData = Object.entries(supMap)
          .map(([name, qty]) => ({ name, qty: Number(qty) }))
          .sort((a: any, b: any) => b.qty - a.qty)
          .slice(0, 8);

        const trend = Array.from({ length: 14 }, (_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (13 - i));
          const dateStr = d.toISOString().slice(0, 10);
          const dayRev = stockOuts
            .filter((s: any) => s.createdAt?.startsWith(dateStr))
            .reduce((sum: number, s: any) => sum + (Number(s.soldPrice) || 0) * (Number(s.quantity) || 0), 0);
          const dayOrders = stockOuts.filter((s: any) => s.createdAt?.startsWith(dateStr)).length;
          return { 
            day: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }), 
            sales: Math.round(dayRev),
            orders: dayOrders
          };
        });

        const monthlyData = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
          const monthStr = d.toISOString().slice(0, 7);
          const monthRev = stockOuts
            .filter((s: any) => s.createdAt?.startsWith(monthStr))
            .reduce((sum: number, s: any) => sum + (Number(s.soldPrice) || 0) * (Number(s.quantity) || 0), 0);
          return {
            month: d.toLocaleDateString('en', { month: 'short' }),
            revenue: Math.round(monthRev)
          };
        });

        const stockTrend = Array.from({ length: 10 }, (_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (9 - i));
          const dateStr = d.toISOString().slice(0, 10);
          const inQty = stockIns.filter((s: any) => s.createdAt?.startsWith(dateStr))
            .reduce((sum: number, s: any) => sum + (Number(s.quantity) || 0), 0);
          const outQty = stockOuts.filter((s: any) => s.createdAt?.startsWith(dateStr))
            .reduce((sum: number, s: any) => sum + (Number(s.quantity) || 0), 0);
          return {
            date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
            in: inQty,
            out: outQty
          };
        });

        const revCostData = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (6 - i));
          const dateStr = d.toISOString().slice(0, 10);
          const dayRev = stockOuts.filter((s: any) => s.createdAt?.startsWith(dateStr))
            .reduce((sum: number, s: any) => sum + (Number(s.soldPrice) || 0) * (Number(s.quantity) || 0), 0);
          const dayCost = stockOuts.filter((s: any) => s.createdAt?.startsWith(dateStr))
            .reduce((sum: number, s: any) => {
              const stockIn = stockIns.find((i: any) => i.id === s.stockInId);
              return sum + (Number(stockIn?.unitPrice) || 0) * (Number(s.quantity) || 0);
            }, 0);
          return {
            day: d.toLocaleDateString('en', { weekday: 'short' }),
            revenue: Math.round(dayRev),
            cost: Math.round(dayCost),
            profit: Math.round(dayRev - dayCost)
          };
        });

        const clientMap: any = {};
        stockOuts.forEach((s: any) => {
          const name = s.client?.name || 'Walk-in';
          clientMap[name] = (clientMap[name] || 0) + 1;
        });
        const clientData = Object.entries(clientMap)
          .map(([name, orders]) => ({ name, orders }))
          .sort((a: any, b: any) => b.orders - a.orders)
          .slice(0, 6);

        const prodRevMap: any = {};
        stockOuts.forEach((s: any) => {
          const name = s.stockin?.productName || s.productName || 'Unknown';
          prodRevMap[name] = (prodRevMap[name] || 0) + (Number(s.soldPrice) || 0) * (Number(s.quantity) || 0);
        });
        const prodPerfData = Object.entries(prodRevMap)
          .map(([name, revenue]) => ({ name, revenue: Math.round(revenue as number) }))
          .sort((a: any, b: any) => b.revenue - a.revenue)
          .slice(0, 6);

        const reasonMap: any = {};
        returns.forEach((r: any) => {
          const reason = r.reason || 'Unknown';
          reasonMap[reason] = (reasonMap[reason] || 0) + 1;
        });
        const returnsData = Object.entries(reasonMap)
          .map(([reason, count]) => ({ reason, count }))
          .sort((a: any, b: any) => b.count - a.count);

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
  totalProfit: Math.round(totalProfit)  // ADD THIS LINE
});
        setSalesTrend(trend);
        setMonthlySales(monthlyData);
        setStockByCategory(pieData);
        setTopProducts(top8);
        setSupplierPerformance(supData);
        setStockInOutTrend(stockTrend);
        setRevenueVsCost(revCostData);
        setClientActivity(clientData);
        setProductPerformance(prodPerfData);
        setReturnsAnalysis(returnsData);

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
        <span className="text-lg text-theme-text-primary">Loading Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-bg-secondary text-theme-text-primary transition-colors duration-200">
      {/* HEADER */}
      <div className="bg-theme-bg-primary shadow-sm border-b border-theme-border sticky top-0 z-10 transition-colors duration-200">
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-theme-text-primary">Analytics Dashboard</h1>
            <p className="text-[10px] text-theme-text-secondary">
              {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
    title="Clients" 
    value={stats.totalClients} 
    change={12} 
    trend="up" 
    icon={Users} 
    color="bg-primary-500" 
    link="/admin/dashboard/client-management" 
  />
  <StatCard 
    title="Employees" 
    value={stats.totalEmployees} 
    change={5} 
    trend="up" 
    icon={Users} 
    color="bg-indigo-500" 
    link="/admin/dashboard/employee-management" 
  />
  <StatCard 
    title="Suppliers" 
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
    title="Today Sales" 
    value={`${formatCurrency(stats.todaySales)}`} 
    change={18} 
    trend="up" 
    icon={DollarSign} 
    color="bg-green-500" 
    subtitle="Daily revenue" 
    link="/admin/dashboard/stockout-management" 
  />
  <StatCard 
    title="Week Sales" 
    value={`${formatCurrency(stats.weekSales)}`} 
    change={15} 
    trend="up" 
    icon={TrendingUp} 
    color="bg-emerald-500" 
    subtitle="7-day revenue" 
    link="/admin/dashboard/stockout-management" 
  />
  <StatCard 
    title="Month Sales" 
    value={`${formatCurrency(stats.monthSales)}`} 
    change={22} 
    trend="up" 
    icon={Activity} 
    color="bg-teal-500" 
    subtitle="30-day revenue" 
    link="/admin/dashboard/reports/sales" 
  />
  <StatCard 
    title="Avg Order" 
    value={`${formatCurrency(stats.avgOrderValue)}`} 
    icon={ShoppingCart} 
    color="bg-cyan-500" 
    subtitle="Per transaction" 
    link="/admin/dashboard/stockout-management" 
  />
</div>

{/* KPI ROW 3 */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
  <StatCard 
    title="Stock Value" 
    value={`${formatCurrency(stats.totalStockValue)}`} 
    icon={Package} 
    color="bg-primary-600" 
    subtitle="Total inventory" 
    link="/admin/dashboard/stockin-management" 
  />
  <StatCard 
    title="Stock Items" 
    value={stats.totalStockItems.toLocaleString()} 
    icon={Layers} 
    color="bg-indigo-600" 
    subtitle="Total units" 
    link="/admin/dashboard/stockin-management" 
  />
  <StatCard 
    title="Low Stock" 
    value={stats.lowStock} 
    icon={AlertCircle} 
    color="bg-yellow-500" 
    subtitle="Need reorder" 
    link="/admin/dashboard/stockin-management" 
  />
  <StatCard 
    title="Out of Stock" 
    value={stats.outOfStock} 
    icon={TrendingDown} 
    color="bg-red-500" 
    subtitle="Zero inventory" 
    link="/admin/dashboard/stockin-management" 
  />
</div>

{/* KPI ROW 4 */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
  <StatCard 
    title="Returns" 
    value={stats.pendingReturns} 
    icon={RefreshCw} 
    color="bg-amber-500" 
    subtitle="Pending" 
    link="/admin/dashboard/sales-return-management" 
  />
  <StatCard 
    title="Returns Value" 
    value={`${formatCurrency(stats.totalReturnsValue)}`} 
    icon={DollarSign} 
    color="bg-orange-600" 
    subtitle="Total refunds" 
    link="/admin/dashboard/sales-return-management" 
  />
  <StatCard 
    title="Total Profit" 
    value={`${formatCurrency(stats.totalProfit)}`} 
    change={8.5} 
    trend="up" 
    icon={TrendingUp} 
    color="bg-emerald-600" 
    subtitle="Revenue - Cost" 
    link="/admin/dashboard/reports/sales" 
  />
  <StatCard 
    title="Profit Margin" 
    value={`${stats.profitMargin}%`} 
    change={3.2} 
    trend="up" 
    icon={TrendingUp} 
    color="bg-green-600" 
    subtitle="Overall margin" 
    link="/admin/dashboard/reports/sales" 
  />
</div>
        {/* MAIN CHARTS ROW 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-theme-bg-primary p-4 rounded-lg shadow-sm border border-theme-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-theme-text-primary">
              <TrendingUp className="w-4 h-4 text-primary-600" /> 14-Day Sales & Orders Trend
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                <Tooltip content={<MultiTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Area yAxisId="left" type="monotone" dataKey="sales" fill="#3b82f6" fillOpacity={0.2} stroke="#3b82f6" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-theme-bg-primary p-4 rounded-lg shadow-sm border border-theme-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-theme-text-primary">
              <PieChartIcon className="w-4 h-4 text-purple-600" /> Stock Distribution
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stockByCategory}
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name.slice(0, 8)}: ${value}`}
                  labelStyle={{ fontSize: '9px' }}
                >
                  {stockByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<SafeTooltip formatter={(v: any) => `${v} units`} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MAIN CHARTS ROW 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-theme-bg-primary p-4 rounded-lg shadow-sm border border-theme-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-theme-text-primary">
              <DollarSign className="w-4 h-4 text-green- Unusual" /> Revenue, Cost & Profit (7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={revenueVsCost}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<MultiTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-theme-bg-primary p-4 rounded-lg shadow-sm border border-theme-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-theme-text-primary">
              <BarChart3 className="w-4 h-4 text-primary-600" /> 6-Month Revenue
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<SafeTooltip formatter={(v: any) => `${formatCurrency(v)}`} />} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SMALL CHARTS ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Top Products */}
          <div className="bg-theme-bg-primary p-4 rounded-lg shadow-sm border border-theme-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-theme-text-primary">
              <Package className="w-4 h-4 text-green-600" /> Top Products (Qty)
            </h3>
            {topProducts.length === 0 ? (
              <p className="text-center text-theme-text-secondary py-8 text-xs">No sales yet</p>
            ) : (
              <div className="space-y-2">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-theme-bg-tertiary rounded-lg hover:bg-theme-bg-secondary">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-bold text-sm text-theme-text-secondary">#{i + 1}</span>
                      <p className="font-medium text-xs truncate text-theme-text-primary">{p.name}</p>
                    </div>
                    <span className="text-xs font-bold text-primary-600">{p.qty}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stock Flow */}
          <div className="bg-theme-bg-primary p-4 rounded-lg shadow-sm border border-theme-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-theme-text-primary">
              <Activity className="w-4 h-4 text-orange-600" /> Stock Flow (10 Days)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={stockInOutTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<MultiTooltip />} />
                <Legend wrapperStyle={{ fontSize: '9px' }} />
                <Area type="monotone" dataKey="in" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                <Area type="monotone" dataKey="out" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Product Revenue */}
          <div className="bg-theme-bg-primary p-4 rounded-lg shadow-sm border border-theme-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-theme-text-primary">
              <DollarSign className="w-4 h-4 text-purple-600" /> Product Revenue
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={productPerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 9 }} />
                <Tooltip content={<SafeTooltip formatter={(v: any) => `${formatCurrency(v)}`} />} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Returns */}
          <div className="bg-theme-bg-primary p-4 rounded-lg shadow-sm border border-theme-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-theme-text-primary">
              <RefreshCw className="w-4 h-4 text-red-600" /> Returns by Reason
            </h3>
            {returnsAnalysis.length === 0 ? (
              <p className="text-center text-theme-text-secondary py-8 text-xs">No returns</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={returnsAnalysis}
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="count"
                    label={({ reason, count }) => `${reason.slice(0, 10)}: ${count}`}
                    labelStyle={{ fontSize: '9px' }}
                  >
                    {returnsAnalysis.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<SafeTooltip formatter={(v: any) => `${v} returns`} />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-theme-bg-primary p-4 rounded-lg shadow-sm border border-theme-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-theme-text-primary">
              <Truck className="w-4 h-4 text-orange-600" /> Top Suppliers by Volume
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={supplierPerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 9 }} />
                <Tooltip content={<SafeTooltip formatter={(v: any) => `${v} units`} />} />
                <Bar dataKey="qty" fill="#f59e0b" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-theme-bg-primary p-4 rounded-lg shadow-sm border border-theme-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-theme-text-primary">
              <Users className="w-4 h-4 text-primary-600" /> Top Clients by Orders
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={clientActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={70} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<SafeTooltip formatter={(v: any) => `${v} orders`} />} />
                <Bar dataKey="orders" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* INSIGHTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-theme-bg-primary p-4 rounded-lg shadow-sm border border-theme-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-theme-text-primary">
              <Package className="w-4 h-4 text-teal-600" /> Stock Health Overview
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg"><Package className="w-4 h-4 text-white" /></div>
                  <div><p className="text-xs font-medium text-theme-text-primary">Healthy Stock</p><p className="text-[10px] text-theme-text-secondary">Above reorder level</p></div>
                </div>
                <p className="text-lg font-bold text-green-700 dark:text-green-400">{stats.totalStockItems - stats.lowStock - stats.outOfStock}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500 rounded-lg"><AlertCircle className="w-4 h-4 text-white" /></div>
                  <div><p className="text-xs font-medium text-theme-text-primary">Low Stock Items</p><p className="text-[10px] text-theme-text-secondary">Need reordering soon</p></div>
                </div>
                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{stats.lowStock}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500 rounded-lg"><TrendingDown className="w-4 h-4 text-white" /></div>
                  <div><p className="text-xs font-medium text-theme-text-primary">Out of Stock</p><p className="text-[10px] text-theme-text-secondary">Immediate action needed</p></div>
                </div>
                <p className="text-lg font-bold text-red-700 dark:text-red-400">{stats.outOfStock}</p>
              </div>
            </div>
          </div>

          <div className="bg-theme-bg-primary p-4 rounded-lg shadow-sm border border-theme-border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-theme-text-primary">
              <DollarSign className="w-4 h-4 text-green-600" /> Financial Summary
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-medium text-theme-text-primary">Total Revenue (Month)</p>
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(stats.monthSales)}</p>
                <p className="text-[10px] text-theme-text-secondary mt-1">Last 30 days performance</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800">
                  <p className="text-[10px] font-medium text-theme-text-secondary mb-1">Inventory Value</p>
                  <p className="text-lg font-bold text-primary-700 dark:text-primary-400">{formatCurrency(stats.totalStockValue)}</p>
                </div>

              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-200 dark:border-teal-800">
                  <p className="text-[10px] font-medium text-theme-text-secondary mb-1">Profit Margin</p>
                  <p className="text-lg font-bold text-teal-700 dark:text-teal-400">{stats.profitMargin}%</p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                  <p className="text-[10px] font-medium text-theme-text-secondary mb-1">Avg Order Value</p>
                  <p className="text-lg font-bold text-orange-700 dark:text-orange-400">{formatCurrency(stats.avgOrderValue)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-theme-bg-primary p-3 rounded-lg shadow-sm border border-theme-border">
          <div className="flex items-center justify-between text-[10px] text-theme-text-secondary">
            <p>Last updated: {new Date().toLocaleTimeString()}</p>
            <p className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Auto-refresh every 30 seconds
            </p>
            <p>Role: {role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
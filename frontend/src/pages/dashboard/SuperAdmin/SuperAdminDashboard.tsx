import React, { useState, useEffect } from 'react';
import {
  Building2, TrendingUp, CreditCard, Clock, RefreshCw, Download,
  ArrowUpRight, ArrowDownRight, Activity, DollarSign, PieChart as PieChartIcon,
  BarChart3, AlertCircle, Package
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Area
} from 'recharts';
import companyService from '../../../services/companyService';
import membershipPlanService from '../../../services/membershipPlanService';
import demoRequestService from '../../../services/demoRequestService';
import systemFeaturesService from '../../../services/system-featuresService';

// === TYPES ===
interface Company {
  id: string;
  adminName?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
}

interface MembershipPlan {
  id: string;
  companyId: string;
  planName: string;
  amountPaid: number;
  startTime: string;
  expireTime: string;
}

interface DemoRequest {
  id: number;
  fullName: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

interface SystemFeature {
  id: string;
  name: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

// === TOOLTIP COMPONENTS ===
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

// === STAT CARD COMPONENT ===
const StatCard = ({ title, value, change, trend, icon: Icon, color, subtitle }: any) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:shadow-md transition-all">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5 truncate">{value}</p>
        {subtitle && <p className="text-[9px] text-gray-500 mt-0.5">{subtitle}</p>}
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

// === MAIN COMPONENT ===
const SuperAdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
  const [features, setFeatures] = useState<SystemFeature[]>([]);

  // === DATA LOADING ===
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [companiesData, plansData, demosData, featuresData] = await Promise.all([
          companyService.getAllCompanies(),
          membershipPlanService.getAllMembershipPlans(),
          demoRequestService.findAll(),
          systemFeaturesService.getAllSystemFeatures(),
        ]);

        setCompanies(companiesData || []);
        setMembershipPlans(plansData || []);
        setDemoRequests(demosData || []);
        setFeatures(featuresData || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const id = setInterval(loadData, 30000); // Auto-refresh every 30s
    return () => clearInterval(id);
  }, []);

  // === COMPUTED STATS ===
  const stats = {
    totalCompanies: companies.length,
    activeCompanies: companies.filter(c => c.status === 'ACTIVE').length,
    totalRevenue: membershipPlans.reduce((sum, p) => sum + p.amountPaid, 0),
    pendingDemos: demoRequests.filter(d => d.status === 'pending').length,
    activePlans: membershipPlans.filter(p => new Date(p.expireTime) > new Date()).length,
    expiringSoon: membershipPlans.filter(p => {
      const daysLeft = Math.ceil((new Date(p.expireTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysLeft > 0 && daysLeft <= 30;
    }).length,
  };

  // === CHART DATA ===
  const revenueByPlan = membershipPlans.reduce((acc: any[], plan) => {
    const existing = acc.find(item => item.name === plan.planName);
    if (existing) {
      existing.revenue += plan.amountPaid;
      existing.count += 1;
    } else {
      acc.push({ name: plan.planName, revenue: plan.amountPaid, count: 1 });
    }
    return acc;
  }, []);

  const companyGrowth = companies.reduce((acc: any[], company) => {
    if (!company.createdAt) return acc;
    const month = new Date(company.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
    const existing = acc.find(item => item.month === month);
    if (existing) existing.companies += 1;
    else acc.push({ month, companies: 1 });
    return acc;
  }, []).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

  const demoStatus = [
    { name: 'Pending', value: demoRequests.filter(d => d.status === 'pending').length },
    { name: 'Approved', value: demoRequests.filter(d => d.status === 'approved').length },
    { name: 'Rejected', value: demoRequests.filter(d => d.status === 'rejected').length },
  ].filter(d => d.value > 0);

  const monthlyRevenue = membershipPlans.reduce((acc: any[], plan) => {
    const month = new Date(plan.startTime).toLocaleString('default', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) existing.revenue += plan.amountPaid;
    else acc.push({ month, revenue: plan.amountPaid });
    return acc;
  }, []).sort((a, b) => new Date(`2025 ${a.month}`).getTime() - new Date(`2025 ${b.month}`).getTime());

  const planStatusData = [
    { status: 'Active', count: stats.activePlans },
    { status: 'Expiring Soon', count: stats.expiringSoon },
    { status: 'Expired', count: membershipPlans.length - stats.activePlans },
  ];

  const avgPlanValue = revenueByPlan.map(p => ({
    name: p.name,
    avgValue: Math.round(p.revenue / p.count),
  }));

  const expiringPlans = membershipPlans
    .filter(p => new Date(p.expireTime) > new Date())
    .sort((a, b) => new Date(a.expireTime).getTime() - new Date(b.expireTime).getTime())
    .slice(0, 5);

  // === LOADING STATE ===
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <RefreshCw className="w-8 h-8 text-primary-600 animate-spin mr-3" />
        <span className="text-lg">Loading Super Admin Dashboard...</span>
      </div>
    );
  }

  // === RENDER ===
  return (
    <div className="min-h-screen bg-gray-50">
      {/* === HEADER === */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Super Admin Dashboard</h1>
            <p className="text-[10px] text-gray-500">
              {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
            <button onClick={() => window.location.reload()} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* === KPI ROW 1 === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Total Companies" value={stats.totalCompanies} change={8} trend="up" icon={Building2} color="bg-blue-500" subtitle={`${stats.activeCompanies} active`} />
          <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} change={15} trend="up" icon={DollarSign} color="bg-green-500" subtitle="All time" />
          <StatCard title="Active Plans" value={stats.activePlans} change={5} trend="up" icon={CreditCard} color="bg-purple-500" subtitle="Current" />
          <StatCard title="Pending Demos" value={stats.pendingDemos} icon={Clock} color="bg-orange-500" subtitle="Awaiting review" />
        </div>

        {/* === KPI ROW 2 === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Expiring Soon" value={stats.expiringSoon} icon={AlertCircle} color="bg-yellow-500" subtitle="Next 30 days" />
          <StatCard title="Avg Plan Value" value={`$${Math.round(stats.totalRevenue / membershipPlans.length || 0).toLocaleString()}`} icon={TrendingUp} color="bg-teal-500" />
          <StatCard title="Plan Types" value={revenueByPlan.length} icon={Package} color="bg-indigo-500" />
          <StatCard title="Demo Requests" value={demoRequests.length} icon={Activity} color="bg-cyan-500" subtitle="Total" />
        </div>

        {/* === CHARTS ROW 1 === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-600" /> Company Growth (Monthly)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={companyGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<SafeTooltip formatter={(v: any) => `${v} new`} />} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Line type="monotone" dataKey="companies" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-purple-600" /> Demo Status
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={demoStatus}
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelStyle={{ fontSize: '9px' }}
                >
                  {demoStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<SafeTooltip formatter={(v: any) => `${v} requests`} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* === CHARTS ROW 2 === */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" /> Revenue by Plan Type
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <ComposedChart data={revenueByPlan}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
                <Tooltip content={<MultiTooltip />} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary-600" /> Monthly Revenue
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<SafeTooltip formatter={(v: any) => `$${v.toLocaleString()}`} />} />
                <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* === SMALL CHARTS === */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Package Movement className="w-4 h-4 text-green-600" /> Plan Distribution
            </h3>
            <div className="space-y-2">
              {revenueByPlan.map((p, i) => (
                <div key={i} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs font-medium truncate flex-1">{p.name}</span>
                  <span className="text-xs font-bold text-primary-600">{p.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-600" /> Plan Status
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={planStatusData} dataKey="count" outerRadius={70} innerRadius={40}>
                  {planStatusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<SafeTooltip formatter={(v: any) => `${v} plans`} />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-purple-600" /> Avg Plan Value
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={avgPlanValue} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 9 }} />
                <Tooltip content={<SafeTooltip formatter={(v: any) => `$${v.toLocaleString()}`} />} />
                <Bar dataKey="avgValue" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-red-600" /> Expiring Soon
            </h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {expiringPlans.length === 0 ? (
                <p className="text-center text-gray-500 py-6 text-xs">None</p>
              ) : (
                expiringPlans.map((p) => {
                  const days = Math.ceil((new Date(p.expireTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={p.id} className="text-xs p-2 bg-red-50 rounded border border-red-200">
                      <p className="font-medium truncate">{p.planName}</p>
                      <p className="text-red-600">{days} days left</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* === RECENT COMPANIES === */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary-600" /> Recent Companies
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Company</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Status</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Created</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-500">Plans</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {companies.slice(0, 6).map((c) => {
                  const plans = membershipPlans.filter(p => p.companyId === c.id);
                  return (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 truncate max-w-[120px]">{c.adminName || 'Unnamed'}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 text-[9px] rounded-full ${c.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {c.status || '—'}
                        </span>
                      </td>
                      <td className="px-3 py-2">{c.createdAt ? new Date(c.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '—'}</td>
                      <td className="px-3 py-2">{plans.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* === FOOTER === */}
        <div className="bg-white p-3 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between text-[10px] text-gray-500">
            <p>Last updated: {new Date().toLocaleTimeString()}</p>
            <p className="flex items-center gap-1">
              <Activity className="w-3 h-3" />
              Auto-refresh every 30 seconds
            </p>
            <p>Super Admin View</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
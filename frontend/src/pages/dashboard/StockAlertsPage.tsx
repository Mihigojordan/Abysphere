import React, { useState, useEffect } from 'react';
import {
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    ArrowUp,
    Loader,
    Box,
    Package,
    ShoppingCart,
    Search,
    RefreshCw,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Search as SearchIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import stockService from '../../services/stockService';
import stockOutService from '../../services/stockoutService';
import { useLanguage } from '../../context/LanguageContext';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    subtitle?: string;
    trend?: {
        value: number;
        isUp: boolean;
    };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, subtitle, trend }) => (
    <div className="bg-theme-bg-primary rounded-xl shadow-sm border border-theme-border p-4 hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-theme-text-secondary uppercase tracking-tight">{title}</p>
                <h3 className="text-2xl font-bold text-theme-text-primary mt-1 tracking-tight">{value}</h3>
                {subtitle && <p className="text-[10px] text-theme-text-secondary mt-1">{subtitle}</p>}
                {trend && (
                    <div className={`flex items-center gap-1 mt-2 text-[10px] font-bold ${trend.isUp ? 'text-green-500' : 'text-red-500'}`}>
                        {trend.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{trend.value}%</span>
                        <span className="text-theme-text-secondary font-normal ml-0.5">vs last month</span>
                    </div>
                )}
            </div>
            <div className={`p-2.5 rounded-xl ${color} bg-opacity-10 flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
    </div>
);

const StockAlertsPage: React.FC = () => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'lowStock' | 'highStock' | 'mostSold' | 'leastSold'>('lowStock');
    const [searchTerm, setSearchTerm] = useState('');
    const [alerts, setAlerts] = useState<{ lowStock: any[], highStock: any[] }>({ lowStock: [], highStock: [] });
    const [performance, setPerformance] = useState<{ mostSold: any[], leastSold: any[] }>({ mostSold: [], leastSold: [] });
    const [stats, setStats] = useState({
        totalItems: 0,
        lowStockCount: 0,
        outOfStockCount: 0,
        topSellingItem: 'N/A'
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [alertsData, performanceData] = await Promise.all([
                stockService.getStockAlerts(),
                stockOutService.getProductPerformance()
            ]);
            setAlerts(alertsData);
            setPerformance(performanceData);

            // Calculate stats
            const lowStockCount = alertsData.lowStock.length;
            const topSelling = performanceData.mostSold[0]?.itemName || performanceData.mostSold[0]?.name || 'N/A';

            // For out of stock and total items, we would ideally need a consolidated service
            // but for now we'll estimate or use available data
            setStats({
                totalItems: alertsData.lowStock.length + alertsData.highStock.length, // Placeholder logic
                lowStockCount: lowStockCount,
                outOfStockCount: alertsData.lowStock.filter((i: any) => (i.receivedQuantity || 0) === 0).length,
                topSellingItem: topSelling
            });
        } catch (error) {
            console.error("Failed to fetch stock alerts/performance", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getCurrentData = () => {
        let data = [];
        switch (activeTab) {
            case 'lowStock': data = alerts.lowStock; break;
            case 'highStock': data = alerts.highStock; break;
            case 'mostSold': data = performance.mostSold; break;
            case 'leastSold': data = performance.leastSold; break;
            default: data = [];
        }

        if (searchTerm.trim()) {
            const lowerTerm = searchTerm.toLowerCase();
            return data.filter((item: any) =>
                (item.itemName || item.name || '').toLowerCase().includes(lowerTerm) ||
                (item.sku || '').toLowerCase().includes(lowerTerm)
            );
        }
        return data;
    };

    const tabs = [
        { id: 'lowStock', label: t('stockAlerts.lowStock'), icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
        { id: 'highStock', label: t('stockAlerts.highStock'), icon: ArrowUp, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
        { id: 'mostSold', label: t('stockAlerts.mostSold'), icon: TrendingUp, color: 'text-green-500', bgColor: 'bg-green-500/10' },
        { id: 'leastSold', label: t('stockAlerts.leastSold'), icon: TrendingDown, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] bg-theme-bg-secondary">
                <Loader className="w-10 h-10 text-primary-600 animate-spin mb-4" />
                <p className="text-theme-text-secondary animate-pulse font-medium">{t('common.loading')}</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6 bg-theme-bg-secondary min-h-screen transition-colors duration-200">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-theme-text-primary flex items-center gap-2">
                        <Box className="w-7 h-7 text-primary-500" />
                        {t('stockAlerts.title')}
                    </h1>
                    <p className="text-theme-text-secondary text-sm mt-1">{t('stockAlerts.subtitle')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchData}
                        className="p-2.5 bg-theme-bg-primary border border-theme-border rounded-xl text-theme-text-secondary hover:text-primary-500 hover:border-primary-500 transition-all shadow-sm"
                        title={t('common.refresh')}
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-all shadow-md shadow-primary-500/20 text-sm">
                        <Download className="w-4 h-4" />
                        {t('stockIn.export')}
                    </button>
                </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title={t('stockAlerts.totalItems')}
                    value={stats.totalItems}
                    icon={Package}
                    color="bg-blue-500"
                    subtitle="Tracked in inventory"
                />
                <StatCard
                    title={t('stockAlerts.lowStock')}
                    value={stats.lowStockCount}
                    icon={AlertTriangle}
                    color="bg-red-500"
                    subtitle="Requires attention"
                />
                <StatCard
                    title={t('stockAlerts.outOfStock')}
                    value={stats.outOfStockCount}
                    icon={Box}
                    color="bg-orange-500"
                    subtitle="Urgent restock needed"
                />
                <StatCard
                    title={t('stockAlerts.topSelling')}
                    value={stats.topSellingItem}
                    icon={ShoppingCart}
                    color="bg-green-500"
                    subtitle="Best performing product"
                />
            </div>

            {/* Main Content Area */}
            <div className="bg-theme-bg-primary rounded-2xl shadow-sm border border-theme-border overflow-hidden">
                {/* Tabs & Controls */}
                <div className="p-4 border-b border-theme-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-hide">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? `${tab.bgColor} ${tab.color} ring-1 ring-inset ring-current`
                                    : 'text-theme-text-secondary hover:bg-theme-bg-tertiary hover:text-theme-text-primary'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 lg:w-64">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-text-secondary" />
                            <input
                                type="text"
                                placeholder={t('common.search')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-theme-bg-secondary border border-theme-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-theme-text-primary placeholder:text-theme-text-secondary/50"
                            />
                        </div>
                        <button className="p-2 bg-theme-bg-secondary border border-theme-border rounded-xl text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary transition-all">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Table View */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-theme-bg-tertiary/50 border-b border-theme-border">
                                <th className="px-6 py-4 text-xs font-bold text-theme-text-secondary uppercase tracking-wider">{t('stockAlerts.itemName')}</th>
                                <th className="px-6 py-4 text-xs font-bold text-theme-text-secondary uppercase tracking-wider">{t('stockAlerts.sku')}</th>
                                <th className="px-6 py-4 text-xs font-bold text-theme-text-secondary uppercase tracking-wider text-right">
                                    {activeTab.includes('Sold') ? t('stockAlerts.totalSold') : t('stockAlerts.availableQty')}
                                </th>
                                <th className="px-6 py-4 text-xs font-bold text-theme-text-secondary uppercase tracking-wider text-center">{t('common.status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme-border">
                            <AnimatePresence mode="popLayout">
                                {getCurrentData().length > 0 ? (
                                    getCurrentData().map((item: any, idx: number) => (
                                        <motion.tr
                                            key={item.id || idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.2, delay: idx * 0.03 }}
                                            className="group hover:bg-theme-bg-tertiary/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-theme-text-primary group-hover:text-primary-500 transition-colors">
                                                    {item.itemName || item.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="px-2 py-0.5 bg-theme-bg-tertiary text-xs text-theme-text-secondary rounded border border-theme-border font-mono">
                                                    {item.sku}
                                                </code>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`font-bold text-sm ${activeTab === 'lowStock' ? 'text-red-500' :
                                                    activeTab === 'highStock' ? 'text-blue-500' : 'text-theme-text-primary'
                                                    }`}>
                                                    {item.receivedQuantity !== undefined ? item.receivedQuantity : item.totalSold}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${activeTab === 'lowStock' ? 'bg-red-500/10 text-red-500' :
                                                    activeTab === 'highStock' ? 'bg-blue-500/10 text-blue-500' :
                                                        activeTab === 'mostSold' ? 'bg-green-500/10 text-green-500' :
                                                            'bg-gray-500/10 text-gray-500'
                                                    }`}>
                                                    {activeTab === 'lowStock' ? 'Critical' :
                                                        activeTab === 'highStock' ? 'Adequate' :
                                                            activeTab === 'mostSold' ? 'Popular' : 'Slow'}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="p-4 bg-theme-bg-tertiary rounded-full">
                                                    <Package className="w-8 h-8 text-theme-text-secondary/30" />
                                                </div>
                                                <p className="text-theme-text-secondary font-medium">{t('stockAlerts.noData')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StockAlertsPage;

import React, { useState, useEffect } from 'react';
import {
    AlertTriangle,
    Package,
    TrendingUp,
    TrendingDown,
    ArrowUp,
    ArrowDown,
    Download,
    RefreshCw,
    Eye,
} from 'lucide-react';
import stockService, { type Stock } from '../../services/stockService';
import { useNavigate } from 'react-router-dom';
import ViewStockModal from '../../components/dashboard/stock/ViewStockModal';

interface StockAnalytics {
    highStockItems: Stock[];
    lowStockItems: Stock[];
    criticalStockItems: Stock[];
    overStockItems: Stock[];
    totalHighStockValue: number;
    totalLowStockValue: number;
    averageStockLevel: number;
}

const StockAnalyticsPage = ({ role }: { role: string }) => {
    const [analytics, setAnalytics] = useState<StockAnalytics | null>(null);
    const [allStocks, setAllStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<'low' | 'high' | 'critical' | 'overstock'>('low');
    const [sortBy, setSortBy] = useState<'quantity' | 'value' | 'name'>('quantity');
    const navigate = useNavigate();

    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

    const toNumber = (value: any): number => {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    };

    const formatCurrency = (value: any): string => {
        return `Rwf ${toNumber(value).toLocaleString()}`;
    };

    useEffect(() => {
        fetchStockAnalytics();
    }, []);

    const fetchStockAnalytics = async () => {
        try {
            setLoading(true);
            const data = await stockService.getAllStocks();
            const normalizedData = (Array.isArray(data) ? data : [data]).map(stock => ({
                ...stock,
                unitCost: toNumber(stock.unitCost),
                receivedQuantity: parseInt(stock.receivedQuantity as any) || 0,
                totalValue: toNumber(stock.totalValue),
                reorderLevel: parseInt(stock.reorderLevel as any) || 0,
            }));

            setAllStocks(normalizedData);
            calculateAnalytics(normalizedData);
        } catch (error) {
            console.error('Error fetching stock analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateAnalytics = (stocks: Stock[]) => {
        // Critical: 0% of reorder level
        const criticalStockItems = stocks.filter(s => s.receivedQuantity === 0);

        // Low: <= reorder level but > 0
        const lowStockItems = stocks.filter(s =>
            s.receivedQuantity > 0 &&
            s.receivedQuantity <= s.reorderLevel
        );

        // High: > 200% of reorder level
        const highStockItems = stocks.filter(s =>
            s.receivedQuantity > (s.reorderLevel * 2)
        );

        // Overstock: > 300% of reorder level
        const overStockItems = stocks.filter(s =>
            s.receivedQuantity > (s.reorderLevel * 3)
        );

        const totalHighStockValue = highStockItems.reduce((sum, s) => sum + s.totalValue, 0);
        const totalLowStockValue = lowStockItems.reduce((sum, s) => sum + s.totalValue, 0);
        const averageStockLevel = stocks.length > 0
            ? stocks.reduce((sum, s) => sum + s.receivedQuantity, 0) / stocks.length
            : 0;

        setAnalytics({
            highStockItems,
            lowStockItems,
            criticalStockItems,
            overStockItems,
            totalHighStockValue,
            totalLowStockValue,
            averageStockLevel
        });
    };

    const getCurrentTabData = () => {
        if (!analytics) return [];

        let data: Stock[] = [];
        switch (selectedTab) {
            case 'critical':
                data = analytics.criticalStockItems;
                break;
            case 'low':
                data = analytics.lowStockItems;
                break;
            case 'high':
                data = analytics.highStockItems;
                break;
            case 'overstock':
                data = analytics.overStockItems;
                break;
        }

        // Apply sorting
        return [...data].sort((a, b) => {
            if (sortBy === 'quantity') {
                return a.receivedQuantity - b.receivedQuantity;
            } else if (sortBy === 'value') {
                return b.totalValue - a.totalValue;
            } else {
                return a.itemName.localeCompare(b.itemName);
            }
        });
    };

    const getStockPercentage = (stock: Stock) => {
        if (!stock || !stock.reorderLevel || stock.reorderLevel === 0) return '0';
        return ((stock.receivedQuantity / stock.reorderLevel) * 100).toFixed(0);
    };

    const getStockStatus = (stock: Stock) => {
        const percentage = parseFloat(getStockPercentage(stock));
        if (percentage === 0) return { label: 'Out of Stock', color: 'bg-red-600', textColor: 'text-red-600' };
        if (percentage <= 50) return { label: 'Critical Low', color: 'bg-red-500', textColor: 'text-red-600' };
        if (percentage <= 100) return { label: 'Low Stock', color: 'bg-orange-500', textColor: 'text-orange-600' };
        if (percentage <= 200) return { label: 'Adequate', color: 'bg-green-500', textColor: 'text-green-600' };
        if (percentage <= 300) return { label: 'High Stock', color: 'bg-blue-500', textColor: 'text-blue-600' };
        return { label: 'Overstock', color: 'bg-purple-500', textColor: 'text-purple-600' };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-theme-bg-secondary flex items-center justify-center transition-colors duration-200">
                <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-theme-text-secondary">Loading analytics...</span>
                </div>
            </div>
        );
    }

    if (!analytics) return null;

    const currentData = getCurrentTabData();

    return (
        <div className="min-h-screen bg-theme-bg-secondary transition-colors duration-200 pb-10">
            {/* Header */}
            <div className="bg-theme-bg-primary shadow-sm border-b border-theme-border">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-theme-text-primary">Stock Analytics</h1>
                            <p className="text-sm text-theme-text-secondary mt-1">Detailed insights on stock levels and inventory health</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={fetchStockAnalytics}
                                className="flex items-center space-x-2 px-4 py-2 border border-theme-border rounded-lg hover:bg-theme-bg-tertiary transition-colors text-theme-text-secondary hover:text-theme-text-primary"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span className="text-sm font-medium">Refresh</span>
                            </button>
                            <button className="flex items-center space-x-2 px-4 py-2 border border-theme-border rounded-lg hover:bg-theme-bg-tertiary transition-colors text-theme-text-secondary hover:text-theme-text-primary">
                                <Download className="w-4 h-4" />
                                <span className="text-sm font-medium">Export</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-6 space-y-6">
                {/* Summary Cards */}
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Critical Stock */}
                    <div className="bg-theme-bg-primary rounded-xl shadow-sm border border-theme-border p-6 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <span className="text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full">
                                URGENT
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-theme-text-secondary mb-1">Critical Stock</h3>
                        <p className="text-3xl font-bold text-theme-text-primary">{analytics.criticalStockItems.length}</p>
                        <p className="text-xs text-theme-text-tertiary mt-2">Out of stock items</p>
                    </div>

                    {/* Low Stock */}
                    <div className="bg-theme-bg-primary rounded-xl shadow-sm border border-theme-border p-6 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                                <TrendingDown className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <span className="text-xs font-semibold text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                                WARNING
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-theme-text-secondary mb-1">Low Stock</h3>
                        <p className="text-3xl font-bold text-theme-text-primary">{analytics.lowStockItems.length}</p>
                        <p className="text-xs text-theme-text-tertiary mt-2">Value: {formatCurrency(analytics.totalLowStockValue)}</p>
                    </div>

                    {/* High Stock */}
                    <div className="bg-theme-bg-primary rounded-xl shadow-sm border border-theme-border p-6 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                                HEALTHY
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-theme-text-secondary mb-1">High Stock</h3>
                        <p className="text-3xl font-bold text-theme-text-primary">{analytics.highStockItems.length}</p>
                        <p className="text-xs text-theme-text-tertiary mt-2">Value: {formatCurrency(analytics.totalHighStockValue)}</p>
                    </div>

                    {/* Overstock */}
                    <div className="bg-theme-bg-primary rounded-xl shadow-sm border border-theme-border p-6 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-xs font-semibold text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                                EXCESS
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-theme-text-secondary mb-1">Overstock</h3>
                        <p className="text-3xl font-bold text-theme-text-primary">{analytics.overStockItems.length}</p>
                        <p className="text-xs text-theme-text-tertiary mt-2">Items above 300% reorder level</p>
                    </div>
                </div>

                {/* Highest & Lowest Stock Items */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Highest Stock Item */}
                    {(() => {
                        const highestStock = allStocks.reduce((max, stock) =>
                            stock.receivedQuantity > max.receivedQuantity ? stock : max,
                            allStocks[0] || ({} as Stock)
                        );

                        return (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className="p-2 bg-green-500 rounded-lg">
                                                <TrendingUp className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-sm font-semibold text-green-900">Highest Stock Item</h3>
                                        </div>
                                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                                            MAXIMUM INVENTORY
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-theme-bg-primary rounded-lg p-4 border border-green-200 dark:border-green-800/30">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            {highestStock?.itemName?.substring(0, 2).toUpperCase() || '--'}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-base font-bold text-theme-text-primary mb-1">
                                                {highestStock?.itemName || 'N/A'}
                                            </h4>
                                            <p className="text-xs text-theme-text-secondary mb-2">
                                                SKU: {highestStock?.sku || 'N/A'} • {highestStock?.warehouseLocation || 'N/A'}
                                            </p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs text-theme-text-tertiary">Quantity</p>
                                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                                        {highestStock?.receivedQuantity || 0} <span className="text-xs font-normal">{highestStock?.unitOfMeasure || ''}</span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-theme-text-tertiary">Total Value</p>
                                                    <p className="text-sm font-bold text-theme-text-primary">
                                                        {formatCurrency(highestStock?.totalValue || 0)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-green-100 dark:border-green-800/30">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-theme-text-secondary">Reorder Level: {highestStock?.reorderLevel || 0}</span>
                                            <span className="font-semibold text-green-600 dark:text-green-400">
                                                {highestStock?.reorderLevel ?
                                                    `${((highestStock.receivedQuantity / highestStock.reorderLevel) * 100).toFixed(0)}% of reorder level`
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Lowest Stock Item */}
                    {(() => {
                        const lowStocksOnly = allStocks.filter(s => s.receivedQuantity > 0);
                        const lowestStock = lowStocksOnly.length > 0
                            ? lowStocksOnly.reduce((min, stock) => stock.receivedQuantity < min.receivedQuantity ? stock : min)
                            : {} as Stock;

                        return (
                            <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10 rounded-xl shadow-sm border border-red-200 dark:border-red-800/30 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className="p-2 bg-red-500 rounded-lg">
                                                <TrendingDown className="w-5 h-5 text-white" />
                                            </div>
                                            <h3 className="text-sm font-semibold text-red-900 dark:text-red-400">Lowest Stock Item</h3>
                                        </div>
                                        <span className="text-xs font-semibold text-red-700 bg-red-100 dark:bg-red-900/30 px-3 py-1 rounded-full">
                                            NEEDS ATTENTION
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-theme-bg-primary rounded-lg p-4 border border-red-200 dark:border-red-800/30">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            {lowestStock?.itemName?.substring(0, 2).toUpperCase() || '--'}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-base font-bold text-theme-text-primary mb-1">
                                                {lowestStock?.itemName || 'N/A'}
                                            </h4>
                                            <p className="text-xs text-theme-text-secondary mb-2">
                                                SKU: {lowestStock?.sku || 'N/A'} • {lowestStock?.warehouseLocation || 'N/A'}
                                            </p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="text-xs text-theme-text-tertiary">Quantity</p>
                                                    <p className="text-lg font-bold text-red-600 dark:text-red-400">
                                                        {lowestStock?.receivedQuantity || 0} <span className="text-xs font-normal">{lowestStock?.unitOfMeasure || ''}</span>
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-theme-text-tertiary">Total Value</p>
                                                    <p className="text-sm font-bold text-theme-text-primary">
                                                        {formatCurrency(lowestStock?.totalValue || 0)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-3 pt-3 border-t border-red-100 dark:border-red-800/30">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-theme-text-secondary">Reorder Level: {lowestStock?.reorderLevel || 0}</span>
                                            <span className="font-semibold text-red-600 dark:text-red-400">
                                                {lowestStock?.reorderLevel ?
                                                    `${((lowestStock.receivedQuantity / lowestStock.reorderLevel) * 100).toFixed(0)}% of reorder level`
                                                    : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* Tabs */}
                <div className="bg-theme-bg-primary rounded-xl shadow-sm border border-theme-border overflow-hidden">
                    <div className="border-b border-theme-border px-6">
                        <div className="flex space-x-8">
                            {[
                                { key: 'critical', label: 'Critical Stock', count: analytics.criticalStockItems.length, color: 'red' },
                                { key: 'low', label: 'Low Stock', count: analytics.lowStockItems.length, color: 'orange' },
                                { key: 'high', label: 'High Stock', count: analytics.highStockItems.length, color: 'blue' },
                                { key: 'overstock', label: 'Overstock', count: analytics.overStockItems.length, color: 'purple' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setSelectedTab(tab.key as any)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${selectedTab === tab.key
                                        ? `border-${tab.color}-500 text-${tab.color}-600 dark:text-${tab.color}-400`
                                        : 'border-transparent text-theme-text-secondary hover:text-theme-text-primary hover:border-theme-border'
                                        }`}
                                >
                                    {tab.label} ({tab.count})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filters & Sort */}
                    <div className="px-6 py-4 border-b border-theme-border bg-theme-bg-tertiary">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-medium text-theme-text-secondary">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="text-sm bg-theme-bg-primary border border-theme-border rounded-lg px-3 py-2 text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                                >
                                    <option value="quantity">Quantity (Low to High)</option>
                                    <option value="value">Value (High to Low)</option>
                                    <option value="name">Name (A-Z)</option>
                                </select>
                            </div>
                            <div className="text-sm text-theme-text-secondary">
                                Showing {currentData.length} items
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="divide-y divide-theme-border">
                        {currentData.length === 0 ? (
                            <div className="px-6 py-12 text-center bg-theme-bg-primary">
                                <Package className="w-12 h-12 text-theme-text-tertiary mx-auto mb-4" />
                                <p className="text-theme-text-secondary text-sm">No items in this category</p>
                            </div>
                        ) : (
                            currentData.map((stock) => {
                                const status = getStockStatus(stock);
                                const percentage = parseFloat(getStockPercentage(stock));

                                return (
                                    <div key={stock.id} className="px-6 py-4 hover:bg-theme-bg-tertiary transition-colors bg-theme-bg-primary">
                                        <div className="flex items-center justify-between">
                                            {/* Item Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex-shrink-0">
                                                        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                                                            {stock.itemName.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-semibold text-theme-text-primary truncate">{stock.itemName}</h4>
                                                        <p className="text-xs text-theme-text-secondary mt-0.5">SKU: {stock.sku} • {stock.warehouseLocation}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Stock Level */}
                                            <div className="flex items-center space-x-6 ml-6">
                                                {/* Quantity */}
                                                <div className="text-right">
                                                    <p className="text-xs text-theme-text-tertiary mb-1">Current Stock</p>
                                                    <p className="text-lg font-bold text-theme-text-primary">
                                                        {stock.receivedQuantity} <span className="text-xs font-normal text-theme-text-tertiary">{stock.unitOfMeasure}</span>
                                                    </p>
                                                </div>

                                                {/* Reorder Level */}
                                                <div className="text-right">
                                                    <p className="text-xs text-theme-text-tertiary mb-1">Reorder Level</p>
                                                    <p className="text-sm font-medium text-theme-text-secondary">{stock.reorderLevel}</p>
                                                </div>

                                                {/* Percentage */}
                                                <div className="text-right min-w-[100px]">
                                                    <p className="text-xs text-theme-text-tertiary mb-1">Stock Level</p>
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <span className={`text-lg font-bold ${status.textColor}`}>
                                                            {percentage}%
                                                        </span>
                                                        {percentage < 100 ? (
                                                            <ArrowDown className="w-4 h-4 text-red-500" />
                                                        ) : (
                                                            <ArrowUp className="w-4 h-4 text-green-500" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Value */}
                                                <div className="text-right min-w-[120px]">
                                                    <p className="text-xs text-theme-text-tertiary mb-1">Total Value</p>
                                                    <p className="text-sm font-semibold text-theme-text-primary">{formatCurrency(stock.totalValue)}</p>
                                                </div>

                                                {/* Status Badge */}
                                                <div className="min-w-[120px]">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${status.textColor} bg-opacity-10`}
                                                        style={{ backgroundColor: `${status.color.replace('bg-', '')}20` }}>
                                                        {status.label}
                                                    </span>
                                                </div>

                                                {/* Action */}
                                                <button
                                                    onClick={() => {
                                                        setSelectedStock(stock);
                                                        setIsViewModalOpen(true);
                                                    }}
                                                    className="p-2 text-theme-text-tertiary hover:text-primary-600 hover:bg-primary-500/10 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mt-3">
                                            <div className="w-full bg-theme-bg-tertiary rounded-full h-2 overflow-hidden">
                                                <div
                                                    className={`h-full ${status.color} transition-all duration-300`}
                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
            <ViewStockModal
                isOpen={isViewModalOpen}
                stock={selectedStock}
                onClose={() => { setIsViewModalOpen(false); setSelectedStock(null); }}
            />
        </div>
    );
};

export default StockAnalyticsPage;
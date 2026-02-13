import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, ArrowUp, ArrowDown, Package, Loader } from 'lucide-react';
import useAdminAuth from '../../context/AdminAuthContext';
import { stockService } from '../../services/stock.service';
import { stockOutService } from '../../services/stockout.service';

const StockAlertsPage: React.FC = () => {
    const { user } = useAdminAuth();
    const [loading, setLoading] = useState(true);
    const [alerts, setAlerts] = useState<{ lowStock: any[], highStock: any[] }>({ lowStock: [], highStock: [] });
    const [performance, setPerformance] = useState<{ mostSold: any[], leastSold: any[] }>({ mostSold: [], leastSold: [] });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [alertsData, performanceData] = await Promise.all([
                    stockService.getStockAlerts(),
                    stockOutService.getProductPerformance()
                ]);
                setAlerts(alertsData);
                setPerformance(performanceData);
            } catch (error) {
                console.error("Failed to fetch stock alerts/performance", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        );
    }

    const CardSection = ({ title, icon: Icon, color, data, columns }: any) => (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full`}>
            <div className={`px-6 py-4 border-b border-gray-100 flex items-center gap-3 ${color}`}>
                <div className="p-2 rounded-lg bg-white bg-opacity-20 text-white">
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-lg">{title}</h3>
            </div>
            <div className="flex-1 overflow-auto p-0">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                        <tr>
                            {columns.map((col: string, idx: number) => (
                                <th key={idx} className="px-6 py-3 font-medium">{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.length > 0 ? (
                            data.map((item: any, idx: number) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3 font-medium text-gray-900">{item.itemName || item.name}</td>
                                    <td className="px-6 py-3 text-gray-600">{item.sku}</td>
                                    <td className="px-6 py-3 font-bold text-gray-900">
                                        {item.receivedQuantity !== undefined ? item.receivedQuantity : item.totalSold}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-400">
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-900">Stock Alerts & Analytics</h1>
            <p className="text-gray-500 -mt-4">Monitor stock levels and product performance</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[80vh]">
                <CardSection
                    title="Low Stock Items"
                    icon={AlertTriangle}
                    color="bg-red-500"
                    data={alerts.lowStock}
                    columns={['Item Name', 'SKU', 'Available Qty']}
                />
                <CardSection
                    title="Top Inventory (High Stock)"
                    icon={ArrowUp}
                    color="bg-blue-500"
                    data={alerts.highStock}
                    columns={['Item Name', 'SKU', 'Available Qty']}
                />
                <CardSection
                    title="Most Sold Items"
                    icon={TrendingUp}
                    color="bg-green-500"
                    data={performance.mostSold}
                    columns={['Item Name', 'SKU', 'Total Sold']}
                />
                <CardSection
                    title="Least Sold Items"
                    icon={TrendingDown}
                    color="bg-orange-500"
                    data={performance.leastSold}
                    columns={['Item Name', 'SKU', 'Total Sold']}
                />
            </div>
        </div>
    );
};

export default StockAlertsPage;

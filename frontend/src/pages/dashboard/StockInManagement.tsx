/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Download,
    Grid3X3,
    List,
    Package,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    X,
    Filter,
    RefreshCw,
    Eye,
    ChevronDown,
    MoreHorizontal
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import stockService, { type Stock } from '../../services/stockService';
import DeleteStockModal from '../../components/dashboard/stock/DeleteStockInModal';
import QuickUpdateStockModal from '../../components/dashboard/stock/QuickUpdateStockModal';
import ViewStockModal from '../../components/dashboard/stock/ViewStockModal';
import { API_URL } from '../../api/api';
import { useSocketEvent } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface OperationStatus {
    type: 'success' | 'error' | 'info';
    message: string;
}

type ViewMode = 'table' | 'grid' | 'list';
type DateFilterOption = 'all' | 'today' | 'week' | 'month' | 'custom';

const StockInManagement = ({ role }: { role: string }) => {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [allStocks, setAllStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [sortBy, setSortBy] = useState<keyof Stock>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [rowsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
    const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
    const [operationLoading, setOperationLoading] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [isQuickUpdateModalOpen, setIsQuickUpdateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // === DATE FILTER STATES ===
    const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');

    // const pdfContentRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Helper: Safely parse number
    const toNumber = (value: any): number => {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    };

    // Helper: Format currency
    const formatCurrency = (value: any): string => {
        return `Rwf ${toNumber(value).toLocaleString()}`;
    };

    // === DATE RANGE CALCULATION ===
    const getDateRange = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        switch (dateFilter) {
            case 'today':
                return { start: today, end: new Date(today.getTime() + 86400000 - 1) };
            case 'week':
                return { start: startOfWeek, end: new Date(startOfWeek.getTime() + 7 * 86400000 - 1) };
            case 'month':
                return { start: startOfMonth, end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59) };
            case 'custom':
                return {
                    start: customStartDate ? new Date(customStartDate) : null,
                    end: customEndDate ? new Date(customEndDate + 'T23:59:59') : null,
                };
            default:
                return { start: null, end: null };
        }
    }, [dateFilter, customStartDate, customEndDate]);

    useEffect(() => {
        const fetchStocks = async () => {
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
                setError(null);
            } catch (err: any) {
                const errorMessage = err.message || 'Failed to load stock items';
                console.error('Error fetching stocks:', err);
                setError(errorMessage);
                showOperationStatus('error', errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchStocks();
    }, []);

    useEffect(() => {
        handleFilterAndSort();
    }, [searchTerm, categoryFilter, sortBy, sortOrder, allStocks, dateFilter, customStartDate, customEndDate]);

    // Socket Events
    useSocketEvent('stockCreated', (stockData: Stock) => {
        console.log('Stock created via WebSocket:', stockData);
        const normalized = {
            ...stockData,
            unitCost: toNumber(stockData.unitCost),
            receivedQuantity: parseInt(stockData.receivedQuantity as any) || 0,
            totalValue: toNumber(stockData.totalValue),
            reorderLevel: parseInt(stockData.reorderLevel as any) || 0,
        };
        setAllStocks((prev) => [...prev, normalized]);
        showOperationStatus('success', `Stock item ${stockData.itemName} received`);
    });

    useSocketEvent('stockUpdated', (stockData: Stock) => {
        console.log('Stock updated via WebSocket:', stockData);
        const normalized = {
            ...stockData,
            unitCost: toNumber(stockData.unitCost),
            receivedQuantity: parseInt(stockData.receivedQuantity as any) || 0,
            totalValue: toNumber(stockData.totalValue),
            reorderLevel: parseInt(stockData.reorderLevel as any) || 0,
        };
        setAllStocks((prev) =>
            prev.map((s) => (s.id.toString() === stockData.id.toString() ? normalized : s))
        );
        showOperationStatus('success', `Stock item ${stockData.itemName} updated`);
    });

    useSocketEvent('stockDeleted', ({ id }: { id: string }) => {
        console.log('Stock deleted via WebSocket:', id);
        setAllStocks((prev) => prev.filter((s) => s.id.toString() !== id.toString()));
        showOperationStatus('success', 'Stock item deleted');
    });

    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-primary-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
            'bg-yellow-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
    };

    const showOperationStatus = (type: OperationStatus['type'], message: string, duration: number = 3000) => {
        setOperationStatus({ type, message });
        setTimeout(() => setOperationStatus(null), duration);
    };

    const handleFilterAndSort = () => {
        let filtered = [...allStocks];

        // Search
        if (searchTerm.trim()) {
            filtered = filtered.filter(
                (stock) =>
                    stock.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    stock.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    stock.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    stock.warehouseLocation?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category
        if (categoryFilter !== 'all') {
            filtered = filtered.filter((stock) => stock.categoryId === categoryFilter);
        }

        // Date Filter
        if (dateFilter !== 'all' && getDateRange.start && getDateRange.end) {
            filtered = filtered.filter((stock) => {
                const receivedAt = stock.receivedDate ? new Date(stock.receivedDate).getTime() : 0;
                return receivedAt >= getDateRange.start!.getTime() && receivedAt <= getDateRange.end!.getTime();
            });
        }

        // Sort
        filtered.sort((a, b) => {
            let aValue = a[sortBy] ?? '';
            let bValue = b[sortBy] ?? '';
            if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'receivedDate') {
                const dateA = new Date(aValue as string).getTime();
                const dateB = new Date(bValue as string).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else {
                const strA = aValue.toString().toLowerCase();
                const strB = bValue.toString().toLowerCase();
                return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
            }
        });

        setStocks(filtered);
        setCurrentPage(1);
    };

    const handleExportPDF = async () => {
        try {
            setOperationLoading(true);
            const date = new Date().toLocaleDateString('en-CA').replace(/\//g, '');
            const filename = `stockin_export_${date}.pdf`;

            const tableRows = filteredStocks.map((stock, index) => {
                return `
                    <tr>
                        <td style="font-size:10px;">${index + 1}</td>
                        <td style="font-size:10px;">${stock.sku}</td>
                        <td style="font-size:10px;">${stock.itemName}</td>
                        <td style="font-size:10px;">${stock.receivedQuantity} ${stock.unitOfMeasure}</td>
                        <td style="font-size:10px;">${formatCurrency(stock.unitCost)}</td>
                        <td style="font-size:10px;">${formatCurrency(stock.totalValue)}</td>
                        <td style="font-size:10px;">${stock.warehouseLocation}</td>
                        <td style="font-size:10px;">${new Date(stock.receivedDate).toLocaleDateString()}</td>
                    </tr>
                `;
            }).join('');

            const htmlContent = `
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 10px; font-size: 10px; }
                        h1 { font-size: 14px; margin-bottom: 5px; }
                        p { font-size: 9px; margin-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; font-size: 10px; }
                        th, td { border: 1px solid #ddd; padding: 4px; text-align: left; vertical-align: middle; }
                        th { background-color: #2563eb; color: white; font-weight: bold; font-size: 10px; }
                        tr:nth-child(even) { background-color: #f2f2f2; }
                    </style>
                </head>
                <body>
                    <h1>Stock In Report</h1>
                    <p>Exported on: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' })}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>SKU</th>
                                <th>Item Name</th>
                                <th>Quantity</th>
                                <th>Unit Cost</th>
                                <th>Total Value</th>
                                <th>Location</th>
                                <th>Received Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </body>
                </html>
            `;

            const opt = {
                margin: 0.5,
                filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
            };

            await html2pdf().from(htmlContent).set(opt).save();
            showOperationStatus('success', 'PDF exported successfully');
        } catch (err: any) {
            console.error('Error generating PDF:', err);
            showOperationStatus('error', 'Failed to export PDF');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleAddStock = () => {
        navigate(`/${role}/dashboard/stockin-management/create`);
    };

    const handleEditStock = (stock: Stock) => {
        if (!stock.id) return Swal.fire({});
        navigate(`/${role}/dashboard/stockin-management/update/${stock.id}`);
    };

    const handleViewStock = (stock: Stock) => {
        setSelectedStock(stock);
        setIsViewModalOpen(true);
    };

    const handleDeleteStock = (stock: Stock) => {
        setSelectedStock(stock);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async (stock: Stock) => {
        try {
            setOperationLoading(true);
          const stockresult = await stockService.deleteStock(stock.id)
            setAllStocks((prev) => prev.filter((s) => s.id !== stock.id));
            showOperationStatus('success', `Stock item "${stock.itemName}" deleted`);
        } catch (err: any) {
            console.error('Error deleting stock:', err);
            showOperationStatus('error', err.message || 'Failed to delete stock item');
        } finally {
            setOperationLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedStock(null);
        }
    };

    const handleQuickUpdate = async (id: number, addedQuantity: number, expiryDate?: string) => {
        try {
            setOperationLoading(true);
            const currentStock = allStocks.find(s => s.id === id);
            const newTotal = (currentStock?.receivedQuantity || 0) + addedQuantity;
            const updateData: any = { receivedQuantity: newTotal, totalValue: newTotal * (currentStock?.unitCost || 0) };
            if (expiryDate) updateData.expiryDate = expiryDate;
            await stockService.updateStock(String(id), updateData);
            setAllStocks(prev => prev.map(s => s.id === id ? { ...s, receivedQuantity: newTotal, totalValue: newTotal * s.unitCost, ...(expiryDate ? { expiryDate } : {}) } : s));
            showOperationStatus('success', `Added ${addedQuantity} units successfully (Total: ${newTotal})`);
        } catch (error: any) {
            console.error('Error updating quantity:', error);
            showOperationStatus('error', error.message || 'Failed to update quantity');
        } finally {
            setOperationLoading(false);
            setIsQuickUpdateModalOpen(false);
            setSelectedStock(null);
        }
    };

    const formatDate = (date?: string | Date): string => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const filteredStocks = stocks;
    const totalPages = Math.ceil(filteredStocks.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentStocks = filteredStocks.slice(startIndex, endIndex);

    // Summary Stats
    const totalStockItems = allStocks.length;
    const totalValue = allStocks.reduce((sum, s) => sum + s.totalValue, 0);
    const lowStockItems = allStocks.filter(s => s.receivedQuantity <= s.reorderLevel).length;
    const highValueItems = allStocks.filter(s => s.totalValue > 10000).length;

    const StockCard = ({ stock }: { stock: Stock }) => {
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsDropdownOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        const isLowStock = stock.receivedQuantity <= stock.reorderLevel;

        return (
            <div className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <MoreHorizontal className="w-3 h-3 text-gray-400" />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 top-6 bg-white shadow-lg rounded border py-1 z-10">
                                <button
                                    onClick={() => { handleViewStock(stock); setIsDropdownOpen(false); }}
                                    className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                                >
                                    <Eye className="w-3 h-3 mr-1" /> View
                                </button>
                                <button
                                    onClick={() => { handleEditStock(stock); setIsDropdownOpen(false); }}
                                    className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                                >
                                    <Edit className="w-3 h-3 mr-1" /> Edit
                                </button>
                                <button
                                    onClick={() => { handleDeleteStock(stock); setIsDropdownOpen(false); }}
                                    className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                                >
                                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                                </button>
                                <button
                                    onClick={() => { setSelectedStock(stock); setIsQuickUpdateModalOpen(true); setIsDropdownOpen(false); }}
                                    className="flex items-center px-2 py-1 text-xs text-primary-700 hover:bg-primary-50 w-full"
                                >
                                    <RefreshCw className="w-3 h-3 mr-1" /> Quick Update
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(stock.itemName)}`}>
                        {getInitials(stock.itemName)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-xs truncate">{stock.itemName}</div>
                        <div className="text-gray-500 text-xs truncate">SKU: {stock.sku}</div>
                    </div>
                </div>
                <div className="space-y-1 mb-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Qty:</span>
                        <span className={`font-medium ${isLowStock ? 'text-red-600' : ''}`}>
                            {stock.receivedQuantity} {stock.unitOfMeasure}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Value:</span>
                        <span className="font-medium">{formatCurrency(stock.totalValue)}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    {isLowStock ? (
                        <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Low Stock
                        </span>
                    ) : (
                        <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            In Stock
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const renderTableView = () => (
        <div className="bg-white rounded border border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium">SKU</th>
                            <th
                                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                    setSortBy('itemName');
                                    setSortOrder(sortBy === 'itemName' && sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Item Name</span>
                                    <ChevronDown className={`w-3 h-3 ${sortBy === 'itemName' ? 'text-primary-600' : 'text-gray-400'}`} />
                                </div>
                            </th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Qty</th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium hidden md:table-cell">Unit Cost</th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Total Value</th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium hidden xl:table-cell">Location</th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium">Status</th>
                            <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentStocks.map((stock, index) => {
                            const isLowStock = stock.receivedQuantity <= stock.reorderLevel;
                            return (
                                <tr key={stock.id} className="hover:bg-gray-25">
                                    <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                                    <td className="py-2 px-2 font-mono text-xs text-gray-900">{stock.sku}</td>
                                    <td className="py-2 px-2">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(stock.itemName)}`}>
                                                {getInitials(stock.itemName)}
                                            </div>
                                            <span className="font-medium text-gray-900 text-xs">{stock.itemName}</span>
                                        </div>
                                    </td>
                                    <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">
                                        {stock.receivedQuantity} {stock.unitOfMeasure}
                                    </td>
                                    <td className="py-2 px-2 text-gray-700 hidden md:table-cell">
                                        {formatCurrency(stock.unitCost)}
                                    </td>
                                    <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">
                                        {formatCurrency(stock.totalValue)}
                                    </td>
                                    <td className="py-2 px-2 text-gray-700 hidden xl:table-cell">{stock.warehouseLocation}</td>
                                    <td className="py-2 px-2">
                                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${isLowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                            {isLowStock ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                    <td className="py-2 px-2">
                                        <div className="flex items-center justify-end space-x-1">
                                            <button onClick={() => handleViewStock(stock)} className="text-gray-400 hover:text-primary-600 p-1" title="View">
                                                <Eye className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => handleEditStock(stock)} disabled={operationLoading} className="text-gray-400 hover:text-primary-600 p-1 disabled:opacity-50" title="Edit">
                                                <Edit className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => handleDeleteStock(stock)} disabled={operationLoading} className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50" title="Delete">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                            <button onClick={() => { setSelectedStock(stock); setIsQuickUpdateModalOpen(true); }} disabled={operationLoading} className="text-gray-400 hover:text-primary-600 p-1 disabled:opacity-50" title="Quick Update">
                                                <RefreshCw className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderGridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {currentStocks.map((stock) => (
                <StockCard key={stock.id} stock={stock} />
            ))}
        </div>
    );

    const renderListView = () => (
        <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
            {currentStocks.map((stock) => {
                const isLowStock = stock.receivedQuantity <= stock.reorderLevel;
                return (
                    <div key={stock.id} className="px-4 py-3 hover:bg-gray-25">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${getAvatarColor(stock.itemName)}`}>
                                    {getInitials(stock.itemName)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900 text-sm truncate">{stock.itemName}</div>
                                    <div className="text-gray-500 text-xs truncate">SKU: {stock.sku}</div>
                                </div>
                            </div>
                            <div className="hidden md:grid grid-cols-3 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
                                <span>{stock.receivedQuantity} {stock.unitOfMeasure}</span>
                                <span>{formatCurrency(stock.totalValue)}</span>
                                <span>{formatDate(stock.receivedDate)}</span>
                            </div>
                            <div className="flex items-center space-x-1 flex-shrink-0">
                                <button onClick={() => handleViewStock(stock)} className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors" title="View Stock">
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleEditStock(stock)} disabled={operationLoading} className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors disabled:opacity-50" title="Edit Stock">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteStock(stock)} disabled={operationLoading} className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50" title="Delete Stock">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => { setSelectedStock(stock); setIsQuickUpdateModalOpen(true); }} disabled={operationLoading} className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors disabled:opacity-50" title="Quick Update">
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    const renderPagination = () => {
        const pages: number[] = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        for (let i = startPage; i <= endPage; i++) pages.push(i);

        return (
            <div className="flex items-center justify-between bg-white px-3 py-2 border-t border-gray-200">
                <div className="text-xs text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredStocks.length)} of {filteredStocks.length}
                </div>
                <div className="flex items-center space-x-1">
                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}
                        className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ChevronLeft className="w-3 h-3" />
                    </button>
                    {pages.map((page) => (
                        <button key={page} onClick={() => setCurrentPage(page)}
                            className={`px-2 py-1 text-xs rounded ${currentPage === page ? 'bg-primary-500 text-white' : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'}`}>
                            {page}
                        </button>
                    ))}
                    <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}
                        className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-theme-bg-secondary text-xs text-theme-text-primary transition-colors duration-200">
            <DeleteStockModal
                isOpen={isDeleteModalOpen}
                stock={selectedStock}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={handleDelete}
            />
            <QuickUpdateStockModal
                isOpen={isQuickUpdateModalOpen}
                stock={selectedStock}
                onClose={() => { setIsQuickUpdateModalOpen(false); setSelectedStock(null); }}
                onUpdate={handleQuickUpdate}
            />
            <ViewStockModal
                isOpen={isViewModalOpen}
                stock={selectedStock}
                onClose={() => { setIsViewModalOpen(false); setSelectedStock(null); }}
            />
            {operationStatus && (
                <div className="fixed top-4 right-4 z-50">
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded shadow-lg text-xs ${operationStatus.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
                        operationStatus.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
                            'bg-primary-50 border border-primary-200 text-primary-800'
                        }`}>
                        {operationStatus.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {operationStatus.type === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                        {operationStatus.type === 'info' && <AlertCircle className="w-4 h-4 text-primary-600" />}
                        <span className="font-medium">{operationStatus.message}</span>
                        <button onClick={() => setOperationStatus(null)} className="hover:opacity-70">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}
            {operationLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
                    <div className="bg-white rounded p-4 shadow-xl">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-700 text-xs font-medium">Processing...</span>
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-white shadow-md">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">Stock In Management</h1>
                            <p className="text-xs text-gray-500 mt-0.5">Track incoming inventory and stock levels</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button onClick={async () => {
                                setLoading(true);
                                const data = await stockService.getAllStocks();
                                setAllStocks((Array.isArray(data) ? data : [data]).map(s => ({
                                    ...s,
                                    unitCost: toNumber(s.unitCost),
                                    receivedQuantity: parseInt(s.receivedQuantity as any) || 0,
                                    totalValue: toNumber(s.totalValue),
                                    reorderLevel: parseInt(s.reorderLevel as any) || 0,
                                })));
                                setLoading(false);
                            }} disabled={loading} className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" title="Refresh">
                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </button>
                            <button onClick={handleExportPDF} disabled={operationLoading || filteredStocks.length === 0}
                                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50" title="Export PDF">
                                <Download className="w-3 h-3" />
                                <span>Export</span>
                            </button>
                            <button onClick={handleAddStock} disabled={operationLoading}
                                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50">
                                <Plus className="w-3 h-3" />
                                <span>Receive Stock</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 py-4 space-y-4">
                {/* STATS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-primary-100 rounded-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Total Items</p>
                                <p className="text-lg font-semibold text-gray-900">{totalStockItems}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Total Value</p>
                                <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalValue)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-orange-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Low Stock</p>
                                <p className="text-lg font-semibold text-gray-900">{lowStockItems}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-purple-100 rounded-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">High Value</p>
                                <p className="text-lg font-semibold text-gray-900">{highValueItems}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEARCH & FILTERS */}
                <div className="bg-white rounded border border-gray-200 p-3">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0 gap-3">
                        {/* Search + Date Filter */}
                        <div className="flex items-center space-x-2 flex-1">
                            <div className="relative">
                                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search stock..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                            </div>

                            {/* Date Filter Buttons */}
                            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                {(['all', 'today', 'week', 'month', 'custom'] as const).map((opt) => (
                                    <button
                                        key={opt}
                                        onClick={() => {
                                            setDateFilter(opt);
                                            if (opt !== 'custom') {
                                                setCustomStartDate('');
                                                setCustomEndDate('');
                                            }
                                        }}
                                        className={`px-3 py-1.5 text-xs font-medium rounded capitalize transition-colors ${dateFilter === opt
                                            ? 'bg-white text-primary-600 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        {opt === 'all' ? 'All Time' : opt}
                                    </button>
                                ))}
                            </div>

                            {/* Custom Date Inputs */}
                            {dateFilter === 'custom' && (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                        className="px-3 py-1.5 text-xs border rounded"
                                    />
                                    <span className="text-gray-500 text-sm">to</span>
                                    <input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                        className="px-3 py-1.5 text-xs border rounded"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Sort & View Mode */}
                        <div className="flex items-center space-x-2">
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-') as [keyof Stock, 'asc' | 'desc'];
                                    setSortBy(field);
                                    setSortOrder(order);
                                }}
                                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            >
                                <option value="itemName-asc">Name (A-Z)</option>
                                <option value="itemName-desc">Name (Z-A)</option>
                                <option value="receivedDate-desc">Newest First</option>
                                <option value="receivedDate-asc">Oldest First</option>
                                <option value="totalValue-desc">Highest Value</option>
                            </select>
                            <div className="flex items-center border border-gray-200 rounded">
                                <button onClick={() => setViewMode('table')} className={`p-1.5 text-xs transition-colors ${viewMode === 'table' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`} title="Table View">
                                    <List className="w-3 h-3" />
                                </button>
                                <button onClick={() => setViewMode('grid')} className={`p-1.5 text-xs transition-colors ${viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`} title="Grid View">
                                    <Grid3X3 className="w-3 h-3" />
                                </button>
                                <button onClick={() => setViewMode('list')} className={`p-1.5 text-xs transition-colors ${viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'}`} title="List View">
                                    <Package className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Additional Filters (Category) */}
                    {showFilters && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 flex-wrap">
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                >
                                    <option value="all">All Categories</option>
                                    {/* Add dynamic categories if available */}
                                </select>
                                <button onClick={() => { setSearchTerm(''); setCategoryFilter('all'); setDateFilter('all'); setCustomStartDate(''); setCustomEndDate(''); }}
                                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded">
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-xs">{error}</div>}
                {loading ? (
                    <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
                        <div className="inline-flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs">Loading stock items...</span>
                        </div>
                    </div>
                ) : currentStocks.length === 0 ? (
                    <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
                        <div className="text-xs">
                            {searchTerm || categoryFilter !== 'all' || dateFilter !== 'all' ? 'No stock items found' : 'No stock received yet'}
                        </div>
                    </div>
                ) : (
                    <div>
                        {viewMode === 'table' && renderTableView()}
                        {viewMode === 'grid' && renderGridView()}
                        {viewMode === 'list' && renderListView()}
                        {renderPagination()}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StockInManagement;
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Download,
    Upload,
    RefreshCw,
    Package,
    AlertCircle,
    CheckCircle,
    XCircle,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Filter,
    MoreHorizontal,
    Eye,
    TrendingUp,
    X,
    Grid3X3,
    List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import stockService, { type Stock } from '../../services/stockService';
import DeleteStockModal from '../../components/dashboard/stock/DeleteStockInModal';
import QuickUpdateStockModal from '../../components/dashboard/stock/QuickUpdateStockModal';
import ViewStockModal from '../../components/dashboard/stock/ViewStockModal';
import AddStockIn from './AddStockin';
import ImportStockModal from '../../components/dashboard/stock/ImportStockModal';
import { useSocketEvent } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useLanguage } from '../../context/LanguageContext';

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
    const [sortBy, setSortBy] = useState<keyof Stock>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [rowsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
    const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
    const [operationLoading, setOperationLoading] = useState<boolean>(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [isQuickUpdateModalOpen, setIsQuickUpdateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // New Filters
    const [productNameFilter, setProductNameFilter] = useState('');

    // === DATE FILTER STATES ===
    const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const navigate = useNavigate();
    const { t } = useLanguage();

    // Helper: Safely parse number
    const toNumber = (value: any): number => {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    };

    // Helper: Format currency
    const formatCurrency = (value: any): string => {
        return `Rwf ${toNumber(value).toLocaleString()} `;
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

        // Search (General)
        if (searchTerm.trim()) {
            filtered = filtered.filter(
                (stock) =>
                    stock.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    stock.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    stock.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    stock.warehouseLocation?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Product Name Filter
        if (productNameFilter.trim()) {
            filtered = filtered.filter((stock) =>
                stock.itemName.toLowerCase().includes(productNameFilter.toLowerCase())
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

            // Date fields
            if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'receivedDate') {
                const dateA = new Date(aValue as string).getTime();
                const dateB = new Date(bValue as string).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            }
            // Numeric fields
            else if (sortBy === 'receivedQuantity' || sortBy === 'totalValue' || sortBy === 'unitCost' || sortBy === 'reorderLevel') {
                const numA = toNumber(aValue);
                const numB = toNumber(bValue);
                return sortOrder === 'asc' ? numA - numB : numB - numA;
            }
            // String fields
            else {
                const strA = aValue.toString().toLowerCase();
                const strB = bValue.toString().toLowerCase();
                return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
            }
        });

        setStocks(filtered);
        setCurrentPage(1);
    };

    const handleExportExcel = () => {
        try {
            setOperationLoading(true);
            const date = new Date().toLocaleDateString('en-CA').replace(/\//g, '');
            const filename = `stockin_export_${date}.xlsx`;

            const data = stocks.map((stock, index) => ({
                '#': index + 1,
                'SKU': stock.sku,
                'Item Name': stock.itemName,
                'Quantity': `${stock.receivedQuantity} ${stock.unitOfMeasure}`,
                'Unit Cost': stock.unitCost,
                'Total Value': stock.totalValue,
                'Location': stock.warehouseLocation || 'N/A',
                'Received Date': new Date(stock.receivedDate).toLocaleDateString()
            }));

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Stock In Report");
            XLSX.writeFile(wb, filename);

            showOperationStatus('success', 'Excel exported successfully');
        } catch (err: any) {
            console.error('Error exporting Excel:', err);
            showOperationStatus('error', 'Failed to export Excel');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleExportCSV = () => {
        try {
            setOperationLoading(true);
            const date = new Date().toLocaleDateString('en-CA').replace(/\//g, '');
            const filename = `stockin_export_${date}.csv`;

            const data = stocks.map((stock, index) => ({
                '#': index + 1,
                'SKU': stock.sku,
                'Item Name': stock.itemName,
                'Quantity': stock.receivedQuantity,
                'Unit': stock.unitOfMeasure,
                'Unit Cost': stock.unitCost,
                'Total Value': stock.totalValue,
                'Location': stock.warehouseLocation || 'N/A',
                'Received Date': new Date(stock.receivedDate).toLocaleDateString()
            }));

            const ws = XLSX.utils.json_to_sheet(data);
            const csv = XLSX.utils.sheet_to_csv(ws);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            showOperationStatus('success', 'CSV exported successfully');
        } catch (err: any) {
            console.error('Error exporting CSV:', err);
            showOperationStatus('error', 'Failed to export CSV');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            setOperationLoading(true);
            const date = new Date().toLocaleDateString('en-CA').replace(/\//g, '');
            const filename = `stockin_export_${date}.pdf`;

            const tableRows = stocks.map((stock, index) => {
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
            await stockService.deleteStock(stock.id.toString());
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
            <div className="bg-theme-bg-primary rounded-xl border border-theme-border p-5 hover:shadow-md hover:scale-[1.01] transition-all group">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-md ${getAvatarColor(stock.itemName)}`}>
                            {getInitials(stock.itemName)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-theme-text-primary text-sm truncate">{stock.itemName}</div>
                            <div className="text-theme-text-secondary text-xs truncate">SKU: {stock.sku}</div>
                        </div>
                    </div>
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="p-2 hover:bg-theme-bg-tertiary rounded-lg transition-colors"
                        >
                            <MoreHorizontal className="w-4 h-4 text-theme-text-secondary" />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 top-10 bg-theme-bg-primary shadow-xl rounded-xl border border-theme-border py-2 z-[60] min-w-[170px] animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={() => { handleViewStock(stock); setIsDropdownOpen(false); }}
                                    className="flex items-center px-4 py-2.5 text-xs text-theme-text-primary hover:bg-theme-bg-tertiary w-full font-medium transition-colors"
                                >
                                    <Eye className="w-4 h-4 mr-3 text-primary-500" /> {t('stockIn.viewStock')}
                                </button>
                                <button
                                    onClick={() => { handleEditStock(stock); setIsDropdownOpen(false); }}
                                    className="flex items-center px-4 py-2.5 text-xs text-theme-text-primary hover:bg-theme-bg-tertiary w-full font-medium transition-colors"
                                >
                                    <Edit className="w-4 h-4 mr-3 text-amber-500" /> {t('stockIn.editStock')}
                                </button>
                                <button
                                    onClick={() => { handleDeleteStock(stock); setIsDropdownOpen(false); }}
                                    className="flex items-center px-4 py-2.5 text-xs text-red-500 hover:bg-red-50 w-full font-medium transition-colors"
                                >
                                    <Trash2 className="w-4 h-4 mr-3" /> {t('stockIn.deleteStock')}
                                </button>
                                <div className="h-px bg-theme-border my-2 mx-4" />
                                <button
                                    onClick={() => { setSelectedStock(stock); setIsQuickUpdateModalOpen(true); setIsDropdownOpen(false); }}
                                    className="flex items-center px-4 py-2.5 text-xs text-primary-600 hover:bg-primary-50 w-full font-medium transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4 mr-3" /> {t('stockIn.quickUpdate')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-2.5 mb-5">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-theme-text-secondary">{t('stockIn.quantity')}:</span>
                        <span className={`font-medium ${isLowStock ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded-lg' : 'text-theme-text-primary'}`}>
                            {stock.receivedQuantity} {stock.unitOfMeasure}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-theme-text-secondary">{t('stockIn.totalValue')}:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(stock.totalValue)}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-theme-border text-xs">
                    <span className="text-theme-text-secondary">{formatDate(stock.receivedDate)}</span>
                    {isLowStock ? (
                        <span className="px-2 py-1 font-medium rounded-lg bg-red-50 text-red-600 border border-red-100">
                            {t('stockIn.lowStockStatus')}
                        </span>
                    ) : (
                        <span className="px-2 py-1 font-medium rounded-lg bg-green-50 text-green-600 border border-green-100">
                            {t('stockIn.inStock')}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    const renderTableView = () => (
        <div className="bg-theme-bg-primary rounded-xl shadow-sm border border-theme-border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-theme-bg-tertiary border-b border-theme-border">
                            <th className="px-5 py-3 text-left font-medium text-theme-text-secondary">#</th>
                            <th className="px-5 py-3 text-left font-medium text-theme-text-secondary">{t('stockIn.sku')}</th>
                            <th
                                className="px-5 py-3 text-left font-medium text-theme-text-secondary cursor-pointer hover:bg-theme-bg-secondary transition-colors"
                                onClick={() => {
                                    setSortBy('itemName');
                                    setSortOrder(sortBy === 'itemName' && sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                <div className="flex items-center space-x-2">
                                    <span>{t('stockIn.itemName')}</span>
                                    <ChevronDown className={`w-3 h-3 transition-transform ${sortBy === 'itemName' ? 'text-primary-500' : 'text-theme-text-secondary opacity-50'} ${sortBy === 'itemName' && sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                                </div>
                            </th>
                            <th className="px-5 py-3 text-left font-medium text-theme-text-secondary hidden sm:table-cell">{t('stockIn.quantity')}</th>
                            <th className="px-5 py-3 text-left font-medium text-theme-text-secondary hidden md:table-cell">{t('stockIn.unitCost')}</th>
                            <th className="px-5 py-3 text-left font-medium text-theme-text-secondary hidden lg:table-cell">{t('stockIn.totalValue')}</th>
                            <th className="px-5 py-3 text-left font-medium text-theme-text-secondary hidden xl:table-cell">{t('stockIn.location')}</th>
                            <th className="px-5 py-3 text-left font-medium text-theme-text-secondary">{t('stockIn.status')}</th>
                            <th className="px-5 py-3 text-center font-medium text-theme-text-secondary">{t('stockIn.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-theme-border">
                        {currentStocks.map((stock, index) => {
                            const isLowStock = stock.receivedQuantity <= stock.reorderLevel;
                            return (
                                <tr key={stock.id} className="hover:bg-theme-bg-tertiary transition-colors group">
                                    <td className="px-5 py-4 text-theme-text-secondary">{startIndex + index + 1}</td>
                                    <td className="px-5 py-4">
                                        <span className="font-mono text-xs text-primary-600 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">{stock.sku}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-[10px] font-bold shadow-md ${getAvatarColor(stock.itemName)}`}>
                                                {getInitials(stock.itemName)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-theme-text-primary truncate max-w-[200px]">{stock.itemName}</div>
                                                <div className="text-[10px] text-theme-text-secondary">{stock.categoryName || 'General'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 font-medium text-theme-text-primary hidden sm:table-cell text-left">
                                        {stock.receivedQuantity} <span className="text-theme-text-secondary text-[10px] ml-1">{stock.unitOfMeasure}</span>
                                    </td>
                                    <td className="px-5 py-4 text-theme-text-secondary hidden md:table-cell">
                                        {formatCurrency(stock.unitCost)}
                                    </td>
                                    <td className="px-5 py-4 text-green-600 font-bold hidden lg:table-cell">
                                        {formatCurrency(stock.totalValue)}
                                    </td>
                                    <td className="px-5 py-4 text-theme-text-secondary hidden xl:table-cell">{stock.warehouseLocation || '—'}</td>
                                    <td className="px-5 py-4">
                                        {isLowStock ? (
                                            <span className="inline-flex px-2 py-1 text-[10px] font-medium rounded-lg bg-red-500/10 text-red-600 border border-red-500/20">
                                                {t('stockIn.lowStockStatus')}
                                            </span>
                                        ) : (
                                            <span className="inline-flex px-2 py-1 text-[10px] font-medium rounded-lg bg-green-500/10 text-green-600 border border-green-500/20">
                                                {t('stockIn.inStock')}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleViewStock(stock)} className="p-2 text-theme-text-secondary hover:text-primary-600 hover:bg-theme-bg-secondary rounded-lg transition-all" title={t('stockIn.viewStock')}>
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleEditStock(stock)} disabled={operationLoading} className="p-2 text-theme-text-secondary hover:text-amber-600 hover:bg-theme-bg-secondary rounded-lg transition-all disabled:opacity-50" title={t('stockIn.editStock')}>
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteStock(stock)} disabled={operationLoading} className="p-2 text-theme-text-secondary hover:text-red-600 hover:bg-theme-bg-secondary rounded-lg transition-all disabled:opacity-50" title={t('stockIn.deleteStock')}>
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => { setSelectedStock(stock); setIsQuickUpdateModalOpen(true); }} disabled={operationLoading} className="p-2 text-theme-text-secondary hover:text-primary-600 hover:bg-theme-bg-secondary rounded-lg transition-all disabled:opacity-50" title={t('stockIn.quickUpdate')}>
                                                <RefreshCw className="w-4 h-4" />
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
        <div className="bg-theme-bg-primary rounded-xl shadow-sm border border-theme-border divide-y divide-theme-border overflow-hidden">
            {currentStocks.map((stock) => (
                <div key={stock.id} className="p-5 hover:bg-theme-bg-tertiary transition-all group">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-[12px] font-bold shadow-sm ${getAvatarColor(stock.itemName)}`}>
                                {getInitials(stock.itemName)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-theme-text-primary text-sm truncate">{stock.itemName}</div>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-primary-600 font-mono text-xs bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">{stock.sku}</span>
                                    <span className="text-theme-text-secondary text-xs">{formatDate(stock.receivedDate)}</span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm flex-1 max-w-2xl px-4">
                            <div className="flex flex-col">
                                <span className="text-theme-text-secondary text-xs mb-1">{t('stockIn.quantity')}</span>
                                <span className="text-theme-text-primary font-medium">{stock.receivedQuantity} {stock.unitOfMeasure}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-theme-text-secondary text-xs mb-1">{t('stockIn.totalValue')}</span>
                                <span className="text-green-600 font-bold">{formatCurrency(stock.totalValue)}</span>
                            </div>
                            <div className="hidden md:flex flex-col">
                                <span className="text-theme-text-secondary text-xs mb-1">{t('stockIn.status')}</span>
                                <span className={`font-medium ${stock.receivedQuantity <= stock.reorderLevel ? 'text-red-600' : 'text-green-600'}`}>
                                    {stock.receivedQuantity <= stock.reorderLevel ? t('stockIn.lowStockStatus') : t('stockIn.inStock')}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleViewStock(stock)} className="p-2 text-theme-text-secondary hover:text-primary-600 hover:bg-theme-bg-secondary rounded-lg transition-all" title="View Stock">
                                <Eye className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleEditStock(stock)} disabled={operationLoading} className="p-2 text-theme-text-secondary hover:text-amber-600 hover:bg-theme-bg-secondary rounded-lg transition-all disabled:opacity-50" title="Edit Stock">
                                <Edit className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDeleteStock(stock)} disabled={operationLoading} className="p-2 text-theme-text-secondary hover:text-red-600 hover:bg-theme-bg-secondary rounded-lg transition-all disabled:opacity-50" title="Delete Stock">
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <button onClick={() => { setSelectedStock(stock); setIsQuickUpdateModalOpen(true); }} disabled={operationLoading} className="p-2 text-theme-text-secondary hover:text-primary-600 hover:bg-theme-bg-secondary rounded-lg transition-all disabled:opacity-50" title="Quick Update">
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
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
            <div className="flex items-center justify-between bg-theme-bg-tertiary px-6 py-4 border-t border-theme-border rounded-b-xl">
                <div className="text-sm text-theme-text-secondary">
                    Showing <span className="text-theme-text-primary px-1">{startIndex + 1}</span>–<span className="text-theme-text-primary px-1">{Math.min(endIndex, filteredStocks.length)}</span> of <span className="text-theme-text-primary px-1">{filteredStocks.length}</span>
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}
                        className="p-2 text-theme-text-secondary bg-theme-bg-primary border border-theme-border rounded-lg hover:bg-theme-bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1">
                        {pages.map((page) => (
                            <button key={page} onClick={() => setCurrentPage(page)}
                                className={`min-w-[32px] h-8 text-xs font-medium rounded-lg transition-all ${currentPage === page ? 'bg-primary-600 text-white shadow-md' : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary border border-theme-border'}`}>
                                {page}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}
                        className="p-2 text-theme-text-secondary bg-theme-bg-primary border border-theme-border rounded-lg hover:bg-theme-bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm">
                        <ChevronRight className="w-4 h-4" />
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
            <ImportStockModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={() => {
                    // Trigger refresh
                    handleFilterAndSort(); // Or trigger re-fetch?
                    // Ideally re-fetch from server
                    // But I need access to fetchStocks which is inside useEffect.
                    // For now, I'll just rely on socket update or user refresh, or I can copy fetch logic here.
                    // Or better, I'll trigger a reload of window or just use the same logic as the refresh button.
                    stockService.getAllStocks().then(data => {
                        const normalizedData = (Array.isArray(data) ? data : [data]).map(stock => ({
                            ...stock,
                            unitCost: toNumber(stock.unitCost),
                            receivedQuantity: parseInt(stock.receivedQuantity as any) || 0,
                            totalValue: toNumber(stock.totalValue),
                            reorderLevel: parseInt(stock.reorderLevel as any) || 0,
                        }));
                        setAllStocks(normalizedData);
                    });
                }}
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
            <div className="bg-theme-bg-primary shadow-sm border-b border-theme-border">
                <div className="px-5 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-theme-text-primary">{t('stockIn.title')}</h1>
                            <p className="text-xs text-theme-text-secondary mt-1">{t('stockIn.subtitle')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={async () => {
                                setLoading(true);
                                try {
                                    const data = await stockService.getAllStocks();
                                    setAllStocks((Array.isArray(data) ? data : [data]).map(s => ({
                                        ...s,
                                        unitCost: toNumber(s.unitCost),
                                        receivedQuantity: parseInt(s.receivedQuantity as any) || 0,
                                        totalValue: toNumber(s.totalValue),
                                        reorderLevel: parseInt(s.reorderLevel as any) || 0,
                                    })));
                                } finally {
                                    setLoading(false);
                                }
                            }} disabled={loading} className="flex items-center gap-2 px-4 py-2 text-theme-text-secondary hover:text-theme-text-primary border border-theme-border rounded-lg hover:bg-theme-bg-tertiary disabled:opacity-50 transition-all" title={t('stockIn.refresh')}>
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                <span className="text-xs font-medium">{t('stockIn.refresh')}</span>
                            </button>
                            <div className="relative">
                                <button
                                    onClick={() => setIsExportOpen(!isExportOpen)}
                                    className="flex items-center gap-2 px-4 py-2 text-theme-text-secondary hover:text-theme-text-primary border border-theme-border rounded-lg hover:bg-theme-bg-tertiary disabled:opacity-50 transition-all font-semibold"
                                    title={t('stockIn.export')}
                                >
                                    <Download className="w-4 h-4" />
                                    <span className="text-xs font-medium">{t('stockIn.export')}</span>
                                    <ChevronDown className={`w-3 h-3 transition-transform ${isExportOpen ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {isExportOpen && (
                                        <>
                                            <div className="fixed inset-0 z-[60]" onClick={() => setIsExportOpen(false)} />
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 top-full mt-2 w-40 bg-theme-bg-primary border border-theme-border rounded-lg shadow-xl py-2 z-[70]"
                                            >
                                                <button onClick={() => { handleExportPDF(); setIsExportOpen(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-theme-bg-tertiary flex items-center gap-2 text-theme-text-primary">
                                                    <div className="w-2 h-2 rounded-full bg-red-500" /> {t('stockIn.pdf') || 'PDF'}
                                                </button>
                                                <button onClick={() => { handleExportExcel(); setIsExportOpen(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-theme-bg-tertiary flex items-center gap-2 text-theme-text-primary">
                                                    <div className="w-2 h-2 rounded-full bg-green-500" /> {t('stockIn.excel') || 'Excel'}
                                                </button>
                                                <button onClick={() => { handleExportCSV(); setIsExportOpen(false); }} className="w-full text-left px-4 py-2 text-xs hover:bg-theme-bg-tertiary flex items-center gap-2 text-theme-text-primary">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" /> {t('stockIn.csv') || 'CSV'}
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                            <button onClick={handleAddStock} disabled={operationLoading}
                                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md shadow-primary-600/20 transition-all disabled:opacity-50">
                                <Plus className="w-4 h-4" />
                                <span className="text-xs">{t('stockIn.receiveStock')}</span>
                            </button>
                            <button onClick={() => setIsImportModalOpen(true)} disabled={operationLoading}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50">
                                <Upload className="w-4 h-4" />
                                <span className="text-xs">{t('stockIn.importStock')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 py-4 space-y-4">
                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="bg-theme-bg-primary rounded-xl shadow-sm border border-theme-border p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-primary-500/10 rounded-xl flex items-center justify-center">
                                <Package className="w-6 h-6 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-theme-text-secondary">{t('stockIn.totalItems')}</p>
                                <p className="text-2xl font-bold text-theme-text-primary">{totalStockItems}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-theme-bg-primary rounded-xl shadow-sm border border-theme-border p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-theme-text-secondary">{t('stockIn.totalValue')}</p>
                                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalValue)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-theme-bg-primary rounded-xl shadow-sm border border-theme-border p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-rose-500/10 rounded-xl flex items-center justify-center">
                                <AlertCircle className="w-6 h-6 text-rose-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-theme-text-secondary">{t('stockIn.lowStock')}</p>
                                <p className="text-2xl font-bold text-rose-600">{lowStockItems}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-theme-bg-primary rounded-xl shadow-sm border border-theme-border p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-amber-500/10 rounded-xl flex items-center justify-center">
                                <Package className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-theme-text-secondary">{t('stockIn.highValue')}</p>
                                <p className="text-2xl font-bold text-theme-text-primary">{highValueItems}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SEARCH & FILTERS */}
                <div className="bg-theme-bg-primary rounded-xl shadow-sm border border-theme-border p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                        {/* Search + Date Filter */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="w-4 h-4 text-theme-text-secondary absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder={t('stockIn.searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-xs border border-theme-border rounded-lg bg-theme-bg-secondary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-theme-text-secondary/50"
                                />
                            </div>

                            {/* Date Filter Buttons */}
                            <div className="flex gap-1 bg-theme-bg-tertiary/50 p-1 rounded-lg border border-theme-border">
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
                                        className={`px-3 py-1.5 text-[10px] font-medium rounded-md capitalize transition-all ${dateFilter === opt
                                            ? 'bg-theme-bg-primary text-primary-600 shadow-sm border border-theme-border'
                                            : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary'
                                            }`}
                                    >
                                        {opt === 'all' ? t('stockIn.allTime') :
                                            opt === 'today' ? t('stockIn.today') :
                                                opt === 'week' ? t('stockIn.week') :
                                                    opt === 'month' ? t('stockIn.month') : t('stockIn.custom')}
                                    </button>
                                ))}
                            </div>

                            {/* Custom Date Inputs */}
                            {dateFilter === 'custom' && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <input
                                        type="date"
                                        value={customStartDate}
                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                        className="px-3 py-1.5 text-xs bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                    />
                                    <span className="text-theme-text-secondary text-xs">{t('stockIn.to')}</span>
                                    <input
                                        type="date"
                                        value={customEndDate}
                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                        className="px-3 py-1.5 text-xs bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                                    />
                                </motion.div>
                            )}
                        </div>

                        {/* Sort & View Mode */}
                        <div className="flex items-center space-x-3">
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-') as [keyof Stock, 'asc' | 'desc'];
                                    setSortBy(field);
                                    setSortOrder(order);
                                }}
                                className="text-xs bg-theme-bg-secondary border border-theme-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-theme-text-primary cursor-pointer hover:bg-theme-bg-tertiary transition-all"
                            >
                                <option value="itemName-asc">{t('stockIn.sort.nameAsc')}</option>
                                <option value="itemName-desc">{t('stockIn.sort.nameDesc')}</option>
                                <option value="receivedDate-desc">{t('stockIn.sort.newest')}</option>
                                <option value="receivedDate-asc">{t('stockIn.sort.oldest')}</option>
                                <option value="receivedQuantity-desc">{t('stockIn.sort.qtyHigh')}</option>
                                <option value="receivedQuantity-asc">{t('stockIn.sort.qtyLow')}</option>
                                <option value="totalValue-desc">{t('stockIn.sort.valHigh')}</option>
                                <option value="totalValue-asc">{t('stockIn.sort.valLow')}</option>
                            </select>
                            <div className="flex items-center bg-theme-bg-tertiary/50 p-1 rounded-lg border border-theme-border">
                                <button onClick={() => setViewMode('table')} className={`p-2 rounded transition-all ${viewMode === 'table' ? 'bg-theme-bg-primary shadow-sm text-primary-600 border border-theme-border' : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary'}`} title={t('stockIn.sort.tableView')}>
                                    <List className="w-4 h-4" />
                                </button>
                                <button onClick={() => setViewMode('grid')} className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-theme-bg-primary shadow-sm text-primary-600 border border-theme-border' : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary'}`} title={t('stockIn.sort.gridView')}>
                                    <Grid3X3 className="w-4 h-4" />
                                </button>
                                <button onClick={() => setViewMode('list')} className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-theme-bg-primary shadow-sm text-primary-600 border border-theme-border' : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary'}`} title={t('stockIn.sort.listView')}>
                                    <Package className="w-4 h-4" />
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
                                    {t('stockIn.clearFilters')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-600 text-xs font-medium animate-in shake-1">
                        <div className="flex items-center gap-3">
                            <XCircle className="w-5 h-5" />
                            {error}
                        </div>
                    </div>
                )}
                {loading ? (
                    <div className="bg-theme-bg-primary rounded-xl shadow-sm border border-theme-border p-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm font-medium text-theme-text-secondary">{t('stockIn.loading')}</span>
                        </div>
                    </div>
                ) : currentStocks.length === 0 ? (
                    <div className="bg-theme-bg-primary rounded-2xl shadow-xl border border-theme-border p-16 text-center">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-theme-bg-tertiary rounded-full flex items-center justify-center text-theme-text-secondary">
                                <Search className="w-8 h-8" />
                            </div>
                            <div className="text-sm font-medium text-theme-text-secondary">
                                {searchTerm || categoryFilter !== 'all' || dateFilter !== 'all' ? t('stockIn.noStockFound') : t('stockIn.noStockReceived')}
                            </div>
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
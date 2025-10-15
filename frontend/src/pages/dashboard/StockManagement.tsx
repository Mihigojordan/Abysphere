import React, { useState, useEffect, useRef } from 'react';
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
    Calendar,
    ChevronDown,
    MoreHorizontal,
    DollarSign,
    Scale
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import stockService, { type CreateStockInInput, type UpdateStockInInput, type StockIn, type StockCategory } from '../../services/stockInService';

import DeleteStockInModal from '../../components/dashboard/stock/DeleteStockInModal';
import { API_URL } from '../../api/api';
import { useSocketEvent } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface OperationStatus {
    type: 'success' | 'error' | 'info';
    message: string;
}

type ViewMode = 'table' | 'grid' | 'list';

const StockManagement = ({role}:{role:string}) => {
    const [stockins, setStockins] = useState<StockIn[]>([]);
    const [allStockins, setAllStockins] = useState<StockIn[]>([]);
    const [categories, setCategories] = useState<StockCategory[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [unitFilter, setUnitFilter] = useState('all');
    const [sortBy, setSortBy] = useState<keyof StockIn>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [rowsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStockIn, setSelectedStockIn] = useState<StockIn | null>(null);
    const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
    const [operationLoading, setOperationLoading] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const pdfContentRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate()

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [stockData, catData] = await Promise.all([
                    stockService.getAllStockIns(),
                    stockService.getAllCategories()
                ]);
                setAllStockins(stockData || []);
                setCategories(catData || []);
                setError(null);
            } catch (err: any) {
                const errorMessage = err.message || 'Failed to load stock data';
                console.error('Error fetching stock data:', err);
                setError(errorMessage);
                showOperationStatus('error', errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        handleFilterAndSort();
    }, [searchTerm, categoryFilter, unitFilter, sortBy, sortOrder, allStockins]);

    useSocketEvent('stockInCreated', (stockInData: StockIn) => {
        console.log('StockIn created via WebSocket:', stockInData);
        setAllStockins((prev) => [...prev, stockInData]);
        showOperationStatus('success', `Stock item ${stockInData.productName} created`);
    });

    useSocketEvent('stockInUpdated', (stockInData: StockIn) => {
        console.log('StockIn updated via WebSocket:', stockInData);
        setAllStockins((prev) =>
            prev.map((s) => (s.id === stockInData.id ? stockInData : s))
        );
        showOperationStatus('success', `Stock item ${stockInData.productName} updated`);
    });

    useSocketEvent('stockInDeleted', ({ id }: { id: string }) => {
        console.log('StockIn deleted via WebSocket:', id);
        setAllStockins((prev) => prev.filter((s) => s.id !== id));
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
        let filtered = [...allStockins];

        if (searchTerm.trim()) {
            filtered = filtered.filter(
                (stock) =>
                    stock.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    stock.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    stock.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    stock.location?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter((stock) => stock.stockcategoryId === categoryFilter);
        }

        if (unitFilter !== 'all') {
            filtered = filtered.filter((stock) => stock.unit === unitFilter);
        }

        filtered.sort((a, b) => {
            let aValue = a[sortBy] ?? '';
            let bValue = b[sortBy] ?? '';
            if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                const dateA = new Date(aValue as string).getTime();
                const dateB = new Date(bValue as string).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else if (sortBy === 'quantity' || sortBy === 'unitPrice' || sortBy === 'reorderLevel') {
                const numA = parseFloat(aValue as string);
                const numB = parseFloat(bValue as string);
                return sortOrder === 'asc' ? numA - numB : numB - numA;
            } else {
                const strA = aValue.toString().toLowerCase();
                const strB = bValue.toString().toLowerCase();
                return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
            }
        });

        setStockins(filtered);
        setCurrentPage(1);
    };

    const handleExportPDF = async () => {
        try {
            setOperationLoading(true);
            const date = new Date().toLocaleDateString('en-CA').replace(/\//g, '');
            const filename = `stock_export_${date}.pdf`;

            const tableRows = filteredStockins.map((stock, index) => {
                const categoryName = stock.stockcategory?.name || 'N/A';
                return `
                    <tr>
                        <td style="font-size:10px;">${index + 1}</td>
                        <td style="font-size:10px;">${stock.productName}</td>
                        <td style="font-size:10px;">${categoryName}</td>
                        <td style="font-size:10px;">${stock.quantity} ${stock.unit}</td>
                        <td style="font-size:10px;">$${Number(stock.unitPrice || 0).toFixed(2)}</td>
                        <td style="font-size:10px;">${stock.supplier || 'N/A'}</td>
                        <td style="font-size:10px;">${stock.location || 'N/A'}</td>
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
                    <h1>Stock Inventory</h1>
                    <p>Exported on: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' })}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Product Name</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Unit Price</th>
                                <th>Supplier</th>
                                <th>Location</th>
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

    const handleAddStockIn = () => {
      navigate(`create`)
    };

    const handleEditStockIn = async (stockIn:StockIn) => {
    if(!stockIn.id) return Swal.fire({}) 
      navigate(`update/${stockIn.id}`)
    };

    const handleViewStockIn = (stockIn: StockIn) => {
         if(!stockIn.id) return Swal.fire({}) 
      navigate(`${stockIn.id}`)
    };

    const handleDeleteStockIn = (stockIn: StockIn) => {
        setSelectedStockIn(stockIn);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async (stockIn: StockIn) => {
        try {
            setOperationLoading(true);
            await stockService.deleteStockIn(stockIn.id);
            showOperationStatus('success', `Stock item "${stockIn.productName}" deleted successfully`);
        } catch (err: any) {
            console.error('Error deleting stock item:', err);
            showOperationStatus('error', err.message || 'Failed to delete stock item');
        } finally {
            setOperationLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedStockIn(null);
        }
    };

    const formatDate = (date?: Date): string => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const isLowStock = (stock: StockIn): boolean => {
        return stock.quantity <= (stock.reorderLevel || 0);
    };

    const filteredStockins = stockins;
    const totalPages = Math.ceil(filteredStockins.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentStockins = filteredStockins.slice(startIndex, endIndex);

    // Summary statistics
    const totalStockItems = allStockins.length;
    const totalQuantity = allStockins.reduce((sum, s) => sum + s.quantity, 0);
    const lowStockItems = allStockins.filter(isLowStock).length;
    const highValueItems = allStockins.filter(s => Number(s.unitPrice || 0) * s.quantity > 10000).length; // Arbitrary threshold

    const StockInCard = ({ stockIn }: { stockIn: StockIn }) => {
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsDropdownOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);

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
                                    onClick={() => {
                                        handleViewStockIn(stockIn);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                                >
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                </button>
                                <button
                                    onClick={() => {
                                        handleEditStockIn(stockIn);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                                >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        handleDeleteStockIn(stockIn);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                                >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(stockIn.productName)} text-white text-xs font-medium`}>
                        {getInitials(stockIn.productName)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-xs truncate">
                            {stockIn.productName}
                        </div>
                        <div className="text-gray-500 text-xs truncate">{stockIn.stockcategory?.name || 'Uncategorized'}</div>
                    </div>
                </div>
                <div className="space-y-1 mb-2">
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <Package className="w-3 h-3" />
                        <span>{stockIn.quantity} {stockIn.unit}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <DollarSign className="w-3 h-3" />
                        <span>${Number(stockIn.unitPrice || 0).toFixed(2)}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                        isLowStock(stockIn) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                        {isLowStock(stockIn) ? '• Low Stock' : '• In Stock'}
                    </span>
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
                            <th
                                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                    setSortBy('productName');
                                    setSortOrder(sortBy === 'productName' && sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Product Name</span>
                                    <ChevronDown className={`w-3 h-3 ${sortBy === 'productName' ? 'text-primary-600' : 'text-gray-400'}`} />
                                </div>
                            </th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Category</th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Quantity</th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium hidden md:table-cell">Unit Price</th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Supplier</th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium">Stock Status</th>
                            <th
                                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100 hidden xl:table-cell"
                                onClick={() => {
                                    setSortBy('createdAt');
                                    setSortOrder(sortBy === 'createdAt' && sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Created</span>
                                    <ChevronDown className={`w-3 h-3 ${sortBy === 'createdAt' ? 'text-primary-600' : 'text-gray-400'}`} />
                                </div>
                            </th>
                            <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentStockins.map((stockIn, index) => (
                            <tr key={stockIn.id} className="hover:bg-gray-25">
                                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                                <td className="py-2 px-2">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(stockIn.productName)} text-white text-xs font-medium`}>
                                            {getInitials(stockIn.productName)}
                                        </div>
                                        <span className="font-medium text-gray-900 text-xs">
                                            {stockIn.productName}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{stockIn.stockcategory?.name || 'N/A'}</td>
                                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{stockIn.quantity} {stockIn.unit}</td>
                                <td className="py-2 px-2 text-gray-700 hidden md:table-cell">${Number(stockIn.unitPrice || 0).toFixed(2)}</td>
                                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{stockIn.supplier || 'N/A'}</td>
                                <td className="py-2 px-2">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                        isLowStock(stockIn) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                        {isLowStock(stockIn) ? '• Low Stock' : '• In Stock'}
                                    </span>
                                </td>
                                <td className="py-2 px-2 text-gray-700 hidden xl:table-cell">{formatDate(stockIn.createdAt)}</td>
                                <td className="py-2 px-2">
                                    <div className="flex items-center justify-end space-x-1">
                                        <button
                                            onClick={() => handleViewStockIn(stockIn)}
                                            className="text-gray-400 hover:text-primary-600 p-1"
                                            title="View"
                                        >
                                            <Eye className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleEditStockIn(stockIn)}
                                            disabled={operationLoading}
                                            className="text-gray-400 hover:text-primary-600 p-1 disabled:opacity-50"
                                            title="Edit"
                                        >
                                            <Edit className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteStockIn(stockIn)}
                                            disabled={operationLoading}
                                            className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderGridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {currentStockins.map((stockIn) => (
                <StockInCard key={stockIn.id} stockIn={stockIn} />
            ))}
        </div>
    );

    const renderListView = () => (
        <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
            {currentStockins.map((stockIn) => (
                <div key={stockIn.id} className="px-4 py-3 hover:bg-gray-25">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(stockIn.productName)} text-white text-sm font-medium`}>
                                {getInitials(stockIn.productName)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 text-sm truncate">
                                    {stockIn.productName}
                                </div>
                                <div className="text-gray-500 text-xs truncate">{stockIn.stockcategory?.name || 'Uncategorized'}</div>
                            </div>
                        </div>
                        <div className="hidden md:grid grid-cols-2 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
                            <span className="truncate">{stockIn.quantity} {stockIn.unit}</span>
                            <span>${Number(stockIn.unitPrice || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                            <button
                                onClick={() => handleViewStockIn(stockIn)}
                                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                                title="View Stock Item"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleEditStockIn(stockIn)}
                                disabled={operationLoading}
                                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors disabled:opacity-50"
                                title="Edit Stock Item"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteStockIn(stockIn)}
                                disabled={operationLoading}
                                className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Delete Stock Item"
                            >
                                <Trash2 className="w-4 h-4" />
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

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="flex items-center justify-between bg-white px-3 py-2 border-t border-gray-200">
                <div className="text-xs text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredStockins.length)} of {filteredStockins.length}
                </div>
                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-3 h-3" />
                    </button>
                    {pages.map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-2 py-1 text-xs rounded ${
                                currentPage === page
                                    ? 'bg-primary-500 text-white'
                                    : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 text-xs">
        
            
            <DeleteStockInModal
                isOpen={isDeleteModalOpen}
                stockIn={selectedStockIn}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={handleDelete}
            />
            {operationStatus && (
                <div className="fixed top-4 right-4 z-50">
                    <div
                        className={`flex items-center space-x-2 px-3 py-2 rounded shadow-lg text-xs ${
                            operationStatus.type === 'success'
                                ? 'bg-green-50 border border-green-200 text-green-800'
                                : operationStatus.type === 'error'
                                ? 'bg-red-50 border border-red-200 text-red-800'
                                : 'bg-primary-50 border border-primary-200 text-primary-800'
                        }`}
                    >
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
                            <h1 className="text-lg font-semibold text-gray-900">Stock Management</h1>
                            <p className="text-xs text-gray-500 mt-0.5">Manage your inventory stock items</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => stockService.getAllStockIns().then(data => setAllStockins(data || []))}
                                disabled={loading}
                                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </button>
                            <button
                                onClick={handleExportPDF}
                                disabled={operationLoading || filteredStockins.length === 0}
                                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                                title="Export PDF"
                            >
                                <Download className="w-3 h-3" />
                                <span>Export</span>
                            </button>
                            <button
                                onClick={handleAddStockIn}
                                disabled={operationLoading}
                                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
                                aria-label="Add new stock item"
                            >
                                <Plus className="w-3 h-3" />
                                <span>Add Stock Item</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-4 py-4 space-y-4">
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
                                <Scale className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Total Quantity</p>
                                <p className="text-lg font-semibold text-gray-900">{totalQuantity}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-orange-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Low Stock Items</p>
                                <p className="text-lg font-semibold text-gray-900">{lowStockItems}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-blue-100 rounded-full flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">High Value Items</p>
                                <p className="text-lg font-semibold text-gray-900">{highValueItems}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-3">
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search stock items..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                    aria-label="Search stock items"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center space-x-1 px-2 py-1.5 text-xs border rounded transition-colors ${
                                    showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <Filter className="w-3 h-3" />
                                <span>Filter</span>
                            </button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-') as [keyof StockIn, 'asc' | 'desc'];
                                    setSortBy(field);
                                    setSortOrder(order);
                                }}
                                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                aria-label="Sort stock items"
                            >
                                <option value="productName-asc">Name (A-Z)</option>
                                <option value="productName-desc">Name (Z-A)</option>
                                <option value="quantity-desc">Quantity (High-Low)</option>
                                <option value="quantity-asc">Quantity (Low-High)</option>
                                <option value="createdAt-desc">Newest First</option>
                                <option value="createdAt-asc">Oldest First</option>
                            </select>
                            <div className="flex items-center border border-gray-200 rounded">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-1.5 text-xs transition-colors ${
                                        viewMode === 'table' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                    title="Table View"
                                >
                                    <List className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 text-xs transition-colors ${
                                        viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                    title="Grid View"
                                >
                                    <Grid3X3 className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 text-xs transition-colors ${
                                        viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                    title="List View"
                                >
                                    <Package className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                    {showFilters && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 flex-wrap">
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    aria-label="Filter by category"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={unitFilter}
                                    onChange={(e) => setUnitFilter(e.target.value)}
                                    className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    aria-label="Filter by unit"
                                >
                                    <option value="all">All Units</option>
                                    <option value="PCS">Pieces (PCS)</option>
                                    <option value="KG">Kilograms (KG)</option>
                                    <option value="LITERS">Liters (LITERS)</option>
                                    <option value="METER">Meters (METER)</option>
                                    <option value="BOX">Boxes (BOX)</option>
                                    <option value="PACK">Packs (PACK)</option>
                                    <option value="OTHER">Other (OTHER)</option>
                                </select>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setCategoryFilter('all');
                                        setUnitFilter('all');
                                    }}
                                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-xs">
                        {error}
                    </div>
                )}
                {loading ? (
                    <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
                        <div className="inline-flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs">Loading stock items...</span>
                        </div>
                    </div>
                ) : currentStockins.length === 0 ? (
                    <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
                        <div className="text-xs">
                            {searchTerm || categoryFilter !== 'all' || unitFilter !== 'all' ? 'No stock items found matching your filters' : 'No stock items found'}
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

export default StockManagement;
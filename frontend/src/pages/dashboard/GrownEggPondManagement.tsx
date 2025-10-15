import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Download,
    Grid3X3,
    List,
    Egg,
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
import grownEggPondService, { type GrownEggPond, type CreateGrownEggPondInput, type UpdateGrownEggPondInput } from '../../services/grownEggPondService';
import DeleteGrownEggPondModal from '../../components/dashboard/grownEggPond/DeleteGrownEggPondModal';
import CreateUpdateGrownEggPondModal from '../../components/dashboard/grownEggPond/CreateUpdateGrownEggPondModal';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface OperationStatus {
    type: 'success' | 'error' | 'info';
    message: string;
}

type ViewMode = 'table' | 'grid' | 'list';
type ModalMode = 'create' | 'update';

const GrownEggPondManagement = ({ role }: { role: string }) => {
    const [records, setRecords] = useState<GrownEggPond[]>([]);
    const [allRecords, setAllRecords] = useState<GrownEggPond[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<keyof GrownEggPond>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [rowsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isCreateUpdateModalOpen, setIsCreateUpdateModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [selectedRecord, setSelectedRecord] = useState<GrownEggPond | null>(null);
    const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
    const [operationLoading, setOperationLoading] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const pdfContentRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                setLoading(true);
                const data = await grownEggPondService.getAllGrownEggPonds();
                setAllRecords(data || []);
                setError(null);
            } catch (err: any) {
                const errorMessage = err.message || 'Failed to load pond records';
                console.error('Error fetching pond records:', err);
                setError(errorMessage);
                showOperationStatus('error', errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchRecords();
    }, []);

    useEffect(() => {
        handleFilterAndSort();
    }, [searchTerm, sortBy, sortOrder, allRecords]);

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
        let filtered = [...allRecords];

        if (searchTerm.trim()) {
            filtered = filtered.filter(
                (record) =>
                    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    record.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    record.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        filtered.sort((a, b) => {
            let aValue = a[sortBy] ?? '';
            let bValue = b[sortBy] ?? '';
            if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                const dateA = new Date(aValue as string).getTime();
                const dateB = new Date(bValue as string).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else if (sortBy === 'size') {
                return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
            } else {
                const strA = aValue.toString().toLowerCase();
                const strB = bValue.toString().toLowerCase();
                return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
            }
        });

        setRecords(filtered);
        setCurrentPage(1);
    };

    const handleSaveRecord = async (data: CreateGrownEggPondInput | UpdateGrownEggPondInput) => {
        try {
            setOperationLoading(true);
            if (modalMode === 'create') {
                const newRecord = await grownEggPondService.createGrownEggPond(data as CreateGrownEggPondInput);
                setAllRecords((prev) => [...prev, newRecord]);
                showOperationStatus('success', 'Pond created successfully');
                setIsCreateUpdateModalOpen(false);
            } else {
                if (!selectedRecord) {
                    throw new Error('No pond selected for update');
                }
                const updatedRecord = await grownEggPondService.updateGrownEggPond(selectedRecord.id, data as UpdateGrownEggPondInput);
                setAllRecords((prev) => prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r)));
                showOperationStatus('success', 'Pond updated successfully');
                setIsCreateUpdateModalOpen(false);
            }
        } catch (err: any) {
            console.error('Error in handleSaveRecord:', err);
            showOperationStatus('error', err.message || 'Failed to save pond');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            setOperationLoading(true);
            const date = new Date().toLocaleDateString('en-CA').replace(/\//g, '');
            const filename = `grown_egg_ponds_export_${date}.pdf`;

            const tableRows = records.map((record, index) => {
                return `
                    <tr>
                        <td style="font-size:10px;">${index + 1}</td>
                        <td style="font-size:10px;">${record.name}</td>
                        <td style="font-size:10px;">${record.code || 'N/A'}</td>
                        <td style="font-size:10px;">${record.size || 'N/A'}</td>
                        <td style="font-size:10px;">${record.description || 'N/A'}</td>
                        <td style="font-size:10px;">${new Date(record.createdAt).toLocaleDateString('en-GB')}</td>
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
                    <h1>Grown Egg Pond Records</h1>
                    <p>Exported on: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' })}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Code</th>
                                <th>Size</th>
                                <th>Description</th>
                                <th>Created At</th>
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

    const handleAddRecord = () => {
        setModalMode('create');
        setSelectedRecord(null);
        setIsCreateUpdateModalOpen(true);
    };

    const handleEditRecord = (record: GrownEggPond) => {
        if (!record.id) return Swal.fire({ icon: 'error', title: 'Error', text: 'Invalid record ID' });
        setModalMode('update');
        setSelectedRecord(record);
        setIsCreateUpdateModalOpen(true);
    };

    const handleViewRecord = (record: GrownEggPond) => {
        if (!record.id) return Swal.fire({ icon: 'error', title: 'Error', text: 'Invalid record ID' });
        navigate(`${record.id}`);
    };

    const handleDeleteRecord = (record: GrownEggPond) => {
        setSelectedRecord(record);
        setIsDeleteModalOpen(true);
    };

    const handleDelete = async (record: GrownEggPond) => {
        try {
            setOperationLoading(true);
            await grownEggPondService.deleteGrownEggPond(record.id);
            setAllRecords((prev) => prev.filter((r) => r.id !== record.id));
            showOperationStatus('success', `Pond deleted successfully`);
        } catch (err: any) {
            console.error('Error deleting pond:', err);
            showOperationStatus('error', err.message || 'Failed to delete pond');
        } finally {
            setOperationLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedRecord(null);
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

    const filteredRecords = records;
    const totalPages = Math.ceil(filteredRecords.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentRecords = filteredRecords.slice(startIndex, endIndex);

    // Summary statistics
    const totalRecords = allRecords.length;
    const totalSize = allRecords.reduce((sum, r) => sum + (r.size || 0), 0);
    const uniqueNames = new Set(allRecords.map(r => r.name)).size;

    const GrownEggPondCard = ({ record }: { record: GrownEggPond }) => {
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
                                        handleViewRecord(record);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                                >
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                </button>
                                <button
                                    onClick={() => {
                                        handleEditRecord(record);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                                >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        handleDeleteRecord(record);
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(record.name)} text-white text-xs font-medium`}>
                        {getInitials(record.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-xs truncate">
                            {record.name}
                        </div>
                        <div className="text-gray-500 text-xs truncate">{record.description || 'No description'}</div>
                    </div>
                </div>
                <div className="space-y-1 mb-2">
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <Egg className="w-3 h-3" />
                        <span>Code: {record.code || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <Egg className="w-3 h-3" />
                        <span>Size: {record.size || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <Egg className="w-3 h-3" />
                        <span>Created: {formatDate(record.createdAt)}</span>
                    </div>
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
                                    setSortBy('name');
                                    setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Name</span>
                                    <ChevronDown className={`w-3 h-3 ${sortBy === 'name' ? 'text-primary-600' : 'text-gray-400'}`} />
                                </div>
                            </th>
                            <th
                                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                    setSortBy('code');
                                    setSortOrder(sortBy === 'code' && sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Code</span>
                                    <ChevronDown className={`w-3 h-3 ${sortBy === 'code' ? 'text-primary-600' : 'text-gray-400'}`} />
                                </div>
                            </th>
                            <th
                                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                    setSortBy('size');
                                    setSortOrder(sortBy === 'size' && sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Size</span>
                                    <ChevronDown className={`w-3 h-3 ${sortBy === 'size' ? 'text-primary-600' : 'text-gray-400'}`} />
                                </div>
                            </th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium">Description</th>
                            <th
                                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                    setSortBy('createdAt');
                                    setSortOrder(sortBy === 'createdAt' && sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Created At</span>
                                    <ChevronDown className={`w-3 h-3 ${sortBy === 'createdAt' ? 'text-primary-600' : 'text-gray-400'}`} />
                                </div>
                            </th>
                            <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentRecords.map((record, index) => (
                            <tr key={record.id} className="hover:bg-gray-25">
                                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                                <td className="py-2 px-2">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(record.name)} text-white text-xs font-medium`}>
                                            {getInitials(record.name)}
                                        </div>
                                        <span className="font-medium text-gray-900 text-xs">
                                            {record.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-2 px-2 text-gray-700">{record.code || 'N/A'}</td>
                                <td className="py-2 px-2 text-gray-700">{record.size || 'N/A'}</td>
                                <td className="py-2 px-2 text-gray-700">{record.description || 'N/A'}</td>
                                <td className="py-2 px-2 text-gray-700">{formatDate(record.createdAt)}</td>
                                <td className="py-2 px-2">
                                    <div className="flex items-center justify-end space-x-1">
                                        <button
                                            onClick={() => handleViewRecord(record)}
                                            className="text-gray-400 hover:text-primary-600 p-1"
                                            title="View"
                                        >
                                            <Eye className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleEditRecord(record)}
                                            disabled={operationLoading}
                                            className="text-gray-400 hover:text-primary-600 p-1 disabled:opacity-50"
                                            title="Edit"
                                        >
                                            <Edit className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRecord(record)}
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
            {currentRecords.map((record) => (
                <GrownEggPondCard key={record.id} record={record} />
            ))}
        </div>
    );

    const renderListView = () => (
        <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
            {currentRecords.map((record) => (
                <div key={record.id} className="px-4 py-3 hover:bg-gray-25">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(record.name)} text-white text-sm font-medium`}>
                                {getInitials(record.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 text-sm truncate">
                                    {record.name}
                                </div>
                                <div className="text-gray-500 text-xs truncate">{record.description || 'No description'}</div>
                            </div>
                        </div>
                        <div className="hidden md:grid grid-cols-3 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
                            <span>Code: {record.code || 'N/A'}</span>
                            <span>Size: {record.size || 'N/A'}</span>
                            <span>Created: {formatDate(record.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                            <button
                                onClick={() => handleViewRecord(record)}
                                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                                title="View Record"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleEditRecord(record)}
                                disabled={operationLoading}
                                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors disabled:opacity-50"
                                title="Edit Record"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteRecord(record)}
                                disabled={operationLoading}
                                className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Delete Record"
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
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredRecords.length)} of {filteredRecords.length}
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
            <DeleteGrownEggPondModal
                isOpen={isDeleteModalOpen}
                record={selectedRecord}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={handleDelete}
            />
            <CreateUpdateGrownEggPondModal
                isOpen={isCreateUpdateModalOpen}
                record={selectedRecord}
                onClose={() => {
                    setIsCreateUpdateModalOpen(false);
                    setSelectedRecord(null);
                }}
                onSave={handleSaveRecord}
                mode={modalMode}
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
                            <h1 className="text-lg font-semibold text-gray-900">Grown Egg Pond Management</h1>
                            <p className="text-xs text-gray-500 mt-0.5">Manage your grown egg pond records</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => grownEggPondService.getAllGrownEggPonds().then(data => setAllRecords(data || []))}
                                disabled={loading}
                                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </button>
                            <button
                                onClick={handleExportPDF}
                                disabled={operationLoading || filteredRecords.length === 0}
                                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                                title="Export PDF"
                            >
                                <Download className="w-3 h-3" />
                                <span>Export</span>
                            </button>
                            <button
                                onClick={handleAddRecord}
                                disabled={operationLoading}
                                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
                                aria-label="Add new pond record"
                            >
                                <Plus className="w-3 h-3" />
                                <span>Add Record</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-4 py-4 space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-primary-100 rounded-full flex items-center justify-center">
                                <Egg className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Total Ponds</p>
                                <p className="text-lg font-semibold text-gray-900">{totalRecords}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-green-100 rounded-full flex items-center justify-center">
                                <Egg className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Total Size</p>
                                <p className="text-lg font-semibold text-gray-900">{totalSize}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-orange-100 rounded-full flex items-center justify-center">
                                <Egg className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Unique Names</p>
                                <p className="text-lg font-semibold text-gray-900">{uniqueNames}</p>
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
                                    placeholder="Search ponds..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                    aria-label="Search ponds"
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
                                    const [field, order] = e.target.value.split('-') as [keyof GrownEggPond, 'asc' | 'desc'];
                                    setSortBy(field);
                                    setSortOrder(order);
                                }}
                                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                aria-label="Sort ponds"
                            >
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                                <option value="code-asc">Code (A-Z)</option>
                                <option value="code-desc">Code (Z-A)</option>
                                <option value="size-asc">Size (Low to High)</option>
                                <option value="size-desc">Size (High to Low)</option>
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
                                    <Egg className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                    {showFilters && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
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
                            <span className="text-xs">Loading pond records...</span>
                        </div>
                    </div>
                ) : currentRecords.length === 0 ? (
                    <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
                        <div className="text-xs">
                            {searchTerm ? 'No ponds found matching your search' : 'No pond records found'}
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

export default GrownEggPondManagement;
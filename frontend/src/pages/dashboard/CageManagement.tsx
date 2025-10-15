/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Grid3X3,
  List,
  Box,
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
  MoreHorizontal,
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import cageService, { type Cage } from '../../services/cageService';
import { useSocketEvent } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface OperationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

type ViewMode = 'table' | 'grid' | 'list';

const DeleteCageModal: React.FC<{
  isOpen: boolean;
  cage: Cage | null;
  onClose: () => void;
  onDelete: (cage: Cage) => Promise<void>;
}> = ({ isOpen, cage, onClose, onDelete }) => {
  if (!isOpen || !cage) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 w-full max-w-md">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Delete Cage</h3>
            <p className="text-xs text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-xs text-gray-700">
            Are you sure you want to delete{' '}
            <span className="font-semibold">{cage.cageName}</span> (
            {cage.cageCode})? This action will permanently remove the cage from
            the system.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onDelete(cage)}
            className="w-full sm:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const CageManagement: React.FC<{ role: string }> = ({ role }) => {
  const [cages, setCages] = useState<Cage[]>([]);
  const [allCages, setAllCages] = useState<Cage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [netTypeFilter, setNetTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<keyof Cage>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [rowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCage, setSelectedCage] = useState<Cage | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const pdfContentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCages = async () => {
      try {
        setLoading(true);
        const data = await cageService.getAllCages();
        setAllCages(data || []);
        setError(null);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load cages';
        console.error('Error fetching cages:', err);
        setError(errorMessage);
        showOperationStatus('error', errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchCages();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, netTypeFilter, statusFilter, sortBy, sortOrder, allCages]);

  useSocketEvent('cageCreated', (cageData: Cage) => {
    console.log('Cage created via WebSocket:', cageData);
    setAllCages((prevCages) => [...prevCages, cageData]);
    showOperationStatus('success', `Cage ${cageData.cageName} created`);
  });

  useSocketEvent('cageUpdated', (cageData: Cage) => {
    console.log('Cage updated via WebSocket:', cageData);
    setAllCages((prevCages) =>
      prevCages.map((c) => (c.id === cageData.id ? cageData : c))
    );
    showOperationStatus('success', `Cage ${cageData.cageName} updated`);
  });

  useSocketEvent('cageDeleted', ({ id }: { id: string }) => {
    console.log('Cage deleted via WebSocket:', id);
    setAllCages((prevCages) => prevCages.filter((c) => c.id !== id));
    showOperationStatus('success', 'Cage deleted');
  });

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-primary-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-yellow-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const showOperationStatus = (
    type: OperationStatus['type'],
    message: string,
    duration: number = 3000
  ) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allCages];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (cage) =>
          cage.cageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cage.cageCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cage.cageType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (netTypeFilter !== 'all') {
      filtered = filtered.filter(
        (cage) => cage.cageNetType === netTypeFilter.toUpperCase()
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (cage) => cage.cageStatus === statusFilter.toUpperCase()
      );
    }

    filtered.sort((a, b) => {
      let aValue = a[sortBy] ?? '';
      let bValue = b[sortBy] ?? '';
      if (sortBy === 'createdAt' || sortBy === 'stockingDate') {
        const dateA = new Date(aValue as string).getTime();
        const dateB = new Date(bValue as string).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const strA = aValue.toString().toLowerCase();
        const strB = bValue.toString().toLowerCase();
        return sortOrder === 'asc'
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      }
    });

    setCages(filtered);
    setCurrentPage(1);
  };

  const handleExportPDF = async () => {
    try {
      setOperationLoading(true);
      const date = new Date().toLocaleDateString('en-CA').replace(/\//g, '');
      const filename = `cages_export_${date}.pdf`;

      const tableRows = filteredCages
        .map((cage, index) => {
          return `
            <tr>
              <td style="font-size:10px;">${index + 1}</td>
              <td style="font-size:10px;">${cage.cageName}</td>
              <td style="font-size:10px;">${cage.cageCode}</td>
              <td style="font-size:10px;">${cage.cageNetType}</td>
              <td style="font-size:10px;">${cage.cageDepth} m</td>
              <td style="font-size:10px; color: ${
                cage.cageStatus === 'ACTIVE'
                  ? 'green'
                  : cage.cageStatus === 'UNDER_MAINTENANCE'
                  ? 'orange'
                  : 'red'
              };">
                ${cage.cageStatus}
              </td>
              <td style="font-size:10px;">${cage.cageCapacity}</td>
            </tr>
          `;
        })
        .join('');

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
          <h1>Cage List</h1>
          <p>Exported on: ${new Date().toLocaleString('en-US', {
            timeZone: 'Africa/Johannesburg',
          })}</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Cage Name</th>
                <th>Cage Code</th>
                <th>Net Type</th>
                <th>Depth</th>
                <th>Status</th>
                <th>Capacity</th>
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

  const handleAddCage = () => {
    navigate(`create`);
  };

  const handleEditCage = (cage: Cage) => {
    if (!cage.id)
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid cage ID',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
    navigate(`update/${cage.id}`);
  };

  const handleViewCage = (cage: Cage) => {
    if (!cage.id)
      return Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid cage ID',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
    navigate(`view/${cage.id}`);
  };

  const handleDeleteCage = (cage: Cage) => {
    setSelectedCage(cage);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async (cage: Cage) => {
    try {
      setOperationLoading(true);
      await cageService.deleteCage(cage.id);
      showOperationStatus('success', `Cage "${cage.cageName}" deleted successfully`);
    } catch (err: any) {
      console.error('Error deleting cage:', err);
      showOperationStatus('error', err.message || 'Failed to delete cage');
    } finally {
      setOperationLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedCage(null);
    }
  };

  const formatDate = (date?: string): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredCages = cages;
  const totalPages = Math.ceil(filteredCages.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentCages = filteredCages.slice(startIndex, endIndex);

  // Summary statistics
  const totalCages = allCages.length;
  const activeCages = allCages.filter((c) => c.cageStatus === 'ACTIVE').length;
  const maintenanceCages = allCages.filter(
    (c) => c.cageStatus === 'UNDER_MAINTENANCE'
  ).length;
  const inactiveCages = allCages.filter(
    (c) => c.cageStatus === 'INACTIVE'
  ).length;

  const CageCard: React.FC<{ cage: Cage }> = ({ cage }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
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
                    handleViewCage(cage);
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </button>
                <button
                  onClick={() => {
                    handleEditCage(cage);
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    handleDeleteCage(cage);
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
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(
              cage.cageName
            )} text-white text-xs font-medium relative`}
          >
            {getInitials(cage.cageName)}
            {cage.cageStatus === 'ACTIVE' && (
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-white"></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 text-xs truncate">
              {cage.cageName}
            </div>
            <div className="text-gray-500 text-xs truncate">
              {cage.cageCode}
            </div>
          </div>
        </div>
        <div className="space-y-1 mb-2">
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Box className="w-3 h-3" />
            <span>Type: {cage.cageNetType}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Box className="w-3 h-3" />
            <span>{formatDate(cage.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
              cage.cageStatus === 'ACTIVE'
                ? 'bg-green-100 text-green-800'
                : cage.cageStatus === 'UNDER_MAINTENANCE'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            • {cage.cageStatus}
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
              <th className="text-left py-2 px-2 text-gray-600 font-medium">
                #
              </th>
              <th
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setSortBy('cageName');
                  setSortOrder(
                    sortBy === 'cageName' && sortOrder === 'asc' ? 'desc' : 'asc'
                  );
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  <ChevronDown
                    className={`w-3 h-3 ${
                      sortBy === 'cageName'
                        ? 'text-primary-600'
                        : 'text-gray-400'
                    }`}
                  />
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">
                Code
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">
                Net Type
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden md:table-cell">
                Depth
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">
                Status
              </th>
              <th
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100 hidden lg:table-cell"
                onClick={() => {
                  setSortBy('createdAt');
                  setSortOrder(
                    sortBy === 'createdAt' && sortOrder === 'asc' ? 'desc' : 'asc'
                  );
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  <ChevronDown
                    className={`w-3 h-3 ${
                      sortBy === 'createdAt'
                        ? 'text-primary-600'
                        : 'text-gray-400'
                    }`}
                  />
                </div>
              </th>
              <th className="text-right py-2 px-2 text-gray-600 font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentCages.map((cage, index) => (
              <tr key={cage.id} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">
                  {startIndex + index + 1}
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(
                        cage.cageName
                      )} text-white text-xs font-medium relative`}
                    >
                      {getInitials(cage.cageName)}
                      {cage.cageStatus === 'ACTIVE' && (
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-white"></div>
                      )}
                    </div>
                    <span className="font-medium text-gray-900 text-xs">
                      {cage.cageName}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">
                  {cage.cageCode}
                </td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">
                  {cage.cageNetType}
                </td>
                <td className="py-2 px-2 text-gray-700 hidden md:table-cell">
                  {cage.cageDepth} m
                </td>
                <td className="py-2 px-2">
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                      cage.cageStatus === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : cage.cageStatus === 'UNDER_MAINTENANCE'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    • {cage.cageStatus}
                  </span>
                </td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">
                  {formatDate(cage.createdAt)}
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => handleViewCage(cage)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="View"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleEditCage(cage)}
                      disabled={operationLoading}
                      className="text-gray-400 hover:text-primary-600 p-1 disabled:opacity-50"
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteCage(cage)}
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
      {currentCages.map((cage) => (
        <CageCard key={cage.id} cage={cage} />
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
      {currentCages.map((cage) => (
        <div key={cage.id} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(
                  cage.cageName
                )} text-white text-sm font-medium relative`}
              >
                {getInitials(cage.cageName)}
                {cage.cageStatus === 'ACTIVE' && (
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">
                  {cage.cageName}
                </div>
                <div className="text-gray-500 text-xs truncate">
                  {cage.cageCode}
                </div>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
              <span className="truncate">Type: {cage.cageNetType}</span>
              <span>{formatDate(cage.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => handleViewCage(cage)}
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                title="View Cage"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEditCage(cage)}
                disabled={operationLoading}
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors disabled:opacity-50"
                title="Edit Cage"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteCage(cage)}
                disabled={operationLoading}
                className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Delete Cage"
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
          Showing {startIndex + 1}-{Math.min(endIndex, filteredCages.length)} of{' '}
          {filteredCages.length}
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
      <DeleteCageModal
        isOpen={isDeleteModalOpen}
        cage={selectedCage}
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
            {operationStatus.type === 'success' && (
              <CheckCircle className="w-4 h-4 text-green-600" />
            )}
            {operationStatus.type === 'error' && (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            {operationStatus.type === 'info' && (
              <AlertCircle className="w-4 h-4 text-primary-600" />
            )}
            <span className="font-medium">{operationStatus.message}</span>
            <button
              onClick={() => setOperationStatus(null)}
              className="hover:opacity-70"
            >
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
              <span className="text-gray-700 text-xs font-medium">
                Processing...
              </span>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white shadow-md">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Cage Management
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage your organization's cages
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  cageService.getAllCages().then((data) =>
                    setAllCages(data || [])
                  )
                }
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`}
                />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExportPDF}
                disabled={operationLoading || filteredCages.length === 0}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Export PDF"
              >
                <Download className="w-3 h-3" />
                <span>Export</span>
              </button>
              <button
                onClick={handleAddCage}
                disabled={operationLoading}
                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
                aria-label="Add new cage"
              >
                <Plus className="w-3 h-3" />
                <span>Add Cage</span>
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
                <Box className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Cages</p>
                <p className="text-lg font-semibold text-gray-900">
                  {totalCages}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Active Cages</p>
                <p className="text-lg font-semibold text-gray-900">
                  {activeCages}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Maintenance Cages</p>
                <p className="text-lg font-semibold text-gray-900">
                  {maintenanceCages}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Inactive Cages</p>
                <p className="text-lg font-semibold text-gray-900">
                  {inactiveCages}
                </p>
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
                  placeholder="Search cages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  aria-label="Search cages"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-1 px-2 py-1.5 text-xs border rounded transition-colors ${
                  showFilters
                    ? 'bg-primary-50 border-primary-200 text-primary-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
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
                  const [field, order] = e.target.value.split('-') as [
                    keyof Cage,
                    'asc' | 'desc'
                  ];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                aria-label="Sort cages"
              >
                <option value="cageName-asc">Name (A-Z)</option>
                <option value="cageName-desc">Name (Z-A)</option>
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
              </select>
              <div className="flex items-center border border-gray-200 rounded">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === 'table'
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Table View"
                >
                  <List className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="List View"
                >
                  <Box className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <select
                  value={netTypeFilter}
                  onChange={(e) => setNetTypeFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  aria-label="Filter by net type"
                >
                  <option value="all">All Net Types</option>
                  <option value="FINGERLING">Fingerling</option>
                  <option value="JUVENILE">Juvenile</option>
                  <option value="ADULT">Adult</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setNetTypeFilter('all');
                    setStatusFilter('all');
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
              <span className="text-xs">Loading cages...</span>
            </div>
          </div>
        ) : currentCages.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm || netTypeFilter !== 'all' || statusFilter !== 'all'
                ? 'No cages found matching your filters'
                : 'No cages found'}
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

export default CageManagement;
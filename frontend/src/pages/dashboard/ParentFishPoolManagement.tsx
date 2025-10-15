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
  Fish, // Add Fish icon
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import parentFishPoolService, { type CreateParentFishPoolInput, type UpdateParentFishPoolInput, type ParentFishPool } from '../../services/parentFishPoolService';
import DeleteParentFishPoolModal from '../../components/dashboard/parentFishPool/DeleteParentFishPoolModal';
import CreateUpdateParentFishPoolModal from '../../components/dashboard/parentFishPool/CreateUpdateParentFishPoolModal';
import AddFishModal from '../../components/dashboard/parentFishPool/AddFishModal'; // Import the new modal
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface OperationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

type ViewMode = 'table' | 'grid' | 'list';
type ModalMode = 'create' | 'update';

const ParentFishPoolManagement = ({ role }: { role: string }) => {
  const [pools, setPools] = useState<ParentFishPool[]>([]);
  const [allPools, setAllPools] = useState<ParentFishPool[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof ParentFishPool>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [rowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateUpdateModalOpen, setIsCreateUpdateModalOpen] = useState(false);
  const [isAddFishModalOpen, setIsAddFishModalOpen] = useState(false); // New state for AddFishModal
  const [modalMode, setModalMode] = useState<ModalMode>('create');
  const [selectedPool, setSelectedPool] = useState<ParentFishPool | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const pdfContentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPools = async () => {
      try {
        setLoading(true);
        const data = await parentFishPoolService.getAllParentFishPools();
        setAllPools(data || []);
        setError(null);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load parent fish pools';
        console.error('Error fetching parent fish pools:', err);
        setError(errorMessage);
        showOperationStatus('error', errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchPools();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allPools]);

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

  const showOperationStatus = (type: OperationStatus['type'], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allPools];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (pool) =>
          pool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pool.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let aValue = a[sortBy] ?? '';
      let bValue = b[sortBy] ?? '';
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        const dateA = new Date(aValue as string).getTime();
        const dateB = new Date(bValue as string).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const strA = aValue.toString().toLowerCase();
        const strB = bValue.toString().toLowerCase();
        return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      }
    });

    setPools(filtered);
    setCurrentPage(1);
  };

  const handleSavePool = async (data: CreateParentFishPoolInput | UpdateParentFishPoolInput) => {
    try {
      setOperationLoading(true);
      const validation = parentFishPoolService.validateParentFishPoolData(data as CreateParentFishPoolInput);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(' '));
      }
      if (modalMode === 'create') {
        const newPool = await parentFishPoolService.createParentFishPool(data as CreateParentFishPoolInput);
        if (!newPool) {
          throw new Error('No parent fish pool data returned from createParentFishPool');
        }
        setAllPools((prev) => [...prev, newPool]);
        showOperationStatus('success', 'Parent fish pool created successfully');
        setIsCreateUpdateModalOpen(false);
      } else {
        if (!selectedPool) {
          throw new Error('No parent fish pool selected for update');
        }
        const updatedPool = await parentFishPoolService.updateParentFishPool(selectedPool.id, data as UpdateParentFishPoolInput);
        setAllPools((prev) => prev.map((p) => (p.id === updatedPool.id ? updatedPool : p)));
        showOperationStatus('success', 'Parent fish pool updated successfully');
        setIsCreateUpdateModalOpen(false);
      }
    } catch (err: any) {
      console.error('Error in handleSavePool:', err);
      showOperationStatus('error', err.message || 'Failed to save parent fish pool');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleAddFishes = async (poolId: string, count: number) => {
    try {
      setOperationLoading(true);
      const updatedPool = await parentFishPoolService.addFishes(poolId, count);
      setAllPools((prev) => prev.map((p) => (p.id === updatedPool.id ? updatedPool : p)));
      showOperationStatus('success', `Added ${count} fish to the pool successfully`);
    } catch (err: any) {
      console.error('Error adding fish:', err);
      showOperationStatus('error', err.message || 'Failed to add fish to the pool');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setOperationLoading(true);
      const date = new Date().toLocaleDateString('en-CA').replace(/\//g, '');
      const filename = `parent_fish_pools_export_${date}.pdf`;

      const tableRows = pools.map(
        (pool, index) => `
                    <tr>
                        <td style="font-size:10px;">${index + 1}</td>
                        <td style="font-size:10px;">${pool.name}</td>
                        <td style="font-size:10px;">${pool.description || 'N/A'}</td>
                        <td style="font-size:10px;">${pool.numberOfFishes || 0}</td>
                    </tr>
                `
      ).join('');

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
                    <h1>Parent Fish Pool List</h1>
                    <p>Exported on: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' })}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Pool Name</th>
                                <th>Description</th>
                                <th>Number of Fish</th>
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

  const handleAddPool = () => {
    setModalMode('create');
    setSelectedPool(null);
    setIsCreateUpdateModalOpen(true);
  };

  const handleEditPool = (pool: ParentFishPool) => {
    if (!pool.id) return Swal.fire({ icon: 'error', title: 'Error', text: 'Invalid pool ID' });
    setModalMode('update');
    setSelectedPool(pool);
    setIsCreateUpdateModalOpen(true);
  };

  const handleViewPool = (pool: ParentFishPool) => {
    if (!pool.id) return Swal.fire({ icon: 'error', title: 'Error', text: 'Invalid pool ID' });
    navigate(`${pool.id}`);
  };

  const handleDeletePool = (pool: ParentFishPool) => {
    setSelectedPool(pool);
    setIsDeleteModalOpen(true);
  };

  const handleOpenAddFishModal = (pool: ParentFishPool) => {
    setSelectedPool(pool);
    setIsAddFishModalOpen(true);
  };

  const handleDelete = async (pool: ParentFishPool) => {
    try {
      setOperationLoading(true);
      await parentFishPoolService.deleteParentFishPool(pool.id);
      setAllPools((prev) => prev.filter((p) => p.id !== pool.id));
      showOperationStatus('success', `Parent fish pool "${pool.name}" deleted successfully`);
    } catch (err: any) {
      console.error('Error deleting parent fish pool:', err);
      showOperationStatus('error', err.message || 'Failed to delete parent fish pool');
    } finally {
      setOperationLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedPool(null);
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

  const filteredPools = pools;
  const totalPages = Math.ceil(filteredPools.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentPools = filteredPools.slice(startIndex, endIndex);

  // Summary statistics
  const totalPools = allPools.length;
  const totalFish = allPools.reduce((sum, pool) => sum + (pool.numberOfFishes || 0), 0);

  const ParentFishPoolCard = ({ pool }: { pool: ParentFishPool }) => {
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
                    handleViewPool(pool);
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </button>
                <button
                  onClick={() => {
                    handleEditPool(pool);
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    handleOpenAddFishModal(pool);
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                >
                  <Fish className="w-3 h-3 mr-1" />
                  Add Fish
                </button>
                <button
                  onClick={() => {
                    handleDeletePool(pool);
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
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(pool.name)} text-white text-xs font-medium`}>
            {getInitials(pool.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 text-xs truncate">{pool.name}</div>
            <div className="text-gray-500 text-xs truncate">{pool.description || 'No description'}</div>
          </div>
        </div>
        <div className="space-y-1 mb-2">
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(pool.createdAt)}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Fish className="w-3 h-3" />
            <span>{pool.numberOfFishes || 0} Fish</span>
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
                  <ChevronDown
                    className={`w-3 h-3 ${sortBy === 'name' ? 'text-primary-600' : 'text-gray-400'}`}
                  />
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">Description</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">Number of Fish</th>
              <th
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100 hidden lg:table-cell"
                onClick={() => {
                  setSortBy('createdAt');
                  setSortOrder(sortBy === 'createdAt' && sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  <ChevronDown
                    className={`w-3 h-3 ${sortBy === 'createdAt' ? 'text-primary-600' : 'text-gray-400'}`}
                  />
                </div>
              </th>
              <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentPools.map((pool, index) => (
              <tr key={pool.id} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(
                        pool.name
                      )} text-white text-xs font-medium`}
                    >
                      {getInitials(pool.name)}
                    </div>
                    <span className="font-medium text-gray-900 text-xs">{pool.name}</span>
                  </div>
                </td>
                <td className="py-2 px-2 text-gray-700">{pool.description || 'N/A'}</td>
                <td className="py-2 px-2 text-gray-700">{pool.numberOfFishes || 0}</td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{formatDate(pool.createdAt)}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => handleViewPool(pool)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="View"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleEditPool(pool)}
                      disabled={operationLoading}
                      className="text-gray-400 hover:text-primary-600 p-1 disabled:opacity-50"
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleOpenAddFishModal(pool)}
                      disabled={operationLoading}
                      className="text-gray-400 hover:text-blue-600 p-1 disabled:opacity-50"
                      title="Add Fish"
                    >
                      <Fish className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeletePool(pool)}
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
      {currentPools.map((pool) => (
        <ParentFishPoolCard key={pool.id} pool={pool} />
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
      {currentPools.map((pool) => (
        <div key={pool.id} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(
                  pool.name
                )} text-white text-sm font-medium`}
              >
                {getInitials(pool.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{pool.name}</div>
                <div className="text-gray-500 text-xs truncate">{pool.description || 'No description'}</div>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
              <span>{formatDate(pool.createdAt)}</span>
              <span>{pool.numberOfFishes || 0} Fish</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => handleViewPool(pool)}
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                title="View Pool"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEditPool(pool)}
                disabled={operationLoading}
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors disabled:opacity-50"
                title="Edit Pool"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleOpenAddFishModal(pool)}
                disabled={operationLoading}
                className="text-gray-400 hover:text-blue-600 p-1.5 rounded-full hover:bg-blue-50 transition-colors disabled:opacity-50"
                title="Add Fish"
              >
                <Fish className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeletePool(pool)}
                disabled={operationLoading}
                className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Delete Pool"
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
          Showing {startIndex + 1}-{Math.min(endIndex, filteredPools.length)} of {filteredPools.length}
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
      <DeleteParentFishPoolModal
        isOpen={isDeleteModalOpen}
        pool={selectedPool}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
      />
      <CreateUpdateParentFishPoolModal
        isOpen={isCreateUpdateModalOpen}
        pool={selectedPool}
        onClose={() => {
          setIsCreateUpdateModalOpen(false);
          setSelectedPool(null);
        }}
        onSave={handleSavePool}
        mode={modalMode}
      />
      <AddFishModal
        isOpen={isAddFishModalOpen}
        pool={selectedPool}
        onClose={() => {
          setIsAddFishModalOpen(false);
          setSelectedPool(null);
        }}
        onAddFishes={handleAddFishes}
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
              <h1 className="text-lg font-semibold text-gray-900">Parent Fish Pool Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage your parent fish pools</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => parentFishPoolService.getAllParentFishPools().then((data) => setAllPools(data || []))}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExportPDF}
                disabled={operationLoading || filteredPools.length === 0}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Export PDF"
              >
                <Download className="w-3 h-3" />
                <span>Export</span>
              </button>
              {role === 'employee' && (
                <button
                  onClick={handleAddPool}
                  disabled={operationLoading}
                  className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
                  aria-label="Add new parent fish pool"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Pool</span>
                </button>
              )}
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
                <p className="text-xs text-gray-600">Total Pools</p>
                <p className="text-lg font-semibold text-gray-900">{totalPools}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-full flex items-center justify-center">
                <Fish className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Fish</p>
                <p className="text-lg font-semibold text-gray-900">{totalFish}</p>
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
                  placeholder="Search parent fish pools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  aria-label="Search parent fish pools"
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
                  const [field, order] = e.target.value.split('-') as [keyof ParentFishPool, 'asc' | 'desc'];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                aria-label="Sort parent fish pools"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
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
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-xs">{error}</div>
        )}
        {loading ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="inline-flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Loading parent fish pools...</span>
            </div>
          </div>
        ) : currentPools.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm ? 'No parent fish pools found matching your search' : 'No parent fish pools found'}
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

export default ParentFishPoolManagement;
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
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import storeService, { type Store, type StoreData } from '../../services/storeService';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import DeleteStoreModal from '../../components/dashboard/store/DeleteStoreModal';

interface OperationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

type ViewMode = 'table' | 'grid' | 'list';

const StoreManagement = ({ role }: { role: string }) => {
  const [stores, setStores] = useState<Store[]>([]);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof Store>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [rowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  const pdfContentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        const data = await storeService.getAllStores({ limit: 1000 });
        setAllStores(data.stores || []);
        setError(null);
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load stores';
        console.error('Error fetching stores:', err);
        setError(errorMessage);
        showOperationStatus('error', errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allStores]);

  const showOperationStatus = (type: OperationStatus['type'], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allStores];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (store) =>
          store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          store.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let aValue = a[sortBy] ?? '';
      let bValue = b[sortBy] ?? '';
      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        const dateA = new Date(aValue as string).getTime();
        const dateB = new Date(bValue as string).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const strA = aValue.toString().toLowerCase();
        const strB = bValue.toString().toLowerCase();
        return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      }
    });

    setStores(filtered);
    setCurrentPage(1);
  };

  const handleExportPDF = async () => {
    try {
      setOperationLoading(true);
      const date = new Date().toLocaleDateString('en-CA').replace(/\//g, '');
      const filename = `stores_export_${date}.pdf`;

      const tableRows = filteredStores.map((store, index) => {
        return `
          <tr>
            <td style="font-size:10px;">${index + 1}</td>
            <td style="font-size:10px;">${store.code}</td>
            <td style="font-size:10px;">${store.name}</td>
            <td style="font-size:10px;">${store.location}</td>
            <td style="font-size:10px;">${store.manager?.first_name || 'N/A'} ${store.manager?.last_name || ''}</td>
            <td style="font-size:10px;">${store.contact_email || 'N/A'}</td>
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
          <h1>Store List</h1>
          <p>Exported on: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' })}</p>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Code</th>
                <th>Name</th>
                <th>Location</th>
                <th>Manager</th>
                <th>Contact Email</th>
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

  const handleAddStore = () => {
    navigate('create');
  };

  const handleEditStore = (store: Store) => {
    if (!store.id) return Swal.fire({});
    navigate(`update/${store.id}`);
  };

  const handleViewStore = (store: Store) => {
    if (!store.id) return Swal.fire({});
    navigate(`${store.id}`);
  };

  const handleDeleteStore = (store: Store) => {
    setSelectedStore(store);
    setIsDeleteModalOpen(true);
  };

  const handleSaveStore = async (data: StoreData) => {
    try {
      setOperationLoading(true);
      if (isAddModalOpen) {
        const validation = storeService.validateStoreData(data);
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }
        const newStore = await storeService.createStore(data);
        setAllStores((prev) => [...prev, newStore]);
        showOperationStatus('success', 'Store created successfully');
        setIsAddModalOpen(false);
      } else if (selectedStore) {
        const validation = storeService.validateStoreData(data);
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }
        const updatedStore = await storeService.updateStore(selectedStore.id, data);
        setAllStores((prev) =>
          prev.map((s) => (s.id === updatedStore.id ? updatedStore : s))
        );
        showOperationStatus('success', 'Store updated successfully');
        setIsEditModalOpen(false);
      }
    } catch (err: any) {
      console.error('Error in handleSaveStore:', err);
      showOperationStatus('error', err.message || 'Failed to save store');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (store: Store) => {
    try {
      setOperationLoading(true);
      await storeService.deleteStore(store.id);
      setAllStores((prev) => prev.filter((s) => s.id !== store.id));
      showOperationStatus('success', `Store "${store.name}" deleted successfully`);
    } catch (err: any) {
      console.error('Error deleting store:', err);
      showOperationStatus('error', err.message || 'Failed to delete store');
    } finally {
      setOperationLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedStore(null);
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

  const filteredStores = stores;
  const totalPages = Math.ceil(filteredStores.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentStores = filteredStores.slice(startIndex, endIndex);

  const StoreCard = ({ store }: { store: Store }) => {
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
                    handleViewStore(store);
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </button>
                <button
                  onClick={() => {
                    handleEditStore(store);
                    setIsDropdownOpen(false);
                  }}
                  className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    handleDeleteStore(store);
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
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(store.name)} text-white text-xs font-medium`}>
            {getInitials(store.name)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 text-xs truncate">{store.name}</div>
            <div className="text-gray-500 text-xs truncate">{store.code}</div>
          </div>
        </div>
        <div className="space-y-1 mb-2">
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <Package className="w-3 h-3" />
            <span>Location: {store.location}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <span>Manager: {store.manager?.first_name || 'N/A'} {store.manager?.last_name || ''}</span>
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
                  setSortBy('name');
                  setSortOrder(sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === 'name' ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Location</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden md:table-cell">Manager</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Contact Email</th>
              <th
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100 hidden lg:table-cell"
                onClick={() => {
                  setSortBy('created_at');
                  setSortOrder(sortBy === 'created_at' && sortOrder === 'asc' ? 'desc' : 'asc');
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === 'created_at' ? 'text-primary-600' : 'text-gray-400'}`} />
                </div>
              </th>
              <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentStores.map((store, index) => (
              <tr key={store.id} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2 text-gray-700">{store.code}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(store.name)} text-white text-xs font-medium`}>
                      {getInitials(store.name)}
                    </div>
                    <span className="font-medium text-gray-900 text-xs">{store.name}</span>
                  </div>
                </td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{store.location}</td>
                <td className="py-2 px-2 text-gray-700 hidden md:table-cell">
                  {store.manager?.first_name || 'N/A'} {store.manager?.last_name || ''}
                </td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{store.contact_email || 'N/A'}</td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{formatDate(store.created_at)}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => handleViewStore(store)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="View"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleEditStore(store)}
                      disabled={operationLoading}
                      className="text-gray-400 hover:text-primary-600 p-1 disabled:opacity-50"
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteStore(store)}
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
      {currentStores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
      {currentStores.map((store) => (
        <div key={store.id} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(store.name)} text-white text-sm font-medium`}>
                {getInitials(store.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{store.name}</div>
                <div className="text-gray-500 text-xs truncate">{store.code}</div>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
              <span className="truncate">Location: {store.location}</span>
              <span>Manager: {store.manager?.first_name || 'N/A'} {store.manager?.last_name || ''}</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => handleViewStore(store)}
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                title="View Store"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEditStore(store)}
                disabled={operationLoading}
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors disabled:opacity-50"
                title="Edit Store"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteStore(store)}
                disabled={operationLoading}
                className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Delete Store"
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
          Showing {startIndex + 1}-{Math.min(endIndex, filteredStores.length)} of {filteredStores.length}
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
      <DeleteStoreModal
        isOpen={isDeleteModalOpen}
        store={selectedStore}
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
              <h1 className="text-lg font-semibold text-gray-900">Store Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage your organization's stores</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => storeService.getAllStores({ limit: 1000 }).then((data) => setAllStores(data.stores || []))}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleExportPDF}
                disabled={operationLoading || filteredStores.length === 0}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Export PDF"
              >
                <Download className="w-3 h-3" />
                <span>Export</span>
              </button>
              <button
                onClick={handleAddStore}
                disabled={operationLoading}
                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
                aria-label="Add new store"
              >
                <Plus className="w-3 h-3" />
                <span>Add Store</span>
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
                <p className="text-xs text-gray-600">Total Stores</p>
                <p className="text-lg font-semibold text-gray-900">{allStores.length}</p>
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
                  placeholder="Search stores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  aria-label="Search stores"
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
                  const [field, order] = e.target.value.split('-') as [keyof Store, 'asc' | 'desc'];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                aria-label="Sort stores"
              >
                <option value="code-asc">Code (A-Z)</option>
                <option value="code-desc">Code (Z-A)</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
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
                    viewMode === 'list' ? 'Background-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'
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
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-xs">
            {error}
          </div>
        )}
        {loading ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="inline-flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Loading stores...</span>
            </div>
          </div>
        ) : currentStores.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm ? 'No stores found matching your filters' : 'No stores found'}
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
      {isViewModalOpen && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-4 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Store Details</h3>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close view modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y- thre">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Code</label>
                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{selectedStore.code}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{selectedStore.name}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{selectedStore.location}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{selectedStore.description || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Manager</label>
                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">
                  {selectedStore.manager?.first_name || 'N/A'} {selectedStore.manager?.last_name || ''}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Phone</label>
                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{selectedStore.contact_phone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contact Email</label>
                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{selectedStore.contact_email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Created Date</label>
                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{formatDate(selectedStore.created_at)}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Last Updated</label>
                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{formatDate(selectedStore.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;
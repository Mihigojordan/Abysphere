/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Store,
  MapPin,
  User,
  Phone,
  Mail,
  ArrowLeft,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Edit,
  Calendar,
} from 'lucide-react';
import DOMPurify from 'dompurify';
import Quill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import storeService, { type Store as StoreType } from '../../../services/storeService';
import employeeService, { type Employee } from '../../../services/employeeService';

interface OperationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

const StoreViewPage: React.FC<{ role: string }> = ({ role }) => {
  const { id: storeId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [stores, setStores] = useState<StoreType[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [manager, setManager] = useState<Employee | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sidebarCurrentPage, setSidebarCurrentPage] = useState<number>(1);
  const [sidebarItemsPerPage] = useState<number>(6);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [actionConfirm, setActionConfirm] = useState<{ store: StoreType; action: 'delete' } | null>(null);

  const url = role === 'admin' ? '/admin/dashboard/store-management/' : '/employee/dashboard/store-management/';

  // Fetch stores and manager data
  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoading(true);
        setError(null);

        const storesData = await storeService.getAllStores();
       
        
        if (storesData.stores && storesData.stores.length > 0) {
          // Sort by created_at descending (most recent first)
          const sortedStores = storesData.stores.sort(
            (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          );
          setStores(sortedStores);
        } else {
          setStores([]);
          setError('No stores found');
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load stores';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadStores();
  }, []);

  // Fetch manager details for the selected store
  useEffect(() => {
    const loadManager = async () => {
      if (selectedStore?.managerId) {
        try {
          const managerData = await employeeService.getEmployeeById(selectedStore.managerId);
          setManager(managerData);
        } catch (err: unknown) {
          console.error('Failed to load manager:', err);
          setManager(null);
        }
      } else {
        setManager(null);
      }
    };

    loadManager();
  }, [selectedStore]);

  // Reset page to 1 when search term changes
  useEffect(() => {
    setSidebarCurrentPage(1);
  }, [searchTerm]);



  const showOperationStatus = (type: OperationStatus['type'], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleStoreDelete = async (store: StoreType) => {
    try {
      setOperationLoading(true);
      setActionConfirm(null);

      await storeService.deleteStore(store.id);

      setStores((prev) => prev.filter((s) => s.id !== store.id));
      if (selectedStore?.id === store.id) {
        setSelectedStore(null);
        navigate(url);
      }

      showOperationStatus('success', `Store ${store.name} has been deleted successfully!`);
    } catch (err: any) {
      showOperationStatus('error', err.message || 'Failed to delete store');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleStoreSelect = (store: StoreType) => {
    setSelectedStore(store);
    setShowFullDescription(false);
    navigate(`${url}${store.id}`);
    const indexInFiltered = filteredStores.findIndex((s) => s.id === store.id);
    if (indexInFiltered !== -1) {
      const targetPage = Math.floor(indexInFiltered / sidebarItemsPerPage) + 1;
      setSidebarCurrentPage(targetPage);
    }
  };

  // Truncate text to a specified length
  const stripHtml = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  };

  const truncateText = (text: string, maxLength: number): string => {
    const plainText = stripHtml(text);
    if (plainText.length <= maxLength) return text;
    return plainText.substring(0, maxLength) + '...';
  };

  // Filtered stores for search
  const filteredStores = useMemo(() => {
    if (!searchTerm.trim()) return stores;

    return stores.filter((store) =>
      [
        store.name?.toLowerCase(),
        store.code?.toLowerCase(),
        store.location?.toLowerCase(),
      ].some((field) => field && field.includes(searchTerm.toLowerCase()))
    );
  }, [stores, searchTerm]);

    // Select store based on URL parameter
  useEffect(() => {
    if (stores.length > 0) {
      if (storeId) {
        const foundStore = stores.find((store) => store.id === storeId);
        console.warn(foundStore);
        
        if (foundStore) {
          setSelectedStore(foundStore);
          setShowFullDescription(false);
          // Calculate the page for the selected store
          const indexInFiltered = filteredStores.findIndex((store) => store.id === storeId);
          if (indexInFiltered !== -1) {
            const targetPage = Math.floor(indexInFiltered / sidebarItemsPerPage) + 1;
            setSidebarCurrentPage(targetPage);
          }
        } else {
          setError('Store not found');
        }
      } else {
        // Select the first store if no storeId is provided
        setSelectedStore(stores[0]);
        setShowFullDescription(false);
        navigate(`${url}${stores[0].id}`);
        setSidebarCurrentPage(1);
      }
    } else if (!loading && stores.length === 0) {
      setError('No stores found');
    }
  }, [stores, storeId, navigate, filteredStores, sidebarItemsPerPage, url]);

  // Sidebar pagination calculations
  const sidebarTotalPages = Math.ceil(filteredStores.length / sidebarItemsPerPage);
  const sidebarStartIndex = (sidebarCurrentPage - 1) * sidebarItemsPerPage;
  const sidebarEndIndex = sidebarStartIndex + sidebarItemsPerPage;
  const currentSidebarStores = filteredStores.slice(sidebarStartIndex, sidebarEndIndex);

  // Handle sidebar page change
  const handleSidebarPageChange = (page: number) => {
    setSidebarCurrentPage(page);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-700 font-medium">Loading stores...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Stores</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(url)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Back to Stores
          </button>
        </div>
      </div>
    );
  }

  if (!selectedStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Stores Found</h2>
          <p className="text-gray-600 mb-4">There are no stores available.</p>
          <button
            onClick={() => navigate(url)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Back to Stores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => navigate(url)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Stores
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mt-6">
        {/* Stores List Sidebar */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <h2 className="text-lg font-semibold text-gray-900">Stores</h2>
                <div className="relative flex-1 sm:flex-none">
                  <input
                    type="text"
                    placeholder="Search stores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{filteredStores.length} total stores</p>
            </div>
            <div className="divide-y max-h-[calc(100vh-300px)] overflow-y-auto">
              {currentSidebarStores.map((store) => (
                <div
                  key={store.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedStore.id === store.id ? 'bg-primary-50 border-r-2 border-primary-500' : ''
                  }`}
                  onClick={() => handleStoreSelect(store)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{store.name}</h3>
                      <p className="text-xs text-gray-600 truncate mt-1">{store.code}</p>
                      <p className="text-xs text-gray-500 mt-1">{store.location || 'No location'}</p>
                    </div>
                    <div className="flex flex-col items-end ml-2">
                      <ChevronRight className="w-4 h-4 text-gray-400 mt-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Sidebar Pagination */}
            {sidebarTotalPages > 1 && (
              <div className="p-4 border-t flex justify-center space-x-2">
                <button
                  onClick={() => handleSidebarPageChange(sidebarCurrentPage - 1)}
                  disabled={sidebarCurrentPage === 1}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="py-2 px-4 text-sm text-gray-700">
                  Page {sidebarCurrentPage} of {sidebarTotalPages}
                </span>
                <button
                  onClick={() => handleSidebarPageChange(sidebarCurrentPage + 1)}
                  disabled={sidebarCurrentPage === sidebarTotalPages}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Store Detail View */}
        <div className="col-span-9 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedStore.name}</h1>
                  <p className="text-gray-600">{selectedStore.code}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-sm text-gray-500">Added {formatDate(selectedStore.created_at)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate(`${url}update/${selectedStore.id}`)}
                  className="flex items-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setActionConfirm({ store: selectedStore, action: 'delete' })}
                  disabled={operationLoading}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Store className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">Code: {selectedStore.code}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">{selectedStore.location}</span>
                </div>
              </div>
            </div>

            {/* Manager & Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Manager & Contact</h3>
              <div className="space-y-3">
                {manager ? (
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">
                      Manager: {manager.first_name} {manager.last_name} ({manager.position})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">No manager assigned</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">{selectedStore.contact_phone}</span>
                </div>
                {selectedStore.contact_email && (
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{selectedStore.contact_email}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">Added {formatDate(selectedStore.created_at)}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">Updated {formatDate(selectedStore.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {selectedStore.description && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
              <div className="bg-white p-4 rounded border text-sm text-gray-700 leading-relaxed">
                <Quill
                  value={showFullDescription ? selectedStore.description : truncateText(selectedStore.description, 100)}
                  readOnly={true}
                  theme="snow"
                  modules={{ toolbar: false }}
                  className="border-none p-0 bg-transparent"
                />
                {stripHtml(selectedStore.description).length > 100 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-2 text-sm text-primary-600 hover:text-primary-800 underline"
                  >
                    {showFullDescription ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Operation Status Toast */}
          {operationStatus && (
            <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out">
              <div
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg border ${
                  operationStatus.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : operationStatus.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-primary-50 border-primary-200 text-primary-800'
                }`}
              >
                {operationStatus.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                {operationStatus.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                {operationStatus.type === 'info' && <AlertCircle className="w-5 h-5 text-primary-600" />}
                <span className="font-medium">{operationStatus.message}</span>
                <button onClick={() => setOperationStatus(null)} className="ml-2 hover:opacity-70">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Operation Loading Overlay */}
          {operationLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
              <div className="bg-white rounded-lg p-6 shadow-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-700 font-medium">Processing...</span>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {actionConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100">
                    <Trash2 className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Delete Store</h3>
                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-gray-700">
                    Are you sure you want to delete{' '}
                    <span className="font-semibold">{actionConfirm.store.name}</span>? This action will
                    permanently remove the store from the system.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setActionConfirm(null)}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleStoreDelete(actionConfirm.store)}
                    disabled={operationLoading}
                    className="w-full sm:w-auto px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreViewPage;
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Building2 as SupplierIcon,
  Wifi,
  WifiOff,
  RefreshCw,
  RotateCcw,
  Calendar,
  X,
  AlertTriangle,
  List,
  Grid3X3,
  Layout,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import supplierService from '../../services/supplierService';
import { db } from '../../db/database';
import { useSupplierOfflineSync } from '../../hooks/useSupplierOfflineSync';
import { useNetworkStatusContext } from '../../context/useNetworkContext';
import useEmployeeAuth from '../../context/EmployeeAuthContext';
import useAdminAuth from '../../context/AdminAuthContext';

type ViewMode = 'table' | 'grid' | 'list';

interface SupplierWithSync {
  id?: string;
  localId?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  adminId: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  lastModified?: Date | string;
  synced: boolean;
}

const SupplierDashboard: React.FC<{ role: 'admin' | 'employee' }> = ({ role }) => {
  const [suppliers, setSuppliers] = useState<SupplierWithSync[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<SupplierWithSync[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<SupplierWithSync | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [formError, setFormError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const { isOnline } = useNetworkStatusContext();
  const { triggerSync, syncError } = useSupplierOfflineSync();
  const { user: employeeData } = useEmployeeAuth();
  const { user: adminData } = useAdminAuth();

  /* --------------------------------------------------------------------- */
  /* Summary Stats (Memoized) */
  /* --------------------------------------------------------------------- */
  const stats = useMemo(() => {
    const active = suppliers.filter(s => s.synced).length;
    const pending = suppliers.filter(s => !s.synced).length;
    const total = suppliers.length;
    return { active, pending, total };
  }, [suppliers]);

  /* --------------------------------------------------------------------- */
  /* Load & Sync */
  /* --------------------------------------------------------------------- */
  const loadSuppliers = useCallback(async (showRefreshLoader = false) => {
    if (showRefreshLoader) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      if (isOnline) await triggerSync();

      const [allSuppliers, offlineAdds, offlineUpdates, offlineDeletes] = await Promise.all([
        db.suppliers_all.toArray(),
        db.suppliers_offline_add.toArray(),
        db.suppliers_offline_update.toArray(),
        db.suppliers_offline_delete.toArray(),
      ]);

      const deleteIds = new Set(offlineDeletes.map(d => d.id));
      const updateMap = new Map(offlineUpdates.map(u => [u.id, u]));

      const combinedSuppliers = allSuppliers
        .filter(s => !deleteIds.has(s.id))
        .map(s => ({
          ...s,
          ...updateMap.get(s.id),
          synced: true,
        }))
        .concat(offlineAdds.map(a => ({ ...a, synced: false })))
        .sort((a, b) => Number(a.synced) - Number(b.synced));

      setSuppliers(combinedSuppliers);
      setFilteredSuppliers(combinedSuppliers);

      if (showRefreshLoader) {
        showNotification('Suppliers refreshed successfully!');
      }

      if (!isOnline && combinedSuppliers.length === 0) {
        showNotification('No offline data available', 'error');
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      showNotification('Failed to load suppliers', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isOnline, triggerSync]);

  useEffect(() => {
    loadSuppliers();
    if (isOnline) handleManualSync();
  }, [isOnline, loadSuppliers]);

  useEffect(() => {
    if (syncError) {
      showNotification(`Sync error: ${syncError}`, 'error');
    }
  }, [syncError]);

  /* --------------------------------------------------------------------- */
  /* Filter */
  /* --------------------------------------------------------------------- */
  useEffect(() => {
    const filtered = suppliers.filter(
      (s) =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone?.includes(searchTerm) ||
        s.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSuppliers(filtered);
    setCurrentPage(1);
  }, [searchTerm, suppliers]);

  /* --------------------------------------------------------------------- */
  /* Pagination */
  /* --------------------------------------------------------------------- */
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredSuppliers.slice(startIndex, endIndex);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  /* --------------------------------------------------------------------- */
  /* Notifications */
  /* --------------------------------------------------------------------- */
  const showNotification = (message: string, type: string = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  /* --------------------------------------------------------------------- */
  /* CRUD: Add */
  /* --------------------------------------------------------------------- */
  const handleSupplierSubmit = async (supplierData: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  }) => {
    setIsLoading(true);
    setFormError('');
    try {
      const validation = supplierService.validateSupplierData(supplierData);
      if (!validation.isValid) throw new Error(validation.errors.join(', '));

      const userId = role === 'admin' ? adminData.id : employeeData.id;
      const now = new Date();
      const newSupplier = {
        ...supplierData,
        adminId: userId,
        lastModified: now,
        createdAt: now,
        updatedAt: now,
      };

      const localId = await db.suppliers_offline_add.add(newSupplier);

      if (isOnline) {
        try {
          const response = await supplierService.createSupplier({
            ...supplierData,
            adminId: userId,
          });
          const serverId = response.id || response.supplier?.id;
          await db.suppliers_all.put({
            id: serverId,
            ...supplierData,
            adminId: userId,
            createdAt: now,
            updatedAt: response.updatedAt || now,
          });
          await db.suppliers_offline_add.delete(localId);
          showNotification('Supplier added successfully!');
        } catch {
          showNotification('Supplier saved offline (will sync when online)', 'warning');
        }
      } else {
        showNotification('Supplier saved offline (will sync when online)', 'warning');
      }

      await loadSuppliers();
      setIsAddModalOpen(false);
      setFormData({ name: '', email: '', phone: '', address: '' });
    } catch (error: any) {
      setFormError(error.message);
      showNotification(`Failed to add supplier: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------------------------------------------------- */
  /* CRUD: Update */
  /* --------------------------------------------------------------------- */
  const handleUpdateSupplier = async (supplierData: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  }) => {
    setIsLoading(true);
    setFormError('');
    try {
      const validation = supplierService.validateSupplierData(supplierData);
      if (!validation.isValid) throw new Error(validation.errors.join(', '));

      const userId = role === 'admin' ? adminData.id : employeeData.id;
      const now = new Date();
      const updatedData = {
        id: selectedSupplier?.id,
        name: supplierData.name,
        email: supplierData.email,
        phone: supplierData.phone,
        address: supplierData.address,
        adminId: userId,
        lastModified: now,
        updatedAt: now,
      };

      if (isOnline && selectedSupplier?.id) {
        try {
          const response = await supplierService.updateSupplier(
            selectedSupplier.id,
            { ...supplierData, adminId: userId }
          );
          await db.suppliers_all.put({
            id: selectedSupplier.id,
            ...supplierData,
            adminId: userId,
            updatedAt: response.updatedAt || now,
          });
          await db.suppliers_offline_update.delete(selectedSupplier.id);
          showNotification('Supplier updated successfully!');
        } catch {
          await db.suppliers_offline_update.put(updatedData);
          showNotification('Supplier updated offline (will sync when online)', 'warning');
        }
      } else {
        await db.suppliers_offline_update.put(updatedData);
        showNotification('Supplier updated offline (will sync when online)', 'warning');
      }

      await loadSuppliers();
      setIsEditModalOpen(false);
      setSelectedSupplier(null);
    } catch (error: any) {
      setFormError(error.message);
      showNotification(`Failed to update supplier: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------------------------------------------------- */
  /* CRUD: Delete */
  /* --------------------------------------------------------------------- */
  const handleConfirmDelete = async () => {
    if (!selectedSupplier) return;
    setIsLoading(true);
    try {
      const userId = role === 'admin' ? adminData.id : employeeData.id;

      if (isOnline && selectedSupplier.id) {
        await supplierService.deleteSupplier(selectedSupplier.id);
        await db.suppliers_all.delete(selectedSupplier.id);
        showNotification('Supplier deleted successfully!');
      } else if (selectedSupplier.id) {
        await db.suppliers_offline_delete.add({
          id: selectedSupplier.id,
          deletedAt: new Date(),
          adminId: userId,
        });
        showNotification('Supplier deletion queued (will sync when online)', 'warning');
      } else {
        await db.suppliers_offline_add.delete(selectedSupplier.localId!);
        showNotification('Supplier deleted!');
      }

      await loadSuppliers();
      setIsDeleteModalOpen(false);
      setSelectedSupplier(null);
    } catch (error: any) {
      showNotification(`Failed to delete supplier: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------------------------------------------------- */
  /* Sync */
  /* --------------------------------------------------------------------- */
  const handleManualSync = async () => {
    if (!isOnline) {
      showNotification('No internet connection', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await triggerSync();
      await loadSuppliers();
      showNotification('Sync completed successfully!');
    } catch {
      showNotification('Sync failed – will retry automatically.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------------------------------------------------- */
  /* Helpers */
  /* --------------------------------------------------------------------- */
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const closeAllModals = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedSupplier(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
    setFormError('');
  };

  /* --------------------------------------------------------------------- */
  /* Render Views */
  /* --------------------------------------------------------------------- */
  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Supplier</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Contact</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Address</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Created</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {currentItems.map((sup, i) => (
            <tr key={sup.localId || sup.id} className="hover:bg-gray-50">
              <td className="py-3 px-4">
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  {startIndex + i + 1}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {sup.name?.[0] || 'S'}
                  </div>
                  <div className="font-medium text-gray-900">{sup.name}</div>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {sup.email ? (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    <span className="truncate max-w-32">{sup.email}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
             
              </td>
              <td className="py-3 px-4 text-sm text-gray-600 line-clamp-2">
                {sup.address || 'No address'}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    sup.synced
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      sup.synced ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                  />
                  {sup.synced ? 'Active' : 'Syncing...'}
                </span>
              </td>
              <td className="py-3 px-4 text-xs text-gray-600">
                {formatDate(sup.createdAt || sup.lastModified)}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedSupplier(sup);
                      setFormData({
                        name: sup.name,
                        email: sup.email || '',
                        phone: sup.phone || '',
                        address: sup.address || '',
                      });
                      setIsEditModalOpen(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSupplier(sup);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {currentItems.map((sup) => (
        <motion.div
          key={sup.localId || sup.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow border border-gray-100 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              <SupplierIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm truncate">{sup.name}</div>
              <div className="text-gray-500 text-xs truncate">
                {sup.email || sup.phone || 'No contact'}
              </div>
            </div>
          </div>
          <div className="text-xs text-gray-600 mb-2 line-clamp-2">
            {sup.address || 'No address'}
          </div>
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                sup.synced
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  sup.synced ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
              {sup.synced ? 'Active' : 'Syncing'}
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  setSelectedSupplier(sup);
                  setFormData({
                    name: sup.name,
                    email: sup.email || '',
                    phone: sup.phone || '',
                    address: sup.address || '',
                  });
                  setIsEditModalOpen(true);
                }}
                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedSupplier(sup);
                  setIsDeleteModalOpen(true);
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-lg shadow border border-gray-100 divide-y divide-gray-100">
      {currentItems.map((sup) => (
        <motion.div
          key={sup.localId || sup.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-4 hover:bg-gray-50 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
              <SupplierIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm truncate">{sup.name}</div>
              <div className="text-gray-500 text-xs truncate">
                {sup.email || sup.phone || 'No contact'}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                sup.synced
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  sup.synced ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
              {sup.synced ? 'Active' : 'Syncing'}
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  setSelectedSupplier(sup);
                  setFormData({
                    name: sup.name,
                    email: sup.email || '',
                    phone: sup.phone || '',
                    address: sup.address || '',
                  });
                  setIsEditModalOpen(true);
                }}
                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedSupplier(sup);
                  setIsDeleteModalOpen(true);
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  /* --------------------------------------------------------------------- */
  /* Render */
  /* --------------------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50"
          >
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white ${
                notification.type === 'success'
                  ? 'bg-green-500'
                  : notification.type === 'warning'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
            >
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <span>{notification.message}</span>
              <button onClick={() => setNotification(null)} className="ml-2">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 bg-white shadow-md z-10">
        <div className="mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <SupplierIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Supplier Management</h1>
                <p className="text-sm text-gray-500">Works offline • Auto-sync enabled</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                  isOnline ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}
                title={isOnline ? 'Online' : 'Offline'}
              >
                {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
              </div>

              {isOnline && (
                <button
                  onClick={handleManualSync}
                  disabled={isLoading}
                  className="flex items-center justify-center w-10 h-10 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              )}

              {isOnline && (
                <button
                  onClick={() => loadSuppliers(true)}
                  disabled={isRefreshing}
                  className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
                >
                  <RotateCcw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              )}

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium"
              >
                <Plus className="w-4 h-4" />
                Add Supplier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto px-4 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Active Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow border border-gray-100 p-5 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </motion.div>

          {/* Pending Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow border border-gray-100 p-5 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Pending Sync</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
          </motion.div>

          {/* Total Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow border border-gray-100 p-5 flex items-center gap-4"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <SupplierIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </motion.div>
        </div>

        {/* Search + View Mode */}
        <div className="bg-white rounded-lg shadow border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded ${viewMode === 'table' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'}`}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600 hover:bg-gray-100'}`}
                title="List View"
              >
                <Layout className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loading / Empty */}
        {isLoading && !isRefreshing ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
            <p>Loading suppliers...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <SupplierIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold">
              {searchTerm ? 'No suppliers found' : 'No suppliers available'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm ? 'Try adjusting your search.' : 'Add your first supplier!'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="w-5 h-5" />
                Add Supplier
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Views */}
            {viewMode === 'table' && renderTableView()}
            {viewMode === 'grid' && renderGridView()}
            {viewMode === 'list' && renderListView()}

            {/* Pagination */}
            <div className="flex items-center justify-between bg-white px-4 py-3 border-t rounded-b-lg shadow">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredSuppliers.length)} of {filteredSuppliers.length}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border rounded disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {getPageNumbers().map(p => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1.5 text-sm rounded ${
                      currentPage === p ? 'bg-primary-600 text-white' : 'border'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm border rounded disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Add New Supplier</h3>
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm mb-4">
                  {formError}
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSupplierSubmit(formData);
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  placeholder="Supplier name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded text-sm"
                  required
                />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded text-sm"
                />
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded text-sm"
                />
                <textarea
                  placeholder="Address (optional)"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border rounded text-sm"
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeAllModals}
                    className="px-4 py-2 border rounded text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary-600 text-white rounded text-sm disabled:opacity-50"
                  >
                    {isLoading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedSupplier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Edit Supplier</h3>
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm mb-4">
                  {formError}
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateSupplier(formData);
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded text-sm"
                  required
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded text-sm"
                />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded text-sm"
                />
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border rounded text-sm"
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeAllModals}
                    className="px-4 py-2 border rounded text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-primary-600 text-white rounded text-sm disabled:opacity-50"
                  >
                    {isLoading ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && selectedSupplier && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Delete Supplier</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Are you sure you want to delete <strong>{selectedSupplier.name}</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={closeAllModals}
                  className="px-4 py-2 border rounded text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded text-sm disabled:opacity-50"
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupplierDashboard;
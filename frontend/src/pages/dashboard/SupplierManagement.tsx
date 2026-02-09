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
  WifiOff,
  Wifi,
  RefreshCw,
  RotateCcw,
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

      const offlineAddsWithType = offlineAdds.map(a => ({ ...a, id: '', synced: false }));

      const combinedSuppliers = (allSuppliers as any[])
        .filter(s => !deleteIds.has(s.id))
        .map(s => ({
          ...s,
          ...updateMap.get(s.id),
          synced: true,
        }))
        .concat(offlineAddsWithType)
        .sort((a, b) => (a.synced === b.synced ? 0 : a.synced ? 1 : -1));

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

      const userId = role === 'admin' ? adminData?.id || '' : employeeData?.id || '';
      const now = new Date();
      const newSupplier = {
        ...supplierData,
        adminId: userId,
        lastModified: now.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      const localId = await db.suppliers_offline_add.add(newSupplier);

      if (isOnline) {
        try {
          const response: any = await supplierService.createSupplier({
            ...supplierData,
            adminId: userId,
          });
          const serverId = response.id || response.supplier?.id || response.supplierId;
          await db.suppliers_all.put({
            id: serverId,
            ...supplierData,
            adminId: userId,
            createdAt: now.toISOString(),
            updatedAt: response.updatedAt || now.toISOString(),
          });
          await db.suppliers_offline_add.delete(localId as number);
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

      const userId = role === 'admin' ? adminData?.id || '' : employeeData?.id || '';
      const now = new Date();
      const updatedData = {
        id: selectedSupplier?.id || '',
        name: supplierData.name,
        email: supplierData.email,
        phone: supplierData.phone,
        address: supplierData.address,
        adminId: userId,
        lastModified: now.toISOString(),
        updatedAt: now.toISOString(),
      };

      if (isOnline && selectedSupplier?.id) {
        try {
          const response: any = await supplierService.updateSupplier(
            selectedSupplier.id,
            { ...supplierData, adminId: userId }
          );
          await db.suppliers_all.put({
            id: selectedSupplier.id,
            ...supplierData,
            adminId: userId,
            updatedAt: response.updatedAt || now.toISOString(),
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
      const userId = role === 'admin' ? adminData?.id || '' : employeeData?.id || '';

      if (isOnline && selectedSupplier.id) {
        await supplierService.deleteSupplier(selectedSupplier.id);
        await db.suppliers_all.delete(selectedSupplier.id);
        showNotification('Supplier deleted successfully!');
      } else if (selectedSupplier.id) {
        await db.suppliers_offline_delete.add({
          id: selectedSupplier.id,
          deletedAt: new Date().toISOString(),
          adminId: userId,
        });
        showNotification('Supplier deletion queued (will sync when online)', 'warning');
      } else {
        await db.suppliers_offline_add.delete(selectedSupplier.localId as number);
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[11px] text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase tracking-wider font-medium">
            <tr>
              <th className="px-4 py-2.5">Supplier Info</th>
              <th className="px-4 py-2.5">Contact Detail</th>
              <th className="px-4 py-2.5">Location</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentItems.map((sup) => (
              <tr key={sup.id || sup.localId} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary-50 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-600 border border-primary-100">
                      {sup.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{sup.name}</div>
                      <div className="text-[10px] text-gray-400">ID: {sup.id?.substring(0, 8) || 'LOCAL'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-col gap-0.5">
                    {sup.email && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span>{sup.email}</span>
                      </div>
                    )}
                    {sup.phone && (
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{sup.phone}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-gray-600">
                  <div className="flex items-start gap-1.5 max-w-[200px]">
                    <MapPin className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
                    <span className="line-clamp-1">{sup.address || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${sup.synced
                    ? 'bg-green-50 text-green-700 border-green-100'
                    : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                    <div className={`w-1 h-1 rounded-full mr-1.5 ${sup.synced ? 'bg-green-500' : 'bg-amber-500'}`} />
                    {sup.synced ? 'Synced' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1">
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
                      className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSupplier(sup);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {currentItems.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400 italic">No suppliers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {currentItems.map((sup) => (
        <motion.div
          key={sup.localId || sup.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded shadow-sm border border-gray-100 p-3 hover:shadow transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 shrink-0 border border-primary-100 font-bold text-xs">
                {sup.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 text-xs truncate">{sup.name}</div>
                <div className="text-[10px] text-gray-400 truncate">ID: {sup.id?.substring(0, 8) || 'LOCAL'}</div>
              </div>
            </div>
            <span className={`w-2 h-2 rounded-full ${sup.synced ? 'bg-green-500' : 'bg-amber-500'}`} title={sup.synced ? 'Synced' : 'Pending'} />
          </div>

          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-2 text-[10px] text-gray-600">
              <Mail className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="truncate">{sup.email || 'No Email'}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-600">
              <Phone className="w-3 h-3 text-gray-400 shrink-0" />
              <span>{sup.phone || 'No Phone'}</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-600">
              <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="truncate">{sup.address || 'No Address'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-50">
            <span className="text-[10px] text-gray-400 italic">
              Since: {formatDate(sup.createdAt || sup.lastModified)}
            </span>
            <div className="flex items-center gap-1">
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
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setSelectedSupplier(sup);
                  setIsDeleteModalOpen(true);
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded shadow-sm border border-gray-100 divide-y divide-gray-50">
      {currentItems.map((sup) => (
        <motion.div
          key={sup.localId || sup.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-4 py-2.5 hover:bg-gray-50 transition-colors flex items-center justify-between group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-gray-50 group-hover:bg-white rounded-lg flex items-center justify-center text-gray-400 shrink-0 border border-transparent group-hover:border-gray-100 transition-all font-bold text-xs uppercase">
              {sup.name.substring(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-gray-900 text-xs">{sup.name}</div>
              <div className="flex items-center gap-3 text-[10px] text-gray-400 italic">
                <span>{sup.email || 'no-email'}</span>
                <span>•</span>
                <span>{sup.phone || 'no-phone'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-gray-500 max-w-[200px] truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              {sup.address || 'No address specified'}
            </div>
            <div className={`w-1.5 h-1.5 rounded-full ${sup.synced ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : 'bg-amber-500'}`} />
            <div className="flex items-center gap-1">
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
                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
                title="Edit"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setSelectedSupplier(sup);
                  setIsDeleteModalOpen(true);
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
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
              className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white ${notification.type === 'success'
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
      <div className="sticky top-0 bg-white shadow-sm z-10 border-b border-gray-100">
        <div className="mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-primary-600 rounded-lg">
                <SupplierIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Supplier Management</h1>
                <p className="text-[10px] text-gray-500">Manage your product suppliers • Works offline</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center h-8 px-2 rounded-lg text-[10px] font-medium ${isOnline ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}
              >
                {isOnline ? (
                  <div className="flex items-center gap-1">
                    <Wifi className="w-3 h-3" />
                    <span>Online</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <WifiOff className="w-3 h-3" />
                    <span>Offline</span>
                  </div>
                )}
              </div>

              {isOnline && (
                <button
                  onClick={handleManualSync}
                  disabled={isLoading}
                  className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border border-blue-100 disabled:opacity-50"
                  title="Manual Sync"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              )}

              {isOnline && (
                <button
                  onClick={() => loadSuppliers(true)}
                  disabled={isRefreshing}
                  className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
                  title="Refresh Data"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              )}

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg font-medium text-xs shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Supplier
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 py-4 space-y-4">
        {/* Compact Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: 'Active', value: stats.active, icon: CheckCircle, color: 'green' },
            { title: 'Pending Sync', value: stats.pending, icon: AlertCircle, color: 'yellow' },
            { title: 'Total Suppliers', value: stats.total, icon: SupplierIcon, color: 'primary' },
            { title: 'Status', value: isOnline ? 'Online' : 'Offline', icon: isOnline ? Wifi : WifiOff, color: isOnline ? 'green' : 'red' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded shadow-sm border border-gray-100 p-3"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 bg-${stat.color}-50 rounded-full`}>
                  <stat.icon className={`w-4 h-4 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{stat.title}</p>
                  <p className="text-base font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search + View Mode */}
        <div className="bg-white rounded shadow-sm border border-gray-100 p-2 px-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-4 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-primary-600 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Table View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600 border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
                  title="List View"
                >
                  <Layout className="w-3.5 h-3.5" />
                </button>
              </div>
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
                    className={`px-3 py-1.5 text-sm rounded ${currentPage === p ? 'bg-primary-600 text-white' : 'border'
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
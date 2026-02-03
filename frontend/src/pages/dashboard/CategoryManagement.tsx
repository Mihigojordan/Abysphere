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
  Folder as FolderIcon,
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
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import categoryService from '../../services/categoryService';
import { db } from '../../db/database';
import { useCategoryOfflineSync } from '../../hooks/useCategoryOfflineSync';
import { useNetworkStatusContext } from '../../context/useNetworkContext';
import useEmployeeAuth from '../../context/EmployeeAuthContext';
import useAdminAuth from '../../context/AdminAuthContext';

type ViewMode = 'table' | 'grid' | 'list';

interface CategoryWithSync {
  id?: string;
  localId?: string;
  name: string;
  description?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  lastModified?: Date | string;
  synced: boolean;
}

const CategoryDashboard: React.FC<{ role: 'admin' | 'employee' }> = ({ role }) => {
  const [categories, setCategories] = useState<CategoryWithSync[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<CategoryWithSync[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithSync | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  const { isOnline } = useNetworkStatusContext();
  const { triggerSync, syncError } = useCategoryOfflineSync();
  const { user: employeeData } = useEmployeeAuth();
  const { user: adminData } = useAdminAuth();

  /* --------------------------------------------------------------------- */
  /* Summary Stats (Memoized) */
  /* --------------------------------------------------------------------- */
  const stats = useMemo(() => {
    const active = categories.filter(c => c.synced).length;
    const pending = categories.filter(c => !c.synced).length;
    const total = categories.length;
    return { active, pending, total };
  }, [categories]);

  /* --------------------------------------------------------------------- */
  /* Load & Sync */
  /* --------------------------------------------------------------------- */
  const loadCategories = useCallback(async (showRefreshLoader = false) => {
    if (showRefreshLoader) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      if (isOnline) await triggerSync();

      const [allCategories, offlineAdds, offlineUpdates, offlineDeletes] = await Promise.all([
        db.categories_all.toArray(),
        db.categories_offline_add.toArray(),
        db.categories_offline_update.toArray(),
        db.categories_offline_delete.toArray(),
      ]);

      const deleteIds = new Set(offlineDeletes.map(d => d.id));
      const updateMap = new Map(offlineUpdates.map(u => [u.id, u]));

      const combinedCategories = allCategories
        .filter(c => !deleteIds.has(c.id))
        .map(c => ({
          ...c,
          ...updateMap.get(c.id),
          synced: true,
        }))
        .concat(offlineAdds.map(a => ({ ...a, synced: false })))
        .sort((a, b) => Number(a.synced) - Number(b.synced));

      setCategories(combinedCategories);
      setFilteredCategories(combinedCategories);

      if (showRefreshLoader) {
        showNotification('Categories refreshed successfully!');
      }

      if (!isOnline && combinedCategories.length === 0) {
        showNotification('No offline data available', 'error');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      showNotification('Failed to load categories', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [isOnline, triggerSync]);

  useEffect(() => {
    loadCategories();
    if (isOnline) handleManualSync();
  }, [isOnline, loadCategories]);

  useEffect(() => {
    if (syncError) {
      showNotification(`Sync status error: ${syncError}`, 'error');
    }
  }, [syncError]);

  /* --------------------------------------------------------------------- */
  /* Filter */
  /* --------------------------------------------------------------------- */
  useEffect(() => {
    const filtered = categories.filter(
      (c) =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
    setCurrentPage(1);
  }, [searchTerm, categories]);

  /* --------------------------------------------------------------------- */
  /* Pagination */
  /* --------------------------------------------------------------------- */
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredCategories.slice(startIndex, endIndex);

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
  const handleCategorySubmit = async (categoryData: { name: string; description?: string }) => {
    setIsLoading(true);
    setFormError('');
    try {
      const validation = categoryService.validateCategoryData(categoryData);
      if (!validation.isValid) throw new Error(validation.errors.join(', '));

      const userData = role === 'admin'
        ? { adminId: adminData.id }
        : { employeeId: employeeData.id };
      const now = new Date();
      const newCategory = {
        ...categoryData,
        ...userData,
        lastModified: now,
        createdAt: now,
        updatedAt: now,
      };

      const localId = await db.categories_offline_add.add(newCategory);

      if (isOnline) {
        try {
          const response = await categoryService.createCategory({
            ...categoryData,
            ...userData,
          });
          await db.categories_all.put({
            id: response.category.id,
            name: categoryData.name,
            description: categoryData.description,
            lastModified: now,
            updatedAt: response.category.updatedAt || now,
          });
          await db.categories_offline_add.delete(localId);
          showNotification('Category added successfully!');
        } catch {
          showNotification('Category saved offline (will sync when online)', 'warning');
        }
      } else {
        showNotification('Category saved offline (will sync when online)', 'warning');
      }

      await loadCategories();
      setIsAddModalOpen(false);
      setFormData({ name: '', description: '' });
    } catch (error: any) {
      setFormError(error.message);
      showNotification(`Failed to add category: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------------------------------------------------- */
  /* CRUD: Update */
  /* --------------------------------------------------------------------- */
  const handleUpdateCategory = async (categoryData: { name: string; description?: string }) => {
    setIsLoading(true);
    setFormError('');
    try {
      const validation = categoryService.validateCategoryData(categoryData);
      if (!validation.isValid) throw new Error(validation.errors.join(', '));

      const userData = role === 'admin'
        ? { adminId: adminData.id }
        : { employeeId: employeeData.id };
      const now = new Date();
      const updatedData = {
        id: selectedCategory?.id,
        name: categoryData.name,
        description: categoryData.description,
        ...userData,
        lastModified: now,
        updatedAt: now,
      };

      if (isOnline && selectedCategory?.id) {
        try {
          const response = await categoryService.updateCategory(
            selectedCategory.id,
            { ...categoryData, ...userData }
          );
          await db.categories_all.put({
            id: selectedCategory.id,
            name: categoryData.name,
            description: categoryData.description,
            lastModified: now,
            updatedAt: response.category.updatedAt || now,
          });
          await db.categories_offline_update.delete(selectedCategory.id);
          showNotification('Category updated successfully!');
        } catch {
          await db.categories_offline_update.put(updatedData);
          showNotification('Category updated offline (will sync when online)', 'warning');
        }
      } else {
        await db.categories_offline_update.put(updatedData);
        showNotification('Category updated offline (will sync when online)', 'warning');
      }

      await loadCategories();
      setIsEditModalOpen(false);
      setSelectedCategory(null);
    } catch (error: any) {
      setFormError(error.message);
      showNotification(`Failed to update category: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------------------------------------------------- */
  /* CRUD: Delete */
  /* --------------------------------------------------------------------- */
  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;
    setIsLoading(true);
    try {
      const userData = role === 'admin'
        ? { adminId: adminData.id }
        : { employeeId: employeeData.id };

      if (isOnline && selectedCategory.id) {
        await categoryService.deleteCategory(selectedCategory.id, userData);
        await db.categories_all.delete(selectedCategory.id);
        showNotification('Category deleted successfully!');
      } else if (selectedCategory.id) {
        await db.categories_offline_delete.add({
          id: selectedCategory.id,
          deletedAt: new Date(),
          ...userData,
        });
        showNotification('Category deletion queued (will sync when online)', 'warning');
      } else {
        await db.categories_offline_add.delete(selectedCategory.localId!);
        showNotification('Category deleted!');
      }

      await loadCategories();
      setIsDeleteModalOpen(false);
      setSelectedCategory(null);
    } catch (error: any) {
      showNotification(`Failed to delete category: ${error.message}`, 'error');
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
      await loadCategories();
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
    setSelectedCategory(null);
    setFormData({ name: '', description: '' });
    setFormError('');
  };

  /* --------------------------------------------------------------------- */
  /* Render Views */
  /* --------------------------------------------------------------------- */
  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">#</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Category</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Description</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-600">Created</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {currentItems.map((cat, i) => (
            <tr key={cat.localId || cat.id} className="hover:bg-gray-50">
              <td className="py-3 px-4">
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                  {startIndex + i + 1}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {cat.name?.[0] || 'C'}
                  </div>
                  <div className="font-medium text-gray-900">{cat.name}</div>
                </div>
              </td>
              <td className="py-3 px-4 text-xs text-gray-600 line-clamp-2">
                {cat.description || 'No description'}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    cat.synced
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      cat.synced ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                  />
                  {cat.synced ? 'Active' : 'Syncing...'}
                </span>
              </td>
              <td className="py-3 px-4 text-xs text-gray-600">
                {formatDate(cat.createdAt || cat.lastModified)}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(cat);
                      setFormData({ name: cat.name, description: cat.description || '' });
                      setIsEditModalOpen(true);
                    }}
                    className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory(cat);
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
      {currentItems.map((cat) => (
        <motion.div
          key={cat.localId || cat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow border border-gray-100 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              <FolderIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-xs truncate">{cat.name}</div>
              <div className="text-gray-500 text-xs truncate">{cat.description || 'No description'}</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                cat.synced
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  cat.synced ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
              {cat.synced ? 'Active' : 'Syncing'}
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  setSelectedCategory(cat);
                  setFormData({ name: cat.name, description: cat.description || '' });
                  setIsEditModalOpen(true);
                }}
                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedCategory(cat);
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
      {currentItems.map((cat) => (
        <motion.div
          key={cat.localId || cat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-4 hover:bg-gray-50 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
              <FolderIcon className="w-5 h-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-xs truncate">{cat.name}</div>
              <div className="text-gray-500 text-xs truncate">{cat.description || 'No description'}</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                cat.synced
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  cat.synced ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
              {cat.synced ? 'Active' : 'Syncing'}
            </span>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  setSelectedCategory(cat);
                  setFormData({ name: cat.name, description: cat.description || '' });
                  setIsEditModalOpen(true);
                }}
                className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedCategory(cat);
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
                <FolderIcon className="w-6 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Category Management</h1>
                <p className="text-xs text-gray-500">Works offline • Auto-sync enabled</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-10 h-8 rounded-lg ${
                  isOnline ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}
                title={isOnline ? 'Online' : 'Offline'}
              >
                {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-5 h-5" />}
              </div>

              {isOnline && (
                <button
                  onClick={handleManualSync}
                  disabled={isLoading}
                  className="flex items-center justify-center w-10 h-8 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              )}

              {isOnline && (
                <button
                  onClick={() => loadCategories(true)}
                  disabled={isRefreshing}
                  className="flex items-center justify-center w-10 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
                >
                  <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
              )}

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium text-sm"
              >
                <Plus className="w-3 h-4 text-sm" />
                Add Category
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
              <FolderIcon className="w-6 h-6 text-primary-600" />
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
                placeholder="Search categories..."
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
            <p>Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FolderIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold">
              {searchTerm ? 'No categories found' : 'No categories available'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm ? 'Try adjusting your search.' : 'Add your first category!'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="w-5 h-5" />
                Add Category
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
                Showing {startIndex + 1} to {Math.min(endIndex, filteredCategories.length)} of {filteredCategories.length}
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
              <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm mb-4">
                  {formError}
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCategorySubmit(formData);
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  placeholder="Category name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded text-sm"
                  required
                />
                <textarea
                  placeholder="Description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
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
        {isEditModalOpen && selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Edit Category</h3>
              {formError && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm mb-4">
                  {formError}
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateCategory(formData);
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
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
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
        {isDeleteModalOpen && selectedCategory && (
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
                  <h3 className="text-lg font-semibold">Delete Category</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Are you sure you want to delete <strong>{selectedCategory.name}</strong>?
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

export default CategoryDashboard;
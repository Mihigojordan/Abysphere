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
  RefreshCw,
  Download,
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
import useEmployeeAuth from '../../context/EmployeeAuthContext';
import useAdminAuth from '../../context/AdminAuthContext';
import { useLanguage } from '../../context/LanguageContext';

type ViewMode = 'table' | 'grid' | 'list';

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  adminId: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

const SupplierDashboard: React.FC<{ role: 'admin' | 'employee' }> = ({ role }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const { user: employeeData } = useEmployeeAuth();
  const { user: adminData } = useAdminAuth();
  const { t } = useLanguage();

  /* --------------------------------------------------------------------- */
  /* Summary Stats (Memoized) */
  /* --------------------------------------------------------------------- */
  const stats = useMemo(() => {
    const total = suppliers.length;
    const active = total; // All suppliers are considered active
    return { active, total };
  }, [suppliers]);

  /* --------------------------------------------------------------------- */
  /* Load Suppliers */
  /* --------------------------------------------------------------------- */
  const loadSuppliers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await supplierService.getAllSuppliers();
      setSuppliers(data);
      setFilteredSuppliers(data);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      showNotification('Failed to load suppliers', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

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

      await supplierService.createSupplier({
        ...supplierData,
        adminId: userId,
      });

      showNotification('Supplier added successfully!');
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
      if (!selectedSupplier?.id) throw new Error('No supplier selected');

      const validation = supplierService.validateSupplierData(supplierData);
      if (!validation.isValid) throw new Error(validation.errors.join(', '));

      const userId = role === 'admin' ? adminData?.id || '' : employeeData?.id || '';

      await supplierService.updateSupplier(selectedSupplier.id, {
        ...supplierData,
        adminId: userId,
      });

      showNotification('Supplier updated successfully!');
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
    if (!selectedSupplier?.id) return;
    setIsLoading(true);
    try {
      await supplierService.deleteSupplier(selectedSupplier.id);
      showNotification('Supplier deleted successfully!');
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
    <div className="bg-theme-bg-primary rounded-xl shadow-lg border border-theme-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-theme-bg-tertiary border-b border-theme-border text-theme-text-secondary uppercase tracking-widest font-black">
            <tr>
              <th className="px-6 py-4">{t('supplier.name')}</th>
              <th className="px-6 py-4">{t('supplier.contact')}</th>
              <th className="px-6 py-4">{t('supplier.address')}</th>
              <th className="px-6 py-4 text-right">{t('supplier.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border">
            {currentItems.map((sup) => (
              <tr key={sup.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary-50 rounded-full flex items-center justify-center text-[10px] font-bold text-primary-600 border border-primary-100">
                      {sup.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{sup.name}</div>
                      <div className="text-[10px] text-gray-400">ID: {sup.id?.substring(0, 8)}</div>
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
                <td colSpan={4} className="py-10 text-center text-gray-400 italic">{t('supplier.noSuppliers')}</td>
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
          key={sup.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-theme-bg-primary rounded-xl shadow-sm border border-theme-border p-4 hover:shadow-lg transition-all hover:border-primary-500/30 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-600 shrink-0 border border-primary-500/20 font-black text-sm uppercase group-hover:scale-110 transition-transform">
                {sup.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-theme-text-primary text-sm truncate">{sup.name}</div>
                <div className="text-[10px] text-theme-text-secondary font-medium tracking-wide truncate">ID: {sup.id?.substring(0, 8)}</div>
              </div>
            </div>
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
              Since: {formatDate(sup.createdAt)}
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
    <div className="bg-theme-bg-primary rounded-xl shadow-lg border border-theme-border divide-y divide-theme-border overflow-hidden">
      {currentItems.map((sup) => (
        <motion.div
          key={sup.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="px-6 py-4 hover:bg-theme-bg-tertiary transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 bg-theme-bg-tertiary group-hover:bg-primary-500/10 rounded-xl flex items-center justify-center text-theme-text-secondary group-hover:text-primary-600 shrink-0 border border-theme-border group-hover:border-primary-500/20 transition-all font-black text-sm uppercase">
              {sup.name.substring(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-theme-text-primary text-sm group-hover:text-primary-600 transition-colors uppercase tracking-tight">{sup.name}</div>
              <div className="flex items-center gap-3 text-[10px] text-theme-text-secondary font-medium tracking-wide">
                <span>{sup.email || 'no-email'}</span>
                <span className="text-theme-text-secondary/30">•</span>
                <span>{sup.phone || 'no-phone'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 text-[10px] text-theme-text-secondary font-medium max-w-[250px] truncate bg-theme-bg-secondary px-3 py-1 rounded-full border border-theme-border">
              <MapPin className="w-3 h-3 shrink-0 text-primary-500" />
              {sup.address || 'No address specified'}
            </div>

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
    <div className="min-h-screen bg-theme-bg-secondary font-sans text-theme-text-primary transition-colors duration-200">
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
      <div className="sticky top-0 bg-theme-bg-primary shadow-md z-10 border-b border-theme-border">
        <div className="mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-600 rounded-lg shadow-lg shadow-primary-600/20">
                <SupplierIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-theme-text-primary uppercase tracking-tight">{t('supplier.title')}</h1>
                <p className="text-[10px] text-theme-text-secondary font-medium tracking-wide">{t('supplier.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadSuppliers}
                disabled={isLoading}
                className="flex items-center space-x-1 px-4 py-1.5 text-theme-text-secondary hover:text-theme-text-primary border border-theme-border rounded hover:bg-theme-bg-tertiary transition-colors disabled:opacity-50 text-[10px]"
                title={t('supplier.refresh')}
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{t('supplier.refresh')}</span>
              </button>
              <button
                onClick={() => { }}
                disabled={isLoading || filteredSuppliers.length === 0}
                className="flex items-center space-x-1 px-4 py-1.5 text-theme-text-secondary hover:text-theme-text-primary border border-theme-border rounded hover:bg-theme-bg-tertiary transition-colors disabled:opacity-50 text-[10px]"
                title={t('supplier.export')}
              >
                <Download className="w-3 h-3" />
                <span>{t('supplier.export')}</span>
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-lg shadow-primary-600/20 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                {t('supplier.addSupplier')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 py-4 space-y-4">
        {/* Compact Statistics */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { title: t('supplier.activeStatus'), value: stats.active, icon: CheckCircle, color: 'green' },
            { title: t('supplier.totalSuppliers'), value: stats.total, icon: SupplierIcon, color: 'primary' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-theme-bg-primary rounded-xl shadow-sm border border-theme-border p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-xl ${stat.color === 'green' ? 'bg-green-500/10 text-green-600' : 'bg-primary-500/10 text-primary-600'}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-theme-text-secondary uppercase tracking-widest font-black leading-none mb-1">{stat.title}</p>
                  <p className="text-xl font-black text-theme-text-primary leading-none">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search + View Mode */}
        <div className="bg-theme-bg-primary rounded-xl shadow-sm border border-theme-border p-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-text-secondary" />
              <input
                type="text"
                placeholder={t('supplier.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-theme-bg-secondary border border-theme-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-theme-text-primary transition-all placeholder:text-theme-text-secondary/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-theme-bg-tertiary/30 p-1.5 rounded-xl border border-theme-border">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-theme-bg-primary shadow-md text-primary-600 border border-theme-border' : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary'}`}
                  title={t('supplier.tableView')}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-theme-bg-primary shadow-md text-primary-600 border border-theme-border' : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary'}`}
                  title={t('supplier.gridView')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-theme-bg-primary shadow-md text-primary-600 border border-theme-border' : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary'}`}
                  title={t('supplier.listView')}
                >
                  <Layout className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading / Empty */}
        {isLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-2" />
            <p>{t('common.loading')}</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <SupplierIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-semibold">
              {searchTerm ? t('supplier.noSuppliers') : t('supplier.noSuppliers')}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm ? t('supplier.noSuppliersSub') : t('supplier.noSuppliersSub')}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="w-5 h-5" />
                {t('supplier.addSupplier')}
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
            <div className="flex items-center justify-between bg-theme-bg-primary px-6 py-4 border-t border-theme-border rounded-b-xl shadow-lg mt-4">
              <div className="text-xs font-bold text-theme-text-secondary uppercase tracking-widest">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredSuppliers.length)} of {filteredSuppliers.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-theme-text-secondary bg-theme-bg-secondary border border-theme-border rounded-lg disabled:opacity-30 transition-all hover:bg-theme-bg-tertiary"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {getPageNumbers().map(p => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`min-w-[32px] h-8 text-[11px] font-bold rounded-lg border transition-all ${currentPage === p ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-theme-bg-secondary border-theme-border text-theme-text-secondary hover:bg-theme-bg-tertiary'
                        }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-theme-text-secondary bg-theme-bg-secondary border border-theme-border rounded-lg disabled:opacity-30 transition-all hover:bg-theme-bg-tertiary"
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
            <div className="bg-theme-bg-primary rounded-2xl p-8 w-full max-w-md shadow-2xl border border-theme-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-600 border border-primary-500/20">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-theme-text-primary tracking-tight">Add New Supplier</h3>
              </div>

              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-xs font-bold uppercase tracking-wider mb-6 animate-in shake-1">
                  {formError}
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSupplierSubmit(formData);
                }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-theme-text-secondary uppercase tracking-widest ml-1">Supplier Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-xl text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-theme-text-secondary uppercase tracking-widest ml-1">Email (optional)</label>
                  <input
                    type="email"
                    placeholder="contact@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-xl text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-theme-text-secondary uppercase tracking-widest ml-1">Phone (optional)</label>
                  <input
                    type="tel"
                    placeholder="+250 000 000 000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-xl text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-theme-text-secondary uppercase tracking-widest ml-1">Address (optional)</label>
                  <textarea
                    placeholder="Street, City, Country"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-xl text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeAllModals}
                    className="px-6 py-2.5 bg-theme-bg-tertiary text-theme-text-secondary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-theme-bg-secondary transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50 shadow-lg shadow-primary-500/20 transition-all active:scale-95"
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
            <div className="bg-theme-bg-primary rounded-2xl p-8 w-full max-w-md shadow-2xl border border-theme-border">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center text-primary-600 border border-primary-500/20">
                  <Edit className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-theme-text-primary tracking-tight">Edit Supplier</h3>
              </div>

              {formError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-xs font-bold uppercase tracking-wider mb-6 animate-in shake-1">
                  {formError}
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateSupplier(formData);
                }}
                className="space-y-5"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-theme-text-secondary uppercase tracking-widest ml-1">Supplier Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-xl text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-theme-text-secondary uppercase tracking-widest ml-1">Email (optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-xl text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-theme-text-secondary uppercase tracking-widest ml-1">Phone (optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-xl text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-theme-text-secondary uppercase tracking-widest ml-1">Address (optional)</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 bg-theme-bg-secondary border border-theme-border rounded-xl text-sm text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeAllModals}
                    className="px-6 py-2.5 bg-theme-bg-tertiary text-theme-text-secondary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-theme-bg-secondary transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50 shadow-lg shadow-primary-500/20 transition-all active:scale-95"
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
            <div className="bg-theme-bg-primary rounded-2xl p-8 w-full max-w-md shadow-2xl border border-theme-border overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-600" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center shrink-0 border border-red-500/20">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-theme-text-primary tracking-tight">Delete Supplier</h3>
                  <p className="text-xs font-bold text-red-500 uppercase tracking-widest mt-0.5">Critical Action</p>
                </div>
              </div>

              <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 mb-6 font-medium">
                <p className="text-sm text-theme-text-primary leading-relaxed">
                  Are you sure you want to delete <span className="font-black text-red-600 px-1.5 py-0.5 bg-red-500/10 rounded-md tracking-tight uppercase">{selectedSupplier.name}</span>? This process cannot be undone.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeAllModals}
                  className="px-6 py-2.5 bg-theme-bg-tertiary text-theme-text-secondary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-theme-bg-secondary transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isLoading}
                  className="px-10 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? 'Deleting...' : 'Confirm Delete'}
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
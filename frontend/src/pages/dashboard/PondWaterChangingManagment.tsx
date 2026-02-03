/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
  RefreshCw,
  Filter,
  Grid3X3,
  List,
  Settings,
} from 'lucide-react';
import pondWaterChangingService from '../../services/PondWaterChangingService';
import eggToPondMigrationService from '../../services/eggToPondMigrationsService';
import { useSocketEvent } from '../../context/SocketContext';

interface PondWaterChanging {
  id: string;
  EggtoPondId: string;
  litersChanged: number;
  description?: string | null;
  employeeId: string;
  createdAt?: string;
  employee?: { id: string; name: string };
  eggToPondMigration?: { id: string; description?: string | null };
}

type ViewMode = 'table' | 'grid' | 'list';

interface OperationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

const PondWaterChangingManagement: React.FC<{ role: string }> = ({ role }) => {
  const [waterChanges, setWaterChanges] = useState<PondWaterChanging[]>([]);
  const [allWaterChanges, setAllWaterChanges] = useState<PondWaterChanging[]>([]);
  const [eggToPondMigrations, setEggToPondMigrations] = useState<{ id: string; description?: string | null }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<keyof PondWaterChanging>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [deleteConfirm, setDeleteConfirm] = useState<PondWaterChanging | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMigration, setSelectedMigration] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState<PondWaterChanging | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allWaterChanges, selectedMigration]);

  useSocketEvent('create', (waterChange: PondWaterChanging) => {
    showOperationStatus('info', `Water change record created!`);
    loadData();
  });

  useSocketEvent('update', (waterChange: PondWaterChanging) => {
    showOperationStatus('info', `Water change record updated!`);
    loadData();
  });

  useSocketEvent('delete', ({ id }: { id: string }) => {
    showOperationStatus('info', `Water change record ${id} deleted!`);
    loadData();
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [waterChangeData, migrationData, employeeData] = await Promise.all([
        pondWaterChangingService.getAllPondWaterChanges(),
        eggToPondMigrationService.getAllEggToPondMigrations(),
        fetchEmployees(),
      ]);

      const enrichedWaterChanges = waterChangeData.map((waterChange) => ({
        ...waterChange,
        eggToPondMigration: migrationData.find((migration) => migration.id === waterChange.EggtoPondId) || {
          id: waterChange.EggtoPondId,
          description: 'Unknown',
        },
        employee: employeeData.find((employee) => employee.id === waterChange.employeeId) || {
          id: waterChange.employeeId,
          name: 'Unknown',
        },
      }));

      setAllWaterChanges(enrichedWaterChanges || []);
      setEggToPondMigrations(migrationData || []);
      setEmployees(employeeData || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load water change records');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    // Placeholder: Replace with actual API call to fetch employees
    return [];
  };

  const showOperationStatus = (type: OperationStatus['type'], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allWaterChanges];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (wc) =>
          wc.eggToPondMigration?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          wc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          wc.employee?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMigration) {
      filtered = filtered.filter((wc) => wc.EggtoPondId === selectedMigration);
    }

    filtered.sort((a, b) => {
      const aValue = sortBy === 'eggToPondMigration' ? a.eggToPondMigration?.description : a[sortBy];
      const bValue = sortBy === 'eggToPondMigration' ? b.eggToPondMigration?.description : b[sortBy];

      if (sortBy === 'createdAt') {
        const aDate = new Date(aValue || '');
        const bDate = new Date(bValue || '');
        return sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }

      const aStr = aValue ? aValue.toString().toLowerCase() : '';
      const bStr = bValue ? bValue.toString().toLowerCase() : '';
      return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    setWaterChanges(filtered);
    setCurrentPage(1);
  };

  const totalWaterChanges = allWaterChanges.length;
  const recentWaterChanges = allWaterChanges.filter(
    (wc) => new Date(wc.createdAt || '').getTime() > Date.now() - 24 * 60 * 60 * 1000
  ).length;
  const uniqueMigrations = [...new Set(allWaterChanges.map((wc) => wc.EggtoPondId))].length;

  const handleAddWaterChange = () => {
    setShowCreateModal(true);
  };

  const handleEditWaterChange = (waterChange: PondWaterChanging) => {
    if (!waterChange?.id) return;
    setShowUpdateModal(waterChange);
  };

  const handleViewWaterChange = (waterChange: PondWaterChanging) => {
    if (!waterChange?.id) return;
    window.location.href = `/admin/dashboard/pond-water-changing/${waterChange.id}`;
  };

  const handleDeleteWaterChange = async (waterChange: PondWaterChanging) => {
    try {
      setOperationLoading(true);
      setDeleteConfirm(null);
      await pondWaterChangingService.deletePondWaterChanging(waterChange.id);
      loadData();
      showOperationStatus('success', 'Water change record deleted successfully!');
    } catch (err: any) {
      showOperationStatus('error', err.message || 'Failed to delete water change record');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCreateSubmit = async (data: Partial<PondWaterChanging>) => {
    try {
      setOperationLoading(true);
      const validation = pondWaterChangingService.validatePondWaterChangingData(data as PondWaterChanging);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      await pondWaterChangingService.createPondWaterChanging(data as PondWaterChanging);
      setShowCreateModal(false);
      loadData();
      showOperationStatus('success', 'Water change record created successfully!');
    } catch (err: any) {
      showOperationStatus('error', err.message || 'Failed to create water change record');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleUpdateSubmit = async (data: Partial<PondWaterChanging>) => {
    try {
      setOperationLoading(true);
      if (showUpdateModal?.id) {
        const validation = pondWaterChangingService.validatePondWaterChangingData(data as PondWaterChanging);
        if (!validation.isValid) {
          throw new Error(validation.errors.join(', '));
        }
        await pondWaterChangingService.updatePondWaterChanging(showUpdateModal.id, data);
        setShowUpdateModal(null);
        loadData();
        showOperationStatus('success', 'Water change record updated successfully!');
      }
    } catch (err: any) {
      showOperationStatus('error', err.message || 'Failed to update water change record');
    } finally {
      setOperationLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const totalPages = Math.ceil(waterChanges.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWaterChanges = waterChanges.slice(startIndex, endIndex);

  const CreateWaterChangeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [formData, setFormData] = useState<Partial<PondWaterChanging>>({
      EggtoPondId: '',
      litersChanged: 0,
      description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateSubmit(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded p-4 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Create Water Change Record</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700">Egg to Pond Migration</label>
              <select
                value={formData.EggtoPondId}
                onChange={(e) => setFormData({ ...formData, EggtoPondId: e.target.value })}
                required
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Select Migration</option>
                {eggToPondMigrations.map((migration) => (
                  <option key={migration.id} value={migration.id}>
                    {migration.description || 'Unnamed Migration'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Liters Changed</label>
              <input
                type="number"
                value={formData.litersChanged}
                onChange={(e) => setFormData({ ...formData, litersChanged: parseInt(e.target.value) })}
                required
                min="0"
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Description (Optional)</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const UpdateWaterChangeModal: React.FC<{ waterChange: PondWaterChanging; onClose: () => void }> = ({
    waterChange,
    onClose,
  }) => {
    const [formData, setFormData] = useState<Partial<PondWaterChanging>>({
      EggtoPondId: waterChange.EggtoPondId,
      litersChanged: waterChange.litersChanged,
      description: waterChange.description,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleUpdateSubmit(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded p-4 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Update Water Change Record</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700">Egg to Pond Migration</label>
              <select
                value={formData.EggtoPondId}
                onChange={(e) => setFormData({ ...formData, EggtoPondId: e.target.value })}
                required
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="">Select Migration</option>
                {eggToPondMigrations.map((migration) => (
                  <option key={migration.id} value={migration.id}>
                    {migration.description || 'Unnamed Migration'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Liters Changed</label>
              <input
                type="number"
                value={formData.litersChanged}
                onChange={(e) => setFormData({ ...formData, litersChanged: parseInt(e.target.value) })}
                required
                min="0"
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Description (Optional)</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Update
              </button>
            </div>
          </form>
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
                onClick={() => setSortBy('eggToPondMigration')}
              >
                <div className="flex items-center space-x-1">
                  <span>Migration</span>
                  <ChevronDown
                    className={`w-3 h-3 ${sortBy === 'eggToPondMigration' ? 'text-primary-600' : 'text-gray-400'}`}
                  />
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Liters Changed</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Description</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Employee</th>
              <th
                className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell cursor-pointer hover:bg-gray-100"
                onClick={() => setSortBy('createdAt')}
              >
                <div className="flex items-center space-x-1">
                  <span>Created At</span>
                  <ChevronDown
                    className={`w-3 h-3 ${sortBy === 'createdAt' ? 'text-primary-600' : 'text-gray-400'}`}
                  />
                </div>
              </th>
              <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentWaterChanges.map((waterChange, index) => (
              <tr key={waterChange.id || index} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2 font-medium text-gray-900 text-xs">
                  {waterChange.eggToPondMigration?.description || 'Unnamed Migration'}
                </td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{waterChange.litersChanged}</td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{waterChange.description || 'N/A'}</td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{waterChange.employee?.name}</td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{formatDate(waterChange.createdAt || '')}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => handleViewWaterChange(waterChange)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="View"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleEditWaterChange(waterChange)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(waterChange)}
                      className="text-gray-400 hover:text-red-600 p-1"
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
      {currentWaterChanges.map((waterChange) => (
        <div
          key={waterChange.id}
          className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Settings className="w-4 h-4 text-primary-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">
                {waterChange.eggToPondMigration?.description || 'Unnamed Migration'}
              </div>
              <div className="text-gray-500 text-xs truncate">{waterChange.litersChanged} liters</div>
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <span>Description: {waterChange.description || 'N/A'}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <span>Employee: {waterChange.employee?.name}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              <button
                onClick={() => handleViewWaterChange(waterChange)}
                className="text-gray-400 hover:text-primary-600 p-1"
                title="View"
              >
                <Eye className="w-3 h-3" />
              </button>
              <button
                onClick={() => handleEditWaterChange(waterChange)}
                className="text-gray-400 hover:text-primary-600 p-1"
                title="Edit"
              >
                <Edit className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={() => setDeleteConfirm(waterChange)}
              className="text-gray-400 hover:text-red-600 p-1"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
      {currentWaterChanges.map((waterChange) => (
        <div key={waterChange.id} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Settings className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">
                  {waterChange.eggToPondMigration?.description || 'Unnamed Migration'}
                </div>
                <div className="text-gray-500 text-xs truncate">{waterChange.litersChanged} liters</div>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-3 gap-4 text-xs text-gray-600 flex-1 max-w-2xl px-4">
              <span>{waterChange.description || 'N/A'}</span>
              <span>{waterChange.litersChanged}</span>
              <span>{waterChange.employee?.name}</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => handleViewWaterChange(waterChange)}
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                title="View Water Change"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEditWaterChange(waterChange)}
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                title="Edit Water Change"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteConfirm(waterChange)}
                className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                title="Delete Water Change"
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
          Showing {startIndex + 1}-{Math.min(endIndex, waterChanges.length)} of {waterChanges.length}
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
      <div className="bg-white shadow-md">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Toggle Sidebar"
              >
                <Settings className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Pond Water Changing Management</h1>
                <p className="text-xs text-gray-500 mt-0.5">Manage water change records for egg migrations</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleAddWaterChange}
                disabled={operationLoading}
                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
                <span>Add Water Change Record</span>
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
                <Settings className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Water Changes</p>
                <p className="text-lg font-semibold text-gray-900">{totalWaterChanges}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Recent Water Changes (24h)</p>
                <p className="text-lg font-semibold text-gray-900">{recentWaterChanges}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Unique Migrations</p>
                <p className="text-lg font-semibold text-gray-900">{uniqueMigrations}</p>
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
                  placeholder="Search water changes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
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
                  const [field, order] = e.target.value.split('-') as [keyof PondWaterChanging, 'asc' | 'desc'];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="eggToPondMigration-asc">Migration (A-Z)</option>
                <option value="eggToPondMigration-desc">Migration (Z-A)</option>
                <option value="litersChanged-asc">Liters Changed (Low-High)</option>
                <option value="litersChanged-desc">Liters Changed (High-Low)</option>
                <option value="description-asc">Description (A-Z)</option>
                <option value="description-desc">Description (Z-A)</option>
                <option value="employee-asc">Employee (A-Z)</option>
                <option value="employee-desc">Employee (Z-A)</option>
                <option value="createdAt-desc">Newest</option>
                <option value="createdAt-asc">Oldest</option>
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
                  <Settings className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedMigration}
                  onChange={(e) => setSelectedMigration(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">All Migrations</option>
                  {eggToPondMigrations.map((migration) => (
                    <option key={migration.id} value={migration.id}>
                      {migration.description || 'Unnamed Migration'}
                    </option>
                  ))}
                </select>
                {selectedMigration && (
                  <button
                    onClick={() => setSelectedMigration('')}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-xs">{error}</div>}

        {loading ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="inline-flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Loading water change records...</span>
            </div>
          </div>
        ) : currentWaterChanges.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm || selectedMigration
                ? 'No water change records found matching your criteria'
                : 'No water change records found'}
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

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-4 w-full max-w-sm">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Delete Water Change Record</h3>
                <p className="text-xs text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-700">
                Are you sure you want to delete the water change record for{' '}
                <span className="font-semibold">{deleteConfirm.eggToPondMigration?.description || 'Unnamed Migration'}</span>?
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1.5 text-xs text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteWaterChange(deleteConfirm)}
                className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && <CreateWaterChangeModal onClose={() => setShowCreateModal(false)} />}
      {showUpdateModal && <UpdateWaterChangeModal waterChange={showUpdateModal} onClose={() => setShowUpdateModal(null)} />}
    </div>
  );
};

export default PondWaterChangingManagement;
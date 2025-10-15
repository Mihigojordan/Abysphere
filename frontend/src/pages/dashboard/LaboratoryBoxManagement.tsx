import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  List,
  X,
  Filter,
  RefreshCw,
  Eye,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import laboratoryBoxService, { type LaboratoryBox, type LaboratoryBoxData } from '../../services/laboratoryBoxService';
import { useSocketEvent } from '../../context/SocketContext';
import useEmployeeAuth from '../../context/EmployeeAuthContext';

type ViewMode = 'table';

interface OperationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

const generateBoxCode = (name: string): string => {
  // Remove special characters, get first letters of words, and append UUID suffix
  const words = name.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/);
  const initials = words
    .filter(word => word.length > 0)
    .map(word => word[0].toUpperCase())
    .join('');
  const uuidSuffix = uuidv4().slice(0, 5);
  return `${initials}_${uuidSuffix}`;
};

const LaboratoryBoxModal: React.FC<{
  isOpen: boolean;
  labBox: LaboratoryBox | null;
  onClose: () => void;
  onSave: (data: LaboratoryBoxData) => Promise<void>;
  mode: 'create' | 'edit';
}> = ({ isOpen, labBox, onClose, onSave, mode }) => {
  const [formData, setFormData] = useState<LaboratoryBoxData>({
    name: '',
    code: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (mode === 'edit' && labBox) {
      setFormData({
        name: labBox.name,
        code: labBox.code,
        description: labBox.description || '',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
      });
    }
    setValidationErrors([]);
  }, [mode, labBox, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSave = { ...formData };
    if (mode === 'create') {
      dataToSave.code = generateBoxCode(formData.name);
    }
    const validation = laboratoryBoxService.validateLaboratoryBoxData(dataToSave);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    setLoading(true);
    try {
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Error saving laboratory box:', error);
      setValidationErrors(['Failed to save laboratory box']);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {mode === 'create' ? 'Create Laboratory Box' : 'Edit Laboratory Box'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-xs">
              {validationErrors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm text-white bg-primary-600 rounded hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create Laboratory Box' : 'Update Laboratory Box'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteLaboratoryBoxModal: React.FC<{
  isOpen: boolean;
  labBox: LaboratoryBox | null;
  onClose: () => void;
  onDelete: (labBox: LaboratoryBox) => Promise<void>;
}> = ({ isOpen, labBox, onClose, onDelete }) => {
  if (!isOpen || !labBox) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Delete Laboratory Box</h3>
            <p className="text-xs text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete the laboratory box "{labBox.name}"? This action will permanently remove it from the system.
          </p>
        </div>
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onDelete(labBox)}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailsModal: React.FC<{
  isOpen: boolean;
  labBox: LaboratoryBox | null;
  onClose: () => void;
}> = ({ isOpen, labBox, onClose }) => {
  if (!isOpen || !labBox) return null;

  const formatDate = (date?: string): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Laboratory Box Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <p className="text-sm text-gray-900">{labBox.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code
            </label>
            <p className="text-sm text-gray-900">{labBox.code}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <p className="text-sm text-gray-900">{labBox.description || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created At
            </label>
            <p className="text-sm text-gray-900">{formatDate(labBox.createdAt)}</p>
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LaboratoryBoxManagement: React.FC<{ role: string }> = ({ role }) => {
  const [labBoxes, setLabBoxes] = useState<LaboratoryBox[]>([]);
  const [allLabBoxes, setAllLabBoxes] = useState<LaboratoryBox[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof LaboratoryBox>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [rowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode] = useState<ViewMode>('table');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLabBoxModalOpen, setIsLabBoxModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedLabBox, setSelectedLabBox] = useState<LaboratoryBox | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    fetchLabBoxes();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allLabBoxes]);

  useSocketEvent('create', (labBoxData: LaboratoryBox) => {
    console.log('Laboratory box created via WebSocket:', labBoxData);
    setAllLabBoxes((prevLabBoxes) => [...prevLabBoxes, labBoxData]);
    showOperationStatus('success', `Laboratory box created`);
  });

  useSocketEvent('update', (labBoxData: LaboratoryBox) => {
    console.log('Laboratory box updated via WebSocket:', labBoxData);
    setAllLabBoxes((prevLabBoxes) =>
      prevLabBoxes.map((m) => (m.id === labBoxData.id ? labBoxData : m))
    );
    showOperationStatus('success', `Laboratory box updated`);
  });

  useSocketEvent('delete', ({ id }: { id: string }) => {
    console.log('Laboratory box deleted via WebSocket:', id);
    setAllLabBoxes((prevLabBoxes) => prevLabBoxes.filter((m) => m.id !== id));
    showOperationStatus('success', 'Laboratory box deleted');
  });

  const fetchLabBoxes = async () => {
    try {
      setLoading(true);
      const data = await laboratoryBoxService.getAllLaboratoryBoxes();
      setAllLabBoxes(data || []);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load laboratory boxes';
      console.error('Error fetching laboratory boxes:', err);
      setError(errorMessage);
      showOperationStatus('error', errorMessage);
    } finally {
      setLoading(false);
    }
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
    let filtered = [...allLabBoxes];

    if (searchTerm.trim()) {
      filtered = filtered.filter((labBox) =>
        labBox.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        labBox.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let aValue = a[sortBy] ?? '';
      let bValue = b[sortBy] ?? '';
      if (sortBy === 'createdAt') {
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

    setLabBoxes(filtered);
    setCurrentPage(1);
  };

  const handleAddLabBox = () => {
    setSelectedLabBox(null);
    setModalMode('create');
    setIsLabBoxModalOpen(true);
  };

  const handleEditLabBox = (labBox: LaboratoryBox) => {
    setSelectedLabBox(labBox);
    setModalMode('edit');
    setIsLabBoxModalOpen(true);
  };

  const handleViewDetails = (labBox: LaboratoryBox) => {
    setSelectedLabBox(labBox);
    setIsDetailsModalOpen(true);
  };

  const handleSaveLabBox = async (data: LaboratoryBoxData) => {
    try {
      setOperationLoading(true);
      if (modalMode === 'create') {
        await laboratoryBoxService.createLaboratoryBox(data);
        showOperationStatus('success', 'Laboratory box created successfully');
      } else if (selectedLabBox) {
        await laboratoryBoxService.updateLaboratoryBox(selectedLabBox.id, data);
        showOperationStatus('success', 'Laboratory box updated successfully');
      }
      await fetchLabBoxes();
    } catch (err: any) {
      showOperationStatus('error', err.message || 'Failed to save laboratory box');
      throw err;
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteLabBox = (labBox: LaboratoryBox) => {
    setSelectedLabBox(labBox);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async (labBox: LaboratoryBox) => {
    try {
      setOperationLoading(true);
      await laboratoryBoxService.deleteLaboratoryBox(labBox.id);
      showOperationStatus('success', 'Laboratory box deleted successfully');
      await fetchLabBoxes();
    } catch (err: any) {
      showOperationStatus('error', err.message || 'Failed to delete laboratory box');
    } finally {
      setOperationLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedLabBox(null);
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

  const filteredLabBoxes = labBoxes;
  const totalPages = Math.ceil(filteredLabBoxes.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentLabBoxes = filteredLabBoxes.slice(startIndex, endIndex);

  const totalLabBoxes = allLabBoxes.length;

  const renderTableView = () => (
    <div className="bg-white rounded border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">Name</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">Code</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Created At</th>
              <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentLabBoxes.map((labBox, index) => (
              <tr key={labBox.id} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2">
                  <div className="text-xs font-medium text-gray-900">{labBox.name}</div>
                </td>
                <td className="py-2 px-2 text-gray-700">{labBox.code}</td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">
                  {formatDate(labBox.createdAt)}
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => handleViewDetails(labBox)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="View Details"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleEditLabBox(labBox)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteLabBox(labBox)}
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
          Showing {startIndex + 1}-{Math.min(endIndex, filteredLabBoxes.length)} of{' '}
          {filteredLabBoxes.length}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
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
            className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-xs">
      <LaboratoryBoxModal
        isOpen={isLabBoxModalOpen}
        labBox={selectedLabBox}
        onClose={() => setIsLabBoxModalOpen(false)}
        onSave={handleSaveLabBox}
        mode={modalMode}
      />
      <DeleteLaboratoryBoxModal
        isOpen={isDeleteModalOpen}
        labBox={selectedLabBox}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
      />
      <DetailsModal
        isOpen={isDetailsModalOpen}
        labBox={selectedLabBox}
        onClose={() => setIsDetailsModalOpen(false)}
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
            {operationStatus.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {operationStatus.type === 'error' && <XCircle className="w-4 h-4" />}
            {operationStatus.type === 'info' && <AlertCircle className="w-4 h-4" />}
            <span className="font-medium">{operationStatus.message}</span>
            <button onClick={() => setOperationStatus(null)}>
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      <div className="bg-white shadow-md">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Laboratory Box Management
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage your laboratory box inventory
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchLabBoxes}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleAddLabBox}
                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
              >
                <Plus className="w-3 h-3" />
                <span>New Laboratory Box</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 rounded-full">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Laboratory Boxes</p>
                <p className="text-lg font-semibold text-gray-900">
                  {totalLabBoxes}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:0 gap-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search laboratory boxes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-1 px-2 py-1.5 text-xs border rounded ${
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
                    keyof LaboratoryBox,
                    'asc' | 'desc'
                  ];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="code-asc">Code (A-Z)</option>
                <option value="code-desc">Code (Z-A)</option>
              </select>
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
          <div className="bg-white rounded border border-gray-200 p-8 text-center">
            <div className="inline-flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-gray-500">Loading laboratory boxes...</span>
            </div>
          </div>
        ) : currentLabBoxes.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center">
            <div className="text-xs text-gray-500">
              {searchTerm ? 'No laboratory boxes found matching your filters' : 'No laboratory boxes found'}
            </div>
          </div>
        ) : (
          <div>
            {renderTableView()}
            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  );
};

export default LaboratoryBoxManagement;
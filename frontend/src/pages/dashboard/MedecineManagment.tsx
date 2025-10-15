import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Grid3X3,
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
  Trash,
} from 'lucide-react';
import medicineService, { type Medicine, type CreateMedicineInput } from '../../services/medecineService';
import { useSocketEvent } from '../../context/SocketContext';
import useEmployeeAuth from '../../context/EmployeeAuthContext';

type ViewMode = 'table' | 'grid';

interface OperationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

const MedicineModal: React.FC<{
  isOpen: boolean;
  medicine: Medicine | null;
  onClose: () => void;
  onSave: (data: CreateMedicineInput) => Promise<void>;
  mode: 'create' | 'edit';
}> = ({ isOpen, medicine, onClose, onSave, mode }) => {
  const { user } = useEmployeeAuth();
  const [formData, setFormData] = useState<CreateMedicineInput>({
    name: '',
    description: '',
    dosageForm: 'TABLET',
    quantity: 1,
    unit: '',
    purchaseDate: undefined,
    expiryDate: undefined,
    pricePerUnit: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (mode === 'edit' && medicine) {
      setFormData({
        name: medicine.name,
        description: medicine.description || '',
        dosageForm: medicine.dosageForm,
        quantity: medicine.quantity,
        unit: medicine.unit,
        purchaseDate: medicine.purchaseDate,
        expiryDate: medicine.expiryDate,
        pricePerUnit: medicine.pricePerUnit,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        dosageForm: 'TABLET',
        quantity: 1,
        unit: '',
        purchaseDate: undefined,
        expiryDate: undefined,
        pricePerUnit: undefined,
      });
    }
    setValidationErrors([]);
  }, [mode, medicine, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = medicineService.validateMedicineData(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving medicine:', error);
      setValidationErrors(['Failed to save medicine']);
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
              {mode === 'create' ? 'Create Medicine' : 'Edit Medicine'}
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosage Form *
            </label>
            <select
              value={formData.dosageForm}
              onChange={(e) => setFormData({ ...formData, dosageForm: e.target.value as any })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="TABLET">Tablet</option>
              <option value="CAPSULE">Capsule</option>
              <option value="LIQUID">Liquid</option>
              <option value="POWDER">Powder</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                min="1"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                value={formData.purchaseDate ? new Date(formData.purchaseDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value ? new Date(e.target.value) : undefined })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiryDate ? new Date(formData.expiryDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value ? new Date(e.target.value) : undefined })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Per Unit
            </label>
            <input
              type="number"
              value={formData.pricePerUnit || ''}
              onChange={(e) => setFormData({ ...formData, pricePerUnit: parseFloat(e.target.value) || undefined })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              step="0.01"
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
              {loading ? 'Saving...' : mode === 'create' ? 'Create Medicine' : 'Update Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteMedicineModal: React.FC<{
  isOpen: boolean;
  medicine: Medicine | null;
  onClose: () => void;
  onDelete: (medicine: Medicine) => Promise<void>;
}> = ({ isOpen, medicine, onClose, onDelete }) => {
  if (!isOpen || !medicine) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Delete Medicine</h3>
            <p className="text-xs text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete the medicine "{medicine.name}"? This action will permanently remove it from the system.
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
            onClick={() => onDelete(medicine)}
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
  medicine: Medicine | null;
  onClose: () => void;
}> = ({ isOpen, medicine, onClose }) => {
  if (!isOpen || !medicine) return null;

  const formatDate = (date?: Date): string => {
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
            <h3 className="text-lg font-semibold text-gray-900">Medicine Details</h3>
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
            <p className="text-sm text-gray-900">{medicine.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <p className="text-sm text-gray-900">{medicine.description || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosage Form
            </label>
            <p className="text-sm text-gray-900">{medicine.dosageForm}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <p className="text-sm text-gray-900">{medicine.quantity}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <p className="text-sm text-gray-900">{medicine.unit}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Date
              </label>
              <p className="text-sm text-gray-900">{formatDate(medicine.purchaseDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiry Date
              </label>
              <p className="text-sm text-gray-900">{formatDate(medicine.expiryDate)}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Per Unit
              </label>
              <p className="text-sm text-gray-900">{medicine.pricePerUnit ? `$${medicine.pricePerUnit.toFixed(2)}` : 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Cost
              </label>
              <p className="text-sm text-gray-900">{medicine.totalCost ? `$${medicine.totalCost.toFixed(2)}` : 'N/A'}</p>
            </div>
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

const MedicineManagement: React.FC<{ role: string }> = ({ role }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dosageFormFilter, setDosageFormFilter] = useState('all');
  const [sortBy, setSortBy] = useState<keyof Medicine>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [rowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, dosageFormFilter, sortBy, sortOrder, allMedicines]);

  useSocketEvent('medicineCreated', (medicineData: Medicine) => {
    console.log('Medicine created via WebSocket:', medicineData);
    setAllMedicines((prevMedicines) => [...prevMedicines, medicineData]);
    showOperationStatus('success', `Medicine created`);
  });

  useSocketEvent('medicineUpdated', (medicineData: Medicine) => {
    console.log('Medicine updated via WebSocket:', medicineData);
    setAllMedicines((prevMedicines) =>
      prevMedicines.map((m) => (m.id === medicineData.id ? medicineData : m))
    );
    showOperationStatus('success', `Medicine updated`);
  });

  useSocketEvent('medicineDeleted', ({ id }: { id: string }) => {
    console.log('Medicine deleted via WebSocket:', id);
    setAllMedicines((prevMedicines) => prevMedicines.filter((m) => m.id !== id));
    showOperationStatus('success', 'Medicine deleted');
  });

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const data = await medicineService.getAllMedicines();
      setAllMedicines(data || []);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load medicines';
      console.error('Error fetching medicines:', err);
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
    let filtered = [...allMedicines];

    if (searchTerm.trim()) {
      filtered = filtered.filter((medicine) =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dosageFormFilter !== 'all') {
      filtered = filtered.filter((medicine) => medicine.dosageForm === dosageFormFilter);
    }

    filtered.sort((a, b) => {
      let aValue = a[sortBy] ?? '';
      let bValue = b[sortBy] ?? '';
      if (sortBy === 'createdAt' || sortBy === 'updatedAt' || sortBy === 'purchaseDate' || sortBy === 'expiryDate') {
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

    setMedicines(filtered);
    setCurrentPage(1);
  };

  const handleAddMedicine = () => {
    setSelectedMedicine(null);
    setModalMode('create');
    setIsMedicineModalOpen(true);
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setModalMode('edit');
    setIsMedicineModalOpen(true);
  };

  const handleViewDetails = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsDetailsModalOpen(true);
  };

  const handleSaveMedicine = async (data: CreateMedicineInput) => {
    try {
      setOperationLoading(true);
      if (modalMode === 'create') {
        await medicineService.createMedicine(data);
        showOperationStatus('success', 'Medicine created successfully');
      } else if (selectedMedicine) {
        await medicineService.updateMedicine(selectedMedicine.id, data);
        showOperationStatus('success', 'Medicine updated successfully');
      }
      await fetchMedicines();
    } catch (err: any) {
      showOperationStatus('error', err.message || 'Failed to save medicine');
      throw err;
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteMedicine = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async (medicine: Medicine) => {
    try {
      setOperationLoading(true);
      await medicineService.deleteMedicine(medicine.id);
      showOperationStatus('success', 'Medicine deleted successfully');
      await fetchMedicines();
    } catch (err: any) {
      showOperationStatus('error', err.message || 'Failed to delete medicine');
    } finally {
      setOperationLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedMedicine(null);
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

  const filteredMedicines = medicines;
  const totalPages = Math.ceil(filteredMedicines.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentMedicines = filteredMedicines.slice(startIndex, endIndex);

  const totalMedicines = allMedicines.length;
  const lowStockMedicines = allMedicines.filter((m) => m.quantity <= 10).length;

  const renderTableView = () => (
    <div className="bg-white rounded border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">Name</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">Dosage Form</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">Quantity</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Expiry</th>
              <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentMedicines.map((medicine, index) => (
              <tr key={medicine.id} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2">
                  <div className="text-xs font-medium text-gray-900">{medicine.name}</div>
                </td>
                <td className="py-2 px-2 text-gray-700">{medicine.dosageForm}</td>
                <td className="py-2 px-2 text-gray-700">{medicine.quantity} {medicine.unit}</td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">
                  {formatDate(medicine.expiryDate)}
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => handleViewDetails(medicine)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="View Details"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleEditMedicine(medicine)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteMedicine(medicine)}
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
          Showing {startIndex + 1}-{Math.min(endIndex, filteredMedicines.length)} of{' '}
          {filteredMedicines.length}
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
      <MedicineModal
        isOpen={isMedicineModalOpen}
        medicine={selectedMedicine}
        onClose={() => setIsMedicineModalOpen(false)}
        onSave={handleSaveMedicine}
        mode={modalMode}
      />
      <DeleteMedicineModal
        isOpen={isDeleteModalOpen}
        medicine={selectedMedicine}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
      />
      <DetailsModal
        isOpen={isDetailsModalOpen}
        medicine={selectedMedicine}
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
                Medicine Management
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage your medicine inventory
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchMedicines}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleAddMedicine}
                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
              >
                <Plus className="w-3 h-3" />
                <span>New Medicine</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 rounded-full">
                <Package className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Medicines</p>
                <p className="text-lg font-semibold text-gray-900">
                  {totalMedicines}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Low Stock</p>
                <p className="text-lg font-semibold text-gray-900">
                  {lowStockMedicines}
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
                  placeholder="Search medicines..."
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
                    keyof Medicine,
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
                <option value="quantity-asc">Quantity (Low-High)</option>
                <option value="quantity-desc">Quantity (High-Low)</option>
              </select>
              <div className="flex items-center border border-gray-200 rounded">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 text-xs ${
                    viewMode === 'table'
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 text-xs ${
                    viewMode === 'grid'
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid3X3 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <select
                  value={dosageFormFilter}
                  onChange={(e) => setDosageFormFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">All Dosage Forms</option>
                  <option value="TABLET">Tablet</option>
                  <option value="CAPSULE">Capsule</option>
                  <option value="LIQUID">Liquid</option>
                  <option value="POWDER">Powder</option>
                  <option value="OTHER">Other</option>
                </select>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setDosageFormFilter('all');
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
              <span className="text-xs text-gray-500">Loading medicines...</span>
            </div>
          </div>
        ) : currentMedicines.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center">
            <div className="text-xs text-gray-500">
              {searchTerm || dosageFormFilter !== 'all'
                ? 'No medicines found matching your filters'
                : 'No medicines found'}
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

export default MedicineManagement;
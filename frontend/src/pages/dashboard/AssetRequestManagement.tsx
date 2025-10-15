/* eslint-disable @typescript-eslint/no-explicit-any */
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

import assetRequestService, {
  type AssetRequest,
  type AssetRequestItem,
  type RequestStatus,
} from '../../services/assetRequestService';
import assetService, { type Asset } from '../../services/assetService';
import { useSocketEvent } from '../../context/SocketContext';
import useEmployeeAuth from '../../context/EmployeeAuthContext';

type ViewMode = 'table' | 'grid';

interface OperationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

const RequestModal: React.FC<{
  isOpen: boolean;
  request: AssetRequest | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  mode: 'create' | 'edit';
  assets: Asset[];
}> = ({ isOpen, request, onClose, onSave, mode, assets }) => {
  const { user } = useEmployeeAuth();
  const [formData, setFormData] = useState({
    employeeId: '',
    description: '',
    items: [{ assetId: '', quantity: 1 }],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && request) {
      setFormData({
        employeeId: request.employeeId,
        description: request.description || '',
        items: request.items?.map(item => ({
          assetId: item.assetId,
          quantity: item.quantity,
        })) || [{ assetId: '', quantity: 1 }],
      });
    } else {
      setFormData({
        employeeId: user?.id || '',
        description: '',
        items: [{ assetId: '', quantity: 1 }],
      });
    }
  }, [mode, request, isOpen, user]);

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { assetId: '', quantity: 1 }],
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving request:', error);
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
              {mode === 'create' ? 'Create Asset Request' : 'Edit Asset Request'}
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Items *
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium"
              >
                + Add Item
              </button>
            </div>
            <div className="space-y-2">
              {formData.items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={item.assetId}
                    onChange={(e) => handleItemChange(index, 'assetId', e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select Asset</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-24 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="1"
                    required
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
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
              {loading ? 'Saving...' : mode === 'create' ? 'Create Request' : 'Update Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteRequestModal: React.FC<{
  isOpen: boolean;
  request: AssetRequest | null;
  onClose: () => void;
  onDelete: (request: AssetRequest) => Promise<void>;
}> = ({ isOpen, request, onClose, onDelete }) => {
  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Delete Request</h3>
            <p className="text-xs text-gray-500">This action cannot be undone</p>
          </div>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete this asset request? This action will permanently remove it from the system.
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
            onClick={() => onDelete(request)}
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
  request: AssetRequest | null;
  onClose: () => void;
  assets: Asset[];
  getStatusColor: (status: RequestStatus) => string;
  formatDate: (date?: string) => string;
}> = ({ isOpen, request, onClose, assets, getStatusColor, formatDate }) => {
  if (!isOpen || !request) return null;

  const getAssetName = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? asset.name : 'Unknown Asset';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Request Details</h3>
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
              Employee
            </label>
            <p className="text-sm text-gray-900">
              {request.employee
                ? `${request.employee.first_name} ${request.employee.last_name}`
                : request.employeeId}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <p className="text-sm text-gray-900">{request.description || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created At
            </label>
            <p className="text-sm text-gray-900">{formatDate(request.createdAt)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Items
            </label>
            <div className="space-y-2">
              {request.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-900">{getAssetName(item.assetId)}</span>
                  <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                </div>
              ))}
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

const AssetRequestManagement: React.FC<{ role: string }> = ({ role }) => {
  const [requests, setRequests] = useState<AssetRequest[]>([]);
  const [allRequests, setAllRequests] = useState<AssetRequest[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<keyof AssetRequest>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [rowsPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedRequest, setSelectedRequest] = useState<AssetRequest | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    fetchRequests();
    fetchAssets();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, statusFilter, sortBy, sortOrder, allRequests]);

  useSocketEvent('requestCreated', (requestData: AssetRequest) => {
    console.log('Request created via WebSocket:', requestData);
    setAllRequests((prevRequests) => [...prevRequests, requestData]);
    showOperationStatus('success', `Request created`);
  });

  useSocketEvent('requestUpdated', (requestData: AssetRequest) => {
    console.log('Request updated via WebSocket:', requestData);
    setAllRequests((prevRequests) =>
      prevRequests.map((r) => (r.id === requestData.id ? requestData : r))
    );
    showOperationStatus('success', `Request updated`);
  });

  useSocketEvent('requestDeleted', ({ id }: { id: string }) => {
    console.log('Request deleted via WebSocket:', id);
    setAllRequests((prevRequests) => prevRequests.filter((r) => r.id !== id));
    showOperationStatus('success', 'Request deleted');
  });

  const fetchAssets = async () => {
    try {
      const data = await assetService.getAllAssets();
      setAssets(data || []);
    } catch (err: any) {
      console.error('Error fetching assets:', err);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await assetRequestService.getAllRequests();
      setAllRequests(data || []);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load requests';
      console.error('Error fetching requests:', err);
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
    let filtered = [...allRequests];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (request) =>
          request.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.employee?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.employee?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((request) => request.status === statusFilter);
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
        return sortOrder === 'asc'
          ? strA.localeCompare(strB)
          : strB.localeCompare(strA);
      }
    });

    setRequests(filtered);
    setCurrentPage(1);
  };

  const handleAddRequest = () => {
    setSelectedRequest(null);
    setModalMode('create');
    setIsRequestModalOpen(true);
  };

  const handleEditRequest = (request: AssetRequest) => {
    if (!assetRequestService.canModifyRequest(request)) {
      showOperationStatus('error', 'Only pending requests can be edited');
      return;
    }
    setSelectedRequest(request);
    setModalMode('edit');
    setIsRequestModalOpen(true);
  };

  const handleViewDetails = (request: AssetRequest) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  const handleSaveRequest = async (data: any) => {
    try {
      setOperationLoading(true);
      if (modalMode === 'create') {
        await assetRequestService.createRequest(data);
        showOperationStatus('success', 'Request created successfully');
      } else if (selectedRequest) {
        await assetRequestService.updateRequest(selectedRequest.id, data);
        showOperationStatus('success', 'Request updated successfully');
      }
      await fetchRequests();
    } catch (err: any) {
      showOperationStatus('error', err.message || 'Failed to save request');
      throw err;
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteRequest = (request: AssetRequest) => {
    if (!assetRequestService.canModifyRequest(request)) {
      showOperationStatus('error', 'Only pending requests can be deleted');
      return;
    }
    setSelectedRequest(request);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async (request: AssetRequest) => {
    try {
      setOperationLoading(true);
      await assetRequestService.deleteRequest(request.id);
      showOperationStatus('success', 'Request deleted successfully');
      await fetchRequests();
    } catch (err: any) {
      showOperationStatus('error', err.message || 'Failed to delete request');
    } finally {
      setOperationLoading(false);
      setIsDeleteModalOpen(false);
      setSelectedRequest(null);
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

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'ISSUED':
        return 'bg-blue-100 text-blue-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequests = requests;
  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  const totalRequests = allRequests.length;
  const pendingRequests = allRequests.filter((r) => r.status === 'PENDING').length;

  const renderTableView = () => (
    <div className="bg-white rounded border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">Employee</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">Items</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">Status</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Created</th>
              <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentRequests.map((request, index) => (
              <tr key={request.id} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2">
                  <div className="text-xs font-medium text-gray-900">
                    {request.employee
                      ? `${request.employee.first_name} ${request.employee.last_name}`
                      : request.employeeId}
                  </div>
                </td>
                <td className="py-2 px-2 text-gray-700">
                  {request.items?.length || 0} items
                </td>
                <td className="py-2 px-2">
                  <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">
                  {formatDate(request.createdAt)}
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => handleViewDetails(request)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="View Details"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    {assetRequestService.canModifyRequest(request) && (
                      <>
                        <button
                          onClick={() => handleEditRequest(request)}
                          className="text-gray-400 hover:text-primary-600 p-1"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteRequest(request)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
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
          Showing {startIndex + 1}-{Math.min(endIndex, filteredRequests.length)} of{' '}
          {filteredRequests.length}
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
      <RequestModal
        isOpen={isRequestModalOpen}
        request={selectedRequest}
        onClose={() => setIsRequestModalOpen(false)}
        onSave={handleSaveRequest}
        mode={modalMode}
        assets={assets}
      />
      <DeleteRequestModal
        isOpen={isDeleteModalOpen}
        request={selectedRequest}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
      />
      <DetailsModal
        isOpen={isDetailsModalOpen}
        request={selectedRequest}
        onClose={() => setIsDetailsModalOpen(false)}
        assets={assets}
        getStatusColor={getStatusColor}
        formatDate={formatDate}
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
                Asset Request Management
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage your asset requests
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchRequests}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleAddRequest}
                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
              >
                <Plus className="w-3 h-3" />
                <span>New Request</span>
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
                <p className="text-xs text-gray-600">Total Requests</p>
                <p className="text-lg font-semibold text-gray-900">
                  {totalRequests}
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
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-lg font-semibold text-gray-900">
                  {pendingRequests}
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
                  placeholder="Search requests..."
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
                    keyof AssetRequest,
                    'asc' | 'desc'
                  ];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="status-asc">Status (A-Z)</option>
                <option value="status-desc">Status (Z-A)</option>
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
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="ISSUED">Issued</option>
                  <option value="CLOSED">Closed</option>
                </select>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
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
              <span className="text-xs text-gray-500">Loading requests...</span>
            </div>
          </div>
        ) : currentRequests.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center">
            <div className="text-xs text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'No requests found matching your filters'
                : 'No requests found'}
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

export default AssetRequestManagement;
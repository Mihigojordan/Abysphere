
import React, { useState, useEffect } from 'react';
import { X, FileText, Package, Plus, Trash2, AlertCircle } from 'lucide-react';
import requestService, { type Request, type ApproveRequestInput } from '../../../services/stockRequestService';
import { type StockIn } from '../../../services/stockInService';

interface ApproveRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
  onApprove: (response: { success: boolean; data: { request: Request }; message: string }) => void;
  role: 'admin' | 'employee';
  stockins: StockIn[];
}

const ApproveRequisitionModal: React.FC<ApproveRequisitionModalProps> = ({ isOpen, onClose, request, onApprove, role, stockins }) => {
  // Restrict modal to admin role only
  if (role !== 'admin') {
    return null;
  }

  const [formData, setFormData] = useState<ApproveRequestInput>({
    comment: '',
    itemModifications: [],
    itemsToAdd: [],
    itemsToRemove: [],
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && request) {
      setFormData({
        comment: '',
        itemModifications: request.requestItems.map((item) => ({
          requestItemId: item.id,
          qtyApproved: item.qtyApproved ? Number(item.qtyApproved) : Number(item.qtyRequested),
          qtyRequested: Number(item.qtyRequested),
          stockInId: item.stockInId,
        })),
        itemsToAdd: [],
        itemsToRemove: [],
      });
      setErrors([]);
    }
  }, [isOpen, request]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        comment: '',
        itemModifications: [],
        itemsToAdd: [],
        itemsToRemove: [],
      });
      setErrors([]);
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    index?: number,
    type: 'itemModifications' | 'itemsToAdd' = 'itemModifications'
  ) => {
    const { name, value } = e.target;

    if (index !== undefined) {
      const field = name.split('.')[1];
      setFormData((prev) => {
        const newItems = [...prev[type]];
        newItems[index] = {
          ...newItems[index],
          [field]: field === 'qtyApproved' || field === 'qtyRequested' ? parseFloat(value) || 0 : value,
        };

        // Validate no duplicate stockInId
        const allStockInIds = [
          ...prev.itemModifications.map((item) => item.stockInId).filter(Boolean),
          ...prev.itemsToAdd.map((item) => item.stockInId).filter(Boolean),
        ] as string[];
        const selectedStockInId = value;
        if (field === 'stockInId' && selectedStockInId) {
          const isDuplicate = allStockInIds.filter((id, i) => i !== index || type !== 'itemModifications').includes(selectedStockInId);
          if (isDuplicate) {
            const selectedStockIn = stockins.find((s) => s.id === selectedStockInId);
            setErrors([`Cannot select the same stock item twice: ${selectedStockIn?.productName || 'Stock ID: ' + selectedStockInId}`]);
            return prev;
          }
        }

        return { ...prev, [type]: newItems };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const addNewItem = () => {
    setFormData((prev) => ({
      ...prev,
      itemsToAdd: [...prev.itemsToAdd, { stockInId: '', qtyRequested: 0, qtyApproved: 0 }],
    }));
  };

  const removeNewItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      itemsToAdd: prev.itemsToAdd.filter((_, i) => i !== index),
    }));
  };

  const toggleRemoveItem = (requestItemId: string) => {
    setFormData((prev) => {
      const itemsToRemove = prev.itemsToRemove.includes(requestItemId)
        ? prev.itemsToRemove.filter((id) => id !== requestItemId)
        : [...prev.itemsToRemove, requestItemId];
      return { ...prev, itemsToRemove };
    });
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const validationErrors: string[] = [];

    formData.itemModifications.forEach((item, index) => {
      if (!item.stockInId) {
        validationErrors.push(`Stock item is required for modified item ${index + 1}`);
      }
      if (item.qtyRequested === undefined || item.qtyRequested <= 0) {
        validationErrors.push(`Valid requested quantity is required for modified item ${index + 1}`);
      }
      if (item.qtyApproved === undefined || item.qtyApproved < 0) {
        validationErrors.push(`Valid approved quantity is required for modified item ${index + 1}`);
      }
    });

    formData.itemsToAdd.forEach((item, index) => {
      if (!item.stockInId) {
        validationErrors.push(`Stock item is required for new item ${index + 1}`);
      }
      if (item.qtyRequested <= 0) {
        validationErrors.push(`Valid quantity requested is required for new item ${index + 1}`);
      }
      if (item.qtyApproved === undefined || item.qtyApproved < 0) {
        validationErrors.push(`Valid approved quantity is required for new item ${index + 1}`);
      }
    });

    const allStockInIds = [
      ...formData.itemModifications.map((item) => item.stockInId).filter(Boolean),
      ...formData.itemsToAdd.map((item) => item.stockInId).filter(Boolean),
    ] as string[];
    const uniqueStockInIds = new Set(allStockInIds);
    if (uniqueStockInIds.size !== allStockInIds.length) {
      validationErrors.push('Duplicate stock items are not allowed');
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateForm();
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await requestService.approveRequest(request!.id, {
        comment: formData.comment,
        itemModifications: formData.itemModifications,
        itemsToAdd: formData.itemsToAdd,
        itemsToRemove: formData.itemsToRemove,
      });
      onApprove({ success: true, data: { request: response }, message: `Request #${response.ref_no} approved successfully` });
      setErrors([]);
      setFormData({
        comment: '',
        itemModifications: [],
        itemsToAdd: [],
        itemsToRemove: [],
      });
      onClose();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to approve requisition';
      console.error('Error in handleSubmit:', error);
      setErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto">
        <div className="bg-primary-500 rounded-t-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Approve Requisition #{request.ref_no}</h2>
              <p className="text-sm text-primary-100 mt-1">Approve requisition for {request.site?.name || 'N/A'}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-primary-100 hover:text-white rounded"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Notes</span>
            </label>
            <textarea
              name="notes"
              value={request.notes || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-sm"
              placeholder="Requisition notes"
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Package className="w-4 h-4 text-gray-400" />
              <span>Existing Items</span>
            </label>
            {formData.itemModifications.length === 0 ? (
              <p className="text-sm text-gray-500">No items available in this requisition.</p>
            ) : (
              formData.itemModifications.map((item, index) => (
                <div
                  key={item.requestItemId}
                  className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${
                    formData.itemsToRemove.includes(item.requestItemId) ? 'bg-red-200 border border-red-300' : ''
                  } p-4 rounded-lg items-end`}
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Stock Item</label>
                    <select
                      name="itemModifications.stockInId"
                      value={item.stockInId}
                      onChange={(e) => handleChange(e, index, 'itemModifications')}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                      <option value="">Select a stock item</option>
                      {stockins.map((stockIn) => (
                        <option key={stockIn.id} value={stockIn.id}>
                          {stockIn.productName} ({stockIn.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Quantity Requested</label>
                    <input
                      type="number"
                      name="itemModifications.qtyRequested"
                      value={item.qtyRequested}
                      onChange={(e) => handleChange(e, index, 'itemModifications')}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      min="0"
                      step="0.001"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Quantity Approved</label>
                    <input
                      type="number"
                      name="itemModifications.qtyApproved"
                      value={item.qtyApproved}
                      onChange={(e) => handleChange(e, index, 'itemModifications')}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      min="0"
                      step="0.001"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => toggleRemoveItem(item.requestItemId)}
                      className={`p-2 ${formData.itemsToRemove.includes(item.requestItemId) ? 'text-red-600' : 'text-gray-600'} hover:text-red-700`}
                      aria-label="Mark item for removal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Package className="w-4 h-4 text-gray-400" />
                <span>New Items</span>
              </label>
              <button
                type="button"
                onClick={addNewItem}
                className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Item</span>
              </button>
            </div>
            {formData.itemsToAdd.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Stock Item</label>
                  <select
                    name="itemsToAdd.stockInId"
                    value={item.stockInId}
                    onChange={(e) => handleChange(e, index, 'itemsToAdd')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="">Select a stock item</option>
                    {stockins.map((stockIn) => (
                      <option key={stockIn.id} value={stockIn.id}>
                        {stockIn.productName} ({stockIn.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Quantity Requested</label>
                  <input
                    type="number"
                    name="itemsToAdd.qtyRequested"
                    value={item.qtyRequested}
                    onChange={(e) => handleChange(e, index, 'itemsToAdd')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    min="0"
                    step="0.001"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Quantity Approved</label>
                  <input
                    type="number"
                    name="itemsToAdd.qtyApproved"
                    value={item.qtyApproved}
                    onChange={(e) => handleChange(e, index, 'itemsToAdd')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    min="0"
                    step="0.001"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeNewItem(index)}
                    className="p-2 text-red-600 hover:text-red-700"
                    aria-label="Remove new item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Comment (Optional)</span>
            </label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              placeholder="Enter any comments or reasons for your approval..."
              rows={3}
            />
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                </div>
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600">{error}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Approving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Approve Requisition</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApproveRequisitionModal;

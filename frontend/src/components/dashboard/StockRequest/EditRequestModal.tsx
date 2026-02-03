import React, { useState, useEffect } from 'react';
import { X, FileText, Package, Plus, Trash2 } from 'lucide-react';
import requestService, { type UpdateRequestInput, type Request } from '../../../services/stockRequestService';
import stockService, { type StockIn } from '../../../services/stockInService';
import siteService, { type Site } from '../../../services/siteService';

interface EditRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
  onSave: (data: UpdateRequestInput) => Promise<void>;
}

interface Item {
  id?: string;
  stockInId: string;
  qtyRequested: number;
  qtyApproved?: number;
  isNew?: boolean; // Track new items
  isRemoved?: boolean; // Track items to be removed
}

const EditRequestModal: React.FC<EditRequestModalProps> = ({ isOpen, onClose, request, onSave }) => {
  const [formData, setFormData] = useState<UpdateRequestInput>({
    siteId: '',
    notes: '',
    items: [{ stockInId: '', qtyRequested: 0 }],
    modificationReason: '',
  });
  const [sites, setSites] = useState<Site[]>([]);
  const [stockins, setStockins] = useState<StockIn[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSites, setIsLoadingSites] = useState(false);
  const [isLoadingStockIns, setIsLoadingStockIns] = useState(false);

  // Load sites and stock items when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSites();
      loadStockIns();
    }
  }, [isOpen]);

  // Update form data when request changes
  useEffect(() => {
    if (request) {
      setFormData({
        siteId: request.siteId || '',
        notes: request.notes || '',
        items: Array.isArray(request.requestItems) && request.requestItems.length > 0
          ? request.requestItems.map(item => ({
              id: item.id,
              stockInId: item.stockInId || '',
              qtyRequested: item.qtyRequested,
              qtyApproved: item.qtyApproved,
              isNew: false,
              isRemoved: false,
            }))
          : [{ stockInId: '', qtyRequested: 0, isNew: true }],
        modificationReason: '',
      });
      setErrors([]);
    }
  }, [request, isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        siteId: '',
        notes: '',
        items: [{ stockInId: '', qtyRequested: 0, isNew: true }],
        modificationReason: '',
      });
      setErrors([]);
    }
  }, [isOpen]);

  const loadSites = async () => {
    setIsLoadingSites(true);
    try {
      const sites = await siteService.getAllSites();
      setSites(sites);
    } catch (error: any) {
      console.error('Error loading sites:', error);
      setErrors([error.message || 'Failed to load sites']);
    } finally {
      setIsLoadingSites(false);
    }
  };

  const loadStockIns = async () => {
    setIsLoadingStockIns(true);
    try {
      const stockinsData = await stockService.getAllStockIns();
      setStockins(stockinsData);
    } catch (error: any) {
      console.error('Error loading stock items:', error);
      setErrors([error.message || 'Failed to load stock items']);
    } finally {
      setIsLoadingStockIns(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    index?: number
  ) => {
    try {
      const { name, value } = e.target;

      if (index !== undefined && name.startsWith('items.')) {
        const field = name.split('.')[1];

        // Prevent duplicate stock item selection
        if (field === 'stockInId') {
          const selectedStockInId = value;
          const isDuplicate = formData.items.some(
            (item, i) => i !== index && item.stockInId === selectedStockInId && !item.isRemoved
          );

          if (isDuplicate) {
            const selectedStockIn = stockins.find(s => s.id === selectedStockInId);
            const stockInLabel = selectedStockIn
              ? `${selectedStockIn.productName}${selectedStockIn.sku ? ` (${selectedStockIn.sku})` : ''}`
              : `Stock Item ID: ${selectedStockInId}`;
            setErrors([`You cannot select the same stock item twice: ${stockInLabel}.`]);
            return;
          }
        }

        setFormData((prev) => {
          const newItems = [...prev.items];
          newItems[index] = {
            ...newItems[index],
            [field]: field === 'qtyRequested' ? parseFloat(value) || 0 : value,
          };
          return { ...prev, items: newItems };
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: name === 'siteId' ? value : value,
        }));
      }

      if (errors.length > 0) {
        setErrors([]);
      }
    } catch (error) {
      console.error('Error handling form change:', error);
    }
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { stockInId: '', qtyRequested: 0, isNew: true }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => {
      const newItems = [...prev.items];
      if (newItems[index].id) {
        // Mark existing item for removal
        newItems[index] = { ...newItems[index], isRemoved: true };
      } else {
        // Remove new items directly
        newItems.splice(index, 1);
      }
      return { ...prev, items: newItems };
    });
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const validationErrors: string[] = [];

    if (!formData.siteId || formData.siteId === '') {
      validationErrors.push('Site is required');
    }

    if (!formData.notes || !formData.notes.trim()) {
      validationErrors.push('Notes are required');
    }

    if (!formData.modificationReason || !formData.modificationReason.trim()) {
      validationErrors.push('Modification reason is required');
    }

    const activeItems = formData.items.filter(item => !item.isRemoved);
    if (activeItems.length === 0) {
      validationErrors.push('At least one stock item is required');
    }

    activeItems.forEach((item, index) => {
      if (!item.stockInId) {
        validationErrors.push(`Stock item is required for item ${index + 1}`);
      }
      if (!item.qtyRequested || item.qtyRequested <= 0) {
        validationErrors.push(`Valid quantity is required for item ${index + 1}`);
      }
    });

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
      // Prepare data according to modifyAndApproveRequest structure
      const updateData: UpdateRequestInput = {
        notes: formData.notes,
        modificationReason: formData.modificationReason,
        itemModifications: formData.items
          .filter(item => item.id && !item.isNew && !item.isRemoved)
          .map(item => ({
            requestItemId: item.id!,
            stockInId: item.stockInId,
            qtyRequested: item.qtyRequested,
          })),
        itemsToAdd: formData.items
          .filter(item => item.isNew && !item.isRemoved)
          .map(item => ({
            stockInId: item.stockInId,
            qtyRequested: item.qtyRequested,
          })),
        itemsToRemove: formData.items
          .filter(item => item.isRemoved && item.id)
          .map(item => item.id!),
      };

      await onSave(updateData);
      setErrors([]);
      setFormData({
        siteId: '',
        notes: '',
        items: [{ stockInId: '', qtyRequested: 0, isNew: true }],
        modificationReason: '',
      });
      onClose();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update request';
      console.error('Error in handleSubmit:', error);
      setErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-primary-500 rounded-t-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Edit Stock Request</h2>
              <p className="text-sm text-primary-100 mt-1">Update stock request details</p>
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
              <span>Site <span className="text-red-500">*</span></span>
            </label>
            <select
              name="siteId"
              value={formData.siteId}
              onChange={handleChange}
              disabled={isLoadingSites || request.status !== 'PENDING'}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {isLoadingSites ? 'Loading sites...' : 'Select a site'}
              </option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name} {site.code ? `(${site.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Notes <span className="text-red-500">*</span></span>
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              placeholder="Enter request notes"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Modification Reason <span className="text-red-500">*</span></span>
            </label>
            <textarea
              name="modificationReason"
              value={formData.modificationReason}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              placeholder="Enter reason for modification"
              rows={2}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Package className="w-4 h-4 text-gray-400" />
                <span>Stock Items <span className="text-red-500">*</span></span>
              </label>
              <button
                type="button"
                onClick={addItem}
                disabled={request.status !== 'PENDING'}
                className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            {formData.items
              .map((item, index) => ({ item, index }))
              .filter(({ item }) => !item.isRemoved)
              .map(({ item, index }) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Stock Item</label>
                    <select
                      name={`items.stockInId`}
                      value={item.stockInId}
                      onChange={(e) => handleChange(e, index)}
                      disabled={isLoadingStockIns || request.status !== 'PENDING'}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {isLoadingStockIns ? 'Loading stock items...' : 'Select a stock item'}
                      </option>
                      {stockins.map((stockIn) => (
                        <option key={stockIn.id} value={stockIn.id}>
                          {stockIn.productName} {stockIn.sku ? `(${stockIn.sku})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Quantity</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        name={`items.qtyRequested`}
                        value={item.qtyRequested}
                        onChange={(e) => handleChange(e, index)}
                        disabled={request.status !== 'PENDING'}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Enter quantity"
                        min="0"
                        step="0.01"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.filter(i => !i.isRemoved).length <= 1 || request.status !== 'PENDING'}
                        className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <X className="w-3 h-3 text-red-600" />
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
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingSites || isLoadingStockIns || request.status !== 'PENDING'}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Update Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRequestModal;
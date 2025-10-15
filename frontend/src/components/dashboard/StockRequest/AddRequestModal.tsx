// AddRequestModal.tsx
import React, { useState, useEffect } from 'react';
import { X, FileText, Package, Plus, Trash2 } from 'lucide-react';
import requestService, { type CreateRequestInput } from '../../../services/stockRequestService';
import stockService, { type StockIn } from '../../../services/stockInService';
import siteService, { type Site } from '../../../services/siteService';
// import siteAssignmentService from '../../../services/';
import Swal from 'sweetalert2';
import useEmployeeAuth from '../../../context/EmployeeAuthContext';

interface AddRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateRequestInput) => Promise<void>;
}

interface Item {
  stockInId: string;
  qtyRequested: number;
}

const AddRequestModal = ({ isOpen, onClose, onSave }: AddRequestModalProps) => {
  const [formData, setFormData] = useState<CreateRequestInput>({
    siteId: 0,
    notes: '',
    items: [{ stockInId: '', qtyRequested: 0 }],
  });
  const [sites, setSites] = useState<Site[]>([]);
  const [stockins, setStockins] = useState<StockIn[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSites, setIsLoadingSites] = useState(false);
  const [isLoadingStockIns, setIsLoadingStockIns] = useState(false);
  const {user} = useEmployeeAuth()

  // Load sites and stock items when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSites();
      loadStockIns();
    }
  }, [isOpen]);

  const loadSites = async () => {
    setIsLoadingSites(true);
    try {
      const sites = await siteService.getAllSites();
      console.warn(sites);
      
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
        if (field === "stockInId") {
          const selectedStockInId = value;
          const isDuplicate = formData.items.some(
            (item, i) => i !== index && item.stockInId === selectedStockInId
          );

          if (isDuplicate) {
            const selectedStockIn = stockins.find(s => s.id === selectedStockInId);
            const stockInLabel = selectedStockIn
              ? `${selectedStockIn.productName}${selectedStockIn.sku ? ` (${selectedStockIn.sku})` : ""}`
              : `Stock Item ID: ${selectedStockInId}`;

            setErrors([
              `You cannot select the same stock item twice: ${stockInLabel}.`,
            ]);
            return; // stop updating state
          }
        }

        setFormData((prev) => {
          const newItems = [...prev.items];
          newItems[index] = {
            ...newItems[index],
            [field]: field === "qtyRequested"
              ? parseFloat(value) 
              : value
          };
          return { ...prev, items: newItems };
        });
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: name === "siteId" ? value : value,
        }));
      }

      if (errors.length > 0) {
        setErrors([]);
      }
    } catch (error) {
      console.error("Error handling form change:", error);
    }
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { stockInId: '', qtyRequested: 0 }],
    }));
  };

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const validationErrors: string[] = [];

    if (!formData.siteId || formData.siteId === 0) {
      validationErrors.push('Site is required');
    }

    if (formData.notes && !formData.notes.trim()) {
      validationErrors.push('Notes cannot be empty if provided');
    }

    formData.items.forEach((item, index) => {
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

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        siteId: 0,
        notes: '',
        items: [{ stockInId: '', qtyRequested: 0 }],
      });
      setErrors([]);
    }
  }, [isOpen]);

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
      await onSave({...formData,requestedByEmployeeId:user?.id || undefined});
      setErrors([]);
      setFormData({
        siteId: 0,
        notes: '',
        items: [{ stockInId: '', qtyRequested: 0 }],
      });
      onClose();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create request';
      console.error('Error in handleSubmit:', error);
      setErrors([errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-primary-500 rounded-t-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Create Stock Request</h2>
              <p className="text-sm text-primary-100 mt-1">Request stock items for a site</p>
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
              disabled={isLoadingSites}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value={0}>
                {isLoadingSites ? 'Loading sites...' : 'Select a site'}
              </option>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}  {site.code ? `(${site.code})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Notes (Optional)</span>
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Package className="w-4 h-4 text-gray-400" />
                <span>Stock Items <span className="text-red-500">*</span></span>
              </label>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Item</span>
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Stock Item</label>
                  <select
                    name={`items.stockInId`}
                    value={item.stockInId}
                    onChange={(e) => handleChange(e, index)}
                    disabled={isLoadingStockIns}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {isLoadingStockIns ? 'Loading stock items...' : 'Select a stock item'}
                    </option>
                    {stockins.map((stockIn) => (
                      <option key={stockIn.id} value={stockIn.id}>
                        {stockIn.productName} {stockIn.sku ? `(${stockIn.sku})` : ''} - {stockIn.quantity} {stockIn.unit} available
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Quantity Requested</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      name={`items.qtyRequested`}
                      value={item.qtyRequested}
                      onChange={(e) => handleChange(e, index)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      placeholder="Enter quantity requested"
                      min="0"
                      step="0.01"
                    />
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-600 hover:text-red-700"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
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
              disabled={isSubmitting || isLoadingSites || isLoadingStockIns}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Request</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRequestModal;
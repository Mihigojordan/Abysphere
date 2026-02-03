/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Check, X, Package, Scale, DollarSign } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import stockService, { type StockIn, type CreateStockInInput, type UpdateStockInInput, type StockCategory } from '../../../services/stockInService';
import storeService, { type Store } from '../../../services/storeService';
import Swal from 'sweetalert2';

interface StockInFormData {
  productName: string;
  quantity: number | '';
  unit: 'PCS' | 'KG' | 'LITERS' | 'METER' | 'BOX' | 'PACK' | 'OTHER' | '';
  unitPrice: number | '';
  reorderLevel: number | '';
  supplier: string;
  location: string;
  description: string;
  stockcategoryId: string;
  storeId: string;
}

interface Errors {
  [key: string]: string | null;
}

const StockInForm: React.FC<{ role: string }> = ({ role }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<StockCategory[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [formData, setFormData] = useState<StockInFormData>({
    productName: '',
    quantity: '',
    unit: '',
    unitPrice: '',
    reorderLevel: '',
    supplier: '',
    location: '',
    description: '',
    stockcategoryId: '',
    storeId: '',
  });
  const navigate = useNavigate();
  const { id: stockInId } = useParams<{ id?: string }>();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch categories and stores
        const [catData, storeData] = await Promise.all([
          stockService.getAllCategories(),
          storeService.getAllStores()
        ]);
        setCategories(catData || []);
        setStores(storeData.stores || []);

        if (stockInId) {
          const stockIn = await stockService.getStockInById(stockInId);
          if (stockIn) {
            setFormData({
              productName: stockIn.productName || '',
              quantity: stockIn.quantity || '',
              unit: stockIn.unit || '',
              unitPrice: stockIn.unitPrice || '',
              reorderLevel: stockIn.reorderLevel || '',
              supplier: stockIn.supplier || '',
              location: stockIn.location || '',
              description: stockIn.description || '',
              stockcategoryId: stockIn.stockcategoryId || '',
              storeId: stockIn.storeId || '',
            });
          } else {
            throw new Error('Stock item not found');
          }
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to load data',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [stockInId]);

  const handleInputChange = (field: keyof StockInFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
    if (!formData.stockcategoryId) newErrors.stockcategoryId = 'Category is required';
    if (!formData.storeId) newErrors.storeId = 'Store is required';
    if (formData.quantity === '' || Number(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (!['PCS', 'KG', 'LITERS', 'METER', 'BOX', 'PACK', 'OTHER'].includes(formData.unit)) {
      newErrors.unit = 'Unit is required';
    }
    if (formData.unitPrice === '' || Number(formData.unitPrice) <= 0) {
      newErrors.unitPrice = 'Unit price must be greater than 0';
    }
    if (formData.reorderLevel !== '' && Number(formData.reorderLevel) < 0) {
      newErrors.reorderLevel = 'Reorder level cannot be negative';
    }
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please correct the errors in the form',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const stockInData: CreateStockInInput | UpdateStockInInput = {
        productName: formData.productName,
        quantity: Number(formData.quantity),
        unit: formData.unit as 'PCS' | 'KG' | 'LITERS' | 'METER' | 'BOX' | 'PACK' | 'OTHER',
        unitPrice: Number(formData.unitPrice),
        reorderLevel: formData.reorderLevel ? Number(formData.reorderLevel) : undefined,
        supplier: formData.supplier || undefined,
        location: formData.location || undefined,
        description: formData.description || undefined,
        stockcategoryId: formData.stockcategoryId,
        storeId: formData.storeId,
      };

      let response: StockIn;
      if (stockInId) {
        response = await stockService.updateStockIn(stockInId, stockInData);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Stock item "${response.productName}" updated successfully`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
      } else {
        response = await stockService.createStockIn(stockInData);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Stock item "${response.productName}" created successfully`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
      }

      navigate(`/${role}/dashboard/stock-management`);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to save stock item',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/${role}/dashboard/stock-management`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-xs">{stockInId ? 'Loading stock item...' : 'Preparing form...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-600 px-6 py-4">
            <h1 className="text-lg font-semibold text-white">
              {stockInId ? 'Update Stock Item' : 'Add New Stock Item'}
            </h1>
            <p className="text-primary-100 text-xs mt-1">
              Fill in the details to {stockInId ? 'update' : 'create'} your stock item
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Package className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">Stock Item Information</h2>
            </div>
            <p className="text-xs text-gray-500">Enter the details for your stock item</p>
          </div>

          <div className="p-4 space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => handleInputChange('productName', e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter product name"
              />
              {errors.productName && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.productName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.stockcategoryId}
                  onChange={(e) => handleInputChange('stockcategoryId', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.stockcategoryId && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.stockcategoryId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Store <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.storeId}
                  onChange={(e) => handleInputChange('storeId', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select store</option>
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>{store.name}</option>
                  ))}
                </select>
                {errors.storeId && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.storeId}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value as StockInFormData['unit'])}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select unit</option>
                  <option value="PCS">Pieces (PCS)</option>
                  <option value="KG">Kilograms (KG)</option>
                  <option value="LITERS">Liters (LITERS)</option>
                  <option value="METER">Meters (METER)</option>
                  <option value="BOX">Boxes (BOX)</option>
                  <option value="PACK">Packs (PACK)</option>
                  <option value="OTHER">Other (OTHER)</option>
                </select>
                {errors.unit && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.unit}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter quantity"
                  min="0"
                />
                {errors.quantity && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.quantity}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Unit Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.unitPrice}
                  onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter unit price"
                  min="0"
                  step="0.01"
                />
                {errors.unitPrice && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.unitPrice}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Reorder Level (Optional)
                </label>
                <input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => handleInputChange('reorderLevel', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter reorder level"
                  min="0"
                />
                {errors.reorderLevel && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.reorderLevel}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Supplier (Optional)
                </label>
                <input
                  type="text"
                  value={formData.supplier}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter supplier"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Location (Optional)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter location"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Description (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Enter description (max 1000 characters)"
                maxLength={1000}
              />
              {errors.description && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.description}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/1000 characters
              </p>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-6 py-2.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                <Check className="h-4 w-4" />
                <span>{stockInId ? 'Update Stock Item' : 'Create Stock Item'}</span>
              </button>
            </div>
          </div>

          {errors.general && (
            <div className="mx-6 mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600 flex items-center gap-2">
                <X className="h-4 w-4" />
                {errors.general}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockInForm;
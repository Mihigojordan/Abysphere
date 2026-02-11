/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from 'react';
import { Check, X, Package, Search, ChevronDown, Plus } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import categoryService, { type Category } from '../../services/categoryService';
import supplierService, { type Supplier } from '../../services/supplierService';
import stockService, { type Stock, type StockData } from '../../services/stockService'; // Assume exists

interface StockInFormData {
  sku: string;
  itemName: string;
  categoryId: string;
  supplierId: string | null;
  supplierName: string; // For manual entry
  unitOfMeasure: string;
  receivedQuantity: string;
  unitCost: string;
  warehouseLocation: string;
  receivedDate: string;
  reorderLevel: string;
  expiryDate: string;
  description?: string | null;
  adminId: string;
}

interface Errors {
  [key: string]: string | null;
}

// Generate SKU: STK-XXXX
const generateSKU = (): string => {
  const uuid = uuidv4().replace(/-/g, '');
  const hash = uuid.slice(0, 4).toUpperCase();
  return `STK-${hash}`;
};

// Searchable Select for Category
const SearchableCategorySelect: React.FC<{
  categories: Category[];
  selectedId: string;
  onChange: (id: string) => void;
  error?: string | null;
}> = ({ categories, selectedId, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState<Category[]>(categories);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = categories.find(c => c.id === selectedId);

  useEffect(() => {
    setFiltered(categories);
  }, [categories]);

  useEffect(() => {
    const filteredList = categories.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFiltered(filteredList);
  }, [searchTerm, categories]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={toggle}
        className={`w-full px-3 py-2.5 text-xs border rounded-lg cursor-pointer transition-colors ${error ? 'border-red-300' : 'border-gray-200'
          } ${isOpen ? 'ring-2 ring-primary-500 border-transparent' : 'hover:border-gray-300'} bg-white`}
      >
        <div className="flex items-center justify-between">
          <span className={selected ? 'text-gray-900' : 'text-gray-500'}>
            {selected ? selected.name : 'Select category'}
          </span>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-500">No categories found</div>
            ) : (
              filtered.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => {
                    onChange(cat.id!);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`px-3 py-2 hover:bg-gray-50 cursor-pointer text-xs ${cat.id === selectedId ? 'bg-primary-50 text-primary-900' : ''
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{cat.name}</span>
                    {cat.id === selectedId && <Check className="h-3 w-3 text-primary-600" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Supplier Select with Dual Mode
const SearchableSupplierSelect: React.FC<{
  suppliers: Supplier[];
  selectedId: string | null;
  selectedName: string;
  onChange: (id: string | null, name: string) => void;
  isManual: boolean;
  onToggleManual: (manual: boolean) => void;
  error?: string | null;
}> = ({ suppliers, selectedId, selectedName, onChange, isManual, onToggleManual, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtered, setFiltered] = useState<Supplier[]>(suppliers);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = suppliers.find(s => s.id?.toString() === selectedId);

  useEffect(() => setFiltered(suppliers), [suppliers]);
  useEffect(() => {
    const list = suppliers.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFiltered(list);
  }, [searchTerm, suppliers]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onToggleManual(false)}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${!isManual
            ? 'bg-primary-100 text-primary-700 border border-primary-300'
            : 'bg-white text-gray-600 border border-gray-300'
            }`}
        >
          Select Existing
        </button>
        <button
          type="button"
          onClick={() => onToggleManual(true)}
          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${isManual
            ? 'bg-primary-100 text-primary-700 border border-primary-300'
            : 'bg-white text-gray-600 border border-gray-300'
            }`}
        >
          <Plus className="h-3 w-3" />
          New Supplier
        </button>
      </div>

      {isManual ? (
        <input
          type="text"
          value={selectedName}
          onChange={(e) => onChange(null, e.target.value)}
          placeholder="Enter supplier name"
          className={`w-full px-3 py-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${error ? 'border-red-300' : 'border-gray-200'
            }`}
        />
      ) : (
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={toggle}
            className={`w-full px-3 py-2.5 text-xs border rounded-lg cursor-pointer transition-colors ${error ? 'border-red-300' : 'border-gray-200'
              } ${isOpen ? 'ring-2 ring-primary-500 border-transparent' : 'hover:border-gray-300'} bg-white`}
          >
            <div className="flex items-center justify-between">
              <span className={selected ? 'text-gray-900' : 'text-gray-500'}>
                {selected ? selected.name : 'Select supplier'}
              </span>
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden">
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-7 pr-3 py-1.5 text-xs border rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filtered.length === 0 ? (
                  <div className="px-3 py-4 text-center text-xs text-gray-500">No suppliers</div>
                ) : (
                  filtered.map((sup) => (
                    <div
                      key={sup.id}
                      onClick={() => {
                        onChange(sup.id!.toString(), sup.name);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      className={`px-3 py-2 hover:bg-gray-50 cursor-pointer text-xs ${sup.id?.toString() === selectedId ? 'bg-primary-50 text-primary-900' : ''
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{sup.name}</span>
                        {sup.id?.toString() === selectedId && <Check className="h-3 w-3 text-primary-600" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StockInForm: React.FC<{
  stockId?: string;
  onSuccess?: (response: any) => void;
  onCancel?: () => void;
}> = ({ stockId, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isManualSupplier, setIsManualSupplier] = useState(false);

  const [formData, setFormData] = useState<StockInFormData>({
    sku: '',
    itemName: '',
    categoryId: '',
    supplierId: null,
    supplierName: '',
    unitOfMeasure: '',
    receivedQuantity: '',
    unitCost: '',
    warehouseLocation: '',
    receivedDate: new Date().toISOString().split('T')[0],
    reorderLevel: '',
    expiryDate: '',
    description: '',
    adminId: '', // Will be set from auth
  });


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [catData, supData] = await Promise.all([
          categoryService.getAllCategories(),
          supplierService.getAllSuppliers(),
        ]);
        setCategories(catData);
        setSuppliers(supData);

        if (stockId) {
          const stock = await stockService.getStockById(stockId);
          setFormData({
            sku: stock.sku,
            itemName: stock.itemName,
            categoryId: stock.categoryId || '',
            supplierId: null,
            supplierName: stock.supplier || '',
            unitOfMeasure: stock.unitOfMeasure,
            receivedQuantity: stock.receivedQuantity.toString(),
            unitCost: stock.unitCost.toString(),
            warehouseLocation: stock.warehouseLocation,
            receivedDate: new Date(stock.receivedDate).toISOString().split('T')[0],
            reorderLevel: stock.reorderLevel.toString(),
            expiryDate: stock.expiryDate ? new Date(stock.expiryDate).toISOString().split('T')[0] : '',
            description: stock.description || '',
            adminId: stock.adminId,
          });
          setIsManualSupplier(!stock.categoryId);
        } else {
          setFormData(prev => ({ ...prev, sku: generateSKU() }));
        }
      } catch (err: any) {
        setErrors({ general: err.message || 'Failed to load data' });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [stockId]);

  const handleChange = (field: keyof StockInFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const calculateTotal = () => {
    const qty = parseFloat(formData.receivedQuantity) || 0;
    const cost = parseFloat(formData.unitCost) || 0;
    return (qty * cost).toFixed(2);
  };

  const validate = (): boolean => {
    const err: Errors = {};

    if (!formData.itemName.trim()) err.itemName = 'Item name is required';
    if (!formData.categoryId) err.categoryId = 'Category is required';

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const payload: StockData = {
        sku: formData.sku,
        itemName: formData.itemName,
        categoryId: formData.categoryId,
        supplier: formData.supplierName,
        unitOfMeasure: formData.unitOfMeasure,
        receivedQuantity: parseInt(formData.receivedQuantity),
        unitCost: parseFloat(formData.unitCost),
        totalValue: parseFloat(calculateTotal()),
        warehouseLocation: formData.warehouseLocation,
        receivedDate: formData.receivedDate ? new Date(formData.receivedDate) : undefined as any,
        reorderLevel: parseInt(formData.reorderLevel) || 0,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
        description: formData.description || undefined,
        adminId: formData.adminId || 'current-admin-id', // Replace with auth
      };

      let result: Stock;
      if (stockId) {
        result = await stockService.updateStock(stockId, payload);
      } else {
        result = await stockService.createStock(payload);
      }

      onSuccess?.(result);
    } catch (err: any) {
      setErrors({ general: err.message || 'Failed to save stock-in' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">{stockId ? 'Loading...' : 'Preparing form...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-6">
      <div className="mx-auto px-4 max-w-5xl">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">
              {stockId ? 'Update Stock-In' : 'Record New Stock-In'}
            </h1>
            <p className="text-primary-100 text-xs mt-1">
              Enter received stock details
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Package className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">Stock-In Details</h2>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  disabled
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) => handleChange('itemName', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Wireless Mouse"
                />
                {errors.itemName && <ErrorMsg msg={errors.itemName} />}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <SearchableCategorySelect
                  categories={categories}
                  selectedId={formData.categoryId}
                  onChange={(id) => handleChange('categoryId', id)}
                  error={errors.categoryId}
                />
                {errors.categoryId && <ErrorMsg msg={errors.categoryId} />}
              </div>
            </div>

            {/* Supplier Dual Mode */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Supplier <span className="text-red-500">*</span>
              </label>
              <SearchableSupplierSelect
                suppliers={suppliers}
                selectedId={formData.supplierId}
                selectedName={formData.supplierName}
                onChange={(id, name) => {
                  setFormData(prev => ({ ...prev, supplierId: id, supplierName: name }));
                  if (errors.supplierName) setErrors(prev => ({ ...prev, supplierName: null }));
                }}
                isManual={isManualSupplier}
                onToggleManual={setIsManualSupplier}
                error={errors.supplierName}
              />
              {errors.supplierName && <ErrorMsg msg={errors.supplierName} />}
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Unit of Measure <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.unitOfMeasure}
                  onChange={(e) => handleChange('unitOfMeasure', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select unit</option>
                  <option value="PCS">Pieces (PCS)</option>
                  <option value="BOX">Box</option>
                  <option value="KG">Kilogram (KG)</option>
                  <option value="LITERS">Liter</option>
                  <option value="METER">Meter</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.unitOfMeasure && <ErrorMsg msg={errors.unitOfMeasure} />}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Received Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.receivedQuantity}
                  onChange={(e) => handleChange('receivedQuantity', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 100"
                />
                {errors.receivedQuantity && <ErrorMsg msg={errors.receivedQuantity} />}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Unit Cost (Rwf)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(e) => handleChange('unitCost', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 12.50"
                />
                {errors.unitCost && <ErrorMsg msg={errors.unitCost} />}
              </div>
            </div>

            {/* Total Value */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-primary-900">Total Value</span>
                <span className="text-lg font-bold text-primary-700">Rwf {Number(calculateTotal()).toLocaleString()}</span>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Warehouse Location
                </label>
                <input
                  type="text"
                  value={formData.warehouseLocation}
                  onChange={(e) => handleChange('warehouseLocation', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., Shelf A-12"
                />
                {errors.warehouseLocation && <ErrorMsg msg={errors.warehouseLocation} />}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Received Date
                </label>
                <input
                  type="date"
                  value={formData.receivedDate}
                  onChange={(e) => handleChange('receivedDate', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                {errors.receivedDate && <ErrorMsg msg={errors.receivedDate} />}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Reorder Level
                </label>
                <input
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => handleChange('reorderLevel', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 20"
                />
                {errors.reorderLevel && <ErrorMsg msg={errors.reorderLevel} />}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => handleChange('expiryDate', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Description (Optional)
              </label>
              <ReactQuill
                value={formData.description || ''}
                onChange={(v) => handleChange('description', v)}
                theme="snow"
                className="text-sm"
                modules={{ toolbar: [['bold', 'italic'], ['link']] }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t rounded-b-xl">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2.5 text-xs font-medium text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-medium bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
              >
                <Check className="h-4 w-4" />
                {stockId ? 'Update Stock-In' : 'Record Stock-In'}
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

// Helper
const ErrorMsg: React.FC<{ msg: string }> = ({ msg }) => (
  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
    <X className="h-3 w-3" />
    {msg}
  </p>
);

// Example Wrapper
const StockInFormExample: React.FC<{ role: string }> = ({ role }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate(`/${role}/dashboard/stockin-management`);
  };

  const handleCancel = () => {
    navigate(`/${role}/dashboard/stockin-management`);
  };

  return (
    <StockInForm
      stockId={id}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
};

export default StockInFormExample;
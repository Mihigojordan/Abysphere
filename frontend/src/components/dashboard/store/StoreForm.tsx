/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from 'react';
import { Check, X, Store, Search, ChevronDown, User } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import storeService, { type Store as StoreType, type StoreData } from '../../../services/storeService';
import employeeService, { type Employee } from '../../../services/employeeService';

interface StoreFormData {
  code: string;
  name: string;
  location: string;
  description?: string | null;
  managerId: string;
  contact_phone: string;
  contact_email?: string | null;
}

interface Errors {
  [key: string]: string | null;
}

// Utility function to generate a 4-character hash from a UUID
const generateStoreCode = (): string => {
  const uuid = uuidv4().replace(/-/g, '');
  const hash = uuid.slice(0, 4).toUpperCase();
  return `STR-${hash}`;
};

// Custom SearchableSelect Component
const SearchableManagerSelect: React.FC<{
  employees: Employee[];
  selectedManagerId: string;
  onManagerChange: (managerId: string, phone: string, email: string | null) => void;
  error?: string | null;
}> = ({ employees, selectedManagerId, onManagerChange, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(employees);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedManager = employees.find(emp => emp.id === selectedManagerId);
  const uniquePositions = Array.from(new Set(employees.map(emp => emp.position))).sort();

  useEffect(() => {
    setFilteredEmployees(employees);
  }, [employees]);

  useEffect(() => {
    const filtered = employees.filter(employee => {
      const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
      const search = searchTerm.toLowerCase();
      const nameMatch = searchTerm ? fullName.includes(search) : true;
      const positionMatch = positionFilter ? employee.position.toLowerCase().includes(positionFilter.toLowerCase()) : true;
      return nameMatch && positionMatch;
    });
    setFilteredEmployees(filtered);
  }, [searchTerm, positionFilter, employees]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setPositionFilter('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleEmployeeSelect = (employee: Employee) => {
    onManagerChange(employee.id, employee.phone, employee.email || null);
    setIsOpen(false);
    setSearchTerm('');
    setPositionFilter('');
  };

  const handleClearSelection = () => {
    onManagerChange('', '', null);
    setIsOpen(false);
    setSearchTerm('');
    setPositionFilter('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={handleToggle}
        className={`w-full px-3 py-2.5 text-xs border rounded-lg cursor-pointer transition-colors ${
          error ? 'border-red-300' : 'border-gray-200'
        } ${isOpen ? 'ring-2 ring-primary-500 border-transparent' : 'hover:border-gray-300'} bg-white`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            {selectedManager ? (
              <>
                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-3 w-3 text-primary-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-900 font-medium">
                    {selectedManager.first_name} {selectedManager.last_name} ({selectedManager.position})
                  </span>
                  {selectedManager.email && (
                    <span className="text-gray-500 text-xs">{selectedManager.email}</span>
                  )}
                </div>
              </>
            ) : (
              <span className="text-gray-500">Select a manager</span>
            )}
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative mb-2">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <select
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option value="">All Positions</option>
              {uniquePositions.map((position) => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>
          </div>

          <div className="max-h-48 overflow-y-auto">
            {selectedManager && (
              <div
                onClick={handleClearSelection}
                className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
              >
                <div className="flex items-center gap-2">
                  <X className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-600">Clear selection</span>
                </div>
              </div>
            )}

            {filteredEmployees.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-500">
                No managers found
              </div>
            ) : (
              filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  onClick={() => handleEmployeeSelect(employee)}
                  className={`px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors ${
                    employee.id === selectedManagerId ? 'bg-primary-50 text-primary-900' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      employee.id === selectedManagerId 
                        ? 'bg-primary-200' 
                        : 'bg-gray-100'
                    }`}>
                      <User className={`h-3 w-3 ${
                        employee.id === selectedManagerId 
                          ? 'text-primary-700' 
                          : 'text-gray-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-xs text-gray-900">
                        {employee.first_name} {employee.last_name} ({employee.position})
                      </div>
                      {employee.email && (
                        <div className="text-xs text-gray-500">{employee.email}</div>
                      )}
                    </div>
                    {employee.id === selectedManagerId && (
                      <Check className="h-3 w-3 text-primary-600" />
                    )}
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

const StoreForm: React.FC<{
  storeId?: string;
  onSuccess?: (response: any) => void;
  onCancel?: () => void;
}> = ({ storeId, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formData, setFormData] = useState<StoreFormData>({
    code: '',
    name: '',
    location: '',
    description: '',
    managerId: '',
    contact_phone: '',
    contact_email: '',
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch employees
        const employeeData = await employeeService.getAllEmployees();
        setEmployees(employeeData);

        // Fetch store data or generate code
        if (storeId) {
          const store = await storeService.getStoreById(storeId);
          if (store) {
            const manager = store.managerId ? await employeeService.getEmployeeById(store.managerId) : null;
            setFormData({
              code: store.code || '',
              name: store.name || '',
              location: store.location || '',
              description: store.description || '',
              managerId: store.managerId || '',
              contact_phone: store.contact_phone || (manager?.phone || ''),
              contact_email: store.contact_email || (manager?.email || ''),
            });
          }
        } else {
          // Generate a unique store code for new stores
          const newCode = generateStoreCode();
          setFormData(prev => ({ ...prev, code: newCode }));
        }
      } catch (error: any) {
        setErrors((prev) => ({
          ...prev,
          general: error.message || 'Failed to load data',
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [storeId]);

  const handleInputChange = (field: keyof StoreFormData, value: string) => {
    if (field === 'code') return; // Prevent changes to code
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleManagerChange = (managerId: string, phone: string, email: string | null) => {
    setFormData((prev) => ({
      ...prev,
      managerId,
      contact_phone: phone || prev.contact_phone,
      contact_email: email || prev.contact_email,
    }));
    if (errors.managerId || errors.contact_phone || errors.contact_email) {
      setErrors((prev) => ({
        ...prev,
        managerId: null,
        contact_phone: null,
        contact_email: null,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.code.trim()) newErrors.code = 'Store code is required';
    if (!formData.name.trim()) newErrors.name = 'Store name is required';
    if (!formData.location.trim()) newErrors.location = 'Store location is required';
    if (!formData.managerId.trim()) newErrors.managerId = 'Store manager is required';
    if (!formData.contact_phone.trim()) newErrors.contact_phone = 'Contact phone is required';
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Invalid email format';
    }
    if (formData.contact_phone && !/^\+?[\d\s-]{7,}$/.test(formData.contact_phone)) {
      newErrors.contact_phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const storeData: StoreData = {
        code: formData.code,
        name: formData.name,
        location: formData.location,
        description: formData.description || undefined,
        managerId: formData.managerId,
        contact_phone: formData.contact_phone,
        contact_email: formData.contact_email || undefined,
      };

      let response: StoreType;
      if (storeId) {
        response = await storeService.updateStore(storeId, storeData);
      } else {
        response = await storeService.createStore(storeData);
      }

      if (onSuccess) {
        onSuccess(response);
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      setErrors((prev) => ({
        ...prev,
        general: error.message || 'Failed to save store',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">{storeId ? 'Loading store...' : 'Saving store...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-6">
      <div className="mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">
              {storeId ? 'Update Store' : 'Add New Store'}
            </h1>
            <p className="text-primary-100 text-xs mt-1">
              Fill in the details to {storeId ? 'update' : 'create'} your store
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Store className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">Store Information</h2>
            </div>
            <p className="text-xs text-gray-500">Enter the details for your store</p>
          </div>

          <div className="p-4 space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Store Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                disabled
                readOnly
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                placeholder="Generated store code"
              />
              {errors.code && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.code}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Store Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter store name"
              />
              {errors.name && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter store location"
              />
              {errors.location && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.location}
                </p>
              )}
            </div>
              </div>
              


            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Description (Optional)
              </label>
              <ReactQuill
                value={formData.description || ''}
                onChange={(value) => handleInputChange('description', value)}
                theme="snow"
                className="w-full text-sm border border-gray-200 rounded-lg"
                modules={{
                  toolbar: [
                    [{ header: [1, 2, false] }],
                    ['bold', 'italic', 'underline'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link'],
                    ['clean'],
                  ],
                }}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description ? (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.description}
                  </p>
                ) : (
                  <span></span>
                )}
                <span className="text-xs text-gray-400">
                  {(formData.description || '').replace(/<[^>]+>/g, '').length} characters
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Store Manager <span className="text-red-500">*</span>
              </label>
              <SearchableManagerSelect
                employees={employees}
                selectedManagerId={formData.managerId}
                onManagerChange={handleManagerChange}
                error={errors.managerId}
              />
              {errors.managerId && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.managerId}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">


            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.contact_phone}
                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter contact phone"
              />
              {errors.contact_phone && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.contact_phone}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contact_email || ''}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter contact email"
              />
              {errors.contact_email && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.contact_email}
                </p>
              )}
            </div>
                </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-medium bg-gradient-to-r from-primary-600 to-primary-600 text-white rounded-lg hover:from-primary-700 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
              >
                <Check className="h-4 w-4" />
                <span>{storeId ? 'Update Store' : 'Create Store'}</span>
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

const StoreFormExample: React.FC<{ role: string }> = ({ role }) => {
  const [showForm, setShowForm] = useState<boolean>(true);
  const { id: editingStoreId } = useParams();
  const navigate = useNavigate();

  const handleSuccess = (response: any) => {
    navigate(`/${role}/dashboard/store-management`, { replace: true });
    console.log('Store saved successfully:', response);
    setShowForm(false);
  };

  const handleCancel = () => {
    navigate(`/${role}/dashboard/store-management`);
    console.log('Form cancelled');
  };

  return (
    <StoreForm
      storeId={editingStoreId || undefined}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
};

export default StoreFormExample;
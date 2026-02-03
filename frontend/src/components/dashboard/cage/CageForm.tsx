/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Check, X, Box } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import cageService, { type Cage, type CageData } from '../../../services/cageService';
import Swal from 'sweetalert2';

interface CageFormData {
  cageCode: string;
  cageName: string;
  cageNetType: 'FINGERLING' | 'JUVENILE' | 'ADULT' | '';
  cageDepth: number | '';
  cageStatus: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE' | '';
  cageCapacity: number | '';
  cageType: string;
  cageVolume: number | '';
  stockingDate: string;
}

interface Errors {
  [key: string]: string | null;
}

// Utility function to generate a 4-character hash from a UUID
const generateCageCode = (): string => {
  const uuid = uuidv4().replace(/-/g, '');
  const hash = uuid.slice(0, 4).toUpperCase();
  return `CAGE-${hash}`;
};

// Utility function to format ISO date to datetime-local format (YYYY-MM-DDTHH:mm)
const formatISOToDateTimeLocal = (isoDate: string): string => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Utility function to convert datetime-local to ISO string
const formatDateTimeLocalToISO = (dateTime: string): string => {
  if (!dateTime) return '';
  return new Date(dateTime).toISOString();
};

const CageForm: React.FC<{ role: string }> = ({ role }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formData, setFormData] = useState<CageFormData>({
    cageCode: '',
    cageName: '',
    cageNetType: '',
    cageDepth: '',
    cageStatus: '',
    cageCapacity: '',
    cageType: '',
    cageVolume: '',
    stockingDate: '2025-09-26T21:34', // Default to 09:34 PM CAT, September 26, 2025
  });
  const navigate = useNavigate();
  const { id: cageId } = useParams<{ id?: string }>();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (cageId) {
          const cage = await cageService.getCageById(cageId);
          if (cage) {
            setFormData({
              cageCode: cage.cageCode || '',
              cageName: cage.cageName || '',
              cageNetType: cage.cageNetType || '',
              cageDepth: cage.cageDepth || '',
              cageStatus: cage.cageStatus || '',
              cageCapacity: cage.cageCapacity || '',
              cageType: cage.cageType || '',
              cageVolume: cage.cageVolume || '',
              stockingDate: formatISOToDateTimeLocal(cage.stockingDate || ''),
            });
          } else {
            throw new Error('Cage not found');
          }
        } else {
          const newCode = generateCageCode();
          setFormData((prev) => ({ ...prev, cageCode: newCode }));
        }
      } catch (error: any) {
        console.error('Error fetching cage:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to load cage data',
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
  }, [cageId]);

  const handleInputChange = (field: keyof CageFormData, value: string | number) => {
    if (field === 'cageCode') return; // Prevent changes to code
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.cageCode.trim()) newErrors.cageCode = 'Cage code is required';
    if (!formData.cageName.trim()) newErrors.cageName = 'Cage name is required';
    if (!['FINGERLING', 'JUVENILE', 'ADULT'].includes(formData.cageNetType)) {
      newErrors.cageNetType = 'Cage net type is required';
    }
    if (formData.cageDepth === '' || Number(formData.cageDepth) <= 0) {
      newErrors.cageDepth = 'Cage depth must be greater than 0';
    }
    if (!['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE'].includes(formData.cageStatus)) {
      newErrors.cageStatus = 'Cage status is required';
    }
    if (formData.cageCapacity === '' || Number(formData.cageCapacity) <= 0) {
      newErrors.cageCapacity = 'Cage capacity must be greater than 0';
    }
    if (!formData.cageType.trim()) newErrors.cageType = 'Cage type is required';
    if (formData.cageVolume === '' || Number(formData.cageVolume) <= 0) {
      newErrors.cageVolume = 'Cage volume must be greater than 0';
    }
    if (!formData.stockingDate) {
      newErrors.stockingDate = 'Stocking date and time are required';
    } else if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(formData.stockingDate)) {
      newErrors.stockingDate = 'Invalid date and time format (YYYY-MM-DD HH:mm)';
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
      const cageData: CageData = {
        cageCode: formData.cageCode,
        cageName: formData.cageName,
        cageNetType: formData.cageNetType as 'FINGERLING' | 'JUVENILE' | 'ADULT',
        cageDepth: Number(formData.cageDepth),
        cageStatus: formData.cageStatus as 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE',
        cageCapacity: Number(formData.cageCapacity),
        cageType: formData.cageType,
        cageVolume: Number(formData.cageVolume),
        stockingDate: formatDateTimeLocalToISO(formData.stockingDate),
      };

      let response: Cage;
      if (cageId) {
        response = await cageService.updateCage(cageId, cageData);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Cage "${response.cageName}" updated successfully`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
      } else {
        response = await cageService.createCage(cageData);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Cage "${response.cageName}" created successfully`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
      }

      navigate(`/${role}/dashboard/cage-management`);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to save cage',
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
    navigate(`/${role}/dashboard/cage-management`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-xs">{cageId ? 'Loading cage...' : 'Preparing form...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto px-4 ">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-600 px-6 py-4">
            <h1 className="text-lg font-semibold text-white">
              {cageId ? 'Update Cage' : 'Add New Cage'}
            </h1>
            <p className="text-primary-100 text-xs mt-1">
              Fill in the details to {cageId ? 'update' : 'create'} your cage
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Box className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">Cage Information</h2>
            </div>
            <p className="text-xs text-gray-500">Enter the details for your cage</p>
          </div>

          <div className="p-4 space-y-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Cage Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.cageCode}
                disabled
                readOnly
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg bg-gray-100 cursor-not-allowed"
                placeholder="Generated cage code"
              />
              {errors.cageCode && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.cageCode}
                </p>
              )}
            </div>

             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Cage Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.cageName}
                onChange={(e) => handleInputChange('cageName', e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter cage name"
              />
              {errors.cageName && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.cageName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Cage Net Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.cageNetType}
                onChange={(e) => handleInputChange('cageNetType', e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select net type</option>
                <option value="FINGERLING">Fingerling</option>
                <option value="JUVENILE">Juvenile</option>
                <option value="ADULT">Adult</option>
              </select>
              {errors.cageNetType && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.cageNetType}
                </p>
              )}
            </div>
            
            </div>

 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Cage Depth (meters) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.cageDepth}
                onChange={(e) => handleInputChange('cageDepth', e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter cage depth"
                min="0"
                step="0.1"
              />
              {errors.cageDepth && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.cageDepth}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Cage Status <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.cageStatus}
                onChange={(e) => handleInputChange('cageStatus', e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              </select>
              {errors.cageStatus && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.cageStatus}
                </p>
              )}
            </div>
            </div>

 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Cage Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.cageCapacity}
                onChange={(e) => handleInputChange('cageCapacity', e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter cage capacity"
                min="0"
              />
              {errors.cageCapacity && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.cageCapacity}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Cage Type <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.cageType}
                onChange={(e) => handleInputChange('cageType', e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter cage type"
              />
              {errors.cageType && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.cageType}
                </p>
              )}
            </div>
            </div>



             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Cage Volume (m³) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.cageVolume}
                onChange={(e) => handleInputChange('cageVolume', e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter cage volume"
                min="0"
                step="0.1"
              />
              {errors.cageVolume && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.cageVolume}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Stocking Date and Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.stockingDate}
                onChange={(e) => handleInputChange('stockingDate', e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Select stocking date and time"
              />
              {errors.stockingDate && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <X className="h-3 w-3" />
                  {errors.stockingDate}
                </p>
              )}
            </div>
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
                <span>{cageId ? 'Update Cage' : 'Create Cage'}</span>
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

export default CageForm;
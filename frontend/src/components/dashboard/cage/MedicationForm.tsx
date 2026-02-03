/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Check, X, Pill } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import medicationService, { type MedicationData, type Medication } from '../../../services/medicationService';
import cageService, { type Cage } from '../../../services/cageService';
import Swal from 'sweetalert2';
import  useAdminAuth  from '../../../context/AdminAuthContext';
import  useEmployeeAuth from '../../../context/EmployeeAuthContext';

interface MedicationFormData {
  name: string;
  dosage: string;
  method: 'FEED' | 'BATH' | 'WATER' | 'INJECTION' | '';
  reason: string;
  startDate: string; // YYYY-MM-DDTHH:mm
  endDate: string; // YYYY-MM-DDTHH:mm
  cageId: string;
  administeredBy: string;
}

interface Errors {
  [key: string]: string | null;
}

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

const MedicationForm: React.FC<{ role: string }> = ({ role }) => {
  const { user: adminUser } = useAdminAuth();
  const { user: employeeUser } = useEmployeeAuth();
  const user = role === 'admin' ? adminUser : employeeUser;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [cages, setCages] = useState<Cage[]>([]);
  const [formData, setFormData] = useState<MedicationFormData>({
    name: '',
    dosage: '',
    method: '',
    reason: '',
    startDate: '2025-09-27T01:19', // Default to 1:19 AM CAT, September 27, 2025
    endDate: '',
    cageId: '',
    administeredBy: user?.id || '',
  });
  const navigate = useNavigate();
  const { id: medicationId } = useParams<{ id?: string }>();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch cages for validation
        const cageData = await cageService.getAllCages();
        setCages(cageData || []);

        // Check for query parameters
        const queryParams = new URLSearchParams(location.search);
        const prefilledCageId = queryParams.get('cageId');

        if (medicationId) {
          // Fetch existing medication for update mode
          const medication = await medicationService.getMedicationById(medicationId);
          if (medication) {
            setFormData({
              name: medication.name || '',
              dosage: medication.dosage || '',
              method: medication.method || '',
              reason: medication.reason || '',
              startDate: formatISOToDateTimeLocal(medication.startDate || ''),
              endDate: formatISOToDateTimeLocal(medication.endDate || ''),
              cageId: medication.cageId || '',
              administeredBy: medication.administeredByEmployee || medication.administeredByAdmin || '',
            });
          } else {
            throw new Error('Medication not found');
          }
        } else if (prefilledCageId) {
          // Validate prefilled cageId
          const isValidCageId = cageData?.some((cage) => cage.id === prefilledCageId);
          if (isValidCageId) {
            setFormData((prev) => ({
              ...prev,
              cageId: prefilledCageId,
              administeredBy: user?.id || '',
            }));
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Invalid Cage ID',
              text: 'The provided cage ID is invalid',
              toast: true,
              position: 'top-end',
              showConfirmButton: false,
              timer: 3000,
            });
            navigate(`/${role}/dashboard/cage-management`);
          }
        } else {
          // No cageId provided in create mode
          Swal.fire({
            icon: 'error',
            title: 'Missing Cage ID',
            text: 'A valid cage ID is required to create a medication record',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
          });
          navigate(`/${role}/dashboard/cage-management`);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to load medication data',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
        navigate(`/${role}/dashboard/cage-management`);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id) {
      fetchData();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Error',
        text: 'User not authenticated',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
      navigate(`/${role}/login`);
    }
  }, [medicationId, location.search, user, role, navigate]);

  const handleInputChange = (field: keyof MedicationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = (): boolean => {
    const data: MedicationData = {
      name: formData.name,
      dosage: formData.dosage,
      method: formData.method as 'FEED' | 'BATH' | 'WATER' | 'INJECTION',
      reason: formData.reason || null,
      startDate: formatDateTimeLocalToISO(formData.startDate),
      endDate: formData.endDate ? formatDateTimeLocalToISO(formData.endDate) : null,
      cageId: formData.cageId,
      administeredByEmployee: role === 'employee' ? formData.administeredBy : undefined,
      administeredByAdmin: role === 'admin' ? formData.administeredBy : undefined,
    };

    const validation = medicationService.validateMedicationData(data);
    const newErrors: Errors = {};

    validation.errors.forEach((error) => {
      if (error.includes('name')) newErrors.name = error;
      if (error.includes('dosage')) newErrors.dosage = error;
      if (error.includes('method')) newErrors.method = error;
      if (error.includes('startDate')) newErrors.startDate = error;
      if (error.includes('administeredBy')) newErrors.administeredBy = error;
    });

    // Additional validation for endDate
    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date cannot be before start date';
    }

    if (!formData.administeredBy) {
      newErrors.administeredBy = 'Administered by is required';
    }

    setErrors(newErrors);
    return validation.isValid && !newErrors.endDate && !newErrors.administeredBy;
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Error',
        text: 'User not authenticated',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
      navigate(`/${role}/login`);
      return;
    }

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
      const medicationData: MedicationData = {
        name: formData.name,
        dosage: formData.dosage,
        method: formData.method as 'FEED' | 'BATH' | 'WATER' | 'INJECTION',
        reason: formData.reason || null,
        startDate: formatDateTimeLocalToISO(formData.startDate),
        endDate: formData.endDate ? formatDateTimeLocalToISO(formData.endDate) : null,
        cageId: formData.cageId,
        administeredByEmployee: role === 'employee' ? user.id : undefined,
        administeredByAdmin: role === 'admin' ? user.id : undefined,
      };

      let response: Medication;
      if (medicationId) {
        response = await medicationService.updateMedication(medicationId, medicationData);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Medication "${response.name}" updated successfully`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
      } else {
        response = await medicationService.createMedication(medicationData);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Medication "${response.name}" created successfully`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
      }

      navigate(`/${role}/dashboard/cage-management/view/${formData.cageId}?tab=medications`);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to save medication',
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
    navigate(`/${role}/dashboard/cage-management/view/${formData.cageId || ''}?tab=medications`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-xs">
            {medicationId ? 'Loading medication...' : 'Preparing form...'}
          </p>
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
              {medicationId ? 'Update Medication' : 'Add New Medication'}
            </h1>
            <p className="text-primary-100 text-xs mt-1">
              Fill in the details to {medicationId ? 'update' : 'create'} your medication record
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Pill className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">Medication Information</h2>
            </div>
            <p className="text-xs text-gray-500">Enter the details for the medication</p>
          </div>

          <div className="p-4 space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Medication Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter medication name"
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
                  Dosage <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.dosage}
                  onChange={(e) => handleInputChange('dosage', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter dosage (e.g., 10 mg/kg)"
                />
                {errors.dosage && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.dosage}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Method <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.method}
                  onChange={(e) => handleInputChange('method', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select method</option>
                  <option value="FEED">Feed</option>
                  <option value="BATH">Bath</option>
                  <option value="WATER">Water</option>
                  <option value="INJECTION">Injection</option>
                </select>
                {errors.method && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.method}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Reason
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => handleInputChange('reason', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter reason (optional)"
                />
                {errors.reason && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.reason}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Start Date and Time (CAT) <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Select start date and time"
                />
                {errors.startDate && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  End Date and Time (CAT)
                </label>
                <input
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Select end date and time (optional)"
                />
                {errors.endDate && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.endDate}
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
                <span>{medicationId ? 'Update Medication' : 'Create Medication'}</span>
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

export default MedicationForm;
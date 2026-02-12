import React, { useEffect, useState } from 'react';
import { User, Upload, X, Eye, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import employeeService from '../../../services/employeeService';
import { API_URL } from '../../../api/api';

const EMPLOYEE_STATUS = ['ACTIVE', 'TERMINATED', 'RESIGNED', 'PROBATION'] as const;
const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;

type EmployeeStatus = typeof EMPLOYEE_STATUS[number];
type Gender = typeof GENDERS[number];

interface Employee {
  id: string;
  first_name?: string;
  last_name?: string;
  gender?: Gender;
  phone?: string;
  email: string;
  national_id?: string;
  position?: string;
  department?: string;
  date_hired?: string;
  status?: EmployeeStatus;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  profile_picture?: string;
  created_at?: string;
  updated_at?: string;
}

interface EmployeeFormData {
  first_name: string;
  last_name: string;
  gender: string;
  phone: string;
  email: string;
  national_id: string;
  position: string;
  department: string;
  date_hired: string;
  status: EmployeeStatus;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

interface Errors {
  [key: string]: string | null;
}

const EmployeeForm: React.FC<{
  employeeId?: string;
  onSuccess?: (response: Employee) => void;
  onCancel?: () => void;
}> = ({ employeeId, onSuccess, onCancel }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [profileImgFile, setProfileImgFile] = useState<File | null>(null);
  const [profileImgPreview, setProfileImgPreview] = useState<string | null>(null);
  const [existingProfileImg, setExistingProfileImg] = useState<string | null>(null);
  const [removedProfileImg, setRemovedProfileImg] = useState<boolean>(false);

  const [formData, setFormData] = useState<EmployeeFormData>({
    first_name: '',
    last_name: '',
    gender: '',
    phone: '',
    email: '',
    national_id: '',
    position: '',
    department: '',
    date_hired: '',
    status: 'ACTIVE',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  const navigate = useNavigate();
  const { id: paramsEmployeeId } = useParams<{ id?: string }>();

  const getUrlImage = (url: string | undefined): string | undefined => {
    if (!url) return url;
    if (url.includes('http')) return url;
    return `${API_URL}${url}`;
  };

  useEffect(() => {
    if (employeeId || paramsEmployeeId) {
      loadEmployeeData();
    }
  }, [employeeId, paramsEmployeeId]);

  const loadEmployeeData = async () => {
    try {
      setIsLoading(true);
      const id = employeeId || paramsEmployeeId;
      if (!id) return;
      const employee = await employeeService.getEmployeeById(id);
      if (employee) {
        setFormData({
          first_name: employee.first_name || '',
          last_name: employee.last_name || '',
          gender: employee.gender || '',
          phone: employee.phone || '',
          email: employee.email || '',
          national_id: employee.national_id || '',
          position: employee.position || '',
          department: employee.department || '',
          date_hired: employee.date_hired ? new Date(employee.date_hired).toISOString().split('T')[0] : '',
          status: employee.status || 'ACTIVE',
          emergency_contact_name: employee.emergency_contact_name || '',
          emergency_contact_phone: employee.emergency_contact_phone || '',
        });

        const profileUrl = getUrlImage(employee.profile_picture);
        if (profileUrl) {
          setExistingProfileImg(profileUrl);
          setProfileImgPreview(profileUrl);
        }
      }
    } catch (error) {
      console.error('Error loading employee:', error);
      setErrors({ general: 'Failed to load employee data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EmployeeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleFileChange = (file: File | null) => {
    setProfileImgFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImgPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setRemovedProfileImg(false);
    } else {
      if (existingProfileImg && !removedProfileImg) {
        setProfileImgPreview(existingProfileImg);
      } else {
        setProfileImgPreview(null);
      }
    }
  };

  const removeFile = () => {
    setProfileImgFile(null);
    setProfileImgPreview(null);
    if (existingProfileImg) {
      setRemovedProfileImg(true);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.emergency_contact_phone && !/^\+?\d{10,15}$/.test(formData.emergency_contact_phone)) {
      newErrors.emergency_contact_phone = 'Invalid phone format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createFormData = (): globalThis.FormData => {
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        data.append(key, value as string);
      }
    });

    if (profileImgFile) {
      data.append('profileImg', profileImgFile);
    }

    if (removedProfileImg) {
      data.append('removedFiles', JSON.stringify({ profileImg: true }));
    }

    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const submitData = createFormData();

      let response: Employee;
      const id = employeeId || paramsEmployeeId;
      if (id) {
        response = await employeeService.updateEmployee(id, submitData);
      } else {
        response = await employeeService.createEmployee(submitData);
      }

      if (onSuccess) {
        onSuccess(response);
      } else {
        navigate(-1);
      }
    } catch (error: any) {
      setErrors({ general: error.message || 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  const isEditMode = !!(employeeId || paramsEmployeeId);

  return (
    <div className=" mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditMode ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <p className="text-sm text-gray-500">
                {isEditMode ? 'Update employee information' : 'Fill in the employee details'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Identity Card or Image
            </label>
            {!profileImgPreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  className="hidden"
                  id="profileImg"
                />
                <label htmlFor="profileImg" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Click to upload Identity Car/d or Image</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </label>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <img
                  src={profileImgPreview}
                  alt="Profile preview"
                  className="w-24 h-24 rounded-lg object-cover border border-gray-200"
                />
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => window.open(profileImgPreview)}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter first name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter last name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter email address"
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select gender</option>
                {GENDERS.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                National ID
              </label>
              <input
                type="text"
                value={formData.national_id}
                onChange={(e) => handleInputChange('national_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter national ID"
              />
            </div>
          </div>

          {/* Employment Information */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter position/title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter department name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Hired
                </label>
                <input
                  type="date"
                  value={formData.date_hired}
                  onChange={(e) => handleInputChange('date_hired', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {EMPLOYEE_STATUS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter emergency contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={formData.emergency_contact_phone}
                  onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter emergency contact phone"
                />
                {errors.emergency_contact_phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.emergency_contact_phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEditMode ? 'Update Employee' : 'Create Employee'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;

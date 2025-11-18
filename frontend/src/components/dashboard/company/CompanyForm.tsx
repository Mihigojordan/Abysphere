/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useRef } from 'react';
import { Check, X, Building2, Upload, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import companyService, { type Company, type CreateCompanyInput, type UpdateCompanyInput } from '../../../services/companyService';
import Swal from 'sweetalert2';
import { API_URL } from '../../../api/api';

interface CompanyFormData {
  adminName: string;
  adminEmail: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  country: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE' | '';
  is2FA: boolean;
  profileImg?: File | null;
  profileImageUrl?: string; // for preview (existing image)
}

interface Errors {
  [key: string]: string | null;
}

const CompanyForm: React.FC<{ role: string }> = ({ role }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formData, setFormData] = useState<CompanyFormData>({
    adminName: '',
    adminEmail: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    country: '',
    description: '',
    status: '',
    is2FA: false,
    profileImg: null,
    profileImageUrl: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { id: companyId } = useParams<{ id?: string }>();

  // Load company data on edit
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (companyId) {
          const company = await companyService.getCompanyById(companyId);
          if (company) {
            setFormData({
              adminName: company.adminName || '',
              adminEmail: company.adminEmail || '',
              phone: company.phone || '',
              website: company.website || '',
              address: company.address || '',
              city: company.city || '',
              country: company.country || '',
              description: company.description || '',
              status: company.status || '',
              is2FA: company.is2FA || false,
              profileImg: null,
              profileImageUrl: `${API_URL}${company.profileImage}` || '',
            });
          } else {
            throw new Error('Company not found');
          }
        }
      } catch (error: any) {
        console.error('Error fetching company:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to load company data',
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
  }, [companyId]);

  const handleInputChange = (field: keyof CompanyFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File',
          text: 'Please upload a valid image file',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
        return;
      }

      setFormData((prev) => ({
        ...prev,
        profileImg: file,
        profileImageUrl: URL.createObjectURL(file),
      }));
      setErrors((prev) => ({ ...prev, profileImg: null }));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      profileImg: null,
      profileImageUrl: '',
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.adminName.trim()) newErrors.adminName = 'Company name is required';
    if (!formData.adminEmail.trim()) newErrors.adminEmail = 'Company email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      newErrors.adminEmail = 'Invalid email format';
    }
    if (formData.phone && !/^[\d+\-() ]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number contains invalid characters';
    }
    if (formData.website && !/^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(formData.website)) {
      newErrors.website = 'Invalid website URL';
    }
    if (!['ACTIVE', 'INACTIVE'].includes(formData.status)) {
      newErrors.status = 'Company status is required';
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
      const companyData: any = {
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        description: formData.description || undefined,
        status: formData.status as 'ACTIVE' | 'INACTIVE',
        is2FA: formData.is2FA,
      };

      // Only include profileImg if a new file is selected
      if (formData.profileImg) {
        companyData.profileImg = formData.profileImg;
      }

      let response: Company;
      if (companyId) {
        response = await companyService.updateCompany(companyId, companyData);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Company "${response.adminName}" updated successfully`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
      } else {
        response = await companyService.createCompany(companyData);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Company "${response.adminName}" created successfully`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
      }

      navigate(`/${role}/dashboard/company-management`);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to save company',
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
    navigate(`/${role}/dashboard/company-management`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-xs">{companyId ? 'Loading company...' : 'Preparing form...'}</p>
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
              {companyId ? 'Update Company' : 'Add New Company'}
            </h1>
            <p className="text-primary-100 text-xs mt-1">
              Fill in the details to {companyId ? 'update' : 'create'} your company
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Building2 className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">Company Information</h2>
            </div>
            <p className="text-xs text-gray-500">Enter the details for your company</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Profile Image Upload */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Company Logo</label>
              <div className="flex items-center gap-4">
                <div className="shrink-0">
                  {formData.profileImageUrl ? (
                    <div className="relative">
                      <img
                        src={formData.profileImageUrl}
                        alt="Company Logo"
                        className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="profile-upload"
                  />
                  <label
                    htmlFor="profile-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Upload className="h-4 w-4" />
                    {formData.profileImageUrl ? 'Change Image' : 'Upload Logo'}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.adminName}
                  onChange={(e) => handleInputChange('adminName', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter company name"
                />
                {errors.adminName && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.adminName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Admin Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter admin email"
                />
                {errors.adminEmail && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.adminEmail}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Website</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="https://example.com"
                />
                {errors.website && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.website}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter address"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter city"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Country</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter country"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                {errors.status && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.status}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter company description"
                rows={4}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.is2FA}
                  onChange={(e) => handleInputChange('is2FA', e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-200 rounded focus:ring-primary-500"
                />
                Enable Two-Factor Authentication
              </label>
            </div>
          </div>

          {/* Action Buttons */}
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
                <span>{companyId ? 'Update Company' : 'Create Company'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyForm;
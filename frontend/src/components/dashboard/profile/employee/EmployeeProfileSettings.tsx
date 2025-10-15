import React, { useEffect, useState } from 'react';
import { Camera } from 'lucide-react';
import Swal from 'sweetalert2';
import useEmployeeAuth from '../../../../context/EmployeeAuthContext';
import { API_URL } from '../../../../api/api';

interface EmployeeUser {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  isLocked?: boolean;
  created_at?: string;
  profile_picture?: string;
  phone?: string;
}

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  profile_picture: string;
}

const EmployeeProfileSettings: React.FC = () => {
  const { user, updateEmployee } = useEmployeeAuth() as {
    user: EmployeeUser | null;
    updateEmployee: (data: Partial<EmployeeUser>) => Promise<EmployeeUser>;
  };

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    created_at: user?.created_at || '',
    profile_picture: `${API_URL}${user?.profile_picture}` || '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      created_at: user?.created_at || '',
      profile_picture: `${API_URL}${user?.profile_picture}` || '',
    });
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profile_picture: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const updatePayload: Partial<EmployeeUser> = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
      };

      if (selectedFile) {
        const fd = new FormData();
        fd.append('profileImg', selectedFile);
        fd.append('first_name', formData.first_name);
        fd.append('last_name', formData.last_name);
        fd.append('email', formData.email);
        fd.append('phone', formData.phone);

        await updateEmployee(fd as unknown as Partial<EmployeeUser>);
      } else {
        await updateEmployee(updatePayload);
      }

      Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your profile has been updated successfully.',
        confirmButtonColor: '#2563eb', // primary-600
        textColor: '#1f2937', // gray-800
        titleColor: '#1f2937', // gray-800
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Something went wrong while updating your profile.',
        confirmButtonColor: '#ef4444', // red-500
        textColor: '#1f2937', // gray-800
        titleColor: '#1f2937', // gray-800
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      created_at: user?.created_at || '',
      profile_picture: user?.profile_picture || '',
    });
    setIsEditing(false);
  };

  const handleUpdate = () => {
    setIsEditing(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 16);
  };

  return (
    <>
      {/* Profile Section */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Basic Information
        </h2>

        {/* Profile Photo */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Profile Photo
          </label>
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              
              {formData.profile_picture ? (
                <img
                  src={formData.profile_picture}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <Camera className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="flex space-x-2">
              <label
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  isEditing
                    ? 'bg-primary-500 text-white hover:bg-primary-600 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={!isEditing}
                  className="hidden"
                />
              </label>
              <button
                onClick={() =>
                  setFormData((prev) => ({ ...prev, profile_picture: '' }))
                }
                disabled={!isEditing}
                className={`px-3 py-1.5 border border-gray-200 rounded text-xs font-medium transition-colors ${
                  isEditing
                    ? 'text-gray-600 hover:bg-gray-50'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                Remove
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Recommended image size is 400px x 400px
          </p>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="first_name"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`w-full px-3 py-1.5 border border-gray-200 rounded text-xs ${
                isEditing
                  ? 'focus:ring-primary-500 focus:border-primary-500'
                  : 'bg-gray-100 text-gray-600 cursor-not-allowed'
              }`}
              placeholder="Enter first name"
            />
          </div>
          <div>
            <label
              htmlFor="last_name"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`w-full px-3 py-1.5 border border-gray-200 rounded text-xs ${
                isEditing
                  ? 'focus:ring-primary-500 focus:border-primary-500'
                  : 'bg-gray-100 text-gray-600 cursor-not-allowed'
              }`}
              placeholder="Enter last name"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`w-full px-3 py-1.5 border border-gray-200 rounded text-xs ${
                isEditing
                  ? 'focus:ring-primary-500 focus:border-primary-500'
                  : 'bg-gray-100 text-gray-600 cursor-not-allowed'
              }`}
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              readOnly={!isEditing}
              className={`w-full px-3 py-1.5 border border-gray-200 rounded text-xs ${
                isEditing
                  ? 'focus:ring-primary-500 focus:border-primary-500'
                  : 'bg-gray-100 text-gray-600 cursor-not-allowed'
              }`}
              placeholder="Enter phone number"
            />
          </div>
          <div>
            <label
              htmlFor="created_at"
              className="block text-xs font-medium text-gray-600 mb-1"
            >
              Account Created
            </label>
            <input
              type="datetime-local"
              id="created_at"
              name="created_at"
              value={formatDate(formData.created_at)}
              readOnly
              className="w-full px-3 py-1.5 border border-gray-200 rounded text-xs bg-gray-100 text-gray-600 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Buttons */}
      {!isEditing && (
        <div className="flex justify-end">
          <button
            onClick={handleUpdate}
            className="px-4 py-1.5 bg-primary-500 text-white text-xs font-medium rounded hover:bg-primary-600 transition-colors"
          >
            Update
          </button>
        </div>
      )}

      {isEditing && (
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-4 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-1.5 bg-primary-500 text-white text-xs font-medium rounded hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </>
  );
};

export default EmployeeProfileSettings;
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, Camera, Upload, DollarSign, Calendar, AlertCircle, ArrowLeft, Save, Send, Trash2, X } from 'lucide-react';
import Quill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import assetService, { type CreateAssetInput } from '../../../services/assetService';
import Swal from 'sweetalert2';

const AddAssetPage: React.FC<{role:string}> = ({role}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateAssetInput>({
    name: '',
    category: 'EQUIPMENT',
    description: '',
    location: '',
    quantity: '',
    purchaseDate: undefined,
    purchaseCost: undefined,
    status: 'ACTIVE',
    assetImgFile: null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load draft from localStorage
  useEffect(() => {
    const userEmail = 'user@example.com'; // Replace with actual user email from auth context
    const draftKey = `assetDraft_${userEmail}`;
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      const draft = JSON.parse(savedDraft) as Partial<CreateAssetInput>;
      setFormData({
        name: draft.name ?? '',
        category: draft.category ?? 'EQUIPMENT',
        description: draft.description ?? '',
        location: draft.location ?? '',
        quantity: draft.quantity ?? '',
        purchaseDate: draft.purchaseDate ? new Date(draft.purchaseDate) : undefined,
        purchaseCost: draft.purchaseCost ?? undefined,
        status: draft.status ?? 'ACTIVE',
        assetImgFile: null
      });
      setImagePreview(null);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'purchaseCost' ? (value ? parseFloat(value) : undefined) : value 
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({ ...prev, description: value }));
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, assetImgFile: file }));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, assetImgFile: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.quantity.trim()) newErrors.quantity = 'Quantity is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveDraft = () => {
    try {
      const userEmail = 'user@example.com'; // Replace with actual user email from auth context
      const draftKey = `assetDraft_${userEmail}`;
      const draftData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        location: formData.location,
        quantity: formData.quantity,
        purchaseDate: formData.purchaseDate,
        purchaseCost: formData.purchaseCost,
        status: formData.status,
      };
      localStorage.setItem(draftKey, JSON.stringify(draftData));
      Swal.fire({
        title: 'Draft Saved!',
        text: 'Your asset draft has been saved successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (error: unknown) {
      console.error('Error saving draft:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to save draft. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleClearDraft = async () => {
    const result = await Swal.fire({
      title: 'Clear Draft?',
      text: 'Are you sure you want to clear your asset draft? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear it',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        const userEmail = 'user@example.com'; // Replace with actual user email from auth context
        const draftKey = `assetDraft_${userEmail}`;
        localStorage.removeItem(draftKey);
        setFormData({
          name: '',
          category: 'EQUIPMENT',
          description: '',
          location: '',
          quantity: '',
          purchaseDate: undefined,
          purchaseCost: undefined,
          status: 'ACTIVE',
          assetImgFile: null
        });
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setErrors({});
        Swal.fire({
          title: 'Draft Cleared!',
          text: 'Your asset draft has been cleared.',
          icon: 'success',
          confirmButtonText: 'OK',
          timer: 2000,
          timerProgressBar: true,
        });
      } catch (error: unknown) {
        console.error('Error clearing draft:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to clear draft. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('quantity', formData.quantity);
      if (formData.description) formDataToSend.append('description', formData.description);
      if (formData.location) formDataToSend.append('location', formData.location);
      if (formData.purchaseDate) formDataToSend.append('purchaseDate', formData.purchaseDate.toISOString());
      if (formData.purchaseCost !== undefined) formDataToSend.append('purchaseCost', formData.purchaseCost.toString());
      if (formData.status) formDataToSend.append('status', formData.status);
      if (formData.assetImgFile) formDataToSend.append('assetImg', formData.assetImgFile);

      await assetService.createAsset(formDataToSend);
      const userEmail = 'user@example.com'; // Replace with actual user email
      const draftKey = `assetDraft_${userEmail}`;
      localStorage.removeItem(draftKey);

      Swal.fire({
        title: 'Success!',
        text: 'The asset was added successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
        timer: 2000,
        timerProgressBar: true,
      });
      const url = role == 'admin' ? '/admin/dashboard/asset-management' : '/employee/dashboard/asset-management'  
      navigate(url, { replace: true });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to add asset';
      console.error('Error in handleSubmit:', error);
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-11/12 mx-auto px-4 py-8">
        {/* Header */}
       
        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {errors.general}
            </div>
          )}

          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Assets
            </button>
          </div>
              <Package className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Asset Information</h2>
              <p className="text-gray-600">Provide details about the new asset</p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Asset Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={triggerFileInput}
                    className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
                  >
                    <Camera className="w-12 h-12 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                )}
              </div>
              
              <button
                type="button"
                onClick={triggerFileInput}
                className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>{imagePreview ? 'Change Photo' : 'Upload Photo'}</span>
              </button>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span>Name <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter asset name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span>Category <span className="text-red-500">*</span></span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="MACHINERY">Machinery</option>
                  <option value="VEHICLE">Vehicle</option>
                  <option value="BUILDING">Building</option>
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="SOFTWARE">Software</option>
                  <option value="OTHER">Other</option>
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span>Quantity <span className="text-red-500">*</span></span>
                </label>
                <input
                  type="text"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.quantity ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter quantity"
                />
                {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>Location</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter location"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span>Purchase Cost</span>
                </label>
                <input
                  type="number"
                  name="purchaseCost"
                  value={formData.purchaseCost !== undefined ? formData.purchaseCost : ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter purchase cost"
                  step="0.01"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Purchase Date</span>
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate ? formData.purchaseDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const value = e.target.value ? new Date(e.target.value) : undefined;
                    setFormData((prev) => ({ ...prev, purchaseDate: value }));
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 text-gray-400" />
                  <span>Description</span>
                </label>
                <Quill
                  value={formData.description || ''}
                  onChange={handleDescriptionChange}
                  className="bg-white"
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, false] }],
                      ['bold', 'italic', 'underline'],
                      ['list', 'bullet'],
                      ['link'],
                      ['clean'],
                    ],
                  }}
                  formats={['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link']}
                  placeholder="Enter asset description..."
                />
              </div>

              <div>
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                  <span>Status</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="RETIRED">Retired</option>
                  <option value="DISPOSED">Disposed</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-gray-200">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handleClearDraft}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear Draft
                </button>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Add Asset
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddAssetPage;
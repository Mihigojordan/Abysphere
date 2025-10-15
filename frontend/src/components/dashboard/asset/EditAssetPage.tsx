import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Package, MapPin, Camera, Upload, DollarSign, Calendar, AlertCircle, ArrowLeft, Save, Send, Trash2, X } from 'lucide-react';
import Quill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import assetService, { type UpdateAssetInput, type Asset } from '../../../services/assetService';
import { API_URL } from '../../../api/api';
import Swal from 'sweetalert2';

const EditAssetPage: React.FC<{role:string}> = ({role}) => {
  const { id: assetId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState<UpdateAssetInput>({
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
  const [loading, setLoading] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch asset data and load draft from localStorage
  useEffect(() => {
    const fetchAssetAndDraft = async () => {
      if (!assetId) return;

      setLoading(true);
      try {
        const assetData = await assetService.getAssetById(assetId);
        if (assetData) {
          setAsset(assetData);
          setFormData({
            name: assetData.name || '',
            category: assetData.category || 'EQUIPMENT',
            description: assetData.description || '',
            location: assetData.location || '',
            quantity: assetData.quantity || '',
            purchaseDate: assetData.purchaseDate ? new Date(assetData.purchaseDate) : undefined,
            purchaseCost: assetData.purchaseCost,
            status: assetData.status || 'ACTIVE',
            assetImgFile: null
          });
          setImagePreview( assetData.assetImg ? `${API_URL}${assetData.assetImg}` : null);
        } else {
          throw new Error('Asset not found');
        }

        // Load draft from localStorage
        const userEmail = 'user@example.com'; // Replace with actual user email from auth context
        const draftKey = `editAssetDraft_${assetId}_${userEmail}`;
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
          const draft = JSON.parse(savedDraft) as Partial<UpdateAssetInput>;
          setFormData({
            name: draft.name ?? assetData.name ?? '',
            category: draft.category ?? assetData.category ?? 'EQUIPMENT',
            description: draft.description ?? assetData.description ?? '',
            location: draft.location ?? assetData.location ?? '',
            quantity: draft.quantity ?? assetData.quantity ?? '',
            purchaseDate: draft.purchaseDate ? new Date(draft.purchaseDate) : assetData.purchaseDate ? new Date(assetData.purchaseDate) : undefined,
            purchaseCost: draft.purchaseCost ?? assetData.purchaseCost,
            status: draft.status ?? assetData.status ?? 'ACTIVE',
            assetImgFile: null
          });
          setImagePreview(draft.assetImgFile ? null : assetData.assetImg || null);
        }
      } catch (error: unknown) {
        console.error('Error fetching asset:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load asset';
        setErrors({ general: errorMessage });
      } finally {
        setLoading(false);
      }
    };

    fetchAssetAndDraft();
  }, [assetId]);

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
      setImagePreview(asset?.assetImg || null);
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
      const draftKey = `editAssetDraft_${assetId}_${userEmail}`;
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
        const draftKey = `editAssetDraft_${assetId}_${userEmail}`;
        localStorage.removeItem(draftKey);
        if (asset) {
          setFormData({
            name: asset.name || '',
            category: asset.category || 'EQUIPMENT',
            description: asset.description || '',
            location: asset.location || '',
            quantity: asset.quantity || '',
            purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : undefined,
            purchaseCost: asset.purchaseCost,
            status: asset.status || 'ACTIVE',
            assetImgFile: null
          });
          setImagePreview( asset.assetImg ? `${API_URL}${asset.assetImg}` : null);
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
      if (formData.name) formDataToSend.append('name', formData.name);
      if (formData.category) formDataToSend.append('category', formData.category);
      if (formData.quantity) formDataToSend.append('quantity', formData.quantity);
      if (formData.description) formDataToSend.append('description', formData.description);
      if (formData.location) formDataToSend.append('location', formData.location);
      if (formData.purchaseDate) formDataToSend.append('purchaseDate', formData.purchaseDate.toISOString());
      if (formData.purchaseCost !== undefined) formDataToSend.append('purchaseCost', formData.purchaseCost.toString());
      if (formData.status) formDataToSend.append('status', formData.status);
      if (formData.assetImgFile) formDataToSend.append('assetImg', formData.assetImgFile);

      await assetService.updateAsset(assetId!, formDataToSend);
      const userEmail = 'user@example.com'; // Replace with actual user email
      const draftKey = `editAssetDraft_${assetId}_${userEmail}`;
      localStorage.removeItem(draftKey);

      Swal.fire({
        title: 'Success!',
        text: 'The asset was updated successfully.',
        icon: 'success',
        confirmButtonText: 'OK',
        timer: 2000,
        timerProgressBar: true,
      });
      const url = role == 'admin' ? '/admin/dashboard/asset-management' : '/employee/dashboard/asset-management' 
      navigate(url, { replace: true });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update asset';
      console.error('Error in handleSubmit:', error);
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-11/12 mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Assets
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Edit Asset</h1>
            <p className="text-sm text-gray-600">Update asset details</p>
          </div>
        </div>

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
              <Package className="w-12 h-12 text-primary-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Asset Information</h2>
              <p className="text-gray-600">Update details for the asset</p>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                {imagePreview ? (
                  <div className="relative">
                   
                    <img
                      src={imagePreview.includes('http') ? imagePreview : imagePreview}
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
                      Updating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Update Asset
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-primary-50 rounded-xl p-6 mt-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-primary-900 mb-2">Need Help?</h3>
              <p className="text-primary-800 text-sm mb-3">
                Having trouble updating an asset? Here are some tips:
              </p>
              <ul className="text-primary-800 text-sm space-y-1">
                <li>• Make sure all required fields are completed</li>
                <li>• Upload images in supported formats (JPEG, PNG)</li>
                <li>• Ensure quantity is a valid number</li>
                <li>• Double-check asset details for accuracy</li>
              </ul>
              <div className="mt-4">
                <a 
                  href="mailto:support@abyhr.com" 
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Contact Support: support@abyhr.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAssetPage;
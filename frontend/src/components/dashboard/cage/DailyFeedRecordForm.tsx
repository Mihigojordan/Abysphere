/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Check, X, Wheat } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import feedCageService, { type FeedCageData, type FeedCage } from '../../../services/feedService';
import feedstockCategoryService, { type FeedstockCategory } from '../../../services/feedstockService';
import cageService, { type Cage } from '../../../services/cageService';
import Swal from 'sweetalert2';
import useAdminAuth from '../../../context/AdminAuthContext';
import useEmployeeAuth from '../../../context/EmployeeAuthContext';

interface FeedCageFormData {
  feedId: string;
  quantityGiven: string;
  notes: string;
}

interface Errors {
  [key: string]: string | null;
}

const FeedCageForm: React.FC<{ role: string }> = ({ role }) => {
  const { user: adminUser } = useAdminAuth();
  const { user: employeeUser } = useEmployeeAuth();
  const user = role === 'admin' ? adminUser : employeeUser;

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [prefilledCageId, setPrefilledCageId] = useState<string>('');
  const [feedStocks, setFeedStocks] = useState<FeedstockCategory[]>([]);
  const [formData, setFormData] = useState<FeedCageFormData>({
    feedId: '',
    quantityGiven: '',
    notes: '',
  });
  const navigate = useNavigate();
  const { id: feedCageId } = useParams<{ id?: string }>();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch cages and feed stocks
        const [cageData, feedStockData] = await Promise.all([
          cageService.getAllCages(),
          feedstockCategoryService.getAllFeedstockCategories(),
        ]);

        setFeedStocks(feedStockData || []);

        // Check for query parameters
        const queryParams = new URLSearchParams(location.search);
        const cageIdFromQuery = queryParams.get('cageId');

        if (feedCageId) {
          // Fetch existing feed cage for update mode
          const feedCage = await feedCageService.getFeedCageById(feedCageId);
          if (feedCage) {
            setFormData({
              feedId: feedCage.feedId,
              quantityGiven: feedCage.quantityGiven.toString(),
              notes: feedCage.notes || '',
            });
            setPrefilledCageId(feedCage.cageId || '');
          } else {
            throw new Error('Feed cage record not found');
          }
        } else if (cageIdFromQuery) {
          // Validate prefilled cageId
          const isValidCageId = cageData?.some((cage: Cage) => cage.id === cageIdFromQuery);
          if (isValidCageId) {
            setPrefilledCageId(cageIdFromQuery);
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
            text: 'A valid cage ID is required to create a feed cage record',
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
          text: error.message || 'Failed to load feed cage data',
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
  }, [feedCageId, location.search, user, role, navigate]);

  const handleInputChange = (field: keyof FeedCageFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = (): boolean => {
    const data: FeedCageData = {
      cageId: prefilledCageId,
      feedId: formData.feedId,
      quantityGiven: Number(formData.quantityGiven),
      notes: formData.notes || null,
      employeeId: role === 'employee' ? user?.id : null,
    };

    const validation = feedCageService.validateFeedCageData(data);
    const newErrors: Errors = {};

    validation.errors.forEach((error) => {
      if (error.includes('Feed ID')) newErrors.feedId = error;
      if (error.includes('Quantity')) newErrors.quantityGiven = error;
      if (error.includes('Cage ID')) newErrors.cageId = error;
    });

    setErrors(newErrors);
    return validation.isValid;
  };

  const handleSubmit = async () => {
    if (!user?.id && role === 'employee') {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Error',
        text: 'Employee not authenticated',
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
      const feedCageData: FeedCageData = {
        cageId: prefilledCageId,
        feedId: formData.feedId,
        quantityGiven: Number(formData.quantityGiven),
        notes: formData.notes || null,
        employeeId: role === 'employee' ? user?.id : null,
      };

      let response: FeedCage;
      if (feedCageId) {
        response = await feedCageService.updateFeedCage(feedCageId, feedCageData);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Feed cage record updated successfully',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
      } else {
        response = await feedCageService.createFeedCage(feedCageData);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Feed cage record created successfully',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
      }

      navigate(`/${role}/dashboard/cage-management/view/${prefilledCageId}?tab=feed`);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to save feed cage record',
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
    navigate(`/${role}/dashboard/cage-management/view/${prefilledCageId || ''}?tab=feed`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-xs">
            {feedCageId ? 'Loading feed cage record...' : 'Preparing form...'}
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
              {feedCageId ? 'Update Feed Record' : 'Add New Feed Record'}
            </h1>
            <p className="text-primary-100 text-xs mt-1">
              Fill in the details to {feedCageId ? 'update' : 'create'} a feed cage record
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Wheat className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">Feed Cage Information</h2>
            </div>
            <p className="text-xs text-gray-500">Enter the feeding details for this cage</p>
          </div>

          <div className="p-4 space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Feed Stock <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.feedId}
                  onChange={(e) => handleInputChange('feedId', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="" disabled>Select feed stock</option>
                  {feedStocks.map((feed) => (
                    <option key={feed.id} value={feed.id}>
                      {feed.name}
                    </option>
                  ))}
                </select>
                {errors.feedId && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.feedId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Quantity Given (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.quantityGiven}
                  onChange={(e) => handleInputChange('quantityGiven', e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter quantity given (kg)"
                  min="0"
                  step="0.1"
                />
                {errors.quantityGiven && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <X className="h-3 w-3" />
                    {errors.quantityGiven}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter notes (optional)"
                rows={4}
              />
            </div>

            {role === 'employee' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  <strong>Note:</strong> This feed record will be linked to your employee account.
                </p>
              </div>
            )}
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
                <span>{feedCageId ? 'Update Record' : 'Create Record'}</span>
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

export default FeedCageForm;
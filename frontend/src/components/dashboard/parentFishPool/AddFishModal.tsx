import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle, CheckCircle, Fish } from 'lucide-react';
import { type ParentFishPool } from '../../../services/parentFishPoolService';

interface AddFishModalProps {
  isOpen: boolean;
  pool: ParentFishPool | null;
  onClose: () => void;
  onAddFishes: (poolId: string, count: number) => Promise<void>;
}

const AddFishModal: React.FC<AddFishModalProps> = ({ isOpen, pool, onClose, onAddFishes }) => {
  const [fishCount, setFishCount] = useState<number | ''>('');
  const [errors, setErrors] = useState<{ fishCount?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setShowContent(true), 50);
      setFishCount('');
      setErrors({});
      setSubmitStatus('idle');
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: { fishCount?: string } = {};
    if (fishCount === '' || fishCount === null) {
      newErrors.fishCount = 'Number of fish is required';
    } else if (fishCount <= 0) {
      newErrors.fishCount = 'Number of fish must be greater than 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !pool) return;

    try {
      setIsSubmitting(true);
      setSubmitStatus('idle');
      await onAddFishes(pool.id, fishCount);
      setSubmitStatus('success');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Error adding fish to pool:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen || !pool) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        showContent ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
          showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Header */}
        <div className="relative px-6 pt-6 pb-8 bg-gradient-to-br from-blue-500 to-blue-600">
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
              <Fish className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Add Fish to Pool</h3>
              <p className="text-white/80 text-sm mt-0.5">Adding fish to "{pool.name}"</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Fish Count */}
          <div className="space-y-2">
            <label htmlFor="fishCount" className="block text-sm font-semibold text-gray-700">
              Number of Fish <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                id="fishCount"
                value={fishCount}
                onChange={(e) => setFishCount(e.target.value ? parseInt(e.target.value) : '')}
                className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all ${
                  errors.fishCount
                    ? 'border-red-300 focus:border-red-500 bg-red-50'
                    : 'border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white'
                }`}
                placeholder="e.g., 100"
                min="1"
                disabled={isSubmitting}
              />
              {fishCount && !errors.fishCount && (
                <CheckCircle className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />
              )}
            </div>
            {errors.fishCount && (
              <div className="flex items-start space-x-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{errors.fishCount}</span>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="flex items-center space-x-3 px-4 py-3 bg-green-50 border-2 border-green-200 rounded-xl text-sm text-green-800">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Fish added successfully!</span>
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="flex items-center space-x-3 px-4 py-3 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-800">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">Failed to add fish. Please try again.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || fishCount === '' || fishCount <= 0}
            className={`flex items-center space-x-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
              isSubmitting || fishCount === '' || fishCount <= 0
                ? 'bg-gray-400'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/50'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Add Fish</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFishModal;
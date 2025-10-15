import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import requestService, { type Request } from '../../../services/stockRequestService';
import useAdminAuth from '../../../context/AdminAuthContext';

interface RejectRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  requisition: Request | null;
  onReject: (updatedRequisition: Request) => void;
}

const RejectRequisitionModal: React.FC<RejectRequisitionModalProps> = ({
  isOpen,
  onClose,
  requisition,
  onReject,
}) => {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requisition || !reason) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updatedRequisition = await requestService.rejectRequest(requisition.id, comment || undefined);
      onReject(updatedRequisition);
      handleClose();
    } catch (err: any) {
      const errorMessage = err.message?.includes('not found')
        ? 'Requisition not found'
        : 'Failed to process rejection';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setComment('');
    setError(null);
    onClose();
  };

  if (!isOpen || !requisition) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Reject Requisition #{requisition.ref_no}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Reason */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Reason for Rejection
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter the reason for rejection"
                disabled={loading}
                required
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Comment (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                rows={4}
                placeholder="Enter any additional comments..."
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 text-red-800 text-xs bg-red-50 border border-red-200 rounded p-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Reject'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectRequisitionModal;
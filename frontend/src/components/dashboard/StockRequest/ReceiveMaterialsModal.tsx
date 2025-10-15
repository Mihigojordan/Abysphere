
import React, { useState, useEffect } from 'react';
import { X, CheckSquare, AlertCircle } from 'lucide-react';
import requestService, { type Request, type ReceiveMaterialsInput, type ReceiveMaterialsResponse } from '../../../services/stockRequestService';
import { type StockIn } from '../../../services/stockInService';
import useEmployeeAuth from '../../../context/EmployeeAuthContext';

interface ReceiveMaterialItem {
  requestItemId: string;
  qtyReceived: number | '';
}

interface ReceiveMaterialsModalProps {
  isOpen: boolean;
  requisition: Request | null;
  onClose: () => void;
  onReceive: (response: Request) => void;
  role: 'admin' | 'employee';
  stockins: StockIn[];
}

const ReceiveMaterialsModal: React.FC<ReceiveMaterialsModalProps> = ({
  isOpen,
  requisition,
  onClose,
  onReceive,
  role,
  stockins,
}) => {
  const [items, setItems] = useState<ReceiveMaterialItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {user} = useEmployeeAuth()

  // Initialize items when modal opens or requisition changes
  useEffect(() => {
    if (isOpen && requisition) {
      const initialItems = requisition.requestItems
        ?.filter((item) => {
          const qtyIssued = Number(item.qtyIssued || 0);
          const qtyReceived = Number(item.qtyReceived || 0);
          // Include items where qtyIssued > qtyReceived (unreceived quantities exist)
          return qtyIssued > qtyReceived;
        })
        .map((item) => {
          const qtyIssued = Number(item.qtyIssued || 0);
          const qtyReceived = Number(item.qtyReceived || 0);
          const unreceivedQty = qtyIssued - qtyReceived;
          return {
            requestItemId: item.id,
            qtyReceived: unreceivedQty,
          };
        }) || [];
      setItems(initialItems);
      setSubmitError(null);
    }
  }, [isOpen, requisition]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setItems([]);
      setSubmitError(null);
    }
  }, [isOpen]);

  const handleQuantityChange = (requestItemId: string, value: string) => {
    // Allow empty string for editing, convert to number when not empty
    const numValue = value === '' ? '' : parseFloat(value);
    setItems((prev) =>
      prev.map((item) =>
        item.requestItemId === requestItemId
          ? { ...item, qtyReceived: numValue === '' ? '' : isNaN(numValue) ? '' : numValue }
          : item
      )
    );
    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError(null);
    }
  };

  // Check if item is fully completed
  const isItemFullyCompleted = (item: any) => {
    const qtyIssued = Number(item.qtyIssued || 0);
    const qtyReceived = Number(item.qtyReceived || 0);
    const qtyRemaining = Number(item.qtyRemaining || 0);
    const qtyRequested = Number(item.qtyRequested || 0);
    // Item is fully completed if qtyIssued > 0, qtyRemaining = 0, qtyIssued >= qtyRequested, and qtyReceived = qtyIssued
    return qtyIssued > 0 && qtyRemaining === 0 && qtyIssued >= qtyRequested && qtyReceived === qtyIssued;
  };

  // Validation for each item
  const getItemValidation = (item: ReceiveMaterialItem) => {
    const requisitionItem = requisition?.requestItems.find((ri) => ri.id === item.requestItemId);
    if (!requisitionItem) return { isValid: false, message: 'Item not found' };

    const qtyIssued = Number(requisitionItem.qtyIssued || 0);
    const qtyReceived = Number(requisitionItem.qtyReceived || 0);
    const maxQty = qtyIssued - qtyReceived;
    const qtyReceivedInput = typeof item.qtyReceived === 'string' ? parseFloat(item.qtyReceived) : Number(item.qtyReceived);

    if (item.qtyReceived === '' || item.qtyReceived === null || item.qtyReceived === undefined) {
      return { isValid: false, message: 'Quantity is required' };
    }

    if (isNaN(qtyReceivedInput) || qtyReceivedInput <= 0) {
      return { isValid: false, message: 'Must be greater than 0' };
    }

    if (qtyReceivedInput > maxQty) {
      return { isValid: false, message: `Cannot exceed unreceived quantity (${maxQty})` };
    }

    return { isValid: true, message: '' };
  };

  const isFormValid = () => {
    return items.length > 0 && items.every((item) => getItemValidation(item).isValid);
  };

  const handleSubmit = async () => {
    if (!requisition?.id) {
      setSubmitError('No requisition selected');
      return;
    }

    if (!isFormValid()) {
      setSubmitError('Please correct all quantity errors before submitting');
      return;
    }

    try {
      setLoading(true);
      setSubmitError(null);
      const payload: ReceiveMaterialsInput = {
        requestId: requisition.id,
        // receivedByAdminId: role === 'admin' ? 'current-admin-id' : undefined, // Replace with actual admin ID
        receivedByEmployeeId: user.id, // Replace with actual employee ID
        items: items.map((item) => ({
          requestItemId: item.requestItemId,
          qtyReceived: Number(item.qtyReceived),
        })),
      };
      const response = await requestService.receiveMaterials(payload);
      const updatedRequest = await requestService.getRequestById(requisition.id); // Fetch updated request
      onReceive(updatedRequest);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      const errorMessage =
        err.message.includes('not found')
          ? 'Request or item not found'
          : err.message.includes('more than issued')
          ? 'Cannot receive more than issued quantity'
          : err.message || 'Failed to receive materials';
      setSubmitError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setItems([]);
      setSubmitError(null);
      onClose();
    }
  };

  if (!isOpen || !requisition) return null;

  const notIssuedItems = requisition.requestItems?.filter((item) => Number(item.qtyIssued || 0) === 0) || [];
  const fullyCompletedItems = requisition.requestItems?.filter(isItemFullyCompleted) || [];
  const receivableItems = requisition.requestItems?.filter((item) => {
    const qtyIssued = Number(item.qtyIssued || 0);
    const qtyReceived = Number(item.qtyReceived || 0);
    return qtyIssued > qtyReceived && !isItemFullyCompleted(item);
  }) || [];
  const allItems = requisition.requestItems || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Receive Materials for Requisition #{requisition.ref_no}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {/* Submit Error */}
          {submitError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-center space-x-2 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Requisition Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-xs text-gray-600 mb-1">
              <span className="font-medium">Site:</span> {requisition.site?.name || 'N/A'}
            </p>
            <p className="text-xs text-gray-600">
              <span className="font-medium">Requested By:</span>{' '}
              {requisition.requestedByAdmin?.full_name || requisition.requestedByEmployee?.full_name || 'N/A'}
            </p>
          </div>

          {/* Materials Table */}
          {allItems.length > 0 ? (
            <div className="border border-gray-200 rounded overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-3 text-gray-600 font-medium">Material</th>
                    <th className="text-left py-3 px-3 text-gray-600 font-medium">Unit</th>
                    <th className="text-right py-3 px-3 text-gray-600 font-medium">Requested</th>
                    <th className="text-right py-3 px-3 text-gray-600 font-medium">Issued</th>
                    <th className="text-right py-3 px-3 text-gray-600 font-medium">Already Received</th>
                    <th className="text-right py-3 px-3 text-gray-600 font-medium">Receive Now</th>
                    <th className="text-left py-3 px-3 text-gray-600 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allItems.map((requisitionItem) => {
                    const item = items.find((i) => i.requestItemId === requisitionItem.id);
                    const validation = item ? getItemValidation(item) : { isValid: true, message: '' };
                    const qtyIssued = Number(requisitionItem.qtyIssued || 0);
                    const qtyReceived = Number(requisitionItem.qtyReceived || 0);
                    const qtyRemaining = Number(requisitionItem.qtyRemaining || 0);
                    const isCompleted = isItemFullyCompleted(requisitionItem);
                    const canReceive = qtyIssued > qtyReceived && !isCompleted;
                    const stockIn = stockins.find((s) => s.id === requisitionItem.stockInId);

                    return (
                      <tr
                        key={requisitionItem.id}
                        className={`hover:bg-gray-25 ${!canReceive ? 'bg-gray-50' : ''}`}
                      >
                        <td className="py-3 px-3 text-gray-700">{stockIn?.productName || 'N/A'}</td>
                        <td className="py-3 px-3 text-gray-700">{stockIn?.unit || 'N/A'}</td>
                        <td className="py-3 px-3 text-right text-gray-700">
                          {Number(requisitionItem.qtyRequested) || 0}
                        </td>
                        <td className="py-3 px-3 text-right text-gray-700 font-medium">{qtyIssued}</td>
                        <td className="py-3 px-3 text-right text-gray-600">{qtyReceived}</td>
                        <td className="py-3 px-3">
                          {canReceive ? (
                            <div className="flex flex-col items-end space-y-1">
                              <input
                                type="number"
                                step="0.001"
                                min="0"
                                max={qtyIssued - qtyReceived}
                                value={item?.qtyReceived ?? ''}
                                onChange={(e) => handleQuantityChange(requisitionItem.id, e.target.value)}
                                placeholder="0"
                                className={`w-24 px-2 py-1 border rounded text-xs text-right focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                                  !validation.isValid ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                                disabled={loading}
                                aria-label={`Quantity received for ${stockIn?.productName || 'item'}`}
                              />
                              {!validation.isValid && validation.message && (
                                <p className="text-red-500 text-xs">{validation.message}</p>
                              )}
                            </div>
                          ) : (
                            <div className="flex justify-end">
                              <span className="text-gray-400 text-xs">-</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          {!qtyIssued ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-yellow-50 text-yellow-700 border border-yellow-200">
                              Not yet issued
                            </span>
                          ) : isCompleted ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-50 text-green-700 border border-green-200">
                              ✓ Fully completed
                            </span>
                          ) : qtyRemaining > 0 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">
                              {qtyRemaining} remaining
                            </span>
                          ) : qtyReceived < qtyIssued ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-orange-50 text-orange-700 border border-orange-200">
                              Pending receipt
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-50 text-gray-700 border border-gray-200">
                              Ready
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-xs">
              No materials in this requisition.
            </div>
          )}

          {/* Info messages */}
          {fullyCompletedItems.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded flex items-start space-x-2 text-green-800 text-xs">
              <CheckSquare className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Fully completed materials</p>
                <p className="text-green-700">
                  {fullyCompletedItems.length} material{fullyCompletedItems.length > 1 ? 's have' : ' has'} been fully issued and received.
                </p>
              </div>
            </div>
          )}

          {notIssuedItems.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-start space-x-2 text-yellow-800 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Some materials are not yet issued</p>
                <p className="text-yellow-700">
                  {notIssuedItems.length} material{notIssuedItems.length > 1 ? 's' : ''} {notIssuedItems.length > 1 ? 'are' : 'is'} waiting to be issued by the storekeeper.
                </p>
              </div>
            </div>
          )}

          {allItems.some((item) => Number(item.qtyRemaining || 0) > 0 && Number(item.qtyIssued || 0) > 0 && !isItemFullyCompleted(item)) && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded flex items-start space-x-2 text-blue-800 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Materials will be delivered soon</p>
                <p className="text-blue-700">
                  Some materials have remaining quantities that will be issued and delivered in the next batch.
                </p>
              </div>
            </div>
          )}

          {receivableItems.length === 0 && allItems.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded flex items-start space-x-2 text-gray-700 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">No materials available to receive</p>
                <p className="text-gray-600 mt-1">
                  All materials have either been fully received or are not yet issued.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !isFormValid() || receivableItems.length === 0}
            className="flex items-center space-x-1 px-4 py-2 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <CheckSquare className="w-4 h-4" />
            <span>{loading ? 'Processing...' : 'Confirm Receipt'}</span>
          </button>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700 text-sm font-medium">Processing receipt...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiveMaterialsModal;

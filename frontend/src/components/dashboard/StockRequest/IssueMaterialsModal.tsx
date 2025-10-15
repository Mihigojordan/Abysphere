import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, Package } from 'lucide-react';
import requestService, { type Request, type IssueMaterialsInput } from '../../../services/stockRequestService';
import { type StockIn } from '../../../services/stockInService';
import useAdminAuth from '../../../context/AdminAuthContext';


interface RequestItem {
  id: string;
  qtyRequested: number;
  qtyIssued: number;
  qtyRemaining: number;
  stockInId: string;
  stockIn?: {
    productName: string;
    unit: string;
    quantity: number;
    location: string;
  };
}

interface IssueMaterialItem {
  requestItemId: string;
  qtyIssued: number;
  checked: boolean;
  stockInId: string;
}

interface IssueMaterialForm {
  requestId: string;
  items: IssueMaterialItem[];
  notes: string;
}

interface OperationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface IssueMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request | null;
  onIssue: (updatedRequest: Request) => void;
  role: 'admin' | 'employee';
  stockins: StockIn[];
}

const IssueMaterialsModal: React.FC<IssueMaterialsModalProps> = ({
  isOpen,
  onClose,
  request,
  onIssue,
  role,
  stockins,
}) => {
  if (role !== 'admin') {
    return null;
  }

  const { user } = useAdminAuth();
  const [issueForm, setIssueForm] = useState<IssueMaterialForm>({
    requestId: '',
    items: [],
    notes: '',
  });
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const requestItems = request?.requestItems || [];

  useEffect(() => {
    if (isOpen && request) {
      const items = request.requestItems.map((item) => {
        const qtyRequested = Number(item.qtyRequested) || 0;
        const qtyRemaining = Number(item.qtyRemaining) || 0;
        const defaultQty = qtyRemaining > 0 ? qtyRemaining : qtyRequested;

        return {
          requestItemId: item.id,
          qtyIssued: defaultQty,
          checked: false,
          stockInId: item.stockInId,
        };
      });

      const defaultNotes = `Issued to ${
        request.requestedByAdmin?.adminName || request.requestedByEmployee?.full_name || 'N/A'
      } for ${request.site?.name || 'N/A'}`;

      setIssueForm({ requestId: request.id, items, notes: defaultNotes });
      setShowConfirm(false);
    }
  }, [isOpen, request]);

  const showOperationStatus = (type: OperationStatus['type'], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleItemCheck = (requestItemId: string, checked: boolean) => {
    setIssueForm((prevForm) => {
      const updatedItems = prevForm.items.map((item) => {
        if (item.requestItemId === requestItemId) {
          if (checked) {
            const requestItem = requestItems.find((ri) => ri.id === requestItemId);
            if (requestItem) {
              const qtyRemaining = Number(requestItem.qtyRemaining) || 0;
              const qtyRequested = Number(requestItem.qtyRequested) || 0;
              const stockIn = stockins.find((s) => s.id === requestItem.stockInId);
              const availableQty = stockIn?.quantity || 0;
              const autoQty = qtyRemaining > 0 ? qtyRemaining : qtyRequested;
              const finalQty = Math.min(autoQty, availableQty);
              return { ...item, checked, qtyIssued: finalQty };
            }
          }
          return { ...item, checked };
        }
        return item;
      });

      return { ...prevForm, items: updatedItems };
    });
    setShowConfirm(false);
  };

  const debouncedHandleQuantityChange = (requestItemId: string, qty: number) => {
    setIssueForm((prevForm) => {
      const selectedItem = requestItems.find((item) => item.id === requestItemId);
      if (!selectedItem) return prevForm;

      const qtyRemaining = Number(selectedItem.qtyRemaining) || 0;
      const qtyRequested = Number(selectedItem.qtyRequested) || 0;
      const qtyIssued = Number(selectedItem.qtyIssued) || 0;
      let maxQty = qtyRemaining > 0 ? qtyRemaining : qtyRequested - qtyIssued;
      const stockIn = stockins.find((s) => s.id === selectedItem.stockInId);
      const availableQty = stockIn?.quantity || 0;
      const validatedQty = Math.max(0, Math.min(qty, maxQty, availableQty));

      return {
        ...prevForm,
        items: prevForm.items.map((item) =>
          item.requestItemId === requestItemId ? { ...item, qtyIssued: validatedQty } : item
        ),
      };
    });
    setShowConfirm(false);
  };

  const handleQuantityChange = (requestItemId: string, qty: number) => {
    debouncedHandleQuantityChange(requestItemId, qty);
  };

  const handleIssueMaterials = async () => {
    if (!issueForm.requestId || issueForm.items.every((item) => !item.checked)) {
      showOperationStatus('error', 'Please select at least one item to issue');
      return;
    }

    const invalidItems = issueForm.items.filter(
      (item) => item.checked && (item.qtyIssued <= 0 || isNaN(item.qtyIssued) || !item.stockInId)
    );
    if (invalidItems.length > 0) {
      showOperationStatus('error', 'Invalid quantities or no stock available for selected items');
      return;
    }

    for (const item of issueForm.items.filter((item) => item.checked)) {
      const requestItem = requestItems.find((ri) => ri.id === item.requestItemId);
      if (requestItem) {
        const stockIn = stockins.find((s) => s.id === requestItem.stockInId);
        const availableQty = stockIn?.quantity || 0;

        if (!stockIn) {
          showOperationStatus('error', `No stock available for ${requestItem.stockIn?.productName || 'item'}`);
          return;
        }

        if (item.qtyIssued > availableQty) {
          showOperationStatus(
            'error',
            `Insufficient stock for ${requestItem.stockIn?.productName || 'item'}. Available: ${availableQty}`
          );
          return;
        }

        const qtyRemaining = Number(requestItem.qtyRemaining) || 0;
        const qtyRequested = Number(requestItem.qtyRequested) || 0;
        const qtyIssued = Number(requestItem.qtyIssued) || 0;
        const maxQty = qtyRemaining > 0 ? qtyRemaining : qtyRequested - qtyIssued;

        if (item.qtyIssued > maxQty) {
          showOperationStatus(
            'error',
            `Cannot exceed remaining quantity for ${requestItem.stockIn?.productName || 'item'}. Max: ${maxQty}`
          );
          return;
        }
      }
    }

    setShowConfirm(true);
  };

  const confirmIssueMaterials = async () => {
    try {
      setOperationLoading(true);
      const payload: IssueMaterialsInput = {
        requestId: issueForm.requestId,
        issuedByAdminId: user?.id || 'current-admin-id', // Fallback if user ID is unavailable
        items: issueForm.items
          .filter((item) => item.checked)
          .map((item) => ({
            requestItemId: item.requestItemId,
            qtyIssued: item.qtyIssued,
            notes: issueForm.notes,
          })),
      };

      await requestService.issueMaterials(payload);
      const updatedRequest = await requestService.getRequestById(issueForm.requestId);
      onIssue(updatedRequest);
      showOperationStatus('success', `Materials for request #${request?.ref_no} issued successfully`, 3000);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.message?.includes('not found')
        ? 'Request or item not found'
        : err.message?.includes('more than requested')
        ? 'Cannot issue more than requested quantity'
        : err.message?.includes('Insufficient stock')
        ? err.message
        : 'Failed to issue materials';
      showOperationStatus('error', errorMessage);
    } finally {
      setOperationLoading(false);
    }
  };

  const renderConfirmation = () => {
    if (!showConfirm) return null;

    const selectedItems = issueForm.items.filter((item) => item.checked);

    return (
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-3">
          <AlertCircle className="w-4 h-4 text-blue-600" />
          <h4 className="text-sm font-semibold text-blue-900">Confirm Issuance</h4>
        </div>
        <p className="text-sm text-blue-700 mb-3">You are about to issue the following items:</p>
        <div className="bg-white border border-blue-200 rounded p-3 mb-4 max-h-32 overflow-y-auto">
          {selectedItems.map((item) => {
            const requestItem = requestItems.find((ri) => ri.id === item.requestItemId);
            const stockIn = stockins.find((s) => s.id === item.stockInId);
            return (
              <div
                key={item.requestItemId}
                className="flex justify-between items-center py-1 border-b border-blue-100 last:border-b-0"
              >
                <span className="text-sm font-medium text-gray-900">
                  {requestItem?.stockIn?.productName || 'N/A'}
                </span>
                <span className="text-sm text-gray-600">
                  {item.qtyIssued} {stockIn?.unit || ''}
                  <span className="text-xs text-gray-500 ml-1">({stockIn?.location || 'N/A'})</span>
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => setShowConfirm(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            disabled={operationLoading}
          >
            Cancel
          </button>
          <button
            onClick={confirmIssueMaterials}
            disabled={operationLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Confirm Issue
          </button>
        </div>
      </div>
    );
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Issue Materials for #{request.ref_no}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded transition-colors duration-200"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {requestItems.length === 0 ? (
            <div className="text-center py-6">
              <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No items available to issue.</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Requested Items
              </label>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {requestItems.map((item) => {
                  const formItem = issueForm.items.find((i) => i.requestItemId === item.id);
                  const qtyIssued = Number(item.qtyIssued) || 0;
                  const qtyRequested = Number(item.qtyRequested) || 0;
                  const qtyRemaining = Number(item.qtyRemaining) || 0;

                  const maxQty = qtyRemaining > 0 ? qtyRemaining : qtyRequested - qtyIssued;

                  const isFullyIssued = qtyIssued >= qtyRequested && maxQty <= 0;
                  const isPartiallyIssued = qtyIssued > 0 && maxQty > 0;

                  const stockIn = stockins.find((s) => s.id === item.stockInId);
                  const availableQty = stockIn?.quantity || 0;
                  const hasInsufficientStock = availableQty === 0;

                  return (
                    <div
                      key={item.id}
                      className={`border rounded-lg p-4 transition-colors duration-200 ${
                        isFullyIssued
                          ? 'border-green-200 bg-green-50'
                          : isPartiallyIssued
                          ? 'border-orange-200 bg-orange-50'
                          : formItem?.checked
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={formItem?.checked || false}
                          onChange={(e) => handleItemCheck(item.id, e.target.checked)}
                          className="mt-1 h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          disabled={isFullyIssued || operationLoading || !stockIn || hasInsufficientStock}
                          aria-label={`Select ${item.stockIn?.productName || 'item'}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <p
                              className={`text-sm font-medium ${
                                isFullyIssued
                                  ? 'text-green-700'
                                  : isPartiallyIssued
                                  ? 'text-orange-700'
                                  : 'text-gray-900'
                              }`}
                            >
                              {item.stockIn?.productName || 'N/A'}
                              {isFullyIssued && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Fully Issued
                                </span>
                              )}
                              {isPartiallyIssued && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  Partially Issued
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="text-sm text-gray-600 mb-3 space-y-1">
                            <div className="flex justify-between">
                              <span>Requested: {qtyRequested} {item.stockIn?.unit || ''}</span>
                            </div>
                            {qtyIssued > 0 && (
                              <div className="flex justify-between font-medium text-orange-600">
                                <span>Already Issued: {qtyIssued} {item.stockIn?.unit || ''}</span>
                                {qtyRemaining > 0 && (
                                  <span className="text-primary-600">
                                    Remaining: {qtyRemaining} {item.stockIn?.unit || ''}
                                  </span>
                                )}
                              </div>
                            )}
                            <div
                              className={`text-sm ${
                                stockIn && !hasInsufficientStock ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              Available: {stockIn ? `${availableQty} in ${stockIn.location || 'N/A'}` : 'No stock available'}
                            </div>
                          </div>
                          {formItem?.checked && !isFullyIssued && stockIn && !hasInsufficientStock && (
                            <div className="pt-3 border-t border-gray-200">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Quantity to Issue
                                {isPartiallyIssued && (
                                  <span className="text-xs text-orange-600 ml-2">
                                    (Remaining: {maxQty})
                                  </span>
                                )}
                              </label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={formItem.qtyIssued}
                                  onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                                  className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                                  min="0"
                                  max={Math.min(maxQty, availableQty)}
                                  step="0.01"
                                  placeholder={`Max ${Math.min(maxQty, availableQty)}`}
                                  disabled={operationLoading}
                                  aria-label={`Quantity for ${item.stockIn?.productName || 'item'}`}
                                />
                                <span className="text-sm text-gray-500 min-w-0">
                                  {item.stockIn?.unit || ''}
                                </span>
                              </div>
                              {formItem.qtyIssued > maxQty && (
                                <p className="text-sm text-red-600 mt-2 flex items-center space-x-1">
                                  <XCircle className="w-4 h-4" />
                                  <span>Cannot exceed remaining quantity ({maxQty})</span>
                                </p>
                              )}
                              {formItem.qtyIssued > availableQty && (
                                <p className="text-sm text-red-600 mt-2 flex items-center space-x-1">
                                  <XCircle className="w-4 h-4" />
                                  <span>Insufficient stock. Available: {availableQty}</span>
                                </p>
                              )}
                            </div>
                          )}
                          {(!stockIn || hasInsufficientStock) && (
                            <p className="text-sm text-red-600 mt-2 flex items-center space-x-1">
                              <XCircle className="w-4 h-4" />
                              <span>No stock available for this item</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={issueForm.notes}
              onChange={(e) => setIssueForm((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-colors duration-200"
              rows={3}
              disabled={operationLoading}
              placeholder="Add any additional notes..."
              aria-label="Additional notes"
            />
          </div>

          {renderConfirmation()}
        </div>

        {!showConfirm && (
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              disabled={operationLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleIssueMaterials}
              disabled={operationLoading || !requestItems.length}
              className="px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Issue
            </button>
          </div>
        )}
      </div>

      {operationStatus && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] transition-all duration-300 ${
              operationStatus.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : operationStatus.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-primary-50 border border-primary-200 text-primary-800'
            }`}
          >
            {operationStatus.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {operationStatus.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
            {operationStatus.type === 'info' && <AlertCircle className="w-5 h-5 text-primary-600" />}
            <span className="font-medium text-sm flex-1">{operationStatus.message}</span>
            <button
              onClick={() => setOperationStatus(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {operationLoading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700 text-sm font-medium">Processing...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueMaterialsModal;
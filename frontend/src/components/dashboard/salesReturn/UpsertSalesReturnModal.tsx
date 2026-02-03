/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Search,
  Package,
  Hash,
  User,
  Mail,
  Phone,
  Calendar,
  RotateCcw,
  AlertTriangle,
  Check,
  X,
  Info,
} from 'lucide-react';
import stockOutService from "../../../services/stockoutService";

// ──────────────────────────────────────────────────────────────
// Types & Interfaces (Prisma-aligned)
// ──────────────────────────────────────────────────────────────

interface StockIn {
  id: number;
  sku: string;
  itemName: string;
  categoryId?: string;
  supplier?: string;
  unitOfMeasure: string;
  receivedQuantity: number;
  unitCost: string; // Decimal as string
  totalValue: string;
  warehouseLocation: string;
  receivedDate: string;
  reorderLevel: number;
  adminId: string;
  createdAt: string;
  updatedAt: string;
}

interface StockOutItem {
  id: string; // UUID
  stockinId?: number;
  adminId?: string;
  employeeId?: string;
  transactionId?: string;
  quantity: number;
  soldPrice?: string; // Decimal as string
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  stockin?: StockIn;
}

interface SelectedItem {
  stockoutId: string;
  quantity: number;
  maxQuantity: number;
  itemName: string;
  sku: string;
  unitPrice: number;
  soldPrice: number;
  soldQuantity: number;
}

interface ValidationErrors {
  [stockoutId: string]: string;
}

interface UpsertSalesReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    transactionId: string;
    reason: string;
    items: { stockoutId: string; quantity: number }[];
  }) => void;
  isLoading: boolean;
  title: string;
  currentUser: any;
  userRole: 'admin' | 'employee';
}

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────
const UpsertSalesReturnModal: React.FC<UpsertSalesReturnModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  title,
  currentUser,
  userRole,
}) => {
  const [transactionId, setTransactionId] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [soldProducts, setSoldProducts] = useState<StockOutItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>('');
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const commonReasons: string[] = [
    'Defective product',
    'Wrong item ordered',
    'Damaged during shipping',
    'Customer changed mind',
    'Product expired',
    'Size/color mismatch',
    'Quality issues',
    'Not as described',
    'Duplicate order',
    'Other'
  ];

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  const resetForm = (): void => {
    setTransactionId('');
    setReason('');
    setSoldProducts([]);
    setSelectedItems([]);
    setIsSearching(false);
    setSearchError('');
    setHasSearched(false);
    setValidationErrors({});
  };

  const handleSearchTransaction = async (): Promise<void> => {
    if (!transactionId.trim()) {
      setSearchError('Please enter a transaction ID');
      return;
    }

    setIsSearching(true);
    setSearchError('');
    setHasSearched(false);

    try {
      const response: StockOutItem[] = await stockOutService.getStockOutByTransactionId(transactionId.trim());

      if (response && response.length > 0) {
        const available = response.filter(item => item.quantity > 0 && item.stockin);
        if (available.length > 0) {
          setSoldProducts(available);
          setHasSearched(true);
          setSelectedItems([]);
        } else {
          setSoldProducts([]);
          setSearchError('All items from this transaction have been returned');
          setHasSearched(true);
        }
      } else {
        setSoldProducts([]);
        setSearchError('No products found for this transaction ID');
        setHasSearched(true);
      }
    } catch (error: any) {
      console.error('Error searching transaction:', error);
      setSearchError(`Failed to find transaction: ${error.message || 'Unknown error'}`);
      setSoldProducts([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleItemSelect = (stockoutId: string, isSelected: boolean): void => {
    if (isSelected) {
      const product = soldProducts.find(p => p.id === stockoutId);
      if (product && product.stockin) {
        const unitPrice = product.soldPrice
          ? parseFloat(product.soldPrice) / product.quantity
          : 0;

        const newItem: SelectedItem = {
          stockoutId,
          quantity: 1,
          maxQuantity: product.quantity,
          itemName: product.stockin.itemName,
          sku: product.stockin.sku,
          unitPrice,
          soldPrice: parseFloat(product.soldPrice || '0'),
          soldQuantity: product.quantity
        };
        setSelectedItems(prev => [...prev, newItem]);
      }
    } else {
      setSelectedItems(prev => prev.filter(item => item.stockoutId !== stockoutId));
    }

    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[stockoutId];
      return newErrors;
    });
  };

  const handleQuantityChange = (stockoutId: string, quantity: string): void => {
    const num = parseInt(quantity) || 0;
    setSelectedItems(prev =>
      prev.map(item =>
        item.stockoutId === stockoutId
          ? { ...item, quantity: Math.min(Math.max(0, num), item.maxQuantity) }
          : item
      )
    );

    if (num > 0) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[stockoutId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    let isValid = true;

    if (!transactionId.trim()) {
      setSearchError('Transaction ID is required');
      return false;
    }
    if (!reason.trim()) {
      setSearchError('Return reason is required');
      return false;
    }
    if (selectedItems.length === 0) {
      setSearchError('Please select at least one item to return');
      return false;
    }

    selectedItems.forEach(item => {
      if (item.quantity <= 0) {
        errors[item.stockoutId] = 'Quantity must be greater than 0';
        isValid = false;
      }
      if (item.quantity > item.maxQuantity) {
        errors[item.stockoutId] = `Max: ${item.maxQuantity}`;
        isValid = false;
      }
    });

    setValidationErrors(errors);
    if (!isValid) setSearchError('Fix quantity errors below');
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!validateForm()) return;

    const returnData = {
      transactionId: transactionId.trim(),
      reason: reason.trim(),
      items: selectedItems.map(item => ({
        stockoutId: item.stockoutId,
        quantity: item.quantity
      }))
    };

    onSubmit(returnData);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'RWF'
    }).format(price);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotalRefund = (): number => {
    return selectedItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  };

  const calculateTotalQuantity = (): number => {
    return selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const isItemSelected = (id: string): boolean => selectedItems.some(i => i.stockoutId === id);
  const getSelectedItem = (id: string): SelectedItem | undefined => selectedItems.find(i => i.stockoutId === id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl w-full max-w-6xl mx-4 max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-primary-600" />
                {title}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Search transaction → select items → process return</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* User Info */}
            {currentUser && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} className="text-blue-600" />
                  <span className="font-medium text-blue-900">Processing as: {userRole}</span>
                </div>
                <p className="text-sm text-blue-700">
                  {userRole === 'admin' ? currentUser.adminName : `${currentUser.firstname} ${currentUser.lastname}`}
                  {currentUser.email && ` (${currentUser.email})`}
                </p>
              </div>
            )}

            {/* Transaction Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => { setTransactionId(e.target.value); setSearchError(''); }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchTransaction()}
                  placeholder="e.g., ABTR64943"
                  disabled={isSearching}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <button
                  onClick={handleSearchTransaction}
                  disabled={isSearching || !transactionId.trim()}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                  {isSearching ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Search size={16} />
                  )}
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
              {searchError && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  <AlertTriangle size={16} />
                  {searchError}
                </div>
              )}
            </div>

            {/* Results */}
            {hasSearched && soldProducts.length > 0 && (
              <>
                {/* Transaction Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Info size={16} className="text-gray-600" />
                    Transaction Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Hash size={14} className="text-gray-400" />
                      <span className="text-gray-600">ID:</span>
                      <span className="font-medium">{soldProducts[0].transactionId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-400" />
                      <span className="text-gray-600">Client:</span>
                      <span className="font-medium">{soldProducts[0].clientName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{formatDate(soldProducts[0].createdAt)}</span>
                    </div>
                    {soldProducts[0].clientEmail && (
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-xs">{soldProducts[0].clientEmail}</span>
                      </div>
                    )}
                    {soldProducts[0].clientPhone && (
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{soldProducts[0].clientPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Return Reason */}
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Info size={16} className="text-yellow-600" />
                    Return Reason <span className="text-red-500">*</span>
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Applies to all returned items.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={reason}
                      onChange={(e) => { setReason(e.target.value); setSearchError(''); }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select reason...</option>
                      {commonReasons.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => { setReason(e.target.value); setSearchError(''); }}
                      placeholder="Custom reason"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Package size={16} className="text-gray-600" />
                    Select Items to Return
                  </h3>
                  <div className="space-y-3">
                    {soldProducts.map((product) => {
                      const isSel = isItemSelected(product.id);
                      const selItem = getSelectedItem(product.id);
                      const hasErr = validationErrors[product.id];
                      const unitPrice = product.soldPrice ? parseFloat(product.soldPrice) / product.quantity : 0;

                      return (
                        <div
                          key={product.id}
                          className={`border rounded-lg p-4 transition-all ${
                            isSel ? 'border-primary-300 bg-primary-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                          } ${hasErr ? 'border-red-300 bg-red-50' : ''}`}
                        >
                          <div className="flex items-start gap-4">
                            <input
                              type="checkbox"
                              checked={isSel}
                              onChange={(e) => handleItemSelect(product.id, e.target.checked)}
                              className="mt-1 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white">
                                    <Package size={18} />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900 text-lg">
                                      {product.stockin?.itemName || 'Unknown Item'}
                                    </h4>
                                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                      <span>SKU: {product.stockin?.sku || 'N/A'}</span>
                                      <span>•</span>
                                      <span>Avail: {product.quantity} {product.stockin?.unitOfMeasure}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-gray-900 text-lg">
                                    {formatPrice(parseFloat(product.soldPrice || '0'))}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {formatPrice(unitPrice)} / {product.stockin?.unitOfMeasure}
                                  </div>
                                </div>
                              </div>

                              {isSel && selItem && (
                                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Qty to Return <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="number"
                                        min="1"
                                        max={selItem.maxQuantity}
                                        value={selItem.quantity}
                                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                        className={`w-full text-center font-medium px-3 py-2 border rounded-lg focus:ring-2 ${
                                          hasErr ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
                                        }`}
                                      />
                                      <p className="text-xs text-gray-500 text-center mt-1">Max: {selItem.maxQuantity}</p>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">Refund</label>
                                      <div className="w-full px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-center">
                                        <span className="font-bold text-green-600 text-lg">
                                          {formatPrice(selItem.unitPrice * selItem.quantity)}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-500 text-center mt-1">
                                        {formatPrice(selItem.unitPrice)} × {selItem.quantity}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {hasErr && (
                                <div className="mt-3 flex items-center gap-2 text-red-600 text-sm bg-red-100 p-2 rounded-lg">
                                  <AlertTriangle size={14} />
                                  {hasErr}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Summary */}
                {selectedItems.length > 0 && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                      <Check size={16} />
                      Return Summary
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-green-700">{selectedItems.length}</div>
                        <div className="text-green-600">Items</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-green-700">{calculateTotalQuantity()}</div>
                        <div className="text-green-600">Qty</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-green-700">{formatPrice(calculateTotalRefund())}</div>
                        <div className="text-green-600">Refund</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-green-700">
                          {formatPrice(calculateTotalRefund() / calculateTotalQuantity() || 0)}
                        </div>
                        <div className="text-green-600">Avg/Unit</div>
                      </div>
                    </div>
                    {reason && (
                      <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                        <div className="text-sm text-gray-600">Reason:</div>
                        <div className="font-medium text-gray-900">{reason}</div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {hasSearched && soldProducts.length === 0 && !searchError && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RotateCcw className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Returnable Items</h3>
                <p className="text-gray-600">
                  Transaction <strong>{transactionId}</strong> has no returnable items.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || selectedItems.length === 0 || !reason.trim()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 font-medium"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <RotateCcw size={16} />
                  Process Return ({selectedItems.length} items)
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpsertSalesReturnModal;
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
import { motion } from "framer-motion";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-theme-bg-primary rounded-xl border border-theme-border w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-theme-border bg-theme-bg-secondary">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-theme-text-primary flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-primary-600" />
                {title}
              </h2>
              <p className="text-[10px] text-theme-text-secondary mt-1">Search transaction → select items → process return</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-theme-bg-tertiary rounded-lg transition-colors">
              <X size={20} className="text-theme-text-secondary" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* User Info */}
            {currentUser && (
              <div className="mb-6 p-4 bg-primary-500/10 border border-primary-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <User size={14} className="text-primary-600" />
                  <span className="font-semibold text-xs text-theme-text-primary">Processing as: <span className="capitalize">{userRole}</span></span>
                </div>
                <p className="text-[11px] text-theme-text-secondary">
                  {userRole === 'admin' ? currentUser.adminName : `${currentUser.firstname} ${currentUser.lastname}`}
                  {currentUser.email && ` (${currentUser.email})`}
                </p>
              </div>
            )}

            {/* Transaction Search */}
            <div className="mb-6">
              <label className="block text-[10px] font-semibold text-theme-text-secondary uppercase tracking-wider mb-2">
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
                  className="flex-1 px-3 py-2 bg-theme-bg-secondary border border-theme-border rounded-lg text-theme-text-primary focus:ring-1 focus:ring-primary-500 outline-none text-[11px] transition-all"
                />
                <button
                  onClick={handleSearchTransaction}
                  disabled={isSearching || !transactionId.trim()}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2 font-semibold text-[10px] uppercase tracking-wider transition-all"
                >
                  {isSearching ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Search size={14} />
                  )}
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>
              {searchError && (
                <div className="mt-2 flex items-center gap-2 text-red-500 text-[10px] bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertTriangle size={14} />
                  {searchError}
                </div>
              )}
            </div>

            {/* Results */}
            {hasSearched && soldProducts.length > 0 && (
              <>
                {/* Transaction Info */}
                <div className="mb-6 p-4 bg-theme-bg-secondary rounded-lg border border-theme-border">
                  <h3 className="font-semibold text-theme-text-primary text-xs mb-3 flex items-center gap-2">
                    <Info size={14} className="text-primary-600" />
                    Transaction Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px]">
                    <div className="flex items-center gap-2">
                      <Hash size={12} className="text-theme-text-tertiary" />
                      <span className="text-theme-text-secondary">ID:</span>
                      <span className="font-semibold text-theme-text-primary">{soldProducts[0].transactionId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={12} className="text-theme-text-tertiary" />
                      <span className="text-theme-text-secondary">Client:</span>
                      <span className="font-semibold text-theme-text-primary">{soldProducts[0].clientName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={12} className="text-theme-text-tertiary" />
                      <span className="text-theme-text-secondary">Date:</span>
                      <span className="font-semibold text-theme-text-primary">{formatDate(soldProducts[0].createdAt)}</span>
                    </div>
                    {soldProducts[0].clientEmail && (
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-theme-text-tertiary" />
                        <span className="text-theme-text-secondary">Email:</span>
                        <span className="font-semibold text-theme-text-primary">{soldProducts[0].clientEmail}</span>
                      </div>
                    )}
                    {soldProducts[0].clientPhone && (
                      <div className="flex items-center gap-2">
                        <Phone size={12} className="text-theme-text-tertiary" />
                        <span className="text-theme-text-secondary">Phone:</span>
                        <span className="font-semibold text-theme-text-primary">{soldProducts[0].clientPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Return Reason */}
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <h3 className="font-semibold text-theme-text-primary text-xs mb-3 flex items-center gap-2">
                    <RotateCcw size={14} className="text-amber-500" />
                    Return Reason <span className="text-red-500">*</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={reason}
                      onChange={(e) => { setReason(e.target.value); setSearchError(''); }}
                      className="px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary text-[11px] outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value="">Select reason...</option>
                      {commonReasons.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => { setReason(e.target.value); setSearchError(''); }}
                      placeholder="Custom reason"
                      className="px-3 py-2 bg-theme-bg-primary border border-theme-border rounded-lg text-theme-text-primary text-[11px] outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h3 className="font-semibold text-theme-text-primary text-xs mb-4 flex items-center gap-2">
                    <Package size={14} className="text-primary-600" />
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
                          className={`border rounded-xl p-4 transition-all ${isSel ? 'border-primary-500/50 bg-primary-500/5 shadow-sm' : 'border-theme-border hover:border-primary-500/30 bg-theme-bg-secondary/50'
                            } ${hasErr ? 'border-red-500/50 bg-red-500/5' : ''}`}
                        >
                          <div className="flex items-start gap-4">
                            <input
                              type="checkbox"
                              checked={isSel}
                              onChange={(e) => handleItemSelect(product.id, e.target.checked)}
                              className="mt-1.5 w-4 h-4 text-primary-600 bg-theme-bg-primary border-theme-border rounded focus:ring-primary-500"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between mb-3 min-w-0">
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                                    <Package size={20} />
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-theme-text-primary text-sm truncate">
                                      {product.stockin?.itemName || 'Unknown Item'}
                                    </h4>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-theme-text-secondary mt-1">
                                      <span>SKU: <span className="font-semibold text-theme-text-primary">{product.stockin?.sku || 'N/A'}</span></span>
                                      <span>Avail: <span className="font-semibold text-theme-text-primary">{product.quantity} {product.stockin?.unitOfMeasure}</span></span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <div className="font-bold text-theme-text-primary text-sm">
                                    {formatPrice(parseFloat(product.soldPrice || '0'))}
                                  </div>
                                  <div className="text-[10px] text-theme-text-secondary">
                                    {formatPrice(unitPrice)} / {product.stockin?.unitOfMeasure}
                                  </div>
                                </div>
                              </div>

                              {isSel && selItem && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  className="mt-4 p-4 bg-theme-bg-primary rounded-lg border border-theme-border shadow-inner"
                                >
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <label className="block text-[10px] font-semibold text-theme-text-secondary uppercase tracking-wider mb-2">
                                        Qty to Return <span className="text-red-500">*</span>
                                      </label>
                                      <input
                                        type="number"
                                        min="1"
                                        max={selItem.maxQuantity}
                                        value={selItem.quantity}
                                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                        className={`w-full text-center font-bold px-3 py-2 bg-theme-bg-secondary border rounded-lg text-theme-text-primary focus:ring-1 outline-none ${hasErr ? 'border-red-500/50 focus:ring-red-500' : 'border-theme-border focus:ring-primary-500'
                                          }`}
                                      />
                                      <p className="text-[9px] text-theme-text-tertiary text-center mt-1.5 uppercase tracking-tighter">Maximum returnable: {selItem.maxQuantity}</p>
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-semibold text-theme-text-secondary uppercase tracking-wider mb-2">Total Refund</label>
                                      <div className="w-full px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
                                        <span className="font-bold text-emerald-500 text-sm">
                                          {formatPrice(selItem.unitPrice * selItem.quantity)}
                                        </span>
                                      </div>
                                      <p className="text-[9px] text-theme-text-tertiary text-center mt-1.5 uppercase tracking-tighter">
                                        {formatPrice(selItem.unitPrice)} × {selItem.quantity} units
                                      </p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}

                              {hasErr && (
                                <div className="mt-3 flex items-center gap-2 text-red-500 text-[10px] font-medium bg-red-500/5 p-2 rounded-lg border border-red-500/10">
                                  <AlertTriangle size={12} />
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
                  <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shadow-sm">
                    <h4 className="font-bold text-emerald-500 text-xs mb-4 flex items-center gap-2 uppercase tracking-widest">
                      <Check size={16} />
                      Return Summary
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-theme-bg-primary rounded-lg border border-emerald-500/20 shadow-inner">
                        <div className="text-xl font-bold text-emerald-500 leading-none">{selectedItems.length}</div>
                        <div className="text-[9px] text-theme-text-secondary uppercase tracking-tighter mt-1">Unique Items</div>
                      </div>
                      <div className="text-center p-3 bg-theme-bg-primary rounded-lg border border-emerald-500/20 shadow-inner">
                        <div className="text-xl font-bold text-emerald-500 leading-none">{calculateTotalQuantity()}</div>
                        <div className="text-[9px] text-theme-text-secondary uppercase tracking-tighter mt-1">Total Quantity</div>
                      </div>
                      <div className="text-center p-3 bg-theme-bg-primary rounded-lg border border-emerald-500/20 shadow-inner">
                        <div className="text-xl font-bold text-emerald-500 leading-none">{formatPrice(calculateTotalRefund())}</div>
                        <div className="text-[9px] text-theme-text-secondary uppercase tracking-tighter mt-1">Total Refund</div>
                      </div>
                      <div className="text-center p-3 bg-theme-bg-primary rounded-lg border border-emerald-500/20 shadow-inner">
                        <div className="text-xl font-bold text-emerald-500 leading-none">
                          {formatPrice(calculateTotalRefund() / calculateTotalQuantity() || 0)}
                        </div>
                        <div className="text-[9px] text-theme-text-secondary uppercase tracking-tighter mt-1">Avg Refund/Unit</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {hasSearched && soldProducts.length === 0 && !searchError && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-theme-bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 border border-theme-border">
                  <RotateCcw className="w-8 h-8 text-theme-text-tertiary" />
                </div>
                <h3 className="text-sm font-bold text-theme-text-primary mb-2">No Returnable Items</h3>
                <p className="text-[10px] text-theme-text-secondary">
                  Transaction <strong className="text-theme-text-primary">{transactionId}</strong> has no returnable items left.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-theme-border bg-theme-bg-secondary">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-theme-border rounded-lg bg-theme-bg-primary text-theme-text-primary hover:bg-theme-bg-tertiary font-semibold text-[10px] uppercase tracking-wider transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || selectedItems.length === 0 || !reason.trim()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <RotateCcw size={14} />
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
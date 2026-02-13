import React from 'react';
import { X, Package, DollarSign, Hash, Calendar, RotateCcw, FileText, Clock, ShoppingCart } from 'lucide-react';

interface ViewSalesReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  salesReturn: any; // Ideally this should be a proper interface
}

const ViewSalesReturnModal: React.FC<ViewSalesReturnModalProps> = ({ isOpen, onClose, salesReturn }) => {
  if (!isOpen || !salesReturn) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'RWF'
    }).format(price || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Calculate total refund amount from all items
  const calculateTotalRefundAmount = () => {
    if (!salesReturn.items || salesReturn.items.length === 0) return 0;
    return salesReturn.items.reduce((total: number, item: any) => {
      return total + (item.stockout.soldPrice * item.quantity);
    }, 0);
  };

  // Get total quantity of all returned items
  const getTotalQuantity = () => {
    if (!salesReturn.items || salesReturn.items.length === 0) return 0;
    return salesReturn.items.reduce((total: number, item: any) => total + item.quantity, 0);
  };

  // Get client information from the first item (assuming all items have same client)
  const getClientInfo = () => {
    if (salesReturn.items && salesReturn.items.length > 0) {
      const firstStockout = salesReturn.items[0].stockout;
      return {
        name: firstStockout.clientName,
        email: firstStockout.clientEmail,
        phone: firstStockout.clientPhone
      };
    }
    return null;
  };

  const getProcessedBy = () => {
    if (salesReturn.items && salesReturn.items.length > 0) {
      const firstStockout = salesReturn.items[0].stockout;
      if (firstStockout.adminId) {
        return {
          type: 'Admin',
          id: firstStockout.adminId
        };
      } else if (firstStockout.employeeId) {
        return {
          type: 'Employee',
          id: firstStockout.employeeId
        };
      }
    }
    return null;
  };

  const clientInfo = getClientInfo();
  const processedBy = getProcessedBy();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-theme-bg-primary rounded-xl border border-theme-border w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-theme-border bg-theme-bg-secondary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                <RotateCcw className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-theme-text-primary">Sales Return Details</h2>
                <p className="text-primary-600 text-[10px] font-semibold uppercase tracking-wider">Credit Note ID: {salesReturn.creditnoteId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-theme-bg-tertiary rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-theme-text-secondary" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Return Summary Card */}
            <div className="bg-theme-bg-secondary rounded-xl p-6 border border-theme-border shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary-500/10 rounded-full flex items-center justify-center border border-primary-500/20">
                  <RotateCcw className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-theme-text-primary">Return Summary</h3>
                  <p className="text-theme-text-secondary text-[11px]">Comprehensive product return information</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-theme-bg-primary rounded-xl p-4 border border-theme-border shadow-inner">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <ShoppingCart className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-[10px] font-bold text-theme-text-secondary uppercase tracking-wider">Items Returned</span>
                  </div>
                  <p className="text-lg font-bold text-theme-text-primary">
                    {salesReturn.items?.length || 0} <span className="text-xs font-normal text-theme-text-secondary">Types</span> ({getTotalQuantity()} <span className="text-xs font-normal text-theme-text-secondary">Qty</span>)
                  </p>
                </div>

                <div className="bg-theme-bg-primary rounded-xl p-4 border border-theme-border shadow-inner">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-bold text-theme-text-secondary uppercase tracking-wider">Total Refund</span>
                  </div>
                  <p className="text-lg font-bold text-emerald-500">
                    {formatPrice(calculateTotalRefundAmount())}
                  </p>
                </div>

                <div className="bg-theme-bg-primary rounded-xl p-4 border border-theme-border shadow-inner">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <Calendar className="w-4 h-4 text-amber-500" />
                    </div>
                    <span className="text-[10px] font-bold text-theme-text-secondary uppercase tracking-wider">Return Date</span>
                  </div>
                  <p className="text-sm font-semibold text-theme-text-primary">
                    {formatDate(salesReturn.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Returned Items */}
              <div className="lg:col-span-2">
                <div className="bg-theme-bg-primary rounded-xl border border-theme-border overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-theme-bg-secondary border-b border-theme-border">
                    <h3 className="text-xs font-bold text-theme-text-primary uppercase tracking-widest flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary-600" />
                      Returned Items ({salesReturn.items?.length || 0})
                    </h3>
                  </div>

                  <div className="divide-y divide-theme-border">
                    {salesReturn.items?.map((item: any) => (
                      <div key={item.id} className="p-6 hover:bg-theme-bg-tertiary transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                            <Package className="w-8 h-8" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-bold text-theme-text-primary mb-1 truncate">
                              {item.stockout.stockin?.product?.productName || 'Unknown Product'}
                            </h4>
                            <div className="flex items-center gap-3 text-[10px] text-theme-text-secondary mb-4 uppercase tracking-wider font-semibold">
                              <span>{item.stockout.stockin?.product?.brand}</span>
                              <span className="text-theme-text-tertiary">•</span>
                              <span className="bg-theme-bg-secondary px-2 py-0.5 rounded border border-theme-border">SKU: {item.stockout.stockin?.sku}</span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-theme-bg-secondary rounded-lg p-3 border border-theme-border/50">
                                <div className="text-[9px] font-bold text-theme-text-tertiary mb-1 uppercase tracking-tighter">Returned Qty</div>
                                <div className="text-base font-bold text-theme-text-primary">{item.quantity}</div>
                              </div>

                              <div className="bg-theme-bg-secondary rounded-lg p-3 border border-theme-border/50">
                                <div className="text-[9px] font-bold text-theme-text-tertiary mb-1 uppercase tracking-tighter">Unit Price</div>
                                <div className="text-base font-bold text-theme-text-primary">
                                  {formatPrice(item.stockout.soldPrice / item.stockout.quantity)}
                                </div>
                              </div>

                              <div className="bg-theme-bg-secondary rounded-lg p-3 border border-theme-border/50">
                                <div className="text-[9px] font-bold text-theme-text-tertiary mb-1 uppercase tracking-tighter">Original Sale</div>
                                <div className="text-base font-bold text-theme-text-primary">
                                  {formatPrice(item.stockout.soldPrice)}
                                </div>
                              </div>

                              <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/20">
                                <div className="text-[9px] font-bold text-emerald-600 mb-1 uppercase tracking-tighter">Refund Amount</div>
                                <div className="text-base font-bold text-emerald-500">
                                  {formatPrice(item.stockout.soldPrice * item.quantity)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transaction & Return Details */}
              <div className="space-y-6">
                {/* Transaction Information */}
                <div className="bg-theme-bg-primary rounded-xl border border-theme-border overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-theme-bg-secondary border-b border-theme-border">
                    <h3 className="text-xs font-bold text-theme-text-primary uppercase tracking-widest flex items-center gap-2">
                      <Hash className="w-4 h-4 text-emerald-500" />
                      Transaction Details
                    </h3>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between py-2.5 border-b border-theme-border/50">
                      <span className="text-[10px] font-bold text-theme-text-secondary uppercase tracking-tighter">Transaction ID</span>
                      <span className="font-mono text-[11px] bg-theme-bg-secondary px-2 py-1 rounded text-theme-text-primary border border-theme-border">
                        {salesReturn.transactionId}
                      </span>
                    </div>

                    {clientInfo && (
                      <>
                        {clientInfo.name && (
                          <div className="flex items-center justify-between py-2.5 border-b border-theme-border/50">
                            <span className="text-[10px] font-bold text-theme-text-secondary uppercase tracking-tighter">Client Name</span>
                            <span className="text-[11px] font-semibold text-theme-text-primary text-right">
                              {clientInfo.name}
                            </span>
                          </div>
                        )}

                        {clientInfo.email && (
                          <div className="flex items-center justify-between py-2.5 border-b border-theme-border/50">
                            <span className="text-[10px] font-bold text-theme-text-secondary uppercase tracking-tighter">Client Email</span>
                            <span className="text-[11px] font-semibold text-theme-text-primary text-right truncate max-w-[150px]">
                              {clientInfo.email}
                            </span>
                          </div>
                        )}

                        {clientInfo.phone && (
                          <div className="flex items-center justify-between py-2.5">
                            <span className="text-[10px] font-bold text-theme-text-secondary uppercase tracking-tighter">Client Phone</span>
                            <span className="text-[11px] font-semibold text-theme-text-primary text-right">
                              {clientInfo.phone}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Return Information */}
                <div className="bg-theme-bg-primary rounded-xl border border-theme-border overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-theme-bg-secondary border-b border-theme-border">
                    <h3 className="text-xs font-bold text-theme-text-primary uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-500" />
                      Return Metadata
                    </h3>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between py-2.5 border-b border-theme-border/50">
                      <span className="text-[10px] font-bold text-theme-text-secondary uppercase tracking-tighter">Credit Note ID</span>
                      <span className="text-[11px] font-mono text-primary-600 bg-primary-500/10 px-2 py-1 rounded border border-primary-500/20">
                        {salesReturn.creditnoteId}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 py-2.5 border-b border-theme-border/50">
                      <span className="text-[10px] font-bold text-theme-text-secondary uppercase tracking-tighter">Return Reason</span>
                      <div className="w-full">
                        {salesReturn.reason ? (
                          <span className="text-[11px] font-medium text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-lg block">
                            {salesReturn.reason}
                          </span>
                        ) : (
                          <span className="text-[11px] text-theme-text-tertiary italic">No reason provided</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-[10px] font-bold text-theme-text-secondary uppercase tracking-tighter">Return Date</span>
                      <span className="text-[11px] font-semibold text-theme-text-primary">
                        {formatDate(salesReturn.createdAt).split(',')[0]}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Summary Totals */}
                <div className="bg-emerald-500/10 rounded-xl p-6 border border-emerald-500/20 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-600">Refund Finalization</h4>
                      <p className="text-emerald-500/70 text-[10px]">Total processable refund</p>
                    </div>
                  </div>

                  <div className="bg-theme-bg-primary rounded-xl p-4 border border-emerald-500/20 shadow-inner">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-theme-text-secondary uppercase tracking-widest">Total Types:</span>
                      <span className="text-xs font-bold text-theme-text-primary">{salesReturn.items?.length || 0} Products</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] font-bold text-theme-text-secondary uppercase tracking-widest">Total Quantity:</span>
                      <span className="text-xs font-bold text-theme-text-primary">{getTotalQuantity()} Units</span>
                    </div>
                    <div className="border-t border-theme-border/30 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Total Refund:</span>
                        <span className="text-2xl font-black text-emerald-500">
                          {formatPrice(calculateTotalRefundAmount())}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-primary-500/5 rounded-xl p-6 border border-primary-500/10 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-theme-text-primary uppercase tracking-widest mb-1.5">Processing Compliance</h4>
                  <p className="text-[11px] text-theme-text-secondary leading-relaxed">
                    Processed by <strong>{processedBy ? `${processedBy.type} (${processedBy.id})` : 'System'}</strong> on <strong>{formatDate(salesReturn.createdAt)}</strong>.
                    The total refund of <strong className="text-emerald-500">{formatPrice(calculateTotalRefundAmount())}</strong> covering <strong className="text-theme-text-primary">{salesReturn.items?.length || 0}</strong> item categories must be verified against physical stock before reconciliation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-theme-border bg-theme-bg-secondary">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-8 py-2.5 bg-theme-bg-tertiary text-theme-text-primary border border-theme-border rounded-lg hover:bg-theme-bg-primary transition-all font-bold text-[10px] uppercase tracking-[0.2em] shadow-sm active:scale-95"
            >
              Close Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSalesReturnModal;
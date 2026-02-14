import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';
import { X, Printer, Download, RefreshCw } from 'lucide-react';
import CompanyLogo from '../../../../assets/tran.png';
import stockOutService from '../../../../services/stockoutService';
import useAdminAuth from '../../../../context/AdminAuthContext';
import { API_URL } from '../../../../api/api';

interface InvoiceComponentProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string | null;
}

const InvoiceComponent: React.FC<InvoiceComponentProps> = ({ isOpen, onClose, transactionId }) => {
  const [invoiceData, setInvoiceData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({
    print: false,
    pdf: false,
  });
  const { user: adminUser } = useAdminAuth();

  // Fetch invoice data from API only
  useEffect(() => {
    const fetchInvoice = async () => {
      if (!isOpen || !transactionId) return;

      setLoading(true);
      try {
        const response = await stockOutService.getStockOutByTransactionId(transactionId);
        setInvoiceData(response);
      } catch (error) {
        console.error('Failed to load invoice:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not load invoice. Please try again.',
          confirmButtonColor: '#ef4444',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [transactionId, isOpen]);

  const companyInfo = {
    logo: adminUser?.profileImage
      ? (adminUser.profileImage.startsWith('http') ? adminUser.profileImage : `${API_URL}/uploads/profiles/${adminUser.profileImage}`)
      : CompanyLogo,
    companyName: adminUser?.adminName || 'ZUBA SYSTEMS LTD',
    address: 'KIGALI, RWANDA',
    phone: adminUser?.phone || '+250 787 487 953',
    email: adminUser?.adminEmail || 'support@izubagen.rw',
  };

  // Extract client from first item
  const clientInfo = invoiceData?.[0]
    ? {
      clientName: invoiceData[0].clientName || 'WALK-IN CUSTOMER',
      clientPhone: invoiceData[0].clientPhone || null,
    }
    : { clientName: 'WALK-IN CUSTOMER', clientPhone: null };

  const total = invoiceData?.reduce((sum, item) => sum + item.soldPrice * item.quantity, 0) || 0;
  const transactionIdDisplay = invoiceData?.[0]?.transactionId || transactionId;
  const createdAt = invoiceData?.[0]?.createdAt || new Date().toISOString();
  const itemCount = invoiceData?.length || 0;
  const paymentMethod = invoiceData?.[0]?.paymentMethod || 'CASH';

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-RW', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('en-GB', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    });

  const handlePrint = () => {
    setActionLoading((prev) => ({ ...prev, print: true }));
    setTimeout(() => {
      window.print();
      setActionLoading((prev) => ({ ...prev, print: false }));
    }, 150);
  };

  // PDF Download
  const handleGeneratePDF = async () => {
    setActionLoading((prev) => ({ ...prev, pdf: true }));
    try {
      const element = document.getElementById('invoice-print-section');
      if (!element) throw new Error('Print section not found');

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Invoice-${transactionIdDisplay}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf().set(opt).from(element).save();

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Invoice saved as PDF',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire('Error', 'Failed to generate PDF', 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, pdf: false }));
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600 mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading Invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoiceData || invoiceData.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 text-center max-w-sm">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2">Invoice Not Found</h3>
          <button onClick={onClose} className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print-section, #invoice-print-section * { visibility: visible; }
          #invoice-print-section {
            position: absolute;
            left: 0; top: 0;
            width: 80mm;
            font-family: monospace;
            font-size: 11px;
            padding: 8px;
            color: black !important;
            background: white !important;
          }
          .no-print { display: none !important; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
        }
      `}</style>

      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-theme-bg-primary border border-theme-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Action Bar */}
          <div className="no-print bg-theme-bg-secondary border-b border-theme-border p-4 sticky top-0 z-10">
            <div className="flex justify-between items-center gap-4">
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-theme-text-primary truncate">Sales Receipt</h2>
                <p className="text-[10px] text-primary-600 font-mono">#{transactionIdDisplay}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={handlePrint}
                  disabled={actionLoading.print}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-2 rounded-lg transition-all shadow-sm active:scale-95"
                  title="Print"
                >
                  {actionLoading.print ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleGeneratePDF}
                  disabled={actionLoading.pdf}
                  className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white p-2 rounded-lg transition-all shadow-sm active:scale-95"
                  title="Download PDF"
                >
                  {actionLoading.pdf ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                </button>
                <button
                  onClick={onClose}
                  className="bg-theme-bg-tertiary hover:bg-theme-bg-primary text-theme-text-secondary p-2 rounded-lg transition-all border border-theme-border shadow-sm active:scale-95"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Preview Container */}
          <div className="p-6 bg-theme-bg-tertiary/30">
            <div id="invoice-print-section" className="bg-white p-6 shadow-lg rounded-sm text-[11px] text-gray-900 font-mono leading-tight max-w-[80mm] mx-auto border border-gray-100">
              <div className="text-center mb-4">
                <div className="font-bold text-sm tracking-tighter uppercase">{companyInfo.companyName}</div>
                <div className="text-[10px] text-gray-600">{companyInfo.address}</div>
                <div className="text-[10px] text-gray-600 font-bold">TEL: {companyInfo.phone}</div>
              </div>

              <div className="border-t border-dashed border-gray-300 my-3"></div>

              <div className="text-center font-bold text-sm text-primary-600 mb-3 tracking-widest uppercase">
                SALES RECEIPT
              </div>

              <div className="border-t border-dashed border-gray-300 my-3"></div>

              <div className="space-y-1 mb-3 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-gray-500 uppercase">Client:</span>
                  <span className="font-bold">{clientInfo.clientName}</span>
                </div>
                {clientInfo.clientPhone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 uppercase">Phone:</span>
                    <span className="font-bold">{clientInfo.clientPhone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500 uppercase">Payment:</span>
                  <span className="font-bold">{paymentMethod}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 my-3"></div>

              {/* Items Table Header */}
              <div className="flex justify-between font-bold text-[9px] text-gray-500 uppercase mb-2">
                <span>Item</span>
                <span>Amount</span>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {invoiceData.map((item, i) => {
                  const productName =
                    item.stockin?.product?.productName ||
                    item.backorder?.productName ||
                    item.stockin?.itemName ||
                    'Unknown Item';
                  const price = item.soldPrice || 0;
                  const qty = item.quantity || 0;

                  return (
                    <div key={i} className="group">
                      <div className="font-bold uppercase leading-tight mb-0.5">{productName}</div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-500">{qty} × {formatCurrency(price)}</span>
                        <span className="font-bold text-primary-600">
                          {formatCurrency(price * qty)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-dashed border-gray-300 my-4"></div>

              <div className="font-black text-xs">
                <div className="flex justify-between text-primary-600 items-baseline">
                  <span className="uppercase tracking-tighter">TOTAL AMOUNT</span>
                  <span className="text-sm">{formatCurrency(total)} RWF</span>
                </div>
                <div className="flex justify-between text-gray-600 items-baseline text-[10px] mt-1">
                  <span className="uppercase">Cash Received</span>
                  <span>{formatCurrency(total)} RWF</span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 my-4"></div>

              <div className="text-center text-[9px] space-y-1 text-gray-600">
                <div className="flex justify-between px-2">
                  <span>Items Sold:</span>
                  <span className="font-bold">{itemCount} items</span>
                </div>
                <div className="flex justify-between px-2">
                  <span>Date:</span>
                  <span className="font-bold">{formatDate(createdAt)}</span>
                </div>
                <div className="flex justify-between px-2">
                  <span>Time:</span>
                  <span className="font-bold">{formatTime(createdAt)}</span>
                </div>
                <div className="flex justify-between px-2">
                  <span>Invoice #:</span>
                  <span className="font-bold">#{transactionIdDisplay}</span>
                </div>

                {transactionIdDisplay && (
                  <div className="my-4 p-2 bg-gray-50 rounded">
                    <img
                      src={stockOutService.getBarCodeUrlImage?.(transactionId) || undefined}
                      alt="Barcode"
                      className="h-10 mx-auto mix-blend-multiply"
                    />
                  </div>
                )}

                <div className="border-t border-dashed border-gray-300 my-4"></div>
                <div className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Thank You!</div>
                <div className="text-[9px] italic mb-1">Visit us again soon</div>
                <div className="text-[9px] font-medium text-gray-500 mt-2">Powered by My system</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceComponent;
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';
import salesReturnService from '../../../services/salesReturnService';
import stockOutService from '../../../services/stockoutService';
import CompanyLogo from '../../../assets/tran.png';

const CreditNoteComponent = ({ isOpen, onClose, salesReturnId }) => {
  const [creditNoteData, setCreditNoteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({
    print: false,
    pdf: false,
  });

  // Fetch credit note directly from API
  useEffect(() => {
    if (!isOpen || !salesReturnId) return;

    const fetchCreditNote = async () => {
      setLoading(true);
      try {
        const response = await salesReturnService.getSalesReturnById(salesReturnId);
        setCreditNoteData(response.data || response);
      } catch (error) {
        console.error('Failed to load credit note:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not load credit note. Please try again.',
          confirmButtonColor: '#ef4444',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCreditNote();
  }, [isOpen, salesReturnId]);

  const companyInfo = {
    logo: CompanyLogo,
    companyName: 'ZUBA SYSTEMS LTD',
    address: 'KIGALI, RWANDA',
    phone: '+250 787 487 953',
    // email: 'umusingihardware7@gmail.com',
  };

  // Extract client info
  const clientInfo = creditNoteData?.items?.[0]?.stockout
    ? {
        clientName: creditNoteData.items[0].stockout.clientName || 'WALK-IN CUSTOMER',
        clientPhone: creditNoteData.items[0].stockout.clientPhone || null,
      }
    : { clientName: 'WALK-IN CUSTOMER', clientPhone: null };

  const total = creditNoteData?.items?.reduce(
    (sum, item) => sum + (item.stockout?.soldPrice || 0) * (item.quantity || 0),
    0
  ) || 0;

  const itemCount = creditNoteData?.items?.length || 0;
  const creditNoteId = creditNoteData?.creditnoteId || salesReturnId;
  const createdAt = creditNoteData?.createdAt || new Date().toISOString();
  const transactionId = creditNoteData?.transactionId || 'N/A';
  const reason = creditNoteData?.reason || 'Not specified';

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-RW', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const formatTime = (dateString) =>
    new Date(dateString).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  // Print handler
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
      const element = document.getElementById('credit-note-print-section');
      if (!element) throw new Error('Print section not found');

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `Credit-Note-${creditNoteId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };

      await html2pdf().set(opt).from(element).save();

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Credit note saved as PDF',
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-orange-600 mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Loading Credit Note...</p>
        </div>
      </div>
    );
  }

  if (!creditNoteData || !creditNoteData.items?.length) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 text-center max-w-sm">
          <div className="text-6xl mb-4">Warning</div>
          <h3 className="text-xl font-bold mb-2">Credit Note Not Found</h3>
          <button onClick={onClose} className="mt-4 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx>{`
        @media print {
          body * { visibility: hidden; }
          #credit-note-print-section, #credit-note-print-section * { visibility: visible; }
          #credit-note-print-section {
            position: absolute;
            left: 0; top: 0;
            width: 80mm;
            font-family: monospace;
            font-size: 11px;
            padding: 8px;
          }
          .no-print { display: none !important; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
        }
      `}</style>

      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
          {/* Action Bar */}
          <div className="no-print bg-gradient-to-r from-orange-600 to-red-600 text-white p-4 rounded-t-lg sticky top-0 z-10">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Credit Note #{creditNoteId}</h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  disabled={actionLoading.print}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-70 px-4 py-2 rounded text-sm font-medium flex items-center gap-1.5"
                >
                  {actionLoading.print ? 'Printing...' : 'Print'}
                </button>
                <button
                  onClick={handleGeneratePDF}
                  disabled={actionLoading.pdf}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-70 px-4 py-2 rounded text-sm font-medium flex items-center gap-1.5"
                >
                  {actionLoading.pdf ? 'Saving...' : 'PDF'}
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-700 hover:bg-gray-800 px-4 py-2 rounded text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* Printable Content */}
          <div id="credit-note-print-section" className="p-5 bg-white text-xs leading-tight">
            <div className="text-center mb-3">
              <img src={companyInfo.logo} alt="Logo" className="w-16 h-16 mx-auto mb-2 object-contain" />
              <div className="font-bold text-base">{companyInfo.companyName}</div>
              <div>{companyInfo.address}</div>
              <div>TEL: {companyInfo.phone}</div>
            </div>

            <div className="divider"></div>

            <div className="text-center font-bold text-base text-orange-600 mb-2">
              CREDIT NOTE
            </div>

            <div className="divider"></div>

            <div className="space-y-1 mb-2">
              <div>Client: <strong>{clientInfo.clientName}</strong></div>
              {clientInfo.clientPhone && <div>Phone: {clientInfo.clientPhone}</div>}
              <div>Reason: {reason}</div>
            </div>

            <div className="divider"></div>

            {/* Items */}
            {creditNoteData.items.map((item, i) => {
              const productName =
                item.stockout?.stockin?.product?.productName ||
                item.stockout?.backorder?.productName ||
                'Unknown Item';
              const price = item.stockout?.soldPrice || 0;
              const qty = item.quantity || 0;

              return (
                <div key={i} className="mb-2">
                  <div className="font-medium">{productName}</div>
                  <div className="flex justify-between">
                    <span>{qty} × {formatCurrency(price)}</span>
                    <span className="font-bold text-red-600">
                      -{formatCurrency(price * qty)}
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="divider"></div>

            <div className="font-bold text-base">
              <div className="flex justify-between text-red-600">
                <span>TOTAL CREDIT</span>
                <span>-{formatCurrency(total)} RWF</span>
              </div>
            </div>

            <div className="divider"></div>

            <div className="text-center text-xs">
              <div>Items Returned: {itemCount}</div>
              <div>Date: {formatDate(createdAt)} | {formatTime(createdAt)}</div>
              <div>Credit Note #: {creditNoteId}</div>
              <div>Original Sale: {transactionId}</div>

              {transactionId !== 'N/A' && (
                <div className="my-3">
                  <img
                    src={stockOutService.getBarCodeUrlImage?.(transactionId)}
                    alt="Barcode"
                    className="h-10 mx-auto"
                  />
                </div>
              )}

              <div className="divider"></div>
              <div className="font-bold">Thank You!</div>
              <div className="text-xs">Goods returned successfully</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreditNoteComponent;
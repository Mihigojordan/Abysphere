/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';
import salesReturnService from '../../../services/salesReturnService';
import stockOutService from '../../../services/stockoutService';

// ──────────────────────────────────────────────────────────────
// Types (aligned with Prisma schema)
// ──────────────────────────────────────────────────────────────

interface StockIn {
  id: number;
  sku: string;
  itemName: string;
  unitOfMeasure: string;
  // ... other fields omitted for brevity
}

interface StockOut {
  id: string;
  transactionId?: string;
  quantity: number;
  soldPrice?: string; // Decimal as string
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  createdAt: string;
  stockin?: StockIn;
}

interface SalesReturnItem {
  id: string;
  stockout: StockOut;
  quantity: number;
}

interface SalesReturn {
  id: string;
  creditnoteId: string;
  transactionId: string;
  reason: string;
  createdAt: string;
  items: SalesReturnItem[];
}

interface CreditNoteComponentProps {
  isOpen: boolean;
  onClose: () => void;
  salesReturnId: string | null;
}

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────
const CreditNoteComponent: React.FC<CreditNoteComponentProps> = ({
  isOpen,
  onClose,
  salesReturnId,
}) => {
  const [creditNoteData, setCreditNoteData] = useState<SalesReturn | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<{
    email: boolean;
    pdf: boolean;
  }>({
    email: false,
    pdf: false,
  });

  // ── Fetch Credit Note ───────────────────────────────────────
  useEffect(() => {
    const getCreditNoteData = async () => {
      if (!salesReturnId) return;

      try {
        setLoading(true);
        const response = await salesReturnService.getSalesReturnById(salesReturnId);
        setCreditNoteData(response.data as SalesReturn);
      } catch (error: any) {
        console.error('Error loading credit note:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error Loading Credit Note',
          text: 'Failed to load credit note data. Please try again.',
          confirmButtonColor: '#3b82f6',
        });
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && salesReturnId) {
      getCreditNoteData();
    }
  }, [salesReturnId, isOpen]);

  // ── Static Info ─────────────────────────────────────────────
  const getUserInfo = () => ({
    name: 'Sadiki Rukara',
    email: 'umusingihardware7@gmail.com',
    title: '',
    phone: '250 787487953',
    role: 'unknown' as const,
  });

  const userInfo = getUserInfo();

  const companyInfo = {
    logo: '' as string, // Replace with actual logo path if needed
    companyName: 'Umusingi Hardware',
    companyAddress: 'Kigali, Rwanda',
  };

  // ── Client Info (from first item) ───────────────────────────
  const clientInfo = creditNoteData?.items?.length > 0
    ? {
        clientName: creditNoteData.items[0].stockout.clientName || 'N/A',
        clientEmail: creditNoteData.items[0].stockout.clientEmail || 'N/A',
        clientPhone: creditNoteData.items[0].stockout.clientPhone || 'N/A',
      }
    : {
        clientName: 'N/A',
        clientEmail: 'N/A',
        clientPhone: 'N/A',
      };

  // ── Calculations ───────────────────────────────────────────
  const subtotal = creditNoteData?.items?.reduce((sum, item) => {
    const price = parseFloat(item.stockout.soldPrice || '0');
    return sum + price;
  }, 0) || 0;

  const vatRate = 0.05; // 5%
  const vat = subtotal * vatRate;
  const total = subtotal + vat;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'RWF',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const thousands = ['', 'Thousand', 'Million', 'Billion'];

    if (num === 0) return 'Zero';

    const convertHundreds = (n: number): string => {
      let result = '';
      if (n >= 100) {
        result += ones[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n >= 20) {
        result += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      } else if (n >= 10) {
        result += teens[n - 10] + ' ';
        return result.trim();
      }
      if (n > 0) result += ones[n] + ' ';
      return result.trim();
    };

    let result = '';
    let thousandIndex = 0;
    let n = num;

    while (n > 0) {
      if (n % 1000 !== 0) {
        result = convertHundreds(n % 1000) + (thousands[thousandIndex] ? ` ${thousands[thousandIndex]} ` : ' ') + result;
      }
      n = Math.floor(n / 1000);
      thousandIndex++;
    }

    return `RWF ${result.trim()} Only`;
  };

  const generateCreditNoteNumber = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    return `CN-${year}-${month}${day}-${random}`;
  };

  // ── Actions ─────────────────────────────────────────────────
  const handleClose = () => {
    Swal.fire({
      title: 'Close Credit Note?',
      text: 'Are you sure you want to close this credit note?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, close it',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        onClose();
      }
    });
  };

  const handleGeneratePDF = async () => {
    setActionLoading((prev) => ({ ...prev, pdf: true }));
    try {
      const element = document.getElementById('credit-note-print-section');
      if (!element) throw new Error('Print section not found');

      const options = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename: `Credit-Note-${creditNoteData?.transactionId}-${new Date().toDateString()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          letterRendering: true,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait' as const,
        },
      };

      await html2pdf().set(options).from(element).save();

      Swal.fire({
        icon: 'success',
        title: 'PDF Generated!',
        text: 'Credit Note PDF has been downloaded successfully.',
        confirmButtonColor: '#3b82f6',
        timer: 3000,
        timerProgressBar: true,
      });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Generate PDF',
        text: 'Please try again later.',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, pdf: false }));
    }
  };

  // ── Early Returns ───────────────────────────────────────────
  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading Credit Note</h3>
            <p className="text-gray-600">Please wait while we fetch your credit note data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!creditNoteData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-primary-500 text-5xl mb-4">Warning</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Credit Note Data</h3>
            <p className="text-gray-600 mb-4">Unable to load credit note information.</p>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const originalInvoiceDate = creditNoteData.items[0]?.stockout?.createdAt || creditNoteData.createdAt;

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Action Bar */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-orange-600 z-[10] text-white p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Credit Note #{creditNoteData.creditnoteId}</h2>
            <div className="flex gap-3">
              <button
                onClick={handleGeneratePDF}
                disabled={actionLoading.pdf}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg"
              >
                {actionLoading.pdf ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Save PDF
                  </>
                )}
              </button>
              <button
                onClick={handleClose}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center gap-2 shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Printable Section */}
        <div id="credit-note-print-section" className="p-8 bg-white font-sans">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex flex-col">
              {companyInfo.logo ? (
                <img src={companyInfo.logo} alt="Company Logo" className="w-44 h-44 object-contain mb-4" />
              ) : (
                <div className="w-44 h-44 bg-gray-200 border-2 border-dashed rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">Logo</span>
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-800">{companyInfo.companyName}</h1>
              <p className="text-sm text-gray-600">{companyInfo.companyAddress}</p>
            </div>
            <div className="text-right">
              <div className="bg-primary-500 text-white px-3 py-2 rounded text-sm font-semibold mb-2 inline-block">
                CREDIT NOTE
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-semibold">Credit Note No #{creditNoteData.creditnoteId}</p>
                <p>Issue Date: {formatDate(creditNoteData.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* From / To */}
          <div className="grid grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">From</h3>
              <div className="text-gray-700">
                <p className="font-semibold text-lg">{userInfo.name}</p>
                <p className="text-sm">Email: {userInfo.email}</p>
                <p className="text-sm">Phone: {userInfo.phone}</p>
                <p className="text-sm text-primary-600 font-medium">{userInfo.title}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">To</h3>
              <div className="text-gray-700">
                <p className="font-semibold text-lg">{clientInfo.clientName}</p>
                <p className="text-sm">Email: {clientInfo.clientEmail}</p>
                <p className="text-sm">Phone: {clientInfo.clientPhone}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-primary-100 p-4 rounded-lg w-full">
                <p className="text-sm text-primary-600 font-semibold">Original Invoice</p>
                <p className="text-xs text-gray-600">{formatDate(originalInvoiceDate)}</p>
                <div className="py-3 flex justify-center">
                  <img
                    src={stockOutService.getBarCodeUrlImage(creditNoteData.transactionId)}
                    alt="Barcode"
                    className="h-20 object-contain"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Return Info */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-gray-700">
                <span className="font-semibold">Credit Note For:</span> Product Return Transaction
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Return Reason:</span> {creditNoteData.reason}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="bg-primary-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Qty</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Unit Price</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody>
                {creditNoteData.items.map((item) => {
                  const unitPrice = parseFloat(item.stockout.soldPrice || '0') / item.quantity;
                  return (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-3 px-4 text-gray-700">
                        <div>
                          <p className="font-medium">{item.stockout.stockin?.itemName || 'Unknown Item'}</p>
                          <p className="text-xs text-gray-500">SKU: {item.stockout.stockin?.sku || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-700">{item.quantity}</td>
                      <td className="py-3 px-4 text-right text-gray-700">{formatCurrency(unitPrice)}</td>
                      <td className="py-3 px-4 text-right text-gray-700 font-semibold">
                        {formatCurrency(parseFloat(item.stockout.soldPrice || '0'))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80">
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Sub Total</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-700">VAT (5%)</span>
                <span className="font-semibold">{formatCurrency(vat)}</span>
              </div>
              <div className="border-t border-gray-300 pt-2 mt-2">
                <div className="flex justify-between py-2">
                  <span className="text-lg font-bold text-primary-600">Total Credit Amount</span>
                  <span className="text-lg font-bold text-primary-600">{formatCurrency(total)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Amount in Words: {numberToWords(Math.floor(total))}
                </p>
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="grid grid-cols-2 gap-8">
            <div></div>
            <div className="text-right">
              <div className="flex flex-col items-end">
                <p className="font-semibold text-gray-800">{userInfo.name}</p>
                <p className="text-sm text-gray-600">Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditNoteComponent;
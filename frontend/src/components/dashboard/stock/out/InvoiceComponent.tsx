import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
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
  const [actionLoading, setActionLoading] = useState({ print: false });
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
          confirmButtonColor: '#3b82f6',
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
    companyName: adminUser?.adminName || 'Izuba Systems Ltd',
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

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-700 font-medium">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoiceData || invoiceData.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 text-center max-w-sm">
          <div className="text-6xl mb-4">Warning</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Invoice Not Found</h3>
          <p className="text-gray-600 mb-6">No data available for this transaction.</p>
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print-only Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area {
            position: absolute;
            left: 0; top: 0;
            width: 80mm;
            font-family: monospace;
            font-size: 11px;
            padding: 8px;
          }
          .no-print { display: none !important; }
          .print-divider { border-top: 1px dashed #000; margin: 8px 0; }
        }
      `}</style>

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
          {/* Header - Hidden on Print */}
          <div className="no-print bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Invoice #{transactionIdDisplay}</h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  disabled={actionLoading.print}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-70 text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2"
                >
                  {actionLoading.print ? 'Printing...' : 'Print'}
                </button>
                <button
                  onClick={onClose}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          {/* Printable Invoice */}
          <div id="print-area" className="p-4 bg-white text-xs leading-tight">
            <div className="text-center mb-3">
              <img src={companyInfo.logo} alt="Logo" className="w-16 h-16 mx-auto mb-2 object-contain" />
              <div className="font-bold text-base">{companyInfo.companyName}</div>
              <div>{companyInfo.address}</div>
              <div>TEL: {companyInfo.phone}</div>
              <div>{companyInfo.email}</div>
            </div>

            <div className="print-divider"></div>

            <div className="mb-2">
              <div>Client: <strong>{clientInfo.clientName}</strong></div>
              {clientInfo.clientPhone && <div>Phone: {clientInfo.clientPhone}</div>}
            </div>

            <div className="print-divider"></div>
            {/* {JSON.stringify(invoiceData)} */}

            {/* Items */}
            {invoiceData.map((item, i) => (
              <div key={i} className="mb-2">
                <div className="font-medium">
                  {item.stockin?.product?.productName ||
                    item.backorder?.productName ||
                    item.stockin.itemName ||
                    'Unknown Item'}
                </div>
                <div className="flex justify-between">
                  <span>{item.quantity} × {formatCurrency(item.soldPrice)}</span>
                  <span className="font-bold">{formatCurrency(item.soldPrice * item.quantity)}</span>
                </div>
              </div>
            ))}

            <div className="print-divider"></div>

            {/* Totals */}
            <div className="text-sm font-bold">
              <div className="flex justify-between">
                <span>TOTAL AMOUNT</span>
                <span>{formatCurrency(total)} RWF</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>CASH RECEIVED</span>
                <span>{formatCurrency(total)} RWF</span>
              </div>
            </div>

            <div className="print-divider"></div>

            {/* Footer */}
            <div className="text-center text-xs">
              <div>Items: {itemCount}</div>
              <div>Date: {formatDate(createdAt)} | {formatTime(createdAt)}</div>
              <div>Invoice #: {transactionIdDisplay}</div>
              <div className="my-3">
                <img
                  src={stockOutService.getBarCodeUrlImage?.(transactionId) || '#'}
                  alt="Barcode"
                  className="h-10 mx-auto"
                />
              </div>
              <div className="font-bold text-sm mt-2">THANK YOU!</div>
              <div className="text-xs mt-1">Powered by My system</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceComponent;
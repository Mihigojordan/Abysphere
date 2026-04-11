import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Printer, Download, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import stockOutService from '../../services/stockoutService';
import useAdminAuth from '../../context/AdminAuthContext';
import useEmployeeAuth from '../../context/EmployeeAuthContext';

interface StockOut {
    id: string;
    quantity: number;
    soldPrice: number;
    clientName?: string;
    clientPhone?: string;
    clientEmail?: string;
    paymentMethod?: string;
    transactionId?: string;
    createdAt: string;
    stockin?: {
        itemName: string;
        sku: string;
        product?: { productName: string; brand?: string };
    };
    externalItemName?: string;
    externalSku?: string;
}

interface StockOutViewProps {
    role: 'admin' | 'employee';
}

const StockOutView: React.FC<StockOutViewProps> = ({ role: initialRole }) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const receiptRef = useRef<HTMLDivElement>(null);

    const { user: adminData } = useAdminAuth();
    const { user: employeeData } = useEmployeeAuth();

    const isEmployee = location.pathname.includes('/employee/');
    const role = initialRole || (isEmployee ? 'employee' : 'admin');

    const [sale, setSale] = useState<StockOut | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSale = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await stockOutService.getStockOutById(id);
                setSale(data);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching sale:', err);
                setError('Failed to load transaction details.');
            } finally {
                setLoading(false);
            }
        };
        fetchSale();
    }, [id]);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-RW', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount) + ' RWF';

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const handleDownloadPDF = () => {
        if (!receiptRef.current) return;
        html2pdf()
            .set({
                margin: 0,
                filename: `stockout-receipt-${sale?.transactionId || id}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            })
            .from(receiptRef.current)
            .save();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Loading receipt...</p>
            </div>
        );
    }

    if (error || !sale) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="p-4 bg-red-50 rounded-full text-red-600 border border-red-200">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <div className="text-center">
                    <h3 className="text-sm font-bold text-slate-900">Record Not Found</h3>
                    <p className="text-xs text-slate-500 mt-1">{error || 'The transaction could not be found.'}</p>
                </div>
                <button
                    onClick={() => navigate(`/${role}/dashboard/stockout-management`)}
                    className="px-5 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs uppercase tracking-wider hover:bg-slate-200 transition-all"
                >
                    Back to Stock Out
                </button>
            </div>
        );
    }

    const itemName = sale.stockin?.product?.productName || sale.stockin?.itemName || sale.externalItemName || 'Item';
    const sku = sale.stockin?.sku || sale.externalSku || '—';
    const lineTotal = sale.quantity * sale.soldPrice;
    const companyName = (adminData as any)?.companyName || (adminData as any)?.adminName || 'Abysphere PMS';

    return (
        <div style={{ background: '#f0f6ff', minHeight: '100vh', padding: '32px 16px', fontFamily: 'Arial, sans-serif' }}>
            {/* Toolbar — hidden on print */}
            <div className="print:hidden" style={{ maxWidth: 800, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button
                    onClick={() => navigate(`/${role}/dashboard/stockout-management`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1e3a8a', fontSize: 12, fontWeight: 700, background: '#fff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 14px', cursor: 'pointer' }}
                >
                    <ArrowLeft style={{ width: 14, height: 14 }} />
                    Back to Stock Out
                </button>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button
                        onClick={() => window.print()}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#1e3a8a', fontSize: 12, fontWeight: 700, background: '#fff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 14px', cursor: 'pointer' }}
                    >
                        <Printer style={{ width: 14, height: 14 }} />
                        Print
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff', fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg,#1e3a8a,#2563eb)', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}
                    >
                        <Download style={{ width: 14, height: 14 }} />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Receipt */}
            <div
                ref={receiptRef}
                style={{ maxWidth: 800, margin: '0 auto', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 24px rgba(29,78,216,0.12)' }}
            >
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)', padding: '36px 40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: 11, letterSpacing: '0.15em', color: '#bfdbfe', textTransform: 'uppercase', marginBottom: 4 }}>
                                Abysphere PMS
                            </p>
                            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>
                                {companyName}
                            </h1>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: 11, letterSpacing: '0.18em', color: '#bfdbfe', textTransform: 'uppercase', marginBottom: 6 }}>
                                Stock Out Receipt
                            </p>
                            <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#fff' }}>
                                #{sale.transactionId || sale.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p style={{ margin: '6px 0 0', fontSize: 12, color: '#bfdbfe' }}>
                                {formatDate(sale.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div style={{ background: '#fff', padding: '0 40px' }}>
                    {/* Client & Payment Info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, padding: '28px 0', borderBottom: '1px solid #bfdbfe' }}>
                        <div>
                            <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#94a3b8' }}>
                                Client
                            </p>
                            <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
                                {sale.clientName || 'Walk-In Customer'}
                            </p>
                            {sale.clientPhone && (
                                <p style={{ margin: '0 0 2px', fontSize: 13, color: '#64748b' }}>{sale.clientPhone}</p>
                            )}
                            {sale.clientEmail && (
                                <p style={{ margin: 0, fontSize: 13, color: '#64748b' }}>{sale.clientEmail}</p>
                            )}
                        </div>
                        <div>
                            <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#94a3b8' }}>
                                Payment
                            </p>
                            <p style={{ margin: '0 0 4px', fontSize: 13, color: '#1e293b' }}>
                                <strong>Method:</strong> {sale.paymentMethod || 'CASH'}
                            </p>
                            {sale.transactionId && (
                                <p style={{ margin: '0 0 2px', fontSize: 13, color: '#1e293b' }}>
                                    <strong>Transaction ID:</strong> {sale.transactionId}
                                </p>
                            )}
                            <p style={{ margin: 0, fontSize: 13, color: '#1e293b' }}>
                                <strong>Status:</strong>{' '}
                                <span style={{ color: '#16a34a', fontWeight: 700 }}>COMPLETED</span>
                            </p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div style={{ padding: '28px 0', borderBottom: '1px solid #bfdbfe' }}>
                        <p style={{ margin: '0 0 16px', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#94a3b8' }}>
                            Items
                        </p>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#1e3a8a' }}>
                                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bfdbfe' }}>
                                        Item
                                    </th>
                                    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bfdbfe' }}>
                                        SKU
                                    </th>
                                    <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bfdbfe' }}>
                                        Qty
                                    </th>
                                    <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bfdbfe' }}>
                                        Unit Price
                                    </th>
                                    <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bfdbfe' }}>
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ background: '#f0f6ff' }}>
                                    <td style={{ padding: '14px', fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                                        {itemName}
                                    </td>
                                    <td style={{ padding: '14px', fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>
                                        {sku}
                                    </td>
                                    <td style={{ padding: '14px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#1e293b' }}>
                                        {sale.quantity}
                                    </td>
                                    <td style={{ padding: '14px', textAlign: 'right', fontSize: 13, color: '#64748b' }}>
                                        {formatCurrency(sale.soldPrice)}
                                    </td>
                                    <td style={{ padding: '14px', textAlign: 'right', fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                                        {formatCurrency(lineTotal)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div style={{ padding: '24px 0 28px', display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ minWidth: 260 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: '#64748b' }}>
                                <span>Subtotal</span>
                                <span>{formatCurrency(lineTotal)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, color: '#64748b' }}>
                                <span>Discount</span>
                                <span>0 RWF</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0 6px', marginTop: 8, borderTop: '2px solid #1e3a8a' }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                    Grand Total
                                </span>
                                <span style={{ fontSize: 22, fontWeight: 800, color: '#2563eb' }}>
                                    {formatCurrency(lineTotal)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{ background: '#f0f6ff', padding: '18px 40px', borderTop: '1px solid #bfdbfe', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>
                        © {new Date().getFullYear()} {companyName} · This is an official stock-out receipt.
                    </p>
                </div>
            </div>

            <p className="print:hidden" style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#94a3b8' }}>
                Press <kbd style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 4, padding: '1px 6px', fontSize: 10, color: '#2563eb' }}>Ctrl + P</kbd> for a hard copy
            </p>
        </div>
    );
};

export default StockOutView;

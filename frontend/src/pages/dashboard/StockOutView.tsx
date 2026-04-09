import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
    Printer, 
    Download, 
    Loader2,
    AlertCircle,
    ArrowLeft,
    CreditCard,
    User,
    Hash,
    MapPin
} from 'lucide-react';
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
        product?: {
            productName: string;
            brand?: string;
        };
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
    
    const { user: adminData } = useAdminAuth();
    const { user: employeeData } = useEmployeeAuth();
    
    // Use prop if provided, otherwise determine from URL
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount).replace('RWF', 'RWF ');
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Retrieving Transaction Record...</p>
            </div>
        );
    }

    if (error || !sale) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
                <div className="p-4 bg-red-500/10 rounded-full text-red-600 border border-red-500/20">
                    <AlertCircle className="w-10 h-10" />
                </div>
                <div className="text-center">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Record Not Found</h3>
                    <p className="text-[10px] text-slate-500 mt-1">{error || 'The requested sales record could not be found in the registry.'}</p>
                </div>
                <button 
                    onClick={() => navigate(`/${role}/dashboard/stockout-management`)}
                    className="px-6 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold text-[9px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                    Return to Sales Office
                </button>
            </div>
        );
    }

    const itemName = sale.stockin?.product?.productName || sale.stockin?.itemName || sale.externalItemName || 'Generic Item';
    const sku = sale.stockin?.sku || sale.externalSku || 'N/A';
    const lineTotal = sale.quantity * sale.soldPrice;

    return (
        <div className="sale-view-container">
            <style>{`
                .sale-view-container {
                    --primary: #2563eb;
                    --ink: #0f172a;
                    --ink-2: #475569;
                    --ink-3: #94a3b8;
                    --rule: #e2e8f0;
                    --surface: #f8fafc;
                    --white: #ffffff;
                    background: #dde3ec;
                    font-family: 'DM Sans', sans-serif;
                    color: var(--ink);
                    min-height: 100vh;
                    padding: 48px 24px;
                }

                @media print {
                    .sale-view-container { background: #fff; padding: 0; }
                    .toolbar, .print-hint { display: none !important; }
                    .sheet { box-shadow: none !important; max-width: 100% !important; border-top: none !important; }
                    .doc { padding: 40px 48px !important; }
                    .doc-foot { padding: 12px 48px !important; }
                }

                .sheet {
                    background: var(--white);
                    max-width: 880px;
                    margin: 0 auto;
                    border-top: 5px solid var(--primary);
                    box-shadow: 0 8px 48px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06);
                    overflow: hidden;
                }

                .toolbar {
                    background: var(--ink);
                    padding: 12px 32px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .toolbar-back {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: rgba(255,255,255,.5);
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: .12em;
                    text-transform: uppercase;
                    text-decoration: none;
                    cursor: pointer;
                    transition: color .15s;
                }
                .toolbar-back:hover { color: #fff; }
                
                .toolbar-actions { display: flex; gap: 8px; }

                .btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 7px 16px;
                    border: none;
                    border-radius: 4px;
                    font-family: inherit;
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: .1em;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: opacity .15s;
                }
                .btn:hover { opacity: .85; }
                .btn-ghost {
                    background: rgba(255,255,255,.08);
                    color: rgba(255,255,255,.7);
                    border: 1px solid rgba(255,255,255,.12);
                }
                .btn-primary {
                    background: var(--primary);
                    color: #fff;
                }

                .doc { padding: 56px 64px; }

                .head { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 40px; border-bottom: 1px solid var(--rule); }

                .brand-mark {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                .brand-icon {
                    width: 16px; height: 16px;
                    background: var(--primary);
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 3px;
                }
                .brand-icon svg {
                    width: 8px; height: 8px; color: #fff;
                }
                .brand-name {
                    font-family: 'Instrument Serif', serif;
                    font-size: 15px;
                    letter-spacing: -.01em;
                    color: var(--ink);
                }

                .company-meta { display: flex; flex-direction: column; gap: 2px; }
                .meta-row {
                    display: flex; align-items: center; gap: 5px;
                    font-size: 9px; color: var(--ink-2); font-weight: 400;
                }
                .meta-row svg {
                    width: 8px; height: 8px;
                    color: var(--ink-3);
                }
                .meta-tin {
                    margin-top: 5px;
                    padding-top: 5px;
                    border-top: 1px solid var(--rule);
                    display: flex; align-items: center; gap: 5px;
                    font-size: 9px; font-weight: 600; color: var(--ink);
                }
                .meta-tin svg {
                    width: 8px; height: 8px;
                    color: var(--primary);
                }

                .doc-block { text-align: right; }
                .doc-label {
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: .18em;
                    text-transform: uppercase;
                    color: var(--primary);
                    margin-bottom: 4px;
                }
                .doc-number {
                    font-family: 'Instrument Serif', serif;
                    font-size: 40px;
                    line-height: 1;
                    color: var(--ink);
                    letter-spacing: -.02em;
                    margin-bottom: 16px;
                }
                .doc-dates { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
                .doc-date-row {
                    font-size: 10px; color: var(--ink-2); font-weight: 500;
                    letter-spacing: .04em; text-transform: uppercase;
                    display: flex; gap: 6px;
                }
                .doc-date-row span:first-child { color: var(--ink-3); }

                .status-badge {
                    display: inline-flex;
                    margin-top: 12px;
                    padding: 4px 10px;
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: .12em;
                    text-transform: uppercase;
                    border-radius: 2px;
                    border: 1px solid;
                }
                .status-final { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }

                .parties {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 48px;
                    padding: 36px 0;
                    border-bottom: 1px solid var(--rule);
                }
                .party-label {
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: .18em;
                    text-transform: uppercase;
                    color: var(--ink-3);
                    margin-bottom: 12px;
                }
                .party-name {
                    font-family: 'Instrument Serif', serif;
                    font-size: 18px;
                    color: var(--ink);
                    margin-bottom: 8px;
                    line-height: 1.2;
                }
                .party-detail {
                    font-size: 11px;
                    color: var(--ink-2);
                    line-height: 1.8;
                }

                .section-label {
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: .18em;
                    text-transform: uppercase;
                    color: var(--ink-3);
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .section-label::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: var(--rule);
                }

                .items-section { padding: 36px 0; border-bottom: 1px solid var(--rule); }

                table { width: 100%; border-collapse: collapse; }
                thead tr { border-bottom: 2px solid var(--ink); }
                th {
                    font-size: 9px; font-weight: 700; letter-spacing: .14em;
                    text-transform: uppercase; color: var(--ink-3);
                    padding: 0 0 10px; text-align: left;
                }
                th.right { text-align: right; }
                th.center { text-align: center; }
                tbody tr { border-bottom: 1px solid var(--rule); }
                tbody tr:last-child { border-bottom: none; }
                td { padding: 16px 0; vertical-align: top; }

                .td-sku {
                    font-family: 'DM Mono', monospace;
                    font-size: 10px; font-weight: 500; color: var(--ink-2);
                    background: var(--surface); padding: 2px 7px;
                    border-radius: 3px; display: inline-block; letter-spacing: .03em;
                }
                .td-name { font-size: 12px; font-weight: 600; color: var(--ink); line-height: 1.3; }
                .td-qty { font-size: 12px; font-weight: 500; text-align: center; color: var(--ink); }
                .td-price { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--ink-2); text-align: right; }
                .td-total { font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 500; color: var(--ink); text-align: right; }

                .footer-section {
                    display: grid;
                    grid-template-columns: 1fr auto;
                    gap: 48px;
                    padding-top: 36px;
                    align-items: start;
                }
                .notes-label { font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 8px; }
                .notes-text { font-size: 11px; color: var(--ink-2); line-height: 1.7; font-style: italic; max-width: 340px; }

                .sig-row { display: flex; gap: 40px; margin-top: 32px; }
                .sig-block { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
                .sig-line { width: 100px; height: 1px; background: var(--ink-3); }
                .sig-caption { font-size: 8px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); }

                .totals { min-width: 240px; }
                .totals-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 11px; color: var(--ink-2); font-weight: 500; }
                .totals-row.grand { margin-top: 12px; padding-top: 16px; border-top: 2px solid var(--ink); }
                .totals-row.grand .lbl { font-size: 11px; font-weight: 700; color: var(--ink); letter-spacing: .06em; text-transform: uppercase; }
                .totals-row.grand .val { font-size: 22px; font-family: 'Instrument Serif', serif; color: var(--primary); letter-spacing: -.02em; }

                .doc-foot { background: var(--ink); padding: 16px 64px; display: flex; align-items: center; justify-content: space-between; }
                .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--primary); }
                .doc-foot p { font-size: 8px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: rgba(255,255,255,.35); }
                .print-hint { text-align: center; margin-top: 24px; font-size: 9px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: #94a3b8; }
                .print-hint kbd { font-family: 'DM Mono', monospace; background: #fff; border: 1px solid #cbd5e1; border-radius: 3px; padding: 1px 5px; font-size: 9px; color: var(--primary); }
            `}</style>

            <div className="sheet">
                <div className="toolbar print:hidden">
                    <button className="toolbar-back" onClick={() => navigate(`/${role}/dashboard/stockout-management`)}>
                        <ArrowLeft className="w-3 h-3" />
                        Sales Registry
                    </button>
                    <div className="toolbar-actions">
                        <button className="btn btn-ghost" onClick={() => window.print()}>
                            <Printer className="w-3 h-3" />
                            Print Receipt
                        </button>
                        <button className="btn btn-primary">
                            <Download className="w-3 h-3" />
                            Export PDF
                        </button>
                    </div>
                </div>

                <div className="doc">
                    <div className="head">
                        <div>
                            <div className="brand-mark">
                                <div className="brand-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                                </div>
                                <span className="brand-name">{adminData?.companyName ?? 'PMS Technologies'}</span>
                            </div>
                            <div className="company-meta">
                                <div className="meta-row"><MapPin className="w-2 h-2" /> {adminData?.companyAddress ?? 'Kigali, Rwanda'}</div>
                                <div className="meta-row"><CreditCard className="w-2 h-2" /> TIN: {adminData?.companyTin ?? '123 456 789'}</div>
                            </div>
                        </div>

                        <div className="doc-block">
                            <p className="doc-label">Sales Invoice</p>
                            <p className="doc-number">#{sale.transactionId || 'INV-' + sale.id.slice(0, 8).toUpperCase()}</p>
                            <div className="doc-dates">
                                <div className="doc-date-row"><span>Date</span><span>{new Date(sale.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
                                <div className="doc-date-row"><span>Method</span><span>{sale.paymentMethod || 'CASH'}</span></div>
                            </div>
                            <span className="status-badge status-final">PAID & COMPLETED</span>
                        </div>
                    </div>

                    <div className="parties">
                        <div>
                            <p className="party-label">Sold By</p>
                            <p className="party-name">{adminData?.companyName ?? 'PMS Technologies'}</p>
                            <p className="party-detail">
                                {isEmployee ? 'Representative: ' + employeeData?.first_name : 'Authorized Admin'}<br />
                                {adminData?.companyPhone ?? '+250 788 000 000'}
                            </p>
                        </div>
                        <div>
                            <p className="party-label">Bill To</p>
                            <p className="party-name">{sale.clientName || 'Walk-In Customer'}</p>
                            <p className="party-detail">
                                <User className="inline w-3 h-3 mr-1" /> {sale.clientPhone || 'No contact provided'}<br />
                                <Hash className="inline w-3 h-3 mr-1" /> TR: {sale.transactionId || 'Single Sale'}
                            </p>
                        </div>
                    </div>

                    <div className="items-section">
                        <p className="section-label">Sales Particulars</p>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '120px' }}>SKU</th>
                                    <th>Product / Description</th>
                                    <th className="center" style={{ width: '100px' }}>Qty</th>
                                    <th className="right" style={{ width: '140px' }}>Unit Price</th>
                                    <th className="right" style={{ width: '150px' }}>Line Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><span className="td-sku">{sku}</span></td>
                                    <td><p className="td-name">{itemName}</p></td>
                                    <td><p className="td-qty">{sale.quantity}</p></td>
                                    <td className="td-price">{formatCurrency(sale.soldPrice)}</td>
                                    <td className="td-total">{formatCurrency(lineTotal)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="footer-section">
                        <div>
                            <p className="notes-label">Transaction Reference</p>
                            <p className="notes-text">
                                Goods once sold are not returnable. This electronic receipt serves as proof of purchase and warranty. 
                                Thank you for your business.
                            </p>
                            <div className="sig-row">
                                <div className="sig-block"><div className="sig-line"></div><p className="sig-caption">Customer Acknowledgment</p></div>
                                <div className="sig-block"><div className="sig-line"></div><p className="sig-caption">Cashier / Agent</p></div>
                            </div>
                        </div>

                        <div className="totals">
                            <div className="totals-row"><span className="lbl">Item Subtotal</span><span className="val">{formatCurrency(lineTotal)}</span></div>
                            <div className="totals-row"><span className="lbl">Payment Method</span><span className="val">{sale.paymentMethod || 'CASH'}</span></div>
                            <div className="totals-row grand"><span className="lbl">Total Paid</span><span className="val">{formatCurrency(lineTotal)}</span></div>
                        </div>
                    </div>
                </div>

                <div className="doc-foot">
                    <div className="flex items-center gap-2 text-white/40"><div className="dot"></div><p>PMS ERP · POS MODULE v2.0</p></div>
                    <p>Official Transaction Record</p>
                </div>
            </div>
            <p className="print-hint print:hidden">Press <kbd>Ctrl + P</kbd> for hard copy</p>
        </div>
    );
};

export default StockOutView;

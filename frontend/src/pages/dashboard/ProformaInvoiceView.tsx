import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Printer, Download, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import proformaService from '../../services/proformaInvoiceService';
import pmsLogo from '../../assets/erasebg-transformed.png';
import companySeal from '../../assets/company_seal.png';

interface ProformaInvoice {
    id: string;
    proformaNumber: string;
    status: string;
    createdAt: string;
    issueDate: string;
    expiryDate?: string;
    subtotal: number;
    taxAmount: number;
    discountValue: number;
    discountType: string;
    grandTotal: number;
    notes?: string;
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    items: Array<{
        id: string;
        productName: string;
        productSku?: string;
        quantity: number;
        unitPrice: number;
        taxPct?: number;
        discountPct?: number;
        totalPrice: number;
    }>;
}

const ProformaInvoiceView: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const isEmployee = location.pathname.includes('/employee/');
    const role = isEmployee ? 'employee' : 'admin';

    const sheetRef = useRef<HTMLDivElement>(null);
    const [proforma, setProforma] = useState<ProformaInvoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);

    useEffect(() => {
        const fetchPI = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await proformaService.getOne(id);
                setProforma(data);
                setError(null);
            } catch {
                setError('Failed to load proforma invoice details.');
            } finally {
                setLoading(false);
            }
        };
        fetchPI();
    }, [id]);

    const formatCurrency = (amt: number) =>
        `RWF ${Number(amt || 0).toLocaleString()}`;

    const handleDownloadPDF = async () => {
        if (!sheetRef.current || !proforma) return;
        setPdfLoading(true);
        const toolbar = sheetRef.current.querySelector('.toolbar') as HTMLElement | null;
        if (toolbar) toolbar.style.display = 'none';
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            await html2pdf().set({
                margin: 0,
                filename: `PI-${proforma.proformaNumber}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, allowTaint: true, logging: false },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            }).from(sheetRef.current).save();
        } finally {
            if (toolbar) toolbar.style.display = '';
            setPdfLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Loading Document...</p>
        </div>
    );

    if (error || !proforma) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="p-4 bg-red-500/10 rounded-full text-red-600 border border-red-500/20">
                <AlertCircle className="w-10 h-10" />
            </div>
            <div className="text-center">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Error</h3>
                <p className="text-[10px] text-slate-500 mt-1">{error}</p>
            </div>
            <button onClick={() => navigate(`/${role}/dashboard/proforma-management`)} className="px-6 py-2 bg-slate-100 border border-slate-200 rounded-xl text-[9px] font-bold uppercase tracking-widest">Return</button>
        </div>
    );

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'PAID': return 'status-paid';
            case 'SENT': return 'status-sent';
            case 'CANCELLED': return 'status-cancelled';
            default: return 'status-draft';
        }
    };

    return (
        <div className="pi-view-container">
            <style>{`
                .pi-view-container {
                    --primary: #1e5fa8;
                    --primary-light: #5fa3e8;
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
                    html, body { height: auto !important; overflow: visible !important; }
                    body * { visibility: hidden !important; }
                    .sheet, .sheet * { visibility: visible !important; }
                    .sheet {
                        position: fixed !important;
                        top: 0 !important; left: 0 !important;
                        width: 100% !important; max-width: 100% !important;
                        box-shadow: none !important;
                        margin: 0 !important;
                    }
                    .toolbar, .print-hint { display: none !important; }
                    .doc { padding: 40px 48px !important; }
                    .doc-foot { padding: 12px 48px !important; }
                }

                .sheet {
                    background: var(--white);
                    max-width: 880px;
                    margin: 0 auto;
                    box-shadow: 0 8px 48px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06);
                    overflow: hidden;
                }

                .letterhead-bar {
                    height: 8px;
                    background: linear-gradient(to right, #1e5fa8 0%, #1e5fa8 70%, #5fa3e8 70%, #5fa3e8 100%);
                }

                .toolbar {
                    background: var(--ink);
                    padding: 12px 32px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                .toolbar-back {
                    display: flex; align-items: center; gap: 8px;
                    color: rgba(255,255,255,.5); font-size: 10px; font-weight: 600;
                    letter-spacing: .12em; text-transform: uppercase;
                    cursor: pointer; border: none; background: none;
                    transition: color .15s;
                }
                .toolbar-back:hover { color: #fff; }
                .toolbar-actions { display: flex; gap: 8px; }

                .btn {
                    display: inline-flex; align-items: center; gap: 6px;
                    padding: 7px 16px; border: none; border-radius: 4px;
                    font-family: inherit; font-size: 10px; font-weight: 700;
                    letter-spacing: .1em; text-transform: uppercase;
                    cursor: pointer; transition: opacity .15s;
                }
                .btn:hover { opacity: .85; }
                .btn-ghost { background: rgba(255,255,255,.08); color: rgba(255,255,255,.7); border: 1px solid rgba(255,255,255,.12); }
                .btn-primary { background: var(--primary); color: #fff; }

                .doc { padding: 56px 64px; }
                .doc-relative { position: relative; }
                .doc-content { position: relative; z-index: 1; }
                .watermark {
                    position: absolute; top: 50%; left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0.06; width: 500px;
                    pointer-events: none; z-index: 0; object-fit: contain;
                }

                .head { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 40px; border-bottom: 1px solid var(--rule); }

                .brand-mark { display: flex; align-items: center; gap: 12px; margin-bottom: 6px; }
                .brand-logo { height: 52px; width: auto; object-fit: contain; }
                .brand-tagline { font-size: 11px; font-style: italic; color: #5fa3e8; margin: 0 0 16px; }

                .company-meta { display: flex; flex-direction: column; gap: 2px; }
                .meta-row {
                    display: flex; align-items: center; gap: 5px;
                    font-size: 9px; color: var(--ink-2); font-weight: 400;
                }
                .meta-row svg { width: 8px; height: 8px; color: var(--ink-3); }
                .meta-tin {
                    margin-top: 5px; padding-top: 5px;
                    border-top: 1px solid var(--rule);
                    display: flex; align-items: center; gap: 5px;
                    font-size: 9px; font-weight: 600; color: var(--ink);
                }
                .meta-tin svg { width: 8px; height: 8px; color: var(--primary); }

                .po-block { text-align: right; }
                .po-label { font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--primary); margin-bottom: 4px; }
                .po-number { font-family: 'Instrument Serif', serif; font-size: 40px; line-height: 1; color: var(--ink); letter-spacing: -.02em; margin-bottom: 16px; }
                .po-dates { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
                .po-date-row { font-size: 10px; color: var(--ink-2); font-weight: 500; letter-spacing: .04em; text-transform: uppercase; display: flex; gap: 6px; }
                .po-date-row span:first-child { color: var(--ink-3); }

                .status-badge {
                    display: inline-flex; margin-top: 12px;
                    padding: 4px 10px; font-size: 9px; font-weight: 700;
                    letter-spacing: .12em; text-transform: uppercase;
                    border-radius: 2px; border: 1px solid;
                }
                .status-paid     { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
                .status-sent     { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
                .status-draft    { background: #f8fafc; color: #64748b; border-color: #cbd5e1; }
                .status-cancelled { background: #fef2f2; color: #dc2626; border-color: #fecaca; }

                .parties {
                    display: grid; grid-template-columns: 1fr 1fr;
                    gap: 48px; padding: 36px 0; border-bottom: 1px solid var(--rule);
                }
                .party-label { font-size: 9px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 12px; }
                .party-name { font-family: 'Instrument Serif', serif; font-size: 18px; color: var(--ink); margin-bottom: 8px; line-height: 1.2; }
                .party-detail { font-size: 11px; color: var(--ink-2); line-height: 1.8; }

                .section-label {
                    font-size: 9px; font-weight: 700; letter-spacing: .18em;
                    text-transform: uppercase; color: var(--ink-3); margin-bottom: 16px;
                    display: flex; align-items: center; gap: 8px;
                }
                .section-label::after { content: ''; flex: 1; height: 1px; background: var(--rule); }

                .items-section { padding: 36px 0; border-bottom: 1px solid var(--rule); }

                table { width: 100%; border-collapse: collapse; }
                thead tr { border-bottom: 2px solid var(--ink); }
                th { font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); padding: 0 0 10px; text-align: left; }
                th.right { text-align: right; }
                th.center { text-align: center; }
                tbody tr { border-bottom: 1px solid var(--rule); }
                tbody tr:last-child { border-bottom: none; }
                td { padding: 16px 0; vertical-align: top; }

                .td-sku { font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 500; color: var(--ink-2); background: var(--surface); padding: 2px 7px; border-radius: 3px; display: inline-block; letter-spacing: .03em; }
                .td-name { font-size: 12px; font-weight: 600; color: var(--ink); line-height: 1.3; }
                .td-qty { font-size: 12px; font-weight: 500; text-align: center; color: var(--ink); }
                .td-price { font-family: 'DM Mono', monospace; font-size: 11px; color: var(--ink-2); text-align: right; }
                .td-total { font-family: 'DM Mono', monospace; font-size: 12px; font-weight: 500; color: var(--ink); text-align: right; }

                .footer-section { display: grid; grid-template-columns: 1fr auto; gap: 48px; padding-top: 36px; align-items: start; }
                .notes-label { font-size: 9px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 8px; }
                .notes-text { font-size: 11px; color: var(--ink-2); line-height: 1.7; font-style: italic; max-width: 340px; }

                .totals { min-width: 240px; }
                .totals-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 11px; color: var(--ink-2); font-weight: 500; }
                .totals-row.grand { margin-top: 12px; padding-top: 16px; border-top: 2px solid var(--ink); }
                .totals-row.grand .lbl { font-size: 11px; font-weight: 700; color: var(--ink); letter-spacing: .06em; text-transform: uppercase; }
                .totals-row.grand .val { font-size: 22px; font-family: 'Instrument Serif', serif; color: var(--primary); letter-spacing: -.02em; }

                .doc-foot {
                    background: var(--ink); padding: 16px 64px;
                    display: flex; align-items: center; justify-content: space-between;
                }
                .doc-foot-left { display: flex; align-items: center; gap: 10px; }
                .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--primary); }
                .doc-foot p { font-size: 8px; font-weight: 600; letter-spacing: .2em; text-transform: uppercase; color: rgba(255,255,255,.35); }

                .seal-left { display: flex; align-items: center; justify-content: flex-start; }
                .company-seal-large { width: 420px; height: auto; object-fit: contain; opacity: 0.92; }

                .print-hint { text-align: center; margin-top: 24px; font-size: 9px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; color: #94a3b8; }
                .print-hint kbd { font-family: 'DM Mono', monospace; background: #fff; border: 1px solid #cbd5e1; border-radius: 3px; padding: 1px 5px; font-size: 9px; color: var(--primary); }
            `}</style>

            <div className="sheet" ref={sheetRef}>
                {/* PMS LETTERHEAD BAR */}
                <div className="letterhead-bar" />

                {/* TOOLBAR */}
                <div className="toolbar">
                    <button className="toolbar-back" onClick={() => navigate(`/${role}/dashboard/proforma-management`)}>
                        <ArrowLeft className="w-3 h-3" />
                        Proforma Management
                    </button>
                    <div className="toolbar-actions">
                        <button className="btn btn-ghost" onClick={() => window.print()}>
                            <Printer className="w-3 h-3" />
                            Print
                        </button>
                        <button className="btn btn-primary" onClick={handleDownloadPDF} disabled={pdfLoading}>
                            {pdfLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                            {pdfLoading ? 'Generating...' : 'Export PDF'}
                        </button>
                    </div>
                </div>

                {/* DOCUMENT */}
                <div className="doc doc-relative">
                    <img src={pmsLogo} alt="" className="watermark" />
                    <div className="doc-content">

                    {/* HEAD */}
                    <div className="head">
                        <div>
                            <div className="brand-mark">
                                <img src={pmsLogo} alt="PMS Logo" className="brand-logo" />
                            </div>
                            <p className="brand-tagline">Customer is an asset</p>
                            <div className="company-meta">
                                <div className="meta-row">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                    Kigali, Rwanda
                                </div>
                                <div className="meta-row">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l1.84-1.84a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                                    0784544729 / 0788347094
                                </div>
                                <div className="meta-row">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                                    papemessenger@gmail.com
                                </div>
                                <div className="meta-row">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                                    Acc BK: 00048-06952213-37 &nbsp;|&nbsp; Acc KCB: 4490862733
                                </div>
                                <div className="meta-tin">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                                    TIN: &nbsp;107510116
                                </div>
                            </div>
                        </div>

                        <div className="po-block">
                            <p className="po-label">Proforma Invoice</p>
                            <p className="po-number">#{proforma.proformaNumber}</p>
                            <div className="po-dates">
                                <div className="po-date-row">
                                    <span>Date</span>
                                    <span>{new Date(proforma.issueDate || proforma.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                                {proforma.expiryDate && (
                                    <div className="po-date-row">
                                        <span>Expires</span>
                                        <span>{new Date(proforma.expiryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                )}
                            </div>
                            <span className={`status-badge ${getStatusClass(proforma.status)}`}>
                                {proforma.status}
                            </span>
                        </div>
                    </div>

                    {/* PARTIES */}
                    <div className="parties">
                        <div>
                            <p className="party-label">Bill To</p>
                            <p className="party-name">{proforma.clientName}</p>
                            <p className="party-detail">
                                {proforma.clientEmail && <>{proforma.clientEmail}<br /></>}
                                {proforma.clientPhone && <>{proforma.clientPhone}</>}
                            </p>
                        </div>
                        <div>
                            <p className="party-label">Issued By</p>
                            <p className="party-name">PAPETERIE MESSENGER SUPPLY Ltd</p>
                            <p className="party-detail">
                                Kigali, Rwanda<br />
                                papemessenger@gmail.com<br />
                                0784544729 / 0788347094
                            </p>
                        </div>
                    </div>

                    {/* ITEMS */}
                    <div className="items-section">
                        <p className="section-label">Items</p>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: '100px' }}>SKU</th>
                                    <th>Description</th>
                                    <th className="center" style={{ width: '90px' }}>Qty</th>
                                    <th className="right" style={{ width: '130px' }}>Unit Price</th>
                                    <th className="right" style={{ width: '140px' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proforma.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td><span className="td-sku">{item.productSku || 'N/A'}</span></td>
                                        <td><p className="td-name">{item.productName}</p></td>
                                        <td><p className="td-qty">{item.quantity}</p></td>
                                        <td className="td-price">{formatCurrency(item.unitPrice)}</td>
                                        <td className="td-total">{formatCurrency(item.totalPrice)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* FOOTER SECTION */}
                    <div className="footer-section">
                        <div className="seal-left">
                            <img src={companySeal} alt="Company Seal" className="company-seal-large" />
                        </div>
                        <div className="totals">
                            {(() => {
                                const vatAmount = Math.round(proforma.subtotal * 0.18);
                                const discountAmount = proforma.discountValue > 0
                                    ? proforma.discountType === 'PERCENTAGE'
                                        ? Math.round((proforma.subtotal * proforma.discountValue) / 100)
                                        : proforma.discountValue
                                    : 0;
                                const grandTotal = proforma.subtotal + vatAmount - discountAmount;
                                return (
                                    <>
                                        <div className="totals-row">
                                            <span className="lbl">Subtotal</span>
                                            <span className="val">{formatCurrency(proforma.subtotal)}</span>
                                        </div>
                                        <div className="totals-row">
                                            <span className="lbl">VAT (18%)</span>
                                            <span className="val">{formatCurrency(vatAmount)}</span>
                                        </div>
                                        {discountAmount > 0 && (
                                            <div className="totals-row">
                                                <span className="lbl">
                                                    Discount {proforma.discountType === 'PERCENTAGE' ? `(${proforma.discountValue}%)` : '(Fixed)'}
                                                </span>
                                                <span className="val">− {formatCurrency(discountAmount)}</span>
                                            </div>
                                        )}
                                        <div className="totals-row grand">
                                            <span className="lbl">Grand Total</span>
                                            <span className="val">{formatCurrency(Math.max(0, grandTotal))}</span>
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    </div>{/* end doc-content */}
                </div>

                {/* DOC FOOTER */}
                <div className="letterhead-bar" />
                <div className="doc-foot">
                    <div className="doc-foot-left">
                        <div className="dot"></div>
                        <p>System Generated · PMS ERP v2.0</p>
                    </div>
                    <p>papmes.com &nbsp;|&nbsp; papemessenger@gmail.com</p>
                </div>
            </div>

            <p className="print-hint print:hidden">
                Press <kbd>Ctrl + P</kbd> to print or save as PDF
            </p>
        </div>
    );
};

export default ProformaInvoiceView;

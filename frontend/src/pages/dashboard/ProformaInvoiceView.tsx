import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Printer, Download, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import proformaService from '../../services/proformaInvoiceService';
import useAdminAuth from '../../context/AdminAuthContext';

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
    const { user: adminData } = useAdminAuth();
    
    const isEmployee = location.pathname.includes('/employee/');
    const role = isEmployee ? 'employee' : 'admin';
    
    const [proforma, setProforma] = useState<ProformaInvoice | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPI = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await proformaService.getOne(id);
                setProforma(data);
                setError(null);
            } catch (err: any) {
                setError('Failed to load proforma invoice details.');
            } finally {
                setLoading(false);
            }
        };
        fetchPI();
    }, [id]);

    const formatCurrency = (amt: number) => `RWF ${Number(amt || 0).toLocaleString()}`;

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Loading Document...</p>
        </div>
    );

    if (error || !proforma) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
            <div className="text-center">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Error</h3>
                <p className="text-[10px] text-slate-500 mt-1">{error}</p>
            </div>
            <button onClick={() => navigate(`/${role}/dashboard/proforma-management`)} className="px-6 py-2 bg-slate-100 border border-slate-200 rounded-xl text-[9px] font-bold uppercase tracking-widest">Return</button>
        </div>
    );

    return (
        <div className="pi-view-container">
            <style>{`
                .pi-view-container { --primary: #2563eb; --ink: #0f172a; --ink-2: #475569; --ink-3: #94a3b8; --rule: #e2e8f0; --surface: #f8fafc; --white: #ffffff; background: #dde3ec; font-family: 'DM Sans', sans-serif; color: var(--ink); min-height: 100vh; padding: 48px 24px; }
                @media print { .pi-view-container { background: #fff; padding: 0; } .toolbar, .print-hint { display: none !important; } .sheet { box-shadow: none !important; max-width: 100% !important; border-top: none !important; } .doc { padding: 40px 48px !important; } }
                .sheet { background: var(--white); max-width: 880px; margin: 0 auto; border-top: 5px solid var(--primary); box-shadow: 0 8px 48px rgba(0,0,0,.12); overflow: hidden; }
                .toolbar { background: var(--ink); padding: 12px 32px; display: flex; align-items: center; justify-content: space-between; }
                .toolbar-back { display: flex; align-items: center; gap: 8px; color: rgba(255,255,255,.5); font-size: 10px; font-weight: 600; text-transform: uppercase; cursor: pointer; border: none; background: none; }
                .toolbar-actions { display: flex; gap: 8px; }
                .btn { display: inline-flex; align-items: center; gap: 6px; padding: 7px 16px; border: none; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; cursor: pointer; transition: opacity .15s; }
                .btn-ghost { background: rgba(255,255,255,.08); color: rgba(255,255,255,.7); border: 1px solid rgba(255,255,255,.12); }
                .btn-primary { background: var(--primary); color: #fff; }
                .doc { padding: 56px 64px; }
                .head { display: flex; justify-content: space-between; padding-bottom: 40px; border-bottom: 1px solid var(--rule); }
                .brand-name { font-family: 'Instrument Serif', serif; font-size: 18px; color: var(--ink); }
                .meta-row { font-size: 10px; color: var(--ink-2); display: flex; gap: 6px; align-items: center; margin-top: 2px; }
                .po-block { text-align: right; }
                .po-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--primary); }
                .po-number { font-family: 'Instrument Serif', serif; font-size: 42px; line-height: 1; color: var(--ink); margin-top: 8px; }
                .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; padding: 36px 0; border-bottom: 1px solid var(--rule); }
                .party-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--ink-3); margin-bottom: 12px; }
                .party-name { font-family: 'Instrument Serif', serif; font-size: 18px; margin-bottom: 8px; }
                .party-detail { font-size: 11px; color: var(--ink-2); line-height: 1.6; }
                .items-section { padding: 36px 0; border-bottom: 1px solid var(--rule); }
                table { width: 100%; border-collapse: collapse; }
                th { font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--ink-3); text-align: left; padding-bottom: 12px; border-bottom: 2px solid var(--ink); }
                td { padding: 16px 0; border-bottom: 1px solid var(--rule); font-size: 12px; }
                .footer-section { display: grid; grid-template-columns: 1fr auto; gap: 48px; padding-top: 36px; }
                .notes-text { font-size: 11px; color: var(--ink-2); font-style: italic; max-width: 400px; }
                .totals { min-width: 240px; }
                .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 11px; font-weight: 500; }
                .totals-row.grand { margin-top: 12px; padding-top: 16px; border-top: 2px solid var(--ink); font-size: 24px; font-family: 'Instrument Serif', serif; color: var(--primary); }
            `}</style>

            <div className="sheet">
                <div className="toolbar">
                    <button className="toolbar-back" onClick={() => navigate(`/${role}/dashboard/proforma-management`)}><ArrowLeft className="w-3 h-3" />Proforma Management</button>
                    <div className="toolbar-actions">
                        <button className="btn btn-ghost" onClick={() => window.print()}><Printer className="w-3 h-3" />Print</button>
                        <button className="btn btn-primary"><Download className="w-3 h-3" />Export PDF</button>
                    </div>
                </div>

                <div className="doc">
                    <div className="head">
                        <div>
                            <p className="brand-name">{adminData?.companyName || 'Abysphere Technologies'}</p>
                            <div className="meta-row">{adminData?.companyAddress || 'Kigali, Rwanda'}</div>
                            <div className="meta-row">TIN: {adminData?.companyTin || '123 456 789'}</div>
                            <div className="meta-row">{adminData?.adminEmail}</div>
                        </div>
                        <div className="po-block">
                            <p className="po-label">Proforma Invoice</p>
                            <p className="po-number">#{proforma.proformaNumber}</p>
                            <div className="meta-row">Date: {new Date(proforma.issueDate || proforma.createdAt).toLocaleDateString()}</div>
                            {proforma.expiryDate && <div className="meta-row">Expires: {new Date(proforma.expiryDate).toLocaleDateString()}</div>}
                            <div className={`mt-4 uppercase font-bold text-[10px] tracking-widest px-2 py-1 inline-block border rounded ${proforma.status === 'PAID' ? 'bg-green-500/10 text-green-600 border-green-500' : 'bg-amber-500/10 text-amber-600 border-amber-500'}`}>{proforma.status}</div>
                        </div>
                    </div>

                    <div className="parties">
                        <div>
                            <p className="party-label">Bill To</p>
                            <p className="party-name">{proforma.clientName}</p>
                            <p className="party-detail">{proforma.clientEmail}<br/>{proforma.clientPhone}</p>
                        </div>
                        <div>
                            <p className="party-label">Issued By</p>
                            <p className="party-name">{adminData?.companyName}</p>
                            <p className="party-detail">{adminData?.companyAddress}<br/>TIN: {adminData?.companyTin}</p>
                        </div>
                    </div>

                    <div className="items-section">
                        <table>
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th style={{ textAlign: 'center' }}>Qty</th>
                                    <th style={{ textAlign: 'right' }}>Unit Price</th>
                                    <th style={{ textAlign: 'right' }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {proforma.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td><p className="font-bold">{item.productName}</p><p className="text-[10px] text-slate-400">{item.productSku}</p></td>
                                        <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.unitPrice)}</td>
                                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.totalPrice)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="footer-section">
                        <div>
                            <p className="party-label">Notes & Terms</p>
                            <p className="notes-text">{proforma.notes || 'Standard terms apply. This is a proforma invoice valid for 30 days.'}</p>
                        </div>
                        <div className="totals">
                            <div className="totals-row"><span>Subtotal</span><span>{formatCurrency(proforma.subtotal)}</span></div>
                            <div className="totals-row"><span>VAT</span><span>{formatCurrency(proforma.taxAmount)}</span></div>
                            {proforma.discountValue > 0 && <div className="totals-row"><span>Discount ({proforma.discountType})</span><span>-{formatCurrency(proforma.discountValue)}</span></div>}
                            <div className="totals-row grand"><span>Total</span><span>{formatCurrency(proforma.grandTotal)}</span></div>
                        </div>
                    </div>
                </div>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-8 uppercase tracking-widest print:hidden">Press Ctrl + P to Print or Save as PDF</p>
        </div>
    );
};

export default ProformaInvoiceView;

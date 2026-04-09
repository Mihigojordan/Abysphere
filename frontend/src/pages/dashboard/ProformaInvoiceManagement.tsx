/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Edit, Trash2, RefreshCw, Package,
    CheckCircle, XCircle, ChevronLeft, ChevronRight,
    Eye, Send, FileText, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import proformaInvoiceService from '../../services/proformaInvoiceService';
import useAdminAuth from '../../context/AdminAuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface ProformaInvoice {
    id: string;
    proformaNumber: string;
    status: string;
    issueDate: string;
    expiryDate?: string;
    clientName: string;
    clientEmail?: string;
    clientPhone?: string;
    subtotal: number;
    taxAmount: number;
    grandTotal: number;
    _count?: {
        items: number;
    };
}

interface OperationStatus {
    type: 'success' | 'error' | 'info';
    message: string;
}

const ProformaInvoiceManagement: React.FC = () => {
    const [proformas, setProformas] = useState<ProformaInvoice[]>([]);
    const [allProformas, setAllProformas] = useState<ProformaInvoice[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);

    const navigate = useNavigate();
    const { user: adminData } = useAdminAuth();
    const role = adminData?.role || 'admin';
    const rowsPerPage = 8;

    const loadProformas = async () => {
        try {
            setLoading(true);
            const response = await proformaInvoiceService.getAll();
            setAllProformas(response);
        } catch (err: any) {
            showOperationStatus('error', err.message || 'Failed to load proforma invoices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProformas(); }, []);

    useEffect(() => {
        let filtered = [...allProformas];
        if (searchTerm.trim()) {
            const lowerSearch = searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.proformaNumber.toLowerCase().includes(lowerSearch) || 
                p.clientName.toLowerCase().includes(lowerSearch)
            );
        }
        if (statusFilter !== 'ALL') filtered = filtered.filter(p => p.status === statusFilter);
        
        filtered.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
        setProformas(filtered);
        setCurrentPage(1);
    }, [searchTerm, statusFilter, allProformas]);

    const showOperationStatus = (type: OperationStatus['type'], message: string, duration: number = 3000) => {
        setOperationStatus({ type, message });
        setTimeout(() => setOperationStatus(null), duration);
    };

    const handleAction = async (id: string, action: 'submit' | 'mark-as-paid' | 'delete' | 'cancel') => {
        try {
            if (action === 'submit') {
                await proformaInvoiceService.submit(id);
                showOperationStatus('success', 'Proforma submitted');
            } else if (action === 'mark-as-paid') {
                await proformaInvoiceService.markAsPaid(id);
                showOperationStatus('success', 'Proforma marked as paid and stock updated');
            } else if (action === 'delete') {
                const res = await Swal.fire({ title: 'Delete?', text: 'Delete this draft?', icon: 'warning', showCancelButton: true });
                if (!res.isConfirmed) return;
                await proformaInvoiceService.delete(id);
                showOperationStatus('success', 'Deleted');
            } else if (action === 'cancel') {
                const { value: reason } = await Swal.fire({ title: 'Cancel?', input: 'text', showCancelButton: true });
                if (!reason) return;
                await proformaInvoiceService.cancel(id, reason);
                showOperationStatus('success', 'Cancelled');
            }
            loadProformas();
        } catch (e: any) {
            showOperationStatus('error', e.message || `Failed to ${action}`);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
            case 'SENT': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'PAID': return 'bg-green-500/10 text-green-600 border-green-500/20';
            case 'CANCELLED': return 'bg-red-500/10 text-red-600 border-red-500/20';
            default: return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
        }
    };

    const formatCurrency = (amt: number) => `Rwf ${Number(amt || 0).toLocaleString()}`;
    const formatDate = (d?: string | Date) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    const totalPages = Math.ceil(proformas.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const currentItems = proformas.slice(startIndex, startIndex + rowsPerPage);

    const stats = {
        draft: allProformas.filter(p => p.status === 'DRAFT').length,
        sent: allProformas.filter(p => p.status === 'SENT').length,
        paid: allProformas.filter(p => p.status === 'PAID').length,
        total: allProformas.length
    };

    return (
        <div className="min-h-screen bg-theme-bg-secondary transition-colors duration-200">
            <div className="sticky top-0 bg-theme-bg-primary shadow-sm z-10 border-b border-theme-border">
                <div className="mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-primary-600 rounded"><FileText className="w-5 h-5 text-white" /></div>
                        <div>
                            <h1 className="text-lg font-bold text-theme-text-primary uppercase tracking-tight">Proforma Invoices</h1>
                            <p className="text-[10px] text-theme-text-secondary font-medium uppercase tracking-widest opacity-70">Sales Management</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={loadProformas} disabled={loading} className="flex items-center space-x-1 px-4 py-1.5 text-theme-text-secondary hover:text-theme-text-primary border border-theme-border rounded hover:bg-theme-bg-tertiary transition-colors text-[10px] font-bold uppercase tracking-widest">
                            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} /><span>Refresh</span>
                        </button>
                        <button onClick={() => navigate(`/${role}/dashboard/proforma-management/create`)} className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95">
                            <Plus className="w-3.5 h-3.5" />New Proforma
                        </button>
                    </div>
                </div>
            </div>
            <div className="mx-auto px-4 py-4 space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { title: 'Draft', value: stats.draft, icon: FileText, color: 'text-slate-500', bg: 'bg-slate-500/10' },
                        { title: 'Sent', value: stats.sent, icon: Send, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                        { title: 'Paid', value: stats.paid, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
                        { title: 'Total', value: stats.total, icon: Package, color: 'text-primary-500', bg: 'bg-primary-500/10' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-theme-bg-primary rounded shadow border border-theme-border p-4">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${stat.bg}`}><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
                                <div><p className="text-[10px] text-theme-text-secondary uppercase tracking-widest font-black opacity-60 mb-1">{stat.title}</p><h3 className="text-xl font-black text-theme-text-primary tracking-tighter">{stat.value}</h3></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="bg-theme-bg-primary rounded shadow border border-theme-border p-3 flex flex-col md:flex-row gap-3 justify-between items-center">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-theme-text-secondary" />
                        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-8 pr-4 py-1.5 bg-theme-bg-tertiary border border-theme-border rounded text-[11px] text-theme-text-primary" />
                    </div>
                    <div className="flex gap-1 bg-theme-bg-tertiary p-1 rounded border border-theme-border">
                        {['ALL', 'DRAFT', 'SENT', 'PAID'].map(opt => (
                            <button key={opt} onClick={() => setStatusFilter(opt)} className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg ${statusFilter === opt ? 'bg-theme-bg-primary shadow-sm text-primary-600 border border-theme-border' : 'text-theme-text-secondary'}`}>{opt}</button>
                        ))}
                    </div>
                </div>
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-theme-bg-primary rounded border border-theme-border shadow-sm">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary-600 mb-2" /><p className="text-theme-text-secondary text-[10px] font-black uppercase tracking-widest">Loading...</p>
                    </div>
                ) : proformas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-theme-bg-primary rounded border border-theme-border shadow-sm text-center">
                        <FileText className="w-8 h-8 text-theme-text-secondary opacity-20 mb-4" />
                        <h3 className="text-sm font-black text-theme-text-primary uppercase tracking-tighter">No proformas found</h3>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        <div className="bg-theme-bg-primary rounded shadow border border-theme-border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-theme-bg-tertiary border-b border-theme-border">
                                            <th className="px-5 py-3 text-left font-semibold text-theme-text-secondary uppercase tracking-tight text-[10px]">PI Details</th>
                                            <th className="px-5 py-3 text-left font-semibold text-theme-text-secondary uppercase tracking-tight text-[10px]">Client</th>
                                            <th className="px-5 py-3 text-left font-semibold text-theme-text-secondary uppercase tracking-tight text-[10px]">Amount</th>
                                            <th className="px-5 py-3 text-left font-semibold text-theme-text-secondary uppercase tracking-tight text-[10px]">Status</th>
                                            <th className="px-5 py-3 text-center font-semibold text-theme-text-secondary uppercase tracking-tight text-[10px]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-theme-border">
                                        {currentItems.map((p) => (
                                            <tr key={p.id} className="hover:bg-theme-bg-tertiary transition-colors group">
                                                <td className="px-5 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-theme-text-primary">{p.proformaNumber}</span>
                                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-theme-text-secondary"><Calendar className="w-3 h-3" />{formatDate(p.issueDate)}</div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="font-medium text-theme-text-primary">{p.clientName}</div>
                                                    <div className="text-[10px] text-theme-text-secondary">{p.clientPhone || p.clientEmail || '—'}</div>
                                                </td>
                                                <td className="px-5 py-4 font-bold text-theme-text-primary">{formatCurrency(p.grandTotal)}</td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex px-2 py-1 text-[10px] font-black uppercase tracking-widest rounded-xl border ${getStatusStyle(p.status)}`}>{p.status}</span>
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button onClick={() => navigate(`/${role}/dashboard/proforma-management/view/${p.id}`)} className="p-2 text-theme-text-secondary hover:text-primary-600 rounded-lg transition-all"><Eye className="w-4 h-4" /></button>
                                                        {p.status === 'DRAFT' && (
                                                            <>
                                                                <button onClick={() => navigate(`/${role}/dashboard/proforma-management/update/${p.id}`)} className="p-2 text-theme-text-secondary hover:text-amber-600 rounded-lg transition-all"><Edit className="w-4 h-4" /></button>
                                                                <button onClick={() => handleAction(p.id, 'submit')} className="p-2 text-theme-text-secondary hover:text-emerald-600 rounded-lg transition-all"><Send className="w-4 h-4" /></button>
                                                                <button onClick={() => handleAction(p.id, 'delete')} className="p-2 text-theme-text-secondary hover:text-red-600 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                                            </>
                                                        )}
                                                        {p.status === 'SENT' && (
                                                            <>
                                                                <button onClick={() => handleAction(p.id, 'mark-as-paid')} className="p-2 text-theme-text-secondary hover:text-emerald-600 rounded-lg transition-all" title="Mark as Paid"><CheckCircle className="w-4 h-4" /></button>
                                                                <button onClick={() => handleAction(p.id, 'cancel')} className="p-2 text-theme-text-secondary hover:text-red-600 rounded-lg transition-all" title="Cancel"><XCircle className="w-4 h-4" /></button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                {totalPages > 1 && (
                    <div className="bg-theme-bg-primary px-4 py-3 rounded shadow border border-theme-border flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-theme-text-secondary">Page {currentPage} / {totalPages}</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded border border-theme-border disabled:opacity-30"><ChevronLeft className="w-4 h-4 text-theme-text-primary" /></button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded border border-theme-border disabled:opacity-30"><ChevronRight className="w-4 h-4 text-theme-text-primary" /></button>
                        </div>
                    </div>
                )}
            </div>
            <AnimatePresence>
                {operationStatus && (
                    <motion.div initial={{ opacity: 0, y: -20, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: -20, x: 20 }} className="fixed top-6 right-6 z-[100]">
                        <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-white ${operationStatus.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                            {operationStatus.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                            <span className="text-[11px] font-black uppercase tracking-widest">{operationStatus.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProformaInvoiceManagement;

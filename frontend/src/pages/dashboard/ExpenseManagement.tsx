/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    X,
    AlertTriangle,
    RefreshCw,
    CreditCard,
    DollarSign,
    Calendar,
    Tag,
    ArrowUpRight,
    ArrowDownRight,
    List,
    Grid3X3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import expenseService, { type Expense, type ExpenseType } from '../../services/expenseService';
import useAdminAuth from '../../context/AdminAuthContext';
import { useLanguage } from '../../context/LanguageContext';

type ViewMode = 'table' | 'grid' | 'list';

const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: any;
    color: string;
    subtitle?: string;
}> = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-theme-bg-primary rounded shadow border border-theme-border p-3 transition-all">
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
                <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div>
                <p className="text-[10px] text-theme-text-secondary uppercase tracking-tight font-medium">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-base font-bold text-theme-text-primary">{value}</h3>
                </div>
                {subtitle && <p className="text-[9px] text-theme-text-secondary mt-0.5">{subtitle}</p>}
            </div>
        </div>
    </div>
);

const ExpenseManagement: React.FC = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeType, setActiveType] = useState<'ALL' | ExpenseType>('ALL');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [formData, setFormData] = useState<Partial<Expense>>({
        title: '',
        description: '',
        amount: undefined,
        category: 'Others',
        type: 'DEBIT',
        paymentMethod: 'CASH',
        date: new Date().toISOString().split('T')[0]
    });

    const { user: _adminData } = useAdminAuth();
    const { t: _t } = useLanguage();

    const loadExpenses = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await expenseService.getAllExpenses();
            setExpenses(data);
            setFilteredExpenses(data);
        } catch (error: any) {
            showNotification(_t('expense.messages.loadError'), 'error');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadExpenses();
    }, [loadExpenses]);

    useEffect(() => {
        let filtered = expenses.filter(exp =>
            exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            exp.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (activeType !== 'ALL') {
            filtered = filtered.filter(exp => exp.type === activeType);
        }

        setFilteredExpenses(filtered);
        setCurrentPage(1);
    }, [searchTerm, activeType, expenses]);

    const stats = useMemo(() => {
        const debit = expenses.filter(e => e.type === 'DEBIT').reduce((acc, curr) => acc + Number(curr.amount), 0);
        const credit = expenses.filter(e => e.type === 'CREDIT').reduce((acc, curr) => acc + Number(curr.amount), 0);
        return { debit, credit, total: expenses.length };
    }, [expenses]);

    const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const validation = expenseService.validateExpenseData(formData);
            if (!validation.isValid) throw new Error(validation.errors[0]);

            if (isEditModalOpen && selectedExpense?.id) {
                await expenseService.updateExpense(selectedExpense.id, formData);
                showNotification(_t('expense.messages.updateSuccess'));
            } else {
                await expenseService.createExpense(formData);
                showNotification(_t('expense.messages.createSuccess'));
            }
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            loadExpenses();
        } catch (error: any) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedExpense?.id) return;
        setIsLoading(true);
        try {
            await expenseService.deleteExpense(selectedExpense.id);
            showNotification(_t('expense.messages.deleteSuccess'));
            setIsDeleteModalOpen(false);
            loadExpenses();
        } catch (error: any) {
            showNotification(error.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (date: any) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-RW', {
            style: 'currency',
            currency: 'RWF'
        }).format(amount);
    };

    // Pagination
    const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredExpenses.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="min-h-screen bg-theme-bg-secondary text-[11px] transition-colors duration-200">
            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-4 right-4 z-50"
                    >
                        <div className={`flex items-center gap-2 px-4 py-3 rounded shadow-lg text-white ${notification.type === 'success' ? 'bg-green-500' :
                            notification.type === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                            }`}>
                            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                            <span>{notification.message}</span>
                            <button onClick={() => setNotification(null)} className="ml-2"><X className="w-3.5 h-3.5" /></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="sticky top-0 bg-theme-bg-primary shadow-sm z-10 border-b border-theme-border">
                <div className="mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-primary-600 rounded">
                                <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-theme-text-primary">{_t('expense.title')}</h1>
                                <p className="text-[10px] text-theme-text-secondary">{_t('expense.subtitle')}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setFormData({
                                    title: '',
                                    description: '',
                                    amount: undefined,
                                    category: 'Others',
                                    type: 'DEBIT',
                                    paymentMethod: 'CASH',
                                    date: new Date().toISOString().split('T')[0]
                                });
                                setIsAddModalOpen(true);
                            }}
                            className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded font-medium text-xs transition-all shadow-sm"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            {_t('expense.addExpense')}
                        </button>
                    </div>
                </div>
            </div>

            <div className="mx-auto px-4 py-4 space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <StatCard
                        title={_t('expense.totalDebit')}
                        value={formatCurrency(stats.debit)}
                        icon={ArrowDownRight}
                        color="bg-red-500"
                        subtitle={_t('expense.subtitle')}
                    />
                    <StatCard
                        title={_t('expense.totalCredit')}
                        value={formatCurrency(stats.credit)}
                        icon={ArrowUpRight}
                        color="bg-green-500"
                        subtitle={_t('expense.subtitle')}
                    />
                    <StatCard
                        title={_t('expense.totalTransactions')}
                        value={stats.total}
                        icon={CreditCard}
                        color="bg-primary-500"
                        subtitle={_t('expense.totalTransactions')}
                    />
                </div>

                {/* Controls */}
                <div className="bg-theme-bg-primary rounded shadow border border-theme-border p-3">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="flex items-center gap-2 w-full md:w-1/3">
                            <div className="relative w-full">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-theme-text-secondary" />
                                <input
                                    type="text"
                                    placeholder={_t('expense.searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-8 pr-4 py-1.5 bg-theme-bg-tertiary border border-theme-border rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-theme-text-primary"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
                            {['ALL', 'DEBIT', 'CREDIT'].map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setActiveType(t as any)}
                                    className={`px-3 py-1.5 rounded whitespace-nowrap font-medium transition-all ${activeType === t
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-theme-bg-tertiary text-theme-text-secondary hover:text-theme-text-primary border border-theme-border'
                                        }`}
                                >
                                    {t === 'ALL' ? _t('expense.allTypes') : t === 'DEBIT' ? _t('expense.debit') : _t('expense.credit')}
                                </button>
                            ))}
                            <div className="h-6 w-px bg-theme-border mx-1" />
                            <div className="flex items-center gap-1 bg-theme-bg-tertiary p-1 rounded border border-theme-border">
                                <button onClick={() => setViewMode('table')} className={`p-1 rounded ${viewMode === 'table' ? 'bg-theme-bg-primary shadow-sm text-primary-600' : 'text-theme-text-secondary'}`}><List className="w-3.5 h-3.5" /></button>
                                <button onClick={() => setViewMode('grid')} className={`p-1 rounded ${viewMode === 'grid' ? 'bg-theme-bg-primary shadow-sm text-primary-600' : 'text-theme-text-secondary'}`}><Grid3X3 className="w-3.5 h-3.5" /></button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-theme-bg-primary rounded border border-theme-border shadow-sm">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary-600 mb-2" />
                        <p className="text-theme-text-secondary">{_t('common.loading')}</p>
                    </div>
                ) : filteredExpenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-theme-bg-primary rounded border border-theme-border shadow-sm">
                        <DollarSign className="w-12 h-12 text-theme-text-secondary opacity-20 mb-4" />
                        <h3 className="text-sm font-semibold text-theme-text-primary">No expenses found</h3>
                        <p className="text-theme-text-secondary mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : viewMode === 'table' ? (
                    <div className="bg-theme-bg-primary rounded shadow border border-theme-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-theme-bg-tertiary border-b border-theme-border">
                                    <tr>
                                        <th className="text-left py-2.5 px-4 text-theme-text-secondary font-semibold uppercase tracking-tight">{_t('expense.table.date')}</th>
                                        <th className="text-left py-2.5 px-4 text-theme-text-secondary font-semibold uppercase tracking-tight">{_t('expense.table.title')}</th>
                                        <th className="text-left py-2.5 px-4 text-theme-text-secondary font-semibold uppercase tracking-tight">{_t('expense.table.category')}</th>
                                        <th className="text-left py-2.5 px-4 text-theme-text-secondary font-semibold uppercase tracking-tight">{_t('expense.table.method')}</th>
                                        <th className="text-left py-2.5 px-4 text-theme-text-secondary font-semibold uppercase tracking-tight">{_t('expense.table.type')}</th>
                                        <th className="text-right py-2.5 px-4 text-theme-text-secondary font-semibold uppercase tracking-tight">{_t('expense.table.amount')}</th>
                                        <th className="text-right py-2.5 px-4 text-theme-text-secondary font-semibold uppercase tracking-tight">{_t('expense.table.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-theme-border">
                                    {currentItems.map((exp) => (
                                        <motion.tr
                                            key={exp.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-theme-bg-tertiary/30 transition-colors"
                                        >
                                            <td className="py-2.5 px-4 text-theme-text-secondary">{formatDate(exp.date)}</td>
                                            <td className="py-2.5 px-4 font-medium text-theme-text-primary">
                                                <div>
                                                    <p>{exp.title}</p>
                                                    {exp.description && <p className="text-[9px] text-theme-text-secondary mt-0.5 line-clamp-1 italic">{exp.description}</p>}
                                                </div>
                                            </td>
                                            <td className="py-2.5 px-4 text-theme-text-secondary">
                                                <span className="px-1.5 py-0.5 bg-theme-bg-tertiary border border-theme-border rounded text-[10px]">
                                                    {exp.category || 'Uncategorized'}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-4 text-theme-text-secondary uppercase">{exp.paymentMethod || 'N/A'}</td>
                                            <td className="py-2.5 px-4">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${exp.type === 'DEBIT'
                                                    ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                                                    : 'bg-green-500/10 text-green-600 border border-green-500/20'
                                                    }`}>
                                                    {exp.type === 'DEBIT' ? _t('expense.debit') : _t('expense.credit')}
                                                </span>
                                            </td>
                                            <td className={`py-2.5 px-4 text-right font-bold ${exp.type === 'DEBIT' ? 'text-red-600' : 'text-green-600'}`}>
                                                {exp.type === 'DEBIT' ? '-' : '+'}{formatCurrency(Number(exp.amount))}
                                            </td>
                                            <td className="py-2.5 px-4 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedExpense(exp);
                                                            setFormData({ ...exp, date: new Date(exp.date).toISOString().split('T')[0] });
                                                            setIsEditModalOpen(true);
                                                        }}
                                                        className="p-1.5 text-amber-600 hover:bg-amber-500/10 rounded transition-colors"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedExpense(exp);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="bg-theme-bg-tertiary px-4 py-2 border-t border-theme-border flex items-center justify-between">
                            <span className="text-theme-text-secondary text-[10px]">
                                Showing {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredExpenses.length)} of {filteredExpenses.length}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1 rounded hover:bg-theme-bg-primary disabled:opacity-30 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-2 font-medium">{currentPage} / {totalPages || 1}</span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1 rounded hover:bg-theme-bg-primary disabled:opacity-30 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {currentItems.map((exp) => (
                            <motion.div
                                key={exp.id}
                                layout
                                className="bg-theme-bg-primary rounded shadow border border-theme-border p-3 hover:shadow-md transition-all group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[9px] text-theme-text-secondary flex items-center gap-1">
                                        <Calendar className="w-2.5 h-2.5" />
                                        {formatDate(exp.date)}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${exp.type === 'DEBIT' ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'
                                        }`}>
                                        {exp.type === 'DEBIT' ? _t('expense.debit') : _t('expense.credit')}
                                    </span>
                                </div>
                                <h4 className="font-bold text-theme-text-primary text-xs line-clamp-1 mb-1">{exp.title}</h4>
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[9px] text-theme-text-secondary bg-theme-bg-tertiary px-1.5 py-0.5 rounded border border-theme-border flex items-center gap-1">
                                        <Tag className="w-2.5 h-2.5" />
                                        {exp.category || 'Misc'}
                                    </span>
                                    <span className="text-[9px] text-theme-text-secondary flex items-center gap-1">
                                        <CreditCard className="w-2.5 h-2.5" />
                                        {exp.paymentMethod || 'Cash'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between border-t border-theme-border pt-2 mt-auto">
                                    <p className={`font-bold text-sm ${exp.type === 'DEBIT' ? 'text-red-600' : 'text-green-600'}`}>
                                        {exp.type === 'DEBIT' ? '-' : '+'}{formatCurrency(Number(exp.amount))}
                                    </p>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                setSelectedExpense(exp);
                                                setFormData({ ...exp, date: new Date(exp.date).toISOString().split('T')[0] });
                                                setIsEditModalOpen(true);
                                            }}
                                            className="p-1 px-2 text-amber-600 hover:bg-amber-500/10 rounded text-[10px] flex items-center gap-1 transition-colors"
                                        >
                                            <Edit className="w-3 h-3" /> Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedExpense(exp);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="p-1 px-2 text-red-500 hover:bg-red-500/10 rounded text-[10px] flex items-center gap-1 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {(isAddModalOpen || isEditModalOpen) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-theme-bg-primary rounded border border-theme-border shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-theme-border flex justify-between items-center bg-theme-bg-tertiary">
                                <h3 className="text-sm font-bold text-theme-text-primary">
                                    {isEditModalOpen ? _t('expense.editExpense') : _t('expense.addExpense')}
                                </h3>
                                <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="text-theme-text-secondary hover:text-theme-text-primary"><X className="w-4 h-4" /></button>
                            </div>
                            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold text-theme-text-secondary uppercase">{_t('expense.form.type')}</label>
                                        <div className="flex gap-2 p-1 bg-theme-bg-tertiary rounded border border-theme-border">
                                            {(['DEBIT', 'CREDIT'] as ExpenseType[]).map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, type })}
                                                    className={`flex-1 py-1 rounded text-[10px] font-bold transition-all ${formData.type === type
                                                        ? type === 'DEBIT' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                                                        : 'text-theme-text-secondary hover:bg-theme-bg-primary'
                                                        }`}
                                                >
                                                    {type === 'DEBIT' ? _t('expense.debit') : _t('expense.credit')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold text-theme-text-secondary uppercase">{_t('expense.form.date')}</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date as string}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full px-3 py-1.5 bg-theme-bg-tertiary border border-theme-border rounded focus:ring-1 focus:ring-primary-500 outline-none text-theme-text-primary"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-theme-text-secondary uppercase">{_t('expense.form.title')}</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder={_t('expense.form.placeholders.title')}
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-theme-bg-tertiary border border-theme-border rounded focus:ring-1 focus:ring-primary-500 outline-none text-theme-text-primary"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold text-theme-text-secondary uppercase">{_t('expense.form.amount')}</label>
                                        <input
                                            type="number"
                                            required
                                            placeholder={_t('expense.form.placeholders.amount')}
                                            value={formData.amount ?? ''}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value === '' ? undefined : Number(e.target.value) })}
                                            className="w-full px-3 py-1.5 bg-theme-bg-tertiary border border-theme-border rounded focus:ring-1 focus:ring-primary-500 outline-none text-theme-text-primary group-hover:border-primary-500 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold text-theme-text-secondary uppercase">{_t('expense.form.method')}</label>
                                        <select
                                            value={formData.paymentMethod}
                                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                            className="w-full px-3 py-1.5 bg-theme-bg-tertiary border border-theme-border rounded focus:ring-1 focus:ring-primary-500 outline-none text-theme-text-primary"
                                        >
                                            <option value="CASH">{_t('expense.form.methods.cash')}</option>
                                            <option value="MOMO">{_t('expense.form.methods.momo')}</option>
                                            <option value="CARD">{_t('expense.form.methods.card')}</option>
                                            <option value="TRANSFER">{_t('expense.form.methods.transfer')}</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-theme-text-secondary uppercase">{_t('expense.form.category')}</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-theme-bg-tertiary border border-theme-border rounded focus:ring-1 focus:ring-primary-500 outline-none text-theme-text-primary"
                                    >
                                        <option value="Rent">{_t('expense.form.categories.rent')}</option>
                                        <option value="Electricity">{_t('expense.form.categories.electricity')}</option>
                                        <option value="Water">{_t('expense.form.categories.water')}</option>
                                        <option value="Salary">{_t('expense.form.categories.salary')}</option>
                                        <option value="Marketing">{_t('expense.form.categories.marketing')}</option>
                                        <option value="Maintenance">{_t('expense.form.categories.maintenance')}</option>
                                        <option value="Others">{_t('expense.form.categories.others')}</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold text-theme-text-secondary uppercase">{_t('expense.form.description')}</label>
                                    <textarea
                                        rows={2}
                                        placeholder={_t('expense.form.placeholders.description')}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-1.5 bg-theme-bg-tertiary border border-theme-border rounded focus:ring-1 focus:ring-primary-500 outline-none text-theme-text-primary resize-none"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                        className="flex-1 py-2 rounded font-semibold text-theme-text-secondary hover:bg-theme-bg-tertiary transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                    >
                                        {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                                        {isEditModalOpen ? _t('expense.editExpense') : _t('expense.addExpense')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {isDeleteModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-theme-bg-primary rounded border border-theme-border shadow-2xl w-full max-sm p-6 text-center"
                        >
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-sm font-bold text-theme-text-primary mb-2">{_t('expense.deleteExpense')}?</h3>
                            <p className="text-[10px] text-theme-text-secondary mb-6">{_t('expense.deleteConfirm')}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 py-2 rounded font-semibold text-theme-text-secondary hover:bg-theme-bg-tertiary transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold flex items-center justify-center gap-2 transition-all"
                                >
                                    {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ExpenseManagement;

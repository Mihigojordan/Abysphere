/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, Search, Eye,
  ChevronLeft, ChevronRight, AlertTriangle,
  CheckCircle, XCircle, X, Package, RefreshCw,
  Grid3X3, List, Minimize2, DollarSign,
  ShoppingCart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import stockOutService, {
  type CreateStockOutInput,
  type StockOut,
  type PaymentMethod,
} from '../../services/stockoutService';
import stockInService from '../../services/stockInService';
import { API_URL } from '../../api/api';
import stockService from '../../services/stockService';

type ViewMode = 'table' | 'grid' | 'list';

interface OperationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StockOutWithRelations extends StockOut {
  stockin?: {
    itemName: string;
    sku: string;
    unitOfMeasure: string;
    unitCost: number;
  } | null;
}

interface StockInOption {
  id: number;
  label: string;
  itemName: string;
  sku: string;
  available: number;
  unitOfMeasure: string;
  unitCost: number;
}

const StockOutDashboard: React.FC = () => {
  const [stockOuts, setStockOuts] = useState<StockOutWithRelations[]>([]);
  const [allStockOuts, setAllStockOuts] = useState<StockOutWithRelations[]>([]);
  const [transactions, setTransactions] = useState<Map<string, StockOutWithRelations[]>>(new Map());
  const [stockInOptions, setStockInOptions] = useState<StockInOption[]>([]);
  const [loadingStockIns, setLoadingStockIns] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<keyof StockOutWithRelations>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [deleteConfirm, setDeleteConfirm] = useState<StockOutWithRelations | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<StockOutWithRelations[] | null>(null);

  const [formData, setFormData] = useState<any>({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    paymentMethod: 'CASH' as PaymentMethod,
    sales: [{ stockinId: '', quantity: 1, soldPrice: undefined }],
  });
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    loadStockIns();
    loadStockOuts();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allStockOuts]);

  // FETCH STOCK-IN (AVAILABLE ONLY)
  const loadStockIns = async () => {
    try {
      setLoadingStockIns(true);
      const raw = await stockService.getAllStocks(); // Returns your StockIn[]
      console.log(raw);
      
      const options: StockInOption[] = raw
        .filter(s => s.receivedQuantity > 0)
        .map(s => ({
          id: s.id,
          label: `${s.itemName} (${s.sku}) – ${s.receivedQuantity} left (${s.unitOfMeasure})`,
          itemName: s.itemName,
          sku: s.sku,
          available: s.receivedQuantity,
          unitOfMeasure: s.unitOfMeasure,
          unitCost: s.unitCost,
        }));
      setStockInOptions(options);
    } catch (e: any) {
      showOperationStatus('error', 'Failed to load products');
    } finally {
      setLoadingStockIns(false);
    }
  };

  const loadStockOuts = async () => {
    try {
      setLoading(true);
      const data = await stockOutService.getAllStockOuts();
      setAllStockOuts(data);
      groupByTransaction(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load sales');
      setAllStockOuts([]);
    } finally {
      setLoading(false);
    }
  };

  const groupByTransaction = (data: StockOutWithRelations[]) => {
    const map = new Map<string, StockOutWithRelations[]>();
    data.forEach((so) => {
      const tid = so.transactionId || 'unknown';
      if (!map.has(tid)) map.set(tid, []);
      map.get(tid)!.push(so);
    });
    setTransactions(map);
  };

  const showOperationStatus = (type: OperationStatus['type'], message: string, duration = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allStockOuts];
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (so) =>
          so.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          so.clientPhone?.includes(searchTerm) ||
          so.transactionId?.includes(searchTerm) ||
          so.stockin?.itemName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        const aD = aVal ? new Date(aVal).getTime() : 0;
        const bD = bVal ? new Date(bVal).getTime() : 0;
        return sortOrder === 'asc' ? aD - bD : bD - aD;
      }
      const aStr = aVal?.toString().toLowerCase() || '';
      const bStr = bVal?.toString().toLowerCase() || '';
      return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    setStockOuts(filtered);
    setCurrentPage(1);
  };

  const totalTransactions = transactions.size;
  const totalItemsSold = allStockOuts.reduce((s, so) => s + so.quantity, 0);
  const totalRevenue = allStockOuts.reduce((s, so) => s + (so.soldPrice || 0) * so.quantity, 0);

  const handleAddStockOut = () => {
    setFormData({
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      paymentMethod: 'CASH',
      sales: [{ stockinId: '', quantity: 1, soldPrice: undefined }],
    });
    setFormError('');
    setShowAddModal(true);
  };

  const addSaleRow = () => {
    setFormData({
      ...formData,
      sales: [...formData.sales, { stockinId: '', quantity: 1, soldPrice: undefined }],
    });
  };

  const removeSaleRow = (idx: number) => {
    setFormData({
      ...formData,
      sales: formData.sales.filter((_: any, i: number) => i !== idx),
    });
  };

  const handleProductSelect = (idx: number, stockInId: string) => {
    const selected = stockInOptions.find(o => o.id == stockInId);
    if (!selected) return;

    const updated = [...formData.sales];
    updated[idx] = {
      ...updated[idx],
      stockinId: selected.id,
      soldPrice: selected.unitCost,
    };
    setFormData({ ...formData, sales: updated });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    idx?: number
  ) => {
    const { name, value } = e.target;
    if (idx !== undefined) {
      if (name === 'quantity') {
        const updated = [...formData.sales];
        updated[idx].quantity = parseInt(value) || 0;
        setFormData({ ...formData, sales: updated });
      }
      if (name === 'soldPrice') {
        const updated = [...formData.sales];
        updated[idx].soldPrice = parseFloat(value) || 0;
        setFormData({ ...formData, sales: updated });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = (): string | null => {
    for (const s of formData.sales) {
      if (!s.stockinId) return 'Select a product for every row';
      if (s.quantity <= 0) return 'Quantity must be > 0';
      const opt = stockInOptions.find(o => o.id === s.stockinId);
      if (opt && s.quantity > opt.available) {
        return `Only ${opt.available} ${opt.itemName} left`;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError('');
    try {
      setOperationLoading(true);
      const result = await stockOutService.createStockOut(formData);
      setShowAddModal(false);
      await loadStockOuts();
      showOperationStatus('success', `Transaction ${result.transactionId} created!`);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create sale');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleViewTransaction = async (tid: string) => {
    try {
      const data = await stockOutService.getStockOutByTransactionId(tid);
      setSelectedTransaction(data);
      setShowViewModal(true);
    } catch (err: any) {
      showOperationStatus('error', err.message);
    }
  };

  const handleDeleteStockOut = async (so: StockOutWithRelations) => {
    if (!so.id) return;
    try {
      setOperationLoading(true);
      await stockOutService.deleteStockOut(so.id);
      setDeleteConfirm(null);
      await loadStockOuts();
      showOperationStatus('success', 'Sale deleted');
    } catch (err: any) {
      showOperationStatus('error', err.message);
    } finally {
      setOperationLoading(false);
    }
  };

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

  const totalPages = Math.ceil(stockOuts.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentStockOuts = stockOuts.slice(startIdx, endIdx);

  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow border border-gray-100 overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="text-left py-3 px-4 font-semibold">Product</th>
            <th className="text-left py-3 px-4 font-semibold">Qty</th>
            <th className="text-left py-3 px-4 font-semibold">Price</th>
            <th className="text-left py-3 px-4 font-semibold">Total</th>
            <th className="text-left py-3 px-4 font-semibold hidden sm:table-cell">Client</th>
            <th className="text-left py-3 px-4 font-semibold hidden md:table-cell">Payment</th>
            <th className="text-left py-3 px-4 font-semibold">Date</th>
            <th className="text-right py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {currentStockOuts.map((so) => (
            <motion.tr key={so.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="font-medium">{so.stockin?.itemName || 'Unknown'}</div>
                <div className="text-xs text-gray-500">SKU: {so.stockin?.sku}</div>
              </td>
              <td className="py-3 px-4">{so.quantity}</td>
              <td className="py-3 px-4">{formatCurrency(so.soldPrice || 0)}</td>
              <td className="py-3 px-4 font-medium">{formatCurrency((so.soldPrice || 0) * so.quantity)}</td>
              <td className="py-3 px-4 hidden sm:table-cell">{so.clientName || '-'}</td>
              <td className="py-3 px-4 hidden md:table-cell">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  so.paymentMethod === 'MOMO' ? 'bg-blue-100 text-blue-800' :
                  so.paymentMethod === 'CARD' ? 'bg-purple-100 text-purple-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {so.paymentMethod}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-600">{formatDate(so.createdAt)}</td>
              <td className="py-3 px-4 text-right space-x-1">
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => so.transactionId && handleViewTransaction(so.transactionId)} className="p-1">
                  <Eye className="w-4 h-4 text-gray-500 hover:text-primary-600" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setDeleteConfirm(so)} className="p-1">
                  <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-600" />
                </motion.button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPagination = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="flex justify-between items-center bg-white px-4 py-3 border-t rounded-b-lg">
        <div className="text-sm text-gray-600">
          Showing {startIdx + 1}-{Math.min(endIdx, stockOuts.length)} of {stockOuts.length}
        </div>
        <div className="flex space-x-1">
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border rounded disabled:opacity-50">
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
          {pages.map(p => (
            <motion.button key={p} whileHover={{ scale: 1.05 }} onClick={() => setCurrentPage(p)} className={`px-3 py-1 rounded text-sm ${currentPage === p ? 'bg-primary-600 text-white' : 'border'}`}>
              {p}
            </motion.button>
          ))}
          <motion.button whileHover={{ scale: 1.05 }} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border rounded disabled:opacity-50">
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <div className="sticky top-0 bg-white shadow-md z-10">
        <div className="id: String(stockinId) mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Minimize2 className="w-5 h-5" />
            <div>
              <h1 className="text-xl font-semibold">Stock Out Management</h1>
              <p className="text-sm text-gray-500">Track sales and outflows</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <motion.button whileHover={{ scale: 1.05 }} onClick={loadStockOuts} disabled={loading} className="flex items-center space-x-2 px-4 py-2 border rounded">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} onClick={handleAddStockOut} className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded">
              <Plus className="w-4 h-4" />
              <span>New Sale</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="id: String(stockinId) mx-auto px-4 py-6 space-y-6">
        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Transactions', count: totalTransactions, icon: ShoppingCart },
            { title: 'Items Sold', count: totalItemsSold, icon: Package },
            { title: 'Revenue', count: formatCurrency(totalRevenue), icon: DollarSign },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-primary-50 rounded-full">
                  <s.icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{s.title}</p>
                  <p className="text-xl font-semibold">{s.count}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* SEARCH & VIEW */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search client, product, transaction..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border rounded w-64"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white p-8 text-center rounded-lg shadow">Loading...</div>
        ) : stockOuts.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-lg shadow">
            <p className="text-lg font-semibold">No Sales Found</p>
            <p className="text-sm text-gray-500">Start recording a sale.</p>
          </div>
        ) : (
          <div>
            {renderTableView()}
            {renderPagination()}
          </div>
        )}

        {/* ADD MODAL */}
       {/* ADD MODAL */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                {/* Header */}
                <div className="px-6 py-4 border-b bg-gradient-to-r from-primary-50 to-white flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">New Sale Transaction</h3>
                  <button 
                    onClick={() => setShowAddModal(false)} 
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 px-6 py-5">
                  {formError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r mb-5 flex items-start gap-3">
                      <div className="text-red-600 mt-0.5">⚠</div>
                      <div className="text-red-700 text-sm">{formError}</div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Customer Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input 
                          name="clientName" 
                          placeholder="Customer Name" 
                          value={formData.clientName} 
                          onChange={handleInputChange} 
                          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                        />
                        <input 
                          name="clientEmail" 
                          type="email" 
                          placeholder="Email Address" 
                          value={formData.clientEmail} 
                          onChange={handleInputChange} 
                          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                        />
                        <input 
                          name="clientPhone" 
                          placeholder="Phone Number" 
                          value={formData.clientPhone} 
                          onChange={handleInputChange} 
                          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" 
                        />
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Payment Method</h4>
                      <select 
                        name="paymentMethod" 
                        value={formData.paymentMethod} 
                        onChange={handleInputChange} 
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                      >
                        <option value="CASH">💵 Cash</option>
                        <option value="MOMO">📱 Mobile Money</option>
                        <option value="CARD">💳 Card</option>
                      </select>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Sale Items</h4>
                        <button 
                          type="button" 
                          onClick={addSaleRow} 
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Add Item
                        </button>
                      </div>

                      <div className="space-y-3">
                        {formData.sales.map((sale: any, i: number) => {
                          const opt = stockInOptions.find(o => o.id === sale.stockinId);
                          const maxQty = opt?.available ?? 0;

                          return (
                            <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                                {/* Product Selection */}
                                <div className="md:col-span-5">
                                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Product</label>
                                  <select 
                                    value={sale.stockinId} 
                                    onChange={e => handleProductSelect(i, e.target.value)} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white" 
                                    required
                                  >
                                    <option value="">Select product...</option>
                                    {stockInOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                                  </select>
                                </div>

                                {/* Quantity */}
                                <div className="md:col-span-3">
                                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Quantity</label>
                                  <input 
                                    type="number" 
                                    name="quantity" 
                                    value={sale.quantity} 
                                    min="1" 
                                    max={maxQty} 
                                    onChange={e => handleInputChange(e, i)} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                                    required 
                                  />
                                  {maxQty > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">Available: {maxQty}</p>
                                  )}
                                </div>

                                {/* Price */}
                                <div className="md:col-span-3">
                                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">Unit Price</label>
                                  <input 
                                    type="number" 
                                    step="0.01" 
                                    name="soldPrice" 
                                    value={sale.soldPrice ?? ''} 
                                    onChange={e => handleInputChange(e, i)} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                                    placeholder="Auto-filled" 
                                  />
                                </div>

                                {/* Remove Button */}
                                <div className="md:col-span-1 flex items-end justify-end md:pb-2">
                                  {formData.sales.length > 1 && (
                                    <button 
                                      type="button" 
                                      onClick={() => removeSaleRow(i)} 
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Remove item"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </form>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)} 
                    className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={operationLoading} 
                    onClick={handleSubmit}
                    className="px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {operationLoading ? 'Creating...' : 'Create Sale'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        
        <AnimatePresence>
          {showViewModal && selectedTransaction && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-screen overflow-y-auto shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Transaction: {selectedTransaction[0].transactionId}</h3>
                  <button onClick={() => { setShowViewModal(false); setSelectedTransaction(null); }}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {selectedTransaction[0].transactionId && (
                  <div className="mb-4 text-center">
                    <img src={`${API_URL}/uploads/barcodes/${selectedTransaction[0].transactionId}.png`} alt="Barcode"
                      className="mx-auto h-20" />
                  </div>
                )}
                <div className="space-y-3">
                  {selectedTransaction.map((so) => (
                    <div key={so.id} className="border rounded p-3 flex justify-between">
                      <div>
                        <div className="font-medium">{so.stockin?.productName}</div>
                        <div className="text-sm text-gray-600">Qty: {so.quantity} × {formatCurrency(so.soldPrice || 0)}</div>
                      </div>
                      <div className="text-right font-medium">
                        {formatCurrency((so.soldPrice || 0) * so.quantity)}
                      </div>
                    </div>
                  ))}
                  <div className="border-t pt-3 font-semibold text-right">
                    Total: {formatCurrency(selectedTransaction.reduce((s, so) => s + (so.soldPrice || 0) * so.quantity, 0))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {deleteConfirm && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Delete Sale Item</h3>
                </div>
                <p className="text-sm text-gray-700 mb-4">
                  This will restore stock and cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <motion.button whileHover={{ scale: 1.05 }} onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 border rounded">Cancel</motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleDeleteStockOut(deleteConfirm)}
                    className="px-4 py-2 bg-red-600 text-white rounded">Delete</motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* TOAST */}
        <AnimatePresence>
          {operationStatus && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-4 right-4 z-50">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg text-sm border ${
                operationStatus.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                'bg-red-50 border-red-200 text-red-800'
              }`}>
                {operationStatus.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <span>{operationStatus.message}</span>
                <button onClick={() => setOperationStatus(null)}><X className="w-4 h-4" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StockOutDashboard;
import React, { useEffect, useState, useRef } from "react";
import { X, AlertCircle, Plus, Search, ChevronDown, Check, Package, ShoppingCart, CreditCard } from "lucide-react";

interface StockIn {
  id: number;
  sku: string;
  itemName: string;
  receivedQuantity: number;
  unitCost?: number;
  warehouseLocation: string;
}

interface StockOut {
  id: string;
  stockinId?: number | null;
  quantity: number;
  soldPrice?: number | null;
  clientName?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  paymentMethod?: "CARD" | "MOMO" | "CASH" | null;
}

type PaymentMethod = "CARD" | "MOMO" | "CASH";

interface SalesEntry {
  stockinId: string;
  quantity: string;
  soldPrice: string;
  isExternal: boolean;
  externalItemName?: string;
  externalSku?: string;
}

interface ValidationError {
  stockinId: string;
  quantity: string;
  soldPrice: string;
  externalItemName?: string;
}

interface UpsertStockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  stockOut?: StockOut | null;
  stockIns: StockIn[];
  isLoading: boolean;
  title: string;
}

// Searchable Select Component matching AddStockin style
const SearchableSelect: React.FC<{
  options: { value: string; label: string; subLabel?: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}> = ({ options, value, onChange, placeholder = "Select item...", error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filtered = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.subLabel && option.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2.5 text-xs border rounded-lg cursor-pointer transition-colors ${
          error ? 'border-red-300' : 'border-theme-border'
        } ${isOpen ? 'ring-2 ring-primary-500 border-transparent' : 'hover:border-theme-border'} bg-theme-bg-primary`}
      >
        <div className="flex items-center justify-between">
          <span className={selected ? 'text-theme-text-primary' : 'text-theme-text-secondary'}>
            {selected ? (
              <span className="flex flex-col">
                <span>{selected.label}</span>
                {selected.subLabel && <span className="text-theme-text-secondary text-[10px]">{selected.subLabel}</span>}
              </span>
            ) : placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 text-theme-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-theme-bg-primary border border-theme-border rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-theme-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-theme-text-secondary" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-theme-border rounded bg-theme-bg-secondary text-theme-text-primary focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-theme-text-secondary">No results found</div>
            ) : (
              filtered.map((option) => (
                <div
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`px-3 py-2 hover:bg-theme-bg-tertiary cursor-pointer text-xs ${
                    option.value === value ? 'bg-primary-500/10 text-primary-600' : 'text-theme-text-primary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span>{option.label}</span>
                      {option.subLabel && <p className="text-[10px] text-theme-text-secondary mt-0.5">{option.subLabel}</p>}
                    </div>
                    {option.value === value && <Check className="h-3 w-3 text-primary-600" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <X className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};

const UpsertStockOutModal: React.FC<UpsertStockOutModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  stockOut,
  stockIns,
  isLoading,
  title,
}) => {
  const isUpdateMode = !!stockOut;

  const [formData, setFormData] = useState({
    stockinId: "",
    quantity: "",
    soldPrice: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    paymentMethod: "" as PaymentMethod | "",
    isExternal: false,
    externalItemName: "",
    externalSku: "",
    salesEntries: [{ stockinId: "", quantity: "", soldPrice: "", isExternal: false, externalItemName: "", externalSku: "" }] as SalesEntry[],
  });

  const [validationErrors, setValidationErrors] = useState({
    stockinId: "",
    externalItemName: "",
    quantity: "",
    soldPrice: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    paymentMethod: "",
    salesEntries: [] as ValidationError[],
  });

  const [touched, setTouched] = useState({
    stockinId: false,
    externalItemName: false,
    quantity: false,
    soldPrice: false,
    clientEmail: false,
    clientPhone: false,
    salesEntries: [] as boolean[],
  });

  const [showWarnings, setShowWarnings] = useState(false);

  useEffect(() => {
    if (isUpdateMode && stockOut) {
      setFormData({
        stockinId: stockOut.stockinId?.toString() || "",
        quantity: stockOut.quantity?.toString() || "",
        soldPrice: stockOut.soldPrice?.toString() || "",
        clientName: stockOut.clientName || "",
        clientEmail: stockOut.clientEmail || "",
        clientPhone: stockOut.clientPhone || "",
        paymentMethod: stockOut.paymentMethod || "",
        isExternal: false,
        externalItemName: "",
        externalSku: "",
        salesEntries: [],
      });
    } else {
      setFormData({
        stockinId: "",
        quantity: "",
        soldPrice: "",
        isExternal: false,
        externalItemName: "",
        externalSku: "",
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        paymentMethod: "",
        salesEntries: [{ stockinId: "", quantity: "", soldPrice: "", isExternal: false, externalItemName: "", externalSku: "" }],
      });
    }

    setValidationErrors({
      stockinId: "",
      externalItemName: "",
      quantity: "",
      soldPrice: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      paymentMethod: "",
      salesEntries: [],
    });

    setTouched({
      stockinId: false,
      externalItemName: false,
      quantity: false,
      soldPrice: false,
      clientEmail: false,
      clientPhone: false,
      salesEntries: [],
    });

    setShowWarnings(false);
  }, [stockOut, isOpen, isUpdateMode]);

  // Validation Functions
  const validateStockInId = (id: string): string => {
    if (!id) return "Stock item is required";
    const stock = stockIns.find(s => s.id === Number(id));
    if (!stock) return "Invalid stock item selected";
    return "";
  };

  const validateQuantity = (qty: string, stockinId?: string): string => {
    if (!qty) return "Quantity is required";
    const num = Number(qty);
    if (isNaN(num)) return "Quantity must be a valid number";
    if (num <= 0) return "Quantity must be greater than 0";
    if (!Number.isInteger(num)) return "Quantity must be a whole number";
    if (num > 999999) return "Quantity is too large";

    if (stockinId) {
      const stock = stockIns.find(s => s.id === Number(stockinId));
      if (stock && num > stock.receivedQuantity) {
        return `Exceeds available stock (${stock.receivedQuantity})`;
      }
    }
    return "";
  };

  const validateSoldPrice = (price: string): string => {
    if (!price) return "";
    const num = Number(price);
    if (isNaN(num)) return "Price must be a valid number";
    if (num < 0) return "Price cannot be negative";
    if (num > 999999999) return "Price is too large";
    const decimalPlaces = (price.split('.')[1] || '').length;
    if (decimalPlaces > 2) return "Price can have maximum 2 decimal places";
    return "";
  };

  const validateEmail = (email: string): string => {
    if (!email) return "";
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return "Invalid email format";
    if (email.length > 255) return "Email is too long";
    return "";
  };

  const validatePhone = (phone: string): string => {
    if (!phone) return "";
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    if (!/^\+?\d+$/.test(cleaned)) return "Phone number can only contain digits and optional +";
    if (cleaned.length < 9) return "Phone number is too short";
    if (cleaned.length > 15) return "Phone number is too long";
    return "";
  };

  const validateClientName = (name: string): string => {
    if (!name) return "";
    if (name.length > 255) return "Name is too long";
    if (name.trim().length === 0) return "Name cannot be only spaces";
    return "";
  };

  const validatePaymentMethod = (method: string): string => {
    if (method && !['CASH', 'MOMO', 'CARD'].includes(method)) {
      return "Invalid payment method";
    }
    return "";
  };

  const isSellingBelowCost = (price: string, stockinId: string): boolean => {
    if (!price || !stockinId) return false;
    const stock = stockIns.find(s => s.id === Number(stockinId));
    if (!stock || !stock.unitCost) return false;
    return Number(price) < Number(stock.unitCost);
  };

  const getStockInfo = (id: string): StockIn | undefined => {
    return stockIns.find(s => s.id === Number(id));
  };

  const calculateSuggestedQuantity = (available: number): number => {
    return available > 0 ? Math.max(1, Math.floor(available / 2)) : 1;
  };

  const addSalesEntry = () => {
    setFormData(prev => ({
      ...prev,
      salesEntries: [...prev.salesEntries, { stockinId: "", quantity: "", soldPrice: "", isExternal: false, externalItemName: "", externalSku: "" }],
    }));
  };

  const removeSalesEntry = (index: number) => {
    if (formData.salesEntries.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      salesEntries: prev.salesEntries.filter((_, i) => i !== index),
    }));
  };

  const handleSalesEntryChange = (
    index: number,
    field: "stockinId" | "quantity" | "soldPrice" | "isExternal" | "externalItemName" | "externalSku",
    value: any
  ) => {
    const updated = [...formData.salesEntries];
    (updated[index] as any)[field] = value;

    if (field === "isExternal") {
      updated[index].stockinId = "";
      updated[index].externalItemName = "";
      updated[index].externalSku = "";
      updated[index].quantity = "";
    }

    if (field === "stockinId" && value && !updated[index].isExternal) {
      const stock = getStockInfo(value);
      if (stock && !updated[index].quantity) {
        updated[index].quantity = calculateSuggestedQuantity(stock.receivedQuantity).toString();
      }
    }

    setFormData(prev => ({ ...prev, salesEntries: updated }));

    const touchedEntries = [...touched.salesEntries];
    touchedEntries[index] = true;
    setTouched(prev => ({ ...prev, salesEntries: touchedEntries }));

    const errors = [...validationErrors.salesEntries];
    if (!errors[index]) {
      errors[index] = { stockinId: "", quantity: "", soldPrice: "", externalItemName: "" };
    }

    const entry = updated[index];
    if (field === "stockinId" || field === "externalItemName" || field === "isExternal") {
      if (entry.isExternal) {
        errors[index].externalItemName = entry.externalItemName?.trim() ? "" : "Required";
        errors[index].stockinId = "";
      } else {
        errors[index].stockinId = validateStockInId(entry.stockinId);
        errors[index].externalItemName = "";
      }
      if (entry.quantity) errors[index].quantity = validateQuantity(entry.quantity, entry.isExternal ? undefined : entry.stockinId);
      if (entry.soldPrice) errors[index].soldPrice = entry.isExternal
        ? (entry.soldPrice ? validateSoldPrice(entry.soldPrice) : "Price is required")
        : validateSoldPrice(entry.soldPrice);
    } else if (field === "quantity") {
      errors[index].quantity = validateQuantity(String(value), entry.isExternal ? undefined : entry.stockinId);
    } else if (field === "soldPrice") {
      if (entry.isExternal && !value) {
        errors[index].soldPrice = "Price is required";
      } else {
        errors[index].soldPrice = validateSoldPrice(String(value));
      }
    }

    setValidationErrors(prev => ({ ...prev, salesEntries: errors }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowWarnings(true);

    if (isUpdateMode) {
      const errors = {
        stockinId: validateStockInId(formData.stockinId),
        quantity: validateQuantity(formData.quantity, formData.stockinId),
        soldPrice: validateSoldPrice(formData.soldPrice),
        clientName: validateClientName(formData.clientName),
        clientEmail: validateEmail(formData.clientEmail),
        clientPhone: validatePhone(formData.clientPhone),
        paymentMethod: validatePaymentMethod(formData.paymentMethod),
      };

      setValidationErrors(prev => ({ ...prev, ...errors }));
      setTouched({
        stockinId: true,
        externalItemName: true,
        quantity: true,
        soldPrice: true,
        clientEmail: true,
        clientPhone: true,
        salesEntries: [],
      });

      if (Object.values(errors).some(e => e !== "")) return;

      const submitData = {
        stockinId: Number(formData.stockinId),
        quantity: Number(formData.quantity),
        soldPrice: formData.soldPrice ? Number(formData.soldPrice) : undefined,
        clientName: formData.clientName.trim() || undefined,
        clientEmail: formData.clientEmail.trim() || undefined,
        clientPhone: formData.clientPhone.trim() || undefined,
        paymentMethod: formData.paymentMethod || undefined,
      };
      onSubmit(submitData);
    } else {
      const clientErrors = {
        clientName: validateClientName(formData.clientName),
        clientEmail: validateEmail(formData.clientEmail),
        clientPhone: validatePhone(formData.clientPhone),
        paymentMethod: validatePaymentMethod(formData.paymentMethod),
      };

      const salesErrors = formData.salesEntries.map(entry => ({
        stockinId: entry.isExternal ? "" : validateStockInId(entry.stockinId),
        quantity: validateQuantity(entry.quantity, entry.isExternal ? undefined : entry.stockinId),
        soldPrice: entry.isExternal && !entry.soldPrice ? "Price is required" : validateSoldPrice(entry.soldPrice),
        externalItemName: entry.isExternal && !entry.externalItemName?.trim() ? "Required" : "",
      }));

      setValidationErrors(prev => ({
        ...prev,
        ...clientErrors,
        salesEntries: salesErrors,
      }));

      setTouched({
        stockinId: false,
        externalItemName: false,
        quantity: false,
        soldPrice: false,
        clientEmail: true,
        clientPhone: true,
        salesEntries: formData.salesEntries.map(() => true),
      });

      const hasErrors =
        Object.values(clientErrors).some(e => e !== "") ||
        salesErrors.some(e => Object.values(e).some(err => err !== ""));

      if (hasErrors) return;

      const nonExternalIds = formData.salesEntries.filter(e => !e.isExternal).map(e => e.stockinId);
      if (new Set(nonExternalIds).size !== nonExternalIds.length) {
        alert("Cannot add the same stock item multiple times");
        return;
      }

      const submitData = {
        salesArray: formData.salesEntries.map(e => ({
          stockinId: e.isExternal ? undefined : Number(e.stockinId),
          externalItemName: e.isExternal ? e.externalItemName : undefined,
          externalSku: e.isExternal ? e.externalSku : undefined,
          quantity: Number(e.quantity),
          soldPrice: e.soldPrice ? Number(e.soldPrice) : undefined,
        })),
        clientInfo: {
          clientName: formData.clientName.trim() || undefined,
          clientEmail: formData.clientEmail.trim() || undefined,
          clientPhone: formData.clientPhone.trim() || undefined,
          paymentMethod: formData.paymentMethod || undefined,
        },
      };
      onSubmit(submitData);
    }

    onClose();
  };

  const isFormValid = (): boolean => {
    if (isUpdateMode) {
      return (
        formData.stockinId !== "" &&
        formData.quantity !== "" &&
        !validationErrors.stockinId &&
        !validationErrors.quantity &&
        !validationErrors.soldPrice
      );
    }

    return (
      formData.salesEntries.every(e => {
        if (e.isExternal) {
          return !!e.externalItemName && !!e.quantity && !!e.soldPrice;
        }
        return !!e.stockinId && !!e.quantity;
      }) &&
      validationErrors.salesEntries.every(e => !e?.stockinId && !e?.quantity && !e?.soldPrice && !e?.externalItemName) &&
      !validationErrors.clientName &&
      !validationErrors.clientEmail &&
      !validationErrors.clientPhone &&
      !validationErrors.paymentMethod
    );
  };

  const calculateTotal = () => {
    return formData.salesEntries
      .filter(e => e.soldPrice && e.quantity)
      .reduce((sum, e) => sum + (Number(e.soldPrice) * Number(e.quantity)), 0);
  };

  const calculateTotalQuantity = () => {
    return formData.salesEntries
      .filter(e => e.quantity)
      .reduce((sum, e) => sum + Number(e.quantity), 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto p-4">
      <div className="bg-theme-bg-primary rounded-xl w-full max-w-4xl my-auto max-h-[90vh] flex flex-col shadow-lg border border-theme-border">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4 rounded-t-xl flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">{title}</h1>
            <p className="text-primary-100 text-xs mt-0.5">Record a new sales transaction</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Update Mode: Single Entry */}
            {isUpdateMode ? (
              <div className="bg-theme-bg-primary rounded-lg border border-theme-border">
                <div className="p-4 border-b border-theme-border">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary-500/10 rounded-lg">
                      <Package className="h-4 w-4 text-primary-600" />
                    </div>
                    <h2 className="text-sm font-semibold text-theme-text-primary">Sale Details</h2>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* External Toggle */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isExternal: false, externalItemName: "", externalSku: "" }))}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        !formData.isExternal
                          ? 'bg-primary-500/10 text-primary-600 border border-primary-500/20'
                          : 'bg-theme-bg-primary text-theme-text-secondary border border-theme-border hover:bg-theme-bg-tertiary'
                      }`}
                    >
                      From Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isExternal: true, stockinId: "" }))}
                      className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
                        formData.isExternal
                          ? 'bg-primary-500/10 text-primary-600 border border-primary-500/20'
                          : 'bg-theme-bg-primary text-theme-text-secondary border border-theme-border hover:bg-theme-bg-tertiary'
                      }`}
                    >
                      <Plus className="h-3 w-3" />
                      External Item
                    </button>
                  </div>

                  {!formData.isExternal ? (
                    <div>
                      <label className="block text-xs font-medium text-theme-text-secondary mb-1.5">
                        Stock Item <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        options={stockIns.map(s => ({
                          value: s.id.toString(),
                          label: s.itemName,
                          subLabel: `SKU: ${s.sku} • Available: ${s.receivedQuantity}`
                        }))}
                        value={formData.stockinId}
                        onChange={(val) => {
                          setFormData(prev => ({ ...prev, stockinId: val }));
                          setTouched(prev => ({ ...prev, stockinId: true }));
                          setValidationErrors(prev => ({ ...prev, stockinId: validateStockInId(val) }));
                        }}
                        placeholder="Select stock item"
                        error={touched.stockinId ? validationErrors.stockinId : ""}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-theme-text-secondary mb-1.5">
                          Item Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.externalItemName}
                          onChange={e => {
                            setFormData(prev => ({ ...prev, externalItemName: e.target.value }));
                            setTouched(prev => ({ ...prev, externalItemName: true }));
                            setValidationErrors(prev => ({
                              ...prev,
                              externalItemName: e.target.value.trim() ? "" : "Item name is required",
                            }));
                          }}
                          className={`w-full px-3 py-2.5 text-xs border rounded-lg bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            touched.externalItemName && validationErrors.externalItemName ? 'border-red-300' : 'border-theme-border'
                          }`}
                          placeholder="Enter item name"
                        />
                        {touched.externalItemName && validationErrors.externalItemName && (
                          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {validationErrors.externalItemName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-theme-text-secondary mb-1.5">SKU (Optional)</label>
                        <input
                          type="text"
                          value={formData.externalSku}
                          onChange={e => setFormData(prev => ({ ...prev, externalSku: e.target.value }))}
                          className="w-full px-3 py-2.5 text-xs border border-theme-border rounded-lg bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter SKU"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-theme-text-secondary mb-1.5">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={e => {
                          setFormData(prev => ({ ...prev, quantity: e.target.value }));
                          setTouched(prev => ({ ...prev, quantity: true }));
                          setValidationErrors(prev => ({
                            ...prev,
                            quantity: validateQuantity(e.target.value, formData.isExternal ? undefined : formData.stockinId),
                          }));
                        }}
                        className={`w-full px-3 py-2.5 text-xs border rounded-lg bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          touched.quantity && validationErrors.quantity ? 'border-red-300' : 'border-theme-border'
                        }`}
                        placeholder="e.g., 10"
                      />
                      {touched.quantity && validationErrors.quantity && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {validationErrors.quantity}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-theme-text-secondary mb-1.5">
                        Selling Price (RWF) {formData.isExternal && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.soldPrice}
                        onChange={e => {
                          setFormData(prev => ({ ...prev, soldPrice: e.target.value }));
                          setTouched(prev => ({ ...prev, soldPrice: true }));
                          setValidationErrors(prev => ({
                            ...prev,
                            soldPrice: formData.isExternal && !e.target.value ? "Price is required" : validateSoldPrice(e.target.value),
                          }));
                        }}
                        placeholder={formData.isExternal ? "Required" : "Optional"}
                        className={`w-full px-3 py-2.5 text-xs border rounded-lg bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          touched.soldPrice && validationErrors.soldPrice ? 'border-red-300' : 'border-theme-border'
                        }`}
                      />
                      {touched.soldPrice && validationErrors.soldPrice && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <X className="h-3 w-3" />
                          {validationErrors.soldPrice}
                        </p>
                      )}
                      {showWarnings && !formData.isExternal && formData.soldPrice && !validationErrors.soldPrice &&
                        isSellingBelowCost(formData.soldPrice, formData.stockinId) && (
                          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Warning: Below unit cost
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Create Mode: Multiple Entries */
              <div className="bg-theme-bg-primary rounded-lg border border-theme-border">
                <div className="p-4 border-b border-theme-border">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary-500/10 rounded-lg">
                      <ShoppingCart className="h-4 w-4 text-primary-600" />
                    </div>
                    <h2 className="text-sm font-semibold text-theme-text-primary">Sale Items</h2>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {formData.salesEntries.map((entry, i) => {
                    const stock = getStockInfo(entry.stockinId);
                    const entryErrors = validationErrors.salesEntries[i] || { stockinId: "", quantity: "", soldPrice: "", externalItemName: "" };
                    const isTouched = touched.salesEntries[i];

                    return (
                      <div key={i} className="bg-theme-bg-secondary rounded-lg p-4 border border-theme-border">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-theme-text-secondary">Item {i + 1}</span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleSalesEntryChange(i, "isExternal", false)}
                                className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${
                                  !entry.isExternal
                                    ? 'bg-primary-500/10 text-primary-600'
                                    : 'text-theme-text-secondary hover:bg-theme-bg-tertiary'
                                }`}
                              >
                                Stock
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSalesEntryChange(i, "isExternal", true)}
                                className={`px-2 py-1 text-[10px] font-medium rounded transition-colors ${
                                  entry.isExternal
                                    ? 'bg-primary-500/10 text-primary-600'
                                    : 'text-theme-text-secondary hover:bg-theme-bg-tertiary'
                                }`}
                              >
                                External
                              </button>
                            </div>
                          </div>
                          {formData.salesEntries.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSalesEntry(i)}
                              className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="md:col-span-2">
                            {!entry.isExternal ? (
                              <div>
                                <label className="block text-xs font-medium text-theme-text-secondary mb-1.5">
                                  Stock Item <span className="text-red-500">*</span>
                                </label>
                                <SearchableSelect
                                  options={stockIns.map(s => ({
                                    value: s.id.toString(),
                                    label: s.itemName,
                                    subLabel: `SKU: ${s.sku} • Avail: ${s.receivedQuantity}`
                                  }))}
                                  value={entry.stockinId}
                                  onChange={(val) => handleSalesEntryChange(i, "stockinId", val)}
                                  placeholder="Select stock item"
                                  error={isTouched ? entryErrors.stockinId : ""}
                                />
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs font-medium text-theme-text-secondary mb-1.5">
                                    Item Name <span className="text-red-500">*</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={entry.externalItemName || ""}
                                    onChange={e => handleSalesEntryChange(i, "externalItemName", e.target.value)}
                                    className={`w-full px-3 py-2.5 text-xs border rounded-lg bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                      isTouched && entryErrors.externalItemName ? 'border-red-300' : 'border-theme-border'
                                    }`}
                                    placeholder="Item name"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-theme-text-secondary mb-1.5">SKU</label>
                                  <input
                                    type="text"
                                    value={entry.externalSku || ""}
                                    onChange={e => handleSalesEntryChange(i, "externalSku", e.target.value)}
                                    className="w-full px-3 py-2.5 text-xs border border-theme-border rounded-lg bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="SKU"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-theme-text-secondary mb-1.5">
                              Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={entry.quantity}
                              onChange={e => handleSalesEntryChange(i, "quantity", e.target.value)}
                              className={`w-full px-3 py-2.5 text-xs border rounded-lg bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                isTouched && entryErrors.quantity ? 'border-red-300' : 'border-theme-border'
                              }`}
                              placeholder="Qty"
                            />
                            {isTouched && entryErrors.quantity && (
                              <p className="text-[10px] text-red-600 mt-0.5">{entryErrors.quantity}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-theme-text-secondary mb-1.5">
                              Price (RWF) {entry.isExternal && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={entry.soldPrice}
                              onChange={e => handleSalesEntryChange(i, "soldPrice", e.target.value)}
                              placeholder={entry.isExternal ? "Required" : "Optional"}
                              className={`w-full px-3 py-2.5 text-xs border rounded-lg bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                isTouched && entryErrors.soldPrice ? 'border-red-300' : 'border-theme-border'
                              }`}
                            />
                            {isTouched && entryErrors.soldPrice && (
                              <p className="text-[10px] text-red-600 mt-0.5">{entryErrors.soldPrice}</p>
                            )}
                            {showWarnings && !entry.isExternal && entry.soldPrice && !entryErrors.soldPrice &&
                              isSellingBelowCost(entry.soldPrice, entry.stockinId) && (
                                <p className="text-[10px] text-amber-600 mt-0.5">Below cost</p>
                              )}
                          </div>
                        </div>

                        {!entry.isExternal && stock && (
                          <div className="mt-3 pt-3 border-t border-theme-border">
                            <div className="flex gap-4 text-[10px] text-theme-text-secondary">
                              <span>Available: <span className="text-primary-600 font-medium">{stock.receivedQuantity}</span></span>
                              <span>Location: <span className="text-theme-text-primary">{stock.warehouseLocation}</span></span>
                              {stock.unitCost && <span>Cost: <span className="text-green-600">{stock.unitCost} RWF</span></span>}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={addSalesEntry}
                    className="w-full py-3 border border-dashed border-theme-border text-theme-text-secondary hover:text-primary-600 hover:border-primary-500/50 hover:bg-primary-500/5 rounded-lg transition-colors text-xs font-medium flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    Add Another Item
                  </button>
                </div>
              </div>
            )}

            {/* Client Information */}
            <div className="bg-theme-bg-primary rounded-lg border border-theme-border">
              <div className="p-4 border-b border-theme-border">
                <h2 className="text-sm font-semibold text-theme-text-primary">Client Information (Optional)</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-theme-text-secondary mb-1.5">Client Name</label>
                    <input
                      type="text"
                      placeholder="Enter name"
                      value={formData.clientName}
                      onChange={e => {
                        setFormData(prev => ({ ...prev, clientName: e.target.value }));
                        setValidationErrors(prev => ({ ...prev, clientName: validateClientName(e.target.value) }));
                      }}
                      className={`w-full px-3 py-2.5 text-xs border rounded-lg bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        validationErrors.clientName ? 'border-red-300' : 'border-theme-border'
                      }`}
                      maxLength={255}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-theme-text-secondary mb-1.5">Email</label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={formData.clientEmail}
                      onChange={e => {
                        setFormData(prev => ({ ...prev, clientEmail: e.target.value }));
                        setTouched(prev => ({ ...prev, clientEmail: true }));
                        setValidationErrors(prev => ({ ...prev, clientEmail: validateEmail(e.target.value) }));
                      }}
                      className={`w-full px-3 py-2.5 text-xs border rounded-lg bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        touched.clientEmail && validationErrors.clientEmail ? 'border-red-300' : 'border-theme-border'
                      }`}
                      maxLength={255}
                    />
                    {touched.clientEmail && validationErrors.clientEmail && (
                      <p className="text-xs text-red-600 mt-1">{validationErrors.clientEmail}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-theme-text-secondary mb-1.5">Phone</label>
                    <input
                      type="tel"
                      placeholder="+250 xxx xxx xxx"
                      value={formData.clientPhone}
                      onChange={e => {
                        setFormData(prev => ({ ...prev, clientPhone: e.target.value }));
                        setTouched(prev => ({ ...prev, clientPhone: true }));
                        setValidationErrors(prev => ({ ...prev, clientPhone: validatePhone(e.target.value) }));
                      }}
                      className={`w-full px-3 py-2.5 text-xs border rounded-lg bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        touched.clientPhone && validationErrors.clientPhone ? 'border-red-300' : 'border-theme-border'
                      }`}
                    />
                    {touched.clientPhone && validationErrors.clientPhone && (
                      <p className="text-xs text-red-600 mt-1">{validationErrors.clientPhone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-theme-text-secondary mb-1.5">Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={e => {
                        setFormData(prev => ({ ...prev, paymentMethod: e.target.value as PaymentMethod | "" }));
                        setValidationErrors(prev => ({ ...prev, paymentMethod: validatePaymentMethod(e.target.value) }));
                      }}
                      className={`w-full px-3 py-2.5 text-xs border rounded-lg bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        validationErrors.paymentMethod ? 'border-red-300' : 'border-theme-border'
                      }`}
                    >
                      <option value="">Select method</option>
                      <option value="CASH">Cash</option>
                      <option value="MOMO">Mobile Money</option>
                      <option value="CARD">Card</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Summary - Total Value Box */}
            {!isUpdateMode && formData.salesEntries.some(e => (e.stockinId || e.externalItemName) && e.quantity) && (
              <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-primary-600">Total Items</span>
                  <span className="text-sm font-bold text-primary-700">{formData.salesEntries.filter(e => e.stockinId || e.externalItemName).length}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-primary-600">Total Quantity</span>
                  <span className="text-sm font-bold text-primary-700">{calculateTotalQuantity()} units</span>
                </div>
                {formData.salesEntries.some(e => e.soldPrice) && (
                  <div className="flex justify-between items-center pt-2 border-t border-primary-500/20">
                    <span className="text-sm font-medium text-primary-600">Grand Total</span>
                    <span className="text-lg font-bold text-primary-700">RWF {calculateTotal().toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Help Section */}
            <div className="p-4 bg-theme-bg-tertiary rounded-lg border border-theme-border">
              <h4 className="text-xs font-semibold text-theme-text-primary mb-2 flex items-center gap-2">
                <AlertCircle size={14} className="text-primary-600" />
                Quick Tips
              </h4>
              <ul className="text-[10px] text-theme-text-secondary space-y-1.5">
                <li>• Select stock items for automatic inventory reduction</li>
                <li>• Use external items for products not in your inventory</li>
                <li>• Warnings will appear if selling below cost price</li>
              </ul>
            </div>
          </div>

          {/* Action Footer */}
          <div className="px-6 py-4 bg-theme-bg-tertiary border-t border-theme-border rounded-b-xl">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-medium text-theme-text-secondary hover:text-theme-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !isFormValid()}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-medium bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {isUpdateMode ? "Save Changes" : "Complete Sale"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpsertStockOutModal;

import React, { useEffect, useState } from "react";
import { X, AlertCircle, Plus } from "lucide-react";

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

const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select item...",
  className = "",
  error = ""
}: {
  options: { value: string; label: string; subLabel?: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const selectedOption = options.find(o => o.value === value);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.subLabel && option.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        className={`w-full px-4 py-2.5 border rounded-xl flex justify-between items-center cursor-pointer bg-theme-bg-primary transition-all ${error ? "border-red-500 bg-red-500/5" : "border-theme-border"
          } ${isOpen ? "ring-2 ring-primary-500/20 border-primary-500" : "hover:border-theme-border"}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`block truncate ${!selectedOption ? "text-theme-text-secondary" : "text-theme-text-primary"}`}>
          {selectedOption ? (
            <span className="flex flex-col text-left">
              <span className="font-black text-[11px] uppercase tracking-tighter">{selectedOption.label}</span>
              {selectedOption.subLabel && <span className="text-theme-text-secondary text-[9px] font-bold uppercase tracking-widest">{selectedOption.subLabel}</span>}
            </span>
          ) : (
            <span className="text-[10px] font-black uppercase tracking-widest">{placeholder}</span>
          )}
        </span>
        <svg className="w-4 h-4 text-theme-text-secondary flex-shrink-0 ml-1 transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-theme-bg-primary border border-theme-border rounded-xl shadow-2xl max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="p-3 border-b border-theme-border bg-theme-bg-tertiary sticky top-0">
            <input
              ref={searchInputRef}
              type="text"
              className="w-full px-3 py-2 text-[10px] font-black uppercase tracking-widest border border-theme-border rounded-lg bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-theme-text-secondary/50"
              placeholder="Type to search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`px-4 py-3 cursor-pointer hover:bg-theme-bg-tertiary transition-colors border-b border-theme-border last:border-0 ${option.value === value ? "bg-primary-500/10 text-primary-500" : "text-theme-text-primary"
                    }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <div className="font-black text-[11px] uppercase tracking-tighter">{option.label}</div>
                  {option.subLabel && <div className="text-[9px] font-bold text-theme-text-secondary uppercase tracking-widest mt-0.5">{option.subLabel}</div>}
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-[10px] font-black text-theme-text-secondary uppercase tracking-widest text-center">No results found</div>
            )}
          </div>
        </div>
      )}
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle size={12} />
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
    salesEntries: [{ stockinId: "", quantity: "", soldPrice: "" }] as SalesEntry[],
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
        isExternal: false, // Default for update mode, or derived if we had field
        externalItemName: "",
        externalSku: "",
        salesEntries: [], // Update mode specific logic might populate this if we fetched items
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
        salesEntries: [{ stockinId: "", quantity: "", soldPrice: "", isExternal: false }],
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

    // Check against receivedQuantity from stock
    if (stockinId) {
      const stock = stockIns.find(s => s.id === Number(stockinId));
      if (stock) {
        if (num > stock.receivedQuantity) {
          return `Exceeds available stock. Only ${stock.receivedQuantity} unit(s) available`;
        }
      }
    }
    return "";
  };

  const validateSoldPrice = (price: string, stockinId?: string): string => {
    if (!price) return ""; // Optional field

    const num = Number(price);
    if (isNaN(num)) return "Price must be a valid number";
    if (num < 0) return "Price cannot be negative";
    if (num > 999999999) return "Price is too large";

    // Check decimal places
    const decimalPlaces = (price.split('.')[1] || '').length;
    if (decimalPlaces > 2) return "Price can have maximum 2 decimal places";

    return "";
  };

  const validateEmail = (email: string): string => {
    if (!email) return ""; // Optional field

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return "Invalid email format";

    if (email.length > 255) return "Email is too long";

    return "";
  };

  const validatePhone = (phone: string): string => {
    if (!phone) return ""; // Optional field

    const cleaned = phone.replace(/[\s\-\(\)]/g, '');

    if (!/^\+?\d+$/.test(cleaned)) return "Phone number can only contain digits and optional +";

    if (cleaned.length < 9) return "Phone number is too short";
    if (cleaned.length > 15) return "Phone number is too long";

    return "";
  };

  const validateClientName = (name: string): string => {
    if (!name) return ""; // Optional field

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

  // Check if selling below cost (warning, not error)
  const isSellingBelowCost = (price: string, stockinId: string): boolean => {
    if (!price || !stockinId) return false;
    const stock = stockIns.find(s => s.id === Number(stockinId));
    if (!stock || !stock.unitCost) return false;
    return Number(price) < Number(stock.unitCost);
  };

  const calculateSuggestedQuantity = (available: number): number => {
    return available > 0 ? Math.max(1, Math.floor(available / 2)) : 1;
  };



  const getStockInfo = (id: string): StockIn | undefined => {
    return stockIns.find(s => s.id === Number(id));
  };

  const addSalesEntry = () => {
    setFormData(prev => ({
      ...prev,
      salesEntries: [...prev.salesEntries, { stockinId: "", quantity: "", soldPrice: "", isExternal: false, externalItemName: "", externalSku: "" }],
    }));
    setValidationErrors(prev => ({
      ...prev,
      salesEntries: [...prev.salesEntries, { stockinId: "", quantity: "", soldPrice: "", externalItemName: "" }],
    }));
    setTouched(prev => ({
      ...prev,
      salesEntries: [...prev.salesEntries, false],
    }));
  };

  const removeSalesEntry = (index: number) => {
    if (formData.salesEntries.length <= 1) return;

    setFormData(prev => ({
      ...prev,
      salesEntries: prev.salesEntries.filter((_, i) => i !== index),
    }));
    setValidationErrors(prev => ({
      ...prev,
      salesEntries: prev.salesEntries.filter((_, i) => i !== index),
    }));
    setTouched(prev => ({
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
    // @ts-ignore
    updated[index][field] = value;

    // Reset certain fields if toggling type
    if (field === "isExternal") {
      updated[index].stockinId = "";
      updated[index].externalItemName = "";
      updated[index].externalSku = "";
      updated[index].quantity = "";
    }

    if (field === "stockinId" && value && !updated[index].isExternal) {
      const stock = getStockInfo(value);
      if (stock) {
        if (!updated[index].quantity) {
          updated[index].quantity = calculateSuggestedQuantity(stock.receivedQuantity).toString();
        }
      }
    }

    setFormData(prev => ({ ...prev, salesEntries: updated }));

    // Mark as touched
    const touchedEntries = [...touched.salesEntries];
    touchedEntries[index] = true;
    setTouched(prev => ({ ...prev, salesEntries: touchedEntries }));

    // Validate
    const errors = [...validationErrors.salesEntries];
    if (!errors[index]) {
      errors[index] = { stockinId: "", quantity: "", soldPrice: "" };
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
        : validateSoldPrice(entry.soldPrice, entry.stockinId);

    } else if (field === "quantity") {
      errors[index].quantity = validateQuantity(String(value), entry.isExternal ? undefined : entry.stockinId);
    } else if (field === "soldPrice") {
      if (entry.isExternal && !value) {
        errors[index].soldPrice = "Price is required";
      } else {
        errors[index].soldPrice = validateSoldPrice(String(value), entry.isExternal ? undefined : entry.stockinId);
      }
    }

    setValidationErrors(prev => ({ ...prev, salesEntries: errors }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowWarnings(true);

    if (isUpdateMode) {
      // Validate all fields
      const errors = {
        stockinId: validateStockInId(formData.stockinId),
        quantity: validateQuantity(formData.quantity, formData.stockinId),
        soldPrice: validateSoldPrice(formData.soldPrice, formData.stockinId),
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

      // For UPDATE mode (around line 340):
      const submitData = {
        stockinId: Number(formData.stockinId),
        quantity: Number(formData.quantity),
        soldPrice: formData.soldPrice ? Number(formData.soldPrice) : undefined,
        clientName: formData.clientName.trim() || undefined,
        clientEmail: formData.clientEmail.trim() || undefined,
        clientPhone: formData.clientPhone.trim() || undefined,
        paymentMethod: formData.paymentMethod || undefined,
      };
      console.log('UPDATE MODE - Submitting:', submitData);
      onSubmit(submitData);
    } else {
      // Create mode - validate all entries
      const clientErrors = {
        clientName: validateClientName(formData.clientName),
        clientEmail: validateEmail(formData.clientEmail),
        clientPhone: validatePhone(formData.clientPhone),
        paymentMethod: validatePaymentMethod(formData.paymentMethod),
      };

      const salesErrors = formData.salesEntries.map(entry => ({
        stockinId: validateStockInId(entry.stockinId),
        quantity: validateQuantity(entry.quantity, entry.stockinId),
        soldPrice: validateSoldPrice(entry.soldPrice, entry.stockinId),
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

      // Check for duplicate stock items
      const ids = formData.salesEntries.map(e => e.stockinId);
      if (new Set(ids).size !== ids.length) {
        alert("Cannot add the same stock item multiple times");
        return;
      }

      // For CREATE mode (around line 370):
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
      console.log('CREATE MODE - Submitting:', submitData);
      onSubmit(submitData);
    }

    onClose();
  };

  const isFormValid = (): boolean => {
    if (isUpdateMode) {
      // ... update mode logic (simplification: we are focusing on create mode for hybrid, but let's keep update mode safe)
      if (formData.salesEntries.length === 0) {
        // Fallback for single item update mode which uses top level fields
        // Actually update mode uses top level fields in this component currently
        return (
          formData.stockinId !== "" &&
          formData.quantity !== "" &&
          !validationErrors.stockinId &&
          !validationErrors.quantity &&
          !validationErrors.soldPrice
        );
      }
      return true;
    }

    // Create Mode
    return (
      formData.salesEntries.every(e => {
        if (e.isExternal) {
          return !!e.externalItemName && !!e.quantity && !!e.soldPrice;
        }
        return !!e.stockinId && !!e.quantity;
      }) &&
      validationErrors.salesEntries.every(e => !e.stockinId && !e.quantity && !e.soldPrice && !e.externalItemName) &&
      !validationErrors.clientName &&
      !validationErrors.clientEmail &&
      !validationErrors.clientPhone &&
      !validationErrors.paymentMethod
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm overflow-y-auto p-4 sm:p-12">
      <div className="bg-theme-bg-primary rounded-3xl w-full max-w-6xl my-auto max-h-[94vh] flex flex-col shadow-2xl border border-theme-border animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-center px-10 py-8 border-b border-theme-border">
          <div>
            <h2 className="text-2xl font-black text-theme-text-primary uppercase tracking-tighter">{title}</h2>
            <p className="text-[10px] font-bold text-theme-text-secondary uppercase tracking-widest mt-1">Record a new sales transaction in the system</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-theme-bg-tertiary rounded-2xl transition-all text-theme-text-secondary hover:text-red-500 hover:rotate-90"
            type="button"
          >
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-10 space-y-10">
            {/* Update Mode: Single Entry */}
            {isUpdateMode ? (
              <div className="space-y-8">
                <div className="flex items-center gap-4 p-5 bg-theme-bg-primary border border-theme-border rounded-2xl">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      id="isExternal"
                      checked={formData.isExternal}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          isExternal: e.target.checked,
                          stockinId: "", // Reset stock selection
                          externalItemName: "",
                          externalSku: ""
                        }));
                        setValidationErrors(prev => ({ ...prev, stockinId: "", externalItemName: "" }));
                      }}
                      className="h-6 w-6 rounded-xl border-theme-border bg-theme-bg-primary text-primary-500 focus:ring-primary-500/20 transition-all cursor-pointer"
                    />
                  </div>
                  <label htmlFor="isExternal" className="text-xs font-black text-theme-text-primary uppercase tracking-widest cursor-pointer">
                    Non-Stock Item (External Sale)
                  </label>
                </div>

                {!formData.isExternal ? (
                  <div>
                    <label className="block text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mb-1.5">
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
                        setValidationErrors(prev => ({
                          ...prev,
                          stockinId: validateStockInId(val),
                        }));
                      }}
                      placeholder="Select stock item"
                      error={touched.stockinId && validationErrors.stockinId ? validationErrors.stockinId : ""}
                    />
                  </div>
                ) : (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mb-1.5">
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
                          className={`w-full px-4 py-2.5 text-[11px] font-black border rounded-xl bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-theme-text-secondary/50 ${touched.externalItemName && validationErrors.externalItemName
                            ? "border-red-500 bg-red-500/5"
                            : "border-theme-border"
                            }`}
                          placeholder="Enter item name..."
                        />
                        {touched.externalItemName && validationErrors.externalItemName && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={12} />
                            {validationErrors.externalItemName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mb-1.5">
                          SKU (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.externalSku}
                          onChange={e => setFormData(prev => ({ ...prev, externalSku: e.target.value }))}
                          className="w-full px-4 py-2.5 text-[11px] font-black border border-theme-border rounded-xl bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-theme-text-secondary/50"
                          placeholder="Enter SKU..."
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mb-1.5">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={e => {
                        setFormData(prev => ({ ...prev, quantity: e.target.value }));
                        setTouched(prev => ({ ...prev, quantity: true }));
                        const qtyError = (!e.target.value || Number(e.target.value) <= 0)
                          ? "Quantity must be > 0"
                          : (!formData.isExternal && formData.stockinId
                            ? validateQuantity(e.target.value, formData.stockinId)
                            : "");
                        setValidationErrors(prev => ({ ...prev, quantity: qtyError }));
                      }}
                      onBlur={() => setTouched(prev => ({ ...prev, quantity: true }))}
                      className={`w-full px-4 py-2.5 text-[11px] font-black border rounded-xl bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-theme-text-secondary/50 ${touched.quantity && validationErrors.quantity
                        ? "border-red-500 bg-red-500/5"
                        : "border-theme-border"
                        }`}
                    />
                    {touched.quantity && validationErrors.quantity && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {validationErrors.quantity}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mb-1.5">
                      Selling Price (RWF) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.soldPrice}
                      onChange={e => {
                        setFormData(prev => ({ ...prev, soldPrice: e.target.value }));
                        setTouched(prev => ({ ...prev, soldPrice: true }));
                        const priceError = (!e.target.value && formData.isExternal) ? "Price is required for non-stock items" : "";
                        setValidationErrors(prev => ({
                          ...prev,
                          soldPrice: priceError || validateSoldPrice(e.target.value, formData.stockinId),
                        }));
                      }}
                      onBlur={() => setTouched(prev => ({ ...prev, soldPrice: true }))}
                      placeholder={formData.isExternal ? "Required" : "Optional"}
                      className={`w-full px-4 py-2.5 text-[11px] font-black border rounded-xl bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-theme-text-secondary/50 ${touched.soldPrice && validationErrors.soldPrice
                        ? "border-red-500 bg-red-500/5"
                        : "border-theme-border"
                        }`}
                    />
                    {touched.soldPrice && validationErrors.soldPrice && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {validationErrors.soldPrice}
                      </p>
                    )}
                    {showWarnings &&
                      !formData.isExternal &&
                      formData.soldPrice &&
                      !validationErrors.soldPrice &&
                      isSellingBelowCost(formData.soldPrice, formData.stockinId) && (
                        <p className="text-amber-600 text-[10px] font-bold uppercase mt-1.5 flex items-center gap-1">
                          <AlertCircle size={14} className="text-amber-500" />
                          Warning: Selling below unit cost
                        </p>
                      )}
                  </div>
                </div>
              </div>
            ) : (
              /* Create Mode: Multiple Entries */
              <div className="bg-theme-bg-primary border border-theme-border rounded-3xl p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-black text-theme-text-primary uppercase tracking-widest">Sale Items</h3>
                </div>

                {formData.salesEntries.map((entry, i) => {
                  const stock = getStockInfo(entry.stockinId);
                  const entryErrors = validationErrors.salesEntries[i] || { stockinId: "", quantity: "", soldPrice: "", externalItemName: "" };
                  const isTouched = touched.salesEntries[i];

                  return (
                    <div key={i} className="bg-theme-bg-primary border border-theme-border rounded-3xl p-8 mb-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-300 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl rounded-full" />
                      <div className="flex justify-between items-center mb-8 relative z-10">
                        <div className="flex items-center gap-8">
                          <span className="text-xs font-black text-theme-text-secondary uppercase tracking-widest">Item {i + 1}</span>
                          {/* Per-row Toggle */}
                          <div className="flex items-center gap-3 px-4 py-2 bg-theme-bg-tertiary rounded-xl border border-theme-border">
                            <input
                              type="checkbox"
                              id={`isExternal-${i}`}
                              checked={entry.isExternal}
                              onChange={(e) => handleSalesEntryChange(i, "isExternal", e.target.checked)}
                              className="h-4 w-4 rounded border-theme-border bg-theme-bg-primary text-primary-500 focus:ring-primary-500/20 cursor-pointer"
                            />
                            <label htmlFor={`isExternal-${i}`} className="text-[10px] font-black text-theme-text-secondary uppercase tracking-widest cursor-pointer">
                              Non-Stock
                            </label>
                          </div>
                        </div>

                        {formData.salesEntries.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSalesEntry(i)}
                            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <X className="w-4 h-4" />
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Stock Selection OR External Item Name */}
                        <div className="md:col-span-2">
                          {!entry.isExternal ? (
                            <div>
                              <label className="block text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mb-1.5">
                                Stock Item <span className="text-red-500">*</span>
                              </label>

                              <SearchableSelect
                                options={stockIns.map(s => ({
                                  value: s.id.toString(),
                                  label: s.itemName,
                                  subLabel: `SKU: ${s.sku} • Available: ${s.receivedQuantity}`
                                }))}
                                value={entry.stockinId}
                                onChange={(val) => handleSalesEntryChange(i, "stockinId", val)}
                                placeholder="Select a stock-in entry"
                                error={isTouched && entryErrors.stockinId ? entryErrors.stockinId : ""}
                              />
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mb-1.5">
                                  Item Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={entry.externalItemName || ""}
                                  onChange={e => handleSalesEntryChange(i, "externalItemName", e.target.value)}
                                  className={`w-full px-4 py-2.5 text-[11px] font-black border rounded-xl bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-theme-text-secondary/50 ${isTouched && entryErrors.externalItemName
                                    ? "border-red-500 bg-red-500/5"
                                    : "border-theme-border"
                                    }`}
                                  placeholder="Enter item name..."
                                />
                                {isTouched && entryErrors.externalItemName && (
                                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    {entryErrors.externalItemName}
                                  </p>
                                )}
                              </div>
                              <div>
                                <label className="block text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mb-1.5">
                                  SKU (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={entry.externalSku || ""}
                                  onChange={e => handleSalesEntryChange(i, "externalSku", e.target.value)}
                                  className="w-full px-4 py-2.5 text-[11px] font-black border border-theme-border rounded-xl bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-theme-text-secondary/50"
                                  placeholder="Enter SKU..."
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Quantity */}
                        <div>
                          <label className="block text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mb-1.5">
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={entry.quantity}
                            onChange={e => handleSalesEntryChange(i, "quantity", e.target.value)}
                            className={`w-full px-4 py-2.5 text-[11px] font-black border rounded-xl bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-theme-text-secondary/50 ${isTouched && entryErrors.quantity ? "border-red-500 bg-red-500/5" : "border-theme-border"}`}
                          />
                          {isTouched && entryErrors.quantity && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle size={12} />
                              {entryErrors.quantity}
                            </p>
                          )}
                        </div>

                        {/* Selling Price */}
                        <div>
                          <label className="block text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mb-1.5">Price (RWF) {entry.isExternal && <span className="text-red-500">*</span>}</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={entry.soldPrice}
                            onChange={e => handleSalesEntryChange(i, "soldPrice", e.target.value)}
                            placeholder={entry.isExternal ? "Required" : "Optional"}
                            className={`w-full px-4 py-2.5 text-[11px] font-black border rounded-xl bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-theme-text-secondary/50 ${isTouched && entryErrors.soldPrice ? "border-red-500 bg-red-500/5" : "border-theme-border"}`}
                          />
                          {isTouched && entryErrors.soldPrice && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle size={12} />
                              {entryErrors.soldPrice}
                            </p>
                          )}
                          {showWarnings &&
                            entry.soldPrice &&
                            !entryErrors.soldPrice &&
                            isSellingBelowCost(entry.soldPrice, entry.stockinId) && (
                              <p className="text-amber-600 text-[9px] font-black uppercase mt-1.5 flex items-center gap-1">
                                <AlertCircle size={12} className="text-amber-500" />
                                Below cost
                              </p>
                            )}
                        </div>

                        {/* Stock Info (Only for internal) */}
                        {!entry.isExternal && (
                          <div className="md:col-span-1">
                            <label className="block text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mb-1.5">Stock Info</label>
                            {stock ? (
                              <div className="bg-theme-bg-tertiary p-3 rounded-xl border border-theme-border text-[9px] font-black uppercase tracking-widest space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-theme-text-secondary">Available:</span>
                                  <span className="text-primary-500">{stock.receivedQuantity}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-theme-text-secondary">Location:</span>
                                  <span className="text-theme-text-primary max-w-[80px] truncate text-right">{stock.warehouseLocation}</span>
                                </div>
                                {stock.unitCost && (
                                  <div className="flex justify-between border-t border-theme-border pt-1.5">
                                    <span className="text-theme-text-secondary">Cost:</span>
                                    <span className="text-green-500">{stock.unitCost} RWF</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="bg-theme-bg-tertiary p-4 rounded-xl border border-theme-border text-[9px] font-black text-theme-text-secondary uppercase tracking-widest text-center">
                                No item selected
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={addSalesEntry}
                  className="w-full py-6 border-2 border-dashed border-theme-border text-theme-text-secondary hover:text-primary-500 hover:border-primary-500/50 hover:bg-primary-500/5 rounded-3xl transition-all font-black text-xs uppercase tracking-widest mt-4 flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Add Another Item
                </button>
              </div>
            )}

            {/* Client Information */}
            <div className="border-t border-theme-border pt-12 mt-4">
              <h3 className="text-xl font-black text-theme-text-primary uppercase tracking-widest mb-8">Client Information (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mb-1.5">Client Name</label>
                  <input
                    type="text"
                    placeholder="Enter name..."
                    value={formData.clientName}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, clientName: e.target.value }));
                      setValidationErrors(prev => ({
                        ...prev,
                        clientName: validateClientName(e.target.value),
                      }));
                    }}
                    className={`w-full px-4 py-2.5 text-[11px] font-black border rounded-xl bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-theme-text-secondary/50 ${validationErrors.clientName ? "border-red-500 bg-red-500/5" : "border-theme-border"
                      }`}
                    maxLength={255}
                  />
                  {validationErrors.clientName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {validationErrors.clientName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.clientEmail}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, clientEmail: e.target.value }));
                      setTouched(prev => ({ ...prev, clientEmail: true }));
                      setValidationErrors(prev => ({
                        ...prev,
                        clientEmail: validateEmail(e.target.value),
                      }));
                    }}
                    onBlur={() => setTouched(prev => ({ ...prev, clientEmail: true }))}
                    className={`w-full px-4 py-2.5 text-[11px] font-black border rounded-xl bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-theme-text-secondary/50 ${touched.clientEmail && validationErrors.clientEmail
                      ? "border-red-500 bg-red-500/5"
                      : "border-theme-border"
                      }`}
                    maxLength={255}
                  />
                  {touched.clientEmail && validationErrors.clientEmail && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {validationErrors.clientEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mb-1.5">Phone</label>
                  <input
                    type="tel"
                    placeholder="+250 xxx xxx xxx"
                    value={formData.clientPhone}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, clientPhone: e.target.value }));
                      setTouched(prev => ({ ...prev, clientPhone: true }));
                      setValidationErrors(prev => ({
                        ...prev,
                        clientPhone: validatePhone(e.target.value),
                      }));
                    }}
                    onBlur={() => setTouched(prev => ({ ...prev, clientPhone: true }))}
                    className={`w-full px-4 py-2.5 text-[11px] font-black border rounded-xl bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-theme-text-secondary/50 ${touched.clientPhone && validationErrors.clientPhone
                      ? "border-red-500 bg-red-500/5"
                      : "border-theme-border"
                      }`}
                  />
                  {touched.clientPhone && validationErrors.clientPhone && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {validationErrors.clientPhone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mb-1.5">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        paymentMethod: e.target.value as PaymentMethod | ""
                      }));
                      setValidationErrors(prev => ({
                        ...prev,
                        paymentMethod: validatePaymentMethod(e.target.value),
                      }));
                    }}
                    className={`w-full px-4 py-2.5 text-[11px] font-black border rounded-xl bg-theme-bg-primary text-theme-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all ${validationErrors.paymentMethod ? "border-red-500 bg-red-500/5" : "border-theme-border"
                      }`}
                  >
                    <option value="">Select method...</option>
                    <option value="CASH">Cash</option>
                    <option value="MOMO">Mobile Money</option>
                    <option value="CARD">Card</option>
                  </select>
                  {validationErrors.paymentMethod && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {validationErrors.paymentMethod}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Transaction Summary */}
            {!isUpdateMode && formData.salesEntries.some(e => e.stockinId && e.quantity) && (
              <div className="border-t border-theme-border pt-12 mt-4">
                <h3 className="text-xl font-black text-theme-text-primary uppercase tracking-widest mb-8">Transaction Summary</h3>
                <div className="bg-theme-bg-primary rounded-3xl p-10 border border-theme-border space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-3xl rounded-full" />
                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-xs font-black text-theme-text-secondary uppercase tracking-widest">Total Unique Items</span>
                    <span className="text-lg font-black text-theme-text-primary uppercase">
                      {formData.salesEntries.filter(e => e.stockinId).length} Items
                    </span>
                  </div>
                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-xs font-black text-theme-text-secondary uppercase tracking-widest">Total Quantity</span>
                    <span className="text-lg font-black text-theme-text-primary">
                      {formData.salesEntries
                        .filter(e => e.quantity)
                        .reduce((sum, e) => sum + Number(e.quantity), 0)} Units
                    </span>
                  </div>
                  {formData.salesEntries.some(e => e.soldPrice) && (
                    <div className="flex justify-between items-center pt-8 border-t border-theme-border relative z-10">
                      <span className="text-sm font-black text-theme-text-secondary uppercase tracking-widest">Estimated Grand Total</span>
                      <span className="text-4xl font-black text-primary-500 tracking-tighter">
                        {formData.salesEntries
                          .filter(e => e.soldPrice && e.quantity)
                          .reduce((sum, e) => sum + (Number(e.soldPrice) * Number(e.quantity)), 0)
                          .toLocaleString()} <span className="text-lg uppercase ml-1">RWF</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 pt-12 mt-4 border-t border-theme-border">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-5 border-2 border-theme-border rounded-2xl hover:bg-theme-bg-tertiary transition-all font-black text-xs uppercase tracking-widest text-theme-text-secondary"
              >
                Cancel Transaction
              </button>
              <button
                type="submit"
                disabled={isLoading || !isFormValid()}
                className="flex-[2] py-5 bg-primary-500 text-white rounded-2xl hover:bg-primary-600 shadow-2xl shadow-primary-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing Transaction...
                  </>
                ) : (
                  isUpdateMode ? "Save Changes" : "Confirm & Complete Sale"
                )}
              </button>
            </div>

            {/* Help Section */}
            <div className="mt-12 p-8 bg-primary-500/5 rounded-3xl border border-primary-500/10">
              <h4 className="text-sm font-black text-primary-500 mb-6 flex items-center gap-3 uppercase tracking-widest">
                <AlertCircle size={20} />
                Important Guidelines
              </h4>
              <ul className="text-xs font-bold text-theme-text-secondary uppercase tracking-widest space-y-4 ml-1">
                <li className="flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                  Select identified stock items for automatic inventory reduction
                </li>
                <li className="flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                  System will prevent transactions exceeding current available stock
                </li>
                <li className="flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                  Selling price validation ensures data integrity for financial reports
                </li>
                <li className="flex items-center gap-4">
                  <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                  Automatic warnings triggered for sales below unit cost price
                </li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpsertStockOutModal;

import React, { useEffect, useState } from "react";
import { X, AlertCircle } from "lucide-react";

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
        className={`w-full px-3 py-2 border rounded-lg flex justify-between items-center cursor-pointer bg-white ${error ? "border-red-500 bg-red-50" : "border-gray-300"
          } ${isOpen ? "ring-2 ring-blue-500 border-transparent" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={`block truncate ${!selectedOption ? "text-gray-500" : "text-gray-900"}`}>
          {selectedOption ? (
            <span className="flex flex-col text-left">
              <span className="font-medium text-sm">{selectedOption.label}</span>
              {selectedOption.subLabel && <span className="text-gray-500 text-xs">{selectedOption.subLabel}</span>}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 bg-gray-50 sticky top-0">
            <input
              ref={searchInputRef}
              type="text"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`px-3 py-2 cursor-pointer text-sm hover:bg-blue-50 border-b border-gray-50 last:border-0 ${option.value === value ? "bg-blue-50 text-blue-600" : "text-gray-700"
                    }`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <div className="font-medium">{option.label}</div>
                  {option.subLabel && <div className="text-xs text-gray-500">{option.subLabel}</div>}
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">No results found</div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Update Mode: Single Entry */}
          {isUpdateMode ? (
            <div className="space-y-4">
              <div className="md:col-span-3 mb-2 flex items-center">
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
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isExternal" className="ml-2 block text-sm text-gray-900 font-medium">
                  Non-Stock Item (External Sale)
                </label>
              </div>

              {!formData.isExternal ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.externalItemName}
                      onChange={e => {
                        setFormData(prev => ({ ...prev, externalItemName: e.target.value }));
                        setTouched(prev => ({ ...prev, externalItemName: true }));
                        // Simple validation inline or add helper
                        setValidationErrors(prev => ({
                          ...prev,
                          externalItemName: e.target.value.trim() ? "" : "Item name is required",
                        }));
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${touched.externalItemName && validationErrors.externalItemName
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                        }`}
                    />
                    {touched.externalItemName && validationErrors.externalItemName && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle size={12} />
                        {validationErrors.externalItemName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SKU (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.externalSku}
                      onChange={e => setFormData(prev => ({ ...prev, externalSku: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, quantity: e.target.value }));
                    setTouched(prev => ({ ...prev, quantity: true }));
                    // Validate quantity (skip stock check if external)
                    const qtyError = (!e.target.value || Number(e.target.value) <= 0)
                      ? "Quantity must be > 0"
                      : (!formData.isExternal && formData.stockinId
                        ? validateQuantity(e.target.value, formData.stockinId)
                        : "");
                    setValidationErrors(prev => ({ ...prev, quantity: qtyError }));
                  }}
                  onBlur={() => setTouched(prev => ({ ...prev, quantity: true }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${touched.quantity && validationErrors.quantity
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${touched.soldPrice && validationErrors.soldPrice
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
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
                    <p className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Warning: Selling below unit cost
                    </p>
                  )}
              </div>
            </div>
          ) : (
            /* Create Mode: Multiple Entries */
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg text-gray-800">Sale Items</h3>
              </div>

              {formData.salesEntries.map((entry, i) => {
                const stock = getStockInfo(entry.stockinId);
                const entryErrors = validationErrors.salesEntries[i] || { stockinId: "", quantity: "", soldPrice: "", externalItemName: "" };
                const isTouched = touched.salesEntries[i];

                return (
                  <div key={i} className="bg-white border rounded-lg p-4 mb-4 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-4">
                        <span className="font-medium text-gray-700">Item {i + 1}</span>
                        {/* Per-row Toggle */}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`isExternal-${i}`}
                            checked={entry.isExternal}
                            onChange={(e) => handleSalesEntryChange(i, "isExternal", e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`isExternal-${i}`} className="ml-2 text-xs text-gray-600 font-medium">
                            Non-Stock
                          </label>
                        </div>
                      </div>

                      {formData.salesEntries.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSalesEntry(i)}
                          className="text-red-600 text-sm hover:underline font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Stock Selection OR External Item Name */}
                      <div className="md:col-span-2">
                        {!entry.isExternal ? (
                          <>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">
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
                          </>
                        ) : (
                          <>
                            <div className="mb-2">
                              <label className="text-sm font-medium text-gray-700">
                                Item Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={entry.externalItemName || ""}
                                onChange={e => handleSalesEntryChange(i, "externalItemName", e.target.value)}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isTouched && entryErrors.externalItemName
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-300"
                                  }`}
                              />
                              {isTouched && entryErrors.externalItemName && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                  <AlertCircle size={12} />
                                  {entryErrors.externalItemName}
                                </p>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={entry.quantity}
                          onChange={e => handleSalesEntryChange(i, "quantity", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isTouched && entryErrors.quantity ? "border-red-500 bg-red-50" : "border-gray-300"
                            }`}
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
                        <label className="text-sm font-medium text-gray-700">Price (RWF) {entry.isExternal && <span className="text-red-500">*</span>}</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={entry.soldPrice}
                          onChange={e => handleSalesEntryChange(i, "soldPrice", e.target.value)}
                          placeholder={entry.isExternal ? "Required" : "Optional"}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isTouched && entryErrors.soldPrice ? "border-red-500 bg-red-50" : "border-gray-300"
                            }`}
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
                            <p className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                              <AlertCircle size={12} />
                              Below cost
                            </p>
                          )}
                      </div>

                      {/* Stock Info (Only for internal) */}
                      {!entry.isExternal && (
                        <div>
                          <label className="text-sm font-medium text-gray-700">Stock Info</label>
                          {stock ? (
                            <div className="bg-blue-50 p-2 rounded-lg text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Available:</span>
                                <span className="font-semibold">{stock.receivedQuantity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Location:</span>
                                <span className="font-medium">{stock.warehouseLocation}</span>
                              </div>
                              {stock.unitCost && (
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Cost:</span>
                                  <span className="font-medium">{stock.unitCost} RWF</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-gray-100 p-2 rounded-lg text-xs text-gray-400 text-center">
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
                className="w-full py-3 border-2 border-dashed border-blue-400 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium mt-4"
              >
                + Add Another Item
              </button>
            </div>
          )}

          {/* Client Information */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-lg mb-4 text-gray-800">Client Information (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.clientName ? "border-red-500 bg-red-50" : "border-gray-300"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${touched.clientEmail && validationErrors.clientEmail
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${touched.clientPhone && validationErrors.clientPhone
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${validationErrors.paymentMethod ? "border-red-500 bg-red-50" : "border-gray-300"
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
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Transaction Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-semibold">
                    {formData.salesEntries.filter(e => e.stockinId).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="font-semibold">
                    {formData.salesEntries
                      .filter(e => e.quantity)
                      .reduce((sum, e) => sum + Number(e.quantity), 0)}
                  </span>
                </div>
                {formData.salesEntries.some(e => e.soldPrice) && (
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="text-gray-600">Estimated Total:</span>
                    <span className="font-bold text-lg text-blue-600">
                      {formData.salesEntries
                        .filter(e => e.soldPrice && e.quantity)
                        .reduce((sum, e) => sum + (Number(e.soldPrice) * Number(e.quantity)), 0)
                        .toFixed(2)} RWF
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !isFormValid()}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading
                ? "Processing..."
                : isUpdateMode
                  ? "Update Sale"
                  : "Complete Sale"}
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <AlertCircle size={16} />
            Tips for Best Results
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
            <li>Select items from the dropdown to add to the sale</li>
            <li>Quantity cannot exceed available stock (receivedQuantity)</li>
            <li>Selling price is optional but helps track revenue</li>
            <li>System will warn if selling below cost price</li>
            <li>All quantity values must be whole numbers</li>
            <li>Client information is optional but useful for records</li>
          </ul>
        </div>
      </div >
    </div >
  );
};

export default UpsertStockOutModal;
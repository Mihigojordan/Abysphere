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
}

interface ValidationError {
  stockinId: string;
  quantity: string;
  soldPrice: string;
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
    salesEntries: [{ stockinId: "", quantity: "", soldPrice: "" }] as SalesEntry[],
  });

  const [validationErrors, setValidationErrors] = useState({
    stockinId: "",
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
        salesEntries: [],
      });
    } else {
      setFormData({
        stockinId: "",
        quantity: "",
        soldPrice: "",
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        paymentMethod: "",
        salesEntries: [{ stockinId: "", quantity: "", soldPrice: "" }],
      });
    }

    setValidationErrors({
      stockinId: "",
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

  const calculateSuggestedPrice = (stockinId: string): string => {
    const stock = stockIns.find(s => s.id === Number(stockinId));
    if (!stock || !stock.unitCost) return "";
    // Suggest 30% markup
    return (Number(stock.unitCost) * 1.3).toFixed(2);
  };

  const getStockInfo = (id: string): StockIn | undefined => {
    return stockIns.find(s => s.id === Number(id));
  };

  const addSalesEntry = () => {
    setFormData(prev => ({
      ...prev,
      salesEntries: [...prev.salesEntries, { stockinId: "", quantity: "", soldPrice: "" }],
    }));
    setValidationErrors(prev => ({
      ...prev,
      salesEntries: [...prev.salesEntries, { stockinId: "", quantity: "", soldPrice: "" }],
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
    field: "stockinId" | "quantity" | "soldPrice",
    value: string
  ) => {
    const updated = [...formData.salesEntries];
    updated[index][field] = value;

    if (field === "stockinId" && value) {
      const stock = getStockInfo(value);
      if (stock) {
        if (!updated[index].quantity) {
          updated[index].quantity = calculateSuggestedQuantity(stock.receivedQuantity).toString();
        }
        // Price is NOT auto-filled — user enters it manually
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

    if (field === "stockinId") {
      errors[index].stockinId = validateStockInId(value);
      if (updated[index].quantity) {
        errors[index].quantity = validateQuantity(updated[index].quantity, value);
      }
      if (updated[index].soldPrice) {
        errors[index].soldPrice = validateSoldPrice(updated[index].soldPrice, value);
      }
    } else if (field === "quantity") {
      errors[index].quantity = validateQuantity(value, updated[index].stockinId);
    } else if (field === "soldPrice") {
      errors[index].soldPrice = validateSoldPrice(value, updated[index].stockinId);
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
        quantity: true,
        soldPrice: true,
        clientEmail: true,
        clientPhone: true,
        salesEntries: [],
      });

      if (Object.values(errors).some(e => e !== "")) return;

      onSubmit({
        stockinId: Number(formData.stockinId),
        quantity: Number(formData.quantity),
        soldPrice: formData.soldPrice ? Number(formData.soldPrice) : undefined,
        clientName: formData.clientName.trim() || undefined,
        clientEmail: formData.clientEmail.trim() || undefined,
        clientPhone: formData.clientPhone.trim() || undefined,
        paymentMethod: formData.paymentMethod || undefined,
      });
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

      onSubmit({
        salesArray: formData.salesEntries.map(e => ({
          stockinId: Number(e.stockinId),
          quantity: Number(e.quantity),
          soldPrice: e.soldPrice ? Number(e.soldPrice) : undefined,
        })),
        clientInfo: {
          clientName: formData.clientName.trim() || undefined,
          clientEmail: formData.clientEmail.trim() || undefined,
          clientPhone: formData.clientPhone.trim() || undefined,
          paymentMethod: formData.paymentMethod || undefined,
        },
      });
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
        !validationErrors.soldPrice &&
        !validationErrors.clientName &&
        !validationErrors.clientEmail &&
        !validationErrors.clientPhone &&
        !validationErrors.paymentMethod
      );
    }

    return (
      formData.salesEntries.every(e => e.stockinId && e.quantity) &&
      validationErrors.salesEntries.every(e => !e.stockinId && !e.quantity && !e.soldPrice) &&
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Item <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.stockinId}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, stockinId: e.target.value }));
                      setTouched(prev => ({ ...prev, stockinId: true }));
                      setValidationErrors(prev => ({
                        ...prev,
                        stockinId: validateStockInId(e.target.value),
                      }));
                    }}
                    onBlur={() => setTouched(prev => ({ ...prev, stockinId: true }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${touched.stockinId && validationErrors.stockinId
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                      }`}
                  >
                    <option value="">Select stock item</option>
                    {stockIns.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.sku} - {s.itemName} (Available: {s.receivedQuantity})
                      </option>
                    ))}
                  </select>
                  {touched.stockinId && validationErrors.stockinId && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {validationErrors.stockinId}
                    </p>
                  )}
                </div>

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
                      setValidationErrors(prev => ({
                        ...prev,
                        quantity: validateQuantity(e.target.value, formData.stockinId),
                      }));
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
                    Selling Price (RWF)
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
                        soldPrice: validateSoldPrice(e.target.value, formData.stockinId),
                      }));
                    }}
                    onBlur={() => setTouched(prev => ({ ...prev, soldPrice: true }))}
                    placeholder="Optional"
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
            </div>
          ) : (
            /* Create Mode: Multiple Entries */
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold text-lg mb-4 text-gray-800">Sale Items</h3>
              {formData.salesEntries.map((entry, i) => {
                const stock = getStockInfo(entry.stockinId);
                const entryErrors = validationErrors.salesEntries[i] || { stockinId: "", quantity: "", soldPrice: "" };
                const isTouched = touched.salesEntries[i];

                return (
                  <div key={i} className="bg-white border rounded-lg p-4 mb-4 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-700">Item {i + 1}</span>
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
                      {/* Stock Selection */}
                      <div className="md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">
                          Stock Item <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={entry.stockinId}
                          onChange={e => handleSalesEntryChange(i, "stockinId", e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isTouched && entryErrors.stockinId ? "border-red-500 bg-red-50" : "border-gray-300"
                            }`}
                        >
                          <option value="">Select item...</option>
                          {stockIns.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.sku} - {s.itemName} (Available: {s.receivedQuantity})
                            </option>
                          ))}
                        </select>
                        {isTouched && entryErrors.stockinId && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={12} />
                            {entryErrors.stockinId}
                          </p>
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
                        <label className="text-sm font-medium text-gray-700">Price (RWF)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={entry.soldPrice}
                          onChange={e => handleSalesEntryChange(i, "soldPrice", e.target.value)}
                          placeholder="Optional"
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

                      {/* Stock Info */}
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
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addSalesEntry}
                className="w-full py-3 border-2 border-dashed border-blue-400 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
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
      </div>
    </div>
  );
};

export default UpsertStockOutModal;
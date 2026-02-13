import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import * as XLSX from 'xlsx';
import stockService from '../../../services/stockService';

interface ImportStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ImportStockModal: React.FC<ImportStockModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
            parseFile(selectedFile);
        }
    };

    const parseFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(sheet);
                setPreviewData(jsonData);
            } catch (err) {
                setError('Failed to parse file. Please ensure it is a valid Excel file.');
                console.error(err);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleImport = async () => {
        if (!previewData.length) {
            setError('No data found in file.');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Map keys to match backend expectations if necessary, 
            // or assume user provides correct headers.
            // Expected: itemName, sku, category, supplier, receivedQuantity, unitCost, location...

            // Basic validation check
            const invalidRows = previewData.filter(row => !row.ItemName && !row.itemName);
            if (invalidRows.length > 0) {
                console.warn(`${invalidRows.length} rows are missing Item Name and will be skipped or error out.`);
            }

            const mappedData = previewData.map(row => ({
                itemName: row.ItemName || row.itemName,
                sku: row.SKU || row.sku,
                category: row.Category || row.category,
                supplier: row.Supplier || row.supplier,
                receivedQuantity: row.Quantity || row.quantity || row.receivedQuantity,
                unitCost: row.UnitCost || row.unitCost,
                warehouseLocation: row.Location || row.location || row.warehouseLocation,
                minStockLevel: row.MinStock || row.minStockLevel || row.reorderLevel,
                description: row.Description || row.description,
                expiryDate: row.ExpiryDate || row.expiryDate,
                receivedDate: row.ReceivedDate || row.receivedDate
            }));

            const result = await stockService.bulkImport(mappedData);

            if (result.failed > 0) {
                // If partial success, show details
                setError(`Imported ${result.success} items. Failed: ${result.failed}. Errors: ${result.errors.join(', ')}`);
                // If at least some succeeded, we might want to trigger success callback too
                if (result.success > 0) onSuccess();
            } else {
                setSuccessMessage(`Successfully imported ${result.success} items!`);
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1500);
            }

        } catch (err: any) {
            setError(err.message || 'Failed to import data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                        <FileSpreadsheet className="w-5 h-5 mr-2 text-primary-600" />
                        Import Stock
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {!file ? (
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:bg-gray-50 transition cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-600 font-medium">Click to upload Excel file</p>
                            <p className="text-gray-400 text-sm mt-1">.xlsx, .xls, .csv</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".xlsx, .xls, .csv"
                                onChange={handleFileChange}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-blue-50 p-3 rounded text-sm text-blue-700">
                                <span className="flex items-center">
                                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                                    {file.name}
                                </span>
                                <button
                                    onClick={() => { setFile(null); setPreviewData([]); setError(null); }}
                                    className="text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Change
                                </button>
                            </div>

                            {previewData.length > 0 && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600 mb-2">Preview ({previewData.length} items found):</p>
                                    <div className="bg-gray-50 border border-gray-200 rounded max-h-60 overflow-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-gray-100 font-medium text-gray-600 sticky top-0">
                                                <tr>
                                                    <th className="p-2 border-b">Item Name</th>
                                                    <th className="p-2 border-b">Category</th>
                                                    <th className="p-2 border-b">Qty</th>
                                                    <th className="p-2 border-b">Cost</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {previewData.slice(0, 5).map((row, i) => (
                                                    <tr key={i}>
                                                        <td className="p-2">{row.ItemName || row.itemName || '-'}</td>
                                                        <td className="p-2">{row.Category || row.category || '-'}</td>
                                                        <td className="p-2">{row.Quantity || row.quantity || row.receivedQuantity || '-'}</td>
                                                        <td className="p-2">{row.UnitCost || row.unitCost || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {previewData.length > 5 && (
                                            <div className="p-2 text-center text-xs text-gray-500 border-t">
                                                ...and {previewData.length - 5} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="p-3 bg-red-50 text-red-700 rounded text-sm flex items-start">
                                    <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {successMessage && (
                                <div className="p-3 bg-green-50 text-green-700 rounded text-sm flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    <span>{successMessage}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm font-medium"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    {file && !successMessage && (
                        <button
                            onClick={handleImport}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium flex items-center disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
                            Import Stock
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportStockModal;

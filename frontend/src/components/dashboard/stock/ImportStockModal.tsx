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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-theme-bg-primary rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-theme-border animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-theme-border">
                    <h2 className="text-xl font-black text-theme-text-primary flex items-center uppercase tracking-widest">
                        <FileSpreadsheet className="w-6 h-6 mr-3 text-primary-600" />
                        Import Stock
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-theme-bg-tertiary rounded-xl transition-colors text-theme-text-secondary hover:text-theme-text-primary">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {!file ? (
                        <div
                            className="border-2 border-dashed border-theme-border rounded-2xl p-12 text-center hover:bg-theme-bg-tertiary transition-all cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-16 h-16 bg-theme-bg-tertiary rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-theme-text-secondary group-hover:text-primary-500 transition-colors" />
                            </div>
                            <p className="text-[11px] font-black text-theme-text-primary uppercase tracking-widest">Click to upload Excel file</p>
                            <p className="text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mt-2">.xlsx, .xls, .csv</p>
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
                            <div className="flex items-center justify-between bg-primary-500/10 border border-primary-500/20 p-4 rounded-xl text-primary-600">
                                <span className="flex items-center text-[10px] font-black uppercase tracking-widest">
                                    <FileSpreadsheet className="w-4 h-4 mr-3" />
                                    {file.name}
                                </span>
                                <button
                                    onClick={() => { setFile(null); setPreviewData([]); setError(null); }}
                                    className="text-[10px] font-black uppercase tracking-widest hover:underline"
                                >
                                    Change
                                </button>
                            </div>

                            {previewData.length > 0 && (
                                <div className="mt-6">
                                    <p className="text-[10px] font-black text-theme-text-secondary uppercase tracking-widest mb-2.5">Preview ({previewData.length} items found):</p>
                                    <div className="bg-theme-bg-tertiary border border-theme-border rounded-xl max-h-60 overflow-auto overflow-x-hidden">
                                        <table className="w-full text-[10px] text-left">
                                            <thead className="bg-theme-bg-secondary font-black text-theme-text-secondary uppercase tracking-widest sticky top-0">
                                                <tr>
                                                    <th className="p-3 border-b border-theme-border">Item Name</th>
                                                    <th className="p-3 border-b border-theme-border">Category</th>
                                                    <th className="p-3 border-b border-theme-border">Qty</th>
                                                    <th className="p-3 border-b border-theme-border">Cost</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-theme-border">
                                                {previewData.slice(0, 5).map((row, i) => (
                                                    <tr key={i} className="text-theme-text-primary font-black uppercase tracking-tighter">
                                                        <td className="p-3 truncate">{row.ItemName || row.itemName || '-'}</td>
                                                        <td className="p-3 truncate">{row.Category || row.category || '-'}</td>
                                                        <td className="p-3">{row.Quantity || row.quantity || row.receivedQuantity || '-'}</td>
                                                        <td className="p-3">{row.UnitCost || row.unitCost || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {previewData.length > 5 && (
                                            <div className="p-3 text-center text-[10px] font-black text-theme-text-secondary uppercase tracking-widest border-t border-theme-border bg-theme-bg-secondary/50">
                                                ...and {previewData.length - 5} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-start">
                                    <AlertCircle className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            {successMessage && (
                                <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-3" />
                                    <span>{successMessage}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-theme-border bg-theme-bg-tertiary flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-theme-text-secondary hover:text-theme-text-primary border border-theme-border rounded-xl transition-all"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    {file && !successMessage && (
                        <button
                            onClick={handleImport}
                            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center disabled:opacity-50 shadow-lg shadow-primary-600/20 transition-all"
                            disabled={loading}
                        >
                            {loading && <Loader className="w-4 h-4 mr-3 animate-spin" />}
                            Import Stock
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportStockModal;

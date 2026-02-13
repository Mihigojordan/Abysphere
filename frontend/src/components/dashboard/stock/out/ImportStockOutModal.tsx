import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, X, FileText, CheckCircle, AlertTriangle, Download, RefreshCw } from 'lucide-react';
import stockOutService from '../../../../services/stockoutService';

interface ImportStockOutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface ImportedItem {
    ItemName: string;
    SKU?: string;
    Quantity: number;
    SoldPrice: number;
    ClientName?: string;
    ClientEmail?: string;
    ClientPhone?: string;
    PaymentMethod?: string;
    status?: 'pending' | 'success' | 'error';
    message?: string;
}

const ImportStockOutModal: React.FC<ImportStockOutModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewData, setPreviewData] = useState<ImportedItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'partial' | 'error'>('idle');
    const [results, setResults] = useState<{ success: number; failed: number; external: number; errors: string[] } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseFile(selectedFile);
        }
    };

    const parseFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<any>(sheet);

            const formattedData: ImportedItem[] = jsonData.map((row) => ({
                ItemName: row['Item Name'] || row['ItemName'] || row['Product'] || '',
                SKU: row['SKU'] || row['sku'] || '',
                Quantity: Number(row['Quantity'] || row['Qty'] || 0),
                SoldPrice: Number(row['Sold Price'] || row['SoldPrice'] || row['Price'] || 0),
                ClientName: row['Client Name'] || row['ClientName'] || row['Client'] || '',
                ClientEmail: row['Client Email'] || row['ClientEmail'] || '',
                ClientPhone: row['Client Phone'] || row['ClientPhone'] || '',
                PaymentMethod: row['Payment Method'] || row['PaymentMethod'] || 'CASH',
                status: 'pending',
            }));

            setPreviewData(formattedData);
            setUploadStatus('idle');
            setResults(null);
        };
        reader.readAsBinaryString(file);
    };

    const handleUpload = async () => {
        if (previewData.length === 0) return;

        setIsUploading(true);
        try {
            // Map to backend expected format
            const payload = previewData.map(item => ({
                itemName: item.ItemName,
                sku: item.SKU,
                quantity: item.Quantity,
                soldPrice: item.SoldPrice,
                clientName: item.ClientName,
                clientEmail: item.ClientEmail,
                clientPhone: item.ClientPhone,
                paymentMethod: item.PaymentMethod?.toUpperCase(),
            }));

            const response = await stockOutService.bulkImport(payload);

            setResults(response);

            if (response.failed === 0) {
                setUploadStatus('success');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 2000);
            } else if (response.success > 0) {
                setUploadStatus('partial');
            } else {
                setUploadStatus('error');
            }

        } catch (error: any) {
            console.error('Upload failed:', error);
            setUploadStatus('error');
            setResults({
                success: 0,
                failed: previewData.length,
                external: 0,
                errors: [error.message || 'Unknown error occurred'],
            });
        } finally {
            setIsUploading(false);
        }
    };

    const downloadTemplate = () => {
        // Simple CSV template
        const headers = ['ItemName', 'SKU', 'Quantity', 'SoldPrice', 'ClientName', 'ClientEmail', 'ClientPhone', 'PaymentMethod'];
        const rows = [
            ['Tilapia Feed A', 'FEED-001', '10', '6000', 'John Doe', 'john@example.com', '0780000000', 'CASH'],
            ['Unknown Item', '', '5', '2000', 'Jane Doe', '', '0780000001', 'MOMO']
        ];

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sales_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Import Sales</h2>
                        <p className="text-xs text-gray-500">Upload Excel or CSV file to bulk import sales</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {/* Upload Area */}
                    {!file ? (
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".csv, .xlsx, .xls"
                                onChange={handleFileChange}
                            />
                            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Upload className="w-6 h-6 text-primary-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
                            <p className="text-xs text-gray-500 mt-1">Excel or CSV files only</p>
                            <button
                                onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}
                                className="mt-4 text-primary-600 text-xs hover:underline flex items-center justify-center gap-1 mx-auto"
                            >
                                <Download className="w-3 h-3" /> Download Template
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded">
                                        <FileText className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB • {previewData.length} items</p>
                                    </div>
                                </div>
                                <button onClick={() => setFile(null)} className="text-gray-400 hover:text-red-500">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Preview Table */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                                    <h3 className="text-xs font-semibold text-gray-700">Preview Data</h3>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-gray-50 text-gray-500 sticky top-0">
                                            <tr>
                                                <th className="px-3 py-2 font-medium">Item Name</th>
                                                <th className="px-3 py-2 font-medium">Qty</th>
                                                <th className="px-3 py-2 font-medium">Price</th>
                                                <th className="px-3 py-2 font-medium">Client</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {previewData.map((item, i) => (
                                                <tr key={i}>
                                                    <td className="px-3 py-2 text-gray-900 truncate max-w-[150px]" title={item.ItemName}>{item.ItemName}</td>
                                                    <td className="px-3 py-2 text-gray-600">{item.Quantity}</td>
                                                    <td className="px-3 py-2 text-gray-600">{item.SoldPrice}</td>
                                                    <td className="px-3 py-2 text-gray-600 truncate max-w-[100px]">{item.ClientName}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Results Summary */}
                            {uploadStatus !== 'idle' && results && (
                                <div className={`p-3 rounded-lg text-xs ${uploadStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                                    uploadStatus === 'partial' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                        'bg-red-50 text-red-700 border border-red-200'
                                    }`}>
                                    <div className="flex items-start gap-2">
                                        {uploadStatus === 'success' && <CheckCircle className="w-4 h-4 mt-0.5" />}
                                        {(uploadStatus === 'partial' || uploadStatus === 'error') && <AlertTriangle className="w-4 h-4 mt-0.5" />}
                                        <div>
                                            <p className="font-semibold">
                                                {uploadStatus === 'success' ? 'Import Successful!' :
                                                    uploadStatus === 'partial' ? 'Import Completed with Errors' : 'Import Failed'}
                                            </p>
                                            <ul className="mt-1 list-disc list-inside space-y-0.5 opacity-90">
                                                <li>Successful: {results.success} (External: {results.external})</li>
                                                <li>Failed: {results.failed}</li>
                                            </ul>
                                            {results.errors.length > 0 && (
                                                <div className="mt-2 text-[10px] bg-white bg-opacity-50 p-2 rounded max-h-20 overflow-y-auto">
                                                    {results.errors.map((err, i) => (
                                                        <p key={i} className="text-red-600">• {err}</p>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300"
                        disabled={isUploading}
                    >
                        Cancel
                    </button>
                    {file && uploadStatus !== 'success' && (
                        <button
                            onClick={handleUpload}
                            disabled={isUploading || previewData.length === 0}
                            className="px-4 py-2 text-xs font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isUploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                            {isUploading ? 'Importing...' : 'Import Sales'}
                        </button>
                    )}
                    {uploadStatus === 'success' && (
                        <button
                            onClick={() => { onSuccess(); onClose(); }}
                            className="px-4 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg"
                        >
                            Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportStockOutModal;

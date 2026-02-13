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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-theme-bg-primary rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl border border-theme-border animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-theme-border bg-theme-bg-tertiary flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary-500/10 p-3 rounded-2xl border border-primary-500/20">
                            <Upload className="w-6 h-6 text-primary-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-theme-text-primary uppercase tracking-tighter">Import Sales</h2>
                            <p className="text-[10px] font-bold text-theme-text-secondary uppercase tracking-widest mt-0.5">Bulk import records via Excel or CSV</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary p-2 rounded-xl transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                    {/* Upload Area */}
                    {!file ? (
                        <div
                            className="border-2 border-dashed border-theme-border rounded-2xl p-12 text-center hover:bg-theme-bg-tertiary hover:border-primary-500/50 transition-all cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".csv, .xlsx, .xls"
                                onChange={handleFileChange}
                            />
                            <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary-500/20 group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8 text-primary-500" />
                            </div>
                            <p className="text-sm font-black text-theme-text-primary uppercase tracking-widest">Click or drag file here</p>
                            <p className="text-[10px] font-bold text-theme-text-secondary uppercase tracking-widest mt-2">Support: .XLSX, .CSV (Max 10MB)</p>
                            <button
                                onClick={(e) => { e.stopPropagation(); downloadTemplate(); }}
                                className="mt-8 px-6 py-2.5 bg-theme-bg-primary border border-theme-border rounded-xl text-[10px] font-black text-primary-500 hover:bg-primary-500 hover:text-white transition-all uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
                            >
                                <Download className="w-4 h-4" /> Download Template
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-theme-bg-tertiary p-4 rounded-2xl border border-theme-border">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                                        <FileText className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-theme-text-primary uppercase tracking-tighter">{file.name}</p>
                                        <p className="text-[10px] font-bold text-theme-text-secondary uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB • {previewData.length} items detected</p>
                                    </div>
                                </div>
                                <button onClick={() => setFile(null)} className="p-2 text-theme-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Preview Table */}
                            <div className="border border-theme-border rounded-2xl overflow-hidden bg-theme-bg-primary shadow-xl">
                                <div className="bg-theme-bg-tertiary px-5 py-3 border-b border-theme-border flex items-center justify-between">
                                    <h3 className="text-[10px] font-black text-theme-text-primary uppercase tracking-widest flex items-center gap-2">
                                        <RefreshCw size={12} className="text-primary-500" />
                                        Data Preview
                                    </h3>
                                    <span className="text-[9px] font-black text-theme-text-secondary uppercase tracking-widest">{previewData.length} Rows</span>
                                </div>
                                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-theme-bg-tertiary text-theme-text-secondary sticky top-0 z-10 shadow-sm border-b border-theme-border">
                                            <tr>
                                                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Item</th>
                                                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Qty</th>
                                                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Price</th>
                                                <th className="px-5 py-3 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Client</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-theme-border">
                                            {previewData.map((item, i) => (
                                                <tr key={i} className="hover:bg-theme-bg-tertiary transition-colors group">
                                                    <td className="px-5 py-3">
                                                        <div className="text-[11px] font-black text-theme-text-primary uppercase tracking-tighter truncate max-w-[180px]" title={item.ItemName}>{item.ItemName}</div>
                                                        <div className="text-[9px] font-bold text-theme-text-secondary uppercase tracking-widest mt-0.5">{item.SKU || 'NO SKU'}</div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className="text-xs font-black text-theme-text-primary">{item.Quantity}</span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <span className="text-xs font-black text-primary-500">{(item.SoldPrice).toLocaleString()}</span>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="text-[10px] font-bold text-theme-text-primary uppercase tracking-tighter truncate max-w-[120px]">{item.ClientName || 'WALK-IN'}</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Results Summary */}
                            {uploadStatus !== 'idle' && results && (
                                <div className={`p-5 rounded-2xl border animate-in slide-in-from-bottom duration-300 ${uploadStatus === 'success' ? 'bg-green-500/5 text-green-500 border-green-500/20' :
                                    uploadStatus === 'partial' ? 'bg-amber-500/5 text-amber-500 border-amber-500/20' :
                                        'bg-red-500/5 text-red-500 border-red-500/20'
                                    }`}>
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-xl border ${uploadStatus === 'success' ? 'bg-green-500/10 border-green-500/20' :
                                            uploadStatus === 'partial' ? 'bg-amber-500/10 border-amber-500/20' :
                                                'bg-red-500/10 border-red-500/20'
                                            }`}>
                                            {uploadStatus === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-black uppercase tracking-tighter">
                                                {uploadStatus === 'success' ? 'Batch Processing Complete' :
                                                    uploadStatus === 'partial' ? 'Processing Finished with Exceptions' : 'Operation Failed'}
                                            </p>
                                            <div className="grid grid-cols-2 gap-4 mt-3">
                                                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                                                    <span className="text-[9px] font-black uppercase tracking-widest block opacity-70">Successful</span>
                                                    <span className="text-sm font-black tracking-tighter">{results.success} Records</span>
                                                </div>
                                                <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                                                    <span className="text-[9px] font-black uppercase tracking-widest block opacity-70">Failed</span>
                                                    <span className="text-sm font-black tracking-tighter">{results.failed} Records</span>
                                                </div>
                                            </div>
                                            {results.errors.length > 0 && (
                                                <div className="mt-4 bg-black/40 rounded-xl p-4 max-h-32 overflow-y-auto border border-white/10 custom-scrollbar">
                                                    <p className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-70">Error Details:</p>
                                                    {results.errors.map((err, i) => (
                                                        <div key={i} className="flex gap-2 text-[10px] font-bold py-1 border-b border-white/5 last:border-0">
                                                            <span className="text-red-500 flex-shrink-0">•</span>
                                                            <span className="opacity-80">{err}</span>
                                                        </div>
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
                <div className="px-8 py-6 border-t border-theme-border bg-theme-bg-tertiary flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-primary border border-theme-border rounded-xl transition-all"
                        disabled={isUploading}
                    >
                        Cancel
                    </button>
                    {file && uploadStatus !== 'success' && (
                        <button
                            onClick={handleUpload}
                            disabled={isUploading || previewData.length === 0}
                            className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-primary-500 hover:bg-primary-600 rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/20 transition-all hover:scale-105 active:scale-95"
                        >
                            {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {isUploading ? 'Importing Process...' : 'Execute Import'}
                        </button>
                    )}
                    {uploadStatus === 'success' && (
                        <button
                            onClick={() => { onSuccess(); onClose(); }}
                            className="px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-green-500 hover:bg-green-600 rounded-xl shadow-lg shadow-green-500/20 transition-all hover:scale-105"
                        >
                            Complete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportStockOutModal;

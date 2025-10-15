// DeleteStockInModal.tsx
import React from 'react';
import {
    X,
    Trash2,
    AlertCircle,
    Check,
    AlertTriangle
} from 'lucide-react';
import { type StockIn } from '../../../services/stockInService';
import Swal from 'sweetalert2';

interface DeleteStockInModalProps {
    isOpen: boolean;
    stockIn: StockIn | null;
    onClose: () => void;
    onDelete: (stockIn: StockIn) => Promise<void>;
}

const DeleteStockInModal: React.FC<DeleteStockInModalProps> = ({
    isOpen,
    stockIn,
    onClose,
    onDelete
}) => {
    const [isDeleting, setIsDeleting] = React.useState(false);

    if (!isOpen || !stockIn) return null;

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await onDelete(stockIn);
            onClose();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to delete stock item.',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClose = () => {
        if (!isDeleting) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Delete Stock Item</h3>
                            <p className="text-xs text-gray-500">Are you sure?</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isDeleting}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4">
                    <div className="flex items-start space-x-3 mb-4">
                        <Trash2 className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-gray-700">
                            <p>
                                This action cannot be undone. This will permanently delete the stock item{' '}
                                <span className="font-semibold text-gray-900">"{stockIn.productName}"</span>.
                            </p>
                            <p className="mt-1">
                                Quantity: <span className="font-medium">{stockIn.quantity} {stockIn.unit}</span>
                            </p>
                            {stockIn.reorderLevel && stockIn.reorderLevel > 0 && (
                                <p className={`mt-1 ${isLowStock(stockIn) ? 'text-red-600' : 'text-gray-600'}`}>
                                    Reorder Level: <span className="font-medium">{stockIn.reorderLevel} {stockIn.unit}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                    <button
                        onClick={handleClose}
                        disabled={isDeleting}
                        className="px-4 py-2 text-xs text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center space-x-1 px-4 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded transition-colors"
                    >
                        {isDeleting ? (
                            <>
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                <span>Deleting...</span>
                            </>
                        ) : (
                            <>
                                <Check className="w-3 h-3" />
                                <span>Delete Stock Item</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteStockInModal;
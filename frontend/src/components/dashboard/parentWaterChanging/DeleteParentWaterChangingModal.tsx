import React from 'react';
import {
    X,
    Trash2,
    AlertTriangle,
    Check
} from 'lucide-react';
import { type ParentWaterChanging } from '../../../services/parentWaterChangingService';
import Swal from 'sweetalert2';

interface DeleteParentWaterChangingModalProps {
    isOpen: boolean;
    record: ParentWaterChanging | null;
    onClose: () => void;
    onDelete: (record: ParentWaterChanging) => Promise<void>;
}

const DeleteParentWaterChangingModal: React.FC<DeleteParentWaterChangingModalProps> = ({
    isOpen,
    record,
    onClose,
    onDelete
}) => {
    const [isDeleting, setIsDeleting] = React.useState(false);

    if (!isOpen || !record) return null;

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await onDelete(record);
            onClose();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Failed to delete water change record.',
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
                            <h3 className="text-sm font-semibold text-gray-900">Delete Water Change Record</h3>
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
                                This action cannot be undone. This will permanently delete the water change record for{' '}
                                <span className="font-semibold text-gray-900">"{record.parentPool?.name || 'Unknown'}"</span> on{' '}
                                <span className="font-semibold text-gray-900">{new Date(record.date).toLocaleDateString('en-GB')}</span>.
                            </p>
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
                                <span>Delete Record</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteParentWaterChangingModal;
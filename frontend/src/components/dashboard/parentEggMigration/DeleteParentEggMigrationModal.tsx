import React, { useState } from 'react';
import { X, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { type ParentEggMigration } from '../../../services/parentEggMigrationService';

interface DeleteParentEggMigrationModalProps {
    isOpen: boolean;
    record: ParentEggMigration | null;
    onClose: () => void;
    onDelete: (record: ParentEggMigration) => Promise<void>;
}

const DeleteParentEggMigrationModal: React.FC<DeleteParentEggMigrationModalProps> = ({
    isOpen,
    record,
    onClose,
    onDelete
}) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showContent, setShowContent] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setTimeout(() => setShowContent(true), 50);
            setError(null);
        } else {
            setShowContent(false);
        }
    }, [isOpen]);

    const handleDelete = async () => {
        if (!record) return;

        try {
            setIsDeleting(true);
            setError(null);
            await onDelete(record);
        } catch (err: any) {
            console.error('Error deleting egg migration record:', err);
            setError(err.message || 'Failed to delete egg migration record');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClose = () => {
        if (!isDeleting) {
            onClose();
        }
    };

    if (!isOpen || !record) return null;

    return (
        <div 
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
                showContent ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleClose}
        >
            <div 
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 ${
                    showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Gradient Header */}
                <div className="relative px-6 pt-6 pb-8 bg-gradient-to-br from-red-500 to-red-600">
                    <button
                        onClick={handleClose}
                        disabled={isDeleting}
                        className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                            <Trash2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">Delete Egg Migration Record</h3>
                            <p className="text-white/80 text-sm mt-0.5">
                                Confirm deletion for "{record.parentPool?.name || 'Unknown'}"
                            </p>
                        </div>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                    <div className="text-sm text-gray-700">
                        Are you sure you want to delete the egg migration record for pool "
                        <span className="font-semibold">{record.parentPool?.name || 'Unknown'}</span>" to laboratory box "
                        <span className="font-semibold">{record.laboratoryBox?.name || 'N/A'}</span>"? This action cannot be undone.
                    </div>
                    {error && (
                        <div className="flex items-start space-x-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isDeleting}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center space-x-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Deleting...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-5 h-5" />
                                <span>Delete</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteParentEggMigrationModal;
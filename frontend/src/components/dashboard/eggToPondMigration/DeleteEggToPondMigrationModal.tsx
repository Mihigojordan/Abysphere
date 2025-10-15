import React, { useState } from 'react';
import { X, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { type EggToPondMigration } from '../../../services/eggToPondMigrationsService';
import Swal from 'sweetalert2';

interface DeleteEggToPondMigrationModalProps {
    isOpen: boolean;
    record: EggToPondMigration | null;
    onClose: () => void;
    onDelete: (record: EggToPondMigration) => Promise<void>;
}

const DeleteEggToPondMigrationModal: React.FC<DeleteEggToPondMigrationModalProps> = ({
    isOpen,
    record,
    onClose,
    onDelete
}) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!record) return;

        try {
            setIsDeleting(true);
            await onDelete(record);
            onClose();
        } catch (err: any) {
            console.error('Error deleting migration:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to delete migration',
                customClass: { popup: 'text-xs' }
            });
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen || !record) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <Trash2 className="w-4 h-4 text-red-600" />
                        <h2 className="text-sm font-semibold text-gray-900">Delete Migration</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4">
                    <div className="text-xs text-gray-600 mb-4">
                        Are you sure you want to delete this migration? This action cannot be undone.
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-2">
                        <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">Parent Egg Migration:</span>
                            <span>{record.parentEggMigration?.description || record.parentEggMigrationId}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">Pond:</span>
                            <span>{record.pond?.name || record.pondId}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">Employee:</span>
                            <span>{record.employee?.email || record.employeeId}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">Date:</span>
                            <span>{new Date(record.date).toLocaleDateString('en-GB')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">Description:</span>
                            <span>{record.description || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">Status:</span>
                            <span>{record.status}</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="flex items-center space-x-2 px-4 py-2 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Deleting...</span>
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteEggToPondMigrationModal;
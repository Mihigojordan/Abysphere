import React from 'react';
import { X, Trash2, Loader2 } from 'lucide-react';
import { type EggFishFeeding } from '../../../services/eggFishFeedingService';

interface DeleteEggFishFeedingModalProps {
    isOpen: boolean;
    record: EggFishFeeding | null;
    onClose: () => void;
    onDelete: (record: EggFishFeeding) => Promise<void>;
}

const DeleteEggFishFeedingModal: React.FC<DeleteEggFishFeedingModalProps> = ({
    isOpen,
    record,
    onClose,
    onDelete,
}) => {
    const [isLoading, setIsLoading] = React.useState(false);

    const handleDelete = async () => {
        if (!record) return;
        setIsLoading(true);
        try {
            await onDelete(record);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !record) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <Trash2 className="w-5 h-5 text-red-600" />
                        <h2 className="text-base font-semibold text-gray-900">Delete Feeding Record</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-sm text-gray-600 mb-6">
                    <p>
                        Are you sure you want to delete the feeding record for{' '}
                        <span className="font-medium">{record.feed?.name || 'Unknown Feed'}</span> associated with{' '}
                        <span className="font-medium">
                            {record.parentEggMigration?.description || `Migration ${record.parentEggMigrationId.substring(0, 8)}`}
                        </span>?
                    </p>
                    <p className="mt-2">This action cannot be undone.</p>
                </div>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded flex items-center space-x-2 disabled:opacity-50"
                        disabled={isLoading}
                    >
                        {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteEggFishFeedingModal;
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface Client {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    status: 'ACTIVE' | 'INACTIVE';
    profileImage?: string | null;
    createdAt: string;
    updatedAt: string;
}

interface DeleteClientModalProps {
    isOpen: boolean;
    client: Client | null;
    onClose: () => void;
    onDelete: (client: Client) => Promise<void>;
}

const DeleteClientModal = ({ isOpen, client, onClose, onDelete }: DeleteClientModalProps) => {
    if (!isOpen || !client) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Delete Client</h3>
                        <p className="text-sm text-gray-500">This action cannot be undone</p>
                    </div>
                </div>
                <div className="mb-6">
                    <p className="text-gray-700">
                        Are you sure you want to delete the client{" "}
                        <span className="font-semibold">"{client.firstname} {client.lastname}"</span>? This will permanently remove the client and all associated data.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onDelete(client)}
                        className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        Delete Client
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteClientModal;
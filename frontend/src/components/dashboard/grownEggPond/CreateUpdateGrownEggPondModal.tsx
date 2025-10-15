import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import grownEggPondService, { type GrownEggPond, type CreateGrownEggPondInput, type UpdateGrownEggPondInput } from '../../../services/grownEggPondService';
import Swal from 'sweetalert2';

interface CreateUpdateGrownEggPondModalProps {
    isOpen: boolean;
    record: GrownEggPond | null;
    onClose: () => void;
    onSave: (data: CreateGrownEggPondInput | UpdateGrownEggPondInput) => Promise<void>;
    mode: 'create' | 'update';
}

const generatePondCode = (name: string): string => {
  // Remove special characters, get first letters of words, and append UUID suffix
  const words = name.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/);
  const initials = words
    .filter(word => word.length > 0)
    .map(word => word[0].toUpperCase())
    .join('');
  const uuidSuffix = uuidv4().slice(0, 5);
  return `${initials}_${uuidSuffix}`;
};

const CreateUpdateGrownEggPondModal: React.FC<CreateUpdateGrownEggPondModalProps> = ({
    isOpen,
    record,
    onClose,
    onSave,
    mode
}) => {
    const [formData, setFormData] = useState<CreateGrownEggPondInput | UpdateGrownEggPondInput>({
        name: record?.name || '',
        code: record?.code || '',
        size: record?.size || undefined,
        description: record?.description || ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (mode === 'update' && record) {
            setFormData({
                name: record.name,
                code: record.code || '',
                size: record.size || undefined,
                description: record.description || ''
            });
            setErrors({});
        } else {
            setFormData({
                name: '',
                code: '',
                size: undefined,
                description: ''
            });
            setErrors({});
        }
    }, [mode, record, isOpen]);

    const handleInputChange = (field: keyof CreateGrownEggPondInput, value: string | number | undefined) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setErrors(prev => ({
            ...prev,
            [field]: null
        }));
    };

    const validateForm = () => {
        const validationErrors: { [key: string]: string | null } = {};
        const validationResult = grownEggPondService.validateGrownEggPond(formData, mode === 'update');

        if (!validationResult.isValid) {
            validationResult.errors.forEach(error => {
                if (error.includes('Name')) {
                    validationErrors.name = error;
                } else if (error.includes('Size')) {
                    validationErrors.size = error;
                }
            });
        }

        if (formData.size && formData.size <= 0) {
            validationErrors.size = 'Size must be greater than 0';
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            const dataToSave = { ...formData };
            if (mode === 'create') {
                dataToSave.code = generatePondCode(formData.name);
            }
            await onSave(dataToSave);
            onClose();
        } catch (err: any) {
            console.error('Error saving pond:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to save pond',
                customClass: { popup: 'text-xs' }
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 relative">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-primary-600" />
                        <h2 className="text-sm font-semibold text-gray-900">
                            {mode === 'create' ? 'Add Pond' : 'Edit Pond'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                        aria-label="Close modal"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                className={`w-full px-3 py-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                    errors.name ? 'border-red-300' : 'border-gray-200'
                                }`}
                                placeholder="Enter pond name"
                            />
                            {errors.name && (
                                <div className="flex items-start space-x-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg mt-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{errors.name}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Size
                            </label>
                            <input
                                type="number"
                                value={formData.size || ''}
                                onChange={(e) => handleInputChange('size', parseFloat(e.target.value) || undefined)}
                                className={`w-full px-3 py-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                    errors.size ? 'border-red-300' : 'border-gray-200'
                                }`}
                                placeholder="Enter size"
                                min="0"
                                step="0.01"
                            />
                            {errors.size && (
                                <div className="flex items-start space-x-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg mt-2">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{errors.size}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                className="w-full px-3 py-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 border-gray-200"
                                placeholder="Enter description"
                                rows={4}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center space-x-2 px-4 py-2 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-3 h-3" />
                                <span>{mode === 'create' ? 'Create' : 'Update'}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateUpdateGrownEggPondModal;
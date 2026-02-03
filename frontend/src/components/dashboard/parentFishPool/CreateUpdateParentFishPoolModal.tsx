import React, { useState, useEffect } from 'react';
import {
    X,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle,
    Sparkles,
    Tag
} from 'lucide-react';
import { type ParentFishPool, type CreateParentFishPoolInput, type UpdateParentFishPoolInput } from '../../../services/parentFishPoolService';
import Swal from 'sweetalert2';

interface CreateUpdateParentFishPoolModalProps {
    isOpen: boolean;
    pool: ParentFishPool | null; // null for create, existing for update
    onClose: () => void;
    onSave: (data: CreateParentFishPoolInput | UpdateParentFishPoolInput) => Promise<void>;
    mode: 'create' | 'update';
}

const CreateUpdateParentFishPoolModal: React.FC<CreateUpdateParentFishPoolModalProps> = ({
    isOpen,
    pool,
    onClose,
    onSave,
    mode
}) => {
    const [formData, setFormData] = useState<CreateParentFishPoolInput>({
        name: '',
        description: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setShowContent(true), 50);
            if (pool && mode === 'update') {
                setFormData({
                    name: pool.name,
                    description: pool.description || ''
                });
            } else if (mode === 'create') {
                setFormData({
                    name: '',
                    description: ''
                });
            }
            setErrors({});
            setSubmitStatus('idle');
        } else {
            setShowContent(false);
        }
    }, [isOpen, pool, mode]);

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Pool name is required';
        }
        if (formData.name.trim().length < 3) {
            newErrors.name = 'Pool name must be at least 3 characters long';
        }
        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description must not exceed 500 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            setSubmitStatus('idle');
            await onSave(formData);
            setSubmitStatus('success');
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error: any) {
            console.error('Error saving parent fish pool:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const charCount = formData?.description?.length || 0;
    const charLimit = 500;
    const charPercentage = (charCount / charLimit) * 100;

    return (
        <div 
            className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
                showContent ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleClose}
        >
            <div 
                className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
                    showContent ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Gradient Header */}
                <div className={`relative px-6 pt-6 pb-8 ${
                    mode === 'create' 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                }`}>
                    <button
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                            {mode === 'create' ? (
                                <Sparkles className="w-6 h-6 text-white" />
                            ) : (
                                <Tag className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">
                                {mode === 'create' ? 'Create Parent Fish Pool' : 'Edit Parent Fish Pool'}
                            </h3>
                            <p className="text-white/80 text-sm mt-0.5">
                                {mode === 'create' ? 'Add a new parent fish pool to your system' : `Updating "${pool?.name}"`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Pool Name */}
                    <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                            Pool Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all ${
                                    errors.name 
                                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                                        : 'border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white'
                                }`}
                                placeholder="e.g., Breeding Pool A, Nursery Pool"
                                disabled={isSubmitting}
                            />
                            {formData.name && !errors.name && (
                                <CheckCircle className="absolute right-3 top-3.5 w-5 h-5 text-green-500" />
                            )}
                        </div>
                        {errors.name && (
                            <div className="flex items-start space-x-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{errors.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                            Description <span className="text-gray-400 font-normal">(Optional)</span>
                        </label>
                        <textarea
                            id="description"
                            rows={4}
                            value={formData?.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all resize-none ${
                                errors.description 
                                    ? 'border-red-300 focus:border-red-500 bg-red-50' 
                                    : 'border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white'
                            }`}
                            placeholder="Add a brief description of this parent fish pool..."
                            disabled={isSubmitting}
                        />
                        
                        {/* Character Counter */}
                        <div className="flex items-center justify-between">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5 mr-3 overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-300 ${
                                        charPercentage > 90 ? 'bg-red-500' : 
                                        charPercentage > 70 ? 'bg-yellow-500' : 
                                        'bg-blue-500'
                                    }`}
                                    style={{ width: `${Math.min(charPercentage, 100)}%` }}
                                />
                            </div>
                            <span className={`text-xs font-medium ${
                                charPercentage > 90 ? 'text-red-600' : 'text-gray-500'
                            }`}>
                                {charCount}/{charLimit}
                            </span>
                        </div>
                        
                        {errors.description && (
                            <div className="flex items-start space-x-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{errors.description}</span>
                            </div>
                        )}
                    </div>

                    {/* Status Messages */}
                    {submitStatus === 'success' && (
                        <div className="flex items-center space-x-3 px-4 py-3 bg-green-50 border-2 border-green-200 rounded-xl text-sm text-green-800">
                            <CheckCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium">
                                Parent Fish Pool {mode === 'create' ? 'created' : 'updated'} successfully!
                            </span>
                        </div>
                    )}
                    {submitStatus === 'error' && (
                        <div className="flex items-center space-x-3 px-4 py-3 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-800">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium">
                                Failed to save parent fish pool. Please try again.
                            </span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end space-x-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.name.trim()}
                        className={`flex items-center space-x-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                            isSubmitting || !formData.name.trim()
                                ? 'bg-gray-400'
                                : mode === 'create'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/50'
                                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/50'
                        }`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                <span>{mode === 'create' ? 'Create' : 'Update'} Pool</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateUpdateParentFishPoolModal;
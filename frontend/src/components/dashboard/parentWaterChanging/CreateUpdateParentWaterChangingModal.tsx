import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle,
    Sparkles,
    Droplet,
    Search,
    ChevronDown,
    User
} from 'lucide-react';
import { type ParentWaterChanging, type CreateParentWaterChangingInput, type UpdateParentWaterChangingInput } from '../../../services/parentWaterChangingService';
import parentFishPoolService ,{ type ParentFishPool,  } from '../../../services/parentFishPoolService';
import Swal from 'sweetalert2';

interface CreateUpdateParentWaterChangingModalProps {
    isOpen: boolean;
    record: ParentWaterChanging | null;
    onClose: () => void;
    onSave: (data: CreateParentWaterChangingInput | UpdateParentWaterChangingInput) => Promise<void>;
    mode: 'create' | 'update';
}

// Searchable Pool Select Component
const SearchablePoolSelect: React.FC<{
    pools: ParentFishPool[];
    selectedPoolId: string;
    onPoolChange: (poolId: string) => void;
    error?: string | null;
}> = ({ pools, selectedPoolId, onPoolChange, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPools, setFilteredPools] = useState<ParentFishPool[]>(pools);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedPool = pools.find(pool => pool.id === selectedPoolId);

    useEffect(() => {
        setFilteredPools(pools);
    }, [pools]);

    useEffect(() => {
        const filtered = pools.filter(pool => {
            const nameMatch = pool.name.toLowerCase().includes(searchTerm.toLowerCase());
            return nameMatch;
        });
        setFilteredPools(filtered);
    }, [searchTerm, pools]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handlePoolSelect = (pool: ParentFishPool) => {
        onPoolChange(pool.id);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClearSelection = () => {
        onPoolChange('');
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={handleToggle}
                className={`w-full px-3 py-2.5 text-xs border rounded-lg cursor-pointer transition-colors ${
                    error ? 'border-red-300' : 'border-gray-200'
                } ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : 'hover:border-gray-300'} bg-white`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                        {selectedPool ? (
                            <>
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Droplet className="h-3 w-3 text-blue-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-900 font-medium">
                                        {selectedPool.name}
                                    </span>
                                    {selectedPool.description && (
                                        <span className="text-gray-500 text-xs truncate">{selectedPool.description}</span>
                                    )}
                                </div>
                            </>
                        ) : (
                            <span className="text-gray-500">Select a pool</span>
                        )}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Search by pool name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto">
                        {selectedPool && (
                            <div
                                onClick={handleClearSelection}
                                className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                            >
                                <div className="flex items-center gap-2">
                                    <X className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-600">Clear selection</span>
                                </div>
                            </div>
                        )}

                        {filteredPools.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-gray-500">
                                No pools found
                            </div>
                        ) : (
                            filteredPools.map((pool) => (
                                <div
                                    key={pool.id}
                                    onClick={() => handlePoolSelect(pool)}
                                    className={`px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors ${
                                        pool.id === selectedPoolId ? 'bg-blue-50 text-blue-900' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                            pool.id === selectedPoolId 
                                                ? 'bg-blue-200' 
                                                : 'bg-gray-100'
                                        }`}>
                                            <Droplet className={`h-3 w-3 ${
                                                pool.id === selectedPoolId 
                                                    ? 'text-blue-700' 
                                                    : 'text-gray-600'
                                            }`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-xs text-gray-900">
                                                {pool.name}
                                            </div>
                                            {pool.description && (
                                                <div className="text-xs text-gray-500 truncate">{pool.description}</div>
                                            )}
                                        </div>
                                        {pool.id === selectedPoolId && (
                                            <CheckCircle className="h-3 w-3 text-blue-600" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
            {error && (
                <div className="flex items-start space-x-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg mt-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

const CreateUpdateParentWaterChangingModal: React.FC<CreateUpdateParentWaterChangingModalProps> = ({
    isOpen,
    record,
    onClose,
    onSave,
    mode
}) => {
    const [formData, setFormData] = useState<CreateParentWaterChangingInput>({
        parentPoolId: '',
        employeeId: '',
        litersChanged: 0,
        description: '',
        date: new Date()
    });
    const [pools, setPools] = useState<ParentFishPool[]>([]);
    const [poolsLoading, setPoolsLoading] = useState(false);
    const [poolsError, setPoolsError] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [showContent, setShowContent] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setShowContent(true), 50);
            if (record && mode === 'update') {
                setFormData({
                    parentPoolId: record.parentPoolId,
                    employeeId: record.employeeId,
                    litersChanged: record.litersChanged,
                    description: record.description || '',
                    date: new Date(record.date)
                });
            } else if (mode === 'create') {
                setFormData({
                    parentPoolId: '',
                    employeeId: '',
                    litersChanged: 0,
                    description: '',
                    date: new Date()
                });
            }
            setErrors({});
            setSubmitStatus('idle');
            // Fetch pools when modal opens
            fetchPools();
        } else {
            setShowContent(false);
            setPools([]);
            setPoolsError(null);
        }
    }, [isOpen, record, mode]);

    const fetchPools = async () => {
        try {
            setPoolsLoading(true);
            const fetchedPools = await parentFishPoolService.getAllParentFishPools();
            setPools(fetchedPools || []);
            setPoolsError(null);
        } catch (error: any) {
            console.error('Error fetching parent fish pools:', error);
            setPoolsError(error.message || 'Failed to fetch parent fish pools');
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load parent fish pools. Please try again.',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setPoolsLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.parentPoolId.trim()) {
            newErrors.parentPoolId = 'Parent pool is required';
        }
        if (!formData.employeeId.trim()) {
            newErrors.employeeId = 'Employee is required';
        }
        if (formData.litersChanged <= 0) {
            newErrors.litersChanged = 'Liters changed must be greater than 0';
        }
        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description must not exceed 500 characters';
        }
        if (!formData.date) {
            newErrors.date = 'Date is required';
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
            console.error('Error saving water change record:', error);
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
                <div className={`relative px-6 pt-6 pb-8 bg-gradient-to-br from-blue-500 to-blue-600`}>
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
                                <Droplet className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white">
                                {mode === 'create' ? 'Create Water Change Record' : 'Edit Water Change Record'}
                            </h3>
                            <p className="text-white/80 text-sm mt-0.5">
                                {mode === 'create' ? 'Add a new water change record' : `Updating record for "${record?.parentPool?.name || 'Unknown'}"`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Body */}
                <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* Parent Pool ID */}
                    <div className="space-y-2">
                        <label htmlFor="parentPoolId" className="block text-sm font-semibold text-gray-700">
                            Parent Pool <span className="text-red-500">*</span>
                        </label>
                        {poolsLoading ? (
                            <div className="flex items-center space-x-2 text-gray-500 text-xs">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Loading pools...</span>
                            </div>
                        ) : poolsError ? (
                            <div className="flex items-start space-x-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{poolsError}</span>
                            </div>
                        ) : (
                            <SearchablePoolSelect
                                pools={pools}
                                selectedPoolId={formData.parentPoolId}
                                onPoolChange={(poolId) => setFormData({ ...formData, parentPoolId: poolId })}
                                error={errors.parentPoolId}
                            />
                        )}
                    </div>

                    {/* Employee ID */}
                    <div className="space-y-2">
                        <label htmlFor="employeeId" className="block text-sm font-semibold text-gray-700">
                            Employee <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="employeeId"
                            value={formData.employeeId}
                            onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                            className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all ${
                                errors.employeeId 
                                    ? 'border-red-300 focus:border-red-500 bg-red-50' 
                                    : 'border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white'
                            }`}
                            placeholder="Enter employee ID"
                            disabled={isSubmitting}
                        />
                        {errors.employeeId && (
                            <div className="flex items-start space-x-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{errors.employeeId}</span>
                            </div>
                        )}
                    </div>

                    {/* Liters Changed */}
                    <div className="space-y-2">
                        <label htmlFor="litersChanged" className="block text-sm font-semibold text-gray-700">
                            Liters Changed <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            id="litersChanged"
                            value={formData.litersChanged}
                            onChange={(e) => setFormData({ ...formData, litersChanged: parseFloat(e.target.value) || 0 })}
                            className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all ${
                                errors.litersChanged 
                                    ? 'border-red-300 focus:border-red-500 bg-red-50' 
                                    : 'border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white'
                            }`}
                            placeholder="Enter liters changed"
                            disabled={isSubmitting}
                        />
                        {errors.litersChanged && (
                            <div className="flex items-start space-x-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{errors.litersChanged}</span>
                            </div>
                        )}
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <label htmlFor="date" className="block text-sm font-semibold text-gray-700">
                            Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="date"
                            value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''}
                            onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                            className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all ${
                                errors.date 
                                    ? 'border-red-300 focus:border-red-500 bg-red-50' 
                                    : 'border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white'
                            }`}
                            disabled={isSubmitting}
                        />
                        {errors.date && (
                            <div className="flex items-start space-x-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span>{errors.date}</span>
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
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className={`w-full px-4 py-3 text-sm border-2 rounded-xl focus:outline-none transition-all resize-none ${
                                errors.description 
                                    ? 'border-red-300 focus:border-red-500 bg-red-50' 
                                    : 'border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white'
                            }`}
                            placeholder="Add a brief description of this water change..."
                            disabled={isSubmitting}
                        />
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
                                Water change record {mode === 'create' ? 'created' : 'updated'} successfully!
                            </span>
                        </div>
                    )}
                    {submitStatus === 'error' && (
                        <div className="flex items-center space-x-3 px-4 py-3 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-800">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="font-medium">
                                Failed to save water change record. Please try again.
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
                        disabled={isSubmitting || !formData.parentPoolId.trim() || !formData.employeeId.trim() || formData.litersChanged <= 0}
                        className={`flex items-center space-x-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                            isSubmitting || !formData.parentPoolId.trim() || !formData.employeeId.trim() || formData.litersChanged <= 0
                                ? 'bg-gray-400'
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
                                <span>{mode === 'create' ? 'Create' : 'Update'} Record</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateUpdateParentWaterChangingModal;
import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle,
    Sparkles,
    Egg,
    Search,
    ChevronDown,
    Check
} from 'lucide-react';
import eggFishFeedingService, { type EggFishFeeding, type CreateEggFishFeedingInput, type UpdateEggFishFeedingInput,  } from '../../../services/eggFishFeedingService';
import parentEggMigrationService, { type ParentEggMigration,  } from '../../../services/parentEggMigrationService';
import feedstockCategoryService, { type FeedstockCategory,  } from '../../../services/feedstockService';
import Swal from 'sweetalert2';

interface CreateUpdateEggFishFeedingModalProps {
    isOpen: boolean;
    record: EggFishFeeding | null;
    onClose: () => void;
    onSave: (data: CreateEggFishFeedingInput | UpdateEggFishFeedingInput) => Promise<void>;
    mode: 'create' | 'update';
}

// Searchable Egg Migration Select Component
const SearchableEggMigrationSelect: React.FC<{
    migrations: ParentEggMigration[];
    selectedMigrationId: string;
    onMigrationChange: (migrationId: string) => void;
    error?: string | null;
}> = ({ migrations, selectedMigrationId, onMigrationChange, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredMigrations, setFilteredMigrations] = useState<ParentEggMigration[]>(migrations);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedMigration = migrations.find(m => m.id === selectedMigrationId);

    useEffect(() => {
        setFilteredMigrations(migrations);
    }, [migrations]);

    useEffect(() => {
        const filtered = migrations.filter(m => {
            const descMatch = m.description?.toLowerCase().includes(searchTerm.toLowerCase());
            const poolMatch = m.parentPool?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            return descMatch || poolMatch;
        });
        setFilteredMigrations(filtered);
    }, [searchTerm, migrations]);

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

    const handleMigrationSelect = (migration: ParentEggMigration) => {
        onMigrationChange(migration.id);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClearSelection = () => {
        onMigrationChange('');
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={handleToggle}
                className={`w-full px-3 py-2.5 text-xs border rounded-lg cursor-pointer transition-colors ${
                    error ? 'border-red-300' : 'border-gray-200'
                } ${isOpen ? 'ring-2 ring-primary-500 border-transparent' : 'hover:border-gray-300'} bg-white`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                        {selectedMigration ? (
                            <>
                                <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                                    <Egg className="h-3 w-3 text-primary-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-900 font-medium">
                                        {selectedMigration.description || `Migration ${selectedMigration.id.substring(0, 8)}`}
                                    </span>
                                    {selectedMigration.parentPool?.name && (
                                        <span className="text-gray-500 text-xs truncate">{selectedMigration.parentPool.name}</span>
                                    )}
                                </div>
                            </>
                        ) : (
                            <span className="text-gray-500">Select egg migration</span>
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
                                placeholder="Search by description or pool..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {selectedMigration && (
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
                        {filteredMigrations.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-gray-500">
                                No egg migrations found
                            </div>
                        ) : (
                            filteredMigrations.map((migration) => (
                                <div
                                    key={migration.id}
                                    onClick={() => handleMigrationSelect(migration)}
                                    className={`px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors ${
                                        migration.id === selectedMigrationId ? 'bg-primary-50 text-primary-900' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                            migration.id === selectedMigrationId 
                                                ? 'bg-primary-200' 
                                                : 'bg-gray-100'
                                        }`}>
                                            <Egg className={`h-3 w-3 ${
                                                migration.id === selectedMigrationId 
                                                    ? 'text-primary-700' 
                                                    : 'text-gray-600'
                                            }`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-xs text-gray-900">
                                                {migration.description || `Migration ${migration.id.substring(0, 8)}`}
                                            </div>
                                            {migration.parentPool?.name && (
                                                <div className="text-xs text-gray-500 truncate">{migration.parentPool.name}</div>
                                            )}
                                        </div>
                                        {migration.id === selectedMigrationId && (
                                            <Check className="h-3 w-3 text-primary-600" />
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

// Searchable Feed Select Component
const SearchableFeedSelect: React.FC<{
    feeds: FeedstockCategory[];
    selectedFeedId: string;
    onFeedChange: (feedId: string) => void;
    error?: string | null;
}> = ({ feeds, selectedFeedId, onFeedChange, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredFeeds, setFilteredFeeds] = useState<FeedstockCategory[]>(feeds);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedFeed = feeds.find(f => f.id === selectedFeedId);

    useEffect(() => {
        setFilteredFeeds(feeds);
    }, [feeds]);

    useEffect(() => {
        const filtered = feeds.filter(f => {
            const nameMatch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
            const descMatch = f.description?.toLowerCase().includes(searchTerm.toLowerCase());
            return nameMatch || descMatch;
        });
        setFilteredFeeds(filtered);
    }, [searchTerm, feeds]);

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

    const handleFeedSelect = (feed: FeedstockCategory) => {
        onFeedChange(feed.id);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleClearSelection = () => {
        onFeedChange('');
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                onClick={handleToggle}
                className={`w-full px-3 py-2.5 text-xs border rounded-lg cursor-pointer transition-colors ${
                    error ? 'border-red-300' : 'border-gray-200'
                } ${isOpen ? 'ring-2 ring-primary-500 border-transparent' : 'hover:border-gray-300'} bg-white`}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                        {selectedFeed ? (
                            <>
                                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                    <Sparkles className="h-3 w-3 text-green-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-gray-900 font-medium">{selectedFeed.name}</span>
                                    {selectedFeed.description && (
                                        <span className="text-gray-500 text-xs truncate">{selectedFeed.description}</span>
                                    )}
                                </div>
                            </>
                        ) : (
                            <span className="text-gray-500">Select feed</span>
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
                                placeholder="Search by feed name or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {selectedFeed && (
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
                        {filteredFeeds.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-gray-500">
                                No feeds found
                            </div>
                        ) : (
                            filteredFeeds.map((feed) => (
                                <div
                                    key={feed.id}
                                    onClick={() => handleFeedSelect(feed)}
                                    className={`px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors ${
                                        feed.id === selectedFeedId ? 'bg-primary-50 text-primary-900' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                            feed.id === selectedFeedId ? 'bg-primary-200' : 'bg-gray-100'
                                        }`}>
                                            <Sparkles className={`h-3 w-3 ${
                                                feed.id === selectedFeedId ? 'text-primary-700' : 'text-gray-600'
                                            }`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-xs text-gray-900">{feed.name}</div>
                                            {feed.description && (
                                                <div className="text-xs text-gray-500 truncate">{feed.description}</div>
                                            )}
                                        </div>
                                        {feed.id === selectedFeedId && (
                                            <Check className="h-3 w-3 text-primary-600" />
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

const CreateUpdateEggFishFeedingModal: React.FC<CreateUpdateEggFishFeedingModalProps> = ({
    isOpen,
    record,
    onClose,
    onSave,
    mode
}) => {
    const [formData, setFormData] = useState<CreateEggFishFeedingInput | UpdateEggFishFeedingInput>({
        parentEggMigrationId: record?.parentEggMigrationId || '',
        feedId: record?.feedId || '',
        quantity: record?.quantity || 0
    });
    const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [migrations, setMigrations] = useState<ParentEggMigration[]>([]);
    const [feeds, setFeeds] = useState<FeedstockCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [migrationData, feedData] = await Promise.all([
                    parentEggMigrationService.getAllParentEggMigrations(),
                    feedstockCategoryService.getAllFeedstockCategories()
                ]);
                setMigrations(migrationData || []);
                setFeeds(feedData || []);
                setFetchError(null);
            } catch (err: any) {
                console.error('Error fetching data:', err);
                setFetchError(err.message || 'Failed to load egg migrations and feeds');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [isOpen]);

    useEffect(() => {
        if (mode === 'update' && record) {
            setFormData({
                parentEggMigrationId: record.parentEggMigrationId,
                feedId: record.feedId,
                quantity: record.quantity
            });
            setErrors({});
        } else {
            setFormData({
                parentEggMigrationId: '',
                feedId: '',
                quantity: 0
            });
            setErrors({});
        }
    }, [mode, record, isOpen]);

    const handleInputChange = (field: keyof CreateEggFishFeedingInput, value: string | number) => {
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
        const dataToValidate = { ...formData, employeeId: '' }; // Add dummy employeeId to satisfy validateFeedingData
        const validationResult = eggFishFeedingService.validateFeedingData(dataToValidate as CreateEggFishFeedingInput);

        if (!validationResult.isValid) {
            validationResult.errors.forEach(error => {
                if (error.includes('Parent Egg Migration')) {
                    validationErrors.parentEggMigrationId = error;
                } else if (error.includes('Feed ID')) {
                    validationErrors.feedId = error;
                } else if (error.includes('Quantity')) {
                    validationErrors.quantity = error;
                }
            });
        }

        // Custom validation for quantity
        if (formData.quantity <= 0) {
            validationErrors.quantity = 'Quantity must be greater than 0';
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setIsSubmitting(true);
            await onSave(formData);
            onClose();
        } catch (err: any) {
            console.error('Error saving feeding record:', err);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message || 'Failed to save feeding record',
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
                            {mode === 'create' ? 'Add Feeding Record' : 'Edit Feeding Record'}
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
                    {fetchError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2 text-red-600 text-xs">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{fetchError}</span>
                        </div>
                    )}

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex items-center space-x-2 text-gray-500">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-xs">Loading data...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Egg Migration
                                </label>
                                <SearchableEggMigrationSelect
                                    migrations={migrations}
                                    selectedMigrationId={formData.parentEggMigrationId}
                                    onMigrationChange={(id) => handleInputChange('parentEggMigrationId', id)}
                                    error={errors.parentEggMigrationId}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Feed
                                </label>
                                <SearchableFeedSelect
                                    feeds={feeds}
                                    selectedFeedId={formData.feedId}
                                    onFeedChange={(id) => handleInputChange('feedId', id)}
                                    error={errors.feedId}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => handleInputChange('quantity', parseFloat(e.target.value) || 0)}
                                    className={`w-full px-3 py-2.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                        errors.quantity ? 'border-red-300' : 'border-gray-200'
                                    }`}
                                    placeholder="Enter quantity"
                                    min="0"
                                    step="0.01"
                                />
                                {errors.quantity && (
                                    <div className="flex items-start space-x-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg mt-2">
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{errors.quantity}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
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
                        disabled={isSubmitting || isLoading}
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

export default CreateUpdateEggFishFeedingModal;
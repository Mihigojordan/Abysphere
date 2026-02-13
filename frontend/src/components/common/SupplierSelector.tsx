import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, Loader2 } from 'lucide-react';
import supplierService, { Supplier } from '../../services/supplierService';

interface SupplierSelectorProps {
    value: string;
    onChange: (supplierId: string, supplier: Supplier) => void;
    error?: string;
    disabled?: boolean;
}

const SupplierSelector: React.FC<SupplierSelectorProps> = ({
    value,
    onChange,
    error,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial load
    useEffect(() => {
        loadSuppliers();
    }, []);

    // Filter suppliers when search term changes
    useEffect(() => {
        if (!searchTerm) {
            setFilteredSuppliers(suppliers);
        } else {
            const lower = searchTerm.toLowerCase();
            setFilteredSuppliers(
                suppliers.filter(
                    (s) =>
                        s.name.toLowerCase().includes(lower) ||
                        s.email?.toLowerCase().includes(lower) ||
                        (s.code && s.code.toLowerCase().includes(lower))
                )
            );
        }
    }, [searchTerm, suppliers]);

    // Sync selected supplier when value changes
    useEffect(() => {
        if (value && suppliers.length > 0) {
            const found = suppliers.find((s) => String(s.id) === value);
            if (found) setSelectedSupplier(found);
        }
    }, [value, suppliers]);

    const loadSuppliers = async () => {
        setLoading(true);
        try {
            const data = await supplierService.getAllSuppliers();
            setSuppliers(data || []);
            setFilteredSuppliers(data || []);
        } catch (err) {
            console.error('Failed to load suppliers', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        onChange(String(supplier.id), supplier);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
                Supplier <span className="text-red-500">*</span>
            </label>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full px-3 py-2 bg-white border rounded-lg flex items-center justify-between cursor-pointer transition-colors ${error
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-200 hover:border-gray-300'
                    } ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
            >
                <span className={`text-sm ${selectedSupplier ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedSupplier ? selectedSupplier.name : 'Select a supplier...'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg max-h-60 overflow-hidden flex flex-col">
                    <div className="p-2 border-b border-gray-50">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search suppliers..."
                                value={searchTerm}
                                onChange={handleSearch}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-4 text-gray-400">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                <span className="text-xs">Loading...</span>
                            </div>
                        ) : suppliers.length === 0 ? (
                            <div className="py-4 text-center text-xs text-gray-400">
                                No suppliers found
                            </div>
                        ) : (
                            suppliers.map((supplier) => (
                                <div
                                    key={supplier.id}
                                    onClick={() => handleSelect(supplier)}
                                    className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer text-sm ${value === supplier.id
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">{supplier.name}</span>
                                        {supplier.code && (
                                            <span className="text-[10px] text-gray-400">{supplier.code}</span>
                                        )}
                                    </div>
                                    {value === supplier.id && <Check className="w-4 h-4" />}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierSelector;

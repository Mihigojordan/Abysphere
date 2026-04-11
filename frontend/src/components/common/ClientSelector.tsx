import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, Loader2, Plus, X } from 'lucide-react';
import clientService from '../../services/clientService';
import type { Client } from '../../types/model';

interface ClientSelectorProps {
    value: string;
    onChange: (clientId: string, fullName: string, email: string, phone: string) => void;
    error?: string;
    disabled?: boolean;
}

interface CreateForm {
    firstname: string;
    lastname: string;
    email: string;
}

const ClientSelector: React.FC<ClientSelectorProps> = ({
    value,
    onChange,
    error,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [clients, setClients] = useState<Client[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createForm, setCreateForm] = useState<CreateForm>({ firstname: '', lastname: '', email: '' });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadClients();
    }, []);

    useEffect(() => {
        if (!searchTerm) {
            setFilteredClients(clients);
            setShowCreateForm(false);
        } else {
            const lower = searchTerm.toLowerCase();
            const filtered = clients.filter((c) => {
                const fullName = `${c.firstname} ${c.lastname}`.toLowerCase();
                return fullName.includes(lower) || c.email?.toLowerCase().includes(lower);
            });
            setFilteredClients(filtered);
        }
    }, [searchTerm, clients]);

    useEffect(() => {
        if (value && clients.length > 0) {
            const found = clients.find((c) => c.id === value);
            if (found) setSelectedClient(found);
        }
    }, [value, clients]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setShowCreateForm(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadClients = async () => {
        setLoading(true);
        try {
            const data = await clientService.getAllClients();
            setClients(data || []);
            setFilteredClients(data || []);
        } catch (err) {
            console.error('Failed to load clients', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (client: Client) => {
        setSelectedClient(client);
        onChange(
            client.id,
            `${client.firstname} ${client.lastname}`,
            client.email || '',
            client.phone || '',
        );
        setIsOpen(false);
        setSearchTerm('');
        setShowCreateForm(false);
    };

    const handleCreate = async () => {
        if (!createForm.firstname.trim() || !createForm.lastname.trim()) return;
        setCreating(true);
        try {
            const newClient = await clientService.createClient({
                firstname: createForm.firstname.trim(),
                lastname: createForm.lastname.trim(),
                email: createForm.email.trim() || undefined as any,
                status: 'ACTIVE',
            });
            await loadClients();
            handleSelect(newClient);
            setCreateForm({ firstname: '', lastname: '', email: '' });
        } catch (err) {
            console.error('Failed to create client', err);
        } finally {
            setCreating(false);
        }
    };

    const openCreate = () => {
        // Pre-fill name from search term if possible
        const parts = searchTerm.trim().split(' ');
        setCreateForm({
            firstname: parts[0] || '',
            lastname: parts.slice(1).join(' ') || '',
            email: '',
        });
        setShowCreateForm(true);
    };

    const fullName = selectedClient ? `${selectedClient.firstname} ${selectedClient.lastname}` : '';

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
                Client <span className="text-red-500">*</span>
            </label>

            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full px-3 py-2 bg-white border rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                    error ? 'border-red-300' : 'border-gray-200 hover:border-gray-300'
                } ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-75' : ''}`}
            >
                <div className="flex flex-col min-w-0">
                    <span className={`text-sm truncate ${selectedClient ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                        {fullName || 'Select or create a client...'}
                    </span>
                    {selectedClient?.email && (
                        <span className="text-[10px] text-gray-400 truncate">{selectedClient.email}</span>
                    )}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
            </div>

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

            {isOpen && !disabled && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-lg shadow-lg overflow-hidden flex flex-col" style={{ maxHeight: '320px' }}>

                    {/* Search bar */}
                    <div className="p-2 border-b border-gray-50 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search clients by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-100 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Results / create form */}
                    <div className="overflow-y-auto flex-1 p-1">
                        {loading ? (
                            <div className="flex items-center justify-center py-4 text-gray-400">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                <span className="text-xs">Loading...</span>
                            </div>
                        ) : showCreateForm ? (
                            <div className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-gray-700">New Client</span>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateForm(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="First name *"
                                            value={createForm.firstname}
                                            onChange={(e) => setCreateForm(f => ({ ...f, firstname: e.target.value }))}
                                            className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Last name *"
                                            value={createForm.lastname}
                                            onChange={(e) => setCreateForm(f => ({ ...f, lastname: e.target.value }))}
                                            className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                                        />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Email (optional)"
                                        value={createForm.email}
                                        onChange={(e) => setCreateForm(f => ({ ...f, email: e.target.value }))}
                                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCreate}
                                        disabled={creating || !createForm.firstname.trim() || !createForm.lastname.trim()}
                                        className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50"
                                    >
                                        {creating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                                        {creating ? 'Creating...' : 'Create Client'}
                                    </button>
                                </div>
                            </div>
                        ) : filteredClients.length === 0 ? (
                            <div className="py-3 px-2 text-center">
                                <p className="text-xs text-gray-400 mb-2">
                                    {searchTerm ? `No client matching "${searchTerm}"` : 'No clients found'}
                                </p>
                                <button
                                    type="button"
                                    onClick={openCreate}
                                    className="flex items-center gap-1.5 mx-auto px-3 py-1.5 text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200 rounded-md hover:bg-primary-100 transition-colors"
                                >
                                    <Plus className="w-3 h-3" />
                                    Create new client
                                </button>
                            </div>
                        ) : (
                            <>
                                {filteredClients.map((client) => (
                                    <div
                                        key={client.id}
                                        onClick={() => handleSelect(client)}
                                        className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer ${
                                            value === client.id
                                                ? 'bg-primary-50 text-primary-700'
                                                : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                    >
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-medium truncate">
                                                {client.firstname} {client.lastname}
                                            </span>
                                            {client.email && (
                                                <span className="text-[10px] text-gray-400 truncate">{client.email}</span>
                                            )}
                                        </div>
                                        {value === client.id && <Check className="w-4 h-4 shrink-0 ml-2" />}
                                    </div>
                                ))}
                                {/* Always show create option at the bottom of list */}
                                <div className="border-t border-gray-50 mt-1 pt-1">
                                    <button
                                        type="button"
                                        onClick={openCreate}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-primary-600 hover:bg-primary-50 rounded-md transition-colors"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Create new client
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientSelector;

import { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Download,
    Grid3X3,
    List,
    Users,
    UserCheck,
    UserX,
    UserPlus,
    MoreHorizontal,
    MessageSquare,
    Phone,
    Mail,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    X,
    Filter,
    RefreshCw,
    Eye,
    Calendar,
    ChevronDown
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import clientService, { type CreateClientInput, type UpdateClientInput } from '../../services/clientService';
import AddClientModal from '../../components/dashboard/client/AddClientModal';
import EditClientModal from '../../components/dashboard/client/EditClientModal';
import DeleteClientModal from '../../components/dashboard/client/DeleteClientModal';
import { API_URL } from '../../api/api';
import { useSocketEvent } from '../../context/SocketContext';
import { useLanguage } from '../../context/LanguageContext';

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

interface OperationStatus {
    type: 'success' | 'error' | 'info';
    message: string;
}

type ViewMode = 'table' | 'grid' | 'list';

const ClientManagement = () => {
    const { t } = useLanguage();
    const [clients, setClients] = useState<Client[]>([]);
    const [allClients, setAllClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState<keyof Client>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [rowsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
    const [operationLoading, setOperationLoading] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const pdfContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                setLoading(true);
                const data = await clientService.getAllClients();
                setAllClients(data || []);
                setError(null);
            } catch (err: any) {
                const errorMessage = err.message || t('client.messages.loadError');
                console.error('Error fetching clients:', err);
                setError(errorMessage);
                showOperationStatus('error', errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchClients();
    }, []);

    useEffect(() => {
        handleFilterAndSort();
    }, [searchTerm, statusFilter, sortBy, sortOrder, allClients]);

    useSocketEvent('clientCreated', (clientData: Client) => {
        console.log('Client created via WebSocket:', clientData);
        setAllClients((prevClients) => [...prevClients, clientData]);
        showOperationStatus('success', t('client.messages.createSuccess'));
    });

    useSocketEvent('clientUpdated', (clientData: Client) => {
        console.log('Client updated via WebSocket:', clientData);
        setAllClients((prevClients) =>
            prevClients.map((c) => (c.id === clientData.id ? clientData : c))
        );
        showOperationStatus('success', t('client.messages.updateSuccess'));
    });

    useSocketEvent('clientDeleted', ({ id }: { id: string }) => {
        console.log('Client deleted via WebSocket:', id);
        setAllClients((prevClients) => prevClients.filter((c) => c.id !== id));
        showOperationStatus('success', t('client.messages.deleteSuccess'));
    });

    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-primary-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
            'bg-yellow-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const getInitials = (firstname: string, lastname: string) => {
        return `${firstname.charAt(0)}${lastname.charAt(0)}`.toUpperCase();
    };

    const showOperationStatus = (type: OperationStatus['type'], message: string, duration: number = 3000) => {
        setOperationStatus({ type, message });
        setTimeout(() => setOperationStatus(null), duration);
    };

    const handleFilterAndSort = () => {
        let filtered = [...allClients];

        if (searchTerm.trim()) {
            filtered = filtered.filter(
                (client) =>
                    `${client.firstname} ${client.lastname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    client.address?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((client) => client.status === statusFilter.toUpperCase());
        }

        filtered.sort((a, b) => {
            let aValue = a[sortBy] ?? '';
            let bValue = b[sortBy] ?? '';
            if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
                const dateA = new Date(aValue as string).getTime();
                const dateB = new Date(bValue as string).getTime();
                return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
            } else {
                const strA = aValue.toString().toLowerCase();
                const strB = bValue.toString().toLowerCase();
                return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
            }
        });

        setClients(filtered);
        setCurrentPage(1);
    };

    const handleExportPDF = async () => {
        try {
            setOperationLoading(true);
            const date = new Date().toLocaleDateString('en-CA').replace(/\//g, '');
            const filename = `clients_export_${date}.pdf`;

            const tableRows = filteredClients.map((client, index) => {
                const profileImgUrl = client.profileImage
                    ? `${API_URL}${client.profileImage}`
                    : '';
                return `
                    <tr>
                        <td style="font-size:10px;">${index + 1}</td>
                        <td style="font-size:10px;">
                            ${profileImgUrl ? `<img src="${profileImgUrl}" style="width:25px;height:25px;border-radius:50%;vertical-align:middle;margin-right:5px;" />` : ''}
                            ${client.firstname} ${client.lastname}
                        </td>
                        <td style="font-size:10px;">${client.email}</td>
                        <td style="font-size:10px;">${client.phone || 'N/A'}</td>
                        <td style="font-size:10px;">${client.address || 'N/A'}</td>
                        <td style="font-size:10px; color: ${client.status === 'ACTIVE' ? 'green' : 'red'};">
                            ${client.status}
                        </td>
                    </tr>
                `;
            }).join('');

            const htmlContent = `
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 10px; font-size: 10px; }
                        h1 { font-size: 14px; margin-bottom: 5px; }
                        p { font-size: 9px; margin-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; font-size: 10px; }
                        th, td { border: 1px solid #ddd; padding: 4px; text-align: left; vertical-align: middle; }
                        th { background-color: #2563eb; color: white; font-weight: bold; font-size: 10px; }
                        tr:nth-child(even) { background-color: #f2f2f2; }
                        img { display: inline-block; }
                    </style>
                </head>
                <body>
                    <h1>Client List</h1>
                    <p>Exported on: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' })}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Client Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                </body>
                </html>
            `;

            const opt = {
                margin: 0.5,
                filename,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
            };

            await html2pdf().from(htmlContent).set(opt).save();
            showOperationStatus('success', t('client.messages.pdfExportSuccess'));
        } catch (err: any) {
            console.error('Error generating PDF:', err);
            showOperationStatus('error', t('client.messages.pdfExportError'));
        } finally {
            setOperationLoading(false);
        }
    };

    const handleAddClient = () => {
        setSelectedClient(null);
        setIsAddModalOpen(true);
    };

    const handleEditClient = async (id: string) => {
        try {
            setOperationLoading(true);
            const client = await clientService.getClientById(id);
            if (client) {
                setSelectedClient(client);
                setIsEditModalOpen(true);
            } else {
                showOperationStatus('error', t('client.messages.notFound'));
            }
        } catch (err: any) {
            console.error('Error fetching client for edit:', err);
            showOperationStatus('error', err.message || t('client.messages.loadError'));
        } finally {
            setOperationLoading(false);
        }
    };

    const handleViewClient = (client: Client) => {
        setSelectedClient(client);
        setIsViewModalOpen(true);
    };

    const handleDeleteClient = (client: Client) => {
        setSelectedClient(client);
        setIsDeleteModalOpen(true);
    };

    const handleSaveClient = async (data: CreateClientInput | UpdateClientInput) => {
        try {
            setOperationLoading(true);
            if (isAddModalOpen) {
                const newClient = await clientService.createClient(data as CreateClientInput);
                if (!newClient) {
                    throw new Error('No client data returned from createClient');
                }
                showOperationStatus('success', t('client.messages.createSuccess'));
                setIsAddModalOpen(false);
            } else {
                if (!selectedClient) {
                    throw new Error('No client selected for update');
                }
                await clientService.updateClient(selectedClient.id, data as UpdateClientInput);
                showOperationStatus('success', t('client.messages.updateSuccess'));
                setIsEditModalOpen(false);
            }
        } catch (err: any) {
            console.error('Error in handleSaveClient:', err);
            showOperationStatus('error', err.message || 'Failed to save client');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleDelete = async (client: Client) => {
        try {
            setOperationLoading(true);
            await clientService.deleteClient(client.id);
            showOperationStatus('success', t('client.messages.deleteSuccess'));
        } catch (err: any) {
            console.error('Error deleting client:', err);
            showOperationStatus('error', err.message || 'Failed to delete client');
        } finally {
            setOperationLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedClient(null);
        }
    };

    const formatDate = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const filteredClients = clients;
    const totalPages = Math.ceil(filteredClients.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentClients = filteredClients.slice(startIndex, endIndex);

    // Summary statistics
    const totalClients = allClients.length;
    const activeClients = allClients.filter((c) => c.status === 'ACTIVE').length;
    const inactiveClients = allClients.filter((c) => c.status === 'INACTIVE').length;
    const newClients = allClients.filter((c) => {
        const createdAt = new Date(c.createdAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return createdAt >= thirtyDaysAgo;
    }).length;

    const ClientCard = ({ client }: { client: Client }) => {
        const [isDropdownOpen, setIsDropdownOpen] = useState(false);
        const [imageError, setImageError] = useState(false);
        const dropdownRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                    setIsDropdownOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
            };
        }, []);

        return (
            <div className="bg-theme-bg-primary rounded border border-theme-border p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <MoreHorizontal className="w-3 h-3 text-gray-400" />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 top-6 bg-theme-bg-primary shadow-lg rounded border border-theme-border py-1 z-10 min-w-[120px]">
                                <button
                                    onClick={() => {
                                        handleViewClient(client);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center px-2 py-1.5 text-[10px] text-theme-text-primary hover:bg-theme-bg-tertiary w-full transition-colors"
                                >
                                    <Eye className="w-3 h-3 mr-1.5 text-primary-500" />
                                    {t('client.actions.view')}
                                </button>
                                <button
                                    onClick={() => {
                                        handleEditClient(client.id);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center px-2 py-1.5 text-[10px] text-theme-text-primary hover:bg-theme-bg-tertiary w-full transition-colors"
                                >
                                    <Edit className="w-3 h-3 mr-1.5 text-amber-500" />
                                    {t('client.actions.edit')}
                                </button>
                                <button
                                    onClick={() => {
                                        handleDeleteClient(client);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center px-2 py-1.5 text-[10px] text-theme-text-primary hover:bg-theme-bg-tertiary w-full transition-colors"
                                >
                                    <Trash2 className="w-3 h-3 mr-1.5 text-red-500" />
                                    {t('client.actions.delete')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center relative overflow-hidden">
                        {client.profileImage && !imageError ? (
                            <img
                                src={`${API_URL}${client.profileImage}`}
                                alt={`${client.firstname} ${client.lastname}`}
                                className="w-full h-full object-cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className={`w-full h-full ${getAvatarColor(client.firstname)} flex items-center justify-center text-white text-xs font-medium`}>
                                {getInitials(client.firstname, client.lastname)}
                            </div>
                        )}
                        {client.status === 'ACTIVE' && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-white"></div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-theme-text-primary text-xs truncate">
                            {client.firstname} {client.lastname}
                        </div>
                        <div className="text-theme-text-secondary text-[10px] truncate">{client.email}</div>
                    </div>
                </div>
                <div className="space-y-1 mb-2">
                    <div className="flex items-center space-x-1 text-[10px] text-theme-text-secondary">
                        <Phone className="w-3 h-3" />
                        <span>{client.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-[10px] text-theme-text-secondary">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(client.createdAt)}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${client.status === 'ACTIVE' ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
                        }`}>
                        • {client.status}
                    </span>
                    <div className="flex items-center space-x-1">
                        <button className="p-1 text-theme-text-secondary hover:text-primary-500 transition-colors" title={t('client.actions.message')}>
                            <MessageSquare className="w-3 h-3" />
                        </button>
                        <button className="p-1 text-theme-text-secondary hover:text-primary-500 transition-colors" title={t('client.actions.call')}>
                            <Phone className="w-3 h-3" />
                        </button>
                        <button className="p-1 text-theme-text-secondary hover:text-primary-500 transition-colors" title={t('client.actions.email')}>
                            <Mail className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderTableView = () => (
        <div className="bg-theme-bg-primary rounded border border-theme-border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead className="bg-theme-bg-tertiary border-b border-theme-border">
                        <tr>
                            <th className="text-left py-2 px-2 text-theme-text-secondary font-medium">#</th>
                            <th
                                className="text-left py-2 px-2 text-theme-text-secondary font-medium cursor-pointer hover:bg-theme-bg-tertiary/50"
                                onClick={() => {
                                    setSortBy('firstname');
                                    setSortOrder(sortBy === 'firstname' && sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>{t('client.table.name')}</span>
                                    <ChevronDown className={`w-3 h-3 ${sortBy === 'firstname' ? 'text-primary-600' : 'text-theme-text-secondary'}`} />
                                </div>
                            </th>
                            <th className="text-left py-2 px-2 text-theme-text-secondary font-medium hidden sm:table-cell">{t('client.table.email')}</th>
                            <th className="text-left py-2 px-2 text-theme-text-secondary font-medium hidden sm:table-cell">{t('client.table.phone')}</th>
                            <th className="text-left py-2 px-2 text-theme-text-secondary font-medium hidden md:table-cell">{t('client.table.address')}</th>
                            <th className="text-left py-2 px-2 text-theme-text-secondary font-medium">{t('client.table.status')}</th>
                            <th
                                className="text-left py-2 px-2 text-theme-text-secondary font-medium cursor-pointer hover:bg-theme-bg-tertiary/50 hidden lg:table-cell"
                                onClick={() => {
                                    setSortBy('createdAt');
                                    setSortOrder(sortBy === 'createdAt' && sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>{t('client.table.created')}</span>
                                    <ChevronDown className={`w-3 h-3 ${sortBy === 'createdAt' ? 'text-primary-600' : 'text-theme-text-secondary'}`} />
                                </div>
                            </th>
                            <th className="text-right py-2 px-2 text-theme-text-secondary font-medium">{t('client.table.actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-theme-border">
                        {currentClients.map((client, index) => (
                            <tr key={client.id} className="hover:bg-theme-bg-tertiary/30 transition-colors">
                                <td className="py-2 px-2 text-theme-text-secondary">{startIndex + index + 1}</td>
                                <td className="py-2 px-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center relative overflow-hidden">
                                            {client.profileImage && !client.profileImage.includes('undefined') ? (
                                                <img
                                                    src={`${API_URL}${client.profileImage}`}
                                                    alt={`${client.firstname} ${client.lastname}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).parentElement?.querySelector('.initials')?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`w-full h-full ${getAvatarColor(client.firstname)} flex items-center justify-center text-white text-xs font-medium ${client.profileImage && !client.profileImage.includes('undefined') ? 'hidden initials' : ''}`}>
                                                {getInitials(client.firstname, client.lastname)}
                                            </div>
                                            {client.status === 'ACTIVE' && (
                                                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-theme-border"></div>
                                            )}
                                        </div>
                                        <span className="font-medium text-theme-text-primary text-xs">
                                            {client.firstname} {client.lastname}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-2 px-2 text-theme-text-secondary hidden sm:table-cell">{client.email}</td>
                                <td className="py-2 px-2 text-theme-text-secondary hidden sm:table-cell">{client.phone || 'N/A'}</td>
                                <td className="py-2 px-2 text-theme-text-secondary hidden md:table-cell">{client.address || 'N/A'}</td>
                                <td className="py-2 px-2">
                                    <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${client.status === 'ACTIVE' ? 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20'
                                        }`}>
                                        • {client.status}
                                    </span>
                                </td>
                                <td className="py-2 px-2 text-theme-text-secondary hidden lg:table-cell">{formatDate(client.createdAt)}</td>
                                <td className="py-2 px-2">
                                    <div className="flex items-center justify-end space-x-1">
                                        <button
                                            onClick={() => handleViewClient(client)}
                                            className="text-theme-text-secondary hover:text-primary-600 p-1"
                                            title={t('client.actions.view')}
                                        >
                                            <Eye className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleEditClient(client.id)}
                                            disabled={operationLoading}
                                            className="text-theme-text-secondary hover:text-amber-600 p-1 disabled:opacity-50"
                                            title={t('client.actions.edit')}
                                        >
                                            <Edit className="w-3.5 h-3.5 text-amber-500" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClient(client)}
                                            disabled={operationLoading}
                                            className="text-theme-text-secondary hover:text-red-600 p-1 disabled:opacity-50"
                                            title={t('client.actions.delete')}
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderGridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {currentClients.map((client) => (
                <ClientCard key={client.id} client={client} />
            ))}
        </div>
    );

    const renderListView = () => (
        <div className="bg-theme-bg-primary rounded border border-theme-border divide-y divide-theme-border overflow-hidden">
            {currentClients.map((client) => (
                <div key={client.id} className="px-4 py-3 hover:bg-theme-bg-tertiary/30 transition-colors">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden">
                                {client.profileImage && !client.profileImage.includes('undefined') ? (
                                    <img
                                        src={`${API_URL}${client.profileImage}`}
                                        alt={`${client.firstname} ${client.lastname}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement?.querySelector('.initials')?.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}
                                <div className={`w-full h-full ${getAvatarColor(client.firstname)} flex items-center justify-center text-white text-sm font-medium ${client.profileImage && !client.profileImage.includes('undefined') ? 'hidden initials' : ''}`}>
                                    {getInitials(client.firstname, client.lastname)}
                                </div>
                                {client.status === 'ACTIVE' && (
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-theme-border"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-theme-text-primary text-sm truncate">
                                    {client.firstname} {client.lastname}
                                </div>
                                <div className="text-theme-text-secondary text-[10px] truncate">{client.email}</div>
                            </div>
                        </div>
                        <div className="hidden md:grid grid-cols-2 gap-4 text-[10px] text-theme-text-secondary flex-1 max-w-xl px-4">
                            <span className="truncate">{client.phone || 'N/A'}</span>
                            <span>{formatDate(client.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                            <button
                                onClick={() => handleViewClient(client)}
                                className="text-theme-text-secondary hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-500/10 transition-colors"
                                title="View Client"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleEditClient(client.id)}
                                disabled={operationLoading}
                                className="text-theme-text-secondary hover:text-amber-600 p-1.5 rounded-full hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                                title="Edit Client"
                            >
                                <Edit className="w-4 h-4 text-amber-500" />
                            </button>
                            <button
                                onClick={() => handleDeleteClient(client)}
                                disabled={operationLoading}
                                className="text-theme-text-secondary hover:text-red-600 p-1.5 rounded-full hover:bg-red-500/10 transition-colors disabled:opacity-50"
                                title="Delete Client"
                            >
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderPagination = () => {
        const pages: number[] = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="flex items-center justify-between bg-theme-bg-primary px-3 py-2 border-t border-theme-border">
                <div className="text-[10px] text-theme-text-secondary">
                    {t('client.showing')} {startIndex + 1}-{Math.min(endIndex, filteredClients.length)} {t('client.of')} {filteredClients.length}
                </div>
                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center px-2 py-1 text-[10px] text-theme-text-secondary bg-theme-bg-primary border border-theme-border rounded hover:bg-theme-bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-3 h-3" />
                    </button>
                    {pages.map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-2 py-1 text-[10px] rounded transition-colors ${currentPage === page
                                ? 'bg-primary-600 text-white'
                                : 'text-theme-text-primary bg-theme-bg-primary border border-theme-border hover:bg-theme-bg-tertiary shadow-sm'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center px-2 py-1 text-[10px] text-theme-text-secondary bg-theme-bg-primary border border-theme-border rounded hover:bg-theme-bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-theme-bg-secondary text-xs text-theme-text-primary transition-colors duration-200">
            <AddClientModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleSaveClient}
            />
            <EditClientModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                client={selectedClient}
                onSave={handleSaveClient}
            />
            <DeleteClientModal
                isOpen={isDeleteModalOpen}
                client={selectedClient}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={handleDelete}
            />
            {operationStatus && (
                <div className="fixed top-4 right-4 z-50">
                    <div
                        className={`flex items-center space-x-2 px-3 py-2 rounded shadow-lg text-[10px] ${operationStatus.type === 'success'
                            ? 'bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400'
                            : operationStatus.type === 'error'
                                ? 'bg-red-500/10 border border-red-500/20 text-red-700 dark:text-red-400'
                                : 'bg-primary-500/10 border border-primary-500/20 text-primary-700 dark:text-primary-400'
                            }`}
                    >
                        {operationStatus.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                        {operationStatus.type === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                        {operationStatus.type === 'info' && <AlertCircle className="w-4 h-4 text-primary-500" />}
                        <span className="font-medium">{operationStatus.message}</span>
                        <button onClick={() => setOperationStatus(null)} className="hover:opacity-70">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}
            {operationLoading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40">
                    <div className="bg-theme-bg-primary border border-theme-border rounded p-4 shadow-xl">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-theme-text-primary text-[10px] font-medium">Processing...</span>
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-theme-bg-primary shadow-sm border-b border-theme-border">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-semibold text-theme-text-primary">{t('client.title')}</h1>
                            <p className="text-[10px] text-theme-text-secondary mt-0.5">{t('client.subtitle')}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => clientService.getAllClients().then(data => setAllClients(data || []))}
                                disabled={loading}
                                className="flex items-center space-x-1 px-4 py-1.5 text-theme-text-secondary hover:text-theme-text-primary border border-theme-border rounded hover:bg-theme-bg-tertiary transition-colors disabled:opacity-50 text-[10px]"
                                title={t('client.refresh')}
                            >
                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                <span>{t('client.refresh')}</span>
                            </button>
                            <button
                                onClick={handleExportPDF}
                                disabled={operationLoading || filteredClients.length === 0}
                                className="flex items-center space-x-1 px-4 py-1.5 text-theme-text-secondary hover:text-theme-text-primary border border-theme-border rounded hover:bg-theme-bg-tertiary transition-colors disabled:opacity-50 text-[10px]"
                                title={t('client.export')}
                            >
                                <Download className="w-3 h-3" />
                                <span>{t('client.export')}</span>
                            </button>
                            <button
                                onClick={handleAddClient}
                                disabled={operationLoading}
                                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded font-medium transition-colors disabled:opacity-50 text-[10px]"
                                aria-label="Add new client"
                            >
                                <Plus className="w-3 h-3" />
                                <span>{t('client.addClient')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-4 py-4 space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-theme-bg-primary rounded border border-theme-border p-4 shadow-sm">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-primary-500/10 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-theme-text-secondary">{t('client.totalClients') || 'Total Clients'}</p>
                                <p className="text-lg font-semibold text-theme-text-primary">{totalClients}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-theme-bg-primary rounded border border-theme-border p-4 shadow-sm">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-green-500/10 rounded-full flex items-center justify-center">
                                <UserCheck className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-theme-text-secondary">{t('client.status.active')}</p>
                                <p className="text-lg font-semibold text-theme-text-primary">{activeClients}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-theme-bg-primary rounded border border-theme-border p-4 shadow-sm">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-red-500/10 rounded-full flex items-center justify-center">
                                <UserX className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-theme-text-secondary">{t('client.status.inactive')}</p>
                                <p className="text-lg font-semibold text-theme-text-primary">{inactiveClients}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-theme-bg-primary rounded border border-theme-border p-4 shadow-sm">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-purple-500/10 rounded-full flex items-center justify-center">
                                <UserPlus className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-theme-text-secondary">{t('client.newClients') || 'New Clients (30d)'}</p>
                                <p className="text-lg font-semibold text-theme-text-primary">{newClients}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-theme-bg-primary rounded border border-theme-border p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-3">
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="w-3 h-3 text-theme-text-secondary absolute left-2 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder={t('client.searchPlaceholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-48 pl-7 pr-3 py-1.5 text-[10px] border border-theme-border bg-theme-bg-secondary text-theme-text-primary rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                    aria-label={t('client.searchPlaceholder')}
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center space-x-1 px-2 py-1.5 text-[10px] border rounded transition-colors ${showFilters ? 'bg-primary-500/10 border-primary-500/20 text-primary-600' : 'border-theme-border text-theme-text-secondary hover:bg-theme-bg-tertiary'
                                    }`}
                            >
                                <Filter className="w-3 h-3" />
                                <span>{t('client.filter')}</span>
                            </button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-') as [keyof Client, 'asc' | 'desc'];
                                    setSortBy(field);
                                    setSortOrder(order);
                                }}
                                className="text-[10px] border border-theme-border bg-theme-bg-secondary text-theme-text-primary rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                aria-label="Sort clients"
                            >
                                <option value="firstname-asc">{t('client.sort.nameAZ') || 'Name (A-Z)'}</option>
                                <option value="firstname-desc">{t('client.sort.nameZA') || 'Name (Z-A)'}</option>
                                <option value="createdAt-desc">{t('client.sort.newest') || 'Newest First'}</option>
                                <option value="createdAt-asc">{t('client.sort.oldest') || 'Oldest First'}</option>
                            </select>
                            <div className="flex items-center border border-theme-border rounded overflow-hidden">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-1.5 text-xs transition-colors ${viewMode === 'table' ? 'bg-primary-500/10 text-primary-600' : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary'
                                        }`}
                                    title="Table View"
                                >
                                    <List className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 text-xs transition-colors ${viewMode === 'grid' ? 'bg-primary-500/10 text-primary-600' : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary'
                                        }`}
                                    title="Grid View"
                                >
                                    <Grid3X3 className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 text-xs transition-colors ${viewMode === 'list' ? 'bg-primary-500/10 text-primary-600' : 'text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary'
                                        }`}
                                    title="List View"
                                >
                                    <Users className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                    {showFilters && (
                        <div className="mt-3 pt-3 border-t border-theme-border">
                            <div className="flex items-center gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="text-[10px] border border-theme-border bg-theme-bg-secondary text-theme-text-primary rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    aria-label="Filter by status"
                                >
                                    <option value="all">{t('client.filterAllStatus') || 'All Status'}</option>
                                    <option value="ACTIVE">{t('client.status.active')}</option>
                                    <option value="INACTIVE">{t('client.status.inactive')}</option>
                                </select>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                    }}
                                    className="text-[10px] text-theme-text-secondary hover:text-theme-text-primary px-2 py-1 border border-theme-border bg-theme-bg-secondary rounded transition-colors"
                                >
                                    {t('client.clearFilters') || 'Clear Filters'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded p-3 text-red-700 dark:text-red-400 text-[10px]">
                        {error}
                    </div>
                )}
                {loading ? (
                    <div className="bg-theme-bg-primary rounded border border-theme-border p-8 text-center text-theme-text-secondary">
                        <div className="inline-flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-[10px]">{t('common.loading')}</span>
                        </div>
                    </div>
                ) : currentClients.length === 0 ? (
                    <div className="bg-theme-bg-primary rounded border border-theme-border p-8 text-center text-theme-text-secondary">
                        <div className="text-[10px]">
                            {searchTerm || statusFilter !== 'all' ? 'No clients found matching your filters' : 'No clients found'}
                        </div>
                    </div>
                ) : (
                    <div>
                        {viewMode === 'table' && renderTableView()}
                        {viewMode === 'grid' && renderGridView()}
                        {viewMode === 'list' && renderListView()}
                        {renderPagination()}
                    </div>
                )}
            </div>
            {
                isViewModalOpen && selectedClient && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-theme-bg-primary rounded-lg border border-theme-border p-5 w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-theme-text-primary">{t('client.detailsTitle')}</h3>
                                <button
                                    onClick={() => setIsViewModalOpen(false)}
                                    className="text-theme-text-secondary hover:text-theme-text-primary transition-colors"
                                    aria-label="Close view modal"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-medium text-theme-text-secondary mb-1">{t('client.table.name')}</label>
                                    <p className="text-theme-text-primary p-2 bg-theme-bg-secondary border border-theme-border rounded text-xs font-medium">
                                        {selectedClient.firstname} {selectedClient.lastname}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-theme-text-secondary mb-1">{t('client.table.email')}</label>
                                    <p className="text-theme-text-primary p-2 bg-theme-bg-secondary border border-theme-border rounded text-xs">{selectedClient.email}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-theme-text-secondary mb-1">{t('client.table.phone')}</label>
                                    <p className="text-theme-text-primary p-2 bg-theme-bg-secondary border border-theme-border rounded text-xs">{selectedClient.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-theme-text-secondary mb-1">{t('client.table.address')}</label>
                                    <p className="text-theme-text-primary p-2 bg-theme-bg-secondary border border-theme-border rounded text-xs">{selectedClient.address || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-medium text-theme-text-secondary mb-1">{t('client.table.status')}</label>
                                    <p className="inline-flex px-2 py-1 bg-theme-bg-secondary border border-theme-border rounded text-xs font-semibold text-primary-600">
                                        {selectedClient.status === 'ACTIVE' ? t('client.status.active') : t('client.status.inactive')}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-theme-border">
                                    <div>
                                        <label className="block text-[10px] font-medium text-theme-text-secondary mb-1">{t('client.table.created')}</label>
                                        <p className="text-theme-text-primary text-[10px]">{formatDate(selectedClient.createdAt)}</p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-medium text-theme-text-secondary mb-1">{t('client.lastUpdated')}</label>
                                        <p className="text-theme-text-primary text-[10px]">{formatDate(selectedClient.updatedAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    );
};

export default ClientManagement;
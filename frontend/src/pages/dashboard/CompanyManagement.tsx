import React, { useState, useEffect, useRef } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Download,
    Grid3X3,
    List,
    Building2,
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
    ChevronDown,
    MoreHorizontal,
    Settings
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import companyService, { type CreateCompanyInput, type UpdateCompanyInput, type Company, type CompanyStatus } from '../../services/companyService';
import DeleteCompanyModal from '../../components/dashboard/company/DeleteCompanyModal';
import { API_URL } from '../../api/api';
import { useSocketEvent } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

interface OperationStatus {
    type: 'success' | 'error' | 'info';
    message: string;
}

type ViewMode = 'table' | 'grid' | 'list';

const CompanyManagement = ({ role }: { role: string }) => {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [allCompanies, setAllCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState<keyof Company>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [rowsPerPage] = useState(8);
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
    const [operationLoading, setOperationLoading] = useState<boolean>(false);
    const [showFilters, setShowFilters] = useState<boolean>(false);

    const pdfContentRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                setLoading(true);
                const data = await companyService.getAllCompanies();
                setAllCompanies(data || []);
                setError(null);
            } catch (err: any) {
                const errorMessage = err.message || 'Failed to load companies';
                console.error('Error fetching companies:', err);
                setError(errorMessage);
                showOperationStatus('error', errorMessage);
            } finally {
                setLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    useEffect(() => {
        handleFilterAndSort();
    }, [searchTerm, statusFilter, sortBy, sortOrder, allCompanies]);

    useSocketEvent('companyCreated', (companyData: Company) => {
        console.log('Company created via WebSocket:', companyData);
        setAllCompanies((prevCompanies) => [...prevCompanies, companyData]);
        showOperationStatus('success', `Company ${companyData.adminName} created`);
    });

    useSocketEvent('companyUpdated', (companyData: Company) => {
        console.log('Company updated via WebSocket:', companyData);
        setAllCompanies((prevCompanies) =>
            prevCompanies.map((c) => (c.id === companyData.id ? companyData : c))
        );
        showOperationStatus('success', `Company ${companyData.adminName} updated`);
    });

    useSocketEvent('companyDeleted', ({ id }: { id: string }) => {
        console.log('Company deleted via WebSocket:', id);
        setAllCompanies((prevCompanies) => prevCompanies.filter((c) => c.id !== id));
        showOperationStatus('success', 'Company deleted');
    });

    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-primary-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
            'bg-yellow-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
        ];
        const index = name.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
    };

    const showOperationStatus = (type: OperationStatus['type'], message: string, duration: number = 3000) => {
        setOperationStatus({ type, message });
        setTimeout(() => setOperationStatus(null), duration);
    };

    const handleFilterAndSort = () => {
        let filtered = [...allCompanies];

        if (searchTerm.trim()) {
            filtered = filtered.filter(
                (company) =>
                    company.adminName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    company.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    company.city?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter((company) => company.status === statusFilter.toUpperCase());
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

        setCompanies(filtered);
        setCurrentPage(1);
    };

    const handleExportPDF = async () => {
        try {
            setOperationLoading(true);
            const date = new Date().toLocaleDateString('en-CA').replace(/\//g, '');
            const filename = `companies_export_${date}.pdf`;

            const tableRows = filteredCompanies.map((company, index) => {
                const companyImgUrl = company.profileImage
                    ? `${API_URL}${company.profileImage}`
                    : '';
                return `
                    <tr>
                        <td style="font-size:10px;">${index + 1}</td>
                        <td style="font-size:10px;">
                            ${companyImgUrl ? `<img src="${companyImgUrl}" style="width:25px;height:25px;border-radius:50%;vertical-align:middle;margin-right:5px;" />` : ''}
                            ${company.adminName}
                        </td>
                        <td style="font-size:10px;">${company.adminEmail || 'N/A'}</td>
                        <td style="font-size:10px;">${company.city || 'N/A'}</td>
                        <td style="font-size:10px; color: ${company.status === 'ACTIVE' ? 'green' : 'red'};">
                            ${company.status}
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
                    <h1>Company List</h1>
                    <p>Exported on: ${new Date().toLocaleString('en-US', { timeZone: 'Africa/Johannesburg' })}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Company Name</th>
                                <th>Email</th>
                                <th>City</th>
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
            showOperationStatus('success', 'PDF exported successfully');
        } catch (err: any) {
            console.error('Error generating PDF:', err);
            showOperationStatus('error', 'Failed to export PDF');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleAddCompany = () => {
        navigate(`create`);
    };

    const handleEditCompany = async (company: Company) => {
        if (!company.id) return Swal.fire({});
        navigate(`update/${company.id}`);
    };

    const handleViewCompany = (company: Company) => {
        if (!company.id) return Swal.fire({});
        navigate(`${company.id}`);
    };

    const handleDeleteCompany = (company: Company) => {
        setSelectedCompany(company);
        setIsDeleteModalOpen(true);
    };

    const handleSaveCompany = async (data: CreateCompanyInput | UpdateCompanyInput) => {
        try {
            setOperationLoading(true);
            const validation = companyService.validateCompanyData(data as CreateCompanyInput);
            if (!validation.isValid) {
                throw new Error(validation.errors.join(', '));
            }
            if (isAddModalOpen) {
                const newCompany = await companyService.createCompany(data as CreateCompanyInput);
                if (!newCompany) {
                    throw new Error('No company data returned from createCompany');
                }
                showOperationStatus('success', 'Company created successfully');
                setIsAddModalOpen(false);
            } else {
                if (!selectedCompany) {
                    throw new Error('No company selected for update');
                }
                await companyService.updateCompany(selectedCompany.id, data as UpdateCompanyInput);
                showOperationStatus('success', 'Company updated successfully');
                setIsEditModalOpen(false);
            }
        } catch (err: any) {
            console.error('Error in handleSaveCompany:', err);
            showOperationStatus('error', err.message || 'Failed to save company');
        } finally {
            setOperationLoading(false);
        }
    };

    const handleDelete = async (company: Company) => {
        try {
            setOperationLoading(true);
            await companyService.deleteCompany(company.id);
            showOperationStatus('success', `Company "${company.adminName}" deleted successfully`);
        } catch (err: any) {
            console.error('Error deleting company:', err);
            showOperationStatus('error', err.message || 'Failed to delete company');
        } finally {
            setOperationLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedCompany(null);
        }
    };

    const formatDate = (date?: string): string => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const filteredCompanies = companies;
    const totalPages = Math.ceil(filteredCompanies.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentCompanies = filteredCompanies.slice(startIndex, endIndex);

    // Summary statistics
    const totalCompanies = allCompanies.length;
    const activeCompanies = allCompanies.filter((c) => c.status === 'ACTIVE').length;
    const inactiveCompanies = allCompanies.filter((c) => c.status === 'INACTIVE').length;

    const CompanyCard = ({ company }: { company: Company }) => {
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
            <div className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="p-1 hover:bg-gray-100 rounded"
                        >
                            <MoreHorizontal className="w-3 h-3 text-gray-400" />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 top-6 bg-white shadow-lg rounded border py-1 z-10">
                                <button
                                    onClick={() => {
                                        handleViewCompany(company);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                                >
                                    <Eye className="w-3 h-3 mr-1" />
                                    View
                                </button>
                                 <button
                                            onClick={() => navigate(`/${role}/dashboard/company-management/assign-features/${company.id}`)}
                                            className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                                          >
                                            <Settings className="w-4 h-4" />
                                            feature
                                          </button>
                                <button
                                    onClick={() => {
                                        handleEditCompany(company);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                                >
                                    <Edit className="w-3 h-3 mr-1" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        handleDeleteCompany(company);
                                        setIsDropdownOpen(false);
                                    }}
                                    className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                                >
                                    <Trash2 className="w-3 h-3 mr-1" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center relative overflow-hidden">
                        {company.profileImage && !imageError ? (
                            <img
                                src={`${API_URL}${company.profileImage}`}
                                alt={company.adminName}
                                className="w-full h-full object-cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className={`w-full h-full ${getAvatarColor(company.adminName || 'Unknown')} flex items-center justify-center text-white text-xs font-medium`}>
                                {getInitials(company.adminName || 'Unknown')}
                            </div>
                        )}
                        {company.status === 'ACTIVE' && (
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-white"></div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-xs truncate">
                            {company.adminName}
                        </div>
                        <div className="text-gray-500 text-xs truncate">{company.adminEmail}</div>
                    </div>
                </div>
                <div className="space-y-1 mb-2">
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <Building2 className="w-3 h-3" />
                        <span>City: {company.city || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-600">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(company.createdAt)}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                        company.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                        • {company.status}
                    </span>
                </div>
            </div>
        );
    };

    const renderTableView = () => (
        <div className="bg-white rounded border border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
                            <th
                                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100"
                                onClick={() => {
                                    setSortBy('adminName');
                                    setSortOrder(sortBy === 'adminName' && sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Name</span>
                                    <ChevronDown className={`w-3 h-3 ${sortBy === 'adminName' ? 'text-primary-600' : 'text-gray-400'}`} />
                                </div>
                            </th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Email</th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">City</th>
                            <th className="text-left py-2 px-2 text-gray-600 font-medium">Status</th>
                            <th
                                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100 hidden lg:table-cell"
                                onClick={() => {
                                    setSortBy('createdAt');
                                    setSortOrder(sortBy === 'createdAt' && sortOrder === 'asc' ? 'desc' : 'asc');
                                }}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>Created</span>
                                    <ChevronDown className={`w-3 h-3 ${sortBy === 'createdAt' ? 'text-primary-600' : 'text-gray-400'}`} />
                                </div>
                            </th>
                            <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentCompanies.map((company, index) => (
                            <tr key={company.id} className="hover:bg-gray-25">
                                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                                <td className="py-2 px-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center relative overflow-hidden">
                                            {company.profileImage && !company.profileImage.includes('undefined') ? (
                                                <img
                                                    src={`${API_URL}${company.profileImage}`}
                                                    alt={company.adminName}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).parentElement?.querySelector('.initials')?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : null}
                                            <div className={`w-full h-full ${getAvatarColor(company.adminName || 'Unknown')} flex items-center justify-center text-white text-xs font-medium ${company.profileImage && !company.profileImage.includes('undefined') ? 'hidden initials' : ''}`}>
                                                {getInitials(company.adminName || 'Unknown')}
                                            </div>
                                            {company.status === 'ACTIVE' && (
                                                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full border border-white"></div>
                                            )}
                                        </div>
                                        <span className="font-medium text-gray-900 text-xs">
                                            {company.adminName}
                                        </span>
                                    </div>
                                </td>
                                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{company.adminEmail || 'N/A'}</td>
                                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{company.city || 'N/A'}</td>
                                <td className="py-2 px-2">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                        company.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        • {company.status}
                                    </span>
                                </td>
                                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{formatDate(company.createdAt)}</td>
                                <td className="py-2 px-2">
                                    <div className="flex items-center justify-end space-x-1">
                                        <button
                                            onClick={() => handleViewCompany(company)}
                                            className="text-gray-400 hover:text-primary-600 p-1"
                                            title="View"
                                        >
                                            <Eye className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => handleEditCompany(company)}
                                            disabled={operationLoading}
                                            className="text-gray-400 hover:text-primary-600 p-1 disabled:opacity-50"
                                            title="Edit"
                                        >
                                            <Edit className="w-3 h-3" />
                                        </button>
                                         <button
                                            onClick={() => navigate(`/${role}/dashboard/company-management/assign-features/${company.id}`)}
                                            className="text-gray-400 hover:text-primary-600 p-1 disabled:opacity-50"
                                          >
                                            <Settings className="w-4 h-4" />
                                            
                                          </button>
                                        <button
                                            onClick={() => handleDeleteCompany(company)}
                                            disabled={operationLoading}
                                            className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-3 h-3" />
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
            {currentCompanies.map((company) => (
                <CompanyCard key={company.id} company={company} />
            ))}
        </div>
    );

    const renderListView = () => (
        <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
            {currentCompanies.map((company) => (
                <div key={company.id} className="px-4 py-3 hover:bg-gray-25">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden">
                                {company.profileImage && !company.profileImage.includes('undefined') ? (
                                    <img
                                        src={`${API_URL}${company.profileImage}`}
                                        alt={company.adminName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).parentElement?.querySelector('.initials')?.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}
                                <div className={`w-full h-full ${getAvatarColor(company.adminName || 'Unknown')} flex items-center justify-center text-white text-sm font-medium ${company.profileImage && !company.profileImage.includes('undefined') ? 'hidden initials' : ''}`}>
                                    {getInitials(company.adminName || 'Unknown')}
                                </div>
                                {company.status === 'ACTIVE' && (
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 text-sm truncate">
                                    {company.adminName}
                                </div>
                                <div className="text-gray-500 text-xs truncate">{company.adminEmail}</div>
                            </div>
                        </div>
                        <div className="hidden md:grid grid-cols-2 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
                            <span className="truncate">City: {company.city || 'N/A'}</span>
                            <span>{formatDate(company.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                            <button
                                onClick={() => handleViewCompany(company)}
                                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                                title="View Company"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                              <button
                                            onClick={() => navigate(`/${role}/dashboard/company-management/assign-features/${company.id}`)}
                                            className="flex items-center px-2 py-1 text-xs text-gray-700 hover:bg-gray-50 w-full"
                                          >
                                            <Settings className="w-4 h-4" />
                                            
                                          </button>
                            <button
                                onClick={() => handleEditCompany(company)}
                                disabled={operationLoading}
                                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors disabled:opacity-50"
                                title="Edit Company"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteCompany(company)}
                                disabled={operationLoading}
                                className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                                title="Delete Company"
                            >
                                <Trash2 className="w-4 h-4" />
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
            <div className="flex items-center justify-between bg-white px-3 py-2 border-t border-gray-200">
                <div className="text-xs text-gray-600">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredCompanies.length)} of {filteredCompanies.length}
                </div>
                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-3 h-3" />
                    </button>
                    {pages.map((page) => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-2 py-1 text-xs rounded ${
                                currentPage === page
                                    ? 'bg-primary-500 text-white'
                                    : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 text-xs">
            <DeleteCompanyModal
                isOpen={isDeleteModalOpen}
                company={selectedCompany}
                onClose={() => setIsDeleteModalOpen(false)}
                onDelete={handleDelete}
            />
            {operationStatus && (
                <div className="fixed top-4 right-4 z-50">
                    <div
                        className={`flex items-center space-x-2 px-3 py-2 rounded shadow-lg text-xs ${
                            operationStatus.type === 'success'
                                ? 'bg-green-50 border border-green-200 text-green-800'
                                : operationStatus.type === 'error'
                                ? 'bg-red-50 border border-red-200 text-red-800'
                                : 'bg-primary-50 border border-primary-200 text-primary-800'
                        }`}
                    >
                        {operationStatus.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                        {operationStatus.type === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                        {operationStatus.type === 'info' && <AlertCircle className="w-4 h-4 text-primary-600" />}
                        <span className="font-medium">{operationStatus.message}</span>
                        <button onClick={() => setOperationStatus(null)} className="hover:opacity-70">
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}
            {operationLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
                    <div className="bg-white rounded p-4 shadow-xl">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-700 text-xs font-medium">Processing...</span>
                        </div>
                    </div>
                </div>
            )}
            <div className="bg-white shadow-md">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">Company Management</h1>
                            <p className="text-xs text-gray-500 mt-0.5">Manage your organization's companies</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => companyService.getAllCompanies().then(data => setAllCompanies(data || []))}
                                disabled={loading}
                                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </button>
                            <button
                                onClick={handleExportPDF}
                                disabled={operationLoading || filteredCompanies.length === 0}
                                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                                title="Export PDF"
                            >
                                <Download className="w-3 h-3" />
                                <span>Export</span>
                            </button>
                            <button
                                onClick={handleAddCompany}
                                disabled={operationLoading}
                                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
                                aria-label="Add new company"
                            >
                                <Plus className="w-3 h-3" />
                                <span>Add Company</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="px-4 py-4 space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-primary-100 rounded-full flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Total Companies</p>
                                <p className="text-lg font-semibold text-gray-900">{totalCompanies}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Active Companies</p>
                                <p className="text-lg font-semibold text-gray-900">{activeCompanies}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded shadow p-4">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">Inactive Companies</p>
                                <p className="text-lg font-semibold text-gray-900">{inactiveCompanies}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded border border-gray-200 p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-3">
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search companies..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                                    aria-label="Search companies"
                                />
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center space-x-1 px-2 py-1.5 text-xs border rounded transition-colors ${
                                    showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                <Filter className="w-3 h-3" />
                                <span>Filter</span>
                            </button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <select
                                value={`${sortBy}-${sortOrder}`}
                                onChange={(e) => {
                                    const [field, order] = e.target.value.split('-') as [keyof Company, 'asc' | 'desc'];
                                    setSortBy(field);
                                    setSortOrder(order);
                                }}
                                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                aria-label="Sort companies"
                            >
                                <option value="adminName-asc">Name (A-Z)</option>
                                <option value="adminName-desc">Name (Z-A)</option>
                                <option value="createdAt-desc">Newest First</option>
                                <option value="createdAt-asc">Oldest First</option>
                            </select>
                            <div className="flex items-center border border-gray-200 rounded">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-1.5 text-xs transition-colors ${
                                        viewMode === 'table' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                    title="Table View"
                                >
                                    <List className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 text-xs transition-colors ${
                                        viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                    title="Grid View"
                                >
                                    <Grid3X3 className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 text-xs transition-colors ${
                                        viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                    title="List View"
                                >
                                    <Building2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                    {showFilters && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                    aria-label="Filter by status"
                                >
                                    <option value="all">All Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                </select>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                    }}
                                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-xs">
                        {error}
                    </div>
                )}
                {loading ? (
                    <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
                        <div className="inline-flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-xs">Loading companies...</span>
                        </div>
                    </div>
                ) : currentCompanies.length === 0 ? (
                    <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
                        <div className="text-xs">
                            {searchTerm || statusFilter !== 'all' ? 'No companies found matching your filters' : 'No companies found'}
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
            {isViewModalOpen && selectedCompany && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded p-4 w-full max-w-sm max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold">Company Details</h3>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                                aria-label="Close view modal"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{selectedCompany.adminName || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{selectedCompany.adminEmail || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{selectedCompany.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Website</label>
                                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{selectedCompany.website || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{selectedCompany.address || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{selectedCompany.city || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{selectedCompany.country || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{selectedCompany.description || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{selectedCompany.status}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">2FA Enabled</label>
                                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{selectedCompany.is2FA ? 'Yes' : 'No'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Locked</label>
                                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{selectedCompany.isLocked ? 'Yes' : 'No'}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Created Date</label>
                                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{formatDate(selectedCompany.createdAt)}</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Last Updated</label>
                                <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">{formatDate(selectedCompany.updatedAt)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanyManagement;
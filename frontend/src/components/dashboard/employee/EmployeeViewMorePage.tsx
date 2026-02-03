import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Building2,
  CreditCard,
  Activity,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  FileText,
  Briefcase,
  Heart,
  Clock,
  X,
  File,
  DollarSign,
  UserPlus,
  Download,
  Trash2,
  Edit,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import employeeService from '../../../services/employeeService';
import contractService from '../../../services/contractService';
import { API_URL } from '../../../api/api';
import DeleteConfirmModal from '../contract/DeleteConfirmModal';

// Define types and interfaces
const MARITAL_STATUS = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'] as const;
const EMPLOYEE_STATUS = ['ACTIVE', 'TERMINATED', 'RESIGNED', 'PROBATION'] as const;
const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;
const CONTRACT_STATUSES = ['ACTIVE', 'EXPIRED', 'TERMINATED', 'PENDING'] as const;

type MaritalStatus = typeof MARITAL_STATUS[number];
type EmployeeStatus = typeof EMPLOYEE_STATUS[number];
type Gender = typeof GENDERS[number];
type ContractStatus = typeof CONTRACT_STATUSES[number];

interface Department {
  id: string;
  name: string;
}

interface Experience {
  company_name: string;
  description: string;
  start_date: string;
  end_date?: string;
}

interface Contract {
  id: string;
  contractType: string;
  status: ContractStatus;
  startDate: string;
  endDate?: string;
  salary: number;
  currency: string;
  benefits?: string;
  workingHours?: string;
  probationPeriod?: string;
  terminationConditions?: string;
  terms?: string;
  department?: Department;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  gender: Gender;
  date_of_birth: string;
  phone: string;
  email: string;
  address: string;
  national_id: string;
  position: string;
  departmentId: string;
  department?: Department;
  marital_status: MaritalStatus;
  date_hired: string;
  status: EmployeeStatus;
  bank_account_number: string;
  bank_name: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  experience: Experience[];
  profile_picture?: string;
  application_letter?: string;
  cv?: string;
  createdAt?: string;
  updatedAt?: string;
  contract?: Contract[];
}

interface Notification {
  message: string;
  type: 'success' | 'error';
}

const ViewEmployee: React.FC<{role:string}> = ({role}) => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [contractsPerPage] = useState<number>(2);
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [updateModalOpen, setUpdateModalOpen] = useState<boolean>(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState<Partial<Contract>>({});
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState<boolean>(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);

  const fetchEmployee = async () => {
    if (!id) {
      setError('No employee ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const employeeData = await employeeService.getEmployeeById(id);
      if (employeeData) {
        let parsedExperience: Experience[] = [];
        if (employeeData.experience && typeof employeeData.experience === 'string') {
          try {
            parsedExperience = JSON.parse(employeeData.experience);
          } catch (parseError) {
            console.error('Error parsing experience:', parseError);
            parsedExperience = [];
          }
        } else if (!Array.isArray(employeeData.experience)) {
          parsedExperience = [];
        } else {
          parsedExperience = employeeData.experience;
        }
        setEmployee({ ...employeeData, experience: parsedExperience });
      } else {
        setError('Employee not found');
      }
    } catch (err) {
      console.error('Error fetching employee:', err);
      setError('Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount: number | undefined, currency: string): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'RWF',
    }).format(amount || 0);
  };

  const getUrlImage = (url?: string): string | undefined => {
    if (!url) return undefined;
    if (url.includes('http')) return url;
    return `${API_URL}${url}`;
  };

  const handlePreview = (url: string | undefined, type: 'image' | 'pdf') => {
    const fullUrl = getUrlImage(url);
    if (fullUrl) {
      setPreviewUrl(fullUrl);
      setPreviewType(type);
    }
  };

  const closePreview = () => {
    setPreviewUrl(null);
    setPreviewType(null);
  };

  const handleDownloadContractPDF = async (contractId: string) => {
    try {
      setDownloadLoading(contractId);
      const pdfBlob = await contractService.downloadContractPDF(contractId);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contract_${contractId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotification('Contract PDF downloaded successfully', 'success');
    } catch (err) {
      console.error('Error downloading contract PDF:', err);
      showNotification('Failed to download contract PDF', 'error');
    } finally {
      setDownloadLoading(null);
    }
  };

  const handleDeleteContract = async (contract: Contract) => {
    setContractToDelete(contract);
    setDeleteConfirmModalOpen(true);
  };

  const confirmDeleteContract = async () => {
    if (!contractToDelete) return;

    try {
      setDeleteLoading(contractToDelete.id);
      await contractService.deleteContract(contractToDelete.id);
      await fetchEmployee(); // Refresh employee data after deletion
      showNotification('Contract deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting contract:', err);
      showNotification('Failed to delete contract', 'error');
    } finally {
      setDeleteLoading(null);
      setDeleteConfirmModalOpen(false);
      setContractToDelete(null);
    }
  };

  const handleOpenUpdateModal = (contract: Contract) => {
    setSelectedContract(contract);
    setFormData({
      contractType: contract.contractType,
      status: contract.status,
      startDate: contract.startDate,
      endDate: contract.endDate,
      salary: contract.salary,
      currency: contract.currency,
      benefits: contract.benefits,
      workingHours: contract.workingHours,
      probationPeriod: contract.probationPeriod,
      terms: contract.terms,
      terminationConditions: contract.terminationConditions,
    });
    setUpdateModalOpen(true);
  };

  const handleCloseUpdateModal = () => {
    setUpdateModalOpen(false);
    setSelectedContract(null);
    setFormData({});
  };

  const handleUpdateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    try {
      const updatedContract = await contractService.updateContract(selectedContract.id, formData);
      await fetchEmployee(); // Refresh employee data after update
      showNotification('Contract updated successfully', 'success');
      handleCloseUpdateModal();
    } catch (err) {
      console.error('Error updating contract:', err);
      showNotification('Failed to update contract', 'error');
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getEmployeeName = (employeeId: string): string => {
    return employee && employee.id === employeeId
      ? `${employee.first_name} ${employee.last_name}`
      : 'Unknown Employee';
  };

  const indexOfLastContract = currentPage * contractsPerPage;
  const indexOfFirstContract = indexOfLastContract - contractsPerPage;
  const currentContracts = employee?.contract?.slice(indexOfFirstContract, indexOfLastContract) || [];
  const totalPages = Math.ceil((employee?.contract?.length || 0) / contractsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[90vh] bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-xs text-gray-600">Loading employee details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[90vh] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-xs text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-[90vh] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Employee Not Found</h2>
          <p className="text-xs text-gray-600">The requested employee record could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[90vh] overflow-y-auto bg-gray-50 py-6">
      {notification && (
        <div
          className={`fixed top-3 right-3 z-50 flex items-center gap-1.5 px-3 py-2 rounded shadow-lg ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          } animate-in slide-in-from-top-2 duration-300`}
        >
          {notification.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
          <span className="text-xs">{notification.message}</span>
        </div>
      )}

      {previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded p-3 max-w-3xl w-full max-h-[80vh] overflow-auto relative">
            <button
              onClick={closePreview}
              className="absolute top-1 right-1 text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
            {previewType === 'image' ? (
              <img
                src={previewUrl}
                alt="Profile Preview"
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            ) : (
              <iframe
                src={previewUrl}
                title="Document Preview"
                className="w-full h-[70vh]"
              />
            )}
          </div>
        </div>
      )}

      {updateModalOpen && selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded p-5 max-w-2xl w-full max-h-[80vh] overflow-auto relative">
            <button
              onClick={handleCloseUpdateModal}
              className="absolute top-1 right-1 text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Update Contract</h2>
            <form onSubmit={handleUpdateContract} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">Contract Type</label>
                <input
                  type="text"
                  name="contractType"
                  value={formData.contractType || ''}
                  onChange={handleFormChange}
                  className="mt-0.5 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={formData.status || ''}
                  onChange={handleFormChange}
                  className="mt-0.5 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs"
                  required
                >
                  <option value="">Select Status</option>
                  {CONTRACT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate || ''}
                  onChange={handleFormChange}
                  className="mt-0.5 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate || ''}
                  onChange={handleFormChange}
                  className="mt-0.5 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Salary</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary || ''}
                  onChange={handleFormChange}
                  className="mt-0.5 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Currency</label>
                <input
                  type="text"
                  name="currency"
                  value={formData.currency || ''}
                  onChange={handleFormChange}
                  className="mt-0.5 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Benefits</label>
                <textarea
                  name="benefits"
                  value={formData.benefits || ''}
                  onChange={handleFormChange}
                  className="mt-0.5 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Working Hours</label>
                <input
                  type="text"
                  name="workingHours"
                  value={formData.workingHours || ''}
                  onChange={handleFormChange}
                  className="mt-0.5 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Probation Period</label>
                <input
                  type="text"
                  name="probationPeriod"
                  value={formData.probationPeriod || ''}
                  onChange={handleFormChange}
                  className="mt-0.5 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Terms and Conditions</label>
                <textarea
                  name="terms"
                  value={formData.terms || ''}
                  onChange={handleFormChange}
                  className="mt-0.5 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Termination Conditions</label>
                <textarea
                  name="terminationConditions"
                  value={formData.terminationConditions || ''}
                  onChange={handleFormChange}
                  className="mt-0.5 block w-full rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCloseUpdateModal}
                  className="px-3 py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmModalOpen && contractToDelete && (
        <DeleteConfirmModal
          isOpen={deleteConfirmModalOpen}
          onClose={() => {
            setDeleteConfirmModalOpen(false);
            setContractToDelete(null);
          }}
          onConfirm={confirmDeleteContract}
          contract={contractToDelete}
          getEmployeeName={getEmployeeName}
        />
      )}

      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            className="flex items-center text-gray-600 hover:text-gray-900 mb-3 text-xs"
            onClick={() => navigate('/admin/dashboard/employee-management')}
          >
            <ArrowLeft className="w-3 h-3 mr-1.5" />
            Back to Employees
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {employee.first_name} {employee.last_name}
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">{employee.gender}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Hire Date</div>
              <div className="text-sm font-semibold">{formatDate(employee.date_hired)}</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded shadow">
            <div className="px-5 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                <User className="w-4 h-4 mr-1.5" />
                Personal Information
              </h2>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Full Name</label>
                  <p className="mt-0.5 text-xs text-gray-900">
                    {employee.first_name} {employee.last_name}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Gender</label>
                    <p className="mt-0.5 text-xs text-gray-900">{employee.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Date of Birth</label>
                    <div className="flex items-center mt-0.5">
                      <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                      <p className="text-xs text-gray-900">{formatDate(employee.date_of_birth)}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Marital Status</label>
                  <div className="flex items-center mt-0.5">
                    <Heart className="w-3 h-3 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-900">{employee.marital_status || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">National ID</label>
                  <div className="flex items-center mt-0.5">
                    <CreditCard className="w-3 h-3 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-900">{employee.national_id || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Bank Account Number</label>
                  <div className="flex items-center mt-0.5">
                    <DollarSign className="w-3 h-3 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-900">{employee.bank_account_number || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Bank Name</label>
                  <div className="flex items-center mt-0.5">
                    <DollarSign className="w-3 h-3 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-900">{employee.bank_name || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Emergency Contact Name</label>
                  <div className="flex items-center mt-0.5">
                    <UserPlus className="w-3 h-3 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-900">{employee.emergency_contact_name || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Emergency Contact Phone</label>
                  <div className="flex items-center mt-0.5">
                    <Phone className="w-3 h-3 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-900">{employee.emergency_contact_phone || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded shadow">
            <div className="px-5 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                <Mail className="w-4 h-4 mr-1.5" />
                Contact Information
              </h2>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Email</label>
                  <div className="flex items-center mt-0.5">
                    <Mail className="w-3 h-3 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-900">{employee.email || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Phone</label>
                  <div className="flex items-center mt-0.5">
                    <Phone className="w-3 h-3 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-900">{employee.phone || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Address</label>
                  <p className="mt-0.5 text-xs text-gray-900">{employee.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded shadow">
            <div className="px-5 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                <Briefcase className="w-4 h-4 mr-1.5" />
                Employment Information
              </h2>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Position</label>
                  <p className="mt-0.5 text-xs text-gray-900">{employee.position || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Department</label>
                  <div className="flex items-center mt-0.5">
                    <Building2 className="w-3 h-3 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-900">{employee.department?.name || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Status</label>
                  <p className="mt-0.5 text-xs text-gray-900">{employee.status || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Hire Date</label>
                  <div className="flex items-center mt-0.5">
                    <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-900">{formatDate(employee.date_hired)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded shadow">
            <div className="px-5 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                <FileText className="w-4 h-4 mr-1.5" />
                Documents
              </h2>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700">Profile Picture</label>
                  <div className="flex items-center mt-0.5">
                    {employee.profile_picture ? (
                      <button
                        onClick={() => handlePreview(employee.profile_picture, 'image')}
                        className="text-blue-600 hover:underline flex items-center text-xs"
                      >
                        <File className="w-3 h-3 mr-1" />
                        Preview Profile Picture
                      </button>
                    ) : (
                      <p className="text-xs text-gray-900">N/A</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">CV</label>
                  <div className="flex items-center mt-0.5">
                    {employee.cv ? (
                      <button
                        onClick={() => handlePreview(employee.cv, 'pdf')}
                        className="text-blue-600 hover:underline flex items-center text-xs"
                      >
                        <File className="w-3 h-3 mr-1" />
                        Preview CV
                      </button>
                    ) : (
                      <p className="text-xs text-gray-900">N/A</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">Application Letter</label>
                  <div className="flex items-center mt-0.5">
                    {employee.application_letter ? (
                      <button
                        onClick={() => handlePreview(employee.application_letter, 'pdf')}
                        className="text-blue-600 hover:underline flex items-center text-xs"
                      >
                        <File className="w-3 h-3 mr-1" />
                        Preview Application Letter
                      </button>
                    ) : (
                      <p className="text-xs text-gray-900">N/A</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-2">
            <div className="grid xl:grid-cols-2 gap-4">
              <div className="bg-white rounded shadow">
                <div className="px-5 py-3 border-b border-gray-200">
                  <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                    <Briefcase className="w-4 h-4 mr-1.5" />
                    Contract Information
                  </h2>
                </div>
                <div className="p-5">
                  {currentContracts.length > 0 ? (
                    <div className="space-y-5">
                      {currentContracts.map((contract) => (
                        <div key={contract.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                          <div className="grid grid-cols-1 gap-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Contract Type</label>
                                <p className="mt-0.5 text-xs text-gray-900">{contract.contractType || 'N/A'}</p>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Status</label>
                                <p className="mt-0.5 text-xs text-gray-900">{contract.status || 'N/A'}</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Start Date</label>
                                <div className="flex items-center mt-0.5">
                                  <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                                  <p className="text-xs text-gray-900">{formatDate(contract.startDate)}</p>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">End Date</label>
                                <div className="flex items-center mt-0.5">
                                  <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                                  <p className="text-xs text-gray-900">
                                    {contract.endDate ? formatDate(contract.endDate) : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Salary</label>
                                <div className="flex items-center mt-0.5">
                                  <DollarSign className="w-3 h-3 text-gray-400 mr-1" />
                                  <p className="text-xs text-gray-900">
                                    {formatCurrency(contract.salary, contract.currency || 'RWF')}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700">Department</label>
                                <div className="flex items-center mt-0.5">
                                  <Building2 className="w-3 h-3 text-gray-400 mr-1" />
                                  <p className="text-xs text-gray-900">{contract.department?.name || 'N/A'}</p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Benefits</label>
                              <p className="mt-0.5 text-xs text-gray-900">{contract.benefits || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Working Hours</label>
                              <div className="flex items-center mt-0.5">
                                <Clock className="w-3 h-3 text-gray-400 mr-1" />
                                <p className="text-xs text-gray-900">{contract.workingHours || 'N/A'}</p>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Probation Period</label>
                              <p className="mt-0.5 text-xs text-gray-900">{contract.probationPeriod || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Terms and Conditions</label>
                              <p className="mt-0.5 text-xs text-gray-900">{contract.terms || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Termination Conditions</label>
                              <p className="mt-0.5 text-xs text-gray-900">{contract.terminationConditions || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => handleDownloadContractPDF(contract.id)}
                              disabled={downloadLoading === contract.id}
                              className={`flex items-center px-3 py-1.5 rounded text-xs font-medium ${
                                downloadLoading === contract.id
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              <Download className="w-3 h-3 mr-1.5" />
                              {downloadLoading === contract.id ? 'Downloading...' : 'Download Contract PDF'}
                            </button>
                            <button
                              onClick={() => handleOpenUpdateModal(contract)}
                              className="flex items-center px-3 py-1.5 rounded text-xs font-medium bg-yellow-500 text-white hover:bg-yellow-600"
                            >
                              <Edit className="w-3 h-3 mr-1.5" />
                              Update
                            </button>
                            <button
                              onClick={() => handleDeleteContract(contract)}
                              disabled={deleteLoading === contract.id}
                              className={`flex items-center px-3 py-1.5 rounded text-xs font-medium ${
                                deleteLoading === contract.id
                                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                  : 'bg-red-600 text-white hover:bg-red-700'
                              }`}
                            >
                              <Trash2 className="w-3 h-3 mr-1.5" />
                              {deleteLoading === contract.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between items-center mt-3">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className={`px-3 py-1.5 rounded text-xs ${
                            currentPage === 1 ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          Previous
                        </button>
                        <span className="text-xs text-gray-600">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1.5 rounded text-xs ${
                            currentPage === totalPages ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600">No contracts found for this employee.</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded shadow">
                <div className="px-5 py-3 border-b border-gray-200">
                  <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                    <Briefcase className="w-4 h-4 mr-1.5" />
                    Work Experience
                  </h2>
                </div>
                <div className="p-5">
                  {employee.experience.length > 0 ? (
                    <div className="space-y-5">
                      {employee.experience.map((exp, index) => (
                        <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Company Name</label>
                              <p className="mt-0.5 text-xs text-gray-900">{exp.company_name || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Description</label>
                              <p className="mt-0.5 text-xs text-gray-900">{exp.description || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Start Date</label>
                              <div className="flex items-center mt-0.5">
                                <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                                <p className="text-xs text-gray-900">{formatDate(exp.start_date)}</p>
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">End Date</label>
                              <div className="flex items-center mt-0.5">
                                <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                                <p className="text-xs text-gray-900">
                                  {exp.end_date ? formatDate(exp.end_date) : 'Present'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600">No work experience found for this employee.</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded shadow">
              <div className="px-5 py-3 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center">
                  <Activity className="w-4 h-4 mr-1.5" />
                  System Information
                </h2>
              </div>
              <div className="p-5">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Created At</label>
                    <div className="flex items-center mt-0.5">
                      <Clock className="w-3 h-3 text-gray-400 mr-1" />
                      <p className="text-xs text-gray-900">{formatDateTime(employee.createdAt)}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">Last Updated</label>
                    <div className="flex items-center mt-0.5">
                      <Clock className="w-3 h-3 text-gray-400 mr-1" />
                      <p className="text-xs text-gray-900">{formatDateTime(employee.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEmployee;
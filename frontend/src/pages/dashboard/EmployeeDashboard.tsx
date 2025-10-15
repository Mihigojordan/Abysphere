import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
  FileText,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  RefreshCw,
  Filter,
  Grid3X3,
  List,
  Settings,
  Minimize2,
  Calendar,
  MapPin,
  Mail
} from "lucide-react";
import employeeService from "../../services/employeeService";
import departmentService from "../../services/departmentService";
import contractService from "../../services/contractService";
import { useNavigate } from "react-router-dom";
import type { Employee, Department, ContractData, Contract } from "../../types/model";
import { useSocketEvent } from "../../context/SocketContext";
import AddContractModal from "../../components/dashboard/contract/AddContractModal";

type ViewMode = 'table' | 'grid' | 'list';

interface OperationStatus {
  type: "success" | "error" | "info";
  message: string;
}

const EmployeeDashboard: React.FC<{role:string}> = ({role})  => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<keyof Employee>("first_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [deleteConfirm, setDeleteConfirm] = useState<Employee | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeContractStatus, setEmployeeContractStatus] = useState<{ [key: string]: boolean }>({});
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allEmployees, selectedDepartment, selectedStatus]);

  // Real-time socket listeners
  useSocketEvent('contractCreated', (contract: Contract) => {
    showOperationStatus('info', `New contract created${contract.employeeId ? ` for employee ${contract.employeeId}` : ''}!`);
    if (contract.employeeId) {
      setEmployeeContractStatus((prev) => ({
        ...prev,
        [contract.employeeId]: true,
      }));
    }
  });

  useSocketEvent('contractUpdated', (contract: Contract) => {
    showOperationStatus('info', `Contract ${contract.id} updated!`);
  });

  useSocketEvent('contractDeleted', ({ id }: { id: string }) => {
    showOperationStatus('info', `Contract ${id} deleted!`);
    loadData();
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [employeeData, departmentData] = await Promise.all([
        employeeService.getAllEmployees(),
        departmentService.getAllDepartments(),
      ]);
      setAllEmployees(employeeData || []);
      setDepartments(departmentData || []);
      setError(null);

      // Fetch contract status for all employees
      const contractStatus: { [key: string]: boolean } = {};
      for (const employee of employeeData || []) {
        if (employee.id) {
          const contracts = await contractService.getContractsByEmployeeId(employee.id);
          contractStatus[employee.id] = contracts.length > 0;
        }
      }
      setEmployeeContractStatus(contractStatus);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const showOperationStatus = (type: OperationStatus["type"], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allEmployees];

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (emp) =>
          emp.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (selectedDepartment) {
      filtered = filtered.filter(emp => emp.departmentId === selectedDepartment);
    }

    // Status filter (assuming you have status field, otherwise we'll use contract status)
    if (selectedStatus) {
      filtered = filtered.filter(emp => {
        if (selectedStatus === 'active') return emp.id && employeeContractStatus[emp.id];
        if (selectedStatus === 'inactive') return emp.id && !employeeContractStatus[emp.id];
        return true;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (sortBy === "date_hired" || sortBy === "date_of_birth") {
        const aDate = typeof aValue === "string" || aValue instanceof Date ? new Date(aValue) : new Date(0);
        const bDate = typeof bValue === "string" || bValue instanceof Date ? new Date(bValue) : new Date(0);
        return sortOrder === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }

      const aStr = aValue ? aValue.toString().toLowerCase() : "";
      const bStr = bValue ? bValue.toString().toLowerCase() : "";
      
      if (sortOrder === "asc") return aStr > bStr ? 1 : aStr < bStr ? -1 : 0;
      else return aStr < bStr ? 1 : aStr > bStr ? -1 : 0;
    });

    setEmployees(filtered);
    setCurrentPage(1);
  };

  // Calculate summary statistics
  const totalEmployees = allEmployees.length;
  const activeEmployees = allEmployees.filter(emp => emp.id && employeeContractStatus[emp.id]).length;
  const inactiveEmployees = totalEmployees - activeEmployees;
  const newJoiners = allEmployees.filter(emp => {
    if (!emp.date_hired) return false;
    const hiredDate = new Date(emp.date_hired);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return hiredDate >= thirtyDaysAgo;
  }).length;

  const handleAddEmployee = () => {
    navigate('/admin/dashboard/employee-management/create');
  };

  const handleEditEmployee = (employee: Employee) => {
    if (!employee?.id) return;
    navigate(`/admin/dashboard/employee-management/update/${employee.id}`);
  };

  const handleViewEmployee = (employee: Employee) => {
    if (!employee?.id) return;
    navigate(`/admin/dashboard/employee-management/${employee.id}`);
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    try {
      setOperationLoading(true);
      setDeleteConfirm(null);
      await employeeService.deleteEmployee(employee.id);
      loadData();
      showOperationStatus("success", `${employee.first_name} ${employee.last_name} deleted successfully!`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to delete employee");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCreateContract = async (employee: Employee) => {
    try {
      setOperationLoading(true);
      const contracts = await contractService.getContractsByEmployeeId(employee.id);
      if (contracts.length > 0) {
        showOperationStatus('error', 'This employee already has a contract.');
        return;
      }
      setSelectedEmployee(employee);
      setIsContractModalOpen(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showOperationStatus('error', err.message || 'Failed to check existing contracts');
    } finally {
      setOperationLoading(false);
    }
  };

  const handleContractSubmit = async (data: ContractData) => {
    try {
      setOperationLoading(true);
      const validation = contractService.validateContractData(data);
      if (!validation.isValid) {
        showOperationStatus('error', validation.errors.join(', '));
        return;
      }

      const contract = await contractService.createContract(data);
      if (selectedEmployee) {
        await contractService.assignEmployeeToContract(contract.id, selectedEmployee.id);
        setEmployeeContractStatus((prev) => ({
          ...prev,
          [selectedEmployee.id]: true,
        }));
      }
      showOperationStatus('success', 'Contract created and assigned successfully!');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showOperationStatus('error', err.message || 'Failed to create contract');
    } finally {
      setOperationLoading(false);
      setIsContractModalOpen(false);
      setSelectedEmployee(null);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return new Date().toLocaleDateString("en-GB");
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getUrlImage = (url?: string): string | undefined => {
    if (!url) return undefined;
    if (url.includes('http')) return url;
    // Replace with your actual API URL or base URL
    const API_URL = process.env.VITE_API_URL || 'http://localhost:7000';
    return `${API_URL}${url}`;
  };

  const getDepartmentName = (departmentId?: string): string => {
    const department = departments.find((dept) => dept.id === departmentId);
    return department ? department.name : "Unknown";
  };

  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = employees.slice(startIndex, endIndex);

const renderTableView = () => (
  <div className="bg-white rounded border border-gray-200">
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
            <th 
              className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100" 
              onClick={() => setSortBy("first_name")}
            >
              <div className="flex items-center space-x-1">
                <span>Name</span>
                <ChevronDown className={`w-3 h-3 ${sortBy === "first_name" ? "text-primary-600" : "text-gray-400"}`} />
              </div>
            </th>
            <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Email</th>
            <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Department</th>
            <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Created Date</th>
            <th className="text-left py-2 px-2 text-gray-600 font-medium">Status</th>
            <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {currentEmployees.map((employee, index) => (
            <tr key={employee.id || index} className="hover:bg-gray-25">
              {/* Row Number */}
              <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
              
              {/* Name with profile image */}
              <td className="py-2 px-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                    {employee.profile_image ? (
                      <img 
                        src={getUrlImage(employee.profile_image)} 
                        alt={`${employee.first_name} ${employee.last_name}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<span class="text-xs font-medium text-primary-700">
                              ${employee.first_name?.charAt(0) || ''}${employee.last_name?.charAt(0) || ''}
                            </span>`;
                          }
                        }}
                      />
                    ) : (
                      <span className="text-xs font-medium text-primary-700">
                        {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="font-medium text-gray-900 text-xs">
                    {employee.first_name} {employee.last_name}
                  </div>
                </div>
              </td>

              {/* Email */}
              <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{employee.email}</td>

              {/* Department */}
              <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{getDepartmentName(employee.departmentId)}</td>

              {/* Created Date */}
              <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{formatDate(employee.created_at)}</td>

              {/* Status */}
              <td className="py-2 px-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </td>

              {/* Actions */}
              <td className="py-2 px-2">
                <div className="flex items-center justify-end space-x-1">
                  <button 
                    onClick={() => handleViewEmployee(employee)} 
                    className="text-gray-400 hover:text-primary-600 p-1" 
                    title="View"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => handleEditEmployee(employee)} 
                    className="text-gray-400 hover:text-primary-600 p-1" 
                    title="Edit"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm(employee)} 
                    className="text-gray-400 hover:text-red-600 p-1" 
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
      {currentEmployees.map((employee) => (
        <div key={employee.id} className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
              {employee.profile_image ? (
                <img 
                  src={getUrlImage(employee.profile_image)} 
                  alt={`${employee.first_name} ${employee.last_name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="text-xs font-medium text-primary-700">
                        ${employee.first_name?.charAt(0) || ''}${employee.last_name?.charAt(0) || ''}
                      </span>`;
                    }
                  }}
                />
              ) : (
                <span className="text-xs font-medium text-primary-700">
                  {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">
                {employee.first_name} {employee.last_name}
              </div>
              <div className="text-gray-500 text-xs truncate">{employee.position}</div>
            </div>
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
              employee.id && employeeContractStatus[employee.id] 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {employee.id && employeeContractStatus[employee.id] ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <div className="space-y-1 mb-3">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Mail className="w-3 h-3" />
              <span className="truncate">{employee.email}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>{getDepartmentName(employee.departmentId)}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(employee.date_hired)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              <button onClick={() => handleViewEmployee(employee)} className="text-gray-400 hover:text-primary-600 p-1" title="View">
                <Eye className="w-3 h-3" />
              </button>
              <button onClick={() => handleEditEmployee(employee)} className="text-gray-400 hover:text-primary-600 p-1" title="Edit">
                <Edit className="w-3 h-3" />
              </button>
              <button 
                onClick={() => handleCreateContract(employee)} 
                disabled={!!(employee.id && employeeContractStatus[employee.id])}
                className="text-gray-400 hover:text-primary-600 p-1 disabled:opacity-50" 
                title="Contract"
              >
                <FileText className="w-3 h-3" />
              </button>
            </div>
            <button onClick={() => setDeleteConfirm(employee)} className="text-gray-400 hover:text-red-600 p-1" title="Delete">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

// Improved List View (Full Name, Email, Department, Status, Created Date)
const renderListView = () => (
  <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
    {currentEmployees.map((employee) => (
      <div key={employee.id} className="px-4 py-3 hover:bg-gray-25">
        <div className="flex items-center justify-between">
          
          {/* Profile + Name */}
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Profile Image */}
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              {employee.profile_image ? (
                <img 
                  src={getUrlImage(employee.profile_image)} 
                  alt={`${employee.first_name} ${employee.last_name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="text-sm font-medium text-primary-700">
                        ${employee.first_name?.charAt(0) || ''}${employee.last_name?.charAt(0) || ''}
                      </span>`;
                    }
                  }}
                />
              ) : (
                <span className="text-sm font-medium text-primary-700">
                  {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                </span>
              )}
            </div>

            {/* Full Name */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-sm truncate">
                {employee.first_name} {employee.last_name}
              </div>
            </div>
          </div>

          {/* Info Columns */}
          <div className="hidden md:grid grid-cols-4 gap-4 text-xs text-gray-600 flex-1 max-w-3xl px-4">
            <span className="truncate">{employee.email}</span>
            <span className="truncate">{getDepartmentName(employee.departmentId)}</span>
            <span className="text-green-700 font-medium">Active</span>
            <span>{formatDate(employee.created_at)}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button 
              onClick={() => handleViewEmployee(employee)} 
              className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors" 
              title="View Employee"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleEditEmployee(employee)} 
              className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors" 
              title="Edit Employee"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setDeleteConfirm(employee)} 
              className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors" 
              title="Delete Employee"
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
          Showing {startIndex + 1}-{Math.min(endIndex, employees.length)} of {employees.length}
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
                  ? "bg-primary-500 text-white"
                  : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
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
      {/* Header */}
 <div className="bg-white shadow-md">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Toggle Sidebar"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Employee Management</h1>
                <p className="text-xs text-gray-500 mt-0.5">Manage your organization's workforce</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleAddEmployee}
                disabled={operationLoading}
                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
                <span>Add Employee</span>
              </button>
            </div>
          </div>
        </div>
      </div>

<div className="px-4 py-4 space-y-4">
  {/* Summary Cards */}
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    {/* Total Employees */}
    <div className="bg-white rounded shadow p-4">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-primary-100 rounded-full flex items-center justify-center">
          <Users className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <p className="text-xs text-gray-600">Total Employees</p>
          <p className="text-lg font-semibold text-gray-900">{totalEmployees}</p>
        </div>
      </div>
    </div>

    {/* Active */}
    <div className="bg-white rounded shadow p-4">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-green-100 rounded-full flex items-center justify-center">
          <UserCheck className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="text-xs text-gray-600">Active</p>
          <p className="text-lg font-semibold text-gray-900">{activeEmployees}</p>
        </div>
      </div>
    </div>

    {/* Inactive */}
    <div className="bg-white rounded shadow p-4">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-orange-100 rounded-full flex items-center justify-center">
          <UserX className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <p className="text-xs text-gray-600">Inactive</p>
          <p className="text-lg font-semibold text-gray-900">{inactiveEmployees}</p>
        </div>
      </div>
    </div>

    {/* New Joiners */}
    <div className="bg-white rounded shadow p-4">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-purple-100 rounded-full flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <p className="text-xs text-gray-600">New Joiners (30d)</p>
          <p className="text-lg font-semibold text-gray-900">{newJoiners}</p>
        </div>
      </div>
    </div>
  </div>





        {/* Controls */}
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
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
                  const [field, order] = e.target.value.split("-") as [keyof Employee, "asc" | "desc"];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="first_name-asc">Name (A-Z)</option>
                <option value="first_name-desc">Name (Z-A)</option>
                <option value="position-asc">Position (A-Z)</option>
                <option value="date_hired-desc">Newest</option>
                <option value="date_hired-asc">Oldest</option>
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
                  <Settings className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Filters */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
                
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                
                {(selectedDepartment || selectedStatus) && (
                  <button
                    onClick={() => {
                      setSelectedDepartment("");
                      setSelectedStatus("");
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="inline-flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Loading employees...</span>
            </div>
          </div>
        ) : currentEmployees.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm || selectedDepartment || selectedStatus ? 'No employees found matching your criteria' : 'No employees found'}
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

      {/* Modals and Status */}
      <AddContractModal
        isOpen={isContractModalOpen}
        onClose={() => {
          setIsContractModalOpen(false);
          setSelectedEmployee(null);
        }}
        onSubmit={handleContractSubmit}
        departments={departments}
        loading={operationLoading}
        employee={selectedEmployee}
      />

      {operationStatus && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded shadow-lg text-xs ${
            operationStatus.type === "success" ? "bg-green-50 border border-green-200 text-green-800" :
            operationStatus.type === "error" ? "bg-red-50 border border-red-200 text-red-800" :
            "bg-primary-50 border border-primary-200 text-primary-800"
          }`}>
            {operationStatus.type === "success" && <CheckCircle className="w-4 h-4 text-green-600" />}
            {operationStatus.type === "error" && <XCircle className="w-4 h-4 text-red-600" />}
            {operationStatus.type === "info" && <AlertCircle className="w-4 h-4 text-primary-600" />}
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

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-4 w-full max-w-sm">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Delete Employee</h3>
                <p className="text-xs text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {deleteConfirm.first_name} {deleteConfirm.last_name}
                </span>
                ?
              </p>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1.5 text-xs text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEmployee(deleteConfirm)}
                className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;
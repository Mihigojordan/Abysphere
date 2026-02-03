import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  Copy,
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
} from "lucide-react";
import contractService from "../../services/contractService";
import employeeService from "../../services/employeeService";
import departmentService from "../../services/departmentService";
import { useSocket, useSocketEvent } from "../../context/SocketContext";
import AddContractModal from "../../components/dashboard/contract/AddContractModal";
import EditContractModal from "../../components/dashboard/contract/EditContractModal";
import ViewContractModal from "../../components/dashboard/contract/ViewContractModal";
import DeleteConfirmModal from "../../components/dashboard/contract/DeleteConfirmModal";
import type { Contract, Employee, Department, ContractData } from "../../types/model";

interface OperationStatus {
  type: "success" | "error" | "info";
  message: string;
}

const ContractDashboard: React.FC<{role:string}> = ({role})  => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [allContracts, setAllContracts] = useState<Contract[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("startDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Contract | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);

  // Socket connection
  const { isConnected, emit } = useSocket();

  // Socket event listeners for real-time updates
  useSocketEvent('contractCreated', (newContract: Contract) => {
    setAllContracts(prev => [newContract, ...prev]);
    showOperationStatus("info", "New contract added by another user");
  });

  useSocketEvent('contractUpdated', (updatedContract: Contract) => {
    setAllContracts(prev => 
      prev.map(contract => 
        contract.id === updatedContract.id ? updatedContract : contract
      )
    );
    showOperationStatus("info", "Contract updated by another user");
  });

  useSocketEvent('contractDeleted', (data: { id: string }) => {
    setAllContracts(prev => prev.filter(contract => contract.id !== data.id));
    showOperationStatus("info", "Contract deleted by another user");
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allContracts]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contractData, employeeData, departmentData] = await Promise.all([
        contractService.getAllContracts(),
        employeeService.getAllEmployees(),
        departmentService.getAllDepartments(),
      ]);
      setAllContracts(contractData || []);
      setEmployees(employeeData || []);
      setDepartments(departmentData || []);
      setError(null);
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
    let filtered = [...allContracts];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (contract) =>
          contract.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contract.contractType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          getAssignedEmployeesNames(contract.employeeIds).some(name => 
            name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    filtered.sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";

      // Handle date fields
      if (sortBy === "startDate" || sortBy === "endDate" || sortBy === "createdAt") {
        const aDate = new Date(a[sortBy as keyof Contract] as string | Date);
        const bDate = new Date(b[sortBy as keyof Contract] as string | Date);
        aValue = aDate.getTime();
        bValue = bDate.getTime();
      } 
      // Handle employee count
      else if (sortBy === "employeeCount") {
        aValue = (a.employeeIds?.length || 0);
        bValue = (b.employeeIds?.length || 0);
      } 
      // Handle salary
      else if (sortBy === "salary") {
        aValue = a.salary || 0;
        bValue = b.salary || 0;
      }
      // Default string comparison
      else {
        aValue = (a[sortBy as keyof Contract] ?? "").toString().toLowerCase();
        bValue = (b[sortBy as keyof Contract] ?? "").toString().toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

    setContracts(filtered);
    setCurrentPage(1);
  };

  const handleAddContract = async (contractData: ContractData) => {
    try {
      setOperationLoading(true);
      const validation = contractService.validateContractData(contractData);
      if (!validation.isValid) {
        showOperationStatus("error", validation.errors.join(", "));
        return;
      }

      const newContract = await contractService.createContract(contractData);
      setShowAddModal(false);
      
      // Emit socket event for real-time updates
      if (isConnected) {
        emit('contractCreated', newContract);
      }
      
      // Reload data to ensure consistency
      loadData();
      showOperationStatus("success", "Contract created successfully!");
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to create contract");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditContract = async (contractData: ContractData) => {
    try {
      setOperationLoading(true);
      const validation = contractService.validateContractData(contractData);
      if (!validation.isValid) {
        showOperationStatus("error", validation.errors.join(", "));
        return;
      }

      const updatedContract = await contractService.updateContract(contractData.id, contractData);
      setEditingContract(null);
      
      // Emit socket event for real-time updates
      if (isConnected) {
        emit('contractUpdated', updatedContract);
      }
      
      // Reload data to ensure consistency
      loadData();
      showOperationStatus("success", "Contract updated successfully!");
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to update contract");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteContract = async (contract: Contract) => {
    try {
      setOperationLoading(true);
      setDeleteConfirm(null);
      
      await contractService.deleteContract(contract.id);
      
      // Emit socket event for real-time updates
      if (isConnected) {
        emit('contractDeleted', { id: contract.id });
      }
      
      // Reload data to ensure consistency
      loadData();
      showOperationStatus("success", `Contract "${contract.title}" deleted successfully!`);
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to delete contract");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ChevronDown className="w-4 h-4 text-gray-400" />;
    }
    return (
      <ChevronDown
        className={`w-4 h-4 text-primary-600 transition-transform ${
          sortOrder === "desc" ? "rotate-180" : ""
        }`}
      />
    );
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "RWF"): string => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getAssignedEmployeesNames = (employeeIds?: string[]): string[] => {
    if (!employeeIds || employeeIds.length === 0) return [];
    return employeeIds
      .map(id => {
        const employee = employees.find(emp => emp.id === id);
        return employee ? `${employee.first_name} ${employee.last_name}` : null;
      })
      .filter(Boolean) as string[];
  };

  const renderAssignedEmployees = (employeeIds?: string[], maxDisplay: number = 2): JSX.Element => {
    const employeeNames = getAssignedEmployeesNames(employeeIds);
    
    if (employeeNames.length === 0) {
      return <span className="text-gray-500 italic">No employees assigned</span>;
    }

    const displayNames = employeeNames.slice(0, maxDisplay);
    const remainingCount = employeeNames.length - maxDisplay;

    return (
      <div className="flex flex-col">
        {displayNames.map((name, index) => (
          <span key={index} className="text-sm text-gray-700">{name}</span>
        ))}
        {remainingCount > 0 && (
          <span className="text-xs text-gray-500">+{remainingCount} more</span>
        )}
      </div>
    );
  };

  const totalPages = Math.ceil(contracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContracts = contracts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-4 py-3 border-t">
        <div className="flex items-center text-sm text-gray-700 mb-4 sm:mb-0">
          <span>
            Showing {startIndex + 1} to {Math.min(endIndex, contracts.length)} of{" "}
            {contracts.length} results
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </button>
          <div className="flex space-x-1">
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  currentPage === page
                    ? "bg-primary-500 text-white"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3 mb-4 sm:mb-0">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Contract Management
              </h1>
              {/* Socket connection status indicator */}
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                   title={isConnected ? 'Connected' : 'Disconnected'}></div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={operationLoading}
              className="flex items-center justify-center space-x-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contract</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 sm:flex-none">
                  <input
                    type="text"
                    placeholder="Search contracts..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Sort By:</span>
                <div className="relative">
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const [field, order] = e.target.value.split("-") as [string, "asc" | "desc"];
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    className="text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="startDate-desc">Newest Start Date</option>
                    <option value="startDate-asc">Oldest Start Date</option>
                    <option value="title-asc">Title (A-Z)</option>
                    <option value="title-desc">Title (Z-A)</option>
                    <option value="contractType-asc">Contract Type (A-Z)</option>
                    <option value="contractType-desc">Contract Type (Z-A)</option>
                    <option value="salary-desc">Highest Salary</option>
                    <option value="salary-asc">Lowest Salary</option>
                    <option value="employeeCount-desc">Most Employees</option>
                    <option value="employeeCount-asc">Least Employees</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="inline-flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading contracts...</span>
                </div>
              </div>
            ) : currentContracts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {searchTerm ? `No contracts found for "${searchTerm}"` : "No contracts found"}
              </div>
            ) : (
              <>
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left py-3 px-4 sm:px-6 text-sm font-medium text-gray-500">
                        #
                      </th>
                      <th
                        className="text-left py-3 px-4 sm:px-6 text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort("title")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Title</span>
                          {getSortIcon("title")}
                        </div>
                      </th>
                      <th
                        className="text-left py-3 px-4 sm:px-6 text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100 hidden md:table-cell"
                        onClick={() => handleSort("contractType")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Type</span>
                          {getSortIcon("contractType")}
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 sm:px-6 text-sm font-medium text-gray-500 hidden lg:table-cell">
                        Assigned Employees
                      </th>
                      <th
                        className="text-left py-3 px-4 sm:px-6 text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100 hidden sm:table-cell"
                        onClick={() => handleSort("salary")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Salary</span>
                          {getSortIcon("salary")}
                        </div>
                      </th>
                      <th
                        className="text-left py-3 px-4 sm:px-6 text-sm font-medium text-gray-500 cursor-pointer hover:bg-gray-100 hidden sm:table-cell"
                        onClick={() => handleSort("startDate")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Start Date</span>
                          {getSortIcon("startDate")}
                        </div>
                      </th>
                      <th className="text-right py-3 px-4 sm:px-6 text-sm font-medium text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentContracts.map((contract, index) => (
                      <tr key={contract.id || index} className="hover:bg-gray-50">
                        <td className="py-4 px-4 sm:px-6 text-gray-700 text-sm">
                          {startIndex + index + 1}
                        </td>
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 text-sm sm:text-base">
                              {contract.title || "Untitled"}
                            </span>
                            <span className="text-xs text-gray-500 md:hidden">
                              {contract.contractType || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-gray-700 text-sm hidden md:table-cell">
                          {contract.contractType || "N/A"}
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-gray-700 text-sm hidden lg:table-cell">
                          {renderAssignedEmployees(contract.employeeIds)}
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-gray-700 text-sm hidden sm:table-cell">
                          {formatCurrency(contract.salary, contract.currency)}
                        </td>
                        <td className="py-4 px-4 sm:px-6 text-gray-700 text-sm hidden sm:table-cell">
                          {formatDate(contract.startDate)}
                        </td>
                        <td className="py-4 px-4 sm:px-6">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => setViewingContract(contract)}
                              className="text-gray-400 hover:text-primary-600 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingContract(contract)}
                              disabled={operationLoading}
                              className="text-gray-400 hover:text-primary-600 transition-colors disabled:opacity-50"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(contract)}
                              disabled={operationLoading}
                              className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </div>

      {operationStatus && (
        <div className="fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg border ${
              operationStatus.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : operationStatus.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-primary-50 border-primary-200 text-primary-800"
            }`}
          >
            {operationStatus.type === "success" && (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            {operationStatus.type === "error" && (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            {operationStatus.type === "info" && (
              <AlertCircle className="w-5 h-5 text-primary-600" />
            )}
            <span className="font-medium">{operationStatus.message}</span>
            <button
              onClick={() => setOperationStatus(null)}
              className="ml-2 hover:opacity-70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {operationLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-700 font-medium">Processing...</span>
            </div>
          </div>
        </div>
      )}

      <AddContractModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddContract}
        employees={employees}
        departments={departments}
        loading={operationLoading}
      />

      {editingContract && (
        <EditContractModal
          isOpen={!!editingContract}
          onClose={() => setEditingContract(null)}
          onSubmit={handleEditContract}
          contract={editingContract}
          employees={employees}
          departments={departments}
          loading={operationLoading}
        />
      )}

      {viewingContract && (
        <ViewContractModal
          isOpen={!!viewingContract}
          onClose={() => setViewingContract(null)}
          contract={viewingContract}
          getAssignedEmployeesNames={(employeeIds) => getAssignedEmployeesNames(employeeIds)}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />
      )}

      {deleteConfirm && (
        <DeleteConfirmModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={() => handleDeleteContract(deleteConfirm)}
          contract={deleteConfirm}
          contractTitle={deleteConfirm.title}
        />
      )}
    </div>
  );
};

export default ContractDashboard;
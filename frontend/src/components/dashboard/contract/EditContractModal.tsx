import { type FC, useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Contract, Employee, Department, ContractData } from '../../../types/model';

interface EditContractData {
  id: string;
  employeeId: string;
  departmentId: string;
  contractType: string;
  startDate: string;
  endDate?: string;
  salary: string;
  currency: string;
  status: string;
}

interface EditContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contractData: ContractData) => void;
  contract: Contract;
  employees: Employee[];
  departments: Department[];
  loading: boolean;
}

const EditContractModal: FC<EditContractModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  contract,
  employees,
  departments,
  loading,
}) => {
  const [editContract, setEditContract] = useState<ContractData>({
    id: contract.id,
    employeeId: contract.employeeId || '',
    departmentId: contract.departmentId || '',
    contractType: contract.contractType || '',
    startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
    endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
    salary: contract.salary ? String(contract.salary) : '',
    currency: contract.currency || 'RWF',
    status: contract.status || 'ACTIVE',
  });

  useEffect(() => {
    setEditContract({
      id: contract.id,
      employeeId: contract.employeeId || '',
      departmentId: contract.departmentId || '',
      contractType: contract.contractType || '',
      startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
      endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
      salary: contract.salary ? String(contract.salary) : '',
      currency: contract.currency || 'RWF',
      status: contract.status || 'ACTIVE',
    });
  }, [contract]);

  const handleSubmit = () => {
    onSubmit(editContract);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Edit Contract</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              value={editContract.employeeId}
              onChange={(e) =>
                setEditContract({ ...editContract, employeeId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.first_name} {emp.last_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={editContract.departmentId}
              onChange={(e) =>
                setEditContract({ ...editContract, departmentId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contract Type</label>
            <select
              value={editContract.contractType}
              onChange={(e) =>
                setEditContract({ ...editContract, contractType: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Contract Type</option>
              <option value="PROBATION">Probation</option>
              <option value="PERMANENT">Permanent</option>
              <option value="TEMPORARY">Temporary</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={editContract.startDate}
              onChange={(e) =>
                setEditContract({ ...editContract, startDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date (Optional)
            </label>
            <input
              type="date"
              value={editContract.endDate}
              onChange={(e) =>
                setEditContract({ ...editContract, endDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
            <input
              type="number"
              value={editContract.salary}
              onChange={(e) =>
                setEditContract({ ...editContract, salary: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter salary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
            <input
              type="text"
              value={editContract.currency}
              onChange={(e) =>
                setEditContract({ ...editContract, currency: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter currency (e.g., RWF)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={editContract.status}
              onChange={(e) =>
                setEditContract({ ...editContract, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="TERMINATED">Terminated</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
            aria-label="Cancel edit"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
            aria-label="Update contract"
          >
            Update Contract
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditContractModal;
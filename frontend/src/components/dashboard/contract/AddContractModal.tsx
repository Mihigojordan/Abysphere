import React, { type FC, useState } from 'react';
import { X } from 'lucide-react';
import type { Contract, Department, ContractData, Employee } from '../../../types/model';

interface AddContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (contractData: ContractData) => void;
  departments: Department[];
  loading: boolean;
  employee?: Employee;
}

const AddContractModal: FC<AddContractModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  departments,
  loading,
  employee,
}) => {
  const [newContract, setNewContract] = useState<Partial<ContractData>>({
    contractType: 'PERMANENT',
    startDate: '',
    endDate: '',
    salary: 0,
    currency: 'RWF',
    benefits: '',
    workingHours: '',
    probationPeriod: '',
    terminationConditions: '',
    terms: '',
  });

  const handleSubmit = () => {
    const contractData: ContractData = {
      ...newContract as ContractData,
      salary: typeof newContract.salary === 'string' ? parseFloat(newContract.salary) : (newContract.salary || 0),
    };

    onSubmit(contractData);
    
    setNewContract({
      contractType: 'PERMANENT',
      startDate: '',
      endDate: '',
      salary: 0,
      currency: 'RWF',
      benefits: '',
      workingHours: '',
      probationPeriod: '',
      terminationConditions: '',
      terms: '',
    });
    onClose();
  };

  const handleClose = () => {
    setNewContract({
      contractType: 'PERMANENT',
      startDate: '',
      endDate: '',
      salary: 0,
      currency: 'RWF',
      benefits: '',
      workingHours: '',
      probationPeriod: '',
      terminationConditions: '',
      terms: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">Add New Contract</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {employee && (
          <p className="text-sm text-gray-500 mb-4">
            Creating contract for: {employee.first_name} {employee.last_name}
          </p>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contract Type <span className="text-red-500">*</span>
            </label>
            <select
              value={newContract.contractType || ''}
              onChange={(e) =>
                setNewContract({ ...newContract, contractType: e.target.value as any })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="PERMANENT">Permanent</option>
              <option value="TEMPORARY">Temporary</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={newContract.startDate || ''}
                onChange={(e) =>
                  setNewContract({ ...newContract, startDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={newContract.endDate || ''}
                onChange={(e) =>
                  setNewContract({ ...newContract, endDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={newContract.salary || ''}
                onChange={(e) =>
                  setNewContract({ ...newContract, salary: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter salary amount"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={newContract.currency || 'RWF'}
                onChange={(e) =>
                  setNewContract({ ...newContract, currency: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="RWF">RWF (Rwandan Franc)</option>
                <option value="USD">USD (US Dollar)</option>
                <option value="EUR">EUR (Euro)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Working Hours
              </label>
              <input
                type="text"
                value={newContract.workingHours || ''}
                onChange={(e) =>
                  setNewContract({ ...newContract, workingHours: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 9 AM - 5 PM, Monday to Friday"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Probation Period
              </label>
              <input
                type="text"
                value={newContract.probationPeriod || ''}
                onChange={(e) =>
                  setNewContract({ ...newContract, probationPeriod: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 3 months"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Benefits</label>
            <textarea
              value={newContract.benefits || ''}
              onChange={(e) =>
                setNewContract({ ...newContract, benefits: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="List employee benefits (health insurance, vacation days, etc.)"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terms and Conditions
            </label>
            <textarea
              value={newContract.terms || ''}
              onChange={(e) =>
                setNewContract({ ...newContract, terms: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter contract terms and conditions"
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Termination Conditions
            </label>
            <textarea
              value={newContract.terminationConditions || ''}
              onChange={(e) =>
                setNewContract({ ...newContract, terminationConditions: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Specify conditions for contract termination"
              rows={3}
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6 pt-4 border-t">
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !newContract.startDate || !newContract.salary}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Contract'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddContractModal;
import React from "react";
import {
  X,
  User,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  AlertCircle,
} from "lucide-react";
import type { Contract } from "../../../types/model";


interface ViewContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: Contract | null;
  getEmployeeName?: (id: string) => string;
  getDepartmentName?: (id: string) => string;
  formatDate?: (date: string) => string;
}

const ViewContractModal: React.FC<ViewContractModalProps> = ({
  isOpen,
  onClose,
  contract,
  getEmployeeName,
  getDepartmentName,
  formatDate,
}) => {
  if (!isOpen || !contract) return null;

  const getStatusColor = (status: Contract["status"]): string => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "EXPIRED":
        return "bg-red-100 text-red-800 border-red-200";
      case "TERMINATED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getContractTypeColor = (type: Contract["contractType"]): string => {
    switch (type) {
      case "PERMANENT":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PROBATION":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "TEMPORARY":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "INTERNSHIP":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatSalary = (salary: number, currency?: string): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "RWF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(salary);
  };

  const isContractExpiringSoon = (): boolean => {
    if (!contract.endDate) return false;
    const endDate = new Date(contract.endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const getDaysUntilExpiry = (): number | null => {
    if (!contract.endDate) return null;
    const endDate = new Date(contract.endDate);
    const today = new Date();
    return Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Contract Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Contract ID: {contract.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status and Type */}
          <div className="flex flex-wrap gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                contract.status
              )}`}
            >
              {contract.status}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${getContractTypeColor(
                contract.contractType
              )}`}
            >
              {contract.contractType}
            </span>
            {isContractExpiringSoon() && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Expires in {getDaysUntilExpiry()} days
              </span>
            )}
          </div>

          {/* Employee and Department Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Employee</p>
                  <p className="text-lg text-gray-900">
                    {getEmployeeName
                      ? getEmployeeName(contract.employeeId)
                      : contract.employeeId}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Department
                  </p>
                  <p className="text-lg text-gray-900">
                    {getDepartmentName
                      ? getDepartmentName(contract.departmentId)
                      : contract.departmentId}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contract Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Start Date</p>
                <p className="text-lg text-gray-900">
                  {formatDate
                    ? formatDate(contract.startDate)
                    : new Date(contract.startDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calendar className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">End Date</p>
                <p className="text-lg text-gray-900">
                  {contract.endDate
                    ? formatDate
                      ? formatDate(contract.endDate)
                      : new Date(contract.endDate).toLocaleDateString()
                    : "No end date"}
                </p>
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Salary</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatSalary(Number(contract?.salary) || 0, "RWF")}
                </p>
                <p className="text-sm text-gray-500">
                  Currency: {contract.currency || "RWF"}
                  {contract.currency && contract.currency.length !== 3 && (
                    <span className="text-red-500 ml-2">
                      (Invalid currency code)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Contract Duration */}
          {contract.endDate && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Clock className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Contract Duration
                </p>
                <p className="text-lg text-gray-900">
                  {Math.ceil(
                    (new Date(contract.endDate).getTime() -
                      new Date(contract.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days
                </p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Contract Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <span className="ml-2 text-gray-900">
                  {formatDate
                    ? formatDate(contract?.createdAt!)
                    : new Date(contract?.createdAt!).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Last Updated:</span>
                <span className="ml-2 text-gray-900">
                  {formatDate
                    ? formatDate(contract.updatedAt!)
                    : new Date(contract.updatedAt!).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewContractModal;

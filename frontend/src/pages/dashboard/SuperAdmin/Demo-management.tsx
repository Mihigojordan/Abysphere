/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import {
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
  Building2,
  Grid3X3,
  List,
  RefreshCw,
  Calendar,
  Check,
  X as XIcon,
} from "lucide-react";
import demoRequestService from "../../../services/demoRequestService"; // Adjusted import path

interface DemoRequest {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  companyWebsite?: string;
  companyDescription?: string;
  companySize?: string;
  message?: string;
  status?: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt?: string;
}

interface OperationStatus {
  type: "success" | "error" | "info";
  message: string;
}

type ViewMode = "table" | "grid" | "list";

const DemoRequestsDashboard: React.FC<{ role: string }> = ({ role }) => {
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
  const [allDemoRequests, setAllDemoRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<keyof DemoRequest>("fullName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [viewingDemoRequest, setViewingDemoRequest] = useState<DemoRequest | null>(null);
  const [rejectConfirm, setRejectConfirm] = useState<DemoRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [approveConfirm, setApproveConfirm] = useState<DemoRequest | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    loadDemoRequests();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allDemoRequests]);

  const loadDemoRequests = async () => {
    try {
      const data = await demoRequestService.findAll();
      setAllDemoRequests(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load demo requests");
    } finally {
      setLoading(false);
    }
  };

  const showOperationStatus = (type: OperationStatus["type"], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allDemoRequests];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (request) =>
          request.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let aValue = a[sortBy] ?? "";
      let bValue = b[sortBy] ?? "";
      if (sortBy === "createdAt") {
        const dateA = new Date(aValue as string).getTime();
        const dateB = new Date(bValue as string).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        const strA = aValue.toString().toLowerCase();
        const strB = bValue.toString().toLowerCase();
        return sortOrder === "asc" ? strA.localeCompare(strB) : strB.localeCompare(strA);
      }
    });

    setDemoRequests(filtered);
    setCurrentPage(1);
  };

  const handleApproveDemoRequest = async (request: DemoRequest) => {
    try {
      setOperationLoading(true);
      setApproveConfirm(null);
      await demoRequestService.approve(request.id);
      loadDemoRequests();
      showOperationStatus("success", `${request.fullName}'s demo request approved successfully!`);
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to approve demo request");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleRejectDemoRequest = async (request: DemoRequest) => {
    try {
      setOperationLoading(true);
      setRejectConfirm(null);
      await demoRequestService.reject(request.id, rejectionReason || "No reason provided");
      setRejectionReason("");
      loadDemoRequests();
      showOperationStatus("success", `${request.fullName}'s demo request rejected successfully!`);
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to reject demo request");
    } finally {
      setOperationLoading(false);
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) {
      return new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalPages = Math.ceil(demoRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDemoRequests = demoRequests.slice(startIndex, endIndex);

  // Summary statistics
  const totalDemoRequests = allDemoRequests.length;
  const pendingDemoRequests = allDemoRequests.filter((request) => request.status === "pending").length;
  // Add these inside your component, where you compute totalDemoRequests and pendingDemoRequests
const approvedDemoRequests = allDemoRequests.filter((request) => request.status === "approved").length;
const rejectedDemoRequests = allDemoRequests.filter((request) => request.status === "rejected").length;

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
                  setSortBy("fullName");
                  setSortOrder(sortBy === "fullName" && sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Full Name</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === "fullName" ? "text-primary-600" : "text-gray-400"}`} />
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Email</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Company</th>
                <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Status</th>
             
              <th
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100 hidden sm:table-cell"
                onClick={() => {
                  setSortBy("createdAt");
                  setSortOrder(sortBy === "createdAt" && sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Created Date</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === "createdAt" ? "text-primary-600" : "text-gray-400"}`} />
                </div>
              </th>
              <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentDemoRequests.map((request, index) => (
              <tr key={request.id || index} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-700">
                        {request.fullName?.charAt(0) || "R"}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 text-xs">
                      {request.fullName || "Unnamed Request"}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">
                  {request.email || "No email provided"}
                </td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">
                  {request.companyName || "No company provided"}
                </td>
                      <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">
                <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  request.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : request.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {request.status || "Pending"}
              </span>
                </td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">
                  {formatDate(request.createdAt)}
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => setViewingDemoRequest(request)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="View"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    {request.status === "pending" && (
                      <>
                        <button
                          onClick={() => setApproveConfirm(request)}
                          disabled={operationLoading}
                          className="text-gray-400 hover:text-green-600 p-1 disabled:opacity-50"
                          title="Approve"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setRejectConfirm(request)}
                          disabled={operationLoading}
                          className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50"
                          title="Reject"
                        >
                          <XIcon className="w-3 h-3" />
                        </button>
                      </>
                    )}
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
      {currentDemoRequests.map((request) => (
        <div key={request.id} className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-primary-700">
                {request.fullName?.charAt(0) || "R"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">
                {request.fullName || "Unnamed Request"}
              </div>
              <div className="text-gray-500 text-xs truncate">
                {request.companyName || "No company provided"}
              </div>
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(request.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  request.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : request.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {request.status || "Pending"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-1">
            <button
              onClick={() => setViewingDemoRequest(request)}
              className="text-gray-400 hover:text-primary-600 p-1"
              title="View"
            >
              <Eye className="w-3 h-3" />
            </button>
            {request.status === "pending" && (
              <>
                <button
                  onClick={() => setApproveConfirm(request)}
                  disabled={operationLoading}
                  className="text-gray-400 hover:text-green-600 p-1 disabled:opacity-50"
                  title="Approve"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setRejectConfirm(request)}
                  disabled={operationLoading}
                  className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50"
                  title="Reject"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
      {currentDemoRequests.map((request) => (
        <div key={request.id} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">
                  {request.fullName?.charAt(0) || "R"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">
                  {request.fullName || "Unnamed Request"}
                </div>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
              <span className="truncate">{request.email || "No email provided"}</span>
              <span>{formatDate(request.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => setViewingDemoRequest(request)}
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                title="View Demo Request"
              >
                <Eye className="w-4 h-4" />
              </button>
              {request.status === "pending" && (
                <>
                  <button
                    onClick={() => setApproveConfirm(request)}
                    disabled={operationLoading}
                    className="text-gray-400 hover:text-green-600 p-1.5 rounded-full hover:bg-green-50 transition-colors disabled:opacity-50"
                    title="Approve Demo Request"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRejectConfirm(request)}
                    disabled={operationLoading}
                    className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Reject Demo Request"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </>
              )}
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
          Showing {startIndex + 1}-{Math.min(endIndex, demoRequests.length)} of {demoRequests.length}
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
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Demo Requests Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage incoming demo requests</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadDemoRequests}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
  <div className="bg-white rounded shadow p-4">
    <div className="flex items-center space-x-3">
      <div className="p-3 bg-primary-100 rounded-full flex items-center justify-center">
        <Building2 className="w-5 h-5 text-primary-600" />
      </div>
      <div>
        <p className="text-xs text-gray-600">Total Demo Requests</p>
        <p className="text-lg font-semibold text-gray-900">{totalDemoRequests}</p>
      </div>
    </div>
  </div>
  <div className="bg-white rounded shadow p-4">
    <div className="flex items-center space-x-3">
      <div className="p-3 bg-yellow-100 rounded-full flex items-center justify-center">
        <AlertCircle className="w-5 h-5 text-yellow-600" />
      </div>
      <div>
        <p className="text-xs text-gray-600">Pending Demo Requests</p>
        <p className="text-lg font-semibold text-gray-900">{pendingDemoRequests}</p>
      </div>
    </div>
  </div>

  {/* New Approved Card */}
  <div className="bg-white rounded shadow p-4">
    <div className="flex items-center space-x-3">
      <div className="p-3 bg-green-100 rounded-full flex items-center justify-center">
        <Check className="w-5 h-5 text-green-600" />
      </div>
      <div>
        <p className="text-xs text-gray-600">Approved Demo Requests</p>
        <p className="text-lg font-semibold text-gray-900">{approvedDemoRequests}</p>
      </div>
    </div>
  </div>

  {/* New Rejected Card */}
  <div className="bg-white rounded shadow p-4">
    <div className="flex items-center space-x-3">
      <div className="p-3 bg-red-100 rounded-full flex items-center justify-center">
        <XIcon className="w-5 h-5 text-red-600" />
      </div>
      <div>
        <p className="text-xs text-gray-600">Rejected Demo Requests</p>
        <p className="text-lg font-semibold text-gray-900">{rejectedDemoRequests}</p>
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
                  placeholder="Search demo requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  aria-label="Search demo requests"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-") as [keyof DemoRequest, "asc" | "desc"];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                aria-label="Sort demo requests"
              >
                <option value="fullName-asc">Name (A-Z)</option>
                <option value="fullName-desc">Name (Z-A)</option>
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
              </select>
              <div className="flex items-center border border-gray-200 rounded">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === "table" ? "bg-primary-50 text-primary-600" : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Table View"
                >
                  <List className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === "grid" ? "bg-primary-50 text-primary-600" : "text-gray-400 hover:text-gray-600"
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === "list" ? "bg-primary-50 text-primary-600" : "text-gray-400 hover:text-gray-600"
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
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded"
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-xs">{error}</div>
        )}

        {loading ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="inline-flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Loading demo requests...</span>
            </div>
          </div>
        ) : currentDemoRequests.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm ? `No demo requests found for "${searchTerm}"` : "No demo requests found"}
            </div>
          </div>
        ) : (
          <div>
            {viewMode === "table" && renderTableView()}
            {viewMode === "grid" && renderGridView()}
            {viewMode === "list" && renderListView()}
            {renderPagination()}
          </div>
        )}

        {/* Modals and Status */}
        {operationStatus && (
          <div className="fixed top-4 right-4 z-50">
            <div
              className={`flex items-center space-x-2 px-3 py-2 rounded shadow-lg text-xs ${
                operationStatus.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : operationStatus.type === "error"
                  ? "bg-red-50 border border-red-200 text-red-800"
                  : "bg-primary-50 border border-primary-200 text-primary-800"
              }`}
            >
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

        {approveConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded p-4 w-full max-w-sm">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Approve Demo Request</h3>
                  <p className="text-xs text-gray-500">This will approve the demo request</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-xs text-gray-700">
                  Are you sure you want to approve{" "}
                  <span className="font-semibold">"{approveConfirm.fullName}"</span>'s demo request?
                </p>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => setApproveConfirm(null)}
                  className="px-3 py-1.5 text-xs text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApproveDemoRequest(approveConfirm)}
                  className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}

        {rejectConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded p-4 w-full max-w-sm">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Reject Demo Request</h3>
                  <p className="text-xs text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-xs text-gray-700">
                  Are you sure you want to reject{" "}
                  <span className="font-semibold">"{rejectConfirm.fullName}"</span>'s demo request?
                </p>
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Rejection Reason (optional)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 h-20 resize-none"
                    placeholder="Enter rejection reason"
                    aria-label="Rejection reason"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2">
                <button
                  onClick={() => {
                    setRejectConfirm(null);
                    setRejectionReason("");
                  }}
                  className="px-3 py-1.5 text-xs text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectDemoRequest(rejectConfirm)}
                  className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {viewingDemoRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded p-4 w-full max-w-sm max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Demo Request Details</h3>
                <button
                  onClick={() => setViewingDemoRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close view modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">
                    {viewingDemoRequest.fullName || "Unnamed Request"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">
                    {viewingDemoRequest.email || "No email provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">
                    {viewingDemoRequest.phone || "No phone provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">
                    {viewingDemoRequest.companyName || "No company provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Company Website</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">
                    {viewingDemoRequest.companyWebsite || "No website provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Company Description</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs min-h-[60px]">
                    {viewingDemoRequest.companyDescription || "No description provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Company Size</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">
                    {viewingDemoRequest.companySize || "No size provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs min-h-[60px]">
                    {viewingDemoRequest.message || "No message provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <p
                    className={`text-gray-900 p-2 bg-gray-50 rounded text-xs ${
                      viewingDemoRequest.status === "approved"
                        ? "text-green-600"
                        : viewingDemoRequest.status === "rejected"
                        ? "text-red-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {viewingDemoRequest.status || "Pending"}
                  </p>
                </div>
                {viewingDemoRequest.rejectionReason && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Rejection Reason</label>
                    <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs min-h-[60px]">
                      {viewingDemoRequest.rejectionReason}
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Created Date</label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">
                    {formatDate(viewingDemoRequest.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoRequestsDashboard;
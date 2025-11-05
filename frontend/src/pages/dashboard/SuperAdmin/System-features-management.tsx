/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
  Building2,
  Grid3X3,
  List,
  RefreshCw,
  Calendar,
} from "lucide-react";
import systemFeaturesService from "../../../services/system-featuresService"; // Adjust the import path as needed

interface SystemFeature {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SystemFeatureData {
  id?: string;
  name: string;
  description?: string | null;
}

interface OperationStatus {
  type: "success" | "error" | "info";
  message: string;
}

type ViewMode = "table" | "grid" | "list";

const SystemFeaturesDashboard: React.FC<{ role: string }> = ({ role }) => {
  const [systemFeatures, setSystemFeatures] = useState<SystemFeature[]>([]);
  const [allSystemFeatures, setAllSystemFeatures] = useState<SystemFeature[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<keyof SystemFeature>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingSystemFeature, setEditingSystemFeature] = useState<SystemFeature | null>(null);
  const [viewingSystemFeature, setViewingSystemFeature] = useState<SystemFeature | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<SystemFeature | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [newSystemFeature, setNewSystemFeature] = useState<SystemFeatureData>({ name: "", description: "" });
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    loadSystemFeatures();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allSystemFeatures]);

  const loadSystemFeatures = async () => {
    try {
      const data = await systemFeaturesService.getAllSystemFeatures();
      setAllSystemFeatures(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load system features");
    } finally {
      setLoading(false);
    }
  };

  const showOperationStatus = (type: OperationStatus["type"], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allSystemFeatures];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (feature) =>
          feature.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          feature.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

    setSystemFeatures(filtered);
    setCurrentPage(1);
  };

  const handleAddSystemFeature = async () => {
    try {
      setOperationLoading(true);
      const validation = systemFeaturesService.validateSystemFeatureData(newSystemFeature);
      if (!validation.isValid) {
        showOperationStatus("error", validation.errors.join(", "));
        return;
      }
      await systemFeaturesService.createSystemFeature(newSystemFeature);
      setNewSystemFeature({ name: "", description: "" });
      setShowAddModal(false);
      loadSystemFeatures();
      showOperationStatus("success", "System feature created successfully!");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to create system feature");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditSystemFeature = async () => {
    if (!editingSystemFeature) return;
    try {
      setOperationLoading(true);
      const validation = systemFeaturesService.validateSystemFeatureData(editingSystemFeature);
      if (!validation.isValid) {
        showOperationStatus("error", validation.errors.join(", "));
        return;
      }
      await systemFeaturesService.updateSystemFeature(editingSystemFeature.id, editingSystemFeature);
      setEditingSystemFeature(null);
      loadSystemFeatures();
      showOperationStatus("success", "System feature updated successfully!");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to update system feature");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeleteSystemFeature = async (feature: SystemFeature) => {
    try {
      setOperationLoading(true);
      setDeleteConfirm(null);
      await systemFeaturesService.deleteSystemFeature(feature.id);
      loadSystemFeatures();
      showOperationStatus("success", `${feature.name} deleted successfully!`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to delete system feature");
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

  const totalPages = Math.ceil(systemFeatures.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSystemFeatures = systemFeatures.slice(startIndex, endIndex);

  // Summary statistics
  const totalSystemFeatures = allSystemFeatures.length;
  const recentSystemFeatures = allSystemFeatures.filter((feature) => {
    if (!feature.createdAt) return false;
    const createdDate = new Date(feature.createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate >= thirtyDaysAgo;
  }).length;

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
                  setSortBy("name");
                  setSortOrder(sortBy === "name" && sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === "name" ? "text-primary-600" : "text-gray-400"}`} />
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Description</th>
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
            {currentSystemFeatures.map((feature, index) => (
              <tr key={feature.id || index} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-primary-700">
                        {feature.name?.charAt(0) || 'F'}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 text-xs">
                      {feature.name || "Unnamed Feature"}
                    </span>
                  </div>
                </td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">
                  {feature.description || "No description provided"}
                </td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">
                  {formatDate(feature.createdAt)}
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => setViewingSystemFeature(feature)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="View"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setEditingSystemFeature(feature)}
                      disabled={operationLoading}
                      className="text-gray-400 hover:text-primary-600 p-1 disabled:opacity-50"
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(feature)}
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
      {currentSystemFeatures.map((feature) => (
        <div key={feature.id} className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-primary-700">
                {feature.name?.charAt(0) || 'F'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">
                {feature.name || "Unnamed Feature"}
              </div>
              <div className="text-gray-500 text-xs truncate">
                {feature.description || "No description provided"}
              </div>
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(feature.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-1">
            <button
              onClick={() => setViewingSystemFeature(feature)}
              className="text-gray-400 hover:text-primary-600 p-1"
              title="View"
            >
              <Eye className="w-3 h-3" />
            </button>
            <button
              onClick={() => setEditingSystemFeature(feature)}
              disabled={operationLoading}
              className="text-gray-400 hover:text-primary-600 p-1 disabled:opacity-50"
              title="Edit"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={() => setDeleteConfirm(feature)}
              disabled={operationLoading}
              className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
      {currentSystemFeatures.map((feature) => (
        <div key={feature.id} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">
                  {feature.name?.charAt(0) || 'F'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">
                  {feature.name || "Unnamed Feature"}
                </div>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
              <span className="truncate">{feature.description || "No description provided"}</span>
              <span>{formatDate(feature.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => setViewingSystemFeature(feature)}
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                title="View System Feature"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditingSystemFeature(feature)}
                disabled={operationLoading}
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors disabled:opacity-50"
                title="Edit System Feature"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteConfirm(feature)}
                disabled={operationLoading}
                className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                title="Delete System Feature"
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
          Showing {startIndex + 1}-{Math.min(endIndex, systemFeatures.length)} of {systemFeatures.length}
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
              <h1 className="text-lg font-semibold text-gray-900">System Features Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage your system's features</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadSystemFeatures}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                disabled={operationLoading}
                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
                aria-label="Add new system feature"
              >
                <Plus className="w-3 h-3" />
                <span>Add System Feature</span>
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
                <p className="text-xs text-gray-600">Total System Features</p>
                <p className="text-lg font-semibold text-gray-900">{totalSystemFeatures}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">New System Features (30d)</p>
                <p className="text-lg font-semibold text-gray-900">{recentSystemFeatures}</p>
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
                  placeholder="Search system features..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  aria-label="Search system features"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-") as [keyof SystemFeature, "asc" | "desc"];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                aria-label="Sort system features"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
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
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="inline-flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Loading system features...</span>
            </div>
          </div>
        ) : currentSystemFeatures.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm ? `No system features found for "${searchTerm}"` : "No system features found"}
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

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded p-4 w-full max-w-sm">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Delete System Feature</h3>
                  <p className="text-xs text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-xs text-gray-700">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">"{deleteConfirm.name}"</span>?
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
                  onClick={() => handleDeleteSystemFeature(deleteConfirm)}
                  className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {viewingSystemFeature && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded p-4 w-full max-w-sm max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">System Feature Details</h3>
                <button
                  onClick={() => setViewingSystemFeature(null)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close view modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    System Feature Name
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">
                    {viewingSystemFeature.name || "Unnamed Feature"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs min-h-[60px]">
                    {viewingSystemFeature.description || "No description provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Created Date
                  </label>
                  <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">
                    {formatDate(viewingSystemFeature.createdAt)}
                  </p>
                </div>
                {viewingSystemFeature.updatedAt && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Last Updated
                    </label>
                    <p className="text-gray-900 p-2 bg-gray-50 rounded text-xs">
                      {formatDate(viewingSystemFeature.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded p-4 w-full max-w-sm max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Add New System Feature</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close add modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
  <label className="block text-xs font-medium text-gray-700 mb-1">
    System Feature Name
  </label>
  <select
    value={newSystemFeature.name}
    onChange={(e) =>
      setNewSystemFeature({ ...newSystemFeature, name: e.target.value })
    }
    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
    aria-label="System feature name"
  >
    <option value="">Select a system feature</option>
    <option value="DEPARTMENTS_MANAGEMENT">Department Management</option>
    <option value="EMPLOYEES_MANAGEMENT">Employee Management</option>
    <option value="CLIENTS_MANAGEMENT">Client Management</option>
    <option value="ASSET_MANAGEMENT">Asset Management</option>
    <option value="CATEGORY_MANAGEMENT">Category Management</option>
    <option value="SUPPLIER_MANAGEMENT">Supplier Management</option>
    <option value="VIEW_REPORTS">Reports - Sales</option>
    <option value="VIEW_REPORTS">Reports - Inventory</option>
  </select>
</div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newSystemFeature.description ? newSystemFeature.description : ""}
                    onChange={(e) => setNewSystemFeature({ ...newSystemFeature, description: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 h-20 resize-none"
                    placeholder="Enter system feature description (optional)"
                    aria-label="System feature description"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
                  aria-label="Cancel add"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSystemFeature}
                  disabled={operationLoading}
                  className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                  aria-label="Add system feature"
                >
                  Add System Feature
                </button>
              </div>
            </div>
          </div>
        )}

        {editingSystemFeature && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded p-4 w-full max-w-sm max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold">Edit System Feature</h3>
                <button
                  onClick={() => setEditingSystemFeature(null)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close edit modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    System Feature Name
                  </label>
                  <input
                    type="text"
                    value={editingSystemFeature.name}
                    onChange={(e) => setEditingSystemFeature({ ...editingSystemFeature, name: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    placeholder="Enter system feature name"
                    aria-label="System feature name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingSystemFeature.description}
                    onChange={(e) => setEditingSystemFeature({ ...editingSystemFeature, description: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 h-20 resize-none"
                    placeholder="Enter system feature description (optional)"
                    aria-label="System feature description"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 mt-4">
                <button
                  onClick={() => setEditingSystemFeature(null)}
                  className="px-3 py-1.5 text-xs text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
                  aria-label="Cancel edit"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSystemFeature}
                  disabled={operationLoading}
                  className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
                  aria-label="Update system feature"
                >
                  Update System Feature
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemFeaturesDashboard;
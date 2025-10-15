import React, { useState, useEffect, useRef } from "react";
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
  MapPin,
  RefreshCw,
  Filter,
  Grid3X3,
  List,
  Settings,
  Minimize2,
  ChevronUp,
} from "lucide-react";
import siteService from "../../services/siteService";
import employeeService from "../../services/employeeService";
import { useNavigate } from "react-router-dom";
import type { Site, SiteData } from "../../types/model";
import type { Employee } from "../../types/model";
import useAdminAuth from "../../context/AdminAuthContext";

type ViewMode = "table" | "grid" | "list";

interface OperationStatus {
  type: "success" | "error" | "info";
  message: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Employee[];
  placeholder?: string;
  label: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "Search...",
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((emp) => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const selectedEmployee = options.find((emp) => emp.id === value);
  const displayValue = selectedEmployee
    ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
    : "None";

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 text-left flex items-center justify-between bg-white"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>{displayValue}</span>
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
                setSearchTerm("");
              }}
              className="w-full px-3 py-2 text-xs text-left hover:bg-gray-50 text-gray-600"
            >
              None
            </button>
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-500">No employees found</div>
            ) : (
              filteredOptions.map((emp) => (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => {
                    onChange(emp.id);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full px-3 py-2 text-xs text-left hover:bg-gray-50 ${
                    value === emp.id ? "bg-primary-50 text-primary-700" : "text-gray-900"
                  }`}
                >
                  {emp.first_name} {emp.last_name}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SiteDashboard: React.FC<{ role: string }> = ({ role }) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [allSites, setAllSites] = useState<Site[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<keyof Site>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [deleteConfirm, setDeleteConfirm] = useState<Site | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [formData, setFormData] = useState<Partial<SiteData>>({
    siteCode: "",
    name: "",
    location: "",
    managerId: "",
    supervisorId: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string>("");

  const { user } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      loadData();
      loadEmployees();
    }
  }, [user, navigate]);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allSites, selectedLocation]);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await siteService.getAllSites();
      setAllSites(data || []);
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        navigate("/login");
      } else if (err.message.includes("Network Error")) {
        setError("Unable to connect to the server. Please check your connection or cookie settings.");
      } else {
        setError(err.message || "Failed to load sites");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const data = await employeeService.getAllEmployees();
      setEmployees(data || []);
    } catch (err: any) {
      console.error("Failed to load employees:", err);
    }
  };

  const getEmployeeName = (id?: string): string => {
    if (!id) return "-";
    const employee = employees.find((emp) => emp.id === id);
    return employee ? `${employee.first_name} ${employee.last_name}` : "-";
  };

  const showOperationStatus = (type: OperationStatus["type"], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allSites];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (site) =>
          site.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          site.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          site.siteCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLocation) {
      filtered = filtered.filter((site) => site.location?.toLowerCase() === selectedLocation.toLowerCase());
    }

    filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (sortBy === "createdAt" || sortBy === "updatedAt") {
        const aDate = typeof aValue === "string" || aValue instanceof Date ? new Date(aValue) : new Date(0);
        const bDate = typeof bValue === "string" || bValue instanceof Date ? new Date(bValue) : new Date(0);
        return sortOrder === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }

      const aStr = aValue ? aValue.toString().toLowerCase() : "";
      const bStr = bValue ? bValue.toString().toLowerCase() : "";
      return sortOrder === "asc" ? (aStr > bStr ? 1 : aStr < bStr ? -1 : 0) : aStr < bStr ? 1 : aStr > bStr ? -1 : 0;
    });

    setSites(filtered);
    setCurrentPage(1);
  };

  const totalSites = allSites.length;
  const uniqueLocations = [...new Set(allSites.map((site) => site.location))].length;

  const handleAddSite = () => {
    const siteCodes = allSites
      .filter((site) => site.siteCode && site.siteCode.startsWith("SITE-"))
      .map((site) => {
        const match = site.siteCode.match(/SITE-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((num) => !isNaN(num));

    const maxNum = siteCodes.length > 0 ? Math.max(...siteCodes) : 0;
    const nextNum = maxNum + 1;
    const nextCode = `SITE-${nextNum.toString().padStart(3, "0")}`;

    setFormData({
      siteCode: nextCode,
      name: "",
      location: "",
      managerId: "",
      supervisorId: "",
    });
    setSelectedFile(null);
    setFormError("");
    setShowAddModal(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const validation: ValidationResult = siteService.validateSiteData(formData);
    if (!validation.isValid) {
      setFormError(validation.errors.join(", "));
      return;
    }

    try {
      setOperationLoading(true);
      let data: FormData | SiteData = formData as SiteData;
      if (selectedFile) {
        data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            data.append(key, value.toString());
          }
        });
        data.append("siteImg", selectedFile);
      }
      const newSite = await siteService.createSite(data);
      setShowAddModal(false);
      setFormData({
        siteCode: "",
        name: "",
        location: "",
        managerId: "",
        supervisorId: "",
      });
      setSelectedFile(null);
      loadData();
      showOperationStatus("success", `${newSite.name} created successfully!`);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setFormError("Session expired. Please log in again.");
        navigate("/login");
      } else {
        setFormError(err.message || "Failed to create site");
      }
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditSite = (site: Site) => {
    if (!site?.id) return;
    setSelectedSite(site);
    setFormData({
      siteCode: site.siteCode || "",
      name: site.name || "",
      location: site.location || "",
      managerId: site.managerId || "",
      supervisorId: site.supervisorId || "",
    });
    setSelectedFile(null);
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const validation: ValidationResult = siteService.validateSiteData(formData);
    if (!validation.isValid) {
      setFormError(validation.errors.join(", "));
      return;
    }

    if (!selectedSite?.id) {
      setFormError("Invalid site ID");
      return;
    }

    try {
      setOperationLoading(true);
      let data: FormData | Partial<SiteData> = formData;
      if (selectedFile) {
        data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            data.append(key, value.toString());
          }
        });
        data.append("siteImg", selectedFile);
      }
      await siteService.updateSite(selectedSite.id, data);
      setShowUpdateModal(false);
      setSelectedSite(null);
      setFormData({
        siteCode: "",
        name: "",
        location: "",
        managerId: "",
        supervisorId: "",
      });
      setSelectedFile(null);
      loadData();
      showOperationStatus("success", `${formData.name} updated successfully!`);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setFormError("Session expired. Please log in again.");
        navigate("/login");
      } else {
        setFormError(err.message || "Failed to update site");
      }
    } finally {
      setOperationLoading(false);
    }
  };

  const handleViewSite = (site: Site) => {
    if (!site?.id) return;
    setSelectedSite(site);
    setShowViewModal(true);
  };

  const handleDeleteSite = async (site: Site) => {
    try {
      setOperationLoading(true);
      setDeleteConfirm(null);
      await siteService.deleteSite(site.id);
      loadData();
      showOperationStatus("success", `${site.name} deleted successfully!`);
    } catch (err: any) {
      if (err.response?.status === 401) {
        showOperationStatus("error", "Session expired. Please log in again.");
        navigate("/login");
      } else {
        showOperationStatus("error", err.message || "Failed to delete site");
      }
    } finally {
      setOperationLoading(false);
    }
  };

  const formatDate = (date?: Date | string): string => {
    if (!date) return new Date().toLocaleDateString("en-GB");
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const totalPages = Math.ceil(sites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSites = sites.slice(startIndex, endIndex);

  const renderTableView = () => (
    <div className="bg-white rounded border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
              <th
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100"
                onClick={() => setSortBy("name")}
              >
                <div className="flex items-center space-x-1">
                  <span>Name</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === "name" ? "text-primary-600" : "text-gray-400"}`} />
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Code</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Location</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Manager</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Supervisor</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">Created Date</th>
              <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentSites.map((site, index) => (
              <tr key={site.id || index} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2 font-medium text-gray-900 text-xs">{site.name}</td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{site.siteCode}</td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{site.location}</td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{getEmployeeName(site.managerId)}</td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{getEmployeeName(site.supervisorId)}</td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{formatDate(site.createdAt)}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => handleViewSite(site)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="View"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleEditSite(site)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(site)}
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
      {currentSites.map((site) => (
        <div key={site.id} className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">{site.name}</div>
              <div className="text-gray-500 text-xs truncate">{site.siteCode}</div>
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>{site.location || "-"}</span>
            </div>
            <div className="text-xs text-gray-600">Manager: {getEmployeeName(site.managerId)}</div>
            <div className="text-xs text-gray-600">Supervisor: {getEmployeeName(site.supervisorId)}</div>
            {site.siteImg && (
              <img src={site.siteImg} alt="Site" className="w-16 h-16 object-cover rounded mt-2" />
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              <button onClick={() => handleViewSite(site)} className="text-gray-400 hover:text-primary-600 p-1" title="View">
                <Eye className="w-3 h-3" />
              </button>
              <button onClick={() => handleEditSite(site)} className="text-gray-400 hover:text-primary-600 p-1" title="Edit">
                <Edit className="w-3 h-3" />
              </button>
            </div>
            <button onClick={() => setDeleteConfirm(site)} className="text-gray-400 hover:text-red-600 p-1" title="Delete">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
      {currentSites.map((site) => (
        <div key={site.id} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{site.name}</div>
                <div className="text-gray-500 text-xs truncate">{site.siteCode}</div>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-3 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
              <span className="truncate">{site.location || "-"}</span>
              <span className="truncate">Mgr: {getEmployeeName(site.managerId)}</span>
              <span className="truncate">Sup: {getEmployeeName(site.supervisorId)}</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => handleViewSite(site)}
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                title="View Site"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEditSite(site)}
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                title="Edit Site"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteConfirm(site)}
                className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                title="Delete Site"
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
          Showing {startIndex + 1}-{Math.min(endIndex, sites.length)} of {sites.length}
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
                <h1 className="text-lg font-semibold text-gray-900">Site Management</h1>
                <p className="text-xs text-gray-500 mt-0.5">Manage your organization's sites</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleAddSite}
                disabled={operationLoading}
                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
                <span>Add Site</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Sites</p>
                <p className="text-lg font-semibold text-gray-900">{totalSites}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Unique Locations</p>
                <p className="text-lg font-semibold text-gray-900">{uniqueLocations}</p>
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
                  placeholder="Search sites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-1 px-2 py-1.5 text-xs border rounded transition-colors ${
                  showFilters ? "bg-primary-50 border-primary-200 text-primary-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
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
                  const [field, order] = e.target.value.split("-") as [keyof Site, "asc" | "desc"];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="siteCode-asc">Code (A-Z)</option>
                <option value="location-asc">Location (A-Z)</option>
                <option value="createdAt-desc">Newest</option>
                <option value="createdAt-asc">Oldest</option>
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
                  <Settings className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">All Locations</option>
                  {[...new Set(allSites.map((site) => site.location))].map((location, index) => (
                    <option key={index} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                {selectedLocation && (
                  <button
                    onClick={() => setSelectedLocation("")}
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
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-xs">{error}</div>
        )}

        {loading ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="inline-flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Loading sites...</span>
            </div>
          </div>
        ) : currentSites.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm || selectedLocation ? "No sites found matching your criteria" : "No sites found"}
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
      </div>

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
                <h3 className="text-sm font-semibold text-gray-900">Delete Site</h3>
                <p className="text-xs text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-700">
                Are you sure you want to delete <span className="font-semibold">{deleteConfirm.name}</span>?
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
                onClick={() => handleDeleteSite(deleteConfirm)}
                className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Add New Site</h3>
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700 text-xs mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Site Code</label>
                <input
                  type="text"
                  name="siteCode"
                  value={formData.siteCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter site code"
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Site Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter site name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter site location"
                />
              </div>
              <SearchableSelect
                value={formData.managerId || ""}
                onChange={(value) => setFormData({ ...formData, managerId: value })}
                options={employees}
                placeholder="Search managers..."
                label="Manager"
              />
              <SearchableSelect
                value={formData.supervisorId || ""}
                onChange={(value) => setFormData({ ...formData, supervisorId: value })}
                options={employees}
                placeholder="Search supervisors..."
                label="Supervisor"
              />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Site Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({
                      siteCode: "",
                      name: "",
                      location: "",
                      managerId: "",
                      supervisorId: "",
                    });
                    setSelectedFile(null);
                    setFormError("");
                  }}
                  className="px-4 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={operationLoading}
                  className="px-4 py-2 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {operationLoading ? "Creating..." : "Create Site"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUpdateModal && selectedSite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Update Site</h3>
            {formError && (
              <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700 text-xs mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleUpdateSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Site Code</label>
                <input
                  type="text"
                  name="siteCode"
                  value={formData.siteCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter site code"
                  disabled
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Site Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter site name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Enter site location"
                />
              </div>
              <SearchableSelect
                value={formData.managerId || ""}
                onChange={(value) => setFormData({ ...formData, managerId: value })}
                options={employees}
                placeholder="Search managers..."
                label="Manager"
              />
              <SearchableSelect
                value={formData.supervisorId || ""}
                onChange={(value) => setFormData({ ...formData, supervisorId: value })}
                options={employees}
                placeholder="Search supervisors..."
                label="Supervisor"
              />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Site Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {selectedSite.siteImg && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600">Current Image:</p>
                    <img src={selectedSite.siteImg} alt="Current Site" className="w-32 h-32 object-cover rounded" />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedSite(null);
                    setFormData({
                      siteCode: "",
                      name: "",
                      location: "",
                      managerId: "",
                      supervisorId: "",
                    });
                    setSelectedFile(null);
                    setFormError("");
                  }}
                  className="px-4 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={operationLoading}
                  className="px-4 py-2 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {operationLoading ? "Updating..." : "Update Site"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedSite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Site Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Site Code</label>
                <p className="text-xs text-gray-900">{selectedSite.siteCode || "-"}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Site Name</label>
                <p className="text-xs text-gray-900">{selectedSite.name || "-"}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                <p className="text-xs text-gray-900">{selectedSite.location || "-"}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Manager</label>
                <p className="text-xs text-gray-900">{getEmployeeName(selectedSite.managerId)}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Supervisor</label>
                <p className="text-xs text-gray-900">{getEmployeeName(selectedSite.supervisorId)}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Site Image</label>
                {selectedSite.siteImg ? (
                  <img src={selectedSite.siteImg} alt="Site" className="w-32 h-32 object-cover rounded" />
                ) : (
                  <p className="text-xs text-gray-900">-</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Created At</label>
                <p className="text-xs text-gray-900">{formatDate(selectedSite.createdAt)}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Updated At</label>
                <p className="text-xs text-gray-900">{formatDate(selectedSite.updatedAt)}</p>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedSite(null);
                }}
                className="px-4 py-2 text-xs border border-gray-200 rounded hover:bg-gray-50 text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SiteDashboard;
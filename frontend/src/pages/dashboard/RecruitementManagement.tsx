import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
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
  Calendar,
  Users,
  Briefcase,
  Grid3X3,
  List,
  Settings,
  Minimize2,
  RefreshCw,
} from "lucide-react";
import jobService from "../../services/jobService";
import { useNavigate } from "react-router-dom";
import { useSocketEvent, useSocket } from "../../context/SocketContext";
import type { Job } from "../../types/model";

type ViewMode = 'table' | 'grid' | 'list';

interface OperationStatus {
  type: "success" | "error" | "info";
  message: string;
}

const JobDashboard: React.FC <{role:string}> = ({role}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<keyof Job>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [deleteConfirm, setDeleteConfirm] = useState<Job | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const { socket } = useSocket();
  const navigate = useNavigate();

  // Calculate summary statistics
  const totalJobs = allJobs.length;
  const openJobs = allJobs.filter(job => job.status === "OPEN").length;
  const closedJobs = allJobs.filter(job => job.status === "CLOSED").length;
  const newJobs = allJobs.filter(job => {
    if (!job.posted_at) return false;
    const postedDate = new Date(job.posted_at);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return postedDate >= thirtyDaysAgo;
  }).length;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, statusFilter, employmentTypeFilter, allJobs]);

  // WebSocket event handlers
  useSocketEvent("jobCreated", (job: Job) => {
    if (job) {
      setAllJobs((prev) => [...prev, job]);
      showOperationStatus("success", `New job "${job.title}" created!`);
    }
  }, [setAllJobs]);

  useSocketEvent("jobUpdated", (updatedJob: Job) => {
    if (updatedJob) {
      setAllJobs((prev) =>
        prev.map((job) => (job.id === updatedJob.id ? updatedJob : job))
      );
      showOperationStatus("success", `Job "${updatedJob.title}" updated!`);
    }
  }, [setAllJobs]);

  useSocketEvent("jobDeleted", ({ id }: { id: string }) => {
    if (id) {
      setAllJobs((prev) => prev.filter((job: Job) => job.id !== id));
      showOperationStatus("success", `Job deleted successfully!`);
    }
  }, [setAllJobs]);

  const loadData = async () => {
    try {
      setLoading(true);
      const jobData = await jobService.getAllJobs();
      setAllJobs(jobData || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const showOperationStatus = (type: OperationStatus["type"], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allJobs];

    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (job) =>
          job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.industry?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((job) => job.status === statusFilter);
    }

    if (employmentTypeFilter !== "all") {
      filtered = filtered.filter((job) => job.employment_type === employmentTypeFilter);
    }

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (
        sortBy === "posted_at" ||
        sortBy === "expiry_date" ||
        sortBy === "created_at" ||
        sortBy === "updated_at"
      ) {
        const aDate =
          typeof aValue === "string" || aValue instanceof Date ? new Date(aValue) : new Date(0);
        const bDate =
          typeof bValue === "string" || bValue instanceof Date ? new Date(bValue) : new Date(0);
        return sortOrder === "asc" ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }

      const aStr = aValue ? aValue.toString().toLowerCase() : "";
      const bStr = bValue ? bValue.toString().toLowerCase() : "";
      return sortOrder === "asc" ? (aStr > bStr ? 1 : aStr < bStr ? -1 : 0) : (aStr < bStr ? 1 : aStr > bStr ? -1 : 0);
    });

    setJobs(filtered);
    setCurrentPage(1);
  };

  const handleAddJob = () => {
    navigate("/admin/dashboard/recruiting-management/create");
  };

  const handleEditJob = (job: Job) => {
    if (!job?.id) return;
    navigate(`/admin/dashboard/recruiting-management/update/${job.id}`);
  };

  const handleViewJob = (job: Job) => {
    if (!job?.id) return;
    navigate(`/admin/dashboard/recruiting-management/${job.id}`);
  };

  const handleDeleteJob = async (job: Job) => {
    try {
      setOperationLoading(true);
      setDeleteConfirm(null);
      await jobService.deleteJob(job.id);
      showOperationStatus("success", `"${job.title}" deleted successfully!`);
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to delete job");
    } finally {
      setOperationLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      OPEN: "bg-green-100 text-green-800",
      CLOSED: "bg-red-100 text-red-800",
      PAUSED: "bg-orange-100 text-orange-800",
      DRAFT: "bg-gray-100 text-gray-800",
    };
    return (
      <span
        className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
          statusStyles[status as keyof typeof statusStyles] || statusStyles.DRAFT
        }`}
      >
        {status}
      </span>
    );
  };

  const getEmploymentTypeBadge = (type: string) => {
    const typeStyles = {
      FULL_TIME: "bg-blue-100 text-blue-800",
      PART_TIME: "bg-purple-100 text-purple-800",
      CONTRACT: "bg-orange-100 text-orange-800",
      FREELANCE: "bg-pink-100 text-pink-800",
      INTERNSHIP: "bg-indigo-100 text-indigo-800",
    };
    return (
      <span
        className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
          typeStyles[type as keyof typeof typeStyles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {type.replace("_", " ")}
      </span>
    );
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return new Date().toLocaleDateString("en-GB");
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const totalPages = Math.ceil(jobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = jobs.slice(startIndex, endIndex);

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
                  setSortBy("title");
                  setSortOrder(sortBy === "title" && sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Job Title</span>
                  <ChevronDown
                    className={`w-3 h-3 ${sortBy === "title" ? "text-primary-600" : "text-gray-400"} ${
                      sortBy === "title" && sortOrder === "desc" ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </th>
              <th
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100 hidden sm:table-cell"
                onClick={() => {
                  setSortBy("location");
                  setSortOrder(sortBy === "location" && sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Location</span>
                  <ChevronDown
                    className={`w-3 h-3 ${sortBy === "location" ? "text-primary-600" : "text-gray-400"} ${
                      sortBy === "location" && sortOrder === "desc" ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Type</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">Status</th>
              <th
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100 hidden sm:table-cell"
                onClick={() => {
                  setSortBy("posted_at");
                  setSortOrder(sortBy === "posted_at" && sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Posted</span>
                  <ChevronDown
                    className={`w-3 h-3 ${sortBy === "posted_at" ? "text-primary-600" : "text-gray-400"} ${
                      sortBy === "posted_at" && sortOrder === "desc" ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </th>
              <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentJobs.map((job, index) => (
              <tr key={job.id || index} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 text-xs">{job.title}</span>
                    {job.industry && (
                      <span className="text-xs text-gray-500 mt-0.5">{job.industry}</span>
                    )}
                    <div className="sm:hidden mt-0.5">
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPin className="w-3 h-3 mr-1" />
                        {job.location}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">
                  <div className="flex items-center space-x-1 text-xs">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    {job.location}
                  </div>
                </td>
                <td className="py-2 px-2 hidden lg:table-cell">{getEmploymentTypeBadge(job.employment_type)}</td>
                <td className="py-2 px-2">{getStatusBadge(job.status!)}</td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">
                  <div className="flex items-center space-x-1 text-xs">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    {formatDate(job.posted_at)}
                  </div>
                </td>
                <td className="py-2 px-2">
                  <div className="flex items-center justify-end space-x-1">
                    <button
                      onClick={() => handleViewJob(job)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="View"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleEditJob(job)}
                      className="text-gray-400 hover:text-primary-600 p-1"
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(job)}
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
      {currentJobs.map((job) => (
        <div key={job.id} className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-primary-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">{job.title}</div>
              <div className="text-gray-500 text-xs truncate">{job.industry}</div>
            </div>
            {getStatusBadge(job.status!)}
          </div>
          <div className="space-y-1 mb-3">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <MapPin className="w-3 h-3" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(job.posted_at)}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Users className="w-3 h-3" />
              <span>{job.applicants?.length || 0} Applicants</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              <button onClick={() => handleViewJob(job)} className="text-gray-400 hover:text-primary-600 p-1" title="View">
                <Eye className="w-3 h-3" />
              </button>
              <button onClick={() => handleEditJob(job)} className="text-gray-400 hover:text-primary-600 p-1" title="Edit">
                <Edit className="w-3 h-3" />
              </button>
            </div>
            <button onClick={() => setDeleteConfirm(job)} className="text-gray-400 hover:text-red-600 p-1" title="Delete">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
      {currentJobs.map((job) => (
        <div key={job.id} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{job.title}</div>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-4 gap-4 text-xs text-gray-600 flex-1 max-w-3xl px-4">
              <span className="truncate">{job.location}</span>
              <span className="truncate">{getEmploymentTypeBadge(job.employment_type)}</span>
              <span className="truncate">{getStatusBadge(job.status!)}</span>
              <span>{formatDate(job.posted_at)}</span>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <button
                onClick={() => handleViewJob(job)}
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                title="View Job"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEditJob(job)}
                className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                title="Edit Job"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteConfirm(job)}
                className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors"
                title="Delete Job"
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
          Showing {startIndex + 1}-{Math.min(endIndex, jobs.length)} of {jobs.length}
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
                <h1 className="text-lg font-semibold text-gray-900">Job Management</h1>
                <p className="text-xs text-gray-500 mt-0.5">Manage your organization's job postings</p>
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
                onClick={handleAddJob}
                disabled={operationLoading}
                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
                <span>Add Job</span>
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
                <Briefcase className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Jobs</p>
                <p className="text-lg font-semibold text-gray-900">{totalJobs}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Open Jobs</p>
                <p className="text-lg font-semibold text-gray-900">{openJobs}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Closed Jobs</p>
                <p className="text-lg font-semibold text-gray-900">{closedJobs}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-full flex items-center justify-center">
                <Plus className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">New Jobs (30d)</p>
                <p className="text-lg font-semibold text-gray-900">{newJobs}</p>
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
                  placeholder="Search jobs..."
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
                  const [field, order] = e.target.value.split("-") as [keyof Job, "asc" | "desc"];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="location-asc">Location (A-Z)</option>
                <option value="location-desc">Location (Z-A)</option>
                <option value="posted_at-desc">Newest Posted</option>
                <option value="posted_at-asc">Oldest Posted</option>
                <option value="expiry_date-asc">Expiring Soon</option>
                <option value="expiry_date-desc">Expiring Later</option>
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
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                  <option value="PAUSED">Paused</option>
                  <option value="DRAFT">Draft</option>
                </select>
                <select
                  value={employmentTypeFilter}
                  onChange={(e) => setEmploymentTypeFilter(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="all">All Types</option>
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="FREELANCE">Freelance</option>
                  <option value="INTERNSHIP">Internship</option>
                </select>
                {(statusFilter !== "all" || employmentTypeFilter !== "all") && (
                  <button
                    onClick={() => {
                      setStatusFilter("all");
                      setEmploymentTypeFilter("all");
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

        {loading ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="inline-flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Loading jobs...</span>
            </div>
          </div>
        ) : currentJobs.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm || statusFilter !== "all" || employmentTypeFilter !== "all"
                ? "No jobs found matching your criteria"
                : "No jobs found"}
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
                <h3 className="text-sm font-semibold text-gray-900">Delete Job</h3>
                <p className="text-xs text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-xs text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteConfirm.title}</span>?
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
                onClick={() => handleDeleteJob(deleteConfirm)}
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

export default JobDashboard;
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Clock,
  Eye,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
  Mail,
  Phone,
  Search,
} from "lucide-react";
import DOMPurify from "dompurify";
import jobService from "../../../services/jobService";
import applicantService from "../../../services/applicantService";
import { useSocketEvent } from "../../../context/SocketContext";
import type { Job, Applicant } from "../../../types/model";
import Swal from "sweetalert2";

interface OperationStatus {
  type: "success" | "error" | "info";
  message: string;
}

// Helper function to strip HTML tags for truncation
const stripHtml = (html: string): string => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
};

const JobView: React.FC<{role:string}> = ({role})  => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [applicantsLoading, setApplicantsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullJobDescription, setShowFullJobDescription] = useState<boolean>(false);
  // Pagination for applicants
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);
  // Operation states
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [actionConfirm, setActionConfirm] = useState<{
    applicant: Applicant;
    action: "hire" | "reject";
    start_date?: string;
  } | null>(null);

  // Filter applicants based on search term
  const filteredApplicants = useMemo(() => {
    if (!job?.applicants) return [];
    if (!applicants) return [];
    if (!searchTerm.trim()) return job.applicants;

    return applicants.filter((applicant) =>
      [
        applicant.name?.toLowerCase(),
        applicant.email?.toLowerCase(),
        applicant.phone?.toLowerCase(),
      ].some((field) => field && field.includes(searchTerm.toLowerCase()))
    );
  }, [job?.applicants, searchTerm]);

  useEffect(() => {
    if (id) {
      loadJobData();
    }
  }, [id]);

  // WebSocket event handlers
  useSocketEvent("applicantCreated", (newApplicant: Applicant) => {
    if (newApplicant.jobId === id) {
      setApplicants((prev) => [...prev, newApplicant]);
      setJob((prev) =>
        prev ? { ...prev, applicants: [...(prev.applicants || []), newApplicant] } : prev
      );
      showOperationStatus("success", `New applicant ${newApplicant.name} added!`);
    }
  });

  useSocketEvent("applicantUpdated", (updatedApplicant: Applicant) => {
    if (updatedApplicant.jobId === id) {
      setApplicants((prev) =>
        prev.map((app) => (app.id === updatedApplicant.id ? updatedApplicant : app))
      );
      setJob((prev) =>
        prev
          ? {
              ...prev,
              applicants: prev.applicants?.map((app) =>
                app.id === updatedApplicant.id ? updatedApplicant : app
              ),
            }
          : prev
      );
      showOperationStatus("info", `Applicant ${updatedApplicant.name} updated!`);
    }
  });

  useSocketEvent("applicantDeleted", ({ id: deletedId }: { id: string }) => {
    setApplicants((prev) => prev.filter((app) => app.id !== deletedId));
    setJob((prev) =>
      prev
        ? { ...prev, applicants: prev.applicants?.filter((app) => app.id !== deletedId) }
        : prev
    );
    showOperationStatus("info", `Applicant deleted.`);
  });

  const loadJobData = async () => {
    try {
      setLoading(true);
      const jobData = await jobService.getJobById(id!);
      if (jobData) {
        setJob(jobData);
        setApplicants(jobData.applicants || []);
        setError(null);
      } else {
        setError("Job not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load job");
    } finally {
      setLoading(false);
    }
  };

  const showOperationStatus = (type: OperationStatus["type"], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleEditJob = () => {
    navigate(`/admin/dashboard/recruiting-management/update/${id}`);
  };

  const handleDeleteJob = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone. Do you really want to delete this job?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setOperationLoading(true);
        await jobService.deleteJob(id!);
        await Swal.fire("Deleted!", "Job deleted successfully.", "success");
        navigate("/admin/dashboard/recruiting-management");
      } catch (err: any) {
        await Swal.fire("Error", err.message || "Failed to delete job", "error");
      } finally {
        setOperationLoading(false);
      }
    }
  };

  const handleApplicantAction = async (applicant: Applicant, action: "hire" | "reject", start_date?: string) => {
    try {
      setOperationLoading(true);
      setActionConfirm(null);

      const newStage = action === "hire" ? "HIRED" : "REJECTED";
      const payload = action === "hire" ? { stage: newStage, start_date } : { stage: newStage };
      await applicantService.updateApplicantStage(applicant.id, payload);

      setApplicants((prev) =>
        prev.map((app) =>
          app.id === applicant.id ? { ...app, stage: newStage, start_date } : app
        )
      );
      setJob((prev) =>
        prev
          ? {
              ...prev,
              applicants: prev.applicants?.map((app) =>
                app.id === applicant.id ? { ...app, stage: newStage, start_date } : app
              ),
            }
          : prev
      );

      showOperationStatus(
        "success",
        `${applicant.name} has been ${action === "hire" ? "hired" : "rejected"} successfully!`
      );
    } catch (err: any) {
      showOperationStatus("error", err.message || `Failed to ${action} applicant`);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleViewApplicant = (applicant: Applicant) => {
    navigate(`/admin/dashboard/recruiting-management/${id}/applicants/${applicant.id}`);
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncateText = (text: string, maxLength: number): string => {
    const plainText = stripHtml(text);
    if (plainText.length <= maxLength) return text;
    return plainText.substring(0, maxLength) + "...";
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      OPEN: "bg-green-100 text-green-800 border-green-200",
      CLOSED: "bg-red-100 text-red-800 border-red-200",
      PAUSED: "bg-yellow-100 text-yellow-800 border-yellow-200",
      DRAFT: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
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
        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
          typeStyles[type as keyof typeof typeStyles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {type.replace("_", " ")}
      </span>
    );
  };

  const getExperienceBadge = (level: string) => {
    const levelStyles = {
      ENTRY: "bg-green-100 text-green-800",
      MID: "bg-blue-100 text-blue-800",
      SENIOR: "bg-purple-100 text-purple-800",
      EXECUTIVE: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
          levelStyles[level as keyof typeof levelStyles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {level}
      </span>
    );
  };

  const getStageBadge = (stage: string) => {
    const stageStyles = {
      APPLIED: "bg-blue-100 text-blue-800 border-blue-200",
      SHORTLISTED: "bg-yellow-100 text-yellow-800 border-yellow-200",
      INTERVIEWED: "bg-purple-100 text-purple-800 border-purple-200",
      HIRED: "bg-green-100 text-green-800 border-green-200",
      REJECTED: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <span
        className={`px-1.5 py-0.5 text-xs font-medium rounded-full border ${
          stageStyles[stage as keyof typeof stageStyles] || "bg-gray-100 text-gray-800 border-gray-200"
        }`}
      >
        {stage}
      </span>
    );
  };

  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplicants = filteredApplicants.slice(startIndex, endIndex);

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
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-3 py-2 border-t">
        <div className="flex items-center text-xs text-gray-700 mb-3 sm:mb-0">
          <span>
            Showing {startIndex + 1} to {Math.min(endIndex, filteredApplicants.length)} of{" "}
            {filteredApplicants.length} applicants
          </span>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-2 py-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3 h-3 mr-1" />
            Previous
          </button>
          <div className="flex space-x-0.5">
            {pages.map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-2 py-1 text-xs font-medium rounded ${
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
            className="flex items-center px-2 py-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-flex items-center space-x-1.5">
          <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-gray-700 font-medium">Loading job details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Job</h2>
          <p className="text-xs text-gray-600 mb-3">{error}</p>
          <button
            onClick={() => navigate("/admin/dashboard/recruiting-management")}
            className="px-3 py-1.5 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors text-xs"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Briefcase className="w-6 h-6 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-xs text-gray-600 mb-3">The job you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate("/admin/dashboard/recruiting-management")}
            className="px-3 py-1.5 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors text-xs"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto px-4 sm:px-6 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2 mb-3 sm:mb-0">
              <button
                onClick={() => navigate("/admin/dashboard/recruiting-management")}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-xs"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Jobs
              </button>
            </div>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={handleEditJob}
                disabled={operationLoading}
                className="flex items-center space-x-1.5 bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                <Edit className="w-3 h-3" />
                <span>Edit Job</span>
              </button>
              <button
                onClick={handleDeleteJob}
                disabled={operationLoading}
                className="flex items-center space-x-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Job Details Card */}
        <div className="bg-white rounded shadow-sm border">
          <div className="p-5">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-5">
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 mb-1.5">{job.title}</h1>
                {job.industry && <p className="text-sm text-gray-600 mb-3">{job.industry}</p>}
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1.5 sm:space-y-0 sm:space-x-2">
                {getStatusBadge(job.status!)}
                {getEmploymentTypeBadge(job.employment_type)}
                {getExperienceBadge(job.experience_level)}
              </div>
            </div>

            {/* Job Meta Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <div className="flex items-center text-gray-600 text-xs">
                <MapPin className="w-4 h-4 mr-1.5 text-gray-400" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center text-gray-600 text-xs">
                <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                <span>Posted {formatDate(job.posted_at)}</span>
              </div>
              <div className="flex items-center text-gray-600 text-xs">
                <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                <span>Expires {formatDate(job.expiry_date)}</span>
              </div>
              <div className="flex items-center text-gray-600 text-xs">
                <Users className="w-4 h-4 mr-1.5 text-gray-400" />
                <span>
                  {filteredApplicants.length} Applicant{filteredApplicants.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Job Description */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Job Description</h3>
              <div className="bg-white p-3 rounded border text-xs text-gray-700 leading-relaxed">
                <div
                  dangerouslySetInnerHTML={{
                    __html: showFullJobDescription
                      ? DOMPurify.sanitize(job.description || "No description available")
                      : DOMPurify.sanitize(truncateText(job.description || "No description available", 100)),
                  }}
                />
                {job.description && stripHtml(job.description).length > 100 && (
                  <button
                    onClick={() => setShowFullJobDescription(!showFullJobDescription)}
                    className="mt-1.5 text-xs text-primary-600 hover:text-primary-800 underline"
                  >
                    {showFullJobDescription ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>
            </div>

            {/* Skills Required */}
            {job.skills_required && Array.isArray(job.skills_required) && job.skills_required.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Required Skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {(job.skills_required as string[]).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Applicants Section */}
        <div className="bg-white rounded shadow-sm border">
          <div className="p-5 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <h2 className="text-lg font-semibold text-gray-900">
                Applicants ({filteredApplicants.length})
              </h2>
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  placeholder="Search applicants..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-60 pl-8 pr-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs"
                />
                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {applicantsLoading ? (
              <div className="p-6 text-center text-gray-500">
                <div className="inline-flex items-center space-x-1.5">
                  <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs">Loading applicants...</span>
                </div>
              </div>
            ) : filteredApplicants.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-xs">
                  {searchTerm.trim()
                    ? "No applicants found matching your search"
                    : "No applicants yet for this position"}
                </p>
              </div>
            ) : (
              <table className="w-full min-w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-2 px-3 sm:px-5 text-xs font-medium text-gray-500">
                      #
                    </th>
                    <th className="text-left py-2 px-3 sm:px-5 text-xs font-medium text-gray-500">
                      Applicant
                    </th>
                    <th className="text-left py-2 px-3 sm:px-5 text-xs font-medium text-gray-500 hidden md:table-cell">
                      Contact
                    </th>
                    <th className="text-left py-2 px-3 sm:px-5 text-xs font-medium text-gray-500 hidden lg:table-cell">
                      Experience
                    </th>
                    <th className="text-left py-2 px-3 sm:px-5 text-xs font-medium text-gray-500">
                      Stage
                    </th>
                    <th className="text-left py-2 px-3 sm:px-5 text-xs font-medium text-gray-500 hidden sm:table-cell">
                      Applied
                    </th>
                    <th className="text-right py-2 px-3 sm:px-5 text-xs font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentApplicants.map((applicant, index) => (
                    <tr key={applicant.id} className="hover:bg-gray-50">
                      <td className="py-3 px-3 sm:px-5 text-gray-700 text-xs">
                        {startIndex + index + 1}
                      </td>
                      <td className="py-3 px-3 sm:px-5">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 text-xs">
                            {applicant.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:px-5 text-gray-700 text-xs hidden md:table-cell">
                        <div className="flex flex-col space-y-0.5">
                          <div className="flex items-center">
                            <Mail className="w-3 h-3 text-gray-400 mr-1" />
                            <span className="text-xs">{applicant.email}</span>
                          </div>
                          {applicant.phone && (
                            <div className="flex items-center">
                              <Phone className="w-3 h-3 text-gray-400 mr-1" />
                              <span className="text-xs">{applicant.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:px-5 text-gray-700 text-xs hidden lg:table-cell">
                        {applicant.experienceYears ? `${applicant.experienceYears} years` : "Not specified"}
                      </td>
                      <td className="py-3 px-3 sm:px-5">{getStageBadge(applicant.stage)}</td>
                      <td className="py-3 px-3 sm:px-5 text-gray-700 text-xs hidden sm:table-cell">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 text-gray-400 mr-1" />
                          {formatDate(applicant.created_at)}
                        </div>
                      </td>
                      <td className="py-3 px-3 sm:px-5">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleViewApplicant(applicant)}
                            className="text-gray-400 hover:text-primary-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          {applicant.stage !== "HIRED" && applicant.stage !== "REJECTED" && (
                            <>
                              <button
                                onClick={() => setActionConfirm({ applicant, action: "hire" })}
                                disabled={operationLoading}
                                className="text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                                title="Hire"
                              >
                                <UserCheck className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setActionConfirm({ applicant, action: "reject" })}
                                disabled={operationLoading}
                                className="text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <UserX className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-b">
                  <tr>
                    <td colSpan={7} className="py-2 px-3 sm:px-5">
                      {totalPages > 1 && renderPagination()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Operation Status Toast */}
      {operationStatus && (
        <div className="fixed top-3 right-3 z-50 transform transition-all duration-300 ease-in-out">
          <div
            className={`flex items-center space-x-2 px-3 py-2 rounded shadow-lg border ${
              operationStatus.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : operationStatus.type === "error"
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-primary-50 border-primary-200 text-primary-800"
            }`}
          >
            {operationStatus.type === "success" && <CheckCircle className="w-4 h-4 text-green-600" />}
            {operationStatus.type === "error" && <XCircle className="w-4 h-4 text-red-600" />}
            {operationStatus.type === "info" && <AlertCircle className="w-4 h-4 text-primary-600" />}
            <span className="text-xs font-medium">{operationStatus.message}</span>
            <button onClick={() => setOperationStatus(null)} className="ml-1.5 hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Operation Loading Overlay */}
      {operationLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
          <div className="bg-white rounded p-5 shadow-xl">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs text-gray-700 font-medium">Processing...</span>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      {actionConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded p-5 w-full max-w-md">
            <div className="flex items-center space-x-2 mb-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  actionConfirm.action === "hire" ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {actionConfirm.action === "hire" ? (
                  <UserCheck className="w-5 h-5 text-green-600" />
                ) : (
                  <UserX className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {actionConfirm.action === "hire" ? "Hire" : "Reject"} Applicant
                </h3>
                <p className="text-xs text-gray-500">This action will update the applicant's status</p>
              </div>
            </div>
            <div className="mb-5">
              <p className="text-gray-700 text-xs">
                Are you sure you want to {actionConfirm.action}{" "}
                <span className="font-semibold">{actionConfirm?.applicant?.name}</span>? This will
                change their application status to{" "}
                <span className="font-semibold">
                  {actionConfirm.action === "hire" ? "HIRED" : "REJECTED"}
                </span>
                .
              </p>
              {actionConfirm.action === "hire" && (
                <div className="mt-3">
                  <label htmlFor="start_date" className="block text-xs font-medium text-gray-700 mb-0.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) =>
                      setActionConfirm((prev) =>
                        prev ? { ...prev, start_date: e.target.value } : prev
                      )
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-xs"
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-2">
              <button
                onClick={() => setActionConfirm(null)}
                className="w-full sm:w-auto px-3 py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleApplicantAction(
                    actionConfirm.applicant,
                    actionConfirm.action,
                    actionConfirm.start_date
                  )
                }
                disabled={operationLoading || (actionConfirm.action === "hire" && !actionConfirm.start_date)}
                className={`w-full sm:w-auto px-3 py-1.5 ${
                  actionConfirm.action === "hire"
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                } rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs`}
              >
                {actionConfirm.action === "hire" ? "Hire" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobView;
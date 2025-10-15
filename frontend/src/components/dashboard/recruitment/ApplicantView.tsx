
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  FileText,
  Calendar,
  MapPin,
  Briefcase,
  Clock,
  GraduationCap,
  Star,
  Download,
  Building,
  Users,
  ArrowLeft,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import DOMPurify from "dompurify";
import applicantService from "../../../services/applicantService";
import { useSocketEvent } from "../../../context/SocketContext";
import { API_URL } from "../../../api/api";

// Define union types instead of enums
type ApplicationStage = "APPLIED" | "SHORTLISTED" | "INTERVIEWED" | "HIRED" | "REJECTED";
type EmploymentType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
type ExperienceLevel = "ENTRY" | "MID" | "SENIOR" | "EXECUTIVE";
type JobStatus = "OPEN" | "CLOSED";

// Define Applicant and Job types based on Prisma schema
interface Job {
  id: string;
  title: string;
  description?: string;
  location: string;
  employment_type: EmploymentType;
  experience_level: ExperienceLevel;
  industry?: string;
  skills_required?: string[];
  status: JobStatus;
  posted_at?: string;
  expiry_date?: string;
}

interface Applicant {
  id: string;
  jobId: string;
  job: Job;
  name: string;
  email: string;
  phone?: string;
  cvUrl?: string;
  skills?: string[];
  experienceYears?: number;
  education?: { degree: string; school: string; year: string }[];
  coverLetter?: string;
  stage: ApplicationStage;
  created_at?: string;
  updated_at?: string;
  start_date?: string;
}

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

const ApplicantView: React.FC <{role:string}> = ({role})  => {
  const { jobId, applicantId } = useParams<{ jobId: string; applicantId?: string }>();
  const navigate = useNavigate();

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullCoverLetter, setShowFullCoverLetter] = useState<boolean>(false);
  const [showFullJobDescription, setShowFullJobDescription] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sidebarCurrentPage, setSidebarCurrentPage] = useState<number>(1);
  const [sidebarItemsPerPage] = useState<number>(6);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [actionConfirm, setActionConfirm] = useState<{
    applicant: Applicant;
    action: "hire" | "reject";
    start_date?: string;
  } | null>(null);

  useEffect(() => {
    if (jobId) {
      loadApplicants();
    }
  }, [jobId]);

  // Reset page to 1 when search term changes
  useEffect(() => {
    setSidebarCurrentPage(1);
  }, [searchTerm]);

  // WebSocket event handlers
  useSocketEvent("applicantCreated", (newApplicant: Applicant) => {
    if (newApplicant.jobId === jobId) {
      setApplicants((prev) => [newApplicant, ...prev]); // Add to top for recent
    }
  });

  useSocketEvent("applicantUpdated", (updatedApplicant: Applicant) => {
    if (updatedApplicant.jobId === jobId) {
      setApplicants((prev) =>
        prev.map((app) => (app.id === updatedApplicant.id ? updatedApplicant : app))
      );
      if (selectedApplicant?.id === updatedApplicant.id) {
        setSelectedApplicant(updatedApplicant);
      }
    }
  });

  useSocketEvent("applicantDeleted", ({ id: deletedId }: { id: string }) => {
    setApplicants((prev) => prev.filter((app) => app.id !== deletedId));
    if (selectedApplicant?.id === deletedId) {
      const remainingApplicants = applicants.filter((app) => app.id !== deletedId);
      if (remainingApplicants.length > 0) {
        setSelectedApplicant(remainingApplicants[0]);
        navigate(`/admin/dashboard/recruiting-management/${jobId}/applicants/${remainingApplicants[0].id}`);
      } else {
        setSelectedApplicant(null);
        navigate(`/admin/dashboard/recruiting-management/${jobId}`);
      }
    }
  });

  const loadApplicants = async () => {
    try {
      setLoading(true);
      setError(null);

      const applicantsData = await applicantService.getApplicantsByJobId(jobId!);
      if (applicantsData && applicantsData.length > 0) {
        // Sort by created_at descending (most recent first)
        const sortedApplicants = applicantsData.sort(
          (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
        setApplicants(sortedApplicants);
      } else {
        setApplicants([]);
        setError("No applicants found for this job");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load applicants";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const showOperationStatus = (type: OperationStatus["type"], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
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
      if (selectedApplicant?.id === applicant.id) {
        setSelectedApplicant((prev) =>
          prev ? { ...prev, stage: newStage, start_date } : prev
        );
      }

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

  const getStageColor = (stage: ApplicationStage) => {
    const colors: Record<ApplicationStage, string> = {
      APPLIED: "bg-blue-100 text-blue-800",
      SHORTLISTED: "bg-yellow-100 text-yellow-800",
      INTERVIEWED: "bg-purple-100 text-purple-800",
      HIRED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return colors[stage] || "bg-gray-100 text-gray-800";
  };

  const getEmploymentTypeDisplay = (type: EmploymentType) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleApplicantSelect = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setShowFullCoverLetter(false);
    setShowFullJobDescription(false);
    navigate(`/admin/dashboard/recruiting-management/${jobId}/applicants/${applicant.id}`);
    // Calculate the page for the selected applicant
    const indexInFiltered = filteredApplicants.findIndex((app) => app.id === applicant.id);
    if (indexInFiltered !== -1) {
      const targetPage = Math.floor(indexInFiltered / sidebarItemsPerPage) + 1;
      setSidebarCurrentPage(targetPage);
    }
  };

  // Truncate text to a specified length
  const truncateText = (text: string, maxLength: number): string => {
    const plainText = stripHtml(text);
    if (plainText.length <= maxLength) return text;
    return plainText.substring(0, maxLength) + "...";
  };

  // Filtered applicants for search
  const filteredApplicants = useMemo(() => {
    if (!searchTerm.trim()) return applicants;

    return applicants.filter((applicant) =>
      [
        applicant.name?.toLowerCase(),
        applicant.email?.toLowerCase(),
        applicant.phone?.toLowerCase(),
      ].some((field) => field && field.includes(searchTerm.toLowerCase()))
    );
  }, [applicants, searchTerm]);

  useEffect(() => {
    if (applicants.length > 0) {
      if (applicantId) {
        const foundApplicant = applicants.find((app) => app.id === applicantId);
        if (foundApplicant) {
          setSelectedApplicant(foundApplicant);
          setShowFullCoverLetter(false);
          setShowFullJobDescription(false);
          // Calculate the page for the selected applicant in filteredApplicants
          const indexInFiltered = filteredApplicants.findIndex((app) => app.id === applicantId);
          if (indexInFiltered !== -1) {
            const targetPage = Math.floor(indexInFiltered / sidebarItemsPerPage) + 1;
            setSidebarCurrentPage(targetPage);
          }
        } else {
          setError("Applicant not found");
        }
      } else {
        // Select the first applicant if no applicantId is provided
        setSelectedApplicant(applicants[0]);
        setShowFullCoverLetter(false);
        setShowFullJobDescription(false);
        navigate(`/admin/dashboard/recruiting-management/${jobId}/applicants/${applicants[0].id}`);
        setSidebarCurrentPage(1); // Reset to first page
      }
    } else if (!loading && applicants.length === 0) {
      setError("No applicants found for this job");
    }
  }, [applicants, applicantId, jobId, navigate, filteredApplicants, sidebarItemsPerPage]);

  // Sidebar pagination calculations
  const sidebarTotalPages = Math.ceil(filteredApplicants.length / sidebarItemsPerPage);
  const sidebarStartIndex = (sidebarCurrentPage - 1) * sidebarItemsPerPage;
  const sidebarEndIndex = sidebarStartIndex + sidebarItemsPerPage;
  const currentSidebarApplicants = filteredApplicants.slice(sidebarStartIndex, sidebarEndIndex);

  // Handle sidebar page change
  const handleSidebarPageChange = (page: number) => {
    setSidebarCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-700 font-medium">Loading applicants...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Applicants</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(`/admin/dashboard/recruiting-management/${jobId}`)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Back to Job
          </button>
        </div>
      </div>
    );
  }

  if (!selectedApplicant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Applicants Found</h2>
          <p className="text-gray-600 mb-4">There are no applicants for this job.</p>
          <button
            onClick={() => navigate(`/admin/dashboard/recruiting-management/${jobId}`)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Back to Job
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white border-b">
        <div className="mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => navigate(`/admin/dashboard/recruiting-management/${jobId}`)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Job
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mt-6">
        {/* Applicants List Sidebar */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <div className="flex flex-col   sm:justify-between space-y-4 sm:space-y-0">
                <h2 className="text-lg font-semibold text-gray-900">Applicants</h2>
                <div className="relative flex-1 sm:flex-none">
                  <input
                    type="text"
                    placeholder="Search applicants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{filteredApplicants.length} total applications</p>
            </div>
            <div className="divide-y max-h-[calc(100vh-300px)] overflow-y-auto">
              {currentSidebarApplicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedApplicant.id === applicant.id ? "bg-primary-50 border-r-2 border-primary-500" : ""
                  }`}
                  onClick={() => handleApplicantSelect(applicant)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{applicant.name}</h3>
                      <p className="text-xs text-gray-600 truncate mt-1">{applicant.email}</p>
                      <p className="text-xs text-gray-500 mt-1">{applicant.job.title}</p>
                    </div>
                    <div className="flex flex-col items-end ml-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStageColor(applicant.stage)}`}>
                        {applicant.stage}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 mt-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Sidebar Pagination */}
            {sidebarTotalPages > 1 && (
              <div className="p-4 border-t flex justify-center space-x-2">
                <button
                  onClick={() => handleSidebarPageChange(sidebarCurrentPage - 1)}
                  disabled={sidebarCurrentPage === 1}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="py-2 px-4 text-sm text-gray-700">
                  Page {sidebarCurrentPage} of {sidebarTotalPages}
                </span>
                <button
                  onClick={() => handleSidebarPageChange(sidebarCurrentPage + 1)}
                  disabled={sidebarCurrentPage === sidebarTotalPages}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Applicant Detail View */}
        <div className="col-span-9 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedApplicant.name}</h1>
                  <p className="text-gray-600">{selectedApplicant.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStageColor(selectedApplicant.stage)}`}>
                      {selectedApplicant.stage}
                    </span>
                    <span className="text-sm text-gray-500">Applied {formatDate(selectedApplicant.created_at)}</span>
                  </div>
                </div>
              </div>
              {selectedApplicant.stage !== "HIRED" && selectedApplicant.stage !== "REJECTED" && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActionConfirm({ applicant: selectedApplicant, action: "hire" })}
                    disabled={operationLoading}
                    className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Hire</span>
                  </button>
                  <button
                    onClick={() => setActionConfirm({ applicant: selectedApplicant, action: "reject" })}
                    disabled={operationLoading}
                    className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">{selectedApplicant.email}</span>
                </div>
                {selectedApplicant.phone && (
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{selectedApplicant.phone}</span>
                  </div>
                )}
                {selectedApplicant.cvUrl && (
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-400 mr-3" />
                    <a
                      href={`${API_URL}${selectedApplicant.cvUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                    >
                      Download CV
                      <Download className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Experience & Timeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Experience & Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">
                    {selectedApplicant.experienceYears
                      ? `${selectedApplicant.experienceYears} years experience`
                      : "Experience not specified"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">Applied {formatDate(selectedApplicant.created_at)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">Updated {formatDate(selectedApplicant.updated_at)}</span>
                </div>
                {selectedApplicant.stage === "HIRED" && selectedApplicant.start_date && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">Start Date {formatDate(selectedApplicant.start_date)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          {selectedApplicant.skills && selectedApplicant.skills.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {selectedApplicant.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {selectedApplicant.education && selectedApplicant.education.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Education</h3>
              <div className="space-y-4">
                {selectedApplicant.education.map((edu, index) => (
                  <div key={index} className="flex items-start">
                    <GraduationCap className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{edu.degree}</h4>
                      <p className="text-sm text-gray-600">{edu.school}</p>
                      <p className="text-xs text-gray-500">{edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cover Letter */}
          {selectedApplicant.coverLetter && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Cover Letter</h3>
              <div className="bg-white p-4 rounded border text-sm text-gray-700 leading-relaxed">
                <div
                  dangerouslySetInnerHTML={{
                    __html: showFullCoverLetter
                      ? DOMPurify.sanitize(selectedApplicant.coverLetter)
                      : DOMPurify.sanitize(truncateText(selectedApplicant.coverLetter, 100)),
                  }}
                />
                {stripHtml(selectedApplicant.coverLetter).length > 100 && (
                  <button
                    onClick={() => setShowFullCoverLetter(!showFullCoverLetter)}
                    className="mt-2 text-sm text-primary-600 hover:text-primary-800 underline"
                  >
                    {showFullCoverLetter ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Job Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Applied Position</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-base font-semibold text-gray-900">{selectedApplicant.job.title}</h4>
                <div className="bg-white p-4 rounded border text-sm text-gray-700 leading-relaxed">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: showFullJobDescription
                        ? DOMPurify.sanitize(selectedApplicant.job.description || "No description available")
                        : DOMPurify.sanitize(truncateText(selectedApplicant.job.description || "No description available", 100)),
                    }}
                  />
                  {selectedApplicant.job.description &&
                    stripHtml(selectedApplicant.job.description).length > 100 && (
                      <button
                        onClick={() => setShowFullJobDescription(!showFullJobDescription)}
                        className="mt-2 text-sm text-primary-600 hover:text-primary-800 underline"
                      >
                        {showFullJobDescription ? "Show Less" : "Show More"}
                      </button>
                    )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{selectedApplicant.job.location}</span>
                </div>
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{getEmploymentTypeDisplay(selectedApplicant.job.employment_type)}</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{selectedApplicant.job.experience_level} Level</span>
                </div>
                {selectedApplicant.job.industry && (
                  <div className="flex items-center">
                    <Building className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{selectedApplicant.job.industry}</span>
                  </div>
                )}
              </div>

              {selectedApplicant.job.skills_required && selectedApplicant.job.skills_required.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Required Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplicant.job.skills_required.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                <span>Posted: {formatDate(selectedApplicant.job.posted_at)}</span>
                {selectedApplicant.job.expiry_date && (
                  <span>Expires: {formatDate(selectedApplicant.job.expiry_date)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Operation Status Toast */}
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
            {operationStatus.type === "success" && <CheckCircle className="w-5 h-5 text-green-600" />}
            {operationStatus.type === "error" && <XCircle className="w-5 h-5 text-red-600" />}
            {operationStatus.type === "info" && <AlertCircle className="w-5 h-5 text-primary-600" />}
            <span className="font-medium">{operationStatus.message}</span>
            <button onClick={() => setOperationStatus(null)} className="ml-2 hover:opacity-70">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Operation Loading Overlay */}
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

      {/* Action Confirmation Modal */}
      {actionConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  actionConfirm.action === "hire" ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {actionConfirm.action === "hire" ? (
                  <UserCheck className="w-6 h-6 text-green-600" />
                ) : (
                  <UserX className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {actionConfirm.action === "hire" ? "Hire" : "Reject"} Applicant
                </h3>
                <p className="text-sm text-gray-500">This action will update the applicant's status</p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to {actionConfirm.action}{" "}
                <span className="font-semibold">{actionConfirm.applicant.name}</span>? This will
                change their application status to{" "}
                <span className="font-semibold">
                  {actionConfirm.action === "hire" ? "HIRED" : "REJECTED"}
                </span>
                .
              </p>
              {actionConfirm.action === "hire" && (
                <div className="mt-4">
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                 <input
  type="date"
  id="start_date"
  required
  min={new Date().toISOString().split('T')[0]} // min date = today
  onChange={(e) =>
    setActionConfirm((prev) =>
      prev ? { ...prev, start_date: e.target.value } : prev
    )
  }
  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
/>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setActionConfirm(null)}
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
                className={`w-full sm:w-auto px-4 py-2 ${
                  actionConfirm.action === "hire"
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                } rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
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

export default ApplicantView;
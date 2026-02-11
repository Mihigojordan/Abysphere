/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Building2,
  MapPin,
  Phone,
  Globe,
  Calendar,
  ArrowLeft,
  AlertTriangle,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock,
  Zap,
  Edit,
  ChevronDown,
} from "lucide-react";
import DOMPurify from "dompurify";
import Quill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import companyService, { type Company, type CompanyStatus, type SystemFeature } from "../../../services/companyService";
import { API_URL } from "../../../api/api";
interface OperationStatus {
  type: "success" | "error" | "info";
  message: string;
}
const FEATURES_PER_PAGE = 6;
// Define feature groups
const FEATURE_GROUPS = {
  INVENTORY: {
    name: 'Inventory Management',
    description: 'All inventory-related features',
    children: [
     'SALES_RETURN_MANAGEMENT',
      'STOCKOUT_MANAGEMENT',
      'STOCKIN_MANAGEMENT',
      'SUPPLIER_MANAGEMENT',
      'CATEGORY_MANAGEMENT',
      'ASSET_MANAGEMENT',
      "CLIENTS_MANAGEMENT",
      "EMPLOYEES_MANAGEMENT",
      "DEPARTMENTS_MANAGEMENT",
      "VIEW_REPORTS"
    
    ]
  }
};
// Features that belong to groups
const GROUPED_FEATURE_NAMES = Object.values(FEATURE_GROUPS).flatMap(g => g.children);
const CompanyViewPage: React.FC<{ role: string }> = ({ role }) => {
  const { id: companyId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyFeatures, setCompanyFeatures] = useState<SystemFeature[]>([]);
  const [featuresLoading, setFeaturesLoading] = useState<boolean>(false);
  const [featuresCurrentPage, setFeaturesCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sidebarCurrentPage, setSidebarCurrentPage] = useState<number>(1);
  const [sidebarItemsPerPage] = useState<number>(6);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [actionConfirm, setActionConfirm] = useState<{
    company: Company;
    action: "deactivate" | "clearMessage";
  } | null>(null);
  const [showMessageModal, setShowMessageModal] = useState<boolean>(false);
  const [messageText, setMessageText] = useState<string>("");
  const [messageExpiry, setMessageExpiry] = useState<string>("");
  const [messageTextColor, setMessageTextColor] = useState<string>("#FFFFFF");
  const [messageBgColor, setMessageBgColor] = useState<string>("#2563eb");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const url = `/${role}/dashboard/company-management/`;
  // Fetch companies
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        setLoading(true);
        setError(null);
        const companiesData = await companyService.getAllCompanies();
        if (companiesData && companiesData.length > 0) {
          const sortedCompanies = companiesData.sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          setCompanies(sortedCompanies);
        } else {
          setCompanies([]);
          setError("No companies found");
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load companies";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    loadCompanies();
  }, []);
  // Fetch company features when selected company changes
  useEffect(() => {
    const loadCompanyFeatures = async () => {
      if (!selectedCompany?.id) return;
      try {
        setFeaturesLoading(true);
        const features = await companyService.getCompanyFeatures(selectedCompany.id);
        setCompanyFeatures(features || []);
        setFeaturesCurrentPage(1);
      } catch (err: any) {
        console.error("Error loading features:", err);
        setCompanyFeatures([]);
      } finally {
        setFeaturesLoading(false);
      }
    };
    loadCompanyFeatures();
  }, [selectedCompany?.id]);
  useEffect(() => {
    setSidebarCurrentPage(1);
  }, [searchTerm]);
  const filteredCompanies = useMemo(() => {
    if (!searchTerm.trim()) return companies;
    return companies.filter((company) =>
      [
        company.adminName?.toLowerCase(),
        company.adminEmail?.toLowerCase(),
        company.city?.toLowerCase(),
        company.country?.toLowerCase(),
      ].some((field) => field && field.includes(searchTerm.toLowerCase()))
    );
  }, [companies, searchTerm]);
  useEffect(() => {
    if (companies.length > 0) {
      if (companyId) {
        const foundCompany = companies.find((company) => company.id === companyId);
        if (foundCompany) {
          setSelectedCompany(foundCompany);
          setShowFullDescription(false);
          const indexInFiltered = filteredCompanies.findIndex((company) => company.id === companyId);
          if (indexInFiltered !== -1) {
            const targetPage = Math.floor(indexInFiltered / sidebarItemsPerPage) + 1;
            setSidebarCurrentPage(targetPage);
          }
        } else {
          setError("Company not found");
        }
      } else {
        setSelectedCompany(companies[0]);
        setShowFullDescription(false);
        navigate(`${url}${companies[0].id}`);
        setSidebarCurrentPage(1);
      }
    } else if (!loading && companies.length === 0) {
      setError("No companies found");
    }
  }, [companies, companyId, navigate, filteredCompanies, sidebarItemsPerPage, url, loading]);
  const showOperationStatus = (type: OperationStatus["type"], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };
  const handleCompanyAction = async (company: Company, action: "deactivate" | "clearMessage") => {
    try {
      setOperationLoading(true);
      setActionConfirm(null);
      if (action === "deactivate") {
        const newStatus: CompanyStatus = "INACTIVE";
        await companyService.updateCompany(company.id, { status: newStatus });
        setCompanies((prev) =>
          prev.map((c) => (c.id === company.id ? { ...c, status: newStatus } : c))
        );
        if (selectedCompany?.id === company.id) {
          setSelectedCompany((prev) => (prev ? { ...prev, status: newStatus } : prev));
        }
        showOperationStatus(
          "success",
          `Company ${company.adminName} has been deactivated successfully!`
        );
      } else if (action === "clearMessage") {
        await companyService.clearCompanyMessage(company.id);
        setCompanies((prev) =>
          prev.map((c) => (c.id === company.id ? { ...c, message: undefined, messageExpiry: undefined } : c))
        );
        if (selectedCompany?.id === company.id) {
          setSelectedCompany((prev) => (prev ? { ...prev, message: undefined, messageExpiry: undefined } : prev));
        }
        showOperationStatus("success", "Company message cleared successfully!");
      }
    } catch (err: any) {
      showOperationStatus("error", err.message || `Failed to ${action === "deactivate" ? "deactivate company" : "clear message"}`);
    } finally {
      setOperationLoading(false);
    }
  };
  const handleSetMessage = async () => {
    if (!selectedCompany?.id) return;

    // Validate expiry date is not in the past
    if (messageExpiry) {
      const expiryDate = new Date(messageExpiry);
      if (expiryDate <= new Date()) {
        showOperationStatus("error", "Expiry date must be in the future");
        return;
      }
    }

    try {
      setOperationLoading(true);
      const expiryISO = messageExpiry ? new Date(messageExpiry).toISOString() : undefined;
      await companyService.setCompanyMessage(
        selectedCompany.id,
        messageText,
        expiryISO,
        messageTextColor,
        messageBgColor
      );
      setSelectedCompany((prev) =>
        prev ? {
          ...prev,
          message: messageText,
          messageExpiry: expiryISO,
          messageTextColor: messageTextColor,
          messageBgColor: messageBgColor
        } : prev
      );
      showOperationStatus("success", "Message set successfully!");
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to set message");
    } finally {
      setOperationLoading(false);
      setShowMessageModal(false);
      setMessageText("");
      setMessageExpiry("");
      setMessageTextColor("#FFFFFF");
      setMessageBgColor("#2563eb");
    }
  };
  const toggleGroupExpansion = (groupKey: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };
  const getStatusColor = (status?: CompanyStatus) => {
    const colors: Record<CompanyStatus, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-red-100 text-red-800",
    };
    return colors[status || "INACTIVE"] || "bg-gray-100 text-gray-800";
  };
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setShowFullDescription(false);
    navigate(`${url}${company.id}`);
    const indexInFiltered = filteredCompanies.findIndex((c) => c.id === company.id);
    if (indexInFiltered !== -1) {
      const targetPage = Math.floor(indexInFiltered / sidebarItemsPerPage) + 1;
      setSidebarCurrentPage(targetPage);
    }
  };
  const stripHtml = (html: string): string => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };
  const truncateText = (text: string, maxLength: number): string => {
    const plainText = stripHtml(text);
    if (plainText.length <= maxLength) return text;
    return plainText.substring(0, maxLength) + "...";
  };
  // Separate features into grouped and ungrouped
  const groupedFeatures = companyFeatures.filter(f => GROUPED_FEATURE_NAMES.includes(f.name));
  const ungroupedFeatures = companyFeatures.filter(f => !GROUPED_FEATURE_NAMES.includes(f.name));
  // Features pagination for ungrouped only
  const featuresTotalPages = Math.ceil(ungroupedFeatures.length / FEATURES_PER_PAGE);
  const featuresStartIndex = (featuresCurrentPage - 1) * FEATURES_PER_PAGE;
  const featuresEndIndex = featuresStartIndex + FEATURES_PER_PAGE;
  const currentPageFeatures = ungroupedFeatures.slice(featuresStartIndex, featuresEndIndex);
  // Sidebar pagination calculations
  const sidebarTotalPages = Math.ceil(filteredCompanies.length / sidebarItemsPerPage);
  const sidebarStartIndex = (sidebarCurrentPage - 1) * sidebarItemsPerPage;
  const sidebarEndIndex = sidebarStartIndex + sidebarItemsPerPage;
  const currentSidebarCompanies = filteredCompanies.slice(sidebarStartIndex, sidebarEndIndex);
  const handleSidebarPageChange = (page: number) => {
    setSidebarCurrentPage(page);
  };
  const handleFeaturesPageChange = (page: number) => {
    setFeaturesCurrentPage(page);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-700 font-medium">Loading companies...</span>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Companies</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(url)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Back to Companies
          </button>
        </div>
      </div>
    );
  }
  if (!selectedCompany) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Companies Found</h2>
          <p className="text-gray-600 mb-4">There are no companies available.</p>
          <button
            onClick={() => navigate(url)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Back to Companies
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
            onClick={() => navigate(url)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to Companies
          </button>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6 mt-6">
        {/* Companies List Sidebar */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <div className="flex flex-col  gap-3 sm:justify-between ">
                <h2 className="text-lg font-semibold text-gray-900">Companies</h2>
                <div className="relative flex-1 sm:flex-none">
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{filteredCompanies.length} total companies</p>
            </div>
            <div className="divide-y max-h-[calc(100vh-300px)] overflow-y-auto">
              {currentSidebarCompanies.map((company) => (
                <div
                  key={company.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedCompany.id === company.id ? "bg-primary-50 border-r-2 border-primary-500" : ""
                  }`}
                  onClick={() => handleCompanySelect(company)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{company.adminName}</h3>
                      <p className="text-xs text-gray-600 truncate mt-1">{company.adminEmail}</p>
                      <p className="text-xs text-gray-500 mt-1">{company.city || "No city"}</p>
                    </div>
                    <div className="flex flex-col items-end ml-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                        {company.status || "INACTIVE"}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-400 mt-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
        {/* Main Company Detail View */}
        <div className="col-span-9 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {selectedCompany.profileImage ? (
                  <img
                    src={selectedCompany.profileImage.includes("http") ? selectedCompany.profileImage : `${API_URL}${selectedCompany.profileImage}`}
                    alt={selectedCompany.adminName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedCompany.adminName}</h1>
                  <p className="text-gray-600">{selectedCompany.adminEmail}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCompany.status)}`}>
                      {selectedCompany.status || "INACTIVE"}
                    </span>
                    <span className="text-sm text-gray-500">Added {formatDate(selectedCompany.createdAt)}</span>
                  </div>
                </div>
              </div>
              {selectedCompany.status !== "INACTIVE" && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActionConfirm({ company: selectedCompany, action: "deactivate" })}
                    disabled={operationLoading}
                    className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Deactivate</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">Name: {selectedCompany.adminName}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">{selectedCompany.phone || "No phone"}</span>
                </div>
                {selectedCompany.website && (
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{selectedCompany.website}</span>
                  </div>
                )}
                {selectedCompany.address && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{selectedCompany.address}</span>
                  </div>
                )}
                {selectedCompany.city && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{selectedCompany.city}</span>
                  </div>
                )}
                {selectedCompany.country && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{selectedCompany.country}</span>
                  </div>
                )}
              </div>
            </div>
            {/* Status & Timeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">
                    Status: {selectedCompany.status || "INACTIVE"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Lock className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">
                    Two-Factor Authentication: {selectedCompany.is2FA ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Lock className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">
                    Account Locked: {selectedCompany.isLocked ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">Added {formatDate(selectedCompany.createdAt)}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">Updated {formatDate(selectedCompany.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
          {/* Assigned Features Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-medium text-gray-900">Assigned Features</h3>
                <span className="text-sm text-gray-500">({companyFeatures.length})</span>
              </div>
              <button
                onClick={() => navigate(`/${role}/dashboard/company-management/assign-features/${selectedCompany.id}`)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Manage Features</span>
              </button>
            </div>
            {featuresLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-600">Loading features...</span>
              </div>
            ) : companyFeatures.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No features assigned to this company yet.</p>
                <button
                  onClick={() => navigate(`/${role}/dashboard/company-management/${selectedCompany.id}/assign-features`)}
                  className="mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  Assign Features
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {/* Render Feature Groups */}
                  {Object.entries(FEATURE_GROUPS).map(([groupKey, group]) => {
                    const groupChildren = companyFeatures.filter(f => group.children.includes(f.name));
                    if (groupChildren.length === 0) return null;
                   
                    const isExpanded = expandedGroups[groupKey];
                    return (
                      <div key={groupKey} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Group Header */}
                        <div
                          className="bg-blue-50 p-4 cursor-pointer hover:bg-blue-100 transition-colors"
                          onClick={() => toggleGroupExpansion(groupKey)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Zap className="w-4 h-4 text-white" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-gray-900 flex items-center">
                                  {group.name}
                                  <span className="ml-2 text-xs text-gray-500 font-normal">
                                    ({groupChildren.length} features)
                                  </span>
                                </h4>
                                {group.description && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    {group.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="w-5 h-5 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-5 h-5 text-gray-600" />
                            )}
                          </div>
                        </div>
                        {/* Group Children */}
                        {isExpanded && (
                          <div className="bg-gray-50 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {groupChildren.map((feature) => (
                                <div
                                  key={feature.id}
                                  className="bg-white border border-gray-200 rounded-lg p-3 hover:border-primary-300 transition-colors"
                                >
                                  <div className="flex items-start space-x-2">
                                    <div className="w-6 h-6 bg-primary-100 rounded flex items-center justify-center flex-shrink-0">
                                      <Zap className="w-3 h-3 text-primary-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="text-xs font-semibold text-gray-900 truncate">
                                        {feature.name}
                                      </h5>
                                      {feature.description && (
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                          {feature.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {/* Render Ungrouped Features */}
                  {currentPageFeatures.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentPageFeatures.map((feature) => (
                        <div
                          key={feature.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Zap className="w-4 h-4 text-primary-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 truncate">
                                {feature.name}
                              </h4>
                              {feature.description && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {feature.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Features Pagination */}
                {featuresTotalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t pt-4">
                    <div className="text-sm text-gray-700">
                      Showing {featuresStartIndex + 1} to {Math.min(featuresEndIndex, ungroupedFeatures.length)} of{' '}
                      {ungroupedFeatures.length} ungrouped features
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFeaturesPageChange(featuresCurrentPage - 1)}
                        disabled={featuresCurrentPage === 1}
                        className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-sm text-gray-700">
                        Page {featuresCurrentPage} of {featuresTotalPages}
                      </span>
                      <button
                        onClick={() => handleFeaturesPageChange(featuresCurrentPage + 1)}
                        disabled={featuresCurrentPage === featuresTotalPages}
                        className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          {/* Description */}
          {selectedCompany.description && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
              <div className="bg-white p-4 rounded border text-sm text-gray-700 leading-relaxed">
                <Quill
                  value={showFullDescription ? selectedCompany.description : truncateText(selectedCompany.description, 100)}
                  readOnly={true}
                  theme="snow"
                  modules={{ toolbar: false }}
                  className="border-none p-0 bg-transparent"
                />
                {stripHtml(selectedCompany.description).length > 100 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-2 text-sm text-primary-600 hover:text-primary-800 underline"
                  >
                    {showFullDescription ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>
            </div>
          )}
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
          {/* Company Message Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Company Message</h3>
              <div className="flex items-center space-x-3">
                {selectedCompany?.message && (
                  <button
                    onClick={() => setActionConfirm({ company: selectedCompany, action: "clearMessage" })}
                    disabled={operationLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear Message</span>
                  </button>
                )}
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>{selectedCompany?.message ? "Edit Message" : "Set Message"}</span>
                </button>
              </div>
            </div>
            {selectedCompany?.message ? (
              <div className="bg-gray-50 p-4 rounded border">
                <p className="text-sm text-gray-800">{selectedCompany.message}</p>
                {selectedCompany.messageExpiry && (
                  <p className="text-xs text-gray-500 mt-1">
                    Expires: {formatDate(selectedCompany.messageExpiry)}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No message set.</p>
            )}
          </div>
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
          {/* Set Message Modal */}
          {showMessageModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Set Company Message</h3>
                  <button
                    onClick={() => {
                      setShowMessageModal(false);
                      setMessageText("");
                      setMessageExpiry("");
                      setMessageTextColor("#FFFFFF");
                      setMessageBgColor("#2563eb");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      rows={4}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Enter the message that will be shown to the company admin..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry (optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={messageExpiry}
                      onChange={(e) => setMessageExpiry(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty for a permanent message. Must be a future date.
                    </p>
                  </div>
                  {/* Text Color Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={messageTextColor}
                        onChange={(e) => setMessageTextColor(e.target.value)}
                        className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={messageTextColor}
                        onChange={(e) => setMessageTextColor(e.target.value)}
                        placeholder="#FFFFFF"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                      />
                    </div>
                  </div>
                  {/* Background Color Picker */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Background Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={messageBgColor}
                        onChange={(e) => setMessageBgColor(e.target.value)}
                        className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={messageBgColor}
                        onChange={(e) => setMessageBgColor(e.target.value)}
                        placeholder="#2563eb"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                      />
                    </div>
                  </div>
                  {/* Live Preview */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preview
                    </label>
                    <div
                      className="p-3 rounded-lg text-center font-medium"
                      style={{
                        backgroundColor: messageBgColor,
                        color: messageTextColor,
                      }}
                    >
                      {messageText || "Your message preview will appear here"}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowMessageModal(false);
                      setMessageText("");
                      setMessageExpiry("");
                      setMessageTextColor("#FFFFFF");
                      setMessageBgColor("#2563eb");
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSetMessage}
                    disabled={operationLoading || !messageText.trim()}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {operationLoading ? "Saving…" : "Save Message"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Action Confirmation Modal */}
          {actionConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    actionConfirm.action === "deactivate" ? "bg-red-100" : "bg-primary-100"
                  }`}>
                    {actionConfirm.action === "deactivate" ? (
                      <Lock className="w-6 h-6 text-red-600" />
                    ) : (
                      <X className="w-6 h-6 text-primary-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {actionConfirm.action === "deactivate" ? "Deactivate Company" : "Clear Company Message"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {actionConfirm.action === "deactivate"
                        ? "This action will update the company's status"
                        : "This action will remove the current message"}
                    </p>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-gray-700">
                    {actionConfirm.action === "deactivate" ? (
                      <>
                        Are you sure you want to deactivate{" "}
                        <span className="font-semibold">{actionConfirm.company.adminName}</span>? This will
                        change the company's status to{" "}
                        <span className="font-semibold">INACTIVE</span>.
                      </>
                    ) : (
                      <>
                        Are you sure you want to clear the message for{" "}
                        <span className="font-semibold">{actionConfirm.company.adminName}</span>?
                      </>
                    )}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => setActionConfirm(null)}
                    className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleCompanyAction(actionConfirm.company, actionConfirm.action)}
                    disabled={operationLoading}
                    className={`w-full sm:w-auto px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-lg ${
                      actionConfirm.action === "deactivate"
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-primary-500 hover:bg-primary-600 text-white"
                    }`}
                  >
                    {actionConfirm.action === "deactivate" ? "Deactivate" : "Clear"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CompanyViewPage;
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
  CreditCard,
  Grid3X3,
  List,
  RefreshCw,
  Calendar,
  DollarSign,
} from "lucide-react";
import membershipPlanService from "../../../services/membershipPlanService";
import companyService from "../../../services/companyService";

interface MembershipPlan {
  id: string;
  companyId: string;
  planName: string;
  startTime: string;
  expireTime: string;
  amountPaid: number;
  shortDescription?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MembershipPlanData {
  id?: string;
  companyId: string;
  planName: string;
  startTime: string;
  expireTime: string;
  amountPaid: number;
  shortDescription?: string | null;
}

interface OperationStatus {
  type: "success" | "error" | "info";
  message: string;
}

type ViewMode = "table" | "grid" | "list";

const MembershipPlanDashboard: React.FC<{ role: string; companyId?: string }> = ({
  role,
  companyId: propCompanyId,
}) => {
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [allMembershipPlans, setAllMembershipPlans] = useState<MembershipPlan[]>([]);
  const [companies, setCompanies] = useState<Array<{ id: string; adminName: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<keyof MembershipPlan>("planName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [viewingPlan, setViewingPlan] = useState<MembershipPlan | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<MembershipPlan | null>(null);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const [newPlan, setNewPlan] = useState<MembershipPlanData>({
    companyId: propCompanyId || "",
    planName: "",
    startTime: "",
    expireTime: "",
    amountPaid: 0,
    shortDescription: "",
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      if (propCompanyId) return;
      try {
        const data = await companyService.getAllCompanies();
        setCompanies(data.map(c => ({ id: c.id, adminName: c.adminName || "Unnamed" })));
      } catch (err) {
        console.error("Failed to load companies", err);
      }
    };
    fetchCompanies();
  }, [propCompanyId]);

  useEffect(() => {
    loadMembershipPlans();
  }, []);

  useEffect(() => {
    handleFilterAndSort();
  }, [searchTerm, sortBy, sortOrder, allMembershipPlans]);

  const loadMembershipPlans = async () => {
    try {
      setLoading(true);
      let data: MembershipPlan[] = [];
      if (propCompanyId) {
        data = await membershipPlanService.getMembershipPlansByCompany(propCompanyId);
      } else {
        data = await membershipPlanService.getAllMembershipPlans();
      }
      setAllMembershipPlans(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load membership plans");
    } finally {
      setLoading(false);
    }
  };

  const showOperationStatus = (type: OperationStatus["type"], message: string, duration = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleFilterAndSort = () => {
    let filtered = [...allMembershipPlans];
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        p =>
          p.planName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.shortDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.amountPaid?.toString().includes(searchTerm)
      );
    }
    filtered.sort((a, b) => {
      let aV = a[sortBy] ?? "";
      let bV = b[sortBy] ?? "";
      if (sortBy === "startTime" || sortBy === "expireTime" || sortBy === "createdAt") {
        return sortOrder === "asc"
          ? new Date(aV as string).getTime() - new Date(bV as string).getTime()
          : new Date(bV as string).getTime() - new Date(aV as string).getTime();
      }
      if (sortBy === "amountPaid") {
        return sortOrder === "asc"
          ? (aV as number) - (bV as number)
          : (bV as number) - (aV as number);
      }
      return sortOrder === "asc"
        ? String(aV).localeCompare(String(bV))
        : String(bV).localeCompare(String(aV));
    });
    setMembershipPlans(filtered);
    setCurrentPage(1);
  };

  const handleAddPlan = async () => {
    try {
      setOperationLoading(true);
      const validation = membershipPlanService.validateMembershipPlanData(newPlan);
      if (!validation.isValid) {
        showOperationStatus("error", validation.errors.join(", "));
        return;
      }
      await membershipPlanService.createMembershipPlan(newPlan);
      setNewPlan({
        companyId: propCompanyId || "",
        planName: "",
        startTime: "",
        expireTime: "",
        amountPaid: 0,
        shortDescription: "",
      });
      setShowAddModal(false);
      loadMembershipPlans();
      showOperationStatus("success", "Membership plan created successfully!");
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to create membership plan");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleEditPlan = async () => {
    if (!editingPlan) return;
    try {
      setOperationLoading(true);
      const validation = membershipPlanService.validateMembershipPlanData(editingPlan);
      if (!validation.isValid) {
        showOperationStatus("error", validation.errors.join(", "));
        return;
      }
      await membershipPlanService.updateMembershipPlan(editingPlan.id, editingPlan);
      setEditingPlan(null);
      loadMembershipPlans();
      showOperationStatus("success", "Membership plan updated successfully!");
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to update membership plan");
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDeletePlan = async (plan: MembershipPlan) => {
    try {
      setOperationLoading(true);
      setDeleteConfirm(null);
      await membershipPlanService.deleteMembershipPlan(plan.id);
      loadMembershipPlans();
      showOperationStatus("success", `${plan.planName} deleted successfully!`);
    } catch (err: any) {
      showOperationStatus("error", err.message || "Failed to delete membership plan");
    } finally {
      setOperationLoading(false);
    }
  };

  const formatDate = (dateString?: string) =>
    dateString
      ? new Date(dateString).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const isExpired = (expire: string) => new Date(expire) < new Date();
  const isActive = (start: string, expire: string) => {
    const now = new Date();
    return new Date(start) <= now && new Date(expire) >= now;
  };

  const totalPages = Math.ceil(membershipPlans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPlans = membershipPlans.slice(startIndex, startIndex + itemsPerPage);

  const totalPlans = allMembershipPlans.length;
  const activePlans = allMembershipPlans.filter(p => isActive(p.startTime, p.expireTime)).length;
  const expiredPlans = allMembershipPlans.filter(p => isExpired(p.expireTime)).length;
  const totalRevenue = allMembershipPlans.reduce((s, p) => s + p.amountPaid, 0);

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
                  setSortBy("planName");
                  setSortOrder(sortBy === "planName" && sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Plan Name</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === "planName" ? "text-primary-600" : "text-gray-400"}`} />
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden sm:table-cell">
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-3 h-3" />
                  <span>Amount</span>
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden md:table-cell">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Dates</span>
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Status</th>
              <th className="text-right py-2 px-2 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentPlans.map((plan, i) => (
              <tr key={plan.id} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + i + 1}</td>
                <td className="py-2 px-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-primary-700" />
                    </div>
                    <span className="font-medium text-gray-900 text-xs">{plan.planName || "Unnamed"}</span>
                  </div>
                </td>
                <td className="py-2 px-2 text-gray-700 font-medium hidden sm:table-cell">
                  {formatCurrency(plan.amountPaid)}
                </td>
                <td className="py-2 px-2 text-gray-700 hidden md:flex items-center space-x-2">
                  <span>{formatDate(plan.startTime)}</span>
                  <span className="text-gray-400">→</span>
                  <span>{formatDate(plan.expireTime)}</span>
                </td>
                <td className="py-2 px-2 hidden lg:table-cell">
                  {isExpired(plan.expireTime) ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                      Expired
                    </span>
                  ) : isActive(plan.startTime, plan.expireTime) ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  )}
                </td>
                <td className="py-2 px-2 text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <button onClick={() => setViewingPlan(plan)} className="text-gray-400 hover:text-primary-600 p-1">
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setEditingPlan(plan)}
                      disabled={operationLoading}
                      className="text-gray-400 hover:text-primary-600 p-1 disabled:opacity-50"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(plan)}
                      disabled={operationLoading}
                      className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50"
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
      {currentPlans.map(plan => (
        <div key={plan.id} className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-primary-700" />
              </div>
              <div className="font-medium text-gray-900 text-xs truncate max-w-[120px]">
                {plan.planName || "Unnamed Plan"}
              </div>
            </div>
            {isExpired(plan.expireTime) ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                Expired
              </span>
            ) : isActive(plan.startTime, plan.expireTime) ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending
              </span>
            )}
          </div>
          <div className="space-y-1 mb-3">
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <DollarSign className="w-3 h-3" />
              <span className="font-medium">{formatCurrency(plan.amountPaid)}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(plan.startTime)} - {formatDate(plan.expireTime)}</span>
            </div>
            {plan.shortDescription && (
              <div className="text-xs text-gray-500 truncate">{plan.shortDescription}</div>
            )}
          </div>
          <div className="flex items-center justify-end space-x-1">
            <button onClick={() => setViewingPlan(plan)} className="text-gray-400 hover:text-primary-600 p-1">
              <Eye className="w-3 h-3" />
            </button>
            <button
              onClick={() => setEditingPlan(plan)}
              disabled={operationLoading}
              className="text-gray-400 hover:text-primary-600 p-1 disabled:opacity-50"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={() => setDeleteConfirm(plan)}
              disabled={operationLoading}
              className="text-gray-400 hover:text-red-600 p-1 disabled:opacity-50"
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
      {currentPlans.map(plan => (
        <div key={plan.id} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">
                  {plan.planName || "Unnamed Plan"}
                </div>
                <div className="text-xs text-gray-500">
                  {formatCurrency(plan.amountPaid)} • {formatDate(plan.startTime)} - {formatDate(plan.expireTime)}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              {isExpired(plan.expireTime) ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  Expired
                </span>
              ) : isActive(plan.startTime, plan.expireTime) ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              )}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setViewingPlan(plan)}
                  className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setEditingPlan(plan)}
                  disabled={operationLoading}
                  className="text-gray-400 hover:text-primary-600 p-1.5 rounded-full hover:bg-primary-50 transition-colors disabled:opacity-50"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(plan)}
                  disabled={operationLoading}
                  className="text-gray-400 hover:text-red-600 p-1.5 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPagination = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="flex items-center justify-between bg-white px-3 py-2 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, membershipPlans.length)} of {membershipPlans.length}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          {pages.map(p => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className={`px-2 py-1 text-xs rounded ${
                currentPage === p
                  ? "bg-primary-500 text-white"
                  : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
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
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Membership Plan Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage company membership plans</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadMembershipPlans}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                disabled={operationLoading}
                className="flex items-center space-x-1 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
                <span>Add Plan</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary-100 rounded-full">
                <CreditCard className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Plans</p>
                <p className="text-lg font-semibold text-gray-900">{totalPlans}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Active Plans</p>
                <p className="text-lg font-semibold text-gray-900">{activePlans}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Expired Plans</p>
                <p className="text-lg font-semibold text-gray-900">{expiredPlans}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded shadow p-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Revenue</p>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative">
              <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search plans..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={e => {
                  const [field, order] = e.target.value.split("-") as [keyof MembershipPlan, "asc" | "desc"];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="planName-asc">Plan Name (A-Z)</option>
                <option value="planName-desc">Plan Name (Z-A)</option>
                <option value="amountPaid-asc">Amount (Low-High)</option>
                <option value="amountPaid-desc">Amount (High-Low)</option>
                <option value="startTime-asc">Start (Oldest)</option>
                <option value="startTime-desc">Start (Newest)</option>
                <option value="expireTime-asc">Expire (Soonest)</option>
                <option value="expireTime-desc">Expire (Latest)</option>
              </select>
              <div className="flex bg-gray-100 rounded p-0.5">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded ${viewMode === "table" ? "bg-white shadow-sm" : ""}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded ${viewMode === "grid" ? "bg-white shadow-sm" : ""}`}
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-6 h-6 text-primary-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        ) : membershipPlans.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-12 text-center">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No membership plans found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-primary-600 hover:text-primary-700 font-medium"
            >
              Create your first plan
            </button>
          </div>
        ) : (
          <>
            {viewMode === "table" && renderTableView()}
            {viewMode === "grid" && renderGridView()}
            {viewMode === "list" && renderListView()}
            {totalPages > 1 && renderPagination()}
          </>
        )}
      </div>

      {(showAddModal || editingPlan) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">{editingPlan ? "Edit" : "Add New"} Membership Plan</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingPlan(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {!propCompanyId && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
                  <select
                    value={editingPlan ? editingPlan.companyId : newPlan.companyId}
                    onChange={e => {
                      const val = e.target.value;
                      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                      editingPlan
                        ? setEditingPlan({ ...editingPlan, companyId: val })
                        : setNewPlan({ ...newPlan, companyId: val });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">— Select Company —</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.adminName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Plan Name</label>
                  <input
                    type="text"
                    value={editingPlan ? editingPlan.planName : newPlan.planName}
                    onChange={e =>
                      editingPlan
                        ? setEditingPlan({ ...editingPlan, planName: e.target.value })
                        : setNewPlan({ ...newPlan, planName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Premium Annual"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Amount Paid</label>
                  <input
                    type="number"
                    value={editingPlan ? editingPlan.amountPaid : newPlan.amountPaid}
                    onChange={e =>
                      editingPlan
                        ? setEditingPlan({ ...editingPlan, amountPaid: Number(e.target.value) })
                        : setNewPlan({ ...newPlan, amountPaid: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={editingPlan ? editingPlan.startTime.split("T")[0] : newPlan.startTime}
                    onChange={e =>
                      editingPlan
                        ? setEditingPlan({ ...editingPlan, startTime: e.target.value })
                        : setNewPlan({ ...newPlan, startTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Expire Date</label>
                  <input
                    type="date"
                    value={editingPlan ? editingPlan.expireTime.split("T")[0] : newPlan.expireTime}
                    onChange={e =>
                      editingPlan
                        ? setEditingPlan({ ...editingPlan, expireTime: e.target.value })
                        : setNewPlan({ ...newPlan, expireTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Short Description (Optional)</label>
                <textarea
                  rows={3}
                  value={editingPlan ? editingPlan.shortDescription || "" : newPlan.shortDescription || ""}
                  onChange={e =>
                    editingPlan
                      ? setEditingPlan({ ...editingPlan, shortDescription: e.target.value })
                      : setNewPlan({ ...newPlan, shortDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Brief description..."
                />
              </div>
            </div>
            <div className="p-5 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingPlan(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingPlan ? handleEditPlan : handleAddPlan}
                disabled={operationLoading}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {operationLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>{editingPlan ? "Update" : "Create"} Plan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Plan Details</h2>
              <button onClick={() => setViewingPlan(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{viewingPlan.planName}</p>
                  <p className="text-sm text-gray-500">ID: {viewingPlan.id}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Amount Paid</p>
                  <p className="font-medium">{formatCurrency(viewingPlan.amountPaid)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-medium">
                    {isExpired(viewingPlan.expireTime)
                      ? "Expired"
                      : isActive(viewingPlan.startTime, viewingPlan.expireTime)
                      ? "Active"
                      : "Pending"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="font-medium">{formatDate(viewingPlan.startTime)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expire Date</p>
                  <p className="font-medium">{formatDate(viewingPlan.expireTime)}</p>
                </div>
              </div>
              {viewingPlan.shortDescription && (
                <div>
                  <p className="text-xs text-gray-500">Description</p>
                  <p className="text-sm">{viewingPlan.shortDescription}</p>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setEditingPlan(viewingPlan);
                  setViewingPlan(null);
                }}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md font-medium transition-colors"
              >
                Edit Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Delete Plan?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-medium">"{deleteConfirm.planName}"</span>? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePlan(deleteConfirm)}
                disabled={operationLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {operationLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {operationStatus && (
        <div
          className={`fixed bottom-4 right-4 z-50 flex items-center space-x-3 px-5 py-3 rounded-lg shadow-lg text-white ${
            operationStatus.type === "success"
              ? "bg-green-600"
              : operationStatus.type === "error"
              ? "bg-red-600"
              : "bg-blue-600"
          }`}
        >
          {operationStatus.type === "success" && <CheckCircle className="w-5 h-5" />}
          {operationStatus.type === "error" && <XCircle className="w-5 h-5" />}
          {operationStatus.type === "info" && <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{operationStatus.message}</span>
        </div>
      )}
    </div>
  );
};

export default MembershipPlanDashboard;
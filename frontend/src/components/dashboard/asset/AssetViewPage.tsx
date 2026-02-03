import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Package,
  MapPin,
  DollarSign,
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
  Trash2,
} from "lucide-react";
import DOMPurify from "dompurify";
import Quill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import assetService, { type Asset } from "../../../services/assetService";
import { API_URL } from "../../../api/api";

type AssetStatus = "ACTIVE" | "MAINTENANCE" | "RETIRED" | "DISPOSED";

interface OperationStatus {
  type: "success" | "error" | "info";
  message: string;
}

const AssetViewPage: React.FC<{role:string}> = ({role}) => {
  const { id:assetId } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullDescription, setShowFullDescription] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sidebarCurrentPage, setSidebarCurrentPage] = useState<number>(1);
  const [sidebarItemsPerPage] = useState<number>(6);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [operationLoading, setOperationLoading] = useState<boolean>(false);
  const [actionConfirm, setActionConfirm] = useState<{
    asset: Asset;
    action: "retire" | "dispose";
  } | null>(null);

  const url  = role == 'admin' ? '/admin/dashboard/asset-management/' : '/employee/dashboard/asset-management/'

  // Fetch assets
  useEffect(() => {
    const loadAssets = async () => {
      try {
        setLoading(true);
        setError(null);

        const assetsData = await assetService.getAllAssets();
        if (assetsData && assetsData.length > 0) {
          // Sort by created_at descending (most recent first)
          const sortedAssets = assetsData.sort(
            (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          );
          setAssets(sortedAssets);
        } else {
          setAssets([]);
          setError("No assets found");
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load assets";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadAssets();
  }, []);

  // Reset page to 1 when search term changes
  useEffect(() => {
    setSidebarCurrentPage(1);
  }, [searchTerm]);



  const showOperationStatus = (type: OperationStatus["type"], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const handleAssetAction = async (asset: Asset, action: "retire" | "dispose") => {
    try {
      setOperationLoading(true);
      setActionConfirm(null);

      const newStatus: AssetStatus = action === "retire" ? "RETIRED" : "DISPOSED";
      await assetService.updateAssetStatus(asset.id, { status: newStatus });

      setAssets((prev) =>
        prev.map((a) => (a.id === asset.id ? { ...a, status: newStatus } : a))
      );
      if (selectedAsset?.id === asset.id) {
        setSelectedAsset((prev) => (prev ? { ...prev, status: newStatus } : prev));
      }

      showOperationStatus(
        "success",
        `Asset ${asset.name} has been ${action === "retire" ? "retired" : "disposed"} successfully!`
      );
    } catch (err: any) {
      showOperationStatus("error", err.message || `Failed to ${action} asset`);
    } finally {
      setOperationLoading(false);
    }
  };

  const getStatusColor = (status: AssetStatus) => {
    const colors: Record<AssetStatus, string> = {
      ACTIVE: "bg-green-100 text-green-800",
      MAINTENANCE: "bg-yellow-100 text-yellow-800",
      RETIRED: "bg-gray-100 text-gray-800",
      DISPOSED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowFullDescription(false);
    navigate(`${url}${asset.id}`);
    const indexInFiltered = filteredAssets.findIndex((a) => a.id === asset.id);
    if (indexInFiltered !== -1) {
      const targetPage = Math.floor(indexInFiltered / sidebarItemsPerPage) + 1;
      setSidebarCurrentPage(targetPage);
    }
  };

  // Truncate text to a specified length
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

  // Filtered assets for search
  const filteredAssets = useMemo(() => {
    if (!searchTerm.trim()) return assets;

    return assets.filter((asset) =>
      [
        asset.name?.toLowerCase(),
        asset.category?.toLowerCase(),
        asset.location?.toLowerCase(),
      ].some((field) => field && field.includes(searchTerm.toLowerCase()))
    );
  }, [assets, searchTerm]);

    // Select asset based on URL parameter
  useEffect(() => {
    if (assets.length > 0) {
      if (assetId) {
        const foundAsset = assets.find((asset) => asset.id === assetId);
        if (foundAsset) {
          setSelectedAsset(foundAsset);
          setShowFullDescription(false);
          // Calculate the page for the selected asset
          const indexInFiltered = filteredAssets.findIndex((asset) => asset.id === assetId);
          if (indexInFiltered !== -1) {
            const targetPage = Math.floor(indexInFiltered / sidebarItemsPerPage) + 1;
            setSidebarCurrentPage(targetPage);
          }
        } else {
          setError("Asset not found");
        }
      } else {
        // Select the first asset if no assetId is provided
        setSelectedAsset(assets[0]);
        setShowFullDescription(false);
        navigate(`${url}${assets[0].id}`);
        setSidebarCurrentPage(1);
      }
    } else if (!loading && assets.length === 0) {
      setError("No assets found");
    }
  }, [assets, assetId, navigate, filteredAssets, sidebarItemsPerPage]);

  // Sidebar pagination calculations
  const sidebarTotalPages = Math.ceil(filteredAssets.length / sidebarItemsPerPage);
  const sidebarStartIndex = (sidebarCurrentPage - 1) * sidebarItemsPerPage;
  const sidebarEndIndex = sidebarStartIndex + sidebarItemsPerPage;
  const currentSidebarAssets = filteredAssets.slice(sidebarStartIndex, sidebarEndIndex);

  // Handle sidebar page change
  const handleSidebarPageChange = (page: number) => {
    setSidebarCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-700 font-medium">Loading assets...</span>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Assets</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(url)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Back to Assets
          </button>
        </div>
      </div>
    );
  }

  if (!selectedAsset) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Assets Found</h2>
          <p className="text-gray-600 mb-4">There are no assets available.</p>
          <button
            onClick={() => navigate(url)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Back to Assets
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
            Back to Assets
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 mt-6">
        {/* Assets List Sidebar */}
        <div className="col-span-3">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <h2 className="text-lg font-semibold text-gray-900">Assets</h2>
                <div className="relative flex-1 sm:flex-none">
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{filteredAssets.length} total assets</p>
            </div>
            <div className="divide-y max-h-[calc(100vh-300px)] overflow-y-auto">
              {currentSidebarAssets.map((asset) => (
                <div
                  key={asset.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedAsset.id === asset.id ? "bg-primary-50 border-r-2 border-primary-500" : ""
                  }`}
                  onClick={() => handleAssetSelect(asset)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{asset.name}</h3>
                      <p className="text-xs text-gray-600 truncate mt-1">{asset.category}</p>
                      <p className="text-xs text-gray-500 mt-1">{asset.location || "No location"}</p>
                    </div>
                    <div className="flex flex-col items-end ml-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                        {asset.status}
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

        {/* Main Asset Detail View */}
        <div className="col-span-9 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {selectedAsset.assetImg ? (
                  <img
                    src={selectedAsset.assetImg.includes("http") ? selectedAsset.assetImg : `${API_URL}${selectedAsset.assetImg}`}
                    alt={selectedAsset.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{selectedAsset.name}</h1>
                  <p className="text-gray-600">{selectedAsset.category}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedAsset.status)}`}>
                      {selectedAsset.status}
                    </span>
                    <span className="text-sm text-gray-500">Added {formatDate(selectedAsset.created_at)}</span>
                  </div>
                </div>
              </div>
              {selectedAsset.status !== "RETIRED" && selectedAsset.status !== "DISPOSED" && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActionConfirm({ asset: selectedAsset, action: "retire" })}
                    disabled={operationLoading}
                    className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Retire</span>
                  </button>
                  <button
                    onClick={() => setActionConfirm({ asset: selectedAsset, action: "dispose" })}
                    disabled={operationLoading}
                    className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Dispose</span>
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
                  <Package className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">Category: {selectedAsset.category}</span>
                </div>
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">Quantity: {selectedAsset.quantity}</span>
                </div>
                {selectedAsset.location && (
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">{selectedAsset.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Financial & Timeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Financial & Timeline</h3>
              <div className="space-y-3">
                {selectedAsset.purchaseCost !== undefined && (
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">
                      Purchase Cost: ${selectedAsset.purchaseCost.toFixed(2)}
                    </span>
                  </div>
                )}
                {selectedAsset.purchaseDate && (
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900">Purchased {formatDate(selectedAsset.purchaseDate)}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">Added {formatDate(selectedAsset.created_at)}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-900">Updated {formatDate(selectedAsset.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {selectedAsset.description && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Description</h3>
              <div className="bg-white p-4 rounded border text-sm text-gray-700 leading-relaxed">
                <Quill
                  value={showFullDescription ? selectedAsset.description : truncateText(selectedAsset.description, 100)}
                  readOnly={true}
                  theme="snow"
                  modules={{ toolbar: false }}
                  className="border-none p-0 bg-transparent"
                />
                {stripHtml(selectedAsset.description).length > 100 && (
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
                      actionConfirm.action === "retire" ? "bg-gray-100" : "bg-red-100"
                    }`}
                  >
                    <Trash2 className={`w-6 h-6 ${actionConfirm.action === "retire" ? "text-gray-600" : "text-red-600"}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {actionConfirm.action === "retire" ? "Retire" : "Dispose"} Asset
                    </h3>
                    <p className="text-sm text-gray-500">This action will update the asset's status</p>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-gray-700">
                    Are you sure you want to {actionConfirm.action}{" "}
                    <span className="font-semibold">{actionConfirm.asset.name}</span>? This will
                    change the asset's status to{" "}
                    <span className="font-semibold">
                      {actionConfirm.action === "retire" ? "RETIRED" : "DISPOSED"}
                    </span>
                    .
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
                    onClick={() => handleAssetAction(actionConfirm.asset, actionConfirm.action)}
                    disabled={operationLoading}
                    className={`w-full sm:w-auto px-4 py-2 ${
                      actionConfirm.action === "retire"
                        ? "bg-gray-500 hover:bg-gray-600 text-white"
                        : "bg-red-500 hover:bg-red-600 text-white"
                    } rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {actionConfirm.action === "retire" ? "Retire" : "Dispose"}
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

export default AssetViewPage;
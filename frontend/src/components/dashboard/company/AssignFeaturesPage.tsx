import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Check, Loader2, AlertCircle, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import systemFeaturesService from '../../../services/system-featuresService';
import companyService from '../../../services/companyService';

const ITEMS_PER_PAGE = 7;

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

export default function AssignFeaturesPage() {
  const { companyId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [allFeatures, setAllFeatures] = useState([]);
  const [assignedFeatures, setAssignedFeatures] = useState([]);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState([]);
  const [company, setCompany] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    fetchData();
  }, [companyId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [featuresData, companyData, assignedData] = await Promise.all([
        systemFeaturesService.getAllSystemFeatures(),
        companyService.getCompanyById(companyId),
        companyService.getCompanyFeatures(companyId),
      ]);

      setAllFeatures(featuresData);
      setCompany(companyData);
      setAssignedFeatures(assignedData);
      setSelectedFeatureIds(assignedData.map(f => f.id));
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFeature = (featureId) => {
    setSelectedFeatureIds(prev => {
      if (prev.includes(featureId)) {
        return prev.filter(id => id !== featureId);
      }
      return [...prev, featureId];
    });
  };

  const handleToggleGroup = (groupKey) => {
    const group = FEATURE_GROUPS[groupKey];
    const groupFeatureIds = allFeatures
      .filter(f => group.children.includes(f.name))
      .map(f => f.id);
    
    const allSelected = groupFeatureIds.every(id => selectedFeatureIds.includes(id));
    
    setSelectedFeatureIds(prev => {
      if (allSelected) {
        return prev.filter(id => !groupFeatureIds.includes(id));
      }
      return [...new Set([...prev, ...groupFeatureIds])];
    });
  };

  const toggleGroupExpansion = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const isGroupFullySelected = (groupKey) => {
    const group = FEATURE_GROUPS[groupKey];
    const groupFeatureIds = allFeatures
      .filter(f => group.children.includes(f.name))
      .map(f => f.id);
    
    return groupFeatureIds.length > 0 && groupFeatureIds.every(id => selectedFeatureIds.includes(id));
  };

  const isGroupPartiallySelected = (groupKey) => {
    const group = FEATURE_GROUPS[groupKey];
    const groupFeatureIds = allFeatures
      .filter(f => group.children.includes(f.name))
      .map(f => f.id);
    
    const selectedCount = groupFeatureIds.filter(id => selectedFeatureIds.includes(id)).length;
    return selectedCount > 0 && selectedCount < groupFeatureIds.length;
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const originalIds = assignedFeatures.map(f => f.id);
      const toAdd = selectedFeatureIds.filter(id => !originalIds.includes(id));
      const toRemove = originalIds.filter(id => !selectedFeatureIds.includes(id));

      if (toAdd.length > 0) {
        await companyService.assignFeaturesToCompany(companyId, toAdd);
      }

      if (toRemove.length > 0) {
        await companyService.removeFeaturesFromCompany(companyId, toRemove);
      }

      setSuccess('Features updated successfully!');
      await fetchData();
    } catch (err) {
      setError(err.message || 'Failed to update features');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ page: newPage.toString() });
  };

  const hasChanges = () => {
    const originalIds = assignedFeatures.map(f => f.id).sort();
    const currentIds = [...selectedFeatureIds].sort();
    return JSON.stringify(originalIds) !== JSON.stringify(currentIds);
  };

  // Separate features into grouped and ungrouped
  const groupedFeatures = allFeatures.filter(f => GROUPED_FEATURE_NAMES.includes(f.name));
  const ungroupedFeatures = allFeatures.filter(f => !GROUPED_FEATURE_NAMES.includes(f.name));

  // Pagination for ungrouped features only
  const totalPages = Math.ceil(ungroupedFeatures.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedFeatures = ungroupedFeatures.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-600" />
          <p className="mt-2 text-gray-600">Loading features...</p>
        </div>
      </div>
    );
  }

  if (error && !company) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <p className="mt-4 text-center text-gray-800">{error}</p>
        </div>
      </div>
    );
  }

  if (allFeatures.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">No Features Available</h2>
            <p className="mt-2 text-gray-600">
              You must add system features first before you can assign them to companies.
            </p>
            <button
              onClick={() => window.location.href = '/super-admin/dashboard/system-feature'}
              className="mt-6 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Go to System Features
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Assign Features</h1>
          {company && (
            <p className="mt-2 text-gray-600">
              Company: <span className="font-semibold">{company.adminName}</span>
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {selectedFeatureIds.length} of {allFeatures.length} features selected
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start">
            <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Features List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="divide-y divide-gray-200">
            {/* Render Feature Groups */}
            {Object.entries(FEATURE_GROUPS).map(([groupKey, group]) => {
              const isExpanded = expandedGroups[groupKey];
              const isFullySelected = isGroupFullySelected(groupKey);
              const isPartiallySelected = isGroupPartiallySelected(groupKey);
              const groupChildren = allFeatures.filter(f => group.children.includes(f.name));

              return (
                <div key={groupKey} className="border-b border-gray-200">
                  {/* Group Header */}
                  <div
                    className="p-4 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                    onClick={() => handleToggleGroup(groupKey)}
                     onDoubleClick={(e) => {
                          // e.stopPropagation();
                          toggleGroupExpansion(groupKey);
                        }}
                  >
                    <div className="flex items-start">
                      <div className="flex items-center h-6">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isFullySelected
                              ? 'bg-primary-600 border-primary-600'
                              : isPartiallySelected
                              ? 'bg-primary-300 border-primary-300'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isFullySelected && <Check className="w-3.5 h-3.5 text-white" />}
                          {isPartiallySelected && !isFullySelected && (
                            <div className="w-2 h-2 bg-white rounded-sm" />
                          )}
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center">
                          {group.name}
                          <span className="ml-2 text-xs text-gray-500">
                            ({groupChildren.length} features)
                          </span>
                        </h3>
                        {group.description && (
                          <p className="mt-1 text-sm text-gray-600">
                            {group.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGroupExpansion(groupKey);
                        }}
                        className="ml-2 p-1 hover:bg-blue-200 rounded transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Group Children */}
                  {isExpanded && (
                    <div className="bg-gray-50">
                      {groupChildren.map((feature) => {
                        const isSelected = selectedFeatureIds.includes(feature.id);
                        
                        return (
                          <div
                            key={feature.id}
                            className="p-4 pl-12 hover:bg-gray-100 transition-colors cursor-pointer border-t border-gray-200"
                            onClick={() => handleToggleFeature(feature.id)}
                          >
                            <div className="flex items-start">
                              <div className="flex items-center h-6">
                                <div
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                    isSelected
                                      ? 'bg-primary-600 border-primary-600'
                                      : 'border-gray-300 bg-white'
                                  }`}
                                >
                                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                              </div>
                              <div className="ml-3 flex-1">
                                <h3 className="text-sm font-semibold text-gray-900">
                                  {feature.name}
                                </h3>
                                {feature.description && (
                                  <p className="mt-1 text-sm text-gray-600">
                                    {feature.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Render Ungrouped Features */}
            {paginatedFeatures.map((feature) => {
              const isSelected = selectedFeatureIds.includes(feature.id);
              
              return (
                <div
                  key={feature.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleToggleFeature(feature.id)}
                >
                  <div className="flex items-start">
                    <div className="flex items-center h-6">
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-primary-600 border-primary-600'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {feature.name}
                      </h3>
                      {feature.description && (
                        <p className="mt-1 text-sm text-gray-600">
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, ungroupedFeatures.length)} of{' '}
                  {ungroupedFeatures.length} ungrouped features
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => setSelectedFeatureIds(assignedFeatures.map(f => f.id))}
            disabled={submitting || !hasChanges()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !hasChanges()}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
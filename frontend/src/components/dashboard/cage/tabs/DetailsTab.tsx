/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import { 
  Fish, 
  Droplets, 
  Activity, 
  Settings, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Wrench, 
  Clock, 
  Wheat,
  TrendingUp,
  Info,
  ArrowRight
} from 'lucide-react';
import { type Cage } from '../../../../services/cageService';
import type { FeedCage } from '../../../../services/feedService';

interface DetailsTabProps {
  cage: Cage;
  feeds: FeedCage[];
  role: string;
  handleTabChange: (tab: string) => void;
}

const DetailsTab: React.FC<DetailsTabProps> = ({ cage, feeds, role, handleTabChange }) => {
  // Memoized calculations for better performance
  const calculations = useMemo(() => {
    const now = new Date();
    
    // Calculate days since stocking
    const daysSinceStocking = cage.stockingDate
      ? Math.floor((now - new Date(cage.stockingDate)) / (1000 * 60 * 60 * 24))
      : null;

    // Calculate total feed given in last 7 days
    const recentFeeds = feeds.filter(feed => {
      if (!feed.createdAt) return false;
      const feedDate = new Date(feed.createdAt);
      const daysDiff = (now.getTime() - feedDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });

    const totalFeedLast7Days = recentFeeds.reduce((sum, feed) => sum + (feed.quantityGiven || 0), 0);

    // Calculate capacity utilization (assuming current stock data exists)
    const utilizationPercentage = cage.currentStock 
      ? Math.round((cage.currentStock / cage.cageCapacity) * 100)
      : null;

    return {
      daysSinceStocking,
      totalFeedLast7Days,
      utilizationPercentage,
      recentFeeds
    };
  }, [cage, feeds]);

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Africa/Harare',
    });
  };

  const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Harare',
    });
  };

  const getStatusConfig = (status: string | undefined) => {
    switch (status) {
      case 'ACTIVE':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-800',
          badgeColor: 'bg-green-100 text-green-800'
        };
      case 'INACTIVE':
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          badgeColor: 'bg-red-100 text-red-800'
        };
      case 'UNDER_MAINTENANCE':
        return {
          icon: <Wrench className="w-5 h-5 text-yellow-500" />,
          bgColor: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-800',
          badgeColor: 'bg-yellow-100 text-yellow-800'
        };
      default:
        return {
          icon: <Clock className="w-5 h-5 text-gray-500" />,
          bgColor: 'bg-gray-50 border-gray-200',
          textColor: 'text-gray-800',
          badgeColor: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const getNetTypeConfig = (type: string | undefined) => {
    switch (type) {
      case 'FINGERLING':
        return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🐟' };
      case 'JUVENILE':
        return { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '🐠' };
      case 'ADULT':
        return { color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🎣' };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '🐟' };
    }
  };

  const getHealthScore = () => {
    let score = 100;
    
    // Deduct points for inactive status
    if (cage.cageStatus !== 'ACTIVE') score -= 30;
    
    // Deduct points for old stocking (over 180 days)
    if (calculations.daysSinceStocking && calculations.daysSinceStocking > 180) {
      score -= 20;
    }

    // Deduct points if no recent feeding
    if (calculations.totalFeedLast7Days === 0 && cage.cageStatus === 'ACTIVE') {
      score -= 20;
    }
    
    return Math.max(0, Math.min(100, score));
  };

  const healthScore = getHealthScore();
  const statusConfig = getStatusConfig(cage.cageStatus);
  const netTypeConfig = getNetTypeConfig(cage.cageNetType);

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={`p-4 rounded-lg border ${statusConfig.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {statusConfig.icon}
            <div>
              <h4 className={`font-medium ${statusConfig.textColor}`}>
                Cage Status: {cage.cageStatus?.replace('_', ' ')}
              </h4>
              <p className="text-sm text-gray-600">
                {cage.cageStatus === 'ACTIVE' 
                  ? 'Cage is operational and monitoring systems are active'
                  : cage.cageStatus === 'UNDER_MAINTENANCE'
                  ? 'Cage is undergoing maintenance - limited operations'
                  : 'Cage is currently inactive'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{healthScore}%</div>
            <div className="text-xs text-gray-500">Health Score</div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Fish className="w-6 h-6 text-blue-600" />
            </div>
            {calculations.utilizationPercentage && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                calculations.utilizationPercentage > 90 ? 'bg-red-100 text-red-800' :
                calculations.utilizationPercentage > 70 ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {calculations.utilizationPercentage}% full
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Capacity</p>
            <p className="text-2xl font-bold text-gray-900">{cage.cageCapacity?.toLocaleString()}</p>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              fish capacity
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-cyan-50 rounded-lg">
              <Droplets className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Specifications</p>
            <p className="text-2xl font-bold text-gray-900">{cage.cageDepth}m</p>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <Activity className="w-3 h-3 mr-1" />
              {cage.cageVolume}m³ volume
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Wheat className="w-6 h-6 text-green-600" />
            </div>
            {calculations.totalFeedLast7Days > 0 && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                Active
              </span>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Feed (7 days)</p>
            <p className="text-2xl font-bold text-gray-900">{calculations.totalFeedLast7Days.toFixed(1)} kg</p>
            <p className="text-xs text-gray-500 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              {calculations.recentFeeds.length} feed sessions
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Information Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Cage Specifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-gray-600" />
              Cage Specifications
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Cage Code</span>
              </div>
              <span className="text-sm text-gray-900 font-mono bg-white px-2 py-1 rounded border">
                {cage.cageCode}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{netTypeConfig.icon}</span>
                <span className="text-sm font-medium text-gray-700">Net Type</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${netTypeConfig.color}`}>
                {cage.cageNetType}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Cage Type</span>
              </div>
              <span className="text-sm text-gray-900 capitalize bg-white px-2 py-1 rounded border">
                {cage.cageType || 'Standard'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                {statusConfig.icon}
                <span className="text-sm font-medium text-gray-700">Current Status</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.badgeColor}`}>
                {cage.cageStatus?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Timeline */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-600" />
              Timeline & Metrics
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Created</span>
              </div>
              <span className="text-sm text-gray-900">{formatDate(cage.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Fish className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Stocked</span>
              </div>
              <span className="text-sm text-gray-900">{formatDateTime(cage.stockingDate)}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Days Active</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-gray-900">
                  {calculations.daysSinceStocking || 'N/A'} days
                </span>
                {calculations.daysSinceStocking && (
                  <div className="text-xs text-gray-500">
                    ~{Math.floor(calculations.daysSinceStocking / 7)} weeks
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Feeds */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Wheat className="w-5 h-5 mr-2 text-green-600" />
            Recent Feeds
            {calculations.totalFeedLast7Days > 0 && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                {calculations.totalFeedLast7Days.toFixed(1)}kg this week
              </span>
            )}
          </h3>
          <button
            onClick={() => handleTabChange('feed')}
            className="text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center group"
          >
            View All
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="p-6">
          {feeds?.slice(0, 3).map((feed, index) => (
            <div key={feed.id} className={`flex items-center justify-between py-4 ${index < 2 ? 'border-b border-gray-100' : ''}`}>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Wheat className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {feed.feed?.name || 'Unknown Feed'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {feed.notes || 'No notes provided'}
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-gray-900">{feed.quantityGiven} kg</p>
                <p className="text-xs text-gray-500">{formatDate(feed.createdAt)}</p>
                <p className="text-xs text-gray-500">
                  {feed.employee
                    ? `${feed.employee.first_name} ${feed.employee.last_name}`
                    : 'Unknown'}
                </p>
              </div>
            </div>
          ))}
          {feeds.length === 0 && (
            <div className="text-center py-8">
              <Wheat className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No feeds recorded for this cage.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailsTab;
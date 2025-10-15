/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Wheat,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import feedCageService, { type FeedCage } from '../../../../services/feedService';

interface FeedingSectionProps {
  cageId: string;
  feeds: FeedCage[];
  role: string;
  onFeedDeleted?: () => void;
}

const FeedingSection: React.FC<FeedingSectionProps> = ({ cageId, feeds, role, onFeedDeleted }) => {
  const navigate = useNavigate();
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [maxQuantity, setMaxQuantity] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'Africa/Harare',
    });
  };

  const formatDateTime = (dateString: string): string => {
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

  // Filter feeds based on search, quantity, and date
  const filteredFeeds = useMemo(() => {
    return feeds.filter(feed => {
      const feedName = feed.feed?.name || '';
      const matchesSearch = feedName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesMinQuantity = minQuantity === '' || feed.quantityGiven >= parseFloat(minQuantity);
      const matchesMaxQuantity = maxQuantity === '' || feed.quantityGiven <= parseFloat(maxQuantity);
      const matchesDate = selectedDate === '' || 
        new Date(feed.createdAt || '').toISOString().split('T')[0] === selectedDate;
      
      return matchesSearch && matchesMinQuantity && matchesMaxQuantity && matchesDate;
    });
  }, [feeds, searchQuery, minQuantity, maxQuantity, selectedDate]);

  // Calculate feeding statistics based on filtered feeds
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const todayFeedRecords = filteredFeeds.filter(record => {
    const recordDate = new Date(record.createdAt || '');
    recordDate.setHours(0, 0, 0, 0);
    return recordDate.getTime() === today.getTime();
  });

  const weekFeedRecords = filteredFeeds.filter(record => {
    const recordDate = new Date(record.createdAt || '');
    return recordDate >= weekAgo && recordDate <= new Date();
  });

  const totalFeedToday = todayFeedRecords.reduce((sum, record) => sum + record.quantityGiven, 0);
  const totalFeedWeek = weekFeedRecords.reduce((sum, record) => sum + record.quantityGiven, 0);

  // Pagination logic
  const totalPages = Math.ceil(filteredFeeds.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const paginatedFeeds = filteredFeeds.slice(startIndex, startIndex + recordsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateFeed = () => {
    navigate(`/${role}/dashboard/cage-management/f/create?cageId=${cageId}`);
  };

  const handleEditFeed = (feed: FeedCage) => {
    navigate(`/${role}/dashboard/cage-management/f/update/${feed.id}`);
  };

  const handleDeleteFeed = async (feed: FeedCage) => {
    const feedName = feed.feed?.name || 'this feed';
    const result = await Swal.fire({
      title: 'Delete Feed Record',
      text: `Are you sure you want to delete the feed record for "${feedName}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      try {
        await feedCageService.deleteFeedCage(feed.id);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Feed record deleted successfully`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
        if (onFeedDeleted) {
          onFeedDeleted();
        }
      } catch (error: any) {
        console.error('Error deleting feed:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to delete feed record',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
      }
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Feeding Management</h2>
          <p className="text-sm text-gray-600">Track and manage feeding for this cage</p>
        </div>
        <button
          onClick={handleCreateFeed}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Record Feeding</span>
        </button>
      </div>

      {/* Feeding Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Feed</p>
              <p className="text-2xl font-bold text-gray-900">{totalFeedToday.toFixed(1)} kg</p>
              <p className="text-xs text-gray-500">{todayFeedRecords.length} feeding{todayFeedRecords.length !== 1 ? 's' : ''}</p>
            </div>
            <Wheat className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week's Feed</p>
              <p className="text-2xl font-bold text-gray-900">{totalFeedWeek.toFixed(1)} kg</p>
              <p className="text-xs text-gray-500">{weekFeedRecords.length} feeding{weekFeedRecords.length !== 1 ? 's' : ''}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Feeds</p>
              <p className="text-2xl font-bold text-gray-900">{filteredFeeds.length}</p>
              <p className="text-xs text-gray-500">all time</p>
            </div>
            <BarChart3 className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search by Feed Name</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter feed name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Quantity (kg)</label>
            <input
              type="number"
              value={minQuantity}
              onChange={(e) => setMinQuantity(e.target.value)}
              placeholder="Min quantity"
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Quantity (kg)</label>
            <input
              type="number"
              value={maxQuantity}
              onChange={(e) => setMaxQuantity(e.target.value)}
              placeholder="Max quantity"
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Recent Feeding Records */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Recent Feeding Records
          </h3>
        </div>
        {filteredFeeds.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-gray-600">
              No feeding records found. Try adjusting your filters or{' '}
              <button
                onClick={handleCreateFeed}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                record a new feeding
              </button>.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Feed Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity Given</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Administered By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedFeeds.map((feed) => (
                    <tr key={feed.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{formatDate(feed.createdAt || '')}</div>
                          <div className="text-gray-500 text-xs">{formatDateTime(feed.createdAt || '').split(', ')[1]}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {feed.feed?.name || 'Unknown Feed'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="font-semibold text-green-600">{feed.quantityGiven} kg</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {feed.employee
                          ? `${feed.employee.first_name} ${feed.employee.last_name}`
                          : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {feed.notes || 'No notes'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditFeed(feed)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                            title="Edit feed"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFeed(feed)}
                            className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                            title="Delete feed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(startIndex + recordsPerPage, filteredFeeds.length)} of {filteredFeeds.length} feeds
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FeedingSection;
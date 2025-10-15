/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { Fish, ArrowLeft, Eye, Wheat } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import cageService, { type Cage } from '../../../services/cageService';
import feedCageService, { type FeedCage } from '../../../services/feedService';
import DetailsTab from './tabs/DetailsTab';
import FeedTab from './tabs/FeedTab';

const CageViewPage: React.FC<{ role: string }> = ({ role }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [cage, setCage] = useState<Cage | null>(null);
  const [feeds, setFeeds] = useState<FeedCage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const { id: cageId } = useParams<{ id: string }>();

  // Function to fetch feeds
  const fetchFeeds = async () => {
    if (!cageId) return;
    try {
      const feedData = await feedCageService.getFeedCagesByCageId(cageId);
      setFeeds(feedData || []);
    } catch (error: any) {
      console.error('Error fetching feeds:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to load feed data',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['details', 'feed'].includes(tab)) {
      setActiveTab(tab);
    }

    const fetchData = async () => {
      if (!cageId) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Cage ID is missing',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
        navigate(`/${role}/dashboard/cage-management`);
        return;
      }

      setIsLoading(true);
      try {
        const cageData = await cageService.getCageById(cageId);
        if (!cageData) {
          throw new Error('Cage not found');
        }
        setCage(cageData);

        await fetchFeeds(); // Initial fetch of feeds
      } catch (error: any) {
        console.error('Error fetching data:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Failed to load cage or feed data',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
        });
        navigate(`/${role}/dashboard/cage-management`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [cageId, role, navigate]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const url = new URL(window.location);
    url.searchParams.set('tab', tab);
    window.history.pushState({}, '', url);
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'UNDER_MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-xs">Loading cage data...</p>
        </div>
      </div>
    );
  }

  if (!cage) {
    return null; // Handled by useEffect redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(`/${role}/dashboard/cage-management`)}
                className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <Fish className="w-8 h-8 text-primary-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{cage.cageName}</h1>
                  <p className="text-sm text-gray-500">Code: {cage.cageCode}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(cage.cageStatus)}`}>
                {cage.cageStatus.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => handleTabChange('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Cage Details</span>
              </div>
            </button>
            <button
              onClick={() => handleTabChange('feed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'feed'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Wheat className="w-4 h-4" />
                <span>Feed</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'details' && (
          <DetailsTab
            cage={cage}
            feeds={feeds}
            role={role}
            handleTabChange={handleTabChange}
          />
        )}
        {activeTab === 'feed' && (
          <FeedTab
            cageId={cageId!}
            feeds={feeds}
            role={role}
            onFeedDeleted={fetchFeeds} // Pass callback to refresh feeds
          />
        )}
      </div>
    </div>
  );
};

export default CageViewPage;
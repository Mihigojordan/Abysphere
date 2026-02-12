import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { User, Lock, Bell, Link, Palette } from 'lucide-react';
import ProfileSettings from '../../../components/dashboard/profile/admin/ProfileSettings';
import SecuritySettings from '../../../components/dashboard/profile/admin/SecuritySettings';
import NotificationsSettings from '../../../components/dashboard/profile/admin/NotificationsSettings';
import ConnectedApps from '../../../components/dashboard/profile/admin/ConnectedApps';
import ThemeSettings from '../../../components/dashboard/profile/admin/ThemeSettings';

const AdminProfilePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = ['profile', 'security', 'notifications', 'connected-apps', 'theme'] as const;
  const initialTab = validTabs.includes(searchParams.get('tab') as any)
    ? (searchParams.get('tab') as 'profile' | 'security' | 'notifications' | 'connected-apps' | 'theme')
    : 'profile';
  const [activeTab, setActiveTab] = useState<
    'profile' | 'security' | 'notifications' | 'connected-apps' | 'theme'
  >(initialTab);

  // Sync activeTab with URL params
  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  return (
    <div className="bg-theme-bg-secondary overflow-y-auto h-[90vh] transition-colors duration-200">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-theme-bg-primary border-r h-full border-theme-border transition-colors duration-200">
          <div className="p-4 flex-1">
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center px-3 py-2 text-xs font-medium rounded transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-500'
                    : 'text-theme-text-secondary hover:bg-theme-bg-tertiary'
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center px-3 py-2 text-xs font-medium rounded transition-colors ${
                  activeTab === 'security'
                    ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-500'
                    : 'text-theme-text-secondary hover:bg-theme-bg-tertiary'
                }`}
              >
                <Lock className="w-4 h-4 mr-2" />
                Security Settings
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center px-3 py-2 text-xs font-medium rounded transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-500'
                    : 'text-theme-text-secondary hover:bg-theme-bg-tertiary'
                }`}
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('connected-apps')}
                className={`w-full flex items-center px-3 py-2 text-xs font-medium rounded transition-colors ${
                  activeTab === 'connected-apps'
                    ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-500'
                    : 'text-theme-text-secondary hover:bg-theme-bg-tertiary'
                }`}
              >
                <Link className="w-4 h-4 mr-2" />
                Connected Apps
              </button>
              <button
                onClick={() => setActiveTab('theme')}
                className={`w-full flex items-center px-3 py-2 text-xs font-medium rounded transition-colors ${
                  activeTab === 'theme'
                    ? 'bg-primary-50 text-primary-600 border-r-4 border-primary-500'
                    : 'text-theme-text-secondary hover:bg-theme-bg-tertiary'
                }`}
              >
                <Palette className="w-4 h-4 mr-2" />
                Theme Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="h-full overflow-y-auto flex-1 p-4">
          <div className="mx-auto">
            <div className="bg-theme-bg-primary rounded border border-theme-border transition-colors duration-200">
              <div className="px-4 py-3 border-b border-theme-border transition-colors duration-200">
                <h1 className="text-lg font-semibold text-theme-text-primary">
                  {activeTab === 'profile'
                    ? 'Profile Settings'
                    : activeTab === 'security'
                    ? 'Security Settings'
                    : activeTab === 'notifications'
                    ? 'Notifications'
                    : activeTab === 'connected-apps'
                    ? 'Connected Apps'
                    : 'Theme Settings'}
                </h1>
              </div>
              <div className="p-4">
                {activeTab === 'profile' && <ProfileSettings />}
                {activeTab === 'security' && <SecuritySettings />}
                {activeTab === 'notifications' && <NotificationsSettings />}
                {activeTab === 'connected-apps' && <ConnectedApps />}
                {activeTab === 'theme' && <ThemeSettings />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfilePage;
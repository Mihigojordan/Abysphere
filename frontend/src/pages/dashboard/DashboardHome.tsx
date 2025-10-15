import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Calendar,
  Clock,
  TrendingUp,
  Bell,
  Settings,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Building2,
  Award,
  CheckCircle
} from 'lucide-react';

// --- Type Definitions ---
interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  status?: string;
  startDate: string;
}

interface RecentHire {
  id: number;
  name: string;
  position: string;
  department: string;
  startDate: string;
}

interface LeaveRequest {
  id: number;
  employee: string;
  type: string;
  days: number;
  status: 'pending' | 'approved' | 'rejected';
  startDate: string;
}

interface Birthday {
  id: number;
  name: string;
  date: string;
  department: string;
}

interface Stats {
  totalEmployees: number;
  activeEmployees: number;
  newHires: number;
  pendingLeaves: number;
  departments: number;
  avgSalary: number;
  attendanceRate: number;
  turnoverRate: number;
}

interface DashboardData {
  employees: Employee[];
  recentHires: RecentHire[];
  leaveRequests: LeaveRequest[];
  upcomingBirthdays: Birthday[];
  stats: Stats;
}

interface StatCard {
  label: string;
  value: string | number;
  change: string;
  icon: React.FC<any>;
  color: string;
  trend: 'up' | 'down';
}

// --- Component ---
const DashboardHome: React.FC<{role:string}> = ({role}) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    employees: [],
    recentHires: [],
    leaveRequests: [],
    upcomingBirthdays: [],
    stats: {
      totalEmployees: 0,
      activeEmployees: 0,
      newHires: 0,
      pendingLeaves: 0,
      departments: 0,
      avgSalary: 0,
      attendanceRate: 0,
      turnoverRate: 0
    }
  });

  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    setTimeout(() => {
      setDashboardData({
        employees: [
          { id: 1, name: 'John Smith', position: 'Software Engineer', department: 'Engineering', status: 'active', startDate: '2023-01-15' },
          { id: 2, name: 'Sarah Johnson', position: 'Product Manager', department: 'Product', status: 'active', startDate: '2023-03-10' },
          { id: 3, name: 'Mike Davis', position: 'HR Specialist', department: 'Human Resources', status: 'active', startDate: '2023-02-20' },
          { id: 4, name: 'Emily Chen', position: 'UX Designer', department: 'Design', status: 'active', startDate: '2023-04-05' },
          { id: 5, name: 'David Wilson', position: 'Sales Manager', department: 'Sales', status: 'active', startDate: '2023-01-30' }
        ],
        recentHires: [
          { id: 1, name: 'Alex Rodriguez', position: 'Frontend Developer', department: 'Engineering', startDate: '2025-08-15' },
          { id: 2, name: 'Lisa Park', position: 'Marketing Coordinator', department: 'Marketing', startDate: '2025-08-10' },
          { id: 3, name: 'James Brown', position: 'Data Analyst', department: 'Analytics', startDate: '2025-08-05' }
        ],
        leaveRequests: [
          { id: 1, employee: 'Sarah Johnson', type: 'Vacation', days: 5, status: 'pending', startDate: '2025-09-01' },
          { id: 2, employee: 'Mike Davis', type: 'Sick Leave', days: 2, status: 'approved', startDate: '2025-08-25' },
          { id: 3, employee: 'Emily Chen', type: 'Personal', days: 1, status: 'pending', startDate: '2025-08-30' }
        ],
        upcomingBirthdays: [
          { id: 1, name: 'John Smith', date: '2025-09-25', department: 'Engineering' },
          { id: 2, name: 'Sarah Johnson', date: '2025-09-28', department: 'Product' },
          { id: 3, name: 'Mike Davis', date: '2025-10-02', department: 'Human Resources' }
        ],
        stats: {
          totalEmployees: 152,
          activeEmployees: 148,
          newHires: 8,
          pendingLeaves: 12,
          departments: 6,
          avgSalary: 75000,
          attendanceRate: 94.2,
          turnoverRate: 5.8
        }
      });
      setLoading(false);
    }, 1000);
  }, []);

  const statsCards: StatCard[] = [
    {
      label: 'Total Employees',
      value: dashboardData.stats.totalEmployees,
      change: '+5.2%',
      icon: Users,
      color: 'bg-primary-500',
      trend: 'up'
    },
    {
      label: 'New Hires (This Month)',
      value: dashboardData.stats.newHires,
      change: '+12%',
      icon: UserPlus,
      color: 'bg-primary-500',
      trend: 'up'
    },
    {
      label: 'Attendance Rate',
      value: `${dashboardData.stats.attendanceRate}%`,
      change: '+2.1%',
      icon: CheckCircle,
      color: 'bg-primary-500',
      trend: 'up'
    },
    {
      label: 'Pending Leaves',
      value: dashboardData.stats.pendingLeaves,
      change: '-8%',
      icon: Clock,
      color: 'bg-primary-500',
      trend: 'down'
    }
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 text-primary-500 animate-spin" />
          <span className="text-base text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">HR Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Welcome back! Here's your team overview.</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                  <p className="text-xl font-semibold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ml-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center shadow-sm`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Hires */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Recent Hires</h3>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.recentHires.map((hire) => (
                  <div key={hire.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{hire.name}</p>
                        <p className="text-sm text-gray-500">{hire.position}</p>
                        <p className="text-sm text-gray-400">{hire.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Start Date</p>
                      <p className="font-medium text-gray-900">{new Date(hire.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full text-primary-600 hover:text-primary-700 font-medium text-sm py-2">
                  View All Employees →
                </button>
              </div>
            </div>
          </div>

          {/* Leave Requests */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Leave Requests</h3>
                <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">
                    {dashboardData.leaveRequests.filter(req => req.status === 'pending').length} Pending
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.leaveRequests.map((request) => (
                  <div key={request.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{request.employee}</p>
                          <p className="text-sm text-gray-500">{request.type} • {request.days} days</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-sm px-2 py-1 rounded-lg ${
                          request.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-700'
                            : request.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500 mt-1">
                          {new Date(request.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full text-primary-600 hover:text-primary-700 font-medium text-sm py-2">
                  View All Requests →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Overview */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">Department Overview</h3>
                <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Engineering', employees: 45, growth: '+8%' },
                  { name: 'Sales', employees: 32, growth: '+12%' },
                  { name: 'Marketing', employees: 18, growth: '+5%' },
                  { name: 'Human Resources', employees: 12, growth: '+2%' },
                  { name: 'Finance', employees: 15, growth: '+3%' },
                  { name: 'Operations', employees: 20, growth: '+7%' }
                ].map((dept, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{dept.name}</p>
                          <p className="text-sm text-gray-500">{dept.employees} employees</p>
                        </div>
                      </div>
                      <span className="text-green-600 text-sm font-medium">
                        {dept.growth}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Birthdays */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900">Upcoming Birthdays</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {dashboardData.upcomingBirthdays.map((birthday) => (
                  <div key={birthday.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{birthday.name}</p>
                      <p className="text-sm text-gray-500">{birthday.department}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{new Date(birthday.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="w-full text-primary-600 hover:text-primary-700 font-medium text-sm py-2">
                  View Calendar →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
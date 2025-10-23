import React, { useState, useEffect } from "react";
import {
  MapPin,
  Plane,

  TrendingUp,
  User,
  X,
  Building,

  ChevronDown,

  Beaker,

} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import useSuperAdminAuth from "../../../context/SuperAdminAuthContext";

interface SidebarProps {
  isOpen?: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

interface DropdownGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onToggle }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSuperAdminAuth();

  const toggleDropdown = (id: string) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  const basePath = `/super-admin/dashboard`;

  /** ✅ Navigation Structure (Super Admin Only) */
  const navlinks: (NavItem | DropdownGroup)[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: TrendingUp,
      path: basePath,
    },
    {
      id: "system-features",
      label: "System Features Management",
      icon: Building,
      path: `${basePath}/system-feature`,
    },
      {
      id: "Demo Request",
      label: "Demo Requests Management",
      icon: Building,
      path: `${basePath}/demo-management`,
    },
       {
                id: "company-management",
                label: "Company Management",
                icon:Beaker,
                path: `${basePath}/company-management`,
            
              },
    
    
        
   
    
  ];

  // Auto-open active dropdown
  useEffect(() => {
    const currentPath = location.pathname;
    for (const item of navlinks) {
      if ("items" in item) {
        const activeChild = item.items.some((i) => i.path === currentPath);
        if (activeChild) {
          setOpenDropdown(item.id);
          break;
        }
      }
    }
  }, [location.pathname]);

  const displayName = user?.adminName || "Super Admin";
  const displayEmail = user?.adminEmail || "superadmin@example.com";

  const isDropdownActive = (dropdown: DropdownGroup) =>
    dropdown.items.some((i) => location.pathname === i.path);

  const renderMenuItem = (item: NavItem) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.id}
        to={item.path}
        end
        className={({ isActive }) =>
          `w-full flex items-center space-x-2 px-2 py-2 rounded-lg transition-all duration-200 border-l-4 ${
            isActive
              ? "bg-primary-500/10 text-primary-700 border-primary-500"
              : "text-gray-700 hover:bg-gray-50 border-transparent"
          }`
        }
        onClick={() => {
          if (window.innerWidth < 1024) onToggle();
        }}
      >
        {({ isActive }) => (
          <>
            <div
              className={`p-1 rounded-md ${
                isActive
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{item.label}</span>
          </>
        )}
      </NavLink>
    );
  };

  const renderDropdown = (dropdown: DropdownGroup) => {
    const Icon = dropdown.icon;
    const isOpen = openDropdown === dropdown.id;
    const hasActiveChild = isDropdownActive(dropdown);

    return (
      <div key={dropdown.id} className="w-full">
        <button
          onClick={() => toggleDropdown(dropdown.id)}
          className={`w-full flex items-center justify-between px-2 py-2 rounded-lg border-l-4 ${
            hasActiveChild
              ? "bg-primary-500/10 text-primary-700 border-primary-500"
              : "text-gray-700 hover:bg-gray-50 border-transparent"
          }`}
        >
          <div className="flex items-center space-x-2">
            <div
              className={`p-1 rounded-md ${
                hasActiveChild
                  ? "bg-primary-500 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{dropdown.label}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            } ${hasActiveChild ? "text-primary-600" : "text-gray-400"}`}
          />
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
          }`}
        >
          <div className="ml-4 space-y-0.5 border-l-2 border-primary-100 pl-3 py-0.5">
            {dropdown.items.map((subItem) => {
              const SubIcon = subItem.icon;
              return (
                <NavLink
                  key={subItem.id}
                  to={subItem.path}
                  end
                  className={({ isActive }) =>
                    `w-full flex items-center space-x-2 px-2 py-1.5 rounded-md transition-all duration-200 relative ${
                      isActive
                        ? "bg-primary-500 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 1024) onToggle();
                  }}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full -ml-3"></div>
                      )}
                      <SubIcon className="w-4 h-4" />
                      <span className="text-sm">{subItem.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed left-0 top-0 min-h-screen bg-white flex flex-col border-r border-primary-200 shadow-lg transform transition-transform duration-300 z-50 lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-72`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-primary-200">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-7 h-7 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg">
              <MapPin className="w-3 h-3 text-white" />
              <Plane className="w-2 h-2 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base text-primary-800">
                Aby Management
              </h2>
              <p className="text-xs text-primary-500">Super Admin Portal</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto p-2">
          <nav className="space-y-0.5">
            {navlinks.map((item) =>
              "items" in item ? renderDropdown(item) : renderMenuItem(item)
            )}
          </nav>
        </div>

        {/* Footer */}
        <div
          className="p-2 border-t border-primary-200 cursor-pointer"
          onClick={() => navigate("/super-admin/dashboard/profile")}
        >
          <div className="flex items-center space-x-2 p-1.5 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
            <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-normal text-gray-900 truncate">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {displayEmail}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

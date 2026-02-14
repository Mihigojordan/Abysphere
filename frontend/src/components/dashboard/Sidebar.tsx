/*  ─────────────────────────────────────────────────────────────────────────────
    Sidebar.tsx  (updated – feature-based visibility with enhanced dropdowns)
    ───────────────────────────────────────────────────────────────────────────── */
import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  X,
  User2,
  FolderTree,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Loader,
  PanelLeftClose,
  PanelLeft,
  Tags,
  Truck,
  AlertTriangle,
  CreditCard,
  Building,
  Users
} from "lucide-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import useAdminAuth from "../../context/AdminAuthContext";
import useEmployeeAuth from "../../context/EmployeeAuthContext";
import { API_URL } from "../../api/api";
import PWAInstallButton from "./PWAInstallButton";
import { useLanguage } from "../../context/LanguageContext";

/* -------------------------------------------------------------------------- */
/*  LocalStorage key for sidebar collapsed state                              */
/* -------------------------------------------------------------------------- */
const SIDEBAR_COLLAPSED_KEY = "sidebar_collapsed";

interface SystemFeature {
  id: string;
  name: string;
  description?: string;
}

/* -------------------------------------------------------------------------- */
/*  Extend the Admin type that comes from the context (only for this file)   */
/* -------------------------------------------------------------------------- */
interface Admin {
  id: string;
  adminName?: string;
  adminEmail?: string;
  profileImage?: string;
  phone?: string;
  isLocked?: boolean;
  features?: SystemFeature[];
  [key: string]: unknown;
}

/* -------------------------------------------------------------------------- */
/*  NavItem / DropdownGroup – now support a `feature` string                 */
/* -------------------------------------------------------------------------- */
interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  /** optional – if present the item is shown only when admin has this feature */
  feature?: string;
  /** keep old role-based guard for backward compatibility */
  allowedRoles?: string[];
}
interface DropdownGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  /** the whole group can be guarded by a feature */
  feature?: string;
  items: NavItem[];
}

/* -------------------------------------------------------------------------- */
interface SidebarProps {
  isOpen?: boolean;
  onToggle: () => void;
  role: string; // "admin" | "employee"
}

/* -------------------------------------------------------------------------- */
const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onToggle, role }) => {
  const { t } = useLanguage();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  /* ---------------------------------------------------------------------- */
  /*  Collapsed state with localStorage persistence                         */
  /* ---------------------------------------------------------------------- */
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    // Default to false (expanded) if not stored
    return stored !== null ? JSON.parse(stored) : false;
  });

  // Persist collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  const adminAuth = useAdminAuth();
  const employeeAuth = useEmployeeAuth();
  const auth = role === "admin" ? adminAuth : employeeAuth;
  const user = auth.user as Admin | null;               // <-- cast for TS

  const navigate = useNavigate();

  /* ---------------------------------------------------------------------- */
  /*  Toggle dropdown open/close                                           */
  /* ---------------------------------------------------------------------- */
  const toggleDropdown = (dropdownId: string) => {
    setOpenDropdown(prev => prev === dropdownId ? null : dropdownId);
  };

  /* ---------------------------------------------------------------------- */
  /*  Helper – does the current admin have a given feature?                */
  /* ---------------------------------------------------------------------- */
  const hasFeature = (name?: string): boolean => {
    if (role === 'employee') return true; // Employees see all features they are allowed to see by role
    if (!name) return true;                     // no guard → always visible
    return !!user?.features?.some((f) => f.name === name);
  };

  /* ---------------------------------------------------------------------- */
  /*  Build the raw navigation tree                                         */
  /* ---------------------------------------------------------------------- */
  const getNavlinks = (role: string): (NavItem | DropdownGroup)[] => {
    const base = `/${role}/dashboard`;

    return [
      { id: "dashboard", label: t('sidebar.dashboard'), icon: TrendingUp, path: base },



      {
        id: "departments",
        label: t('sidebar.departments'),
        icon: Building,
        path: `${base}/department-management`,
        feature: "DEPARTMENTS_MANAGEMENT",
        allowedRoles: ["admin"],
      },
      {
        id: "employees",
        label: t('sidebar.employees'),
        icon: Users,
        path: `${base}/employee-management`,
        feature: "EMPLOYEES_MANAGEMENT",
        allowedRoles: ["admin"],
      },

      {
        id: "clients",
        label: t('sidebar.clients'),
        icon: User2,
        path: `${base}/client-management`,
        feature: "CLIENTS_MANAGEMENT",
      },
      {
        id: "category",
        label: t('sidebar.categories'),
        icon: Tags,
        path: `${base}/category-management`,
        feature: "CATEGORY_MANAGEMENT",
      },
      {
        id: "expense",
        label: t('sidebar.expenseManagement'),
        icon: CreditCard,
        path: `${base}/expense-management`,
      },

      {
        id: "supplier",
        label: t('sidebar.suppliers'),
        icon: Truck,
        path: `${base}/supplier-management`,
        feature: "SUPPLIER_MANAGEMENT",
      },
      {
        id: "stockin",
        label: t('sidebar.stockIn'),
        icon: ArrowUp,
        path: `${base}/stockin-management`,
        feature: "STOCKIN_MANAGEMENT",
      },
      {
        id: "stockout",
        label: t('sidebar.stockOut'),
        icon: ArrowDown,
        path: `${base}/stockout-management`,
        feature: "STOCKOUT_MANAGEMENT",
      },
      {
        id: "Sales-Return",
        label: t('sidebar.salesReturn'),
        icon: Loader,
        path: `${base}/sales-return-management`,
        feature: "SALES_RETURN_MANAGEMENT",
      },



      /* ------------------------------------------------------------------ */
      /*  Example of a dropdown that is guarded by a single feature        */
      /* ------------------------------------------------------------------ */
      {
        id: "reports",
        label: t('sidebar.reports'),
        icon: TrendingUp,
        // feature: "VIEW_REPORTS",               // Removed to allow access
        items: [
          {
            id: "sales-report",
            label: t('sidebar.salesReport'),
            icon: TrendingUp,
            path: `${base}/reports/sales`,
            feature: "VIEW_REPORTS",
          },

          {
            id: "inventory-report",
            label: t('sidebar.inventoryReport'),
            icon: FolderTree,
            path: `${base}/reports/inventory`,
          },
          {
            id: "stock-history",
            label: t('sidebar.stockHistory'),
            icon: ArrowUp,
            path: `${base}/stock-history`,
          },
          {
            id: "stock-alerts",
            label: t('sidebar.stockAlerts'),
            icon: AlertTriangle,
            path: `${base}/stock-alerts`,
            // feature: "STOCK_ALERTS",
          },
        ],
      },
    ];
  };


  /* ---------------------------------------------------------------------- */
  /*  Filter by role **and** by feature                                    */
  /* ---------------------------------------------------------------------- */
  const filterNavItems = (
    items: (NavItem | DropdownGroup)[]
  ): (NavItem | DropdownGroup)[] => {
    return items
      .map((item) => {
        /* ------------------- DropdownGroup ------------------- */
        if ("items" in item) {
          const filtered = item.items
            .filter(
              (sub) =>
                (!sub.allowedRoles || sub.allowedRoles.includes(role)) &&
                hasFeature(sub.feature)
            );

          // keep the group only if it has at least one visible child **or**
          // the group itself is not guarded (feature undefined)
          const groupVisible =
            hasFeature(item.feature) && filtered.length > 0;

          return groupVisible ? { ...item, items: filtered } : null;
        }

        /* ----------------------- NavItem ---------------------- */
        const visible =
          (!item.allowedRoles || item.allowedRoles.includes(role)) &&
          hasFeature(item.feature);

        return visible ? item : null;
      })
      .filter((i): i is NavItem | DropdownGroup => i !== null);
  };

  const navlinks = filterNavItems(getNavlinks(role));

  /* ---------------------------------------------------------------------- */
  /*  Auto-open dropdown when a child route is active                     */
  /* ---------------------------------------------------------------------- */
  useEffect(() => {
    const cur = location.pathname;
    for (const it of navlinks) {
      if ("items" in it && it.items.some((sub) => cur === sub.path)) {
        setOpenDropdown(it.id);
        break;
      }
    }
  }, [location.pathname, navlinks]);

  /* ---------------------------------------------------------------------- */
  /*  Misc helpers                                                          */
  /* ---------------------------------------------------------------------- */
  const getProfileRoute = () => `/${role}/dashboard/profile`;
  const handleNavigateProfile = () => navigate(getProfileRoute(), { replace: true });

  const displayName =
    role === "admin"
      ? user?.adminName || t('sidebar.adminUser')
      : `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || t('sidebar.employeeUser');

  const displayImage =
    role === "admin"
      ? user?.profileImage || ""
      : user?.profileImage || "";

  const portalTitle = t('sidebar.portal', { role: role.charAt(0).toUpperCase() + role.slice(1) });

  const isDropdownActive = (dropdown: DropdownGroup) =>
    dropdown.items.some((i) => location.pathname === i.path);

  /* ---------------------------------------------------------------------- */
  /*  Renderers                                                            */
  /* ---------------------------------------------------------------------- */
  const renderMenuItem = (item: NavItem) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.id}
        to={item.path}
        end
        title={isCollapsed ? item.label : undefined}
        className={({ isActive }) =>
          `w-full flex items-center ${isCollapsed ? 'justify-center' : 'space-x-2'} px-2 py-2 rounded-lg transition-all duration-200 group ${isCollapsed ? '' : 'border-l-4'} ${isActive
            ? `bg-primary-500/10 text-primary-700 ${isCollapsed ? '' : 'border-primary-500'}`
            : `text-theme-text-primary hover:bg-theme-bg-tertiary ${isCollapsed ? '' : 'border-transparent'}`
          }`
        }
        onClick={() => window.innerWidth < 1024 && onToggle()}
      >
        {({ isActive }) => (
          <>
            <div
              className={`p-1.5 rounded-md ${isActive ? "bg-primary-500 text-white" : "bg-theme-bg-tertiary text-theme-text-secondary"
                }`}
            >
              <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'}`} />
            </div>
            {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
          </>
        )}
      </NavLink>
    );
  };

  const renderDropdown = (dropdown: DropdownGroup) => {
    const Icon = dropdown.icon;
    const isOpenDropdown = openDropdown === dropdown.id;
    const active = isDropdownActive(dropdown);

    // When collapsed, show only icon with tooltip
    if (isCollapsed) {
      return (
        <div key={dropdown.id} className="w-full relative group">
          <button
            onClick={() => {
              setIsCollapsed(false);
              setOpenDropdown(dropdown.id);
            }}
            title={dropdown.label}
            className={`w-full flex items-center justify-center px-2 py-2 rounded-lg transition-all duration-200 ${active
              ? "bg-primary-500/10 text-primary-700"
              : "text-theme-text-primary hover:bg-theme-bg-tertiary"
              }`}
          >
            <div
              className={`p-1.5 rounded-md ${active ? "bg-primary-500 text-white" : "bg-theme-bg-tertiary text-theme-text-secondary"
                }`}
            >
              <Icon className="w-5 h-5" />
            </div>
          </button>
        </div>
      );
    }

    return (
      <div key={dropdown.id} className="w-full">
        <button
          onClick={() => toggleDropdown(dropdown.id)}
          className={`w-full flex items-center justify-between px-2 py-2 rounded-lg transition-all duration-200 ${active
            ? "bg-primary-500/10 text-primary-700 border-l-4 border-primary-500"
            : "text-theme-text-primary hover:bg-theme-bg-tertiary border-l-4 border-transparent"
            }`}
        >
          <div className="flex items-center space-x-2">
            <div
              className={`p-1 rounded-md ${active ? "bg-primary-500 text-white" : "bg-theme-bg-tertiary text-theme-text-secondary"
                }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{dropdown.label}</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${isOpenDropdown ? "rotate-180" : ""
              } ${active ? "text-primary-600" : "text-theme-text-secondary"}`}
          />
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpenDropdown ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
            }`}
        >
          <div className="ml-4 space-y-0.5 border-l-2 border-primary-100 pl-3 py-0.5">
            {dropdown.items.map((sub) => {
              const SubIcon = sub.icon;
              return (
                <NavLink
                  key={sub.id}
                  to={sub.path}
                  end
                  className={({ isActive }) =>
                    `w-full flex items-center space-x-2 px-2 py-1.5 rounded-md transition-all duration-200 group relative ${isActive
                      ? "bg-primary-500 text-white shadow-sm"
                      : "text-theme-text-secondary hover:bg-theme-bg-tertiary hover:text-theme-text-primary"
                    }`
                  }
                  onClick={() => window.innerWidth < 1024 && onToggle()}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-r-full -ml-3" />
                      )}
                      <SubIcon className="w-4 h-4" />
                      <span className="text-sm">{sub.label}</span>
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

  /* ---------------------------------------------------------------------- */
  /*  JSX                                                                   */
  /* ---------------------------------------------------------------------- */
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 min-h-screen bg-sidebar-bg text-sidebar-text flex flex-col border-r border-theme-border shadow-lg transform transition-all duration-300 ease-in-out z-50 lg:relative lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } ${isCollapsed ? "w-[68px]" : "w-72"}`}
      >
        {/* Header */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-3 border-b border-theme-border`}>
          {isCollapsed ? (
            <img
              src={`${API_URL}${displayImage}`}
              className="w-10 h-10 rounded-full object-cover cursor-pointer"
              alt=""
              title={displayName}
              onClick={handleNavigateProfile}
            />
          ) : (
            <div className="flex items-center space-x-2 cursor-pointer group" onClick={handleNavigateProfile}>
              <img src={`${API_URL}${displayImage}`} className="w-10 h-10 rounded-full object-cover" alt="" />
              <div>
                <h2 className="font-bold text-base text-primary-800 group-hover:text-primary-600 transition-colors">{displayName}</h2>
                <p className="text-xs text-primary-500">{portalTitle}</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded-lg hover:bg-theme-bg-tertiary transition-colors"
          >
            <X className="w-4 h-4 text-theme-text-secondary" />
          </button>
        </div>

        {/* Collapse Toggle Button (Desktop only) */}
        <div className={`hidden lg:flex ${isCollapsed ? 'justify-center' : 'justify-end'} px-2 py-2 border-b border-theme-border`}>
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg hover:bg-theme-bg-tertiary transition-colors text-theme-text-secondary hover:text-primary-600"
            title={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          >
            {isCollapsed ? (
              <PanelLeft className="w-5 h-5" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-2">
          <nav className="space-y-0.5">
            {navlinks.length ? (
              navlinks.map((it) => ("items" in it ? renderDropdown(it) : renderMenuItem(it)))
            ) : (
              <div className="text-center py-4">
                <p className="text-theme-text-secondary text-xs">{t('sidebar.noMenu')}</p>
              </div>
            )}
          </nav>
        </div>

        {/* Footer – PWA Install */}
        {!isCollapsed && <PWAInstallButton />}
      </div>
    </>
  );
};

export default Sidebar;
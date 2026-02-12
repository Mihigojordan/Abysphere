import {
  Bell,
  LogOut,
  Menu,
  Settings,
  User,
  Lock,
  ChevronDown,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAdminAuth from "../../context/AdminAuthContext";
import useEmployeeAuth from "../../context/EmployeeAuthContext";
import { API_URL } from "../../api/api";

interface HeaderProps {
  onToggle: () => void;
  role: string;
}

// Message type definitions
type MessageType = "info" | "warning" | "success" | "payment";

const Header: React.FC<HeaderProps> = ({ onToggle, role }) => {
  const navigate = useNavigate();
  const { user: adminUser, logout: adminLogout, lockAdmin } = useAdminAuth();
  const { user: employeeUser, logout: employeeLogout, lockEmployee } = useEmployeeAuth();

  const user = role === "admin" ? adminUser : employeeUser;
  const logout = role === "admin" ? adminLogout : employeeLogout;
  const lock = role === "admin" ? lockAdmin : lockEmployee;

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isLocking, setIsLocking] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const onLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLock = async () => {
    setIsLocking(true);
    try {
      await lock();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Lock error:", error);
    } finally {
      setIsLocking(false);
    }
  };

  const getDisplayName = (): string => {
    if (role === "admin") {
      return adminUser?.adminName || "Admin";
    }
    return employeeUser?.first_name
      ? `${employeeUser.first_name} ${employeeUser.last_name || ""}`.trim()
      : "Employee";
  };

  const getProfileImage = (): string | undefined => {
    return role === "admin" ? adminUser?.profileImage : employeeUser?.profile_image;
  };

  const getEmail = (): string | undefined => {
    return role === "admin" ? adminUser?.adminEmail : employeeUser?.email;
  };

  // Check if message is expired
  const isMessageValid = (): boolean => {
    if (!adminUser?.message) return false;
    if (!adminUser?.messageExpiry) return false;
    
    const now = new Date();
    const expiry = new Date(adminUser.messageExpiry);
    
    // Only show if current time is before or equal to expiry time
    return now <= expiry;
  };

  // Check if custom colors are defined
  const hasCustomColors = (): boolean => {
    return !!(adminUser?.messageTextColor || adminUser?.messageBgColor);
  };

  // Detect message type from message content (only used when no custom colors)
  const getMessageType = (): MessageType => {
    const msg = adminUser?.message?.toLowerCase() || "";
    if (msg.includes("payment") || msg.includes("subscription") || msg.includes("invoice")) {
      return "payment";
    }
    if (msg.includes("urgent") || msg.includes("warning") || msg.includes("attention")) {
      return "warning";
    }
    if (msg.includes("success") || msg.includes("completed") || msg.includes("approved")) {
      return "success";
    }
    return "info";
  };

  const messageType = getMessageType();

  // Get icon based on message type
  const getIcon = () => {
    switch (messageType) {
      case "warning":
        return <AlertTriangle className="alert-icon" />;
      case "success":
        return <CheckCircle className="alert-icon" />;
      case "payment":
        return <AlertCircle className="alert-icon" />;
      default:
        return <Info className="alert-icon" />;
    }
  };

  // State to force re-render when message expires
  const [, setForceUpdate] = useState(0);

  // Auto-hide message when it expires
  useEffect(() => {
    if (!adminUser?.message || !adminUser?.messageExpiry) return;

    const expiry = new Date(adminUser.messageExpiry);
    const now = new Date();
    const timeUntilExpiry = expiry.getTime() - now.getTime();

    // If already expired, no need to set timeout
    if (timeUntilExpiry <= 0) return;

    // Set timeout to hide message when it expires
    const timeoutId = setTimeout(() => {
      setForceUpdate(prev => prev + 1); // Force re-render to hide the message
    }, timeUntilExpiry);

    return () => clearTimeout(timeoutId);
  }, [adminUser?.message, adminUser?.messageExpiry]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, []);

  return (
    <>
      <header className="bg-header-bg shadow-sm border-b border-theme-border transition-colors duration-200">
        <div className="px-6 py-3">
          <div className="flex md:items-center flex-wrap justify-center gap-3 md:gap-0 md:justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 bg-primary-600 rounded-lg lg:hidden flex items-center justify-center cursor-pointer"
                  onClick={onToggle}
                >
                  <Menu className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-theme-text-primary">
                  Welcome to Dashboard Management
                </h1>
              </div>
            </div>

            <div className="flex md:items-center space-x-4">
              <button className="p-2 text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-theme-text-secondary hover:text-theme-text-primary hover:bg-theme-bg-tertiary rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 p-2 hover:bg-theme-bg-tertiary rounded-lg transition-colors"
                  disabled={isLocking}
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                    {getProfileImage() ? (
                      <img
                        src={`${API_URL}${getProfileImage()}`}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-theme-text-primary">{getDisplayName()}</div>
                    <div className="text-xs text-primary-600">{role === "admin" ? "Administrator" : "Employee"}</div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-theme-text-secondary transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-theme-bg-primary rounded-lg shadow-lg border border-theme-border z-10">
                    <div className="py-1">
                      <div className="px-4 py-3 border-b border-theme-border bg-primary-50">
                        <div className="text-sm font-medium text-theme-text-primary">{getDisplayName()}</div>
                        <div className="text-xs text-theme-text-secondary">{getEmail()}</div>
                        <div className="text-xs font-medium text-primary-600">
                          {role === "admin" ? "Administrator" : "Employee"}
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            navigate(role === "admin" ? "/admin/dashboard/profile" : "/employee/dashboard/profile");
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-theme-text-primary hover:bg-primary-50 transition-colors"
                        >
                          <User className="w-4 h-4 mr-2" />
                          My Profile
                        </button>

                        <button
                          onClick={() => {
                            handleLock();
                            setIsDropdownOpen(false);
                          }}
                          disabled={isLocking}
                          className="flex items-center w-full px-4 py-2 text-sm text-theme-text-primary hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          {isLocking ? "Locking..." : "Lock Screen"}
                        </button>

                        <div className="border-t border-theme-border my-1"></div>

                        <button
                          onClick={() => {
                            onLogout();
                            setIsDropdownOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Multi-Purpose Alert Banner */}
      {isMessageValid() && (
        <div
          className={`alert-banner ${!hasCustomColors() ? `alert-${messageType}` : ''}`}
          style={hasCustomColors() ? {
            background: adminUser?.messageBgColor || undefined,
          } : undefined}
        >
          <div className="alert-glow"></div>
          <div className="alert-content">
            <div className="marquee-container">
              <div className="marquee-content">
                <span
                  className="message-item"
                  style={hasCustomColors() ? { color: adminUser?.messageTextColor || undefined } : undefined}
                >
                  {getIcon()}
                  <span className="message-text">{adminUser?.message}</span>
                </span>
                <span
                  className="message-item"
                  style={hasCustomColors() ? { color: adminUser?.messageTextColor || undefined } : undefined}
                >
                  {getIcon()}
                  <span className="message-text">{adminUser?.message}</span>
                </span>
                <span
                  className="message-item"
                  style={hasCustomColors() ? { color: adminUser?.messageTextColor || undefined } : undefined}
                >
                  {getIcon()}
                  <span className="message-text">{adminUser?.message}</span>
                </span>
                <span
                  className="message-item"
                  style={hasCustomColors() ? { color: adminUser?.messageTextColor || undefined } : undefined}
                >
                  {getIcon()}
                  <span className="message-text">{adminUser?.message}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="alert-pulse"></div>
        </div>
      )}

      <style>{`
        .alert-banner {
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border-bottom: 2px solid rgba(255, 255, 255, 0.2);
        }

        /* Info style - Blue */
        .alert-info {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
        }

        /* Warning style - Amber/Orange */
        .alert-warning {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        /* Success style - Green */
        .alert-success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        /* Payment style - Purple */
        .alert-payment {
          background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
        }

        .alert-glow {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          animation: glow-sweep 3s ease-in-out infinite;
        }

        @keyframes glow-sweep {
          0% {
            left: -100%;
          }
          50%, 100% {
            left: 100%;
          }
        }

        .alert-pulse {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: rgba(255, 255, 255, 0.5);
          animation: pulse-line 2s ease-in-out infinite;
        }

        @keyframes pulse-line {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }

        .alert-content {
          position: relative;
          padding: 10px 0;
          z-index: 1;
        }

        .marquee-container {
          display: flex;
          overflow: hidden;
        }

        .marquee-content {
          display: flex;
          animation: marquee 30s linear infinite;
          will-change: transform;
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-25%);
          }
        }

        .marquee-content:hover {
          animation-play-state: paused;
        }

        .message-item {
          display: inline-flex;
          align-items: center;
          padding: 0 50px;
          white-space: nowrap;
          color: white;
          font-weight: 600;
          font-size: 14px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
          letter-spacing: 0.3px;
        }

        .alert-icon {
          width: 18px;
          height: 18px;
          margin-right: 10px;
          flex-shrink: 0;
          animation: icon-bounce 2s ease-in-out infinite;
          filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.4));
        }

        @keyframes icon-bounce {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-2px) scale(1.05);
          }
        }

        .message-text {
          animation: text-fade 3s ease-in-out infinite;
        }

        @keyframes text-fade {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.9;
          }
        }

        @media (max-width: 640px) {
          .message-item {
            font-size: 12px;
            padding: 0 30px;
          }
          
          .alert-icon {
            width: 16px;
            height: 16px;
            margin-right: 8px;
          }
          
          .alert-content {
            padding: 8px 0;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
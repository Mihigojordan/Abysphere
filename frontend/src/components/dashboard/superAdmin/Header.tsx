import {
  Bell,
  LogOut,
  Menu,
  Settings,
  User,
  Lock,
  ChevronDown,
  Maximize,
  Minimize,
  Search,
  Moon,
  Sun,
  X,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useSuperAdminAuth from "../../../context/SuperAdminAuthContext";
import { API_URL } from "../../../api/api";
import Flag from "react-flagkit"; // Import react-flagkit

interface HeaderProps {
  onToggle: () => void;
}

// Language options with country codes for react-flagkit
const languages = [
  { code: "US", name: "English" },
  { code: "FR", name: "Français" },
  { code: "ES", name: "Español" },
  { code: "DE", name: "Deutsch" },
  { code: "IT", name: "Italiano" },
  { code: "PT", name: "Português" },
  { code: "RU", name: "Русский" },
  { code: "CN", name: "中文" },
  { code: "JP", name: "日本語" },
  { code: "KR", name: "한국어" },
];

const Header: React.FC<HeaderProps> = ({ onToggle }) => {
  const navigate = useNavigate();
  const { user, logout, lockAdmin } = useSuperAdminAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isLocking, setIsLocking] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLanguageOpen, setIsLanguageOpen] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [notificationCount, setNotificationCount] = useState<number>(3);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const languageRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

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
      await lockAdmin();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Lock error:", error);
    } finally {
      setIsLocking(false);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error("Error attempting to enable fullscreen:", e);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const handleLanguageChange = (language: typeof languages[0]) => {
    setSelectedLanguage(language);
    setIsLanguageOpen(false);
    console.log("Language changed to:", language.name);
  };

  const getDisplayName = (): string => {
    return user?.adminName || "Super Admin";
  };

  const getProfileImage = (): string | undefined => {
    return user?.profileImage;
  };

  const getEmail = (): string | undefined => {
    return user?.adminEmail;
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        languageRef.current &&
        !languageRef.current.contains(event.target as Node)
      ) {
        setIsLanguageOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
        setIsLanguageOpen(false);
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscapeKey);
    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="px-6 py-[6px]">
        <div className="flex items-center justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-center space-x-4 flex-1">
            <div
              className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl lg:hidden flex items-center justify-center cursor-pointer hover:from-primary-700 hover:to-primary-800 transition-all shadow-md hover:shadow-lg"
              onClick={onToggle}
            >
              <Menu className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 hidden md:block">
              Super Admin Dashboard
            </h1>
            <h1 className="text-lg font-bold text-gray-900 md:hidden">
              Dashboard
            </h1>
          </div>

          {/* Center Section - Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xl">
            {!isSearchOpen ? (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
              >
                <Search className="w-4 h-4 mr-2" />
                <span>Search...</span>
                <kbd className="ml-auto px-2 py-0.5 text-xs bg-white border border-gray-300 rounded">
                  ⌘K
                </kbd>
              </button>
            ) : (
              <form onSubmit={handleSearch} className="flex w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search anything..."
                    className="w-full pl-10 pr-10 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Language Selector */}
            <div className="relative" ref={languageRef}>
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="hidden md:flex items-center space-x-1 px-2 py-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                title="Change Language"
              >
                <Flag country={selectedLanguage.code} size={24} />
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isLanguageOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-80 overflow-y-auto">
                  <div className="py-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang)}
                        className={`flex items-center w-full px-4 py-2.5 text-sm hover:bg-primary-50 transition-colors ${
                          selectedLanguage.code === lang.code
                            ? "bg-primary-50 text-primary-700"
                            : "text-gray-700"
                        }`}
                      >
                        <Flag country={lang.code} size={24} className="mr-3" />
                        <span className="font-medium">{lang.name}</span>
                        {selectedLanguage.code === lang.code && (
                          <span className="ml-auto text-primary-600 font-bold">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="hidden md:block p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>

            {/* Notifications */}
            <button
              className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Settings */}
            <button
              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 p-2 hover:bg-primary-50 rounded-lg transition-all"
                disabled={isLocking}
              >
                <div className="w-9 h-9 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-primary-300 ring-offset-2">
                  {getProfileImage() ? (
                    <img
                      src={`${API_URL}${getProfileImage()}`}
                      alt="Profile"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-primary-700" />
                  )}
                </div>
                <div className="text-left hidden xl:block">
                  <div className="text-sm font-semibold text-gray-800">
                    {getDisplayName()}
                  </div>
                  <div className="text-xs text-primary-600 font-medium">
                    Super Admin
                  </div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 hidden xl:block ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-20">
                  <div className="py-2">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-blue-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-primary-300">
                          {getProfileImage() ? (
                            <img
                              src={`${API_URL}${getProfileImage()}`}
                              alt="Profile"
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-primary-700" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">
                            {getDisplayName()}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {getEmail()}
                          </div>
                          <div className="text-xs font-semibold text-primary-600 mt-0.5">
                            Super Admin
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          navigate("/super-admin/dashboard/profile");
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-all group"
                      >
                        <User className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">My Profile</span>
                      </button>

                      <button
                        onClick={handleLock}
                        disabled={isLocking}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                        <Lock className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">
                          {isLocking ? "Locking..." : "Lock Screen"}
                        </span>
                      </button>

                      <div className="border-t border-gray-100 my-2"></div>

                      <button
                        onClick={onLogout}
                        className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-all group"
                      >
                        <LogOut className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold">Sign Out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden mt-3">
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search anything..."
                  className="w-full pl-10 pr-10 py-2 border border-primary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
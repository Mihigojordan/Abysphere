/*  ─────────────────────────────────────────────────────────────────────────────
    ThemeContext.tsx - Global theme context with localStorage persistence
    ───────────────────────────────────────────────────────────────────────────── */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { themes, THEME_STORAGE_KEY } from '../themes/themes';

// Use typeof to infer Theme type from themes object
type Theme = typeof themes[keyof typeof themes];

interface ThemeContextValue {
  currentTheme: string;
  themeData: Theme;
  changeTheme: (themeName: string) => void;
  availableThemes: string[];
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    // Load theme from localStorage on initialization
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme && themes[savedTheme] ? savedTheme : 'default';
  });

  // Update PWA meta theme-color tags
  const updateMetaThemeColor = useCallback((themeName: string) => {
    const theme = themes[themeName];
    if (!theme) return;

    // Get the primary color for PWA theme (using primary-700 for better contrast)
    const themeColor = theme.colors['--color-primary-700'];
    
    // Update or create meta theme-color tag
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', themeColor);
    
    // Update or create msapplication-TileColor tag (for Windows tiles)
    let metaTileColor = document.querySelector('meta[name="msapplication-TileColor"]');
    if (!metaTileColor) {
      metaTileColor = document.createElement('meta');
      metaTileColor.setAttribute('name', 'msapplication-TileColor');
      document.head.appendChild(metaTileColor);
    }
    metaTileColor.setAttribute('content', themeColor);
    
    // Update or create msapplication-navbutton-color tag (for Windows Phone)
    let metaNavButton = document.querySelector('meta[name="msapplication-navbutton-color"]');
    if (!metaNavButton) {
      metaNavButton = document.createElement('meta');
      metaNavButton.setAttribute('name', 'msapplication-navbutton-color');
      document.head.appendChild(metaNavButton);
    }
    metaNavButton.setAttribute('content', themeColor);
    
    // Save theme color to localStorage for PWA
    localStorage.setItem('pwa-theme-color', themeColor);
  }, []);

  // Apply theme CSS variables to :root
  const applyTheme = useCallback((themeName: string) => {
    const theme = themes[themeName];
    if (!theme) return;

    const root = document.documentElement;

    // Apply all CSS variables from the theme
    Object.entries(theme.colors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Add/remove dark mode class for additional styling hooks
    if (theme.isDark) {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
    }

    // Set theme name as data attribute for CSS selectors
    document.body.setAttribute('data-theme', themeName);

    // Update PWA theme-color meta tags
    updateMetaThemeColor(themeName);
  }, [updateMetaThemeColor]);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(currentTheme);
    localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
  }, [currentTheme, applyTheme]);

  const changeTheme = useCallback((themeName: string) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  }, []);

  const value: ThemeContextValue = {
    currentTheme,
    themeData: themes[currentTheme],
    changeTheme,
    availableThemes: Object.keys(themes),
    isDarkMode: themes[currentTheme]?.isDark ?? false,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
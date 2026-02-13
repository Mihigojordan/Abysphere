/*  ─────────────────────────────────────────────────────────────────────────────
    themes.ts - Theme configuration with multiple color schemes
    ───────────────────────────────────────────────────────────────────────────── */

export interface ThemeColors {
  '--color-primary-50': string;
  '--color-primary-100': string;
  '--color-primary-200': string;
  '--color-primary-300': string;
  '--color-primary-400': string;
  '--color-primary-500': string;
  '--color-primary-600': string;
  '--color-primary-700': string;
  '--color-primary-800': string;
  '--color-primary-900': string;
  '--color-primary-950': string;
  '--color-secondary-50': string;
  '--color-secondary-100': string;
  '--color-secondary-200': string;
  '--color-secondary-300': string;
  '--color-secondary-400': string;
  '--color-secondary-500': string;
  '--color-secondary-600': string;
  '--color-secondary-700': string;
  '--color-secondary-800': string;
  '--color-secondary-900': string;
  '--color-secondary-950': string;
  '--color-bg-primary': string;
  '--color-bg-secondary': string;
  '--color-bg-tertiary': string;
  '--color-text-primary': string;
  '--color-text-secondary': string;
  '--color-border': string;
  '--color-sidebar-bg': string;
  '--color-sidebar-text': string;
  '--color-header-bg': string;
}

export interface Theme {
  name: string;
  label: string;
  description: string;
  colors: ThemeColors;
  isDark: boolean;
}

export const themes: Record<string, Theme> = {
  default: {
    name: 'default',
    label: 'Default Blue',
    description: 'Classic blue theme with clean aesthetics',
    isDark: false,
    colors: {
      '--color-primary-50': '#eff6ff',
      '--color-primary-100': '#dbeafe',
      '--color-primary-200': '#bfdbfe',
      '--color-primary-300': '#93c5fd',
      '--color-primary-400': '#60a5fa',
      '--color-primary-500': '#3b82f6',
      '--color-primary-600': '#2563eb',
      '--color-primary-700': '#1d4ed8',
      '--color-primary-800': '#1e40af',
      '--color-primary-900': '#1e3a8a',
      '--color-primary-950': '#172554',
      '--color-secondary-50': '#fff9eb',
      '--color-secondary-100': '#fff2cf',
      '--color-secondary-200': '#ffe19c',
      '--color-secondary-300': '#f9d67b',
      '--color-secondary-400': '#eec25b',
      '--color-secondary-500': '#daa13c',
      '--color-secondary-600': '#b7812d',
      '--color-secondary-700': '#946221',
      '--color-secondary-800': '#704717',
      '--color-secondary-900': '#4a2f0e',
      '--color-secondary-950': '#261706',
      '--color-bg-primary': '#ffffff',
      '--color-bg-secondary': '#f8fafc',
      '--color-bg-tertiary': '#f1f5f9',
      '--color-text-primary': '#1e293b',
      '--color-text-secondary': '#64748b',
      '--color-border': '#e2e8f0',
      '--color-sidebar-bg': '#ffffff',
      '--color-sidebar-text': '#1e293b',
      '--color-header-bg': '#ffffff',
    },
  },

  emerald: {
    name: 'emerald',
    label: 'Emerald Green',
    description: 'Fresh green theme inspired by nature',
    isDark: false,
    colors: {
      '--color-primary-50': '#ecfdf5',
      '--color-primary-100': '#d1fae5',
      '--color-primary-200': '#a7f3d0',
      '--color-primary-300': '#6ee7b7',
      '--color-primary-400': '#34d399',
      '--color-primary-500': '#10b981',
      '--color-primary-600': '#059669',
      '--color-primary-700': '#047857',
      '--color-primary-800': '#065f46',
      '--color-primary-900': '#064e3b',
      '--color-primary-950': '#022c22',
      '--color-secondary-50': '#fef3c7',
      '--color-secondary-100': '#fde68a',
      '--color-secondary-200': '#fcd34d',
      '--color-secondary-300': '#fbbf24',
      '--color-secondary-400': '#f59e0b',
      '--color-secondary-500': '#d97706',
      '--color-secondary-600': '#b45309',
      '--color-secondary-700': '#92400e',
      '--color-secondary-800': '#78350f',
      '--color-secondary-900': '#451a03',
      '--color-secondary-950': '#27150a',
      '--color-bg-primary': '#ffffff',
      '--color-bg-secondary': '#f0fdf4',
      '--color-bg-tertiary': '#dcfce7',
      '--color-text-primary': '#14532d',
      '--color-text-secondary': '#166534',
      '--color-border': '#bbf7d0',
      '--color-sidebar-bg': '#ffffff',
      '--color-sidebar-text': '#14532d',
      '--color-header-bg': '#ffffff',
    },
  },

  purple: {
    name: 'purple',
    label: 'Royal Purple',
    description: 'Elegant purple theme for a premium feel',
    isDark: false,
    colors: {
      '--color-primary-50': '#faf5ff',
      '--color-primary-100': '#f3e8ff',
      '--color-primary-200': '#e9d5ff',
      '--color-primary-300': '#d8b4fe',
      '--color-primary-400': '#c084fc',
      '--color-primary-500': '#a855f7',
      '--color-primary-600': '#9333ea',
      '--color-primary-700': '#7e22ce',
      '--color-primary-800': '#6b21a8',
      '--color-primary-900': '#581c87',
      '--color-primary-950': '#3b0764',
      '--color-secondary-50': '#fdf2f8',
      '--color-secondary-100': '#fce7f3',
      '--color-secondary-200': '#fbcfe8',
      '--color-secondary-300': '#f9a8d4',
      '--color-secondary-400': '#f472b6',
      '--color-secondary-500': '#ec4899',
      '--color-secondary-600': '#db2777',
      '--color-secondary-700': '#be185d',
      '--color-secondary-800': '#9d174d',
      '--color-secondary-900': '#831843',
      '--color-secondary-950': '#500724',
      '--color-bg-primary': '#ffffff',
      '--color-bg-secondary': '#faf5ff',
      '--color-bg-tertiary': '#f3e8ff',
      '--color-text-primary': '#581c87',
      '--color-text-secondary': '#7e22ce',
      '--color-border': '#e9d5ff',
      '--color-sidebar-bg': '#ffffff',
      '--color-sidebar-text': '#581c87',
      '--color-header-bg': '#ffffff',
    },
  },

  sunset: {
    name: 'sunset',
    label: 'Sunset Orange',
    description: 'Warm orange theme with vibrant energy',
    isDark: false,
    colors: {
      '--color-primary-50': '#fff7ed',
      '--color-primary-100': '#ffedd5',
      '--color-primary-200': '#fed7aa',
      '--color-primary-300': '#fdba74',
      '--color-primary-400': '#fb923c',
      '--color-primary-500': '#f97316',
      '--color-primary-600': '#ea580c',
      '--color-primary-700': '#c2410c',
      '--color-primary-800': '#9a3412',
      '--color-primary-900': '#7c2d12',
      '--color-primary-950': '#431407',
      '--color-secondary-50': '#fef2f2',
      '--color-secondary-100': '#fee2e2',
      '--color-secondary-200': '#fecaca',
      '--color-secondary-300': '#fca5a5',
      '--color-secondary-400': '#f87171',
      '--color-secondary-500': '#ef4444',
      '--color-secondary-600': '#dc2626',
      '--color-secondary-700': '#b91c1c',
      '--color-secondary-800': '#991b1b',
      '--color-secondary-900': '#7f1d1d',
      '--color-secondary-950': '#450a0a',
      '--color-bg-primary': '#ffffff',
      '--color-bg-secondary': '#fff7ed',
      '--color-bg-tertiary': '#ffedd5',
      '--color-text-primary': '#7c2d12',
      '--color-text-secondary': '#c2410c',
      '--color-border': '#fed7aa',
      '--color-sidebar-bg': '#ffffff',
      '--color-sidebar-text': '#7c2d12',
      '--color-header-bg': '#ffffff',
    },
  },

  ocean: {
    name: 'ocean',
    label: 'Ocean Teal',
    description: 'Calming teal theme inspired by the sea',
    isDark: false,
    colors: {
      '--color-primary-50': '#f0fdfa',
      '--color-primary-100': '#ccfbf1',
      '--color-primary-200': '#99f6e4',
      '--color-primary-300': '#5eead4',
      '--color-primary-400': '#2dd4bf',
      '--color-primary-500': '#14b8a6',
      '--color-primary-600': '#0d9488',
      '--color-primary-700': '#0f766e',
      '--color-primary-800': '#115e59',
      '--color-primary-900': '#134e4a',
      '--color-primary-950': '#042f2e',
      '--color-secondary-50': '#ecfeff',
      '--color-secondary-100': '#cffafe',
      '--color-secondary-200': '#a5f3fc',
      '--color-secondary-300': '#67e8f9',
      '--color-secondary-400': '#22d3ee',
      '--color-secondary-500': '#06b6d4',
      '--color-secondary-600': '#0891b2',
      '--color-secondary-700': '#0e7490',
      '--color-secondary-800': '#155e75',
      '--color-secondary-900': '#164e63',
      '--color-secondary-950': '#083344',
      '--color-bg-primary': '#ffffff',
      '--color-bg-secondary': '#f0fdfa',
      '--color-bg-tertiary': '#ccfbf1',
      '--color-text-primary': '#134e4a',
      '--color-text-secondary': '#0f766e',
      '--color-border': '#99f6e4',
      '--color-sidebar-bg': '#ffffff',
      '--color-sidebar-text': '#134e4a',
      '--color-header-bg': '#ffffff',
    },
  },

  dark: {
    name: 'dark',
    label: 'Dark Mode',
    description: 'Dark theme for low-light environments',
    isDark: true,
    colors: {
      '--color-primary-50': '#1e293b',
      '--color-primary-100': '#334155',
      '--color-primary-200': '#475569',
      '--color-primary-300': '#64748b',
      '--color-primary-400': '#94a3b8',
      '--color-primary-500': '#3b82f6',
      '--color-primary-600': '#60a5fa',
      '--color-primary-700': '#93c5fd',
      '--color-primary-800': '#bfdbfe',
      '--color-primary-900': '#dbeafe',
      '--color-primary-950': '#eff6ff',
      '--color-secondary-50': '#422006',
      '--color-secondary-100': '#78350f',
      '--color-secondary-200': '#92400e',
      '--color-secondary-300': '#b45309',
      '--color-secondary-400': '#d97706',
      '--color-secondary-500': '#f59e0b',
      '--color-secondary-600': '#fbbf24',
      '--color-secondary-700': '#fcd34d',
      '--color-secondary-800': '#fde68a',
      '--color-secondary-900': '#fef3c7',
      '--color-secondary-950': '#fffbeb',
      '--color-bg-primary': '#0f172a',
      '--color-bg-secondary': '#1e293b',
      '--color-bg-tertiary': '#334155',
      '--color-text-primary': '#f1f5f9',
      '--color-text-secondary': '#94a3b8',
      '--color-border': '#334155',
      '--color-sidebar-bg': '#1e293b',
      '--color-sidebar-text': '#f1f5f9',
      '--color-header-bg': '#1e293b',
    },
  },

  midnight: {
    name: 'midnight',
    label: 'Midnight Blue',
    description: 'Deep blue dark theme',
    isDark: true,
    colors: {
      '--color-primary-50': '#172554',
      '--color-primary-100': '#1e3a8a',
      '--color-primary-200': '#1e40af',
      '--color-primary-300': '#1d4ed8',
      '--color-primary-400': '#2563eb',
      '--color-primary-500': '#3b82f6',
      '--color-primary-600': '#60a5fa',
      '--color-primary-700': '#93c5fd',
      '--color-primary-800': '#bfdbfe',
      '--color-primary-900': '#dbeafe',
      '--color-primary-950': '#eff6ff',
      '--color-secondary-50': '#4c1d95',
      '--color-secondary-100': '#5b21b6',
      '--color-secondary-200': '#6d28d9',
      '--color-secondary-300': '#7c3aed',
      '--color-secondary-400': '#8b5cf6',
      '--color-secondary-500': '#a78bfa',
      '--color-secondary-600': '#c4b5fd',
      '--color-secondary-700': '#ddd6fe',
      '--color-secondary-800': '#ede9fe',
      '--color-secondary-900': '#f5f3ff',
      '--color-secondary-950': '#faf5ff',
      '--color-bg-primary': '#020617',
      '--color-bg-secondary': '#0f172a',
      '--color-bg-tertiary': '#1e293b',
      '--color-text-primary': '#e2e8f0',
      '--color-text-secondary': '#94a3b8',
      '--color-border': '#1e3a8a',
      '--color-sidebar-bg': '#0f172a',
      '--color-sidebar-text': '#e2e8f0',
      '--color-header-bg': '#0f172a',
    },
  },

  rose: {
    name: 'rose',
    label: 'Rose Pink',
    description: 'Soft pink theme with elegant touch',
    isDark: false,
    colors: {
      '--color-primary-50': '#fff1f2',
      '--color-primary-100': '#ffe4e6',
      '--color-primary-200': '#fecdd3',
      '--color-primary-300': '#fda4af',
      '--color-primary-400': '#fb7185',
      '--color-primary-500': '#f43f5e',
      '--color-primary-600': '#e11d48',
      '--color-primary-700': '#be123c',
      '--color-primary-800': '#9f1239',
      '--color-primary-900': '#881337',
      '--color-primary-950': '#4c0519',
      '--color-secondary-50': '#fdf4ff',
      '--color-secondary-100': '#fae8ff',
      '--color-secondary-200': '#f5d0fe',
      '--color-secondary-300': '#f0abfc',
      '--color-secondary-400': '#e879f9',
      '--color-secondary-500': '#d946ef',
      '--color-secondary-600': '#c026d3',
      '--color-secondary-700': '#a21caf',
      '--color-secondary-800': '#86198f',
      '--color-secondary-900': '#701a75',
      '--color-secondary-950': '#4a044e',
      '--color-bg-primary': '#ffffff',
      '--color-bg-secondary': '#fff1f2',
      '--color-bg-tertiary': '#ffe4e6',
      '--color-text-primary': '#881337',
      '--color-text-secondary': '#be123c',
      '--color-border': '#fecdd3',
      '--color-sidebar-bg': '#ffffff',
      '--color-sidebar-text': '#881337',
      '--color-header-bg': '#ffffff',
    },
  },
};

export const THEME_STORAGE_KEY = 'app-theme-preference';

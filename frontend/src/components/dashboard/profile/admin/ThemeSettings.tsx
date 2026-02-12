/*  ─────────────────────────────────────────────────────────────────────────────
    ThemeSettings.tsx - Theme customization component for admin profile
    ───────────────────────────────────────────────────────────────────────────── */

import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { themes } from '../../../../themes/themes';
import { Check, Palette, Moon, Sun } from 'lucide-react';

const ThemeSettings: React.FC = () => {
  const { currentTheme, changeTheme, isDarkMode } = useTheme();

  // Group themes by light/dark
  const lightThemes = Object.values(themes).filter(t => !t.isDark);
  const darkThemes = Object.values(themes).filter(t => t.isDark);

  return (
    <div className="space-y-6">
      {/* Current Theme Info */}
      <div className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border border-primary-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-500 rounded-lg">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium text-theme-text-primary">Current Theme</h3>
            <p className="text-sm text-theme-text-secondary">{themes[currentTheme]?.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isDarkMode ? (
            <Moon className="w-5 h-5 text-primary-600" />
          ) : (
            <Sun className="w-5 h-5 text-primary-600" />
          )}
          <span className="text-sm font-medium text-primary-700">
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </span>
        </div>
      </div>

      {/* Light Themes Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sun className="w-4 h-4 text-theme-text-secondary" />
          <h3 className="text-sm font-semibold text-theme-text-primary uppercase tracking-wide">
            Light Themes
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lightThemes.map((theme) => (
            <ThemeCard
              key={theme.name}
              theme={theme}
              isSelected={currentTheme === theme.name}
              onSelect={() => changeTheme(theme.name)}
            />
          ))}
        </div>
      </div>

      {/* Dark Themes Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Moon className="w-4 h-4 text-theme-text-secondary" />
          <h3 className="text-sm font-semibold text-theme-text-primary uppercase tracking-wide">
            Dark Themes
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {darkThemes.map((theme) => (
            <ThemeCard
              key={theme.name}
              theme={theme}
              isSelected={currentTheme === theme.name}
              onSelect={() => changeTheme(theme.name)}
            />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 bg-theme-bg-tertiary rounded-lg border border-theme-border">
        <p className="text-sm text-theme-text-secondary">
          Your theme preference is automatically saved and will persist across sessions.
          The theme applies to the entire admin dashboard.
        </p>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*  Theme Card Component                                                      */
/* -------------------------------------------------------------------------- */
interface ThemeCardProps {
  theme: typeof themes[string];
  isSelected: boolean;
  onSelect: () => void;
}

const ThemeCard: React.FC<ThemeCardProps> = ({ theme, isSelected, onSelect }) => {
  const colors = theme.colors;

  return (
    <button
      onClick={onSelect}
      className={`relative w-full p-4 rounded-lg border-2 transition-all duration-200 text-left bg-theme-bg-primary ${
        isSelected
          ? 'border-primary-500 ring-2 ring-primary-200 shadow-md'
          : 'border-theme-border hover:border-primary-300 hover:shadow-sm'
      }`}
    >
      {/* Selected Checkmark */}
      {isSelected && (
        <div className="absolute top-2 right-2 p-1 bg-primary-500 rounded-full">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Theme Preview */}
      <div className="mb-3">
        <div
          className="h-16 rounded-md overflow-hidden border"
          style={{ backgroundColor: colors['--color-bg-primary'], borderColor: colors['--color-border'] }}
        >
          {/* Mini sidebar preview */}
          <div className="flex h-full">
            <div
              className="w-8 h-full"
              style={{ backgroundColor: colors['--color-sidebar-bg'], borderRight: `1px solid ${colors['--color-border']}` }}
            >
              <div className="p-1.5 space-y-1">
                <div
                  className="w-full h-1.5 rounded"
                  style={{ backgroundColor: colors['--color-primary-500'] }}
                />
                <div
                  className="w-full h-1.5 rounded opacity-50"
                  style={{ backgroundColor: colors['--color-primary-300'] }}
                />
                <div
                  className="w-full h-1.5 rounded opacity-30"
                  style={{ backgroundColor: colors['--color-primary-200'] }}
                />
              </div>
            </div>
            {/* Mini content preview */}
            <div className="flex-1 p-2">
              <div
                className="w-full h-2 rounded mb-1.5"
                style={{ backgroundColor: colors['--color-primary-500'] }}
              />
              <div
                className="w-3/4 h-1.5 rounded"
                style={{ backgroundColor: colors['--color-text-secondary'], opacity: 0.5 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Color Swatches */}
      <div className="flex gap-1 mb-3">
        <div
          className="w-6 h-6 rounded-full border border-theme-border"
          style={{ backgroundColor: colors['--color-primary-500'] }}
          title="Primary"
        />
        <div
          className="w-6 h-6 rounded-full border border-theme-border"
          style={{ backgroundColor: colors['--color-primary-600'] }}
          title="Primary Dark"
        />
        <div
          className="w-6 h-6 rounded-full border border-theme-border"
          style={{ backgroundColor: colors['--color-secondary-500'] }}
          title="Secondary"
        />
        <div
          className="w-6 h-6 rounded-full border border-theme-border"
          style={{ backgroundColor: colors['--color-bg-primary'] }}
          title="Background"
        />
      </div>

      {/* Theme Info */}
      <h4 className="font-medium text-theme-text-primary text-sm">{theme.label}</h4>
      <p className="text-xs text-theme-text-secondary mt-0.5">{theme.description}</p>
    </button>
  );
};

export default ThemeSettings;

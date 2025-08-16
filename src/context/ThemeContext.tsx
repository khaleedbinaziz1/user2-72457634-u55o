'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  accent: string;
  accentDark: string;
  accentLight: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  baseSize: string;
  scale: number;
}

export interface ThemeSpacing {
  base: number;
  scale: number;
}

export interface ThemeSettings {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: string;
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

const defaultTheme: ThemeSettings = {
  colors: {
    primary: '#3b82f6',
    primaryDark: '#2563eb',
    primaryLight: '#60a5fa',
    secondary: '#10b981',
    secondaryDark: '#059669',
    secondaryLight: '#34d399',
    accent: '#f59e0b',
    accentDark: '#d97706',
    accentLight: '#fbbf24',
    background: '#FFFFFF',
    foreground: '#171717',
    muted: '#6B7280',
    border: '#E5E7EB',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
    baseSize: '16px',
    scale: 1.25,
  },
  spacing: {
    base: 4,
    scale: 1.5,
  },
  borderRadius: '0.375rem',
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  },
};

// Load saved theme from localStorage or use default
const loadSavedTheme = (): ThemeSettings => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      try {
        return JSON.parse(savedTheme);
      } catch (e) {
        console.error('Error parsing saved theme:', e);
      }
    }
  }
  return defaultTheme;
};

interface ThemeContextType {
  theme: ThemeSettings;
  previewTheme: ThemeSettings;
  updateTheme: (newTheme: Partial<ThemeSettings>) => void;
  updatePreviewTheme: (newTheme: Partial<ThemeSettings>) => void;
  saveTheme: () => void;
  resetTheme: () => void;
  hasUnsavedChanges: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(loadSavedTheme);
  const [previewTheme, setPreviewTheme] = useState<ThemeSettings>(loadSavedTheme);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(theme));
  }, [theme]);

  const updateTheme = (newTheme: Partial<ThemeSettings>) => {
    const updatedTheme = {
      ...theme,
      ...newTheme,
      colors: { ...theme.colors, ...newTheme.colors },
      typography: { ...theme.typography, ...newTheme.typography },
      spacing: { ...theme.spacing, ...newTheme.spacing },
      shadows: { ...theme.shadows, ...newTheme.shadows },
    };
    setTheme(updatedTheme);
    setPreviewTheme(updatedTheme);
  };

  const updatePreviewTheme = (newTheme: Partial<ThemeSettings>) => {
    setPreviewTheme((prev) => ({
      ...prev,
      ...newTheme,
      colors: { ...prev.colors, ...newTheme.colors },
      typography: { ...prev.typography, ...newTheme.typography },
      spacing: { ...prev.spacing, ...newTheme.spacing },
      shadows: { ...prev.shadows, ...newTheme.shadows },
    }));
    setHasUnsavedChanges(true);
  };

  const saveTheme = () => {
    setTheme(previewTheme);
    setHasUnsavedChanges(false);
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    setPreviewTheme(defaultTheme);
    setHasUnsavedChanges(false);
    localStorage.removeItem('theme');
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        theme, 
        previewTheme, 
        updateTheme, 
        updatePreviewTheme, 
        saveTheme, 
        resetTheme,
        hasUnsavedChanges 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 
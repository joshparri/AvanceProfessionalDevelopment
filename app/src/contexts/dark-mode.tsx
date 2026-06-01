'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type ThemePreference = 'light' | 'dark' | 'system';

type DarkModeContextType = {
  themePreference: ThemePreference;
  isDarkMode: boolean;
  setThemePreference: (value: ThemePreference) => void;
  toggleDarkMode: () => void;
};

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'avance:theme-preference';

const resolveDarkMode = (preference: ThemePreference) => {
  if (typeof window === 'undefined') {
    return false;
  }

  if (preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  return preference === 'dark';
};

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => {
    if (typeof window === 'undefined') return 'system';
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => resolveDarkMode('system'));

  useEffect(() => {
    const updatePreference = () => {
      setIsDarkMode(resolveDarkMode(themePreference));
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    updatePreference();

    if (themePreference === 'system') {
      mediaQuery.addEventListener('change', updatePreference);
      return () => mediaQuery.removeEventListener('change', updatePreference);
    }

    return undefined;
  }, [themePreference]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_STORAGE_KEY, themePreference);
  }, [isDarkMode, themePreference]);

  const setThemePreference = (value: ThemePreference) => setThemePreferenceState(value);

  const toggleDarkMode = () => {
    setThemePreferenceState((current) => {
      if (current === 'dark') return 'light';
      if (current === 'light') return 'dark';
      return 'dark';
    });
  };

  return (
    <DarkModeContext.Provider value={{ themePreference, isDarkMode, setThemePreference, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
}

export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}

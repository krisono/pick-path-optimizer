import { createContext, useContext } from 'react';

export const designTokens = {
  // Spacing
  spacing: {
    container: 'mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8',
    section: 'py-6 sm:py-8',
  },
  
  // Typography
  typography: {
    h1: 'text-[clamp(22px,3vw,32px)] font-bold leading-tight',
    h2: 'text-xl sm:text-2xl font-semibold',
    h3: 'text-lg font-medium',
    body: 'text-[clamp(14px,1.8vw,16px)] leading-relaxed',
    caption: 'text-sm text-gray-600 dark:text-gray-400',
  },
  
  // Layout
  layout: {
    topNavHeight: 'h-16',
    sideNavWidth: 'w-64',
    bottomNavHeight: 'h-16',
    mapHeight: 'h-[56dvh]',
  },
  
  // Elevation
  elevation: {
    card: 'shadow-sm border border-gray-200/60 dark:border-gray-700/60',
    modal: 'shadow-xl',
    dropdown: 'shadow-lg',
  },
  
  // Radii
  radii: {
    card: 'rounded-xl',
    button: 'rounded-lg',
    input: 'rounded-lg',
    modal: 'rounded-2xl',
  },
};

const ThemeContext = createContext<{
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}>({
  theme: 'light',
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

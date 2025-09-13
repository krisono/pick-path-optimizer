import { createContext, useContext } from 'react';

/**
 * Production-Grade Design System for Pick Path Optimizer
 * Mobile-First Architecture with Tailwind CSS v4 Design Tokens
 */
export const designTokens = {
  // Spacing Scale - Mobile-first with perfect touch targets
  spacing: {
    // Container patterns
    container: 'mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8',
    section: 'py-6 sm:py-8 lg:py-12',
    
    // Component spacing
    component: {
      xs: 'space-y-2',
      sm: 'space-y-3',
      md: 'space-y-4',
      lg: 'space-y-6',
      xl: 'space-y-8',
    },
    
    // Touch targets (minimum 44px per Apple HIG)
    touch: {
      button: 'min-h-[44px] min-w-[44px]',
      input: 'min-h-[44px]',
      nav: 'h-16', // 64px for navigation
    },
    
    // Grid gaps
    grid: {
      tight: 'gap-3',
      base: 'gap-4',
      loose: 'gap-6',
      section: 'gap-8',
    },
  },
  
  // Typography Scale - Fluid, accessible, performant
  typography: {
    // Display text
    display: {
      xl: 'text-[clamp(28px,4vw,40px)] font-bold leading-[1.1] tracking-tight',
      lg: 'text-[clamp(24px,3.5vw,32px)] font-bold leading-[1.15] tracking-tight',
      md: 'text-[clamp(20px,3vw,28px)] font-bold leading-[1.2] tracking-tight',
    },
    
    // Heading hierarchy
    heading: {
      h1: 'text-[clamp(22px,3vw,32px)] font-bold leading-tight',
      h2: 'text-xl sm:text-2xl font-semibold leading-tight',
      h3: 'text-lg sm:text-xl font-medium leading-snug',
      h4: 'text-base font-medium leading-snug',
      h5: 'text-sm font-medium leading-snug',
    },
    
    // Body text optimized for readability
    body: {
      lg: 'text-lg leading-relaxed',
      base: 'text-[clamp(14px,1.8vw,16px)] leading-relaxed',
      sm: 'text-sm leading-relaxed',
      xs: 'text-xs leading-normal',
    },
    
    // Interactive text
    interactive: {
      button: 'text-sm font-medium',
      link: 'text-sm font-medium underline underline-offset-2',
      nav: 'text-sm font-medium',
    },
    
    // Status and metadata
    meta: {
      caption: 'text-xs text-gray-600 dark:text-gray-400 leading-normal',
      label: 'text-sm font-medium text-gray-700 dark:text-gray-300',
      helper: 'text-xs text-gray-500 dark:text-gray-400',
    },
  },
  
  // Layout System - Mobile-first responsive grid
  layout: {
    // Navigation heights (safe area aware)
    nav: {
      top: 'h-16',
      bottom: 'h-16 pb-safe',
      side: 'w-64',
    },
    
    // Content areas
    content: {
      main: 'min-h-[calc(100dvh-8rem)] pb-20 md:pb-8',
      map: 'h-[56dvh] sm:h-[60dvh] md:h-[calc(100vh-12rem)]',
      sidebar: 'h-[calc(100vh-4rem)]',
      modal: 'max-h-[90dvh]',
    },
    
    // Grid patterns
    grid: {
      // Desktop: Sidebar + Main + Controls
      desktop: 'md:grid md:grid-cols-[1fr_400px] lg:grid-cols-[1fr_480px]',
      // Mobile: Stack with bottom sheet
      mobile: 'flex flex-col',
      // Equal columns
      cols2: 'grid grid-cols-1 md:grid-cols-2',
      cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    },
    
    // Z-index scale
    zIndex: {
      dropdown: 'z-10',
      modal: 'z-20',
      overlay: 'z-30',
      navigation: 'z-40',
      toast: 'z-50',
    },
  },
  
  // Elevation & Shadow System
  elevation: {
    // Cards and surfaces
    none: 'shadow-none',
    sm: 'shadow-sm border border-gray-200/60 dark:border-gray-700/60',
    base: 'shadow-md border border-gray-200/80 dark:border-gray-700/80',
    lg: 'shadow-lg border border-gray-200 dark:border-gray-700',
    
    // Interactive states
    hover: 'shadow-lg border border-gray-300 dark:border-gray-600',
    focus: 'shadow-lg ring-2 ring-blue-500/20',
    
    // Modal and overlays
    modal: 'shadow-2xl',
    dropdown: 'shadow-xl border border-gray-200 dark:border-gray-700',
    
    // Bottom sheet specific
    bottomSheet: 'shadow-2xl border-t-2 border-gray-200 dark:border-gray-700',
  },
  
  // Border Radius Scale
  radii: {
    none: 'rounded-none',
    sm: 'rounded-md',
    base: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
    
    // Component specific
    button: 'rounded-lg',
    input: 'rounded-lg',
    card: 'rounded-xl',
    modal: 'rounded-2xl',
    bottomSheet: 'rounded-t-2xl',
  },
  
  // Color Semantic System
  colors: {
    // Status colors
    status: {
      success: 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800',
      warning: 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800',
      error: 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800',
      info: 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800',
    },
    
    // Interactive states
    interactive: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800',
    },
  },
  
  // Animation & Motion
  motion: {
    // Durations
    duration: {
      fast: 'duration-150',
      base: 'duration-200',
      slow: 'duration-300',
      slower: 'duration-500',
    },
    
    // Easings
    easing: {
      default: 'ease-out',
      bounce: 'ease-in-out',
      sharp: 'ease-in',
    },
    
    // Common transitions
    transition: {
      all: 'transition-all duration-200 ease-out',
      colors: 'transition-colors duration-200 ease-out',
      transform: 'transition-transform duration-200 ease-out',
      opacity: 'transition-opacity duration-200 ease-out',
    },
  },
  
  // Accessibility Features
  a11y: {
    // Focus indicators
    focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    focusVisible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
    
    // Screen reader only
    srOnly: 'sr-only',
    
    // Skip links
    skipLink: 'absolute left-0 top-0 -translate-y-full bg-blue-600 text-white px-4 py-2 rounded-br-lg focus:translate-y-0',
  },
};

/**
 * Theme Context for Light/Dark Mode
 */
export interface ThemeContextType {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  setTheme: () => {},
  resolvedTheme: 'light',
});

export const useTheme = () => useContext(ThemeContext);

/**
 * Responsive Breakpoints (matches Tailwind defaults)
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Mobile Detection Hook
 */
export const useIsMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

/**
 * Component Size Variants
 */
export const sizeVariants = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
} as const;

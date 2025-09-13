import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { designTokens } from "../lib/design-system";
import { checkHealth } from "../lib/api";

/**
 * Production-Grade Navigation System
 * Mobile-First with Clear Information Architecture
 */

// Local MenuIcon component to avoid import issues
const MenuIcon: React.FC<{ className?: string }> = ({
  className = "w-5 h-5",
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

// ==================== HEALTH BADGE ====================

const HealthBadge: React.FC = () => {
  const [health, setHealth] = useState<{
    status: "UP" | "DOWN" | "CHECKING";
    error?: string;
  }>({
    status: "CHECKING",
  });

  useEffect(() => {
    const checkApiHealth = async () => {
      const result = await checkHealth();
      setHealth(result);
    };

    checkApiHealth();
    const interval = setInterval(checkApiHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    UP: {
      classes:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400",
      icon: "🟢",
      label: "API Online",
    },
    DOWN: {
      classes:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400",
      icon: "🔴",
      label: "API Offline",
    },
    CHECKING: {
      classes:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400",
      icon: "🟡",
      label: "Checking...",
    },
  };

  const config = statusConfig[health.status];

  return (
    <div className="relative group">
      <div
        className={`
          inline-flex items-center gap-1.5 px-2 py-1 
          ${designTokens.radii.base} border text-xs font-medium
          ${config.classes}
          ${designTokens.motion.transition.colors}
        `}
        title={`API Status: ${config.label}`}
      >
        <span className="text-xs">{config.icon}</span>
        <span className="hidden sm:inline">{config.label}</span>
      </div>

      {/* Error tooltip */}
      {health.error && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap z-50 opacity-0 group-hover:opacity-100 transition-opacity">
          {health.error}
        </div>
      )}
    </div>
  );
};

// ==================== TOP NAVIGATION ====================

interface TopNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onMenuToggle: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentPage,
  onNavigate,
  onMenuToggle,
}) => {
  return (
    <nav
      className={`
        ${designTokens.layout.nav.top}
        bg-white dark:bg-gray-900
        border-b border-gray-200 dark:border-gray-700
        ${designTokens.spacing.container}
      `}
    >
      <div className="flex items-center justify-between h-full">
        {/* Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className={`
              md:hidden p-2 rounded-lg 
              hover:bg-gray-100 dark:hover:bg-gray-800
              ${designTokens.a11y.focus}
              ${designTokens.motion.transition.colors}
            `}
            aria-label="Toggle navigation menu"
          >
            <MenuIcon className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🏭</span>
            </div>
            <div className="hidden sm:block">
              <h1
                className={`${designTokens.typography.heading.h4} text-gray-900 dark:text-white`}
              >
                Pick Path Optimizer
              </h1>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {["Optimize", "Layouts", "Reports", "Settings"].map((page) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`
                px-3 py-2 rounded-lg text-sm font-medium
                ${designTokens.motion.transition.colors}
                ${
                  currentPage === page
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                }
              `}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-3">
          <HealthBadge />
          <button
            onClick={() => onNavigate("Docs")}
            className={`
              p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800
              text-gray-600 dark:text-gray-400
              ${designTokens.a11y.focus}
            `}
            aria-label="Documentation"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

// ==================== SIDE NAVIGATION ====================

interface SideNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
}

export const SideNav: React.FC<SideNavProps> = ({
  currentPage,
  onNavigate,
  isOpen,
}) => {
  const navItems = [
    {
      id: "Optimize",
      label: "Route Optimization",
      icon: "🎯",
      description: "Generate optimal picking routes",
    },
    {
      id: "Layouts",
      label: "Warehouse Layouts",
      icon: "📍",
      description: "Manage warehouse configurations",
    },
    {
      id: "Reports",
      label: "Performance Reports",
      icon: "📊",
      description: "View optimization analytics",
    },
    {
      id: "Settings",
      label: "System Settings",
      icon: "⚙️",
      description: "Configure application preferences",
    },
    {
      id: "Docs",
      label: "Documentation",
      icon: "📚",
      description: "API reference and guides",
    },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ x: -320 }}
        animate={{ x: 0 }}
        exit={{ x: -320 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`
          fixed md:static top-16 left-0 
          ${designTokens.layout.nav.side}
          ${designTokens.layout.content.sidebar}
          bg-white dark:bg-gray-900 
          border-r border-gray-200 dark:border-gray-700 
          ${designTokens.layout.zIndex.navigation}
          md:z-auto overflow-y-auto
        `}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left
                ${designTokens.motion.transition.colors}
                ${
                  currentPage === item.id
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                }
              `}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-lg flex-shrink-0 mt-0.5">{item.icon}</span>
              <div className="min-w-0">
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs opacity-75 mt-0.5 leading-relaxed">
                  {item.description}
                </div>
              </div>
            </motion.button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <div className="font-medium mb-1">Pick Path Optimizer</div>
            <div>Production-grade warehouse routing</div>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
};

// ==================== BOTTOM NAVIGATION ====================

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentPage,
  onNavigate,
}) => {
  const navItems = [
    { id: "Optimize", label: "Optimize", icon: "🎯" },
    { id: "Layouts", label: "Layouts", icon: "📍" },
    { id: "Reports", label: "Reports", icon: "📊" },
    { id: "Settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <nav
      className={`
        md:hidden fixed bottom-0 left-0 right-0
        bg-white dark:bg-gray-900
        border-t border-gray-200 dark:border-gray-700
        ${designTokens.layout.nav.bottom}
        ${designTokens.layout.zIndex.navigation}
        safe-area-inset-bottom
      `}
    >
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`
              flex flex-col items-center justify-center p-2 rounded-lg
              min-w-0 flex-1 gap-1
              ${designTokens.motion.transition.colors}
              ${
                currentPage === item.id
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400"
              }
            `}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs font-medium truncate">{item.label}</span>
          </motion.button>
        ))}
      </div>
    </nav>
  );
};

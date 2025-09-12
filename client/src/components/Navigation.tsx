import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { checkHealth } from "../lib/api";

// Health Badge Component
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

  const statusColors = {
    UP: "bg-green-100 text-green-800 border-green-200",
    DOWN: "bg-red-100 text-red-800 border-red-200",
    CHECKING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  };

  return (
    <div className="relative group">
      <div
        className={`px-2 py-1 rounded-full border text-xs font-medium ${
          statusColors[health.status]
        }`}
      >
        <div className="flex items-center gap-1">
          <div
            className={`w-2 h-2 rounded-full ${
              health.status === "UP"
                ? "bg-green-500"
                : health.status === "DOWN"
                ? "bg-red-500"
                : "bg-yellow-500"
            }`}
          />
          API
        </div>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
        {health.status === "UP"
          ? "API is healthy"
          : health.status === "DOWN"
          ? `API is down: ${health.error}`
          : "Checking API status..."}
      </div>
    </div>
  );
};

// Top Navigation
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
    <nav className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-full max-w-screen-xl mx-auto">
        {/* Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
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
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Pick Path Optimizer
            </h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {["Optimize", "Layouts", "Reports", "Settings"].map((page) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentPage === page
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
              }`}
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
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
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

// Side Navigation (Desktop)
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
    { id: "Optimize", label: "Optimize Route", icon: "🎯" },
    { id: "Layouts", label: "Warehouse Layouts", icon: "📍" },
    { id: "Orders", label: "Sample Orders", icon: "📋" },
    { id: "Reports", label: "Run History", icon: "📊" },
    { id: "Settings", label: "Settings", icon: "⚙️" },
    { id: "Docs", label: "Documentation", icon: "📚" },
  ];

  if (!isOpen) return null;

  return (
    <motion.aside
      initial={{ x: -320 }}
      animate={{ x: 0 }}
      exit={{ x: -320 }}
      className="fixed md:static top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-40 md:z-auto"
    >
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              currentPage === item.id
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </motion.aside>
  );
};

// Bottom Navigation (Mobile)
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 h-16 z-40">
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg min-w-0 flex-1 ${
              currentPage === item.id
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-600 dark:text-gray-400"
            }`}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            <span className="text-xs font-medium truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  optimizeRoute,
  ApiError,
  getErrorMessage,
  getErrorHint,
  BASE,
} from "../lib/api";
import { Button, Banner, Field, Select, Card } from "./ui";
import { TopNav, SideNav, BottomNav } from "./NavigationNew";
import WarehouseMap from "./WarehouseMap";
import MetricsPanel from "./MetricsPanel";
import ControlsPanel from "./ControlsPanel";

/// <reference types="vite/client" />

interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_PICK_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface RouteConstraints {
  maxCapacity?: number;
  maxTimeMinutes?: number;
  avoidBlockedZones?: boolean;
  allowAisleCrossing?: boolean;
}

interface CostWeights {
  distanceWeight?: number;
  aisleCrossingPenalty?: number;
  turnPenalty?: number;
  blockedZonePenalty?: number;
  capacityViolationPenalty?: number;
}

interface RouteStop {
  sequence: number;
  locationCode: string;
  sku: string | null;
  x: number;
  y: number;
  legDistance: number;
  cumulativeDistance: number;
}

interface RouteData {
  orderedStops: RouteStop[];
  totalDistance: number;
  strategy: string;
}

interface ErrorInfo {
  message: string;
  type: "network" | "server" | "validation" | "unknown";
  suggestions: string[];
}

// Get API base URL and ensure HTTPS in production
const getApiBaseUrl = (): string => {
  const baseUrl = (import.meta.env.VITE_PICK_API ?? "").replace(/\/+$/, "");

  // If no env var is set, use localhost for development
  if (!baseUrl) {
    return window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
      ? "http://localhost:8080"
      : `${window.location.protocol}//${window.location.host}`;
  }

  // Ensure HTTPS in production
  if (window.location.protocol === "https:" && baseUrl.startsWith("http:")) {
    return baseUrl.replace("http:", "https:");
  }

  return baseUrl;
};

const API_BASE = getApiBaseUrl();

const RouteOptimizer: React.FC = () => {
  // Form state
  const [skus, setSkus] = useState(
    "SKU-APPLE, SKU-RICE, SKU-MILK, SKU-BREAD, SKU-PASTA"
  );
  const [strategy, setStrategy] = useState("enhanced_two_opt");
  const [startLocation, setStartLocation] = useState("R001");
  const [endLocation, setEndLocation] = useState("P001");

  const [constraints, setConstraints] = useState<RouteConstraints>({
    maxCapacity: 25,
    maxTimeMinutes: 60,
    avoidBlockedZones: true,
    allowAisleCrossing: true,
  });

  const [weights, setWeights] = useState<CostWeights>({
    distanceWeight: 1.0,
    aisleCrossingPenalty: 5.0,
    turnPenalty: 2.0,
    blockedZonePenalty: 100.0,
    capacityViolationPenalty: 50.0,
  });

  // Application state
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [highlightedStop, setHighlightedStop] = useState<number | null>(null);

  // UI state for mobile
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const parseError = (err: any): ErrorInfo => {
    let message = "An unexpected error occurred";
    let type: ErrorInfo["type"] = "unknown";
    let suggestions: string[] = [];

    if (err instanceof TypeError && err.message.includes("fetch")) {
      type = "network";
      message = "Failed to connect to the API server";
      suggestions = [
        "Check your internet connection",
        "Verify the API server is running",
        `API URL: ${API_BASE}`,
        "Try refreshing the page",
      ];
    } else if (err.message) {
      if (err.message.includes("404")) {
        type = "server";
        message = "API endpoint not found";
        suggestions = [
          "Check if the backend server is running",
          "Verify the API endpoint exists",
          `Expected endpoint: ${API_BASE}/api/optimize`,
        ];
      } else if (err.message.includes("500")) {
        type = "server";
        message = "Internal server error";
        suggestions = [
          "Check server logs for errors",
          "Try again in a moment",
          "Contact support if the problem persists",
        ];
      } else if (err.message.includes("CORS")) {
        type = "network";
        message = "Cross-origin request blocked";
        suggestions = [
          "Backend CORS configuration may be incorrect",
          "Check if the API allows requests from this domain",
          `Frontend domain: ${window.location.origin}`,
          `API domain: ${API_BASE}`,
        ];
      } else {
        message = err.message;
      }
    }

    return { message, type, suggestions };
  };

  const handleOptimize = useCallback(async () => {
    if (!skus.trim()) {
      setError({
        message: "Please enter at least one SKU",
        type: "validation",
        suggestions: [
          "Add SKU codes separated by commas",
          "Example: SKU-APPLE, SKU-RICE",
        ],
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestBody = {
        skus: skus
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        startLocationCode: startLocation || undefined,
        endLocationCode: endLocation || undefined,
        strategy,
        constraints:
          Object.keys(constraints).length > 0 ? constraints : undefined,
        weights: Object.keys(weights).length > 0 ? weights : undefined,
      };

      console.log("Making request to:", `${API_BASE}/api/optimize`);
      console.log("Request body:", requestBody);

      const response = await fetch(`${API_BASE}/api/optimize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
        mode: "cors",
        credentials: "omit",
      });

      if (!response.ok) {
        const errorText = await response
          .text()
          .catch(() => "No error details available");
        throw new Error(
          `${response.status} ${response.statusText}: ${errorText}`
        );
      }

      const data = await response.json();

      // Transform the response to match our interface
      const transformedData: RouteData = {
        orderedStops: data.orderedStops.map((stop: any, index: number) => ({
          sequence: index + 1,
          locationCode: stop.locationCode,
          sku: stop.sku,
          x: stop.x,
          y: stop.y,
          legDistance: stop.legDistance,
          cumulativeDistance: stop.cumulativeDistance,
        })),
        totalDistance: data.totalDistance,
        strategy: data.strategy,
      };

      setRouteData(transformedData);

      // Collapse bottom sheet on mobile after successful optimization
      if (isMobile) {
        setIsBottomSheetExpanded(false);
      }
    } catch (err: any) {
      console.error("Optimization failed:", err);
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }, [
    skus,
    strategy,
    startLocation,
    endLocation,
    constraints,
    weights,
    API_BASE,
    isMobile,
  ]);

  const handleExportCsv = useCallback(() => {
    if (!routeData) return;

    const headers = [
      "Sequence",
      "Location Code",
      "SKU",
      "X",
      "Y",
      "Leg Distance",
      "Cumulative Distance",
    ];
    const rows = routeData.orderedStops.map((stop) => [
      stop.sequence,
      stop.locationCode,
      stop.sku || "",
      stop.x,
      stop.y,
      stop.legDistance.toFixed(2),
      stop.cumulativeDistance.toFixed(2),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pick-route-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [routeData]);

  const handleExportPng = useCallback(() => {
    // Implementation would involve capturing the SVG and converting to PNG
    // For now, just show an alert
    alert("PNG export functionality would be implemented here");
  }, []);

  // Bottom sheet handlers
  const handleBottomSheetToggle = useCallback(() => {
    setIsBottomSheetExpanded(!isBottomSheetExpanded);
  }, [isBottomSheetExpanded]);

  const ErrorBanner = ({ error }: { error: ErrorInfo }) => (
    <div className="animate-fade-in bg-red-50 border border-red-200 rounded-lg p-4 mb-4 md:mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-red-400 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-800 mb-1">
            {error.message}
          </p>
          {error.suggestions.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-red-700 mb-1">
                Suggestions:
              </p>
              <ul className="text-xs text-red-600 space-y-1">
                {error.suggestions.map((suggestion, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button
          onClick={() => setError(null)}
          className="flex-shrink-0 p-1 rounded-md text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Dismiss error"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen-safe bg-background text-foreground overflow-x-hidden">
      <div className="mx-auto max-w-screen-xl px-4 py-6">
        {/* Header */}
        <header className="text-center mb-6 md:mb-8">
          <h1 className="text-responsive-headline font-semibold text-balance mb-2 text-primary">
            🏭 Warehouse Route Optimizer
          </h1>
          <p className="text-responsive-base text-muted-foreground text-balance">
            Find the most efficient picking routes for your warehouse
          </p>
        </header>

        {/* Error Display */}
        {error && <ErrorBanner error={error} />}

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Map Container - Mobile */}
          <div className="h-map-mobile rounded-2xl overflow-hidden bg-card shadow-lg mb-4">
            <WarehouseMap
              routeData={routeData}
              showAnimation={true}
              highlightedStop={highlightedStop}
              className="w-full h-full"
            />
          </div>

          {/* Bottom Sheet - Mobile */}
          <div
            className={`fixed inset-x-0 bottom-0 bg-card rounded-t-2xl shadow-lg transition-transform duration-300 ease-out z-50 ${
              isBottomSheetExpanded
                ? "translate-y-0"
                : "translate-y-[calc(100%-120px)]"
            }`}
            style={{ maxHeight: "80vh" }}
          >
            {/* Drag Handle */}
            <div
              className="flex justify-center py-3 drag-handle"
              onClick={handleBottomSheetToggle}
            >
              <div className="w-10 h-1 bg-muted rounded-full"></div>
            </div>

            {/* Bottom Sheet Header */}
            <div className="px-4 pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Route Controls</h2>
                <button
                  onClick={handleBottomSheetToggle}
                  className="p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-label={
                    isBottomSheetExpanded
                      ? "Collapse controls"
                      : "Expand controls"
                  }
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isBottomSheetExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div
              className="overflow-y-auto custom-scrollbar"
              style={{ maxHeight: "calc(80vh - 80px)" }}
            >
              <div className="p-4 space-y-6">
                <ControlsPanel
                  skus={skus}
                  setSkus={setSkus}
                  strategy={strategy}
                  setStrategy={setStrategy}
                  constraints={constraints}
                  setConstraints={setConstraints}
                  weights={weights}
                  setWeights={setWeights}
                  startLocation={startLocation}
                  setStartLocation={setStartLocation}
                  endLocation={endLocation}
                  setEndLocation={setEndLocation}
                  onOptimize={handleOptimize}
                  loading={loading}
                  isMobile={true}
                />

                {routeData && (
                  <MetricsPanel
                    routeData={routeData}
                    onStopHighlight={setHighlightedStop}
                    onExportCsv={handleExportCsv}
                    onExportPng={handleExportPng}
                    isMobile={true}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid md:grid-cols-[1fr_380px] gap-6">
          {/* Map Container - Desktop */}
          <div className="bg-card rounded-lg overflow-hidden shadow-lg">
            <WarehouseMap
              routeData={routeData}
              showAnimation={true}
              highlightedStop={highlightedStop}
              className="w-full"
              style={{ height: "calc(100vh - 200px)", minHeight: "600px" }}
            />
          </div>

          {/* Controls Panel - Desktop */}
          <div
            className="md:sticky md:top-6"
            style={{ height: "calc(100vh - 3rem)" }}
          >
            <div className="h-full overflow-y-auto custom-scrollbar space-y-6">
              <ControlsPanel
                skus={skus}
                setSkus={setSkus}
                strategy={strategy}
                setStrategy={setStrategy}
                constraints={constraints}
                setConstraints={setConstraints}
                weights={weights}
                setWeights={setWeights}
                startLocation={startLocation}
                setStartLocation={setStartLocation}
                endLocation={endLocation}
                setEndLocation={setEndLocation}
                onOptimize={handleOptimize}
                loading={loading}
              />

              {routeData && (
                <MetricsPanel
                  routeData={routeData}
                  onStopHighlight={setHighlightedStop}
                  onExportCsv={handleExportCsv}
                  onExportPng={handleExportPng}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteOptimizer;

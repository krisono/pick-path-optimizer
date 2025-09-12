import React, { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  optimizeRoute,
  ApiError,
  getErrorMessage,
  getErrorHint,
  BASE,
} from "../lib/api";
import { Button, Banner, Field, Select, Card } from "./ui";
import { TopNav, SideNav, BottomNav } from "./Navigation";
import WarehouseMap from "./WarehouseMap";
import MetricsPanel from "./MetricsPanel";
import ControlsPanel from "./ControlsPanel";

// Types
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

interface RouteData {
  orderedStops: Array<{
    sequence: number;
    locationCode: string;
    sku: string | null;
    x: number;
    y: number;
    legDistance: number;
    cumulativeDistance: number;
  }>;
  totalDistance: number;
  strategy: string;
  executionTimeMs?: number;
}

// Error State Component
const ErrorState: React.FC<{
  error: ApiError | Error;
  onRetry: () => void;
  onDismiss: () => void;
}> = ({ error, onRetry, onDismiss }) => {
  const message = getErrorMessage(error);
  const hint = getErrorHint(error);

  return (
    <Banner variant="destructive" dismissible onDismiss={onDismiss}>
      <div className="space-y-2">
        <p className="font-medium">Optimization Failed</p>
        <p>{message}</p>
        {hint && <p className="text-sm opacity-80">💡 {hint}</p>}
        {!BASE && (
          <p className="text-sm opacity-80">
            🔧 Set VITE_PICK_API environment variable to your API base URL.
          </p>
        )}
        <Button
          size="sm"
          variant="secondary"
          onClick={onRetry}
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    </Banner>
  );
};

// Empty State Component
const EmptyState: React.FC = () => (
  <Card className="text-center py-12">
    <div className="space-y-4">
      <div className="text-6xl">📦</div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        Ready to Optimize Routes
      </h3>
      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
        Load a warehouse layout and enter SKUs to generate the most efficient
        picking route.
      </p>
    </div>
  </Card>
);

// Main App Component
const RouteOptimizer: React.FC = () => {
  // Navigation state
  const [currentPage, setCurrentPage] = useState("Optimize");
  const [sideNavOpen, setSideNavOpen] = useState(false);

  // Optimization state
  const [skus, setSkus] = useState("SKU-APPLE, SKU-RICE, SKU-MILK");
  const [strategy, setStrategy] = useState("enhanced_two_opt");
  const [constraints, setConstraints] = useState<RouteConstraints>({
    maxCapacity: 100,
    maxTimeMinutes: 60,
    avoidBlockedZones: true,
    allowAisleCrossing: false,
  });
  const [weights, setWeights] = useState<CostWeights>({
    distanceWeight: 1.0,
    aisleCrossingPenalty: 2.0,
    turnPenalty: 1.5,
    blockedZonePenalty: 5.0,
  });
  const [startLocation, setStartLocation] = useState("RECEIVING");
  const [endLocation, setEndLocation] = useState("RECEIVING");

  // UI state
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [highlightedStop, setHighlightedStop] = useState<number | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Handlers
  const handleOptimize = useCallback(async () => {
    if (!BASE) {
      setError(new ApiError("API base URL not configured", { code: "CONFIG" }));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const skuList = skus
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (skuList.length === 0) {
        throw new Error("Please enter at least one SKU");
      }

      const result = await optimizeRoute({
        skus: skuList,
        strategy,
        constraints,
        weights,
        startLocation,
        endLocation,
      });

      setRouteData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Unknown error occurred")
      );
    } finally {
      setLoading(false);
    }
  }, [skus, strategy, constraints, weights, startLocation, endLocation]);

  const handleExportCsv = useCallback(() => {
    if (!routeData) return;

    const headers = [
      "Stop",
      "Location",
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
    const a = document.createElement("a");
    a.href = url;
    a.download = `route-${strategy}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [routeData, strategy]);

  // Mobile responsive layout
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Render different pages
  const renderPage = () => {
    switch (currentPage) {
      case "Optimize":
        return (
          <div className="h-full flex flex-col md:grid md:grid-cols-[1fr_400px] gap-6 overflow-hidden">
            {/* Map Section */}
            <div className="flex-1 min-h-0">
              {error && (
                <div className="mb-4">
                  <ErrorState
                    error={error}
                    onRetry={handleOptimize}
                    onDismiss={() => setError(null)}
                  />
                </div>
              )}

              <Card padding={false} className="h-full overflow-hidden">
                {routeData ? (
                  <WarehouseMap
                    routeData={routeData}
                    width={800}
                    height={600}
                    showAnimation={true}
                    highlightedStop={highlightedStop}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <EmptyState />
                  </div>
                )}
              </Card>
            </div>

            {/* Desktop Controls Panel */}
            <div className="hidden md:block">
              <div className="sticky top-6 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <Card>
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
                    isMobile={false}
                    onStopHover={setHighlightedStop}
                  />
                </Card>

                {routeData && (
                  <Card>
                    <MetricsPanel
                      routeData={routeData}
                      onStopHighlight={setHighlightedStop}
                      onExportCsv={handleExportCsv}
                      isMobile={false}
                    />
                  </Card>
                )}
              </div>
            </div>

            {/* Mobile Bottom Sheet */}
            <AnimatePresence>
              {isMobile && (
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{
                    y: isBottomSheetOpen ? "0%" : "calc(100% - 120px)",
                  }}
                  exit={{ y: "100%" }}
                  className="md:hidden fixed inset-x-0 bottom-16 bg-white dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700 rounded-t-2xl shadow-xl z-30 max-h-[60vh] overflow-hidden"
                >
                  {/* Drag Handle */}
                  <button
                    onClick={() => setIsBottomSheetOpen(!isBottomSheetOpen)}
                    className="w-full flex justify-center py-3 border-b border-gray-200 dark:border-gray-700"
                  >
                    <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  </button>

                  {/* Content */}
                  <div className="p-4 overflow-y-auto">
                    <div className="space-y-6">
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
                        onStopHover={setHighlightedStop}
                      />

                      {routeData && (
                        <MetricsPanel
                          routeData={routeData}
                          onStopHighlight={setHighlightedStop}
                          onExportCsv={handleExportCsv}
                          isMobile={true}
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case "Settings":
        return (
          <Card>
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <div className="space-y-4">
              <Field
                label="API Base URL"
                value={BASE || ""}
                placeholder="https://api.yourdomain.com"
                hint={`Current: ${BASE || "Not configured"}`}
                disabled
              />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure VITE_PICK_API environment variable to change the API
                base URL.
              </p>
            </div>
          </Card>
        );

      case "Docs":
        return (
          <Card>
            <h2 className="text-xl font-semibold mb-4">Documentation</h2>
            <div className="prose dark:prose-invert max-w-none">
              <h3>Quick Start</h3>
              <ol>
                <li>Enter SKUs (comma-separated)</li>
                <li>Choose optimization strategy</li>
                <li>Adjust constraints and weights</li>
                <li>Click "Optimize Route"</li>
              </ol>

              <h3>Common Errors</h3>
              <ul>
                <li>
                  <strong>Mixed content:</strong> HTTPS page calling HTTP API
                </li>
                <li>
                  <strong>CORS blocked:</strong> API server missing CORS headers
                </li>
                <li>
                  <strong>Network error:</strong> API server unreachable
                </li>
              </ul>
            </div>
          </Card>
        );

      default:
        return (
          <Card>
            <h2 className="text-xl font-semibold mb-4">{currentPage}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              This page is under development.
            </p>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      {/* Navigation */}
      <TopNav
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onMenuToggle={() => setSideNavOpen(!sideNavOpen)}
      />

      <div className="flex">
        <SideNav
          currentPage={currentPage}
          onNavigate={(page) => {
            setCurrentPage(page);
            setSideNavOpen(false);
          }}
          isOpen={sideNavOpen}
        />

        {/* Overlay for mobile */}
        {sideNavOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-30 top-16"
            onClick={() => setSideNavOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
          <div className="max-w-screen-xl mx-auto h-full">{renderPage()}</div>
        </main>
      </div>

      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
};

export default RouteOptimizer;

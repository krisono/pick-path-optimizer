import React, { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  optimizeRoute,
  ApiError,
  getErrorMessage,
  getErrorHint,
  BASE,
  OptimizeResponse,
} from "../lib/api";
import { Button } from "./ui";
import { Card } from "./ui";
import { Banner } from "./ui";
import { EmptyState } from "./ui";
import { BottomSheet } from "./ui";
import { Field } from "./ui";
import { TopNav, SideNav, BottomNav } from "./NavigationNew";
import { designTokens } from "../lib/design-system";
import WarehouseMap from "./WarehouseMap";
import MetricsPanel from "./MetricsPanel";
import ControlsPanel from "./ControlsPanel";

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

// Align with MetricsPanel component types
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

// ==================== ERROR STATE COMPONENT ====================

const ErrorState: React.FC<{
  error: ApiError | Error;
  onRetry: () => void;
  onDismiss: () => void;
}> = ({ error, onRetry, onDismiss }) => {
  // Handle both ApiError and regular Error types
  const message =
    error instanceof ApiError
      ? getErrorMessage(error)
      : error.message || "An unexpected error occurred";

  const hint =
    error instanceof ApiError
      ? getErrorHint(error)
      : ["Please try again or contact support if the problem persists"];

  return (
    <Banner
      variant="error"
      dismissible
      onDismiss={onDismiss}
      title="Optimization Failed"
      actions={
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      }
    >
      <div className="space-y-2">
        <p>{message}</p>
        {hint.length > 0 && <p className="text-xs opacity-75">{hint[0]}</p>}
      </div>
    </Banner>
  );
};

const MapEmptyState: React.FC = () => (
  <EmptyState
    icon={
      <svg
        className="w-12 h-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
        />
      </svg>
    }
    title="Ready to Optimize"
    description="Configure your parameters and generate an optimized picking route for your warehouse."
  />
);

// ==================== MAIN APPLICATION ====================

const PickPathOptimizerApp: React.FC = () => {
  // ==================== STATE MANAGEMENT ====================

  // Navigation state
  const [currentPage, setCurrentPage] = useState("Optimize");
  const [sideNavOpen, setSideNavOpen] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  // Form state with required defaults
  const [skus, setSkus] = useState(
    "SKU-APPLE, SKU-RICE, SKU-MILK, SKU-BREAD, SKU-PASTA"
  );
  const [strategy, setStrategy] = useState("enhanced_two_opt");
  const [constraints, setConstraints] = useState<RouteConstraints>({
    maxCapacity: 100,
    maxTimeMinutes: 60,
    avoidBlockedZones: true,
    allowAisleCrossing: false,
  });
  const [weights, setWeights] = useState<CostWeights>({
    distanceWeight: 1.0,
    aisleCrossingPenalty: 5.0,
    turnPenalty: 2.0,
    blockedZonePenalty: 100.0,
    capacityViolationPenalty: 50.0,
  });
  const [startLocation, setStartLocation] = useState("R001");
  const [endLocation, setEndLocation] = useState("P001");

  // Application state
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [error, setError] = useState<ApiError | Error | null>(null);
  const [highlightedStop, setHighlightedStop] = useState<number | null>(null);

  // Responsive state
  const [isMobile, setIsMobile] = useState(false);

  // ==================== EFFECTS ====================

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-close side nav on mobile when navigating
  useEffect(() => {
    if (isMobile) {
      setSideNavOpen(false);
    }
  }, [currentPage, isMobile]);

  const handleOptimize = useCallback(async () => {
    if (!skus.trim()) {
      setError(new Error("Please enter at least one SKU"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const skuList = skus
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      // Create API request with required fields
      const request = {
        skus: skuList,
        strategy,
        constraints: {
          maxCapacity: constraints.maxCapacity || 100,
          maxTimeMinutes: constraints.maxTimeMinutes || 60,
          avoidBlockedZones: constraints.avoidBlockedZones || false,
          allowAisleCrossing: constraints.allowAisleCrossing || false,
        },
        weights: {
          distanceWeight: weights.distanceWeight || 1.0,
          aisleCrossingPenalty: weights.aisleCrossingPenalty || 5.0,
          turnPenalty: weights.turnPenalty || 2.0,
          blockedZonePenalty: weights.blockedZonePenalty || 100.0,
          capacityViolationPenalty: weights.capacityViolationPenalty || 50.0,
        },
        startLocation,
        endLocation,
      };

      const result = await optimizeRoute(request);

      // Transform API response to component format
      const transformedData: RouteData = {
        orderedStops: result.orderedStops.map((stop, index) => ({
          sequence: index + 1,
          locationCode: stop.location,
          sku: stop.sku,
          x: 0, // Default coordinates - will be handled by WarehouseMap
          y: 0,
          legDistance: stop.legDistance,
          cumulativeDistance: stop.cumulativeDistance,
        })),
        totalDistance: result.totalDistance,
        strategy: result.strategy,
      };

      setRouteData(transformedData);

      // On mobile, close bottom sheet after successful optimization
      if (isMobile) {
        setBottomSheetOpen(false);
      }
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setLoading(false);
    }
  }, [
    skus,
    strategy,
    constraints,
    weights,
    startLocation,
    endLocation,
    isMobile,
  ]);

  const handleExportCsv = useCallback(() => {
    if (!routeData) return;

    const headers = [
      "Stop #",
      "SKU",
      "Location Code",
      "X Coordinate",
      "Y Coordinate",
      "Leg Distance",
      "Cumulative Distance",
    ];

    const rows = routeData.orderedStops.map((stop) => [
      stop.sequence.toString(),
      stop.sku || "N/A",
      stop.locationCode,
      stop.x.toString(),
      stop.y.toString(),
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

  // ==================== PAGE RENDERERS ====================

  const renderOptimizePage = () => (
    <div className="h-full flex flex-col">
      {/* Mobile Layout */}
      <div className="md:hidden flex-1 flex flex-col">
        {/* Error Display */}
        {error && (
          <div className="mb-4">
            <ErrorState
              error={error}
              onRetry={handleOptimize}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        {/* Map Section - Takes most of the screen on mobile */}
        <Card padding="none" className="flex-1 overflow-hidden">
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
              <MapEmptyState />
            </div>
          )}
        </Card>

        {/* Controls Trigger Button */}
        <div className="p-4">
          <Button
            fullWidth
            variant="primary"
            size="lg"
            onClick={() => setBottomSheetOpen(true)}
            icon={
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
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                />
              </svg>
            }
          >
            Configure Route
          </Button>
        </div>

        {/* Bottom Sheet for Mobile Controls */}
        <BottomSheet
          isOpen={bottomSheetOpen}
          onClose={() => setBottomSheetOpen(false)}
          title="Route Configuration"
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
        </BottomSheet>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex h-full gap-6">
        {/* Map Section */}
        <div className="flex-1 min-w-0 flex flex-col">
          {error && (
            <div className="mb-4">
              <ErrorState
                error={error}
                onRetry={handleOptimize}
                onDismiss={() => setError(null)}
              />
            </div>
          )}

          <Card padding="none" className="flex-1 overflow-hidden">
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
                <MapEmptyState />
              </div>
            )}
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="w-96 xl:w-[480px] flex-shrink-0">
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
      </div>
    </div>
  );

  const renderOtherPages = () => (
    <Card>
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <span className="text-2xl">🚧</span>
        </div>
        <h2 className={`${designTokens.typography.heading.h2} mb-2`}>
          {currentPage}
        </h2>
        <p className={designTokens.typography.meta.caption}>
          This section is under development. Check back soon for updates!
        </p>
      </div>
    </Card>
  );

  const renderSettings = () => (
    <Card>
      <h2 className={`${designTokens.typography.heading.h2} mb-6`}>Settings</h2>
      <div className="space-y-6">
        <Field
          label="API Base URL"
          value={BASE || ""}
          placeholder="https://api.yourdomain.com"
          hint={`Current: ${BASE || "Not configured"}`}
          disabled
        />
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
            About This Application
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Pick Path Optimizer provides intelligent warehouse route
            optimization using advanced algorithms to minimize travel time and
            distance.
          </p>
        </div>
      </div>
    </Card>
  );

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "Optimize":
        return renderOptimizePage();
      case "Settings":
        return renderSettings();
      default:
        return renderOtherPages();
    }
  };

  // ==================== RENDER ====================

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black/50 z-30 top-16"
            onClick={() => setSideNavOpen(false)}
          />
        )}

        {/* Main Content */}
        <main
          className={`
            flex-1 min-w-0 p-4 sm:p-6 lg:p-8
            ${designTokens.layout.content.main}
          `}
        >
          <div className="max-w-screen-2xl mx-auto h-full">
            {renderCurrentPage()}
          </div>
        </main>
      </div>

      <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
    </div>
  );
};

export default PickPathOptimizerApp;

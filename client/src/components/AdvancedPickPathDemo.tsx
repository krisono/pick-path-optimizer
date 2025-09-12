import React, { useState, useCallback } from "react";
import ControlsPanel from "./ControlsPanel";
import WarehouseMap from "./WarehouseMap";
import MetricsPanel from "./MetricsPanel";

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

const API = import.meta.env.VITE_PICK_API ?? "http://localhost:8080";

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
  const [error, setError] = useState<string | null>(null);
  const [highlightedStop, setHighlightedStop] = useState<number | null>(null);

  const handleOptimize = useCallback(async () => {
    if (!skus.trim()) return;

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

      const response = await fetch(`${API}/api/optimize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
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
    } catch (err: any) {
      setError(err.message);
      console.error("Optimization failed:", err);
    } finally {
      setLoading(false);
    }
  }, [skus, strategy, startLocation, endLocation, constraints, weights]);

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

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "32px",
            color: "white",
          }}
        >
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "700",
              margin: "0 0 8px 0",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            🏭 Advanced Pick-Path Optimizer
          </h1>
          <p
            style={{
              fontSize: "18px",
              margin: "0",
              opacity: 0.9,
            }}
          >
            Warehouse-aware route optimization with multi-strategy algorithms
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "20px",
              color: "#dc2626",
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Main Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "350px 1fr 400px",
            gap: "20px",
            alignItems: "start",
          }}
        >
          {/* Controls Panel */}
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

          {/* Warehouse Map */}
          <WarehouseMap
            routeData={routeData}
            width={800}
            height={600}
            showAnimation={true}
            highlightedStop={highlightedStop}
          />

          {/* Metrics Panel */}
          <MetricsPanel
            routeData={routeData}
            onStopHighlight={setHighlightedStop}
            onExportCsv={handleExportCsv}
            onExportPng={handleExportPng}
          />
        </div>

        {/* Quick Stats */}
        {routeData && (
          <div
            style={{
              marginTop: "32px",
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: "12px",
              padding: "20px",
              color: "white",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
                textAlign: "center",
              }}
            >
              <div>
                <div style={{ fontSize: "24px", fontWeight: "700" }}>
                  {routeData.totalDistance.toFixed(1)}
                </div>
                <div style={{ fontSize: "14px", opacity: 0.8 }}>
                  Total Distance (units)
                </div>
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "700" }}>
                  {routeData.orderedStops.length}
                </div>
                <div style={{ fontSize: "14px", opacity: 0.8 }}>
                  Total Stops
                </div>
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "700" }}>
                  {routeData.orderedStops.filter((s) => s.sku).length}
                </div>
                <div style={{ fontSize: "14px", opacity: 0.8 }}>
                  Pick Locations
                </div>
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "700" }}>
                  {(
                    routeData.totalDistance / 3 +
                    routeData.orderedStops.filter((s) => s.sku).length * 0.5
                  ).toFixed(1)}
                </div>
                <div style={{ fontSize: "14px", opacity: 0.8 }}>
                  Est. Time (minutes)
                </div>
              </div>
              <div>
                <div style={{ fontSize: "24px", fontWeight: "700" }}>
                  {routeData.strategy
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </div>
                <div style={{ fontSize: "14px", opacity: 0.8 }}>
                  Strategy Used
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            marginTop: "40px",
            textAlign: "center",
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "14px",
          }}
        >
          <p>
            Built with React, TypeScript, and advanced optimization algorithms •
            <a
              href="/api/health"
              target="_blank"
              style={{ color: "rgba(255, 255, 255, 0.9)", marginLeft: "8px" }}
            >
              API Health Check
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RouteOptimizer;

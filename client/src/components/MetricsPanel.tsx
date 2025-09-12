import React, { useState } from "react";

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

interface MetricsPanelProps {
  routeData: RouteData | null;
  onStopHighlight?: (stopIndex: number | null) => void;
  onExportCsv?: () => void;
  onExportPng?: () => void;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({
  routeData,
  onStopHighlight,
  onExportCsv,
  onExportPng,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "details">(
    "overview"
  );

  if (!routeData?.orderedStops?.length) {
    return (
      <div
        style={{
          background: "white",
          borderRadius: "8px",
          padding: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#6b7280",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📊</div>
          <p>Run an optimization to see metrics</p>
        </div>
      </div>
    );
  }

  const metrics = calculateMetrics(routeData);

  return (
    <div
      style={{
        background: "white",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: "600",
            color: "#1f2937",
          }}
        >
          Route Metrics
        </h3>

        <div style={{ display: "flex", gap: "8px" }}>
          {onExportCsv && (
            <button
              onClick={onExportCsv}
              style={{
                padding: "6px 12px",
                background: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              📄 CSV
            </button>
          )}
          {onExportPng && (
            <button
              onClick={onExportPng}
              style={{
                padding: "6px 12px",
                background: "#f3f4f6",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              🖼️ PNG
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #e5e7eb",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "8px 16px",
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "overview"
                ? "2px solid #3b82f6"
                : "2px solid transparent",
            color: activeTab === "overview" ? "#3b82f6" : "#6b7280",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("details")}
          style={{
            padding: "8px 16px",
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "details"
                ? "2px solid #3b82f6"
                : "2px solid transparent",
            color: activeTab === "details" ? "#3b82f6" : "#6b7280",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Stop Details
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" ? (
        <OverviewTab metrics={metrics} routeData={routeData} />
      ) : (
        <DetailsTab routeData={routeData} onStopHighlight={onStopHighlight} />
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ metrics: any; routeData: RouteData }> = ({
  metrics,
  routeData,
}) => (
  <div>
    {/* Key Metrics Cards */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: "16px",
        marginBottom: "24px",
      }}
    >
      <MetricCard
        title="Total Distance"
        value={`${routeData.totalDistance.toFixed(1)} units`}
        icon="📏"
        color="#3b82f6"
      />
      <MetricCard
        title="Total Stops"
        value={routeData.orderedStops.length.toString()}
        icon="📍"
        color="#10b981"
      />
      <MetricCard
        title="Picking Stops"
        value={metrics.pickingStops.toString()}
        icon="📦"
        color="#f59e0b"
      />
      <MetricCard
        title="Est. Time"
        value={`${metrics.estimatedTime.toFixed(1)} min`}
        icon="⏱️"
        color="#8b5cf6"
      />
    </div>

    {/* Efficiency Metrics */}
    <div style={{ marginBottom: "24px" }}>
      <h4
        style={{
          margin: "0 0 12px 0",
          fontSize: "14px",
          fontWeight: "600",
          color: "#374151",
        }}
      >
        Efficiency Analysis
      </h4>
      <div style={{ display: "grid", gap: "12px" }}>
        <EfficiencyBar
          label="Route Efficiency"
          value={metrics.efficiency}
          color="#10b981"
        />
        <EfficiencyBar
          label="Distance Utilization"
          value={metrics.distanceUtilization}
          color="#3b82f6"
        />
      </div>
    </div>

    {/* Zone Analysis */}
    <div>
      <h4
        style={{
          margin: "0 0 12px 0",
          fontSize: "14px",
          fontWeight: "600",
          color: "#374151",
        }}
      >
        Zone Distribution
      </h4>
      <div style={{ fontSize: "12px", color: "#6b7280" }}>
        {Object.entries(metrics.zoneDistribution).map(([zone, count]) => (
          <div
            key={zone}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
            }}
          >
            <span>{zone}:</span>
            <span>{count as number} stops</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Details Tab Component
const DetailsTab: React.FC<{
  routeData: RouteData;
  onStopHighlight?: (index: number | null) => void;
}> = ({ routeData, onStopHighlight }) => (
  <div style={{ maxHeight: "400px", overflowY: "auto" }}>
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "40px 1fr 1fr 80px 80px",
        gap: "8px",
        padding: "8px 0",
        borderBottom: "1px solid #e5e7eb",
        fontSize: "12px",
        fontWeight: "600",
        color: "#374151",
      }}
    >
      <div>#</div>
      <div>Location</div>
      <div>SKU</div>
      <div>Leg Dist.</div>
      <div>Cum. Dist.</div>
    </div>

    {routeData.orderedStops.map((stop, index) => (
      <div
        key={index}
        onMouseEnter={() => onStopHighlight?.(index)}
        onMouseLeave={() => onStopHighlight?.(null)}
        style={{
          display: "grid",
          gridTemplateColumns: "40px 1fr 1fr 80px 80px",
          gap: "8px",
          padding: "8px 0",
          borderBottom: "1px solid #f3f4f6",
          fontSize: "12px",
          cursor: "pointer",
          transition: "background-color 0.2s",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = "#f9fafb";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
        }}
      >
        <div style={{ fontWeight: "600" }}>{stop.sequence}</div>
        <div style={{ color: "#374151" }}>{stop.locationCode}</div>
        <div
          style={{
            color: stop.sku ? "#3b82f6" : "#9ca3af",
            fontFamily: "monospace",
          }}
        >
          {stop.sku || "—"}
        </div>
        <div style={{ textAlign: "right", color: "#6b7280" }}>
          {stop.legDistance.toFixed(1)}
        </div>
        <div
          style={{ textAlign: "right", color: "#374151", fontWeight: "500" }}
        >
          {stop.cumulativeDistance.toFixed(1)}
        </div>
      </div>
    ))}
  </div>
);

// Helper Components
const MetricCard: React.FC<{
  title: string;
  value: string;
  icon: string;
  color: string;
}> = ({ title, value, icon, color }) => (
  <div
    style={{
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      padding: "16px",
      textAlign: "center",
    }}
  >
    <div style={{ fontSize: "24px", marginBottom: "8px" }}>{icon}</div>
    <div
      style={{
        fontSize: "18px",
        fontWeight: "700",
        color,
        marginBottom: "4px",
      }}
    >
      {value}
    </div>
    <div style={{ fontSize: "12px", color: "#6b7280" }}>{title}</div>
  </div>
);

const EfficiencyBar: React.FC<{
  label: string;
  value: number;
  color: string;
}> = ({ label, value, color }) => (
  <div>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "12px",
        marginBottom: "4px",
      }}
    >
      <span style={{ color: "#374151" }}>{label}</span>
      <span style={{ color: "#6b7280" }}>{(value * 100).toFixed(1)}%</span>
    </div>
    <div
      style={{
        width: "100%",
        height: "6px",
        background: "#e5e7eb",
        borderRadius: "3px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${value * 100}%`,
          height: "100%",
          background: color,
          transition: "width 0.3s ease",
        }}
      />
    </div>
  </div>
);

// Helper function to calculate metrics
function calculateMetrics(routeData: RouteData) {
  const pickingStops = routeData.orderedStops.filter((stop) => stop.sku).length;
  const estimatedTime = routeData.totalDistance / 3 + pickingStops * 0.5; // 3 units/min walking, 0.5 min/pick

  // Calculate efficiency (simplified)
  const directDistance =
    routeData.orderedStops.length > 1
      ? Math.sqrt(
          Math.pow(
            routeData.orderedStops[routeData.orderedStops.length - 1].x -
              routeData.orderedStops[0].x,
            2
          ) +
            Math.pow(
              routeData.orderedStops[routeData.orderedStops.length - 1].y -
                routeData.orderedStops[0].y,
              2
            )
        )
      : routeData.totalDistance;

  const efficiency = Math.min(
    1,
    directDistance / (routeData.totalDistance || 1)
  );
  const distanceUtilization =
    pickingStops / (routeData.totalDistance / 10 || 1); // Picks per 10 units

  // Zone distribution
  const zoneDistribution: Record<string, number> = {};
  routeData.orderedStops.forEach((stop) => {
    if (stop.sku) {
      // Only count picking stops
      const zone = stop.locationCode.charAt(0); // Simplified zone extraction
      zoneDistribution[`Zone ${zone}`] =
        (zoneDistribution[`Zone ${zone}`] || 0) + 1;
    }
  });

  return {
    pickingStops,
    estimatedTime,
    efficiency,
    distanceUtilization: Math.min(1, distanceUtilization),
    zoneDistribution,
  };
}

export default MetricsPanel;

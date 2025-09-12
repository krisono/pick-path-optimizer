import React, { useMemo, useRef, useEffect, useState } from "react";

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

interface WarehouseMapProps {
  routeData: RouteData | null;
  width?: number;
  height?: number;
  showAnimation?: boolean;
  highlightedStop?: number;
}

const WarehouseMap: React.FC<WarehouseMapProps> = ({
  routeData,
  width = 800,
  height = 600,
  showAnimation = true,
  highlightedStop,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const viewBox = useMemo(() => {
    if (!routeData?.orderedStops?.length) {
      return { minX: -10, minY: -10, maxX: 200, maxY: 180 };
    }

    const xs = routeData.orderedStops.map((s) => s.x).concat([0]);
    const ys = routeData.orderedStops.map((s) => s.y).concat([0]);
    const minX = Math.min(...xs) - 20;
    const maxX = Math.max(...xs) + 20;
    const minY = Math.min(...ys) - 20;
    const maxY = Math.max(...ys) + 20;

    return { minX, minY, maxX, maxY };
  }, [routeData]);

  const warehouseZones = useMemo(
    () => [
      {
        name: "Receiving",
        x: 0,
        y: 0,
        width: 20,
        height: 30,
        color: "#fef3c7",
      },
      {
        name: "Aisle A (Grocery)",
        x: 30,
        y: 10,
        width: 100,
        height: 10,
        color: "#dbeafe",
      },
      {
        name: "Aisle B (Frozen)",
        x: 30,
        y: 35,
        width: 80,
        height: 10,
        color: "#e0e7ff",
      },
      {
        name: "Aisle C (Produce)",
        x: 30,
        y: 60,
        width: 60,
        height: 10,
        color: "#dcfce7",
      },
      {
        name: "Aisle D (Dairy)",
        x: 30,
        y: 85,
        width: 80,
        height: 10,
        color: "#fef7cd",
      },
      {
        name: "Aisle E (Bakery)",
        x: 30,
        y: 110,
        width: 60,
        height: 10,
        color: "#fed7d7",
      },
      {
        name: "Aisle F (Household)",
        x: 30,
        y: 135,
        width: 100,
        height: 10,
        color: "#f3e8ff",
      },
      {
        name: "Packing",
        x: 150,
        y: 0,
        width: 30,
        height: 50,
        color: "#fde68a",
      },
      {
        name: "Shipping",
        x: 150,
        y: 60,
        width: 30,
        height: 100,
        color: "#fed7aa",
      },
    ],
    []
  );

  // Animation effect
  useEffect(() => {
    if (!showAnimation || !routeData?.orderedStops?.length) return;

    setIsAnimating(true);
    setAnimationProgress(0);

    const duration = 3000; // 3 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setAnimationProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [routeData, showAnimation]);

  const getPathData = (stops: RouteStop[], progress: number = 1) => {
    if (!stops.length) return "";

    const totalStops = stops.length;
    const currentStop = Math.floor(progress * (totalStops - 1));
    const segmentProgress = (progress * (totalStops - 1)) % 1;

    let path = `M ${stops[0].x} ${stops[0].y}`;

    for (let i = 1; i <= currentStop; i++) {
      path += ` L ${stops[i].x} ${stops[i].y}`;
    }

    // Add partial segment for animation
    if (currentStop < totalStops - 1 && segmentProgress > 0) {
      const current = stops[currentStop];
      const next = stops[currentStop + 1];
      const x = current.x + (next.x - current.x) * segmentProgress;
      const y = current.y + (next.y - current.y) * segmentProgress;
      path += ` L ${x} ${y}`;
    }

    return path;
  };

  const currentAnimationProgress = isAnimating ? animationProgress : 1;

  return (
    <div
      style={{
        position: "relative",
        background: "white",
        borderRadius: "8px",
        padding: "16px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
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
          Warehouse Layout & Route
        </h3>
        {routeData && (
          <div style={{ fontSize: "14px", color: "#6b7280" }}>
            Strategy: {routeData.strategy} | Distance:{" "}
            {routeData.totalDistance.toFixed(1)} units
          </div>
        )}
      </div>

      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`${viewBox.minX} ${viewBox.minY} ${
          viewBox.maxX - viewBox.minX
        } ${viewBox.maxY - viewBox.minY}`}
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "4px",
          background: "#f9fafb",
        }}
      >
        {/* Grid lines */}
        <defs>
          <pattern
            id="grid"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="0.5"
            />
          </pattern>
          <filter id="drop-shadow">
            <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.3" />
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Warehouse zones */}
        {warehouseZones.map((zone, index) => (
          <g key={index}>
            <rect
              x={zone.x}
              y={zone.y}
              width={zone.width}
              height={zone.height}
              fill={zone.color}
              stroke="#9ca3af"
              strokeWidth="1"
              rx="2"
            />
            <text
              x={zone.x + zone.width / 2}
              y={zone.y + zone.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="8"
              fill="#374151"
              fontWeight="500"
            >
              {zone.name}
            </text>
          </g>
        ))}

        {/* Route path */}
        {routeData?.orderedStops && (
          <g>
            {/* Full route (lighter) */}
            <path
              d={getPathData(routeData.orderedStops, 1)}
              fill="none"
              stroke="#d1d5db"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Animated route (highlighted) */}
            <path
              d={getPathData(routeData.orderedStops, currentAnimationProgress)}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              filter="url(#drop-shadow)"
            />

            {/* Route stops */}
            {routeData.orderedStops.map((stop, index) => {
              const isVisible =
                index <=
                currentAnimationProgress * (routeData.orderedStops.length - 1);
              const isHighlighted = highlightedStop === index;
              const isStart = index === 0;
              const isEnd = index === routeData.orderedStops.length - 1;

              return (
                <g key={index} style={{ opacity: isVisible ? 1 : 0.3 }}>
                  <circle
                    cx={stop.x}
                    cy={stop.y}
                    r={isHighlighted ? 8 : 6}
                    fill={
                      isStart
                        ? "#10b981"
                        : isEnd
                        ? "#ef4444"
                        : stop.sku
                        ? "#3b82f6"
                        : "#6b7280"
                    }
                    stroke="white"
                    strokeWidth="2"
                    filter="url(#drop-shadow)"
                  />

                  {/* Stop number */}
                  <text
                    x={stop.x}
                    y={stop.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="8"
                    fill="white"
                    fontWeight="bold"
                  >
                    {isStart ? "S" : isEnd ? "E" : index}
                  </text>

                  {/* Location label */}
                  <text
                    x={stop.x}
                    y={stop.y - 12}
                    textAnchor="middle"
                    fontSize="7"
                    fill="#374151"
                    fontWeight="500"
                  >
                    {stop.locationCode}
                  </text>

                  {/* SKU label */}
                  {stop.sku && (
                    <text
                      x={stop.x}
                      y={stop.y + 18}
                      textAnchor="middle"
                      fontSize="6"
                      fill="#6b7280"
                    >
                      {stop.sku}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Animated picker position */}
            {isAnimating && routeData.orderedStops.length > 1 && (
              <AnimatedPicker
                stops={routeData.orderedStops}
                progress={animationProgress}
              />
            )}
          </g>
        )}
      </svg>

      {/* Legend */}
      <div
        style={{
          marginTop: "16px",
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          fontSize: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: "#10b981",
              borderRadius: "50%",
            }}
          ></div>
          <span>Start</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: "#3b82f6",
              borderRadius: "50%",
            }}
          ></div>
          <span>Pick Location</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: "#ef4444",
              borderRadius: "50%",
            }}
          ></div>
          <span>End</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{ width: "16px", height: "2px", backgroundColor: "#3b82f6" }}
          ></div>
          <span>Optimized Route</span>
        </div>
      </div>
    </div>
  );
};

// Animated picker component
const AnimatedPicker: React.FC<{ stops: RouteStop[]; progress: number }> = ({
  stops,
  progress,
}) => {
  const totalStops = stops.length;
  const currentStopIndex = Math.floor(progress * (totalStops - 1));
  const segmentProgress = (progress * (totalStops - 1)) % 1;

  if (currentStopIndex >= totalStops - 1) return null;

  const current = stops[currentStopIndex];
  const next = stops[currentStopIndex + 1];
  const x = current.x + (next.x - current.x) * segmentProgress;
  const y = current.y + (next.y - current.y) * segmentProgress;

  return (
    <g>
      <circle cx={x} cy={y} r="4" fill="#f59e0b" stroke="white" strokeWidth="1">
        <animate
          attributeName="r"
          values="4;6;4"
          dur="1s"
          repeatCount="indefinite"
        />
      </circle>
      <text
        x={x}
        y={y - 10}
        textAnchor="middle"
        fontSize="8"
        fill="#f59e0b"
        fontWeight="bold"
      >
        📦
      </text>
    </g>
  );
};

export default WarehouseMap;

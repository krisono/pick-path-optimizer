import React, { useState, useCallback } from "react";

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

interface ControlsPanelProps {
  skus: string;
  setSkus: (skus: string) => void;
  strategy: string;
  setStrategy: (strategy: string) => void;
  constraints: RouteConstraints;
  setConstraints: (constraints: RouteConstraints) => void;
  weights: CostWeights;
  setWeights: (weights: CostWeights) => void;
  startLocation: string;
  setStartLocation: (location: string) => void;
  endLocation: string;
  setEndLocation: (location: string) => void;
  isMobile?: boolean;
  onStopHover?: (stopIndex: number | null) => void;
  onOptimize: () => void;
  loading: boolean;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  skus,
  setSkus,
  strategy,
  setStrategy,
  constraints,
  setConstraints,
  weights,
  setWeights,
  startLocation,
  setStartLocation,
  endLocation,
  setEndLocation,
  onOptimize,
  loading,
  isMobile = false,
  onStopHover,
}) => {
  const strategies = [
    {
      id: "nearest_neighbor",
      name: "Nearest Neighbor",
      description: "Fast greedy algorithm",
    },
    {
      id: "enhanced_two_opt",
      name: "Enhanced 2-Opt",
      description: "Balanced performance",
    },
    { id: "or_opt", name: "Or-Opt", description: "Advanced local search" },
    {
      id: "hybrid",
      name: "Hybrid Multi-Strategy",
      description: "Best of all approaches",
    },
  ];

  const updateConstraints = useCallback(
    (key: keyof RouteConstraints, value: any) => {
      setConstraints({ ...constraints, [key]: value });
    },
    [constraints, setConstraints]
  );

  const updateWeights = useCallback(
    (key: keyof CostWeights, value: number) => {
      setWeights({ ...weights, [key]: value });
    },
    [weights, setWeights]
  );

  return (
    <div className="controls-panel">
      <div className="panel-section">
        <h3>Order Configuration</h3>

        <div className="form-group">
          <label htmlFor="skus">SKU List (comma-separated):</label>
          <textarea
            id="skus"
            value={skus}
            onChange={(e) => setSkus(e.target.value)}
            placeholder="SKU-APPLE, SKU-RICE, SKU-MILK, SKU-BREAD"
            rows={3}
            className="form-control"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startLocation">Start Location:</label>
            <input
              type="text"
              id="startLocation"
              value={startLocation}
              onChange={(e) => setStartLocation(e.target.value)}
              placeholder="e.g., R001"
              className="form-control"
            />
          </div>
          <div className="form-group">
            <label htmlFor="endLocation">End Location:</label>
            <input
              type="text"
              id="endLocation"
              value={endLocation}
              onChange={(e) => setEndLocation(e.target.value)}
              placeholder="e.g., P001"
              className="form-control"
            />
          </div>
        </div>
      </div>

      <div className="panel-section">
        <h3>Optimization Strategy</h3>

        <div className="form-group">
          <label htmlFor="strategy">Algorithm:</label>
          <select
            id="strategy"
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="form-control"
          >
            {strategies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <small className="form-text">
            {strategies.find((s) => s.id === strategy)?.description}
          </small>
        </div>
      </div>

      <div className="panel-section">
        <h3>Constraints</h3>

        <div className="form-group">
          <label htmlFor="maxCapacity">Max Capacity (items):</label>
          <input
            type="number"
            id="maxCapacity"
            value={constraints.maxCapacity || ""}
            onChange={(e) =>
              updateConstraints(
                "maxCapacity",
                parseInt(e.target.value) || undefined
              )
            }
            min="1"
            max="100"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="maxTime">Max Time (minutes):</label>
          <input
            type="number"
            id="maxTime"
            value={constraints.maxTimeMinutes || ""}
            onChange={(e) =>
              updateConstraints(
                "maxTimeMinutes",
                parseInt(e.target.value) || undefined
              )
            }
            min="1"
            max="240"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={constraints.avoidBlockedZones ?? true}
              onChange={(e) =>
                updateConstraints("avoidBlockedZones", e.target.checked)
              }
            />
            Avoid Blocked Zones
          </label>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={constraints.allowAisleCrossing ?? true}
              onChange={(e) =>
                updateConstraints("allowAisleCrossing", e.target.checked)
              }
            />
            Allow Aisle Crossing
          </label>
        </div>
      </div>

      <div className="panel-section">
        <h3>Cost Weights</h3>

        <div className="form-group">
          <label htmlFor="distanceWeight">
            Distance Weight: {(weights.distanceWeight || 1.0).toFixed(1)}
          </label>
          <input
            type="range"
            id="distanceWeight"
            min="0.1"
            max="5.0"
            step="0.1"
            value={weights.distanceWeight || 1.0}
            onChange={(e) =>
              updateWeights("distanceWeight", parseFloat(e.target.value))
            }
            className="form-slider"
          />
        </div>

        <div className="form-group">
          <label htmlFor="aisleCrossing">
            Aisle Crossing Penalty:{" "}
            {(weights.aisleCrossingPenalty || 5.0).toFixed(1)}
          </label>
          <input
            type="range"
            id="aisleCrossing"
            min="0"
            max="20"
            step="0.5"
            value={weights.aisleCrossingPenalty || 5.0}
            onChange={(e) =>
              updateWeights("aisleCrossingPenalty", parseFloat(e.target.value))
            }
            className="form-slider"
          />
        </div>

        <div className="form-group">
          <label htmlFor="turnPenalty">
            Turn Penalty: {(weights.turnPenalty || 2.0).toFixed(1)}
          </label>
          <input
            type="range"
            id="turnPenalty"
            min="0"
            max="10"
            step="0.5"
            value={weights.turnPenalty || 2.0}
            onChange={(e) =>
              updateWeights("turnPenalty", parseFloat(e.target.value))
            }
            className="form-slider"
          />
        </div>
      </div>

      <div className="panel-section">
        <button
          onClick={onOptimize}
          disabled={loading || !skus.trim()}
          className={`optimize-button ${loading ? "loading" : ""}`}
        >
          {loading ? "Optimizing..." : "Optimize Route"}
        </button>
      </div>
    </div>
  );
};

export default ControlsPanel;

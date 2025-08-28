import { useMemo, useState, ChangeEvent } from "react";

type Stop = {
  locationCode: string;
  x: number;
  y: number;
  sku: string | null;
  legDistance: number;
  cumulativeDistance: number;
};
type Resp = { orderedStops: Stop[]; totalDistance: number; strategy: string };

/// <reference types="vite/client" />

interface ImportMetaEnv extends Readonly<Record<string, string>> {
  readonly VITE_PICK_API: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

const API = import.meta.env.VITE_PICK_API ?? "http://localhost:8080";

export default function PickPathDemo() {
  const [skus, setSkus] = useState("SKU-APPLE, SKU-RICE, SKU-MILK, SKU-BREAD");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Resp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setErr(null);
    try {
      const body = {
        skus: skus
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = await fetch(`${API}/api/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      setData(await res.json());
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  const box = useMemo(() => {
    if (!data?.orderedStops?.length)
      return { minX: -5, minY: -5, maxX: 120, maxY: 120 };
    const xs = data.orderedStops.map((s) => s.x).concat([0]);
    const ys = data.orderedStops.map((s) => s.y).concat([0]);
    const minX = Math.min(...xs) - 10,
      maxX = Math.max(...xs) + 10;
    const minY = Math.min(...ys) - 10,
      maxY = Math.max(...ys) + 10;
    return { minX, minY, maxX, maxY };
  }, [data]);

  return (
    <div
      style={{
        padding: 16,
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        maxWidth: 1000,
        margin: "24px auto",
      }}
    >
      <h3 style={{ marginBottom: 12 }}>Pick-Path Optimizer Demo</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={skus}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setSkus(e.target.value)
          }
          style={{
            flex: 1,
            padding: 8,
            border: "1px solid #e5e7eb",
            borderRadius: 8,
          }}
        />
        <button
          onClick={run}
          disabled={loading}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: "#4f46e5",
            color: "#fff",
            border: "none",
          }}
        >
          {loading ? "Optimizing…" : "Optimize"}
        </button>
      </div>
      {err && <p style={{ color: "#dc2626" }}>Error: {err}</p>}
      {data && (
        <div
          style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}
        >
          <div style={{ overflow: "auto" }}>
            <table
              style={{
                width: "100%",
                fontSize: 14,
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #e5e7eb",
                      padding: "6px",
                    }}
                  >
                    #
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #e5e7eb",
                      padding: "6px",
                    }}
                  >
                    Location
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #e5e7eb",
                      padding: "6px",
                    }}
                  >
                    SKU
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #e5e7eb",
                      padding: "6px",
                    }}
                  >
                    Leg
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      borderBottom: "1px solid #e5e7eb",
                      padding: "6px",
                    }}
                  >
                    Cumulative
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.orderedStops.map((s, i) => (
                  <tr key={i}>
                    <td style={{ padding: "6px" }}>{i + 1}</td>
                    <td style={{ padding: "6px" }}>{s.locationCode}</td>
                    <td style={{ padding: "6px" }}>{s.sku ?? "\u2014"}</td>
                    <td style={{ padding: "6px" }}>
                      {s.legDistance.toFixed(0)}
                    </td>
                    <td style={{ padding: "6px" }}>
                      {s.cumulativeDistance.toFixed(0)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5} style={{ paddingTop: 6, fontWeight: 600 }}>
                    Total: {Math.round(data.totalDistance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <svg
              viewBox={`${box.minX} ${box.minY} ${box.maxX - box.minX} ${
                box.maxY - box.minY
              }`}
              style={{ width: "100%", height: 300 }}
              shapeRendering="crispEdges"
            >
              <g stroke="#e5e7eb" strokeWidth="0.5">
                {Array.from({ length: 14 }).map((_, i) => (
                  <line
                    key={`v${i}`}
                    x1={i * 10}
                    y1={box.minY}
                    x2={i * 10}
                    y2={box.maxY}
                  />
                ))}
                {Array.from({ length: 14 }).map((_, i) => (
                  <line
                    key={`h${i}`}
                    x1={box.minX}
                    y1={i * 10}
                    x2={box.maxX}
                    y2={i * 10}
                  />
                ))}
              </g>
              {data.orderedStops.length > 0 && (
                <polyline
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  points={`0,0 ${data.orderedStops
                    .map((s) => `${s.x},${s.y}`)
                    .join(" ")}`}
                />
              )}
              <circle cx={0} cy={0} r={2.5} fill="#10b981" />
              {data.orderedStops.map((s, i) => (
                <g key={i}>
                  <circle cx={s.x} cy={s.y} r={2.5} fill="#f59e0b" />
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

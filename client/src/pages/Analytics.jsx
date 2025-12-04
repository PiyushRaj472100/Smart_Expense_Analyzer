import { useEffect, useState } from "react";
import {
  getDailyInsights,
  getMonthlyInsights,
  getYearlyInsights,
  getCategoryInsights,
} from "../services/insightsService";

import { Line, Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";

const METHODS = [
  { value: "ALL", label: "All Payments" },
  { value: "PHONEPE", label: "PhonePe" },
  { value: "GOOGLE_PAY", label: "Google Pay" },
  { value: "PAYTM", label: "Paytm" },
  { value: "UPI_OTHER", label: "Other UPI" },
  { value: "OTHER", label: "Other (Cash/Card)" },
];

export default function Analytics() {
  const [tab, setTab] = useState("daily");
  const [method, setMethod] = useState("ALL");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSmart, setShowSmart] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found");
      return;
    }

    setLoading(true);
    setError("");

    let fn;
    if (tab === "daily") fn = getDailyInsights;
    if (tab === "monthly") fn = getMonthlyInsights;
    if (tab === "yearly") fn = getYearlyInsights;
    if (tab === "category") fn = getCategoryInsights;

    fn(token, method)
      .then((res) => {
        setData(res.data);
      })
      .catch(() => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [tab, method]);

  const hasSeries = data && Array.isArray(data.series) && data.series.length > 0;

  // For CATEGORY tab, derive a filtered series based on the dropdown
  const categorySeries =
    tab === "category" && hasSeries
      ? selectedCategory === "ALL"
        ? data.series
        : data.series.filter((c) => c.category === selectedCategory)
      : [];

  // ----- SMART ANALYTICS TEXT -----
  let aiHeadline = "";
  let aiBullets = [];

  if (hasSeries) {
    if (tab === "category") {
      const baseSeries = categorySeries.length ? categorySeries : data.series;
      const sorted = [...baseSeries].sort((a, b) => b.total - a.total);
      const top = sorted[0];
      const total = baseSeries.reduce((s, x) => s + x.total, 0);

      aiHeadline = `Spending by category for ${
        method === "ALL" ? "all payments" : method
      }${
        selectedCategory !== "ALL" && top
          ? ` (focused on ${selectedCategory})`
          : ""
      }.`;

      if (top && typeof top.total === "number") {
  const totalValue = Number(top.total) || 0;

  aiBullets.push(
    `You spent about ₹${totalValue.toFixed(0)} in ${top.category} in this range.`
  );

  const share = total ? (totalValue / total) * 100 : 0;
  aiBullets.push(
    `${top.category} accounts for roughly ${share.toFixed(
      1
    )}% of your tracked spend across shown categories.`
  );
}
    } else {
      const sorted = [...data.series].sort((a, b) => b.value - a.value);
      const top = sorted[0];
      aiHeadline = `Trend for ${tab} view using ${
        method === "ALL" ? "all payments" : method
      }.`;

      if (top)if (top && typeof top.value === "number") {
  const topValue = Number(top.value) || 0;
  aiBullets.push(
    `Highest point in this view is ₹${topValue.toFixed(0)} on ${top.label}.`
  );
}

      if (sorted.length >= 2) {
        const first = sorted[sorted.length - 1];
        const last = sorted[0];
        const diff = last.value - first.value;

        if (diff > 0) {
          aiBullets.push("Overall, spending is trending up in this range.");
        } else if (diff < 0) {
          aiBullets.push("Overall, spending is trending down in this range.");
        } else {
          aiBullets.push("Spending is fairly flat across this range.");
        }
      }
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Analytics
          </h1>
          <p className="text-sm text-white/60 mt-2 max-w-xl">
            Switch between daily, monthly, yearly and category views to
            understand where your spending spikes.
          </p>
        </div>
      </header>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-3 flex-wrap">
          {["daily", "monthly", "yearly", "category"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                if (t !== "category") {
                  setSelectedCategory("ALL");
                }
              }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                tab === t
                  ? "bg-purple-600 shadow-lg"
                  : "bg-purple-400/30 hover:bg-purple-500/60"
              }`}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="glass-card px-4 py-2 flex items-center gap-3">
            <span className="text-sm text-white/70">Payment Source</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="bg-transparent border border-purple-400/60 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {METHODS.map((m) => (
                <option
                  key={m.value}
                  value={m.value}
                  className="bg-slate-900"
                >
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {tab === "category" && hasSeries && (
            <div className="glass-card px-4 py-2 flex items-center gap-3">
              <span className="text-sm text-white/70">Category</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent border border-emerald-400/60 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL" className="bg-slate-900">
                  All
                </option>
                {data.series.map((c) => (
                  <option
                    key={c.category}
                    value={c.category}
                    className="bg-slate-900"
                  >
                    {c.category}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowSmart((v) => !v)}
            className="glass-btn text-xs whitespace-nowrap px-4 py-2 flex items-center justify-center gap-2"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {showSmart ? "Hide smart analytics" : "Smart analytics"}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] gap-6 items-start">
        {/* MAIN CHART */}
        <div className="glass-card p-6 min-h-[260px] space-y-5">
          {loading && <p className="text-white/60">Loading...</p>}
          {!loading && error && (
            <p className="text-red-400">{error}</p>
          )}
          {!loading && !error && !hasSeries && (
            <p className="text-white/60">
              No data available for this range.
            </p>
          )}

          {/* Single clear chart per view */}
          {!loading && !error && hasSeries && tab !== "category" && (
            <Line
              data={{
                labels: data.series.map((x) => x.label),
                datasets: [
                  {
                    label: tab.toUpperCase() + " EXPENSES",
                    data: data.series.map((x) => x.value),
                    borderColor: "#a855f7",
                    backgroundColor: "rgba(168,85,247,0.25)",
                    tension: 0.35,
                    fill: true,
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: { display: true, labels: { color: "#e5e7eb" } },
                },
                scales: {
                  x: { ticks: { color: "#9ca3af" }, grid: { color: "rgba(148,163,184,0.2)" } },
                  y: { ticks: { color: "#9ca3af" }, grid: { color: "rgba(148,163,184,0.2)" } },
                },
              }}
            />
          )}

          {!loading && !error && hasSeries && tab === "category" && (
            <Pie
              data={{
                labels: categorySeries.map((x) => x.category),
                datasets: [
                  {
                    data: categorySeries.map((x) => x.total),
                    backgroundColor: [
                      "#6366f1",
                      "#ec4899",
                      "#f97316",
                      "#22c55e",
                      "#06b6d4",
                      "#eab308",
                    ],
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    position: "bottom",
                    labels: { color: "#e5e7eb" },
                  },
                },
              }}
            />
          )}
        </div>

        {/* Snapshot + Smart analytics */}
        <div className="space-y-4">
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold">Snapshot</h2>
            {!loading && hasSeries && tab !== "category" && (
              <Bar
                data={{
                  labels: data.series.map((x) => x.label),
                  datasets: [
                    {
                      label: "Amount",
                      data: data.series.map((x) => x.value),
                      backgroundColor: "rgba(56,189,248,0.6)",
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: { labels: { color: "#e5e7eb" } },
                  },
                  scales: {
                    x: { ticks: { color: "#9ca3af" } },
                    y: { ticks: { color: "#9ca3af" } },
                  },
                }}
              />
            )}
            {!loading && hasSeries && tab === "category" && (
              <ul className="space-y-2 text-sm">
                {categorySeries.map((c) => (
                  <li key={c.category} className="flex justify-between">
                    <span>{c.category}</span>
                    <span className="font-semibold">₹{c.total}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {showSmart && (
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold">Smart analytics</h3>
                  <p className="text-[11px] text-white/60 mt-0.5">
                    Insights generated from the visualizations above.
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-200 border border-emerald-400/50">
                  AI assist
                </span>
              </div>

              {!loading && hasSeries && aiHeadline && (
                <>
                  <p className="text-xs text-white/70">{aiHeadline}</p>
                  <ul className="mt-1 space-y-1.5 text-xs text-white/80 list-disc list-inside">
                    {aiBullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </>
              )}
              {!loading && !hasSeries && (
                <p className="text-xs text-white/60">
                  Not enough data yet for insights.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
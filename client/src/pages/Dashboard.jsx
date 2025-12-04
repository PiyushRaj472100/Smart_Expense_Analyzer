import { useEffect, useState } from "react";
import { getDashboard } from "../services/dashboardService";
import { getInsightsSummary } from "../services/insightsService";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No token found");
      return;
    }

    getDashboard(token)
      .then((res) => {
        setStats(res.data);
      })
      .catch(() => {
        setError("Failed to load dashboard");
      });

    getInsightsSummary(token)
      .then((res) => setInsights(res.data))
      .catch(() => {/* fail silently for insights */});
  }, []);

  // ---------------- LOADING ----------------
  if (!stats && !error) {
    return (
      <div className="text-white text-3xl flex justify-center mt-40">
        Loading Dashboard...
      </div>
    );
  }

  // ---------------- ERROR ----------------
  if (error) {
    return (
      <div className="text-red-400 text-2xl text-center mt-40">
        {error}
      </div>
    );
  }

  // fallback safe arrays
  const lastFive = stats?.lastFive || [];
  const categoryTotals = stats?.categoryTotals || [];

  return (
    <div className="space-y-10">

      {/* ================= HEADER ================= */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-white/60 mt-2">
            A quick snapshot of your spending and the latest AI insights.
          </p>
        </div>
      </header>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

        <div className="glass-card text-left p-5 transition-transform duration-200 hover:-translate-y-1 hover:bg-white/15">
          <p className="text-xs uppercase tracking-wide text-white/50 mb-1">Today</p>
          <h2 className="text-sm font-medium text-white/80">Daily Expense</h2>
          <p className="text-3xl font-semibold mt-3">
            ₹{stats?.dailyTotal ?? 0}
          </p>
        </div>

        <div className="glass-card text-left p-5 transition-transform duration-200 hover:-translate-y-1 hover:bg-white/15">
          <p className="text-xs uppercase tracking-wide text-white/50 mb-1">This month</p>
          <h2 className="text-sm font-medium text-white/80">Monthly Expense</h2>
          <p className="text-3xl font-semibold mt-3">
            ₹{stats?.monthlyTotal ?? 0}
          </p>
        </div>

        <div className="glass-card text-left p-5 transition-transform duration-200 hover:-translate-y-1 hover:bg-white/15">
          <p className="text-xs uppercase tracking-wide text-white/50 mb-1">This year</p>
          <h2 className="text-sm font-medium text-white/80">Yearly Expense</h2>
          <p className="text-3xl font-semibold mt-3">
            ₹{stats?.yearlyTotal ?? 0}
          </p>
        </div>

        <div className="glass-card text-left p-5 transition-transform duration-200 hover:-translate-y-1 hover:bg-white/15">
          <p className="text-xs uppercase tracking-wide text-white/50 mb-1">Volume</p>
          <h2 className="text-sm font-medium text-white/80">Total Transactions</h2>
          <p className="text-3xl font-semibold mt-3">
            {stats?.txCount ?? 0}
          </p>
        </div>
      </div>

      {/* ================= AI INSIGHTS ================= */}
      <div className="glass-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold">AI Insights</h2>
            <p className="text-xs text-white/60 mt-1">
              Lightweight model looking at your recent transactions.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-200 border border-emerald-400/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Smart mode
          </span>
        </div>

        {!insights ? (
          <p className="text-white/60 text-sm">Analyzing your spending...</p>
        ) : (
          <div className="space-y-4">
            <p className="text-white/80 text-sm leading-relaxed">
              {insights.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/80">
              <div className="rounded-xl bg-white/5 px-4 py-3">
                <p className="text-[11px] uppercase text-white/50">This month</p>
                <p className="text-lg font-semibold mt-1">
                  ₹{insights.thisMonthTotal.toFixed(0)}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 px-4 py-3">
                <p className="text-[11px] uppercase text-white/50">Last month</p>
                <p className="text-lg font-semibold mt-1">
                  ₹{insights.prevMonthTotal.toFixed(0)}
                </p>
              </div>
              {insights.changePercent !== null && (
                <div className="rounded-xl bg-white/5 px-4 py-3 flex flex-col gap-1">
                  <p className="text-[11px] uppercase text-white/50">Change vs last month</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {insights.changePercent.toFixed(1)}%
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        insights.changePercent > 0
                          ? "bg-rose-500/15 text-rose-200 border-rose-400/60"
                          : insights.changePercent < 0
                          ? "bg-emerald-500/15 text-emerald-200 border-emerald-400/60"
                          : "bg-slate-500/20 text-slate-200 border-slate-400/60"
                      }`}
                    >
                      {insights.changePercent > 0 && "Spending up"}
                      {insights.changePercent < 0 && "Spending down"}
                      {insights.changePercent === 0 && "Flat vs last month"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= CATEGORY SUMMARY ================= */}
      <div className="glass-card max-w-4xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Category Summary</h2>

        {categoryTotals.length === 0 ? (
          <p className="text-white/70">No category data available.</p>
        ) : (
          <ul className="space-y-2">
            {categoryTotals.map((cat) => (
              <li
                key={cat.category}
                className="flex justify-between border-b border-white/20 p-2"
              >
                <span className="font-medium">{cat.category}</span>
                <span className="font-bold text-green-300">
                  ₹{cat.total}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ================= RECENT TRANSACTIONS ================= */}
      <div className="glass-card max-w-4xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>

        {lastFive.length === 0 ? (
          <p className="text-white/70">No transactions found.</p>
        ) : (
          <ul className="space-y-3">
            {lastFive.map((tx) => (
              <li
                key={tx._id}
                className="flex justify-between p-3 border-b border-white/20"
              >
                <span className="font-medium">{tx.title}</span>
                <span className="font-bold text-green-300">₹{tx.amount}</span>
                <span className="text-sm text-white/60">
                  {tx.date?.split("T")[0]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}

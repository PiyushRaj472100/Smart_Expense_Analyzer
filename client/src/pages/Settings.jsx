import { useEffect, useState } from "react";

const PAYMENT_METHODS = [
  "ALL",
  "PHONEPE",
  "GOOGLE_PAY",
  "PAYTM",
  "UPI_OTHER",
  "OTHER",
];

const RANGES = ["daily", "monthly", "yearly", "category"];

export default function Settings() {
  const [defaultMethod, setDefaultMethod] = useState("ALL");
  const [defaultRange, setDefaultRange] = useState("monthly");

  useEffect(() => {
    const m = localStorage.getItem("pref.defaultMethod");
    const r = localStorage.getItem("pref.defaultRange");
    if (m) setDefaultMethod(m);
    if (r) setDefaultRange(r);
  }, []);

  const save = () => {
    localStorage.setItem("pref.defaultMethod", defaultMethod);
    localStorage.setItem("pref.defaultRange", defaultRange);
    alert("Settings saved");
  };

  return (
    <div className="space-y-8">
      <header className="mb-2">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-white/60 mt-2 max-w-xl">
          Tune your default filters so analytics opens exactly how you like.
        </p>
      </header>

      <div className="glass-card max-w-xl p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Default Payment Method</h2>
          <select
            value={defaultMethod}
            onChange={(e) => setDefaultMethod(e.target.value)}
            className="glass-input w-full bg-slate-900 border border-white/20"
          >
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m} className="bg-slate-900">
                {m.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Default Analytics Range</h2>
          <select
            value={defaultRange}
            onChange={(e) => setDefaultRange(e.target.value)}
            className="glass-input w-full bg-slate-900 border border-white/20"
          >
            {RANGES.map((r) => (
              <option key={r} value={r} className="bg-slate-900">
                {r.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <button onClick={save} className="glass-btn w-full">
          Save Settings
        </button>
      </div>
    </div>
  );
}

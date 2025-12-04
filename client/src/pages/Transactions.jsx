import { useEffect, useState } from "react";
import {
  getTransactions,
  createTransaction,
} from "../services/transactionService";

const METHODS = [
  { value: "PHONEPE", label: "PhonePe" },
  { value: "GOOGLE_PAY", label: "Google Pay" },
  { value: "PAYTM", label: "Paytm" },
  { value: "UPI_OTHER", label: "Other UPI" },
  { value: "OTHER", label: "Cash / Card" },
];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    amount: "",
    date: "",
    category: "",
    paymentMethod: "PHONEPE",
  });

  const [messageText, setMessageText] = useState("");
  const [csvText, setCsvText] = useState("");
  const [importing, setImporting] = useState(false);
  const [showImporter, setShowImporter] = useState(false);

  // -----------------------------
  // 🔥 Load all transactions
  // -----------------------------
  const loadTransactions = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    getTransactions(token)
      .then((res) => {
        setTransactions(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // -----------------------------
  // 🔍 Helper: infer payment method from free text
  // -----------------------------
  const detectMethod = (text) => {
    const t = text.toLowerCase();
    if (t.includes("phonepe")) return "PHONEPE";
    if (t.includes("google pay") || t.includes("gpay")) return "GOOGLE_PAY";
    if (t.includes("paytm")) return "PAYTM";
    if (t.includes("upi")) return "UPI_OTHER";
    return "OTHER";
  };

  // -----------------------------
  // 1️⃣ Smart add from message (single)
  // -----------------------------
  const handleSmartAdd = async () => {
    const token = localStorage.getItem("token");
    if (!token || !messageText.trim()) return;

    // Very simple patterns: Rs 55, ₹55, 55.00 etc.
    const amtMatch = messageText.match(/(?:rs\.?|inr|₹)\s*(\d+(?:\.\d+)?)/i);
    const amount = amtMatch ? parseFloat(amtMatch[1]) : null;

    // Try to find a date like 04-12-2025 or 2025-12-04
    const dateMatch = messageText.match(/(\d{2}[-\/]\d{2}[-\/]\d{4}|\d{4}[-\/]\d{2}[-\/]\d{2})/);
    const dateStr = dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10);
    const isoDate = new Date(dateStr.replace(/\//g, "-")).toISOString().slice(0, 10);

    const method = detectMethod(messageText);

    const title = messageText.slice(0, 60);

    if (!amount) {
      alert("Could not detect amount in message. Please check the text.");
      return;
    }

    try {
      await createTransaction(token, {
        title,
        amount,
        date: isoDate,
        category: "UPI Payment",
        paymentMethod: method,
      });
      setMessageText("");
      loadTransactions();
    } catch (err) {
      console.log("Smart add failed", err);
    }
  };

  // -----------------------------
  // 2️⃣ Bulk import from CSV-style text
  // Format per line: date,amount,title,paymentApp
  // Example: 2025-12-04,55,Zomato,PHONEPE
  // -----------------------------
  const handleBulkImport = async () => {
    const token = localStorage.getItem("token");
    if (!token || !csvText.trim()) return;

    const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    setImporting(true);
    try {
      for (const line of lines) {
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length < 3) continue;

        const [rawDate, rawAmount, title, appRaw] = parts;
        const amount = parseFloat(rawAmount);
        if (Number.isNaN(amount)) continue;

        const isoDate = new Date(rawDate.replace(/\//g, "-")).toISOString().slice(0, 10);
        const method = appRaw ? appRaw.toUpperCase() : detectMethod(line);

        await createTransaction(token, {
          title,
          amount,
          date: isoDate,
          category: "Imported",
          paymentMethod: method,
        });
      }

      setCsvText("");
      loadTransactions();
      alert("Import complete");
    } catch (err) {
      console.log("Bulk import failed", err);
    } finally {
      setImporting(false);
    }
  };

  // -----------------------------
  // 3️⃣ File CSV import
  // -----------------------------
  const handleFileImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setImporting(true);

    const text = await file.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    try {
      for (const line of lines) {
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length < 3) continue;

        const [rawDate, rawAmount, title, appRaw] = parts;
        const amount = parseFloat(rawAmount);
        if (Number.isNaN(amount)) continue;

        const isoDate = new Date(rawDate.replace(/\//g, "-")).toISOString().slice(0, 10);
        const method = appRaw ? appRaw.toUpperCase() : detectMethod(line);

        await createTransaction(token, {
          title,
          amount,
          date: isoDate,
          category: "Imported",
          paymentMethod: method,
        });
      }

      loadTransactions();
      alert("File import complete");
    } catch (err) {
      console.log("File import failed", err);
    } finally {
      setImporting(false);
      // reset file input so same file can be chosen again if needed
      event.target.value = "";
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  // -----------------------------
  // ➕ Create new transaction
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) return;

    try {
      await createTransaction(token, form);

      // 🔥 Auto refresh instantly WITHOUT page reload
      loadTransactions();

      // Reset form
      setForm({ title: "", amount: "", date: "", category: "", paymentMethod: "PHONEPE" });
    } catch (err) {
      console.log("Error creating transaction");
    }
  };

  if (loading) {
    return (
      <div className="text-white text-2xl">
        Loading transactions...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Page header */}
      <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-white/60 mt-2 max-w-xl">
            Quickly add new spends, paste UPI notifications, or bulk import CSV to keep
            your ledger up to date.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

      {/* -------------------------------------------------
          ADD TRANSACTION FORM
      -------------------------------------------------- */}
      <div className="glass-card xl:col-span-1 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add Transaction</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            placeholder="Title"
            className="glass-input w-full"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />

          <input
            type="number"
            placeholder="Amount"
            className="glass-input w-full"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />

          <input
            type="date"
            className="glass-input w-full"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Category (optional)"
            className="glass-input w-full"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <select
            className="glass-input w-full"
            value={form.paymentMethod}
            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
          >
            {METHODS.map((m) => (
              <option key={m.value} value={m.value} className="bg-slate-900">
                {m.label}
              </option>
            ))}
          </select>

            <button className="glass-btn w-full">Add</button>
          </form>
        </div>

        {/* IMPORT TOOLS TOGGLE */}
        <div className="pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => setShowImporter((v) => !v)}
            className="glass-btn w-full"
          >
            {showImporter ? "Hide import tools" : "Import from CSV / message"}
          </button>
        </div>

        {showImporter && (
          <div className="space-y-6 pt-4">
            {/* SMART ADD FROM MESSAGE */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Smart add from message</h3>
              <p className="text-xs text-white/60">
                Paste an SMS / notification text from PhonePe, Google Pay, Paytm, etc.
                We will detect amount, date and app automatically.
              </p>
              <textarea
                className="glass-input w-full h-24 resize-none"
                placeholder="e.g. Rs 55.00 paid to Zomato via PhonePe UPI on 04-12-2025"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button
                type="button"
                onClick={handleSmartAdd}
                className="glass-btn w-full"
              >
                Add from message
              </button>
            </div>

            {/* FILE UPLOAD CSV */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Import from CSV file</h3>
              <p className="text-xs text-white/60">
                Upload a .csv file with lines formatted as
                <code> YYYY-MM-DD,amount,title,PHONEPE</code>.
              </p>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileImport}
                className="block w-full text-sm text-white/80 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
              />
              {importing && (
                <p className="text-xs text-white/60">Importing file, please wait...</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* -------------------------------------------------
          TRANSACTION LIST
      -------------------------------------------------- */}
      <div className="glass-card xl:col-span-2 p-6 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">All Transactions</h2>
            <p className="text-xs text-white/60 mt-1">Latest entries from your ledger.</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-900/70 border border-slate-600/60 text-white/70">
            {transactions.length} records
          </span>
        </div>

        {transactions.length === 0 ? (
          <p className="text-white/70 text-sm">No transactions found.</p>
        ) : (
          <div className="rounded-xl border border-white/10 bg-slate-950/40 overflow-hidden">
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-2 px-4 py-2 text-xs uppercase tracking-wide text-white/40 bg-white/5">
              <span>Title</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Date & Method</span>
            </div>
            <ul className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <li
                  key={tx._id}
                  className="grid grid-cols-[2fr_1fr_1fr] gap-2 px-4 py-2.5 text-sm items-center hover:bg-white/5 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{tx.title}</span>
                    <span className="text-[11px] text-white/60 mt-0.5">
                      {(tx.category || "Uncategorized")}
                    </span>
                  </div>

                  <span className="text-emerald-300 font-semibold text-right">
                    ₹{tx.amount}
                  </span>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-white/70">
                      {tx.date?.split("T")[0]}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/80 border border-slate-700/70 text-slate-200">
                      {tx.paymentMethod || "OTHER"}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      </div>
    </div>
  );
}

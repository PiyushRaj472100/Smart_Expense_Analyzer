import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
     const API = "https://smart-expense-analyzer-server.onrender.com";

    const res = await axios.post(`${API}/auth/login`, {
    email,
    password,
      }); 

      // Save token
      localStorage.setItem("token", res.data.token);
      if (res.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      // Redirect after login
      navigate("/dashboard"); // or /dashboard
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
      console.log(err.response?.data || err);
    }

    setLoading(false);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-20">
      {/* Left: pitch */}
      <div className="max-w-xl space-y-6">
        <p className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-400/40 px-3 py-1 text-xs font-semibold text-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Smart Expense Analyzer
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
          See where your
          <span className="text-emerald-300"> money </span>
          really goes.
        </h1>
        <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-lg">
          Log every UPI notification in seconds, auto-categorize your spending, and
          get AI insights on your monthly burn. Designed for students, creators,
          and anyone who wants clarity over cashflow.
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-white/60">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live dashboards
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            UPI smart import
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
            AI-powered insights
          </span>
        </div>
      </div>

      {/* Right: form */}
      <div className="glass-card w-full max-w-sm lg:max-w-md">
        <h2 className="text-2xl font-semibold mb-2 text-white">
          Welcome back
        </h2>
        <p className="text-sm text-white/70 mb-6">
          Sign in to continue tracking your expenses.
        </p>

        <form onSubmit={handleLogin} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="glass-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="glass-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="glass-btn w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="text-center text-white/70 text-sm mt-4">
          Don't have an account?{" "}
          <span
            className="text-emerald-300 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

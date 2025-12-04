import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Please fill all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:4000/auth/register", {
        name,
        email,
        password,
      });

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
      }

      if (res.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
      console.log(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-20">
      <div className="max-w-xl space-y-5">
        <p className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-400/40 px-3 py-1 text-xs font-semibold text-violet-200">
          Join the dashboard
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
          Create your
          <span className="text-violet-300"> money map.</span>
        </h1>
        <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-lg">
          Set up your account once and get daily, monthly and yearly breakdowns of
          where every rupee goes, across UPI apps and categories.
        </p>
      </div>

      <div className="glass-card w-full max-w-sm lg:max-w-md">
        <h2 className="text-2xl font-semibold mb-2 text-white text-center">
          Create account ✨
        </h2>

        <form onSubmit={handleRegister} className="flex flex-col space-y-4 mt-4">
          <input
            type="text"
            placeholder="Full Name"
            className="glass-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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

          <input
            type="password"
            placeholder="Confirm Password"
            className="glass-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button className="glass-btn w-full" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-white/70 text-sm mt-4">
          Already have an account?{" "}
          <span
            className="text-violet-300 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

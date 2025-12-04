import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileMenu() {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setName(parsed.name);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <button
      type="button"
      onClick={() => navigate("/profile")}
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-slate-900/80 hover:bg-slate-800 transition-all"
    >
      <span className="text-xs font-semibold text-white/80">
        {name ? name.charAt(0).toUpperCase() : "U"}
      </span>
      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 border border-slate-900" />
    </button>
  );
}

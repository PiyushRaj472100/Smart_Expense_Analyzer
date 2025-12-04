import { Link, useLocation } from "react-router-dom";
import ProfileMenu from "./ProfileMenu";

export default function Sidebar() {
  const { pathname } = useLocation();

  const menu = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Analytics", path: "/analytics" },
    { name: "Transactions", path: "/transactions" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <aside className="w-64 h-screen fixed inset-y-0 left-0 z-20 bg-gradient-to-b from-slate-950/90 via-slate-900/90 to-slate-950/80 border-r border-white/10 backdrop-blur-2xl shadow-[0_0_40px_rgba(15,23,42,0.8)] flex flex-col">
      {/* Brand */}
      <div className="px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Smart</p>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Expense</h1>
        </div>
        <ProfileMenu />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 border border-transparent
                ${active
                  ? "bg-slate-800/80 text-white shadow-[0_18px_45px_rgba(15,23,42,0.9)] border-slate-700/80"
                  : "text-slate-300/80 hover:text-white hover:bg-slate-800/60 hover:border-slate-700/80"}
              `}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-200
                  ${active ? "bg-emerald-400" : "bg-slate-500 group-hover:bg-emerald-300"}
                `}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 pb-6 pt-2 border-t border-white/10 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-sm font-semibold text-white py-2.5 shadow-[0_16px_40px_rgba(248,113,113,0.45)] hover:from-rose-400 hover:to-orange-400 transition-all duration-200 active:scale-95"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

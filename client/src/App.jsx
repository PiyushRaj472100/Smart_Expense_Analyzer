import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Profile from "./pages/Profile";
import Sidebar from "./components/Sidebar";

function Layout() {
  const { pathname } = useLocation();

  // Pages that SHOULD NOT show sidebar
  const hideSidebarOn = ["/", "/login", "/register"];

  const showSidebar = !hideSidebarOn.includes(pathname);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">

      {/* Sidebar only when user is inside app */}
      {showSidebar && <Sidebar />}

      {/* MAIN PAGE AREA */}
      <main
        className={`${
          showSidebar
            ? "pl-64"
            : "flex items-center justify-center"
        }`}
      >
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
          <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PROTECTED ROUTES */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
      </main>

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

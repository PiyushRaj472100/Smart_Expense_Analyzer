import { useEffect, useState } from "react";

export default function Profile() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setName(parsed.name);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.birthdate) setBirthdate(parsed.birthdate);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSave = () => {
    if (password && password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const stored = localStorage.getItem("user");
      const base = stored ? JSON.parse(stored) : {};
      const updated = {
        ...base,
        name,
        email,
        birthdate,
      };
      localStorage.setItem("user", JSON.stringify(updated));
    } catch (e) {
      // ignore
    }

    setPassword("");
    setConfirmPassword("");
    alert("Profile updated locally. Connect this to a backend endpoint to persist.");
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-white/60 mt-2 max-w-xl">
          Manage your personal details used across the dashboard.
        </p>
      </header>

      <div className="glass-card max-w-xl p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-white/60 mb-1">Name</label>
            <input
              type="text"
              className="glass-input w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1">Birthdate</label>
            <input
              type="date"
              className="glass-input w-full"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-white/60 mb-1">Email</label>
            <input
              type="email"
              className="glass-input w-full opacity-80 cursor-not-allowed"
              value={email}
              disabled
            />
            <p className="mt-1 text-[11px] text-white/50">
              This is the email you registered with and cannot be changed here.
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-white/10 space-y-3">
          <p className="text-xs text-white/60">Change password (optional)</p>
          <input
            type="password"
            placeholder="New password"
            className="glass-input w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="glass-input w-full"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <p className="text-[11px] text-white/50">
            Password change is only stored locally for now. Add an API call to
            update it securely on the server when ready.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="glass-btn w-full mt-2"
        >
          Save profile
        </button>
      </div>
    </div>
  );
}

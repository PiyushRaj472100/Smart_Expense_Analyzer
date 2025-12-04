export default function Topbar() {
  return (
    <div className="glass-card flex justify-between items-center py-4 px-6 mb-6">
      <h1 className="text-xl font-bold text-white">Dashboard</h1>

      <div className="flex items-center gap-3">
        <p className="text-white/80">Hello, User 👋</p>
        <img
          src="https://i.pravatar.cc/40"
          alt="user"
          className="w-10 h-10 rounded-full border border-white/30"
        />
      </div>
    </div>
  );
}

import { Copy } from "lucide-react";

export default function Sidebar({
  tabs,
  activeTab,
  setActiveTab,
  isAdmin,
  currentMember,
  roomCode,
  setFirebaseMessage,
}) {
  function copyRoomCode() {
    if (!roomCode) {
      setFirebaseMessage("Create or join a room first.");
      return;
    }

    navigator.clipboard.writeText(roomCode);
    setFirebaseMessage("Invite code copied.");
  }

  return (
    <aside className="border-r border-slate-700 bg-[#141a2b] p-5">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-4 w-4 rounded-full bg-[#f5d36b]" />

        <div>
          <h1 className="text-lg font-semibold tracking-wide text-[#f5d36b]">
            WC2026 Predictor
          </h1>

          <p className="text-xs text-slate-400">
            {currentMember?.firstName} {currentMember?.lastName}
          </p>
        </div>
      </div>

      <button
        onClick={copyRoomCode}
        className="mb-6 flex w-full items-center justify-between rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-left text-xs text-cyan-300 hover:bg-cyan-400/20"
      >
        <span>{roomCode || "No room yet"}</span>
        <Copy size={14} />
      </button>

      <nav className="grid gap-2">
        {tabs
          .filter((tab) => !tab.adminOnly || isAdmin)
          .map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm ${
                  activeTab === tab.id
                    ? "border border-rose-500/50 bg-rose-500/10 text-white"
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
      </nav>
    </aside>
  );
}
export default function Topbar({ activeTab, roomCode, setFirebaseMessage }) {
  function copyInviteCode() {
    if (!roomCode) {
      setFirebaseMessage("Create or join a room first.");
      return;
    }

    navigator.clipboard.writeText(roomCode);
    setFirebaseMessage("Invite code copied.");
  }

  return (
    <header className="flex flex-col gap-3 border-b border-slate-700 bg-[#111729] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h2 className="text-xl font-semibold capitalize">{activeTab}</h2>

      <button
        onClick={copyInviteCode}
    className="w-full rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300 sm:w-auto"
      >
        Copy invite code
      </button>
    </header>
  );
}
export default function AdminPanel({
  createFirebaseRoom,
  adminEmail,
  roomCode,
  currentRoom,
}) {
  const roomAlreadyCreated = Boolean(currentRoom?.id);

  return (
    <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5">
      <h3 className="mb-2 text-lg font-semibold">Admin Panel</h3>

      <p className="text-sm text-slate-400">
        Admin is only for creating rooms. Results update automatically from the
        football data sync.
      </p>

      {roomAlreadyCreated && (
        <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
          <p className="text-sm font-semibold text-emerald-300">
            Room is active
          </p>

          <p className="mt-2 text-sm text-slate-300">
            Invite code:{" "}
            <span className="font-semibold text-cyan-300">{roomCode}</span>
          </p>
        </div>
      )}

      <button
        onClick={createFirebaseRoom}
        disabled={roomAlreadyCreated}
        className="mt-4 rounded-xl bg-[#f5d36b] px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {roomAlreadyCreated ? "Room Already Created" : "Create Firebase Room"}
      </button>

      <p className="mt-4 text-xs text-slate-500">
        Admin email planned for final protection: {adminEmail}
      </p>
    </div>
  );
}
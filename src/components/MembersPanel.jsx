export default function MembersPanel({
  members,
  currentMemberId,
  joinForm,
  setJoinForm,
  joinRoom,
  isAdmin,
  deleteMember,
}) {
  const canJoinRoom =
    joinForm.firstName.trim() &&
    joinForm.lastName.trim() &&
    joinForm.roomCode.trim();

  const activeMember = members.find((member) => member.id === currentMemberId);
  const hasJoinedRoom = activeMember && !activeMember.isAdmin;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5">
        <h3 className="mb-2 text-lg font-semibold">Members</h3>

        <p className="mb-4 text-sm text-slate-400">
          Members are view-only. You cannot switch accounts or act as another
          player.
        </p>

        <div className="grid gap-2">
          {members.map((member, index) => {
            const isCurrentUser = currentMemberId === member.id;
            const canDeleteMember = isAdmin && !member.isAdmin;

            return (
              <div
                key={member.id}
                className={`flex flex-col gap-3 rounded-xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${
                  isCurrentUser
                    ? "border border-cyan-400/40 bg-cyan-400/15 text-cyan-200"
                    : "bg-white/5"
                }`}
              >
                <div>
                  <p className="font-medium">
                    {index + 1}. {member.firstName} {member.lastName}
                  </p>

                  {member.isAdmin && (
                    <p className="mt-1 text-xs text-[#f5d36b]">Admin</p>
                  )}

                  {isCurrentUser && (
                    <p className="mt-1 text-xs text-cyan-300">You</p>
                  )}

                  {!isCurrentUser && !member.isAdmin && (
                    <p className="mt-1 text-xs text-slate-400">View only</p>
                  )}
                </div>

                {canDeleteMember && (
                  <button
                    type="button"
                    onClick={() => deleteMember(member.id)}
                    className="w-full rounded-lg border border-red-400/40 px-3 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/10 sm:w-auto"
                  >
                    Delete
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5">
        {isAdmin ? (
          <div className="rounded-xl border border-[#f5d36b]/30 bg-[#f5d36b]/10 p-4">
            <h3 className="text-lg font-semibold text-[#f5d36b]">
              You are the host.
            </h3>

            <p className="mt-2 text-sm text-slate-300">
              You can delete members from this room, but you cannot act as
              another player.
            </p>
          </div>
        ) : hasJoinedRoom ? (
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4">
            <h3 className="text-lg font-semibold text-emerald-300">
              You are already in this room.
            </h3>

            <p className="mt-2 text-sm text-slate-300">
              Have fun and win the predictions, {activeMember.firstName}.
            </p>
          </div>
        ) : (
          <>
            <h3 className="mb-2 text-lg font-semibold">Join room</h3>

            <p className="mb-4 text-sm text-slate-400">
              Have an invite code? Enter your name and room code to join.
            </p>

            <div className="grid gap-3">
              <input
                className="rounded-xl border border-slate-700 bg-[#0d1324] p-3 outline-none focus:border-cyan-400"
                placeholder="First name"
                value={joinForm.firstName}
                onChange={(event) =>
                  setJoinForm({
                    ...joinForm,
                    firstName: event.target.value,
                  })
                }
              />

              <input
                className="rounded-xl border border-slate-700 bg-[#0d1324] p-3 outline-none focus:border-cyan-400"
                placeholder="Last name"
                value={joinForm.lastName}
                onChange={(event) =>
                  setJoinForm({
                    ...joinForm,
                    lastName: event.target.value,
                  })
                }
              />

              <input
                className="rounded-xl border border-slate-700 bg-[#0d1324] p-3 uppercase outline-none focus:border-cyan-400"
                placeholder="Room code"
                value={joinForm.roomCode}
                onChange={(event) =>
                  setJoinForm({
                    ...joinForm,
                    roomCode: event.target.value.trim().toUpperCase(),
                  })
                }
              />

              <button
                type="button"
                onClick={joinRoom}
                disabled={!canJoinRoom}
                className="rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Join Room
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
import { Trophy } from "lucide-react";

export default function JoinRoomPage({
  joinForm,
  setJoinForm,
  joinRoom,
  continueAsHost,
  savedRoomCode,
}) {
  const canJoinRoom =
    joinForm.firstName.trim() &&
    joinForm.lastName.trim() &&
    joinForm.roomCode.trim();

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1020] px-4 text-slate-100">
      <section className="w-full max-w-md rounded-3xl border border-slate-700 bg-[#151c30] p-6 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-[#f5d36b]/40 bg-[#f5d36b]/10">
            <Trophy size={42} className="text-[#f5d36b]" />
          </div>

          <h1 className="text-3xl font-bold tracking-wide text-[#f5d36b]">
            WC2026 Predictor
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Join your room, predict every match, and climb the leaderboard.
          </p>
        </div>

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
            onClick={joinRoom}
            disabled={!canJoinRoom}
            className="mt-2 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Join Room
          </button>
        </div>

        <div className="mt-6 border-t border-slate-700 pt-4 text-center">
            {savedRoomCode && (
                <p className="mb-2 text-xs text-slate-500">
                Saved host room:{" "}
                <span className="font-semibold text-cyan-300">{savedRoomCode}</span>
                </p>
            )}

            <button
                onClick={continueAsHost}
                className="text-sm text-slate-400 hover:text-cyan-300"
            >
                {savedRoomCode ? "Continue as host" : "Continue as host / create room"}
            </button>
            </div>
      </section>
    </main>
  );
}
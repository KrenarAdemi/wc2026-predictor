import { useState } from "react";

export default function AdminPanel({
  createFirebaseRoom,
  adminEmail,
  roomCode,
  currentRoom,
  fixtures = [],
  saveManualResult,
}) {
  const roomAlreadyCreated = Boolean(currentRoom?.id);

  const [selectedFixtureId, setSelectedFixtureId] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [message, setMessage] = useState("");

  async function submitManualResult(event) {
    event.preventDefault();

    if (!selectedFixtureId) {
      setMessage("Select a match first.");
      return;
    }

    if (homeScore === "" || awayScore === "") {
      setMessage("Enter both scores.");
      return;
    }

    if (!saveManualResult) {
      setMessage("Admin save function is not connected.");
      return;
    }

    try {
      await saveManualResult(selectedFixtureId, homeScore, awayScore);

      setMessage("Final result saved successfully.");
      setHomeScore("");
      setAwayScore("");
    } catch (error) {
      console.error(error);
      setMessage("Result could not be saved. Check Firestore rules.");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5">
        <h3 className="mb-2 text-lg font-semibold">Admin Panel</h3>

        <p className="text-sm text-slate-400">Admin email: {adminEmail}</p>

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
          type="button"
          onClick={createFirebaseRoom}
          disabled={roomAlreadyCreated}
          className="mt-4 rounded-xl bg-[#f5d36b] px-4 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {roomAlreadyCreated ? "Room Already Created" : "Create Firebase Room"}
        </button>
      </div>

      <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5">
        <h3 className="text-lg font-semibold">Manual Final Result</h3>

        <form onSubmit={submitManualResult} className="mt-4 grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="text-slate-300">Match</span>

            <select
              value={selectedFixtureId}
              onChange={(event) => setSelectedFixtureId(event.target.value)}
              className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
            >
              <option value="">Select match</option>

              {fixtures.map((fixture) => (
                <option key={fixture.id} value={fixture.id}>
                  Match {fixture.matchNo}: {fixture.home} vs {fixture.away}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="number"
              min="0"
              max="20"
              placeholder="Home score"
              value={homeScore}
              onChange={(event) => setHomeScore(event.target.value)}
              className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
            />

            <input
              type="number"
              min="0"
              max="20"
              placeholder="Away score"
              value={awayScore}
              onChange={(event) => setAwayScore(event.target.value)}
              className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
            />
          </div>

          <button
            type="submit"
            className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-slate-950"
          >
            Save Final Result
          </button>
        </form>

        {message && (
          <p className="mt-4 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-200">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
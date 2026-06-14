import { useState } from "react";
import { saveOfficialResultManually } from "../firebase/firestoreService";

export default function AdminPage({
  createFirebaseRoom,
  adminEmail,
  roomCode,
  currentRoom,
  fixtures = [],
}) {
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

    try {
      await saveOfficialResultManually(
        selectedFixtureId,
        homeScore,
        awayScore,
        adminEmail
      );

      setMessage("Final result saved. Refresh the app if it does not update immediately.");
      setHomeScore("");
      setAwayScore("");
    } catch (error) {
      console.error(error);
      setMessage("Result could not be saved. Firebase limit may be blocking writes.");
    }
  }

  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5">
        <h2 className="text-xl font-semibold">Admin Panel</h2>

        <p className="mt-2 text-sm text-slate-400">
          Admin: {adminEmail}
        </p>

        <p className="mt-1 text-sm text-slate-400">
          Room code: {roomCode || "No room yet"}
        </p>

        {!currentRoom && (
          <button
            onClick={createFirebaseRoom}
            className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950"
          >
            Create Room
          </button>
        )}
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
            <label className="grid gap-2 text-sm">
              <span className="text-slate-300">Home score</span>
              <input
                type="number"
                min="0"
                value={homeScore}
                onChange={(event) => setHomeScore(event.target.value)}
                className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="text-slate-300">Away score</span>
              <input
                type="number"
                min="0"
                value={awayScore}
                onChange={(event) => setAwayScore(event.target.value)}
                className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-slate-100"
              />
            </label>
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
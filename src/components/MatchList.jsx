import { useState } from "react";
import { Lock, CheckCircle2 } from "lucide-react";

import { calculatePoints } from "../utils/scoring";
import { isLocked, formatDate } from "../utils/dateUtils";

function getPrediction(predictions, currentMemberId, fixture) {
  const possibleIds = [
    fixture.id,
    fixture.apiMatchId,
    fixture.matchId,
    fixture.officialMatchId,
  ]
    .filter(Boolean)
    .map(String);

  for (const id of possibleIds) {
    const prediction = predictions[`${currentMemberId}:${id}`];

    if (prediction) {
      return prediction;
    }
  }

  return null;
}

export default function MatchList({
  fixtures,
  predictions,
  draftScores,
  setDraftScores,
  savePrediction,
  currentMemberId,
  showControls = true,
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredFixtures = fixtures.filter((fixture) => {
    const locked = fixture.status === "finished" || isLocked(fixture.kickoff);
    const prediction = getPrediction(predictions, currentMemberId, fixture);

    const searchValue = searchTerm.trim().toLowerCase();

    const matchesSearch =
      fixture.home?.toLowerCase().includes(searchValue) ||
      fixture.away?.toLowerCase().includes(searchValue) ||
      fixture.group?.toLowerCase().includes(searchValue) ||
      fixture.city?.toLowerCase().includes(searchValue);

    if (!matchesSearch) return false;

    if (activeFilter === "open") return !locked;
    if (activeFilter === "mine") return Boolean(prediction);

    return true;
  });

  return (
    <div className="rounded-xl border border-slate-700 bg-[#151c30]">
      <div className="border-b border-slate-700 px-5 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h3 className="text-lg font-semibold">Matchday — Group Stage</h3>

          {showControls && (
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
              <button
                onClick={() => setActiveFilter("all")}
                className={`rounded-lg px-3 py-2 text-xs ${
                  activeFilter === "all"
                    ? "bg-cyan-400 text-slate-950"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                All games
              </button>

              <button
                onClick={() => setActiveFilter("open")}
                className={`rounded-lg px-3 py-2 text-xs ${
                  activeFilter === "open"
                    ? "bg-cyan-400 text-slate-950"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                Open games
              </button>

              <button
                onClick={() => setActiveFilter("mine")}
                className={`rounded-lg px-3 py-2 text-xs ${
                  activeFilter === "mine"
                    ? "bg-cyan-400 text-slate-950"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                My predictions
              </button>
            </div>
          )}
        </div>

        {showControls && (
          <>
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
              <input
                type="search"
                placeholder="Search team, group, or city..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-[#0d1324] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400"
              />

              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveFilter("all");
                }}
                className="rounded-xl border border-slate-700 bg-slate-700 px-4 py-3 text-sm text-slate-200 hover:bg-slate-600"
              >
                Reset
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Showing {filteredFixtures.length} of {fixtures.length} matches
            </p>
          </>
        )}
      </div>

      {filteredFixtures.length === 0 && (
        <div className="px-5 py-8 text-center text-sm text-slate-400">
          No matches found for this filter.
        </div>
      )}

      {filteredFixtures.map((fixture) => {
        const locked = fixture.status === "finished" || isLocked(fixture.kickoff);
        const prediction = getPrediction(predictions, currentMemberId, fixture);

        const draftFromState = draftScores[fixture.id];

      const draft =
        draftFromState &&
        (draftFromState.home !== "" || draftFromState.away !== "")
          ? draftFromState
          : prediction || {
              home: "",
              away: "",
            };

        const points = calculatePoints(prediction, fixture);

        const matchStatusLabel =
          fixture.status === "finished"
            ? "Finished"
            : locked
              ? "Locked"
              : "Open for predictions";

        const matchStatusClass =
          fixture.status === "finished"
            ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
            : locked
              ? "border-rose-400/30 bg-rose-400/10 text-rose-300"
              : "border-cyan-400/30 bg-cyan-400/10 text-cyan-300";

        function updateDraftScore(field, value) {
          setDraftScores({
            ...draftScores,
            [fixture.id]: {
              ...draft,
              [field]: value,
            },
          });
        }

        return (
          <div
            key={fixture.id}
            className="grid gap-4 border-b border-slate-700 px-4 py-5 sm:px-5 md:grid-cols-[1fr_240px_1fr] md:items-center"
          >
            <div>
              <p className="text-xs text-slate-400">
                {fixture.group} • Match {fixture.matchNo}
              </p>

              <p className="mt-2 font-semibold">{fixture.home}</p>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-400">VS</p>

              <p className="text-xs text-cyan-300">
                {formatDate(fixture.kickoff)}
              </p>

              <p className="text-xs text-slate-500">{fixture.city}</p>

              <div className="mt-3 flex items-center justify-center gap-2">
                <input
                  disabled={locked}
                  type="number"
                  min="0"
                  max="20"
                  step="1"
                  value={draft.home}
                  onChange={(event) =>
                    updateDraftScore("home", event.target.value)
                  }
                  className="h-9 w-12 rounded-lg border border-slate-700 bg-[#0d1324] text-center outline-none disabled:opacity-40"
                />

                <span className="text-slate-500">-</span>

                <input
                  disabled={locked}
                  type="number"
                  min="0"
                  max="20"
                  step="1"
                  value={draft.away}
                  onChange={(event) =>
                    updateDraftScore("away", event.target.value)
                  }
                  className="h-9 w-12 rounded-lg border border-slate-700 bg-[#0d1324] text-center outline-none disabled:opacity-40"
                />
              </div>

              <div className="mt-3 flex justify-center gap-2">
                <button
                  disabled={locked}
                  onClick={() => savePrediction(fixture.id)}
                  className={`flex items-center gap-1 rounded-lg px-3 py-2 text-xs disabled:opacity-40 ${
                    prediction
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-slate-700"
                  }`}
                >
                  {locked ? <Lock size={12} /> : <CheckCircle2 size={12} />}
                  {prediction ? "Update" : "Predict"}
                </button>
              </div>

              {prediction && (
                <p className="mt-2 text-xs text-cyan-300">
                  Saved prediction: {prediction.home} - {prediction.away}
                </p>
              )}

              {fixture.status === "finished" && (
                <p className="mt-2 text-xs text-emerald-400">
                  Final {fixture.homeScore}-{fixture.awayScore} • {points} pts
                </p>
              )}
            </div>

            <div className="text-left md:text-right">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs ${matchStatusClass}`}
              >
                {matchStatusLabel}
              </span>

              <p className="mt-2 font-semibold">{fixture.away}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
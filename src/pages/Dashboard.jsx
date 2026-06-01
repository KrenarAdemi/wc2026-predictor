import StatCard from "../components/StatCard";
import Leaderboard from "../components/Leaderboard";
import MatchList from "../components/MatchList";

export default function Dashboard({
  standings,
  currentMemberId,
  members,
  fixtures,
  predictions,
  draftScores,
  setDraftScores,
  savePrediction,
  fixturesAreLoading,
  roomCode,
  currentRoom,
}) {
  const currentStanding = standings.find(
  (member) => member.id === currentMemberId
);

const roomIsActive = Boolean(currentRoom?.id);

const finishedMatches = fixtures.filter(
  (fixture) => fixture.status === "finished"
).length;

const nextEightFixtures = fixtures
  .filter((fixture) => {
    const kickoffDate = new Date(fixture.kickoff);
    const now = new Date();

    return !isNaN(kickoffDate) && kickoffDate > now;
  })
  .sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff))
  .slice(0, 8);

  

  return (
    <div className="grid gap-6">
        <div
  className={`rounded-xl border p-4 ${
    roomIsActive
      ? "border-emerald-400/30 bg-emerald-400/10"
      : "border-amber-400/30 bg-amber-400/10"
  }`}
>
  <p
    className={`text-sm font-semibold ${
      roomIsActive ? "text-emerald-300" : "text-amber-300"
    }`}
  >
    {roomIsActive ? "Room active" : "No room yet"}
  </p>

  <p className="mt-1 text-sm text-slate-300">
    {roomIsActive
      ? `Invite code: ${roomCode}`
      : "Create or join a room before saving predictions."}
  </p>
</div>
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="My points"
          value={currentStanding?.points || 0}
          accent="yellow"
        />

        <StatCard
          label="Predictions made"
          value={`${currentStanding?.guesses || 0}/${fixtures.length}`}
          accent="green"
        />

        <StatCard label="Members" value={members.length} accent="blue" />

        <StatCard
          label="Games finished"
          value={`${finishedMatches}/${fixtures.length}`}
          accent="red"
        />
      </section>

      <Leaderboard standings={standings} currentMemberId={currentMemberId} />
    <div>
        <h3 className="mb-3 text-lg font-semibold">Next 8 Matches</h3>

            {fixturesAreLoading ? (
                <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5 text-sm text-slate-400">
                Loading fixtures...
                </div>
            ) : (
                <MatchList
                fixtures={nextEightFixtures}
                predictions={predictions}
                draftScores={draftScores}
                setDraftScores={setDraftScores}
                savePrediction={savePrediction}
                currentMemberId={currentMemberId}
                showControls={false}
                />
            )}
        </div>
    </div>
  );
}
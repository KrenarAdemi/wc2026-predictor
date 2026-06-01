import MatchList from "../components/MatchList";

export default function FixturesPage({
  fixtures,
  predictions,
  draftScores,
  setDraftScores,
  savePrediction,
  currentMemberId,
  fixturesAreLoading,
}) {
  if (fixturesAreLoading) {
    return (
      <div className="rounded-xl border border-slate-700 bg-[#151c30] p-5 text-sm text-slate-400">
        Loading fixtures...
      </div>
    );
  }

  return (
    <MatchList
      fixtures={fixtures}
      predictions={predictions}
      draftScores={draftScores}
      setDraftScores={setDraftScores}
      savePrediction={savePrediction}
      currentMemberId={currentMemberId}
    />
  );
}
export function getOutcome(home, away) {
  if (home > away) return "HOME";
  if (away > home) return "AWAY";
  return "DRAW";
}

export function calculatePoints(prediction, fixture) {
  if (!prediction) return 0;
  if (fixture.homeScore === null || fixture.awayScore === null) return 0;

  const exact =
    prediction.home === fixture.homeScore &&
    prediction.away === fixture.awayScore;

  if (exact) return 10;

  const predictedOutcome = getOutcome(prediction.home, prediction.away);
  const actualOutcome = getOutcome(fixture.homeScore, fixture.awayScore);

  if (actualOutcome === "DRAW" && predictedOutcome === "DRAW") return 7;
  if (actualOutcome === predictedOutcome) return 5;

  return 0;
}
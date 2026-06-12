export function calculatePoints(prediction, fixture) {
  if (!prediction || !fixture) {
    return 0;
  }

  const status = String(fixture.status || "").toLowerCase();

  const isFinished =
    status === "finished" ||
    status === "fin" ||
    fixture.isFinished === true ||
    fixture.homeScore !== null ||
    fixture.awayScore !== null ||
    fixture.fullTimeHome !== null ||
    fixture.fullTimeAway !== null;

  if (!isFinished) {
    return 0;
  }

  const predictedHome = Number(prediction.home);
  const predictedAway = Number(prediction.away);

  const actualHome = Number(
    fixture.homeScore ?? fixture.fullTimeHome ?? fixture.score?.fullTime?.home
  );

  const actualAway = Number(
    fixture.awayScore ?? fixture.fullTimeAway ?? fixture.score?.fullTime?.away
  );

  const predictionIsMissing =
    Number.isNaN(predictedHome) || Number.isNaN(predictedAway);

  const resultIsMissing =
    Number.isNaN(actualHome) || Number.isNaN(actualAway);

  if (predictionIsMissing || resultIsMissing) {
    return 0;
  }

  const exactScore =
    predictedHome === actualHome && predictedAway === actualAway;

  if (exactScore) {
    return 10;
  }

  const predictedDraw = predictedHome === predictedAway;
  const actualDraw = actualHome === actualAway;

  if (predictedDraw && actualDraw) {
    return 7;
  }

  const predictedHomeWin = predictedHome > predictedAway;
  const predictedAwayWin = predictedAway > predictedHome;

  const actualHomeWin = actualHome > actualAway;
  const actualAwayWin = actualAway > actualHome;

  const correctWinner =
    (predictedHomeWin && actualHomeWin) ||
    (predictedAwayWin && actualAwayWin);

  if (correctWinner) {
    return 5;
  }

  return 0;
}
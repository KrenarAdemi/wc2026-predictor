export async function saveOfficialResultManually(
  fixtureId,
  homeScore,
  awayScore,
  updatedBy = "admin"
) {
  const safeFixtureId = String(fixtureId);
  const safeHomeScore = Number(homeScore);
  const safeAwayScore = Number(awayScore);

  await setDoc(
    doc(db, "officialResults", safeFixtureId),
    {
      apiMatchId: safeFixtureId,
      status: "finished",
      homeScore: safeHomeScore,
      awayScore: safeAwayScore,
      fullTimeHome: safeHomeScore,
      fullTimeAway: safeAwayScore,
      manualOverride: true,
      updatedBy,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await setDoc(
    doc(db, "officialMatches", safeFixtureId),
    {
      apiMatchId: safeFixtureId,
      status: "FINISHED",
      homeScore: safeHomeScore,
      awayScore: safeAwayScore,
      fullTimeHome: safeHomeScore,
      fullTimeAway: safeAwayScore,
      isFinished: true,
      manualOverride: true,
      updatedBy,
      lastSyncedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return {
    fixtureId: safeFixtureId,
    homeScore: safeHomeScore,
    awayScore: safeAwayScore,
    status: "finished",
  };
}
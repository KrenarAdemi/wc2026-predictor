import { initialFixtures } from "../data/fixtures.js";

function findResultForMatch(matchId, officialResults) {
  const safeMatchId = String(matchId);

  return (
    officialResults[safeMatchId] ||
    Object.entries(officialResults).find(([resultId, result]) => {
      return (
        String(resultId) === safeMatchId ||
        String(result?.apiMatchId) === safeMatchId ||
        String(result?.fixtureId) === safeMatchId
      );
    })?.[1] ||
    null
  );
}

function hasValidOfficialMatches(officialMatches) {
  return officialMatches.some((match) => {
    return (
      match.homeTeam ||
      match.awayTeam ||
      match.home ||
      match.away ||
      match.utcDate ||
      match.kickoff
    );
  });
}

function mapOneFixture(match, index, officialResults) {
  const matchId = String(
    match.id ||
      match.apiMatchId ||
      match.fixtureId ||
      match.matchId ||
      match.officialMatchId ||
      `m${index + 1}`
  );

  const result = findResultForMatch(matchId, officialResults);

  const homeScore =
    result?.homeScore ??
    result?.fullTimeHome ??
    match.homeScore ??
    match.fullTimeHome ??
    null;

  const awayScore =
    result?.awayScore ??
    result?.fullTimeAway ??
    match.awayScore ??
    match.fullTimeAway ??
    null;

  const isFinished =
    String(match.status || "").toLowerCase() === "finished" ||
    String(result?.status || "").toLowerCase() === "finished" ||
    result?.manualOverride === true ||
    match.isFinished === true ||
    (homeScore !== null && awayScore !== null);

  return {
    id: matchId,
    apiMatchId: matchId,
    matchNo: match.matchNo || index + 1,
    group: match.group || match.stage || "World Cup",
    round: match.matchday || match.round || 1,
    home: match.homeTeam || match.home || "TBD",
    away: match.awayTeam || match.away || "TBD",
    kickoff: match.utcDate || match.kickoff || "",
    city: match.city || "TBD",
    status: isFinished ? "finished" : "scheduled",
    isFinished,
    homeScore,
    awayScore,
    fullTimeHome: homeScore,
    fullTimeAway: awayScore,
  };
}

export function mapOfficialMatchesToFixtures(officialMatches, officialResults) {
  const sourceFixtures = hasValidOfficialMatches(officialMatches)
    ? officialMatches
    : initialFixtures;

  return sourceFixtures.map((match, index) =>
    mapOneFixture(match, index, officialResults)
  );
}
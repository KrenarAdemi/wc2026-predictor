import { initialFixtures } from "../data/fixtures.js";

function findResultForMatch(matchId, officialResults) {
  const safeMatchId = String(matchId);

  return (
    officialResults[safeMatchId] ||
    Object.values(officialResults).find((result) => {
      return (
        String(result?.apiMatchId) === safeMatchId ||
        String(result?.fixtureId) === safeMatchId ||
        String(result?.id) === safeMatchId
      );
    }) ||
    null
  );
}

function getTeamName(teamValue, fallback = "TBD") {
  if (!teamValue) return fallback;

  if (typeof teamValue === "string") {
    return teamValue.trim() || fallback;
  }

  return teamValue.name || teamValue.shortName || teamValue.tla || fallback;
}

function getStageLabel(stage, group) {
  if (group) return group;

  const safeStage = String(stage || "").toUpperCase();

  if (safeStage.includes("LAST_32")) return "Round of 32";
  if (safeStage.includes("LAST_16")) return "Round of 16";
  if (safeStage.includes("QUARTER")) return "Quarterfinal";
  if (safeStage.includes("SEMI")) return "Semifinal";
  if (safeStage.includes("THIRD")) return "3rd Place";
  if (safeStage.includes("FINAL")) return "Final";

  return stage || "World Cup";
}

function mapOneFixture(match, index, officialResults) {
  const matchId = String(
    match.id ??
      match.apiMatchId ??
      match.fixtureId ??
      match.matchId ??
      match.officialMatchId ??
      `m${index + 1}`
  );

  const result = findResultForMatch(matchId, officialResults);

  const homeScore =
    result?.homeScore ??
    result?.fullTimeHome ??
    match.homeScore ??
    match.fullTimeHome ??
    match.score?.fullTime?.home ??
    null;

  const awayScore =
    result?.awayScore ??
    result?.fullTimeAway ??
    match.awayScore ??
    match.fullTimeAway ??
    match.score?.fullTime?.away ??
    null;

  const status = String(match.status || result?.status || "").toUpperCase();

  const isFinished =
    status === "FINISHED" ||
    String(result?.status || "").toLowerCase() === "finished" ||
    result?.manualOverride === true ||
    match.isFinished === true ||
    (homeScore !== null && awayScore !== null);

  return {
    id: matchId,
    apiMatchId: matchId,
    matchNo: index + 1,
    group: getStageLabel(match.stage, match.group),
    round: match.matchday || match.round || 1,
    home: getTeamName(match.homeTeam || match.home),
    away: getTeamName(match.awayTeam || match.away),
    kickoff: match.utcDate || match.kickoff || "",
    city: match.city || match.venue || "TBD",
    status: isFinished ? "finished" : "scheduled",
    isFinished,
    homeScore,
    awayScore,
    fullTimeHome: homeScore,
    fullTimeAway: awayScore,
  };
}

export function mapOfficialMatchesToFixtures(officialMatches, officialResults) {
  const hasOfficialMatches =
    Array.isArray(officialMatches) && officialMatches.length > 0;

  const sourceFixtures = hasOfficialMatches ? officialMatches : initialFixtures;

  return sourceFixtures
    .map((match, index) => mapOneFixture(match, index, officialResults))
    .sort((a, b) => {
      const dateA = new Date(a.kickoff).getTime();
      const dateB = new Date(b.kickoff).getTime();

      if (Number.isFinite(dateA) && Number.isFinite(dateB)) {
        return dateA - dateB;
      }

      return a.matchNo - b.matchNo;
    })
    .map((fixture, index) => ({
      ...fixture,
      matchNo: index + 1,
    }));
}
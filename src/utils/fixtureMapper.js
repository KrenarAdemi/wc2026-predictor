import { initialFixtures } from "../data/fixtures.js";

export function mapOfficialMatchesToFixtures(officialMatches, officialResults) {
  if (!officialMatches.length) {
    return initialFixtures;
  }

  return officialMatches.map((match, index) => {
    const matchId = String(match.id || match.apiMatchId);

    const result =
      officialResults[matchId] ||
      officialResults[Number(matchId)] ||
      Object.values(officialResults).find(
        (item) => String(item.apiMatchId) === matchId
      );

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
      String(match.status || "").toUpperCase() === "FINISHED" ||
      String(result?.status || "").toLowerCase() === "finished" ||
      match.isFinished === true ||
      (homeScore !== null && awayScore !== null);

    return {
      id: matchId,
      apiMatchId: matchId,
      matchNo: index + 1,
      group: match.group || match.stage || "World Cup",
      round: match.matchday || 1,
      home: match.homeTeam || "TBD",
      away: match.awayTeam || "TBD",
      kickoff: match.utcDate,
      city: "TBD",
      status: isFinished ? "finished" : "scheduled",
      homeScore,
      awayScore,
      fullTimeHome: homeScore,
      fullTimeAway: awayScore,
    };
  });
}
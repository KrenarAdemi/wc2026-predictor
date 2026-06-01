import { initialFixtures } from "../data/fixtures.js";

export function mapOfficialMatchesToFixtures(officialMatches, officialResults) {
  if (!officialMatches.length) {
    return initialFixtures;
  }

  return officialMatches.map((match, index) => {
    const result = officialResults[match.id];

    const isFinished =
      match.status === "FINISHED" || result?.status === "finished";

    return {
      id: match.id,
      matchNo: index + 1,
      group: match.group || match.stage || "World Cup",
      round: match.matchday || 1,
      home: match.homeTeam || "TBD",
      away: match.awayTeam || "TBD",
      kickoff: match.utcDate,
      city: "TBD",
      status: isFinished ? "finished" : "scheduled",
      homeScore: result?.homeScore ?? match.fullTimeHome ?? null,
      awayScore: result?.awayScore ?? match.fullTimeAway ?? null,
    };
  });
}
import Leaderboard from "../components/Leaderboard";

export default function StandingsPage({ standings, currentMemberId }) {
  return (
    <Leaderboard
      standings={standings}
      currentMemberId={currentMemberId}
    />
  );
}
export const DEMO_NOW = new Date("2026-06-18T18:00:00-06:00");

export function isLocked(kickoff) {
  if (!kickoff) return false;

  const kickoffDate = new Date(kickoff);
  const now = new Date();

  return now >= kickoffDate;
}

export function formatDate(date) {
  if (!date) return "TBD";

  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
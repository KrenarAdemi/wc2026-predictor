export const DEMO_NOW = new Date("2026-06-18T18:00:00-06:00");

export function isLocked(kickoff) {
  const kickoffTime = new Date(kickoff).getTime();

  if (!Number.isFinite(kickoffTime)) {
    return true;
  }

  return Date.now() >= kickoffTime;
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
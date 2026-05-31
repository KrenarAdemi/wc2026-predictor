export const DEMO_NOW = new Date("2026-06-18T18:00:00-06:00");

export function isLocked(kickoff) {
  const lockTime = new Date(new Date(kickoff).getTime() - 5 * 60 * 1000);
  return DEMO_NOW >= lockTime;
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}
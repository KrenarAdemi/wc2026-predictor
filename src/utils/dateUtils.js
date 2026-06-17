export function isLocked(kickoff) {
  const kickoffTime = new Date(kickoff).getTime();

  if (!Number.isFinite(kickoffTime)) {
    return true;
  }

  return Date.now() >= kickoffTime;
}

export function formatDate(dateValue) {
  const date = new Date(dateValue);

  if (!Number.isFinite(date.getTime())) {
    return "TBD";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
export function timeToMinutes(time) {
  if (typeof time !== "string" || !time) return NaN;
  const parts = time.split(":");
  if (parts.length < 2) return NaN;
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return NaN;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return NaN;
  return hour * 60 + minute;
}

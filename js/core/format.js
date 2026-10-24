// ============================================================
// format.js – Anzeige-Helfer (reine Funktionen, ohne DOM).
// ============================================================

/** Gewicht menschenlesbar: 80 -> "80", 82.5 -> "82,5" */
export function formatWeight(kg) {
  if (kg === null || kg === undefined || Number.isNaN(Number(kg))) return "–";
  const n = Math.round(Number(kg) * 100) / 100;
  return String(n).replace(".", ",");
}

/** Volumen in kg, mit Tausenderpunkt: 12345.6 -> "12.346 kg" */
export function formatVolume(kg) {
  const n = Math.round(Number(kg) || 0);
  return n.toLocaleString("de-DE") + " kg";
}

/** Sekunden -> "1:05:09" oder "4:32" */
export function formatDuration(totalSeconds) {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return h > 0 ? `${h}:${mm}:${String(sec).padStart(2, "0")}` : `${mm}:${String(sec).padStart(2, "0")}`;
}

/** ISO -> "24.10.2026" */
export function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "–";
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/** ISO -> "24.10.2026, 18:30" */
export function formatDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "–";
  return (
    d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    ", " +
    d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
  );
}

/** ISO -> "Heute" / "Gestern" / "22.10.2026" */
export function formatDayLabel(iso, now = new Date()) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "–";
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(now) - startOf(d)) / 86400000);
  if (diffDays === 0) return "Heute";
  if (diffDays === 1) return "Gestern";
  return formatDate(iso);
}

/** Wochentag kurz: "Mo" */
export function weekdayShort(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d.getDay()];
}

/** Montag 00:00 der Woche, in der `date` liegt. */
export function startOfWeek(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (d.getDay() + 6) % 7; // Montag = 0
  d.setDate(d.getDate() - day);
  return d;
}

/** Kalenderwochen-Schlüssel "2026-KW43" */
export function weekKey(date = new Date()) {
  const monday = startOfWeek(date);
  const year = monday.getFullYear();
  const firstMonday = startOfWeek(new Date(year, 0, 4));
  const week = Math.round((monday - firstMonday) / (7 * 86400000)) + 1;
  return `${year}-KW${String(week).padStart(2, "0")}`;
}

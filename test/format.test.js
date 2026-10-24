import { test } from "node:test";
import assert from "node:assert/strict";
import {
  formatDate,
  formatDateTime,
  formatDayLabel,
  formatDuration,
  formatVolume,
  formatWeight,
  startOfWeek,
  weekKey,
  weekdayShort,
} from "../js/core/format.js";

test("formatWeight nutzt Komma und entfernt unnötige Nullen", () => {
  assert.equal(formatWeight(80), "80");
  assert.equal(formatWeight(82.5), "82,5");
  assert.equal(formatWeight("62.25"), "62,25");
  assert.equal(formatWeight(null), "–");
  assert.equal(formatWeight("abc"), "–");
});

test("formatVolume rundet und setzt Tausenderpunkte", () => {
  assert.equal(formatVolume(12345.6), "12.346 kg");
  assert.equal(formatVolume(0), "0 kg");
});

test("formatDuration liefert Minuten oder Stunden", () => {
  assert.equal(formatDuration(0), "0:00");
  assert.equal(formatDuration(65), "1:05");
  assert.equal(formatDuration(3661), "1:01:01");
  assert.equal(formatDuration(-5), "0:00");
});

test("formatDate und formatDateTime sind deutsch", () => {
  assert.equal(formatDate("2026-10-24T10:00:00.000Z"), "24.10.2026");
  assert.match(formatDateTime("2026-10-24T10:00:00.000Z"), /24\.10\.2026, \d{2}:\d{2}/);
});

test("formatDayLabel erkennt Heute und Gestern", () => {
  const now = new Date(2026, 9, 24, 12, 0, 0);
  assert.equal(formatDayLabel("2026-10-24T08:00:00", now), "Heute");
  assert.equal(formatDayLabel("2026-10-23T20:00:00", now), "Gestern");
  assert.equal(formatDayLabel("2026-10-20T20:00:00", now), "20.10.2026");
});

test("startOfWeek liefert Montag", () => {
  const monday = startOfWeek(new Date(2026, 9, 24, 15, 30)); // Samstag
  assert.equal(monday.getDay(), 1);
  assert.equal(monday.getDate(), 19);
  assert.equal(monday.getHours(), 0);
});

test("weekKey ist stabil innerhalb einer Woche", () => {
  const a = weekKey(new Date(2026, 9, 19));
  const b = weekKey(new Date(2026, 9, 25));
  assert.equal(a, b);
  assert.match(a, /^2026-KW\d{2}$/);
});

test("weekdayShort", () => {
  assert.equal(weekdayShort("2026-10-24T10:00:00"), "Sa");
});

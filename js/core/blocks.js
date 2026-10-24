// ============================================================
// blocks.js – Plan-Blöcke: Kraft- und Cardio-Einheiten samt
// Geräte-Einstellungen (Sitz/Winkel/Polster/Fußstütze), Griff und
// Notizen. Reine Funktionen, ohne DOM – gut testbar.
// ============================================================

export const SETUP_FIELDS = [
  { key: "sitz", label: "Sitz" },
  { key: "winkel", label: "Winkel" },
  { key: "polster", label: "Polster" },
  { key: "fuss", label: "Fußstütze" },
];

/** Vorschläge für Griff/Varianten (Kabelzüge, Maschinen). */
export const GRIP_SUGGESTIONS = ["Stange", "Seil", "V-Bar", "Breiter Griff", "Enger Griff", "Nackenrolle", "Neutral"];

/** Zahl oder null; akzeptiert "8", "8,5" und leere Werte. */
export function parseOptionalNumber(value) {
  const raw = String(value ?? "").trim().replace(",", ".");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function numOrNull(value) {
  return parseOptionalNumber(value);
}

/** Geräte-Einstellungen normalisieren: { sitz, winkel, polster, fuss } mit Zahl oder null. */
export function normalizeSetup(setup = {}) {
  const out = {};
  for (const { key } of SETUP_FIELDS) out[key] = numOrNull(setup?.[key]);
  return out;
}

/** Gerätetyp "kraft" (Standard für alte Daten) oder "cardio". */
export function blockType(block) {
  return block?.type === "cardio" ? "cardio" : "kraft";
}

export function isCardio(block) {
  return blockType(block) === "cardio";
}

/**
 * Ein Plan/Trainings-Block mit allen Feldern und Defaults.
 * Alte Blöcke (ohne die neuen Felder) bleiben gültig: type = "kraft".
 */
export function normalizeBlock(block = {}) {
  block = block || {};
  const type = blockType(block);
  return {
    exerciseId: block.exerciseId || "",
    type,
    sets: Math.max(1, Math.round(Number(block.sets) || 3)),
    repsMin: Math.max(1, Math.round(Number(block.repsMin) || 8)),
    repsMax: Math.max(type === "cardio" ? 1 : Math.round(Number(block.repsMin) || 8), Math.round(Number(block.repsMax) || (type === "cardio" ? 1 : 12))),
    restSec: Math.max(0, Math.round(Number(block.restSec) || 90)),
    targetWeight: Math.max(0, Number(block.targetWeight) || 0),
    grip: String(block.grip || "").trim(),
    setup: normalizeSetup(block.setup),
    setupText: String(block.setupText || "").trim(),
    note: String(block.note || "").trim(),
    cardioMinutes: Math.max(0, Math.round(Number(block.cardioMinutes) || 0)),
    cardioTargetBpm: Math.max(0, Math.round(Number(block.cardioTargetBpm) || 0)),
  };
}

/**
 * Kurztext für Geräte-Einstellungen: "Seil · Sitz 8 · Winkel 2 · <Freitext>".
 * Leere Felder fallen weg.
 */
export function setupSummary(block, { sep = " · " } = {}) {
  const parts = [];
  const grip = String(block?.grip || "").trim();
  if (grip) parts.push(grip);
  const setup = block?.setup || {};
  for (const { key, label } of SETUP_FIELDS) {
    const n = numOrNull(setup?.[key]);
    if (n !== null) parts.push(`${label} ${String(n).replace(".", ",")}`);
  }
  const text = String(block?.setupText || "").trim();
  if (text) parts.push(text);
  const note = String(block?.note || "").trim();
  if (note) parts.push(note);
  return parts.join(sep);
}

/** Kurztext für Cardio: "20 min · 160 BPM". Leer, wenn beides fehlt. */
export function cardioSummary(block, { sep = " · " } = {}) {
  const parts = [];
  if (Number(block?.cardioMinutes) > 0) parts.push(`${Math.round(Number(block.cardioMinutes))} min`);
  if (Number(block?.cardioTargetBpm) > 0) parts.push(`${Math.round(Number(block.cardioTargetBpm))} BPM`);
  return parts.join(sep);
}

/** Ziel-Anzeige im Plan: Kraft → "3 × 8–10 · 71 kg", Cardio → "20 min · 160 BPM". */
export function blockTargetLine(block) {
  if (isCardio(block)) return cardioSummary(block) || "Cardio";
  const min = Math.round(Number(block?.repsMin) || 0);
  const max = Math.round(Number(block?.repsMax) || 0);
  let line = `${Math.round(Number(block?.sets) || 0)} × ${min}`;
  if (max && max !== min) line += `–${max}`;
  const weight = Number(block?.targetWeight) || 0;
  if (weight > 0) line += ` · ${String(Math.round(weight * 100) / 100).replace(".", ",")} kg`;
  return line;
}

/** Blöcke im Array verschieben (für Hoch/Runter ohne Drag&Drop). */
export function moveBlock(blocks, from, to) {
  const list = [...(blocks || [])];
  const index = Math.max(0, Math.min(list.length - 1, Number(from)));
  const target = Math.max(0, Math.min(list.length - 1, Number(to)));
  if (index === target) return list;
  const [item] = list.splice(index, 1);
  list.splice(target, 0, item);
  return list;
}

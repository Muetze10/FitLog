// ============================================================
// plans.js – Startvorlagen für Trainingspläne.
// ============================================================

/** Ganzkörperplan, 3× pro Woche. */
export const WHOLE_BODY_PLAN = {
  id: "plan-ganzkoerper",
  name: "Ganzkörper",
  description: "3× pro Woche, alle großen Muskelgruppen in einer Einheit.",
  exercises: [
    { exerciseId: "kniebeugen", sets: 4, repsMin: 6, repsMax: 8, restSec: 180 },
    { exerciseId: "bankdruecken-lh", sets: 4, repsMin: 6, repsMax: 8, restSec: 180 },
    { exerciseId: "latzug", sets: 3, repsMin: 8, repsMax: 12, restSec: 120 },
    { exerciseId: "schulterdruecken-kh", sets: 3, repsMin: 8, repsMax: 12, restSec: 120 },
    { exerciseId: "rumaenisches-kreuzheben", sets: 3, repsMin: 8, repsMax: 10, restSec: 150 },
    { exerciseId: "beinbeuger", sets: 3, repsMin: 10, repsMax: 12, restSec: 90 },
    { exerciseId: "seitheben", sets: 3, repsMin: 12, repsMax: 15, restSec: 60 },
    { exerciseId: "plank", sets: 3, repsMin: 45, repsMax: 60, restSec: 60 },
  ],
};

/** Beispiel mit Geräte-Einstellungen, Griff und Notizen (Preset-Vorlage). */
export const STUDIO_PLAN = {
  id: "plan-studio",
  name: "Studio Rücken & Beine",
  description: "Maschinenplan mit Sitzeinstellungen und Griffvarianten.",
  exercises: [
    {
      exerciseId: "rudern-maschine",
      sets: 3,
      repsMin: 8,
      repsMax: 10,
      restSec: 90,
      grip: "Nackenrolle",
      setup: { polster: 12, fuss: 6 },
      targetWeight: 40,
    },
    { exerciseId: "latzug", sets: 3, repsMin: 8, repsMax: 12, restSec: 90, grip: "Breiter Griff", targetWeight: 35 },
    {
      exerciseId: "beinpresse",
      sets: 4,
      repsMin: 8,
      repsMax: 10,
      restSec: 120,
      setup: { sitz: 8, winkel: 2 },
      targetWeight: 71,
    },
    { exerciseId: "kabel-curls", sets: 3, repsMin: 10, repsMax: 12, restSec: 60, grip: "Stange", targetWeight: 25 },
    { exerciseId: "trizepsdruecken-kabel", sets: 3, repsMin: 10, repsMax: 12, restSec: 60, grip: "Seil", targetWeight: 25 },
    { exerciseId: "crunches", sets: 3, repsMin: 15, repsMax: 20, restSec: 45, note: "Seitlich abwechselnd" },
  ],
};

export function seedPlans() {
  return [structuredClone(WHOLE_BODY_PLAN), structuredClone(STUDIO_PLAN)];
}

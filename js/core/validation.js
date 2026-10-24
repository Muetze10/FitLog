// ============================================================
// validation.js – Eingabeprüfungen (rein, ohne DOM).
// ============================================================

export const MUSCLE_GROUPS = [
  { id: "brust", label: "Brust" },
  { id: "ruecken", label: "Rücken" },
  { id: "schultern", label: "Schultern" },
  { id: "bizeps", label: "Bizeps" },
  { id: "trizeps", label: "Trizeps" },
  { id: "beine", label: "Beine" },
  { id: "gesaess", label: "Gesäß" },
  { id: "bauch", label: "Bauch" },
  { id: "ganzkoerper", label: "Ganzkörper" },
];

export const EQUIPMENT = [
  { id: "langhantel", label: "Langhantel" },
  { id: "kurzhantel", label: "Kurzhantel" },
  { id: "maschine", label: "Maschine" },
  { id: "kabelzug", label: "Kabelzug" },
  { id: "koerpergewicht", label: "Körpergewicht" },
  { id: "smith", label: "Smith-Maschine" },
  { id: "gestell", label: "Rack/Gestell" },
];

export function muscleLabel(id) {
  return MUSCLE_GROUPS.find((m) => m.id === id)?.label || "Sonstiges";
}

export function equipmentLabel(id) {
  return EQUIPMENT.find((e) => e.id === id)?.label || "Sonstiges";
}

/**
 * Prüft einen Satz. Liefert eine Liste von Fehlermeldungen (leer = gültig).
 * Ein Satz ohne Wiederholungen ist ungültig; Gewicht 0 ist erlaubt
 * (Körpergewichtsübungen).
 */
export function validateSet(set) {
  const errors = [];
  const reps = Number(set?.reps);
  const weight = Number(set?.weight ?? 0);
  if (!Number.isFinite(reps) || reps < 1) errors.push("Wiederholungen müssen mindestens 1 sein.");
  if (reps > 100) errors.push("Wiederholungen sind unrealistisch hoch (max. 100).");
  if (!Number.isFinite(weight) || weight < 0) errors.push("Gewicht darf nicht negativ sein.");
  if (weight > 1000) errors.push("Gewicht ist unrealistisch hoch (max. 1000 kg).");
  return errors;
}

/** Prüft einen Plan. Cardio-Blöcke brauchen nur eine Dauer. */
export function validatePlan(plan) {
  const errors = [];
  if (!plan?.name || !plan.name.trim()) errors.push("Der Plan braucht einen Namen.");
  if (!Array.isArray(plan?.exercises) || plan.exercises.length === 0) {
    errors.push("Der Plan braucht mindestens eine Übung.");
  }
  (plan?.exercises || []).forEach((ex, index) => {
    const label = ex?.exerciseId ? ` (Block ${index + 1})` : "";
    if (ex?.type === "cardio") {
      if (!(Number(ex.cardioMinutes) >= 1)) {
        errors.push(`Cardio-Blöcke brauchen eine Dauer von mindestens 1 Minute${label}.`);
      }
      return;
    }
    if (Number(ex.sets) < 1) errors.push("Sätze pro Übung müssen mindestens 1 sein.");
    if (Number(ex.repsMin) < 1) errors.push("Wiederholungen müssen mindestens 1 sein.");
    if (Number(ex.repsMax) && Number(ex.repsMax) < Number(ex.repsMin)) {
      errors.push("Maximale Wiederholungen dürfen nicht kleiner als das Minimum sein.");
    }
  });
  return errors;
}

/** Prüft eine selbst angelegte Übung. */
export function validateExercise(exercise) {
  const errors = [];
  if (!exercise?.name || !exercise.name.trim()) errors.push("Die Übung braucht einen Namen.");
  if (exercise.name && exercise.name.trim().length > 60) errors.push("Der Name ist zu lang (max. 60 Zeichen).");
  if (!MUSCLE_GROUPS.some((m) => m.id === exercise?.muscle)) errors.push("Bitte eine Muskelgruppe wählen.");
  return errors;
}

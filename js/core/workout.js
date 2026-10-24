// ============================================================
// workout.js – reine Logik rund um ein laufendes Training.
// ============================================================

import { parseOptionalNumber, normalizeSetup, normalizeBlock } from "./blocks.js";

/**
 * Erzeugt ein neues, leeres Training (optional aus einem Plan).
 * Robust gegen unvollständige Blöcke: fehlende Felder werden ergänzt.
 */
export function createWorkout({ id, name, planId = null, exercises = [], startedAt = new Date() }) {
  if (!id) throw new Error("createWorkout braucht eine id");
  return {
    id,
    name: name || "Freies Training",
    planId,
    startedAt: new Date(startedAt).toISOString(),
    finishedAt: null,
    notes: "",
    exercises: exercises.map((e) => {
      const block = normalizeBlock(e);
      return {
        exerciseId: block.exerciseId,
        sets: [],
        targetSets: block.sets ?? null,
        targetRepsMin: block.repsMin ?? null,
        targetRepsMax: block.repsMax ?? null,
        restSec: block.restSec ?? null,
        type: block.type,
        targetWeight: block.targetWeight,
        grip: block.grip,
        setup: block.setup,
        setupText: block.setupText,
        note: block.note,
        cardioMinutes: block.cardioMinutes,
        cardioTargetBpm: block.cardioTargetBpm,
      };
    }),
  };
}

/** Fügt eine Übung hinzu, falls sie nicht schon enthalten ist. */
export function addExercise(workout, exerciseId, targets = {}) {
  if (workout.exercises.some((e) => e.exerciseId === exerciseId)) return workout;
  const block = normalizeBlock({ exerciseId, ...targets });
  workout.exercises.push({
    exerciseId,
    sets: [],
    targetSets: block.sets ?? null,
    targetRepsMin: block.repsMin ?? null,
    targetRepsMax: block.repsMax ?? null,
    restSec: block.restSec ?? null,
    type: block.type,
    targetWeight: block.targetWeight,
    grip: block.grip,
    setup: block.setup,
    setupText: block.setupText,
    note: block.note,
    cardioMinutes: block.cardioMinutes,
    cardioTargetBpm: block.cardioTargetBpm,
  });
  return workout;
}

/** Entfernt eine Übung samt Sätzen. */
export function removeExercise(workout, exerciseId) {
  workout.exercises = workout.exercises.filter((e) => e.exerciseId !== exerciseId);
  return workout;
}

/** Legt einen neuen Satz an (noch nicht abgeschlossen). Cardio-Sätze können Dauer/BPM mitführen. */
export function addSet(workout, exerciseId, { weight = 0, reps = 0, done = false, durationSec = null, bpm = null } = {}) {
  const ex = workout.exercises.find((e) => e.exerciseId === exerciseId);
  if (!ex) return null;
  const set = { weight: Number(weight) || 0, reps: Number(reps) || 0, done: Boolean(done) };
  const duration = parseOptionalNumber(durationSec);
  if (duration !== null) set.durationSec = Math.round(duration);
  const targetBpm = parseOptionalNumber(bpm);
  if (targetBpm !== null) set.bpm = Math.round(targetBpm);
  ex.sets.push(set);
  return set;
}

/** Ändert einen Satz per Index. */
export function updateSet(workout, exerciseId, index, patch) {
  const ex = workout.exercises.find((e) => e.exerciseId === exerciseId);
  if (!ex || !ex.sets[index]) return null;
  const set = ex.sets[index];
  if ("weight" in patch) set.weight = Math.max(0, Number(patch.weight) || 0);
  if ("reps" in patch) set.reps = Math.max(0, Math.round(Number(patch.reps) || 0));
  if ("done" in patch) set.done = Boolean(patch.done);
  if ("durationSec" in patch) {
    const duration = parseOptionalNumber(patch.durationSec);
    if (duration === null) delete set.durationSec;
    else set.durationSec = Math.round(duration);
  }
  if ("bpm" in patch) {
    const targetBpm = parseOptionalNumber(patch.bpm);
    if (targetBpm === null) delete set.bpm;
    else set.bpm = Math.round(targetBpm);
  }
  return set;
}

/** Entfernt einen Satz per Index. */
export function removeSet(workout, exerciseId, index) {
  const ex = workout.exercises.find((e) => e.exerciseId === exerciseId);
  if (!ex) return;
  ex.sets.splice(index, 1);
}

/** Beendet das Training; liefert eine Kopie mit finishedAt. */
export function finishWorkout(workout, now = new Date()) {
  return { ...workout, finishedAt: new Date(now).toISOString() };
}

/**
 * Vorschlag für den nächsten Satz einer Übung: letztes Gewicht und
 * Wiederholungen aus früheren Trainings. `history` ist exerciseHistory()
 * (aufsteigend sortiert).
 */
export function suggestNextSet(history, fallbackReps = 8) {
  const last = history?.[history.length - 1];
  if (!last) return { weight: 0, reps: fallbackReps };
  return { weight: last.bestWeight, reps: last.bestReps || fallbackReps };
}

/**
 * Vorschlag für den nächsten Satz in der Trainingsansicht:
 * 1. letzter erfasster Satz dieses Trainings,
 * 2. Ziel-Gewicht aus dem Plan (targetWeight),
 * 3. Historie, sonst Fallback.
 */
export function nextSetSuggestion(ex, history = [], fallbackReps = 8) {
  const sets = ex?.sets || [];
  const last = sets[sets.length - 1];
  if (last) {
    return { weight: Number(last.weight) || 0, reps: Number(last.reps) || ex?.targetRepsMin || fallbackReps };
  }
  const targetWeight = Number(ex?.targetWeight) || 0;
  if (targetWeight > 0) return { weight: targetWeight, reps: ex?.targetRepsMin || fallbackReps };
  return suggestNextSet(history, ex?.targetRepsMin || fallbackReps);
}

/**
 * Geräte-Einstellungen einer Trainings-Übung ändern:
 * `grip`/`setupText` als Freitext, Sitzzahl/Winkel/Polster/Fußstütze
 * als Schlüssel direkt im Patch (z. B. { sitz: 8 }).
 */
export function updateExerciseSetup(workout, exerciseId, patch = {}) {
  const ex = workout.exercises.find((e) => e.exerciseId === exerciseId);
  if (!ex) return null;
  if (!ex.setup) ex.setup = normalizeSetup(ex.setup);
  if ("grip" in patch) ex.grip = String(patch.grip || "").trim();
  if ("setupText" in patch) ex.setupText = String(patch.setupText || "").trim();
  if ("note" in patch) ex.note = String(patch.note || "").trim();
  const setupPatch = {};
  for (const key of ["sitz", "winkel", "polster", "fuss"]) {
    if (key in patch) setupPatch[key] = parseOptionalNumber(patch[key]);
  }
  if (Object.keys(setupPatch).length) ex.setup = normalizeSetup({ ...ex.setup, ...setupPatch });
  return ex;
}

/** Kurztext für ein Training: "3 Übungen · 12 Sätze · 4.520 kg" */
export function workoutSummaryLine(workout, extra = {}) {
  const exercises = (workout?.exercises || []).filter((e) => (e.sets || []).length);
  const sets = (workout?.exercises || []).reduce(
    (n, e) => n + (e.sets || []).filter((s) => s.done).length,
    0
  );
  const parts = [`${exercises.length} ${exercises.length === 1 ? "Übung" : "Übungen"}`, `${sets} ${sets === 1 ? "Satz" : "Sätze"}`];
  if (extra.volume) parts.push(extra.volume);
  return parts.join(" · ");
}

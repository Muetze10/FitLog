// ============================================================
// actions.js – gemeinsame Abläufe (Training starten etc.).
// ============================================================

import * as store from "./store.js";
import { createWorkout } from "./core/workout.js";
import { normalizeBlock } from "./core/blocks.js";

/** Startet ein leeres Training und öffnet die Trainingsansicht. */
export function startEmptyWorkout() {
  const existing = store.getActiveWorkout();
  if (existing) {
    location.hash = "#/training";
    return existing;
  }
  const workout = createWorkout({ id: store.uid("w"), name: "Freies Training" });
  store.setActiveWorkout(workout);
  location.hash = "#/training";
  return workout;
}

/** Startet ein Training aus einem Plan. */
export async function startPlan(planId) {
  if (store.getActiveWorkout()) {
    location.hash = "#/training";
    return null;
  }
  const plans = await store.listPlans();
  const plan = plans.find((p) => p.id === planId);
  if (!plan) return null;
  const workout = createWorkout({
    id: store.uid("w"),
    name: plan.name,
    planId: plan.id,
    exercises: plan.exercises.map((e) => {
      const b = normalizeBlock(e);
      return {
        exerciseId: b.exerciseId,
        sets: b.sets,
        repsMin: b.repsMin,
        repsMax: b.repsMax,
        restSec: b.restSec,
        type: b.type,
        targetWeight: b.targetWeight,
        grip: b.grip,
        setup: b.setup,
        setupText: b.setupText,
        note: b.note,
        cardioMinutes: b.cardioMinutes,
        cardioTargetBpm: b.cardioTargetBpm,
      };
    }),
  });
  store.setActiveWorkout(workout);
  location.hash = "#/training";
  return workout;
}

/** Setzt das laufende Training auf einen neuen Stand und speichert. */
export function updateActive(workout) {
  store.setActiveWorkout(workout);
  return workout;
}

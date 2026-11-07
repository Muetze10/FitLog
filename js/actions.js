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
    exercises: plan.exercises.map((e) => normalizeBlock(e)),
  });
  // Vorgesehene Satzreihen anlegen (nur noch ausfüllen). Wichtig NACH
  // createWorkout: die Reihen sind ein Array und dürfen nicht in
  // createWorkout laufen – dort würde Number(array) als Satzanzahl
  // interpretiert (NaN → fälschlich 3 statt z. B. 4).
  for (const entry of workout.exercises) {
    if (entry.type === "cardio") continue;
    const count = Math.max(1, Math.round(Number(entry.targetSets) || 1));
    for (let i = 0; i < count; i++) {
      entry.sets.push({ weight: Math.max(0, Number(entry.targetWeight) || 0), reps: 0, done: false });
    }
  }
  store.setActiveWorkout(workout);
  location.hash = "#/training";
  return workout;
}

/** Setzt das laufende Training auf einen neuen Stand und speichert. */
export function updateActive(workout) {
  store.setActiveWorkout(workout);
  return workout;
}

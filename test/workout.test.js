import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addExercise,
  addSet,
  createWorkout,
  finishWorkout,
  nextSetSuggestion,
  removeExercise,
  removeSet,
  suggestNextSet,
  updateExerciseSetup,
  updateSet,
  workoutSummaryLine,
} from "../js/core/workout.js";

test("createWorkout erzeugt ein leeres Training mit Zielwerten", () => {
  const w = createWorkout({
    id: "w1",
    name: "Ganzkörper",
    planId: "plan-1",
    exercises: [{ exerciseId: "bank", sets: 4, repsMin: 6, repsMax: 8, restSec: 180 }],
    startedAt: "2026-10-21T10:00:00.000Z",
  });
  assert.equal(w.id, "w1");
  assert.equal(w.name, "Ganzkörper");
  assert.equal(w.finishedAt, null);
  assert.equal(w.startedAt, "2026-10-21T10:00:00.000Z");
  assert.equal(w.exercises[0].targetSets, 4);
  assert.deepEqual(w.exercises[0].sets, []);
});

test("createWorkout verlangt eine id", () => {
  assert.throws(() => createWorkout({ name: "x" }), /id/);
});

test("createWorkout übernimmt Einstellungen, Griff und Cardio-Ziele", () => {
  const w = createWorkout({
    id: "w1",
    exercises: [
      {
        exerciseId: "beinpresse",
        sets: 4,
        repsMin: 8,
        repsMax: 10,
        restSec: 120,
        targetWeight: 71,
        grip: "Breiter Griff",
        setup: { sitz: 8, winkel: 2 },
        note: "Aus dem Plan",
      },
      { exerciseId: "crosstrainer", type: "cardio", cardioMinutes: 20, cardioTargetBpm: 160 },
    ],
  });
  const beinpresse = w.exercises[0];
  assert.equal(beinpresse.targetWeight, 71);
  assert.equal(beinpresse.grip, "Breiter Griff");
  assert.deepEqual(beinpresse.setup, { sitz: 8, winkel: 2, polster: null, fuss: null });
  assert.equal(beinpresse.type, "kraft");
  const cardio = w.exercises[1];
  assert.equal(cardio.type, "cardio");
  assert.equal(cardio.cardioMinutes, 20);
  assert.equal(cardio.cardioTargetBpm, 160);
});

test("createWorkout übersteht unvollständige Blöcke", () => {
  const w = createWorkout({ id: "w1", exercises: [null, {}, { exerciseId: "bank" }] });
  assert.equal(w.exercises.length, 3);
  for (const ex of w.exercises) {
    assert.deepEqual(ex.sets, []);
    assert.ok("targetSets" in ex && "restSec" in ex && "setup" in ex && "grip" in ex);
  }
});

test("createWorkout nutzt Standardname", () => {
  const w = createWorkout({ id: "w1" });
  assert.equal(w.name, "Freies Training");
});

test("addExercise ist idempotent", () => {
  const w = createWorkout({ id: "w1" });
  addExercise(w, "bank");
  addExercise(w, "bank");
  assert.equal(w.exercises.length, 1);
  addExercise(w, "kniebeugen", { sets: 3, repsMin: 5, repsMax: 8 });
  assert.equal(w.exercises.length, 2);
  assert.equal(w.exercises[1].targetSets, 3);
});

test("Sätze hinzufügen, ändern, entfernen", () => {
  const w = createWorkout({ id: "w1", exercises: [{ exerciseId: "bank" }] });
  addSet(w, "bank", { weight: 80, reps: 10 });
  const set = w.exercises[0].sets[0];
  assert.deepEqual(set, { weight: 80, reps: 10, done: false });

  updateSet(w, "bank", 0, { weight: 82.5, reps: 8, done: true });
  assert.deepEqual(w.exercises[0].sets[0], { weight: 82.5, reps: 8, done: true });

  updateSet(w, "bank", 0, { weight: -20, reps: -5 });
  assert.equal(w.exercises[0].sets[0].weight, 0);
  assert.equal(w.exercises[0].sets[0].reps, 0);

  removeSet(w, "bank", 0);
  assert.equal(w.exercises[0].sets.length, 0);
});

test("updateSet/removeSet auf unbekannte Übung ist harmlos", () => {
  const w = createWorkout({ id: "w1" });
  assert.equal(addSet(w, "gibt-es-nicht"), null);
  assert.equal(updateSet(w, "gibt-es-nicht", 0, { weight: 1 }), null);
  removeSet(w, "gibt-es-nicht", 0);
});

test("removeExercise entfernt Übung und Sätze", () => {
  const w = createWorkout({ id: "w1", exercises: [{ exerciseId: "bank" }] });
  addSet(w, "bank", { weight: 80, reps: 10, done: true });
  removeExercise(w, "bank");
  assert.equal(w.exercises.length, 0);
});

test("finishWorkout setzt finishedAt, ohne das Original zu verändern", () => {
  const w = createWorkout({ id: "w1" });
  const done = finishWorkout(w, "2026-10-21T11:00:00.000Z");
  assert.equal(done.finishedAt, "2026-10-21T11:00:00.000Z");
  assert.equal(w.finishedAt, null);
});

test("suggestNextSet nutzt den letzten Verlauf", () => {
  assert.deepEqual(suggestNextSet([], 8), { weight: 0, reps: 8 });
  const history = [{ bestWeight: 85, bestReps: 6 }];
  assert.deepEqual(suggestNextSet(history, 8), { weight: 85, reps: 6 });
});

test("nextSetSuggestion: letzter Satz vor Plan-Ziel vor Historie", () => {
  const ex = { sets: [], targetWeight: 71, targetRepsMin: 8 };
  assert.deepEqual(nextSetSuggestion(ex, [{ bestWeight: 65, bestReps: 10 }]), { weight: 71, reps: 8 });
  ex.sets.push({ weight: 71, reps: 9, done: true });
  assert.deepEqual(nextSetSuggestion(ex, [{ bestWeight: 65, bestReps: 10 }]), { weight: 71, reps: 9 });
  assert.deepEqual(nextSetSuggestion({ sets: [] }, [{ bestWeight: 50, bestReps: 12 }]), { weight: 50, reps: 12 });
  assert.deepEqual(nextSetSuggestion({ sets: [] }, []), { weight: 0, reps: 8 });
});

test("addSet und updateSet vertragen Cardio-Dauer und BPM", () => {
  const w = createWorkout({ id: "w1" });
  addExercise(w, "crosstrainer", { type: "cardio", cardioMinutes: 20, cardioTargetBpm: 160 });
  const set = addSet(w, "crosstrainer", { done: true, durationSec: 1250, bpm: 158 });
  assert.deepEqual(set, { weight: 0, reps: 0, done: true, durationSec: 1250, bpm: 158 });
  updateSet(w, "crosstrainer", 0, { bpm: 162 });
  assert.equal(w.exercises[0].sets[0].bpm, 162);
  updateSet(w, "crosstrainer", 0, { durationSec: "" });
  assert.equal("durationSec" in w.exercises[0].sets[0], false);
});

test("updateExerciseSetup ändert Griff und Geräte-Einstellungen", () => {
  const w = createWorkout({ id: "w1" });
  addExercise(w, "beinpresse");
  updateExerciseSetup(w, "beinpresse", { sitz: "8", winkel: "2", grip: "Breiter Griff", setupText: "Polster gerade" });
  const ex = w.exercises[0];
  assert.deepEqual(ex.setup, { sitz: 8, winkel: 2, polster: null, fuss: null });
  assert.equal(ex.grip, "Breiter Griff");
  updateExerciseSetup(w, "beinpresse", { winkel: "" });
  assert.equal(ex.setup.winkel, null);
  assert.equal(updateExerciseSetup(w, "fehlt", { sitz: 1 }), null);
});

test("workoutSummaryLine zählt Übungen und Sätze", () => {
  const w = createWorkout({ id: "w1", exercises: [{ exerciseId: "bank" }, { exerciseId: "kniebeugen" }] });
  addSet(w, "bank", { weight: 80, reps: 10, done: true });
  addSet(w, "kniebeugen", { weight: 100, reps: 5, done: false });
  const line = workoutSummaryLine(w, { volume: "800 kg" });
  assert.match(line, /2 Übungen/);
  assert.match(line, /1 Satz\b/);
  assert.match(line, /800 kg/);
});

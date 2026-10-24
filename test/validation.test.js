import { test } from "node:test";
import assert from "node:assert/strict";
import {
  equipmentLabel,
  muscleLabel,
  validateExercise,
  validatePlan,
  validateSet,
} from "../js/core/validation.js";

test("validateSet akzeptiert gültige Sätze", () => {
  assert.deepEqual(validateSet({ weight: 80, reps: 10 }), []);
  assert.deepEqual(validateSet({ weight: 0, reps: 20 }), []); // Körpergewicht
});

test("validateSet lehnt ungültige Sätze ab", () => {
  assert.ok(validateSet({ weight: 80, reps: 0 }).length > 0);
  assert.ok(validateSet({ weight: 80, reps: 150 }).length > 0);
  assert.ok(validateSet({ weight: -5, reps: 10 }).length > 0);
  assert.ok(validateSet({ weight: 2000, reps: 10 }).length > 0);
});

test("validatePlan braucht Name und Übung", () => {
  assert.ok(validatePlan({ name: "", exercises: [] }).length >= 2);
  assert.deepEqual(
    validatePlan({ name: "Ganzkörper", exercises: [{ sets: 3, repsMin: 8, repsMax: 12 }] }),
    []
  );
});

test("validatePlan erkennt verdrehte Wiederholungen", () => {
  const errors = validatePlan({
    name: "Test",
    exercises: [{ sets: 3, repsMin: 12, repsMax: 8 }],
  });
  assert.ok(errors.some((e) => /Maximale/.test(e)));
});

test("validateExercise prüft Name und Muskelgruppe", () => {
  assert.ok(validateExercise({ name: "", muscle: "brust" }).length > 0);
  assert.ok(validateExercise({ name: "Test", muscle: "quatsch" }).length > 0);
  assert.deepEqual(validateExercise({ name: "Kabelrudern", muscle: "ruecken" }), []);
});

test("Labels sind deutsch", () => {
  assert.equal(muscleLabel("ruecken"), "Rücken");
  assert.equal(muscleLabel("unbekannt"), "Sonstiges");
  assert.equal(equipmentLabel("kabelzug"), "Kabelzug");
});

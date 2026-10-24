import { test } from "node:test";
import assert from "node:assert/strict";
import {
  bestSet,
  estimatedOneRM,
  exerciseHistory,
  personalRecords,
  setVolume,
  setsByMuscle,
  totalVolume,
  totalWorkouts,
  weeklyVolume,
  workoutDuration,
  workoutSetCount,
  workoutVolume,
} from "../js/core/stats.js";

function makeWorkout({ id = "w1", finishedAt = "2026-10-20T18:00:00.000Z", exercises = [] } = {}) {
  return {
    id,
    name: "Training",
    startedAt: "2026-10-20T17:00:00.000Z",
    finishedAt,
    exercises,
  };
}

test("setVolume rechnet Gewicht mal Wiederholungen", () => {
  assert.equal(setVolume({ weight: 80, reps: 10 }), 800);
  assert.equal(setVolume({ weight: 0, reps: 15 }), 0);
  assert.equal(setVolume(null), 0);
});

test("workoutVolume zählt nur abgeschlossene Sätze", () => {
  const workout = makeWorkout({
    exercises: [
      {
        exerciseId: "bank",
        sets: [
          { weight: 80, reps: 10, done: true },
          { weight: 80, reps: 8, done: true },
          { weight: 100, reps: 5, done: false },
        ],
      },
      { exerciseId: "kniebeugen", sets: [{ weight: 100, reps: 5, done: true }] },
    ],
  });
  assert.equal(workoutVolume(workout), 800 + 640 + 500);
  assert.equal(workoutSetCount(workout), 3);
});

test("estimatedOneRM nutzt Epley", () => {
  assert.equal(estimatedOneRM(100, 1), 100);
  assert.equal(estimatedOneRM(100, 10), 133.3);
  assert.equal(estimatedOneRM(0, 10), 0);
  assert.equal(estimatedOneRM(80, 0), 0);
});

test("bestSet findet den schwersten Satz, bei Gleichstand mehr Wiederholungen", () => {
  const sets = [
    { weight: 80, reps: 12, done: true },
    { weight: 100, reps: 5, done: true },
    { weight: 100, reps: 7, done: true },
    { weight: 120, reps: 3, done: false },
  ];
  assert.deepEqual(bestSet(sets), { weight: 100, reps: 7, done: true });
  assert.equal(bestSet([]), null);
});

test("exerciseHistory filtert Übungen und sortiert chronologisch", () => {
  const workouts = [
    makeWorkout({
      id: "w2",
      finishedAt: "2026-10-22T18:00:00.000Z",
      exercises: [{ exerciseId: "bank", sets: [{ weight: 90, reps: 6, done: true }] }],
    }),
    makeWorkout({
      id: "w1",
      finishedAt: "2026-10-20T18:00:00.000Z",
      exercises: [
        { exerciseId: "bank", sets: [{ weight: 85, reps: 8, done: true }] },
        { exerciseId: "kniebeugen", sets: [{ weight: 120, reps: 5, done: true }] },
      ],
    }),
  ];
  const history = exerciseHistory(workouts, "bank");
  assert.equal(history.length, 2);
  assert.equal(history[0].workoutId, "w1");
  assert.equal(history[1].workoutId, "w2");
  assert.equal(history[0].bestWeight, 85);
  assert.ok(history[0].volume > 0);
});

test("personalRecords nimmt das beste geschätzte 1RM je Übung", () => {
  const workouts = [
    makeWorkout({
      id: "w1",
      exercises: [{ exerciseId: "bank", sets: [{ weight: 100, reps: 5, done: true }] }],
    }),
    makeWorkout({
      id: "w2",
      exercises: [{ exerciseId: "bank", sets: [{ weight: 90, reps: 12, done: true }] }],
    }),
  ];
  const records = personalRecords(workouts);
  assert.equal(records.length, 1);
  assert.equal(records[0].weight, 90);
  assert.equal(records[0].reps, 12);
});

test("weeklyVolume liefert immer die angeforderte Wochenzahl", () => {
  const now = new Date("2026-10-21T12:00:00.000Z");
  const workouts = [
    makeWorkout({ id: "a", finishedAt: "2026-10-20T18:00:00.000Z", exercises: [{ exerciseId: "x", sets: [{ weight: 50, reps: 10, done: true }] }] }),
    makeWorkout({ id: "b", finishedAt: "2026-10-01T18:00:00.000Z", exercises: [{ exerciseId: "x", sets: [{ weight: 100, reps: 10, done: true }] }] }),
    makeWorkout({ id: "c", finishedAt: null, exercises: [{ exerciseId: "x", sets: [{ weight: 100, reps: 10, done: true }] }] }),
  ];
  const weeks = weeklyVolume(workouts, 4, now);
  assert.equal(weeks.length, 4);
  assert.equal(weeks[3].workouts, 1);
  assert.equal(weeks[3].volume, 500);
  const total = weeks.reduce((sum, w) => sum + w.volume, 0);
  assert.ok(total >= 500);
});

test("workoutDuration und Summen", () => {
  const w = makeWorkout();
  assert.equal(workoutDuration(w), 3600);
  assert.equal(workoutDuration({ startedAt: "2026-10-20T17:00:00.000Z", finishedAt: null }), 0);
  assert.equal(totalVolume([w]), 0);
  assert.equal(totalWorkouts([w, { finishedAt: null }]), 1);
});

test("setsByMuscle zählt abgeschlossene Sätze je Muskelgruppe", () => {
  const exercises = [
    { id: "bank", muscle: "brust" },
    { id: "kniebeugen", muscle: "beine" },
  ];
  const workouts = [
    makeWorkout({
      exercises: [
        { exerciseId: "bank", sets: [{ weight: 80, reps: 10, done: true }, { weight: 80, reps: 10, done: false }] },
        { exerciseId: "kniebeugen", sets: [{ weight: 100, reps: 5, done: true }] },
      ],
    }),
  ];
  const result = setsByMuscle(workouts, exercises);
  assert.deepEqual(result, [
    ["brust", 1],
    ["beine", 1],
  ]);
});

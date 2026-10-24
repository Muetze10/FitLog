// ============================================================
// stats.js – reine Rechenfunktionen für Fortschritt & Statistik.
// Keine DOM-, keine Storage-Abhängigkeit -> gut testbar mit node --test.
// ============================================================

import { startOfWeek } from "./format.js";

/** Nur abgeschlossene Sätze zählen. */
export function completedSets(workout) {
  const out = [];
  for (const ex of workout?.exercises || []) {
    for (const set of ex.sets || []) {
      if (set.done) out.push({ ...set, exerciseId: ex.exerciseId });
    }
  }
  return out;
}

/** Volumen eines Satzes: Gewicht × Wiederholungen. Körpergewichtsübungen (0 kg) zählen 0. */
export function setVolume(set) {
  const w = Number(set?.weight) || 0;
  const r = Number(set?.reps) || 0;
  return w * r;
}

/** Gesamtvolumen eines Trainings in kg. */
export function workoutVolume(workout) {
  return completedSets(workout).reduce((sum, s) => sum + setVolume(s), 0);
}

/** Anzahl abgeschlossener Sätze eines Trainings. */
export function workoutSetCount(workout) {
  return completedSets(workout).length;
}

/** Trainingsdauer in Sekunden (0, wenn nicht beendet). */
export function workoutDuration(workout) {
  if (!workout?.startedAt || !workout?.finishedAt) return 0;
  const ms = new Date(workout.finishedAt).getTime() - new Date(workout.startedAt).getTime();
  return Math.max(0, Math.round(ms / 1000));
}

/**
 * Geschätztes 1RM nach Epley: weight * (1 + reps/30).
 * Bei 1 Wiederholung ist es das Gewicht selbst.
 */
export function estimatedOneRM(weight, reps) {
  const w = Number(weight) || 0;
  const r = Number(reps) || 0;
  if (w <= 0 || r <= 0) return 0;
  if (r === 1) return w;
  return Math.round(w * (1 + r / 30) * 10) / 10;
}

/** Bester Satz einer Liste: höchstes Gewicht, bei Gleichstand mehr Wiederholungen. */
export function bestSet(sets) {
  let best = null;
  for (const s of sets || []) {
    if (!s?.done) continue;
    if (!best) {
      best = s;
      continue;
    }
    if (
      Number(s.weight) > Number(best.weight) ||
      (Number(s.weight) === Number(best.weight) && Number(s.reps) > Number(best.reps))
    ) {
      best = s;
    }
  }
  return best;
}

/** Alle Sätze einer Übung über alle Trainings, chronologisch aufsteigend. */
export function exerciseHistory(workouts, exerciseId) {
  const rows = [];
  for (const w of workouts || []) {
    const ex = (w.exercises || []).find((e) => e.exerciseId === exerciseId);
    if (!ex) continue;
    const sets = (ex.sets || []).filter((s) => s.done);
    if (!sets.length) continue;
    const best = bestSet(sets);
    rows.push({
      workoutId: w.id,
      date: w.finishedAt || w.startedAt,
      sets,
      bestWeight: Number(best?.weight) || 0,
      bestReps: Number(best?.reps) || 0,
      bestOneRM: estimatedOneRM(best?.weight, best?.reps),
      volume: sets.reduce((sum, s) => sum + setVolume(s), 0),
    });
  }
  return rows.sort((a, b) => new Date(a.date) - new Date(b.date));
}

/** Persönliche Rekorde je Übung: schwerster Satz + bestes geschätztes 1RM. */
export function personalRecords(workouts) {
  const map = new Map();
  for (const w of workouts || []) {
    for (const ex of w.exercises || []) {
      const sets = (ex.sets || []).filter((s) => s.done);
      if (!sets.length) continue;
      const best = bestSet(sets);
      const e1rm = estimatedOneRM(best?.weight, best?.reps);
      const current = map.get(ex.exerciseId);
      if (!current) {
        map.set(ex.exerciseId, {
          exerciseId: ex.exerciseId,
          weight: Number(best.weight) || 0,
          reps: Number(best.reps) || 0,
          oneRM: e1rm,
          date: w.finishedAt || w.startedAt,
        });
        continue;
      }
      if (e1rm > current.oneRM) {
        current.oneRM = e1rm;
        current.weight = Number(best.weight) || 0;
        current.reps = Number(best.reps) || 0;
        current.date = w.finishedAt || w.startedAt;
      }
    }
  }
  return [...map.values()].sort((a, b) => b.oneRM - a.oneRM);
}

/**
 * Volumen pro Kalenderwoche, älteste zuerst.
 * Liefert immer `weeks` Einträge, auch leere Wochen.
 */
export function weeklyVolume(workouts, weeks = 8, now = new Date()) {
  const buckets = new Map();
  const thisMonday = startOfWeek(now);
  for (let i = weeks - 1; i >= 0; i--) {
    const monday = new Date(thisMonday);
    monday.setDate(monday.getDate() - i * 7);
    buckets.set(monday.getTime(), { weekStart: monday.toISOString(), volume: 0, workouts: 0 });
  }
  for (const w of workouts || []) {
    if (!w.finishedAt) continue;
    const t = startOfWeek(new Date(w.finishedAt)).getTime();
    const bucket = buckets.get(t);
    if (!bucket) continue;
    bucket.volume += workoutVolume(w);
    bucket.workouts += 1;
  }
  return [...buckets.values()];
}

/** Trainings pro Woche (Anzahl), älteste zuerst. */
export function workoutsPerWeek(workouts, weeks = 8, now = new Date()) {
  return weeklyVolume(workouts, weeks, now).map((b) => ({ weekStart: b.weekStart, count: b.workouts }));
}

/** Summe Volumen aller Trainings. */
export function totalVolume(workouts) {
  return (workouts || []).reduce((sum, w) => sum + workoutVolume(w), 0);
}

/** Gesamtzahl abgeschlossener Trainings. */
export function totalWorkouts(workouts) {
  return (workouts || []).filter((w) => w.finishedAt).length;
}

/** Muskelgruppen-Verteilung nach Sätzen (für Statistik). */
export function setsByMuscle(workouts, exercises) {
  const byId = new Map((exercises || []).map((e) => [e.id, e]));
  const result = new Map();
  for (const w of workouts || []) {
    for (const ex of w.exercises || []) {
      const count = (ex.sets || []).filter((s) => s.done).length;
      if (!count) continue;
      const muscle = byId.get(ex.exerciseId)?.muscle || "sonstiges";
      result.set(muscle, (result.get(muscle) || 0) + count);
    }
  }
  return [...result.entries()].sort((a, b) => b[1] - a[1]);
}

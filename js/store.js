// ============================================================
// store.js – Anwendungsdaten: Startbefüllung, CRUD, laufendes Training.
// ============================================================

import * as db from "./db.js";
import { seedExercises } from "./data/exercises.js";
import { seedPlans } from "./data/plans.js";
import { normalizeBlock } from "./core/blocks.js";

const ACTIVE_KEY = "fitlog.activeWorkout";
/** Erhöht man SEED_VERSION, rüstet syncSeeds() neue Startübungen nach. */
const SEED_VERSION = 3;

export function uid(prefix = "id") {
  const rand = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
  return `${prefix}-${rand}`;
}

/** Legt beim ersten Start Übungen und Pläne an. Idempotent. */
export async function ensureSeed() {
  const meta = await db.getOne("settings", "seeded");
  if (meta?.value === true) return false;

  const [exercises, plans] = await Promise.all([db.getAll("exercises"), db.getAll("plans")]);
  if (exercises.length === 0) await db.putMany("exercises", seedExercises());
  if (plans.length === 0) await db.putMany("plans", seedPlans());
  await db.put("settings", { key: "seeded", value: true });
  return true;
}

/**
 * Fügt bestehenden Installationen neue Startübungen/-pläne hinzu, sobald
 * SEED_VERSION steigt. Eigene oder gelöschte Übungen bleiben unangetastet;
 * bereits vorhandene IDs werden nicht überschrieben.
 */
export async function syncSeeds() {
  const version = (await db.getOne("settings", "seedVersion"))?.value ?? 0;
  if (version >= SEED_VERSION) return { exercises: 0, plans: 0 };

  const [exercises, plans] = await Promise.all([db.getAll("exercises"), db.getAll("plans")]);
  const has = (list, id) => list.some((row) => row.id === id);
  const missingExercises = seedExercises().filter((e) => !has(exercises, e.id));
  if (missingExercises.length) await db.putMany("exercises", missingExercises);

  let addedPlans = 0;
  const removedSeeds = new Set((await db.getOne("settings", "removedSeedPlans"))?.value || []);
  for (const plan of seedPlans()) {
    if (has(plans, plan.id) || removedSeeds.has(plan.id)) continue;
    await savePlan(plan);
    addedPlans++;
  }
  await db.put("settings", { key: "seedVersion", value: SEED_VERSION });
  return { exercises: missingExercises.length, plans: addedPlans };
}

// ---------- Übungen ----------

export async function listExercises() {
  const rows = await db.getAll("exercises");
  return rows.sort((a, b) => a.name.localeCompare(b.name, "de"));
}

export function saveExercise(exercise) {
  const row = {
    id: exercise.id || uid("ex"),
    name: exercise.name.trim(),
    muscle: exercise.muscle,
    equipment: exercise.equipment || "maschine",
    custom: exercise.custom !== false,
  };
  return db.put("exercises", row).then(() => row);
}

export async function deleteExercise(id) {
  const exercises = await db.getAll("exercises");
  const target = exercises.find((e) => e.id === id);
  if (!target) return;
  if (!target.custom) throw new Error("Vorinstallierte Übungen können nicht gelöscht werden.");
  await db.remove("exercises", id);
}

// ---------- Pläne ----------

export async function listPlans() {
  const rows = await db.getAll("plans");
  return rows.sort((a, b) => a.name.localeCompare(b.name, "de"));
}

export function savePlan(plan) {
  const row = {
    id: plan.id || uid("plan"),
    name: plan.name.trim(),
    description: (plan.description || "").trim(),
    exercises: (plan.exercises || []).map(normalizeBlock),
  };
  return db.put("plans", row).then(() => row);
}

/** Kopiert einen Plan als neue Vorlage ("Preset kopieren"). */
export async function duplicatePlan(planId, extra = {}) {
  const plans = await db.getAll("plans");
  const plan = plans.find((p) => p.id === planId);
  if (!plan) throw new Error("Plan nicht gefunden.");
  return savePlan({
    ...structuredClone(plan),
    ...extra,
    id: null,
    name: (extra.name || `${plan.name} (Kopie)`).trim() || `${plan.name} (Kopie)`,
  });
}

/**
 * Migration beim App-Start: fehlende Blockfelder (type, setup, Griff,
 * Notizen ...) nachrüsten, ohne bestehende Daten zu verändern, wenn
 * sie bereits stimmen.
 */
export async function migrateData() {
  const plans = await db.getAll("plans");
  const rows = plans.map((plan) => ({
    ...plan,
    exercises: (plan.exercises || []).map(normalizeBlock),
  }));
  const changed = rows.filter((row, i) => {
    const before = plans[i];
    return JSON.stringify(before.exercises || null) !== JSON.stringify(row.exercises);
  });
  if (changed.length) await db.putMany("plans", changed);
  return changed.length;
}

export function deletePlan(id) {
  return rememberRemovedSeedPlan(id).then(() => db.remove("plans", id));
}

/** Merkt sich gelöschte Vorlagen-Pläne, damit Seed-Nachrüstung sie nicht wieder einfügt. */
async function rememberRemovedSeedPlan(id) {
  const seedIds = new Set(seedPlans().map((p) => p.id));
  if (!seedIds.has(id)) return;
  const list = (await db.getOne("settings", "removedSeedPlans"))?.value || [];
  if (!list.includes(id)) {
    await db.put("settings", { key: "removedSeedPlans", value: [...list, id] });
  }
}

// ---------- Trainings ----------

export async function listWorkouts() {
  const rows = await db.getAll("workouts");
  return rows
    .filter((w) => w.finishedAt)
    .sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt));
}

export function saveWorkout(workout) {
  return db.put("workouts", workout).then(() => workout);
}

export function deleteWorkout(id) {
  return db.remove("workouts", id);
}

export function getWorkout(id) {
  return db.getOne("workouts", id);
}

// ---------- Laufendes Training (übersteht Neuladen) ----------

export function getActiveWorkout() {
  try {
    const raw = localStorage.getItem(ACTIVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setActiveWorkout(workout) {
  try {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify(workout));
  } catch {
    /* Speicher voll oder gesperrt – Training bleibt im RAM */
  }
  return workout;
}

export function clearActiveWorkout() {
  try {
    localStorage.removeItem(ACTIVE_KEY);
  } catch {
    /* ignorieren */
  }
}

// ---------- Einstellungen ----------

export async function getSetting(key, fallback = null) {
  const row = await db.getOne("settings", key);
  return row?.value ?? fallback;
}

export function setSetting(key, value) {
  return db.put("settings", { key, value });
}

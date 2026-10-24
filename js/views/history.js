// ============================================================
// history.js – Trainingsverlauf und Detailansicht.
// ============================================================

import * as store from "../store.js";
import { workoutDuration, workoutVolume, workoutSetCount } from "../core/stats.js";
import { formatDateTime, formatDayLabel, formatDuration, formatVolume, formatWeight } from "../core/format.js";
import { confirmDialog, icon, esc, toast } from "../ui.js";

export async function renderHistory(ctx) {
  ctx.setTitle("Verlauf");
  const [workouts, exercises] = await Promise.all([store.listWorkouts(), store.listExercises()]);
  const nameOf = new Map(exercises.map((e) => [e.id, e.name]));

  const groups = new Map();
  for (const w of workouts) {
    const d = new Date(w.finishedAt);
    const key = d.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }

  const root = document.createElement("div");
  root.className = "view";
  root.innerHTML = `
    <div class="section-head"><h2>Verlauf</h2><span class="muted">${workouts.length} Trainings</span></div>
    ${
      workouts.length
        ? [...groups.entries()]
            .map(
              ([month, rows]) => `<section>
                <h3 class="month-label">${esc(month)}</h3>
                <div class="list">
                  ${rows
                    .map(
                      (w) => `<a class="list-row" href="#/workout/${esc(w.id)}">
                        <div>
                          <strong>${esc(w.name)}</strong>
                          <small class="muted">${esc(formatDayLabel(w.finishedAt))} · ${workoutSetCount(w)} ${workoutSetCount(w) === 1 ? "Satz" : "Sätze"} · ${formatVolume(workoutVolume(w))}</small>
                        </div>
                        <span class="muted mono">${esc(formatDuration(workoutDuration(w)))}</span>
                      </a>`
                    )
                    .join("")}
                </div>
              </section>`
            )
            .join("")
        : `<p class="empty">Noch kein abgeschlossenes Training. <a class="link" href="#/training">Jetzt starten</a></p>`
    }
  `;
  void nameOf;
  return root;
}

export async function renderWorkoutDetail(ctx, { id }) {
  ctx.setTitle("Training");
  const [workout, exercises] = await Promise.all([store.getWorkout(id), store.listExercises()]);
  const byId = new Map(exercises.map((e) => [e.id, e]));
  const root = document.createElement("div");
  root.className = "view";

  if (!workout || !workout.finishedAt) {
    root.innerHTML = `<p class="empty">Training nicht gefunden. <a class="link" href="#/verlauf">Zurück</a></p>`;
    return root;
  }

  const duration = workoutDuration(workout);
  const volume = workoutVolume(workout);

  root.innerHTML = `
    <a class="back-link" href="#/verlauf">${icon("chevron")} Verlauf</a>
    <section>
      <h2>${esc(workout.name)}</h2>
      <p class="muted">${esc(formatDateTime(workout.finishedAt))}</p>
      <div class="stat-row">
        <div class="stat"><span class="stat-value">${formatDuration(duration)}</span><span class="stat-label">Dauer</span></div>
        <div class="stat"><span class="stat-value">${workoutSetCount(workout)}</span><span class="stat-label">Sätze</span></div>
        <div class="stat"><span class="stat-value">${formatVolume(volume)}</span><span class="stat-label">Volumen</span></div>
      </div>
    </section>
    <section class="exercise-stack">
      ${workout.exercises
        .map((ex) => {
          const info = byId.get(ex.exerciseId);
          return `<article class="card">
            <div class="card-head">
              <h3><a class="plain-link" href="#/uebung/${esc(ex.exerciseId)}">${esc(info?.name || ex.exerciseId)}</a></h3>
              <small class="muted">${ex.sets.length} ${ex.sets.length === 1 ? "Satz" : "Sätze"}</small>
            </div>
            <div class="set-summary">
              ${ex.sets
                .map((s) =>
                  s.durationSec
                    ? `<span class="set-pill ${s.done ? "is-done" : ""}">${esc(formatDuration(s.durationSec))}${s.bpm ? " · " + s.bpm + " BPM" : ""}</span>`
                    : `<span class="set-pill ${s.done ? "is-done" : ""}">${formatWeight(s.weight)} kg × ${s.reps}</span>`
                )
                .join("")}
            </div>
          </article>`;
        })
        .join("")}
    </section>
    <button class="btn btn-ghost btn-block danger-text" id="delete">${icon("trash")} Training löschen</button>
  `;

  root.querySelector("#delete").addEventListener("click", async () => {
    const ok = await confirmDialog({
      title: "Training löschen?",
      message: "Dieses Training wird dauerhaft aus dem Verlauf entfernt.",
      confirmText: "Löschen",
      danger: true,
    });
    if (!ok) return;
    await store.deleteWorkout(workout.id);
    toast("Training gelöscht");
    location.hash = "#/verlauf";
  });

  return root;
}

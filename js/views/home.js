// ============================================================
// home.js – Startbildschirm "Heute".
// ============================================================

import * as store from "../store.js";
import { startEmptyWorkout, startPlan } from "../actions.js";
import { formatDayLabel, formatDuration, formatVolume, startOfWeek } from "../core/format.js";
import { workoutVolume, workoutSetCount, workoutDuration } from "../core/stats.js";
import { workoutSummaryLine as summaryLine } from "../core/workout.js";
import { icon, esc } from "../ui.js";

export async function renderHome(ctx) {
  ctx.setTitle("FitLog");
  const [plans, workouts, exercises] = await Promise.all([
    store.listPlans(),
    store.listWorkouts(),
    store.listExercises(),
  ]);
  const active = store.getActiveWorkout();
  const nameOf = new Map(exercises.map((e) => [e.id, e.name]));

  const monday = startOfWeek(new Date()).getTime();
  const thisWeek = workouts.filter((w) => new Date(w.finishedAt).getTime() >= monday);
  const weekVolume = thisWeek.reduce((sum, w) => sum + workoutVolume(w), 0);
  const weekSets = thisWeek.reduce((sum, w) => sum + workoutSetCount(w), 0);

  const root = document.createElement("div");
  root.className = "view";

  const today = new Date().toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  root.innerHTML = `
    <section class="hero">
      <p class="eyebrow">${esc(today)}</p>
      <h2>Bereit fürs Training?</h2>
      <p class="muted">Alles bleibt offline auf diesem Gerät.</p>
      <button class="btn btn-primary btn-lg" id="start-empty">
        ${icon("play")} Training starten
      </button>
    </section>

    ${
      active
        ? `<section class="card card-active">
             <div class="card-head">
               <div>
                 <p class="eyebrow">Läuft gerade</p>
                 <h3>${esc(active.name)}</h3>
               </div>
               <span class="badge badge-live">aktiv</span>
             </div>
             <p class="muted">${esc(summaryLine(active))}</p>
             <a class="btn btn-primary btn-block" href="#/training">Weitertrainieren</a>
           </section>`
        : ""
    }

    <section>
      <div class="section-head">
        <h3>Deine Pläne</h3>
        <a class="link" href="#/plaene">Alle</a>
      </div>
      ${
        plans.length
          ? `<div class="plan-list">${plans
              .slice(0, 3)
              .map(
                (p) => `<div class="plan-row">
                  <div class="plan-info">
                    <strong>${esc(p.name)}</strong>
                    <small>${p.exercises.length} Übungen</small>
                  </div>
                  <button class="icon-btn accent" data-start="${esc(p.id)}" aria-label="Plan starten">${icon("play")}</button>
                </div>`
              )
              .join("")}</div>`
          : `<p class="empty">Noch kein Plan. <a class="link" href="#/plan-neu">Ersten Plan anlegen</a></p>`
      }
    </section>

    <section>
      <div class="section-head"><h3>Diese Woche</h3></div>
      <div class="stat-row">
        <div class="stat"><span class="stat-value">${thisWeek.length}</span><span class="stat-label">Trainings</span></div>
        <div class="stat"><span class="stat-value">${weekSets}</span><span class="stat-label">Sätze</span></div>
        <div class="stat"><span class="stat-value">${formatVolume(weekVolume)}</span><span class="stat-label">Volumen</span></div>
      </div>
    </section>

    <section>
      <div class="section-head">
        <h3>Zuletzt</h3>
        <a class="link" href="#/verlauf">Verlauf</a>
      </div>
      ${
        workouts.length
          ? workouts
              .slice(0, 3)
              .map(
                (w) => `<a class="workout-row" href="#/workout/${esc(w.id)}">
                  <div>
                    <strong>${esc(w.name)}</strong>
                    <small>${esc(formatDayLabel(w.finishedAt))} · ${esc(summaryLine(w, { volume: formatVolume(workoutVolume(w)) }))}</small>
                  </div>
                  <span class="muted mono">${esc(formatDuration(workoutDuration(w)))}</span>
                </a>`
              )
              .join("")
          : `<p class="empty">Noch kein Training abgeschlossen.</p>`
      }
    </section>
  `;

  root.querySelector("#start-empty").addEventListener("click", () => startEmptyWorkout());
  root.querySelectorAll("[data-start]").forEach((btn) => {
    btn.addEventListener("click", () => startPlan(btn.dataset.start));
  });
  void nameOf;
  return root;
}

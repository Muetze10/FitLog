// ============================================================
// stats.js (View) – Fortschritt: Wochenvolumen, Rekorde, Muskelgruppen.
// ============================================================

import * as store from "../store.js";
import {
  personalRecords,
  setsByMuscle,
  totalVolume,
  totalWorkouts,
  weeklyVolume,
} from "../core/stats.js";
import { formatDate, formatVolume, formatWeight } from "../core/format.js";
import { muscleLabel } from "../core/validation.js";
import { esc, icon } from "../ui.js";

export async function renderStats(ctx) {
  ctx.setTitle("Statistik");
  const [workouts, exercises] = await Promise.all([store.listWorkouts(), store.listExercises()]);
  const byId = new Map(exercises.map((e) => [e.id, e]));
  const weeks = weeklyVolume(workouts, 8);
  const maxVolume = Math.max(1, ...weeks.map((w) => w.volume));
  const records = personalRecords(workouts).slice(0, 8);
  const muscles = setsByMuscle(workouts, exercises);
  const maxMuscle = Math.max(1, ...muscles.map(([, n]) => n));

  const root = document.createElement("div");
  root.className = "view";
  root.innerHTML = `
    <div class="section-head"><h2>Statistik</h2></div>

    <section class="stat-row">
      <div class="stat"><span class="stat-value">${totalWorkouts(workouts)}</span><span class="stat-label">Trainings</span></div>
      <div class="stat"><span class="stat-value">${formatVolume(totalVolume(workouts))}</span><span class="stat-label">Gesamtvolumen</span></div>
      <div class="stat"><span class="stat-value">${records.length}</span><span class="stat-label">Übungen mit Daten</span></div>
    </section>

    <section class="card">
      <div class="card-head"><h3>Volumen pro Woche</h3><small class="muted">letzte 8 Wochen</small></div>
      <div class="bar-chart">
        ${weeks
          .map((w) => {
            const height = Math.round((w.volume / maxVolume) * 100);
            const label = new Date(w.weekStart).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
            return `<div class="bar-col" title="${esc(formatVolume(w.volume))}">
              <div class="bar-track"><div class="bar-fill" style="height:${height}%"></div></div>
              <span class="bar-label">${label}</span>
            </div>`;
          })
          .join("")}
      </div>
      <p class="hint">Aktuelle Woche: ${formatVolume(weeks[weeks.length - 1]?.volume || 0)}</p>
    </section>

    <section>
      <div class="section-head"><h3>Persönliche Rekorde</h3></div>
      ${
        records.length
          ? `<div class="list">${records
              .map(
                (r) => `<a class="list-row" href="#/uebung/${esc(r.exerciseId)}">
                  <div>
                    <strong>${esc(byId.get(r.exerciseId)?.name || r.exerciseId)}</strong>
                    <small class="muted">${formatWeight(r.weight)} kg × ${r.reps} · ${esc(formatDate(r.date))}</small>
                  </div>
                  <span class="badge">${formatWeight(r.oneRM)} kg 1RM</span>
                </a>`
              )
              .join("")}</div>`
          : `<p class="empty">Noch keine Rekorde. Sobald du Trainings speicherst, erscheinen sie hier.</p>`
      }
    </section>

    <section>
      <div class="section-head"><h3>Sätze pro Muskelgruppe</h3></div>
      ${
        muscles.length
          ? `<div class="muscle-bars">${muscles
              .map(
                ([muscle, count]) => `<div class="muscle-row">
                  <span class="muscle-name">${esc(muscleLabel(muscle))}</span>
                  <div class="muscle-track"><div class="muscle-fill" style="width:${Math.round((count / maxMuscle) * 100)}%"></div></div>
                  <span class="mono">${count}</span>
                </div>`
              )
              .join("")}</div>`
          : `<p class="empty">Noch keine Daten.</p>`
      }
    </section>

    <p class="hint">${icon("flame")} Alle Werte werden aus deinen gespeicherten Trainings berechnet – nichts verlässt das Gerät.</p>
  `;
  return root;
}

// ============================================================
// progress.js – Fortschritt: Wochen-Streak, Verbesserungen,
// Gewichts-Verläufe pro Übung, Muskelverteilung, Cardio.
// ============================================================

import * as store from "../store.js";
import { exerciseHistory, workoutVolume } from "../core/stats.js";
import { formatDate, formatVolume, formatWeight } from "../core/format.js";
import { muscleLabel } from "../core/validation.js";
import { esc, icon } from "../ui.js";

const DAY = 24 * 60 * 60 * 1000;

/** Montag 00:00 der Kalenderwoche (Epoch ms). */
function mondayOf(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Stufe aus einer History-Zeile (Bodyweight): der Satz mit den meisten Wdh. */
function bestGradeOf(row) {
  const withGrade = (row?.sets || [])
    .filter((s) => s.grade != null && s.grade !== "")
    .sort((a, b) => (b.reps || 0) - (a.reps || 0));
  return withGrade[0]?.grade ?? null;
}

/** Verlaufs-Kurve als SVG. metric: "e1rm" (Kraft) oder "reps" (Bodyweight). */
function sparkline(rows, metric = "e1rm") {
  const W = 600;
  const H = 190;
  const PL = 46;
  const PR = 14;
  const PT = 14;
  const PB = 34;
  const isReps = metric === "reps";
  const valueOf = (r) => (isReps ? r.bestReps : r.bestOneRM);
  const dotText = (p) =>
    isReps
      ? `${p.reps} Wdh${p.grade != null && p.grade !== "" ? ` (Stufe ${p.grade})` : ""}`
      : `${formatWeight(p.weight)} kg${p.reps ? ` × ${p.reps}` : ""}`;
  const fmt = (v) => (isReps ? Math.round(v) : formatWeight(v));

  const points = rows.map((r, i) => ({ x: new Date(r.date).getTime(), y: valueOf(r), reps: r.bestReps, weight: r.bestWeight, grade: bestGradeOf(r) }));
  if (points.length < 2) {
    const p = points[0];
    if (!p) return `<p class="empty">Noch keine Daten.</p>`;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Verlauf">
      <circle cx="${W / 2}" cy="${H / 2}" r="5" fill="var(--accent)" />
      <text x="${W / 2}" y="${H / 2 - 14}" text-anchor="middle" class="spark-label">${esc(dotText(p))}</text>
      <text x="${W / 2}" y="${H - PT - 6}" text-anchor="middle" class="spark-label">${esc(formatDate(p.date))}</text>
    </svg>`;
  }
  const xMin = Math.min(...points.map((p) => p.x));
  const xMax = Math.max(...points.map((p) => p.x));
  // Auf 5 runden (kg bzw. Wdh), damit die Achsen klare Werte zeigen.
  const rawMax = Math.max(...points.map((p) => p.y));
  const rawMin = Math.min(...points.map((p) => p.y));
  const yMax = isReps ? Math.max(1, Math.ceil(rawMax)) : Math.ceil(rawMax / 5) * 5 || 5;
  const yMin = isReps ? 0 : Math.max(0, Math.floor(rawMin / 5) * 5 - 5);
  const span = Math.max(1, yMax - yMin);
  const X = (t) => (PL + (PR - PL) * ((t - xMin) / Math.max(1, xMax - xMin)));
  const Y = (v) => H - PB - (H - PB - PT) * ((v - yMin) / span);

  const line = points.map((p, i) => `${i ? "L" : "M"}${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join(" ");
  const dots = points
    .map(
      (p) => `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="3.5" fill="var(--accent)">
        <title>${esc(formatDate(p.date))}: ${esc(dotText(p))}</title>
      </circle>`
    )
    .join("");
  const yTicks = [0, 0.5, 1].map((f) => {
    const v = yMin + span * f;
    const y = Y(v).toFixed(1);
    return `<line x1="${PL}" x2="${W - PR}" y1="${y}" y2="${y}" class="spark-grid" />
      <text x="${PL - 6}" y="${Number(y) + 4}" text-anchor="end" class="spark-label">${esc(String(fmt(v)))}</text>`;
  });
  const first = points[0];
  const last = points[points.length - 1];
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Verlauf">
    ${yTicks}
    <path d="${line}" class="spark-line" />
    ${dots}
    <text x="${X(first.x).toFixed(1)}" y="${H - 12}" text-anchor="start" class="spark-label">${esc(formatDate(first.date))}</text>
    <text x="${X(last.x).toFixed(1)}" y="${H - 12}" text-anchor="end" class="spark-label">${esc(formatDate(last.date))}</text>
  </svg>`;
}

export async function renderProgress(ctx) {
  ctx.setTitle("Fortschritt");
  const [workouts, exercises] = await Promise.all([store.listWorkouts(), store.listExercises()]);
  const byId = new Map(exercises.map((e) => [e.id, e]));
  const finished = (workouts || []).filter((w) => w.finishedAt && w.exercises?.some((e) => (e.sets || []).some((s) => s.done)));

  // ---- Kopf: diese Woche vs. letzte Woche ################################
  const thisMonday = mondayOf(new Date());
  const doneThisWeek = [];
  const lastWeek = [];
  for (const w of finished) {
    if (mondayOf(w.finishedAt) === thisMonday) doneThisWeek.push(w);
    else if (mondayOf(w.finishedAt) === thisMonday - 7 * DAY) lastWeek.push(w);
  }
  const thisVolume = doneThisWeek.reduce((sum, w) => sum + workoutVolume(w), 0);
  const lastVolume = lastWeek.reduce((sum, w) => sum + workoutVolume(w), 0);

  // ---- Wochen-Streak: fortlaufende Wochen mit Training ###################
  const activeWeeks = new Set(finished.map((w) => mondayOf(w.finishedAt)));
  let streak = 0;
  let cursor = activeWeeks.has(thisMonday) ? thisMonday : thisMonday - 7 * DAY;
  while (activeWeeks.has(cursor)) {
    streak++;
    cursor -= 7 * DAY;
  }
  // ---- Verbesserungen: e1RM-Fortschritt der letzten 90 Tage ##############
  const windowStart = Date.now() - 90 * DAY;
  const isCardioExercise = (id) => {
    const info = byId.get(id);
    return info?.muscle === "cardio" || info?.equipment === "cardio";
  };
  const trainedIds = [
    ...new Set(
      finished.flatMap((w) =>
        (w.exercises || []).filter((e) => (e.sets || []).some((s) => s.done)).map((e) => e.exerciseId)
      )
    ),
  ].filter((id) => !isCardioExercise(id)); // Cardio zählt nicht als Gewichtsverlauf
  const historyById = new Map();
  for (const id of trainedIds) historyById.set(id, exerciseHistory(finished, id));
  const series = [...historyById.entries()].sort((a, b) => b[1].length - a[1].length);

  const improvements = [];
  for (const [id, rows] of historyById) {
    const recent = rows.filter((r) => new Date(r.date).getTime() >= windowStart);
    if (recent.length < 2) continue;
    const first = recent[0];
    const last = recent[recent.length - 1];
    const delta = last.bestOneRM - first.bestOneRM;
    if (delta <= 0) continue;
    improvements.push({
      id,
      name: byId.get(id)?.name || id,
      delta,
      pct: first.bestOneRM > 0 ? (delta / first.bestOneRM) * 100 : 0,
      weight: last.bestWeight,
      reps: last.bestReps,
      date: last.date,
    });
  }
  improvements.sort((a, b) => b.delta - a.delta);
  const top = improvements.slice(0, 5);

  // ---- Muskelverteilung / Cardio der letzten 30 Tage #####################
  const month = new Date(Date.now() - 30 * DAY).toISOString();
  const recentWorkouts = finished.filter((w) => w.finishedAt >= month);
  const muscleSets = new Map();
  let cardioMin = 0;
  for (const w of recentWorkouts) {
    for (const ex of w.exercises || []) {
      const doneSets = (ex.sets || []).filter((s) => s.done);
      if (ex.type === "cardio") {
        for (const s of doneSets) if (s.durationSec) cardioMin += s.durationSec / 60;
        continue;
      }
      const muscle = byId.get(ex.exerciseId)?.muscle;
      if (muscle) muscleSets.set(muscle, (muscleSets.get(muscle) || 0) + doneSets.length);
      for (const s of doneSets) if (s.durationSec) cardioMin += s.durationSec / 60;
    }
  }
  const muscles = [...muscleSets.entries()].sort((a, b) => b[1] - a[1]);
  const maxMuscle = Math.max(1, ...muscles.map(([, n]) => n));

  // ---- Markup ############################################################
  const root = document.createElement("div");
  root.className = "view view-progress";
  root.innerHTML = `
    <div class="section-head"><h2>Fortschritt</h2></div>

    <section class="stat-row">
      <div class="stat"><span class="stat-value">${streak}</span><span class="stat-label">Wochen-Streak ${icon("flame", "icon")}</span></div>
      <div class="stat"><span class="stat-value">${doneThisWeek.length}</span><span class="stat-label">Trainings diese Woche</span></div>
      <div class="stat"><span class="stat-value">${thisVolume > lastVolume ? "+" : ""}${formatVolume(thisVolume - lastVolume)}</span><span class="stat-label">Volumen vs. Vorwoche</span></div>
    </section>

    ${
      streak === 0
        ? `<p class="hint">Starte ein Training – dein Wochen-Streak zählt ab der ersten Session.</p>`
        : ""
    }

    <section>
      <div class="section-head"><h3>Wo du besser wirst</h3><small class="muted">letzte 90 Tage</small></div>
    ${
      top.length
        ? `<div class="list">${top
            .map(
              (im) => `<a class="list-row" href="#/uebung/${esc(im.id)}">
                <div>
                  <strong>${esc(im.name)}</strong>
                  <small class="muted">${esc(formatWeight(im.weight))} kg × ${im.reps} · ${esc(formatDate(im.date))}</small>
                </div>
                <span class="badge">+${esc(formatWeight(im.delta))} kg (${im.pct >= 10 ? Math.round(im.pct) : im.pct.toFixed(1)} %)</span>
              </a>`
            )
            .join("")}</div>`
        : `<p class="empty">Zeigt sich, sobald du dieselbe Übung mehrfach trainierst.</p>`
    }
    </section>

    <section>
      <div class="section-head"><h3>Übungsverlauf</h3><small class="muted">je Übung, e1RM bzw. Wdh</small></div>
      ${series.length
        ? `<div class="chart-list">${series
            .map(([id, rows]) => {
              const info = byId.get(id);
              const body = info?.equipment === "koerpergewicht";
              const first = rows[0];
              const last = rows[rows.length - 1];
              // Kennzahl-Zeile unter der Kurve: Entwicklung der Übung auf einen Blick.
              let meta;
              if (body) {
                const grade = bestGradeOf(last);
                meta = `${rows.length} ${rows.length === 1 ? "Training" : "Trainings"} · ${first.bestReps} → ${last.bestReps} Wdh${
                  grade != null && grade !== "" ? ` (Stufe ${esc(grade)})` : ""
                }`;
              } else {
                const rise = last.bestOneRM - first.bestOneRM;
                meta = `${rows.length} ${rows.length === 1 ? "Training" : "Trainings"} · ${esc(formatWeight(first.bestWeight))} → ${esc(
                  formatWeight(last.bestWeight)
                )} kg${rise > 0 ? ` · e1RM +${esc(formatWeight(rise))} kg` : ""}`;
              }
              return `<article class="card chart-card">
                <div class="card-head">
                  <h3><a class="plain-link" href="#/uebung/${esc(id)}">${esc(info?.name || id)}</a></h3>
                  <small class="muted">${esc(muscleLabel(info?.muscle || ""))}</small>
                </div>
                ${sparkline(rows, body ? "reps" : "e1rm")}
                <p class="hint">${meta}</p>
              </article>`;
            })
            .join("")}</div>`
        : `<p class="empty">Sobald du Übungen trainierst, siehst du hier den Verlauf jeder Übung.</p>`}
      <p class="hint">Punkt berühren zeigt Datum und Ausführung.</p>
    </section>

    <section>
      <div class="section-head"><h3>Körperteile</h3><small class="muted">Sätze, letzte 30 Tage</small></div>
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

    ${
      Math.round(cardioMin) > 0
        ? `<section>
      <div class="section-head"><h3>Cardio</h3><small class="muted">letzte 30 Tage</small></div>
      <div class="stat-row"><div class="stat"><span class="stat-value">${Math.round(cardioMin)}</span><span class="stat-label">Minuten gesamt</span></div></div>
    </section>`
        : ""
    }

    <p class="hint">${icon("flame")} Alle Werte bleiben auf deinem Gerät.</p>
  `;

  return root;
}

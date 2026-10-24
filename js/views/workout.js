// ============================================================
// workout.js – laufendes Training: Sätze erfassen, Pausentimer,
// Cardio-Blöcke, Geräte-Einstellungen + letzte Gewichte, beenden.
// ============================================================

import * as store from "../store.js";
import { startEmptyWorkout, updateActive } from "../actions.js";
import {
  addExercise,
  addSet,
  finishWorkout,
  nextSetSuggestion,
  removeExercise,
  removeSet,
  updateExerciseSetup,
  updateSet,
  workoutSummaryLine,
} from "../core/workout.js";
import {
  SETUP_FIELDS,
  blockTargetLine,
  cardioSummary,
  isCardio,
  parseOptionalNumber,
  setupSummary,
} from "../core/blocks.js";
import { exerciseHistory, workoutVolume, workoutSetCount } from "../core/stats.js";
import { formatDayLabel, formatDuration, formatWeight, formatVolume } from "../core/format.js";
import { muscleLabel } from "../core/validation.js";
import { confirmDialog, exercisePicker, icon, esc, toast } from "../ui.js";

function parseNumber(value) {
  const n = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function formatSetupNum(n) {
  return String(Math.round(Number(n) * 100) / 100).replace(".", ",");
}

function setupValue(setup, key) {
  const v = setup?.[key];
  return v === null || v === undefined ? "" : formatSetupNum(v);
}

export async function renderWorkout(ctx) {
  ctx.setTitle("Training");
  let workout = store.getActiveWorkout();
  const [exercises, finishedWorkouts] = await Promise.all([store.listExercises(), store.listWorkouts()]);
  const byId = new Map(exercises.map((e) => [e.id, e]));
  const historyCache = new Map();

  const root = document.createElement("div");
  root.className = "view view-workout";

  if (!workout) {
    root.innerHTML = `
      <section class="empty-state">
        <div class="empty-icon">${icon("dumbbell")}</div>
        <h2>Kein laufendes Training</h2>
        <p class="muted">Starte ein freies Training oder wähle einen Plan.</p>
        <button class="btn btn-primary btn-lg" id="start-empty">Training starten</button>
        <a class="btn btn-ghost btn-block" href="#/plaene">Pläne ansehen</a>
      </section>`;
    root.querySelector("#start-empty").addEventListener("click", () => startEmptyWorkout());
    return root;
  }

  let rest = null; // { endAt: ms }
  let tick = null;
  let cardioRun = null; // { exerciseId, startAt: ms }

  function remainingRest() {
    if (!rest) return 0;
    return Math.max(0, Math.ceil((rest.endAt - Date.now()) / 1000));
  }

  function startRest(seconds) {
    if (!seconds || seconds <= 0) return;
    rest = { endAt: Date.now() + seconds * 1000 };
    updateTick();
  }

  function updateTick() {
    const elapsed = Math.max(0, Math.floor((Date.now() - new Date(workout.startedAt).getTime()) / 1000));
    const elapsedEl = root.querySelector("#elapsed");
    if (elapsedEl) elapsedEl.textContent = formatDuration(elapsed);

    if (cardioRun) {
      const cardioEl = root.querySelector("#cardio-time");
      if (cardioEl) cardioEl.textContent = formatDuration(Math.floor((Date.now() - cardioRun.startAt) / 1000));
    }

    const bar = root.querySelector("#rest-bar");
    if (bar) {
      const left = remainingRest();
      if (left <= 0) {
        bar.hidden = true;
        rest = null;
      } else {
        bar.hidden = false;
        const label = bar.querySelector("#rest-time");
        if (label) label.textContent = formatDuration(left);
      }
    }
  }

  function exerciseHistoryFor(id) {
    if (!historyCache.has(id)) historyCache.set(id, exerciseHistory(finishedWorkouts, id));
    return historyCache.get(id);
  }

  function lastWeightLine(ex) {
    const history = exerciseHistoryFor(ex.exerciseId);
    const last = history[history.length - 1];
    if (!last) return "";
    const weight = formatWeight(last.bestWeight);
    const reps = last.bestReps ? ` × ${last.bestReps}` : "";
    return `<div class="cw-line" title="Letzte Ausführung">${icon("history", "icon")} Letztes Gewicht: <strong>${esc(weight)} kg${esc(reps)}</strong> <span class="muted">${esc(formatDayLabel(last.date))}</span></div>`;
  }

  function planSetupLine(ex) {
    const setup = setupSummary(ex);
    const target = ex.targetWeight > 0 ? `Ziel-Gewicht ${formatWeight(ex.targetWeight)} kg` : "";
    if (!setup && !target) return "";
    return `<div class="cw-line" title="Einstellungen aus dem Plan">${icon("plan", "icon")} ${esc([setup, target].filter(Boolean).join(" · "))}</div>`;
  }

  function save() {
    updateActive(workout);
  }

  function updateSummary() {
    const el = root.querySelector("#workout-summary");
    if (!el) return;
    const totalSets = workoutSetCount(workout);
    el.textContent = `${totalSets} ${totalSets === 1 ? "Satz" : "Sätze"} · ${formatVolume(workoutVolume(workout))}`;
  }

  function targetHint(ex) {
    if (isCardio(ex)) return cardioSummary(ex) ? `Cardio · Ziel: ${cardioSummary(ex)}` : "Cardio";
    // Trainings-Einträge tragen die Plan-Ziele als targetSets/targetRepsMin/Max.
    const line = blockTargetLine({
      sets: ex.targetSets,
      repsMin: ex.targetRepsMin,
      repsMax: ex.targetRepsMax,
      targetWeight: ex.targetWeight,
    });
    return line ? `Ziel: ${line}` : "";
  }

  function draw() {
    const totalSets = workoutSetCount(workout);
    root.innerHTML = `
      <section class="workout-head">
        <div>
          <p class="eyebrow">${esc(workout.name)}</p>
          <div class="elapsed mono" id="elapsed">0:00</div>
          <p class="muted" id="workout-summary">${totalSets} ${totalSets === 1 ? "Satz" : "Sätze"} · ${formatVolume(workoutVolume(workout))}</p>
        </div>
        <button class="btn btn-primary" id="finish">Beenden</button>
      </section>

      <section class="exercise-stack">
        ${
          workout.exercises.length
            ? workout.exercises
                .map((ex, index) => {
                  const info = byId.get(ex.exerciseId);
                  const cardio = isCardio(ex);
                  return `<article class="card exercise-card ${cardio ? "is-cardio" : ""}" data-ex="${esc(ex.exerciseId)}">
                    <div class="card-head">
                      <div>
                        <h3><span class="mono muted">${index + 1}.</span> <a class="plain-link" href="#/uebung/${esc(ex.exerciseId)}">${esc(info?.name || ex.exerciseId)}</a>${cardio ? " " + icon("heart", "icon icon-heart") : ""}</h3>
                        <small class="muted">${esc(muscleLabel(info?.muscle))}${targetHint(ex) ? " · " + esc(targetHint(ex)) : ""}</small>
                      </div>
                      <button class="icon-btn" data-act="remove-ex" aria-label="Übung entfernen">${icon("trash")}</button>
                    </div>
                    ${cardio ? cardioBlock(ex) : strengthBlock(ex)}
                  </article>`;
                })
                .join("")
            : `<p class="empty">Noch keine Übung. Füge deine erste hinzu.</p>`
        }
      </section>

      <button class="btn btn-ghost btn-block" id="add-exercise">${icon("plus")} Übung hinzufügen</button>

      <div class="rest-timer" id="rest-bar" hidden>
        <span>${icon("clock")} Pause</span>
        <strong class="mono" id="rest-time">0:00</strong>
        <button class="btn btn-ghost btn-sm" id="rest-skip">Überspringen</button>
      </div>
    `;

    root.querySelector("#elapsed").textContent = formatDuration(
      Math.max(0, Math.floor((Date.now() - new Date(workout.startedAt).getTime()) / 1000))
    );

    root.querySelector("#finish").addEventListener("click", onFinish);
    root.querySelector("#add-exercise").addEventListener("click", onAddExercise);
    root.querySelector("#rest-skip")?.addEventListener("click", () => {
      rest = null;
      root.querySelector("#rest-bar").hidden = true;
    });

    root.querySelectorAll(".exercise-card").forEach((card) => {
      const exerciseId = card.dataset.ex;
      const ex = workout.exercises.find((e) => e.exerciseId === exerciseId);
      if (isCardio(ex)) {
        wireCardioBlock(card, ex);
        return;
      }
      wireStrengthBlock(card, ex);
    });
  }

  function strengthBlock(ex) {
    return `
      ${planSetupLine(ex)}
      ${lastWeightLine(ex)}
      <div class="set-table">
        <div class="set-header"><span>#</span><span>kg</span><span></span><span>Wdh</span><span></span><span></span></div>
        ${ex.sets
          .map(
            (set, index) => `<div class="set-row ${set.done ? "is-done" : ""}" data-idx="${index}">
              <span class="set-index">${index + 1}</span>
              <input class="input set-input" inputmode="decimal" data-field="weight" value="${formatWeight(set.weight)}" aria-label="Gewicht" />
              <span class="set-x">×</span>
              <input class="input set-input" inputmode="numeric" data-field="reps" value="${set.reps || ""}" aria-label="Wiederholungen" />
              <button class="set-check" data-act="toggle" aria-label="Satz abschließen">${icon("check")}</button>
              <button class="set-delete" data-act="del-set" aria-label="Satz löschen">${icon("close")}</button>
            </div>`
          )
          .join("")}
      </div>
      <div class="setup-edit">
        <details>
          <summary>${icon("gear", "icon")} Einstellungen bearbeiten</summary>
          <div class="setup-grid">
            <label class="field"><span>Griff / Variante</span>
              <input class="input" data-setup="grip" value="${esc(ex.grip || "")}" placeholder="z. B. Seil" /></label>
            ${SETUP_FIELDS.map(
              (f) => `<label class="field"><span>${esc(f.label)}</span>
                <input class="input" inputmode="decimal" data-setup-num="${esc(f.key)}" value="${esc(setupValue(ex.setup, f.key))}" /></label>`
            ).join("")}
          </div>
          <label class="field"><span>Setup-Freitext</span>
            <input class="input" data-setup="setupText" value="${esc(ex.setupText || "")}" placeholder="z. B. Polster gerade" /></label>
        </details>
      </div>
      <button class="btn btn-ghost btn-sm btn-block" data-act="add-set">${icon("plus")} Satz</button>
    `;
  }

  function cardioBlock(ex) {
    const logged = ex.sets.filter((s) => s.done && s.durationSec);
    return `
      ${planSetupLine(ex)}
      <div class="cardio-display">
        <div class="cardio-time mono" id="cardio-time">0:00</div>
        <button class="btn btn-primary" data-act="cardio-toggle">${cardioRun?.exerciseId === ex.exerciseId ? "Stopp" : "Start"}</button>
      </div>
      ${
        logged.length
          ? `<div class="set-summary">${logged
              .map(
                (s) =>
                  `<span class="set-pill is-done">${esc(formatDuration(s.durationSec))}${s.bpm ? " · " + s.bpm + " BPM" : ""}</span>`
              )
              .join("")}</div>`
          : ""
      }
      <details class="setup-edit">
        <summary>${icon("gear", "icon")} Ziel & Hinweis bearbeiten</summary>
        <div class="field-grid">
          <label class="field"><span>Dauer (min)</span>
            <input class="input" inputmode="numeric" data-setup-num="duration" value="${ex.cardioMinutes ? Math.round(ex.cardioMinutes) : ""}" /></label>
          <label class="field"><span>Ziel-HF (BPM)</span>
            <input class="input" inputmode="numeric" data-setup-num="bpm" value="${ex.cardioTargetBpm ? Math.round(ex.cardioTargetBpm) : ""}" /></label>
        </div>
        <label class="field"><span>Notiz</span>
          <input class="input" data-setup="note" value="${esc(ex.note || "")}" placeholder="z. B. Aufwärmen, locker" /></label>
      </details>
    `;
  }

  function prefillFor(ex) {
    return nextSetSuggestion(ex, exerciseHistoryFor(ex.exerciseId), ex.targetRepsMin || 8);
  }

  function updateSetupInput(ex, input) {
    if (input.dataset.setupNum) {
      const key = input.dataset.setupNum;
      if (key === "duration") {
        const v = Math.max(0, Math.round(parseNumber(input.value)));
        ex.cardioMinutes = v;
      } else if (key === "bpm") {
        const v = Math.max(0, Math.round(parseNumber(input.value)));
        ex.cardioTargetBpm = v;
      } else {
        updateExerciseSetup(workout, ex.exerciseId, { [key]: parseOptionalNumber(input.value) });
      }
      return;
    }
    const field = input.dataset.setup;
    updateExerciseSetup(workout, ex.exerciseId, { [field]: input.value });
  }

  function wireStrengthBlock(card, ex) {
    card.querySelectorAll(".set-row").forEach((row) => {
      const index = Number(row.dataset.idx);
      row.querySelectorAll("[data-field]").forEach((input) => {
        input.addEventListener("change", () => {
          const value = input.dataset.field === "reps" ? Math.round(parseNumber(input.value)) : parseNumber(input.value);
          updateSet(workout, ex.exerciseId, index, { [input.dataset.field]: value });
          save();
          updateSummary();
        });
      });
      row.querySelector("[data-act='toggle']").addEventListener("click", () => {
        const set = ex.sets[index];
        updateSet(workout, ex.exerciseId, index, { done: !set.done });
        save();
        updateSummary();
        if (!set.done) {
          const pause = ex.restSec || 90;
          startRest(pause);
        }
        row.classList.toggle("is-done", set.done);
      });
      row.querySelector("[data-act='del-set']").addEventListener("click", () => {
        removeSet(workout, ex.exerciseId, index);
        save();
        draw();
      });
    });
    card.querySelector("[data-act='add-set']").addEventListener("click", () => {
      const fill = prefillFor(ex);
      addSet(workout, ex.exerciseId, { weight: fill.weight, reps: fill.reps });
      save();
      draw();
    });
    card.querySelector("[data-act='remove-ex']").addEventListener("click", async () => {
      const ok = await confirmDialog({
        title: "Übung entfernen?",
        message: "Die erfassten Sätze dieser Übung gehen verloren.",
        confirmText: "Entfernen",
        danger: true,
      });
      if (!ok) return;
      if (cardioRun?.exerciseId === ex.exerciseId) cardioRun = null;
      removeExercise(workout, ex.exerciseId);
      save();
      draw();
    });
    card.querySelectorAll("[data-setup], [data-setup-num]").forEach((input) => {
      input.addEventListener("change", () => {
        updateSetupInput(ex, input);
        save();
      });
    });
  }

  function wireCardioBlock(card, ex) {
    card.querySelectorAll("[data-setup], [data-setup-num]").forEach((input) => {
      input.addEventListener("change", () => {
        updateSetupInput(ex, input);
        save();
        draw();
      });
    });
    card.querySelector("[data-act='cardio-toggle']").addEventListener("click", () => {
      if (cardioRun && cardioRun.exerciseId === ex.exerciseId) {
        const durationSec = Math.max(1, Math.floor((Date.now() - cardioRun.startAt) / 1000));
        if (!ex.setup) ex.setup = {};
        addSet(workout, ex.exerciseId, { done: true, durationSec });
        cardioRun = null;
        save();
        draw();
        toast(`Cardio geloggt: ${formatDuration(durationSec)}`);
        return;
      }
      cardioRun = { exerciseId: ex.exerciseId, startAt: Date.now() };
      draw();
    });
    card.querySelector("[data-act='remove-ex']").addEventListener("click", async () => {
      const ok = await confirmDialog({
        title: "Cardio-Block entfernen?",
        message: "Die geloggten Einheiten dieser Übung gehen verloren.",
        confirmText: "Entfernen",
        danger: true,
      });
      if (!ok) return;
      if (cardioRun?.exerciseId === ex.exerciseId) cardioRun = null;
      removeExercise(workout, ex.exerciseId);
      save();
      draw();
    });
  }

  async function onAddExercise() {
    const picked = await exercisePicker(exercises, {
      title: "Übung oder Cardio-Gerät hinzufügen",
      excludeIds: workout.exercises.map((e) => e.exerciseId),
    });
    if (!picked) return;
    addExercise(workout, picked.id, { sets: 3, repsMin: 8, repsMax: 12, restSec: 90 });
    save();
    draw();
  }

  async function onFinish() {
    if (workoutSetCount(workout) === 0) {
      const ok = await confirmDialog({
        title: "Training verwerfen?",
        message: "Es wurde noch kein Satz und keine Cardio-Einheit abgeschlossen.",
        confirmText: "Verwerfen",
        danger: true,
      });
      if (ok) {
        store.clearActiveWorkout();
        toast("Training verworfen");
        location.hash = "#/";
      }
      return;
    }
    const ok = await confirmDialog({
      title: "Training beenden?",
      message: `${workoutSummaryLine(workout, { volume: formatVolume(workoutVolume(workout)) })}`,
      confirmText: "Beenden & speichern",
    });
    if (!ok) return;
    const finished = finishWorkout({
      ...workout,
      exercises: workout.exercises.filter((e) => e.sets.some((s) => s.done)),
    });
    await store.saveWorkout(finished);
    store.clearActiveWorkout();
    toast("Training gespeichert");
    location.hash = `#/workout/${finished.id}`;
  }

  ctx.onUnmount(() => {
    if (tick) clearInterval(tick);
  });
  tick = setInterval(updateTick, 1000);

  draw();
  updateTick();
  return root;
}

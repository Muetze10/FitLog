// ============================================================
// exercises.js – Übungsbibliothek: Liste, Suche, Detail, eigene Übungen.
// ============================================================

import * as store from "../store.js";
import { exerciseHistory, personalRecords } from "../core/stats.js";
import { formatDate, formatVolume, formatWeight } from "../core/format.js";
import { EQUIPMENT, MUSCLE_GROUPS, equipmentLabel, muscleLabel, validateExercise } from "../core/validation.js";
import { confirmDialog, icon, esc, openModal, toast } from "../ui.js";

function openExerciseForm(exercise = null, onSaved) {
  const isEdit = Boolean(exercise?.id);
  const draft = exercise
    ? { ...exercise }
    : { id: null, name: "", muscle: "brust", equipment: "maschine", custom: true };

  openModal(
    `<div class="modal-head">
       <h2 class="modal-title">${isEdit ? "Übung bearbeiten" : "Neue Übung"}</h2>
       <button class="icon-btn" data-close aria-label="Schließen">${icon("close")}</button>
     </div>
     <label class="field"><span>Name</span>
       <input class="input" id="ex-name" maxlength="60" value="${esc(draft.name)}" placeholder="z. B. Kabelrudern eng" />
     </label>
     <label class="field"><span>Muskelgruppe</span>
       <select class="input" id="ex-muscle">
         ${MUSCLE_GROUPS.map((m) => `<option value="${m.id}" ${m.id === draft.muscle ? "selected" : ""}>${m.label}</option>`).join("")}
       </select>
     </label>
     <label class="field"><span>Gerät</span>
       <select class="input" id="ex-equipment">
         ${EQUIPMENT.map((e) => `<option value="${e.id}" ${e.id === draft.equipment ? "selected" : ""}>${e.label}</option>`).join("")}
       </select>
     </label>
     <div class="modal-actions">
       <button class="btn btn-ghost" data-close>Abbrechen</button>
       <button class="btn btn-primary" id="ex-save">Speichern</button>
     </div>`,
    {
      onMount(dialog, close) {
        dialog.querySelector("#ex-save").addEventListener("click", async () => {
          draft.name = dialog.querySelector("#ex-name").value;
          draft.muscle = dialog.querySelector("#ex-muscle").value;
          draft.equipment = dialog.querySelector("#ex-equipment").value;
          const errors = validateExercise(draft);
          if (errors.length) {
            toast(errors[0], "error");
            return;
          }
          const saved = await store.saveExercise(draft);
          close();
          toast(isEdit ? "Übung aktualisiert" : "Übung angelegt");
          onSaved?.(saved);
        });
        setTimeout(() => dialog.querySelector("#ex-name").focus(), 40);
      },
    }
  );
}

export async function renderExercises(ctx) {
  ctx.setTitle("Übungen");
  const [exercises, workouts] = await Promise.all([store.listExercises(), store.listWorkouts()]);
  const records = new Map(personalRecords(workouts).map((r) => [r.exerciseId, r]));
  let query = "";
  let muscle = "alle";

  const root = document.createElement("div");
  root.className = "view";

  root.innerHTML = `
    <div class="section-head">
      <h2>Übungen</h2>
      <button class="btn btn-primary btn-sm" id="new-ex">${icon("plus")} Neu</button>
    </div>
    <label class="search-field">
      ${icon("search")}
      <input class="input" id="ex-search" type="search" placeholder="Übung suchen…" autocomplete="off" />
    </label>
    <div class="chip-row" id="muscle-chips">
      <button class="chip is-active" data-muscle="alle">Alle</button>
      ${MUSCLE_GROUPS.map((m) => `<button class="chip" data-muscle="${m.id}">${m.label}</button>`).join("")}
    </div>
    <div class="list" id="ex-list"></div>
  `;

  const listEl = root.querySelector("#ex-list");

  function drawList() {
    const q = query.trim().toLowerCase();
    const rows = exercises.filter(
      (e) =>
        (muscle === "alle" || e.muscle === muscle) &&
        (!q || e.name.toLowerCase().includes(q) || muscleLabel(e.muscle).toLowerCase().includes(q))
    );
    listEl.innerHTML = rows.length
      ? rows
          .map((e) => {
            const pr = records.get(e.id);
            return `<a class="list-row" href="#/uebung/${esc(e.id)}">
              <div>
                <strong>${esc(e.name)}</strong>
                <small class="muted">${esc(muscleLabel(e.muscle))} · ${esc(equipmentLabel(e.equipment))}${e.custom ? " · eigen" : ""}</small>
              </div>
              ${pr ? `<span class="badge">${formatWeight(pr.weight)} kg</span>` : `<span class="muted">${icon("chevron")}</span>`}
            </a>`;
          })
          .join("")
      : `<p class="empty">Keine Übung gefunden.</p>`;
  }

  root.querySelector("#ex-search").addEventListener("input", (e) => {
    query = e.target.value;
    drawList();
  });
  root.querySelector("#muscle-chips").addEventListener("click", (event) => {
    const chip = event.target.closest("[data-muscle]");
    if (!chip) return;
    muscle = chip.dataset.muscle;
    root.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-active", c === chip));
    drawList();
  });
  root.querySelector("#new-ex").addEventListener("click", () =>
    openExerciseForm(null, async () => {
      exercises.length = 0;
      exercises.push(...(await store.listExercises()));
      drawList();
    })
  );

  drawList();
  return root;
}

export async function renderExerciseDetail(ctx, { id }) {
  ctx.setTitle("Übung");
  const [exercises, workouts] = await Promise.all([store.listExercises(), store.listWorkouts()]);
  const exercise = exercises.find((e) => e.id === id);
  const root = document.createElement("div");
  root.className = "view";

  if (!exercise) {
    root.innerHTML = `<p class="empty">Übung nicht gefunden. <a class="link" href="#/uebungen">Zurück</a></p>`;
    return root;
  }

  const history = exerciseHistory(workouts, id);
  const records = personalRecords(workouts);
  const record = records.find((r) => r.exerciseId === id);
  const last = history[history.length - 1];
  const totalVolume = history.reduce((sum, h) => sum + h.volume, 0);

  root.innerHTML = `
    <a class="back-link" href="#/uebungen">${icon("chevron")} Übungen</a>
    <section>
      <h2>${esc(exercise.name)}</h2>
      <p class="muted">${esc(muscleLabel(exercise.muscle))} · ${esc(equipmentLabel(exercise.equipment))}${exercise.custom ? " · eigene Übung" : ""}</p>
      <div class="row-actions">
        ${exercise.custom ? `<button class="btn btn-ghost" id="edit">${icon("edit")} Bearbeiten</button><button class="icon-btn danger" id="delete" aria-label="Löschen">${icon("trash")}</button>` : ""}
      </div>
    </section>

    <section class="stat-row">
      <div class="stat"><span class="stat-value">${record ? formatWeight(record.weight) + " kg" : "–"}</span><span class="stat-label">Bester Satz</span></div>
      <div class="stat"><span class="stat-value">${record ? formatWeight(record.oneRM) + " kg" : "–"}</span><span class="stat-label">Bestes 1RM</span></div>
      <div class="stat"><span class="stat-value">${history.length}</span><span class="stat-label">Einheiten</span></div>
    </section>

    <section>
      <div class="section-head"><h3>Verlauf</h3></div>
      ${
        history.length
          ? `<div class="list">${history
              .slice()
              .reverse()
              .slice(0, 12)
              .map(
                (h) => `<div class="list-row">
                  <div>
                    <strong>${esc(formatDate(h.date))}</strong>
                    <small class="muted">Bester Satz ${formatWeight(h.bestWeight)} kg × ${h.bestReps} · ${formatVolume(h.volume)}</small>
                  </div>
                  <span class="badge">${formatWeight(h.oneRM)} kg 1RM</span>
                </div>`
              )
              .join("")}</div>`
          : `<p class="empty">Noch keine Daten. Sobald du diese Übung trainierst, erscheint hier der Verlauf.</p>`
      }
      ${last ? `<p class="hint">Zuletzt: ${esc(formatDate(last.date))} · ${formatVolume(totalVolume)} Gesamtvolumen</p>` : ""}
    </section>
  `;

  root.querySelector("#edit")?.addEventListener("click", () =>
    openExerciseForm(exercise, () => {
      location.reload();
    })
  );
  root.querySelector("#delete")?.addEventListener("click", async () => {
    const ok = await confirmDialog({
      title: "Übung löschen?",
      message: `„${exercise.name}" wird entfernt. Bereits gespeicherte Trainings bleiben unverändert.`,
      confirmText: "Löschen",
      danger: true,
    });
    if (!ok) return;
    try {
      await store.deleteExercise(exercise.id);
      toast("Übung gelöscht");
      location.hash = "#/uebungen";
    } catch (err) {
      toast(err.message, "error");
    }
  });

  return root;
}

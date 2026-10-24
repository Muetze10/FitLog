// ============================================================
// plans.js – Trainingspläne: Liste, Detail, Editor.
// Kraft- und Cardio-Blöcke inkl. Geräte-Einstellungen, Griff und
// Notizen; Presets kopieren/laden; JSON-Import/Export.
// ============================================================

import * as store from "../store.js";
import { startPlan } from "../actions.js";
import { validatePlan, muscleLabel } from "../core/validation.js";
import {
  GRIP_SUGGESTIONS,
  SETUP_FIELDS,
  blockTargetLine,
  cardioSummary,
  isCardio,
  moveBlock,
  normalizeBlock,
  parseOptionalNumber,
  setupSummary,
} from "../core/blocks.js";
import { confirmDialog, exercisePicker, openModal, onResult, icon, esc, toast } from "../ui.js";

const NUMERIC_FIELDS = ["sets", "repsMin", "repsMax", "restSec", "cardioMinutes", "cardioTargetBpm", "targetWeight"];
const SETUP_KEYS = SETUP_FIELDS.map((f) => f.key);

function displayName(name, id) {
  return name || id || "Unbenannt";
}

/** Plan als JSON-Datei herunterladen (Export einer Vorlage). */
function downloadPlan(plan) {
  const data = JSON.stringify({ app: "FitLog", type: "fitlog-plan", version: 1, plan }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(plan.name || "plan").replace(/[^\w äöüÄÖÜß-]/g, "_").trim()}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

/** Preset-/Vorlagen-Auswahl als Dialog. Liefert den Plan oder null. */
function presetPicker(plans, { excludeId = null, title = "Vorlage laden" } = {}) {
  return new Promise((resolve) => {
    const list = plans.filter((p) => p.id !== excludeId);
    openModal(
      `<div class="modal-head">
         <h2 class="modal-title">${esc(title)}</h2>
         <button class="icon-btn" data-close aria-label="Schließen">${icon("close")}</button>
       </div>
       ${
         list.length
           ? `<div class="pick-list">${list
               .map(
                 (p) => `<button class="pick-item" data-id="${esc(p.id)}">
                   <span>${esc(p.name)}</span>
                   <small>${p.exercises.length} Blöcke</small>
                 </button>`
               )
               .join("")}</div>`
           : `<p class="empty">Noch keine weiteren Pläne als Vorlage.</p>`
       }`,
      {
        onMount(dialog, closeFn) {
          onResult(dialog, (value) => resolve(value || null));
          dialog.querySelector(".pick-list")?.addEventListener("click", (event) => {
            const btn = event.target.closest("[data-id]");
            if (!btn) return;
            const chosen = list.find((p) => p.id === btn.dataset.id) || null;
            closeFn(chosen);
          });
        },
      }
    );
  });
}

// ============================================================
// Liste
// ============================================================

export async function renderPlans(ctx) {
  ctx.setTitle("Pläne");
  const [plans, exercises] = await Promise.all([store.listPlans(), store.listExercises()]);
  const nameOf = new Map(exercises.map((e) => [e.id, e.name]));
  const active = store.getActiveWorkout();

  const root = document.createElement("div");
  root.className = "view";
  root.innerHTML = `
    <div class="section-head">
      <h2>Trainingspläne</h2>
      <div class="head-actions">
        <button class="icon-btn" id="plan-import" aria-label="Vorlage importieren" title="Vorlage (JSON) importieren">${icon("upload")}</button>
        <input type="file" id="plan-import-file" accept="application/json,.json" hidden />
        <a class="btn btn-primary btn-sm" href="#/plan-neu">${icon("plus")} Neu</a>
      </div>
    </div>
    ${
      plans.length
        ? `<div class="plan-list">${plans
            .map(
              (p) => `<article class="card plan-card">
                <div class="card-head">
                  <div>
                    <h3><a class="plain-link" href="#/plan/${esc(p.id)}">${esc(p.name)}</a></h3>
                    <small class="muted">${p.exercises.length} Blöcke${p.description ? " · " + esc(p.description) : ""}</small>
                  </div>
                  <button class="icon-btn accent" data-start="${esc(p.id)}" aria-label="Plan starten">${icon("play")}</button>
                </div>
                <ul class="mini-ex-list">
                  ${p.exercises
                    .slice(0, 4)
                    .map((e, i) => {
                      const target = blockTargetLine(e);
                      return `<li><span>${i + 1}. ${esc(displayName(nameOf.get(e.exerciseId), e.exerciseId))}${
                        isCardio(e) ? " " + icon("heart", "icon icon-heart") : ""
                      }</span><small class="mono">${esc(target)}</small></li>`;
                    })
                    .join("")}
                  ${p.exercises.length > 4 ? `<li class="muted"><small>+ ${p.exercises.length - 4} weitere</small></li>` : ""}
                </ul>
              </article>`
            )
            .join("")}</div>`
        : `<p class="empty">Noch kein Plan. <a class="link" href="#/plan-neu">Ersten Plan anlegen</a></p>`
    }
    ${active ? `<p class="hint">Ein Training läuft bereits. <a class="link" href="#/training">Weitertrainieren</a></p>` : ""}
  `;

  root.querySelectorAll("[data-start]").forEach((btn) => {
    btn.addEventListener("click", () => startPlan(btn.dataset.start));
  });
  root.querySelector("#plan-import").addEventListener("click", () => root.querySelector("#plan-import-file").click());
  root.querySelector("#plan-import-file").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const plan = data?.plan || data;
      const errors = validatePlan(plan);
      if (errors.length) {
        toast(errors[0], "error");
        return;
      }
      const saved = await store.savePlan({ name: plan.name, description: plan.description, exercises: plan.exercises });
      toast(`Vorlage „${saved.name}" importiert`);
      location.hash = `#/plan/${saved.id}`;
    } catch (err) {
      toast(err?.message || "Import fehlgeschlagen", "error");
    } finally {
      event.target.value = "";
    }
  });
  return root;
}

// ============================================================
// Detail
// ============================================================

export async function renderPlanDetail(ctx, { id }) {
  ctx.setTitle("Plan");
  const [plans, exercises] = await Promise.all([store.listPlans(), store.listExercises()]);
  const plan = plans.find((p) => p.id === id);
  const byId = new Map(exercises.map((e) => [e.id, e]));
  const root = document.createElement("div");
  root.className = "view";

  if (!plan) {
    root.innerHTML = `<p class="empty">Plan nicht gefunden. <a class="link" href="#/plaene">Zurück</a></p>`;
    return root;
  }

  root.innerHTML = `
    <a class="back-link" href="#/plaene">${icon("chevron")} Pläne</a>
    <section>
      <h2>${esc(plan.name)}</h2>
      ${plan.description ? `<p class="muted">${esc(plan.description)}</p>` : ""}
      <div class="row-actions">
        <button class="btn btn-primary" id="start">${icon("play")} Plan starten</button>
        <a class="btn btn-ghost" href="#/plan/${esc(plan.id)}/bearbeiten">${icon("edit")} Bearbeiten</a>
        <button class="btn btn-ghost" id="copy">${icon("copy")} Als Vorlage speichern</button>
        <button class="btn btn-ghost" id="export">${icon("download")} JSON</button>
        <button class="icon-btn danger" id="delete" aria-label="Plan löschen">${icon("trash")}</button>
      </div>
    </section>
    <section>
      <div class="section-head"><h3>Blöcke</h3></div>
      <div class="plan-exercises">
        ${plan.exercises
          .map((e, index) => {
            const info = byId.get(e.exerciseId);
            const details = setupSummary(e);
            const cardio = isCardio(e);
            return `<div class="plan-ex-row ${cardio ? "is-cardio" : ""}">
              <div>
                <strong>${index + 1}. ${esc(info?.name || e.exerciseId)}${cardio ? " " + icon("heart", "icon icon-heart") : ""}</strong>
                <small class="muted">${cardio ? "Cardio" : esc(muscleLabel(info?.muscle))}${cardio && cardioSummary(e) ? " · " + esc(cardioSummary(e)) : ""}</small>
                ${!cardio && details ? `<div class="block-meta">${esc(details)}</div>` : ""}
              </div>
              <span class="badge">${esc(blockTargetLine(e))}</span>
            </div>`;
          })
          .join("")}
      </div>
    </section>
  `;

  root.querySelector("#start").addEventListener("click", () => startPlan(plan.id));
  root.querySelector("#copy").addEventListener("click", async () => {
    const saved = await store.duplicatePlan(plan.id);
    toast(`Vorlage „${saved.name}" gespeichert`);
    location.hash = `#/plan/${saved.id}`;
  });
  root.querySelector("#export").addEventListener("click", () => downloadPlan(plan));
  root.querySelector("#delete").addEventListener("click", async () => {
    const ok = await confirmDialog({
      title: "Plan löschen?",
      message: `„${plan.name}" wird dauerhaft entfernt. Bereits gespeicherte Trainings bleiben erhalten.`,
      confirmText: "Löschen",
      danger: true,
    });
    if (!ok) return;
    await store.deletePlan(plan.id);
    toast("Plan gelöscht");
    location.hash = "#/plaene";
  });
  return root;
}

// ============================================================
// Editor
// ============================================================

export async function renderPlanEditor(ctx, { id } = {}) {
  ctx.setTitle(id ? "Plan bearbeiten" : "Neuer Plan");
  const [plans, exercises] = await Promise.all([store.listPlans(), store.listExercises()]);
  const existing = id ? plans.find((p) => p.id === id) : null;
  const byId = new Map(exercises.map((e) => [e.id, e]));

  if (!existing && id) {
    const root = document.createElement("div");
    root.className = "view";
    root.innerHTML = `<p class="empty">Plan nicht gefunden. <a class="link" href="#/plaene">Zurück</a></p>`;
    return root;
  }

  const draft = existing
    ? structuredClone(existing)
    : { id: null, name: "", description: "", exercises: [] };
  draft.exercises = (draft.exercises || []).map(normalizeBlock);

  const root = document.createElement("div");
  root.className = "view";

  function valueFor(block, field) {
    const v = field.startsWith("setup.") ? block.setup?.[field.slice(6)] : block[field];
    if (v === null || v === undefined) return "";
    if (field === "targetWeight") return formatNum(v);
    return String(v);
  }

  function formatNum(n) {
    return String(Math.round(Number(n) * 100) / 100).replace(".", ",");
  }

  function draw() {
    root.innerHTML = `
      <a class="back-link" href="${draft.id ? `#/plan/${esc(draft.id)}` : "#/plaene"}">${icon("chevron")} Zurück</a>
      <section class="card">
        <label class="field">
          <span>Name</span>
          <input class="input" id="plan-name" value="${esc(draft.name)}" placeholder="z. B. Rücken + Beine" maxlength="60" />
        </label>
        <label class="field">
          <span>Beschreibung (optional)</span>
          <input class="input" id="plan-desc" value="${esc(draft.description || "")}" placeholder="z. B. 3× pro Woche" maxlength="120" />
        </label>
      </section>

      <section>
        <div class="section-head"><h3>Blöcke</h3></div>
        <div class="plan-exercises editor-bl">
          ${
            draft.exercises.length
              ? draft.exercises
                  .map((e, index) => {
                    const cardio = isCardio(e);
                    return `<div class="card plan-edit-row" data-idx="${index}">
                      <div class="card-head">
                        <div>
                          <strong><span class="mono muted">${index + 1}.</span> ${esc(displayName(byId.get(e.exerciseId)?.name, e.exerciseId))}</strong>
                          <small class="type-badge ${cardio ? "is-cardio" : ""}">${cardio ? "Cardio" : "Kraft"}</small>
                        </div>
                        <div class="row-btns">
                          <button class="icon-btn" data-act="up" aria-label="Nach oben" ${index === 0 ? "disabled" : ""}>${icon("up")}</button>
                          <button class="icon-btn" data-act="down" aria-label="Nach unten" ${index === draft.exercises.length - 1 ? "disabled" : ""}>${icon("down")}</button>
                          <button class="icon-btn danger" data-act="remove" aria-label="Entfernen">${icon("trash")}</button>
                        </div>
                      </div>

                      <div class="mini-toggle" role="group" aria-label="Blocktyp">
                        <button class="mini-toggle-btn" data-act="type" data-type="kraft" aria-pressed="${!cardio}">Kraft</button>
                        <button class="mini-toggle-btn" data-act="type" data-type="cardio" aria-pressed="${cardio}">${icon("heart", "icon icon-heart")} Cardio</button>
                      </div>

                      <div class="field-grid" ${cardio ? "hidden" : ""}>
                        <label class="field"><span>Sätze</span>
                          <input class="input" inputmode="numeric" data-field="sets" value="${valueFor(e, "sets")}" /></label>
                        <label class="field"><span>Wdh min</span>
                          <input class="input" inputmode="numeric" data-field="repsMin" value="${valueFor(e, "repsMin")}" /></label>
                        <label class="field"><span>Wdh max</span>
                          <input class="input" inputmode="numeric" data-field="repsMax" value="${valueFor(e, "repsMax")}" /></label>
                        <label class="field"><span>Pause (s)</span>
                          <input class="input" inputmode="numeric" data-field="restSec" value="${valueFor(e, "restSec")}" /></label>
                        <label class="field"><span>Ziel-Gewicht kg</span>
                          <input class="input" inputmode="decimal" data-field="targetWeight" value="${valueFor(e, "targetWeight")}" placeholder="z. B. 40" /></label>
                      </div>

                      <div class="field-grid" ${cardio ? "" : "hidden"}>
                        <label class="field"><span>Dauer (min)</span>
                          <input class="input" inputmode="numeric" data-field="cardioMinutes" value="${valueFor(e, "cardioMinutes")}" placeholder="z. B. 5" /></label>
                        <label class="field"><span>Ziel-HF (BPM)</span>
                          <input class="input" inputmode="numeric" data-field="cardioTargetBpm" value="${valueFor(e, "cardioTargetBpm")}" placeholder="z. B. 130" /></label>
                      </div>

                      <div class="setup-grid">
                        <label class="field setup-field"><span>Griff / Variante</span>
                          <input class="input" data-field="grip" value="${esc(e.grip || "")}" list="grip-list" placeholder="z. B. Seil" /></label>
                        ${SETUP_FIELDS.map(
                          (f) => `<label class="field setup-num"><span>${esc(f.label)}</span>
                            <input class="input" inputmode="decimal" data-field="setup.${esc(f.key)}" value="${valueFor(e, `setup.${f.key}`)}" /></label>`
                        ).join("")}
                      </div>
                      <div class="setup-grid">
                        <label class="field setup-text"><span>Setup-Freitext</span>
                          <input class="input" data-field="setupText" value="${esc(e.setupText || "")}" placeholder="z. B. Polster unten" /></label>
                      </div>
                      <label class="field"><span>Notiz</span>
                        <input class="input" data-field="note" value="${esc(e.note || "")}" placeholder="z. B. seitlich abwechselnd" /></label>
                    </div>`;
                  })
                  .join("")
              : `<p class="empty">Noch kein Block im Plan.</p>`
          }
        </div>
        <div class="editor-add">
          <button class="btn btn-ghost btn-block" id="add-ex">${icon("plus")} Übung hinzufügen</button>
          <button class="btn btn-ghost btn-block" id="add-cardio">${icon("heart")} Cardio-Block hinzufügen</button>
          <button class="btn btn-ghost btn-block" id="load-preset">${icon("copy")} Aus Vorlage laden</button>
        </div>
      </section>

      <button class="btn btn-primary btn-lg btn-block" id="save">Plan speichern</button>
      <datalist id="grip-list">
        ${GRIP_SUGGESTIONS.map((g) => `<option value="${esc(g)}"></option>`).join("")}
      </datalist>
    `;

    root.querySelector("#plan-name").addEventListener("change", (e) => (draft.name = e.target.value));
    root.querySelector("#plan-desc").addEventListener("change", (e) => (draft.description = e.target.value));

    root.querySelectorAll(".plan-edit-row").forEach((row) => {
      const index = Number(row.dataset.idx);
      const block = draft.exercises[index];

      row.querySelectorAll("[data-act='up'] , [data-act='down']").forEach((btn) => {
        btn.addEventListener("click", () => {
          const delta = btn.dataset.act === "up" ? -1 : 1;
          draft.exercises = moveBlock(draft.exercises, index, index + delta);
          draw();
        });
      });
      row.querySelector("[data-act='remove']").addEventListener("click", () => {
        draft.exercises.splice(index, 1);
        draw();
      });
      row.querySelectorAll("[data-act='type']").forEach((btn) => {
        btn.addEventListener("click", () => {
          const next = btn.dataset.type === "cardio" ? "cardio" : "kraft";
          if (block.type === next) return;
          block.type = next;
          if (next === "cardio" && !block.cardioMinutes) block.cardioMinutes = 20;
          draw();
        });
      });

      row.querySelectorAll("[data-field]").forEach((input) => {
        input.addEventListener("change", () => {
          const field = input.dataset.field;
          if (NUMERIC_FIELDS.includes(field)) {
            const raw = parseOptionalNumber(input.value);
            const n = Math.round(Number(raw ?? 0));
            block[field] = Math.max(0, n);
            input.value = field === "targetWeight" ? (raw === null ? "" : formatNum(block[field])) : String(Math.max(0, n));
          } else if (field.startsWith("setup.")) {
            const key = field.slice(6);
            if (!block.setup) block.setup = {};
            block.setup[key] = parseOptionalNumber(input.value);
            input.value = block.setup[key] === null ? "" : formatNum(block.setup[key]);
          } else if (SETUP_KEYS.includes(field)) {
            block[field] = parseOptionalNumber(input.value);
          } else {
            block[field] = String(input.value || "").trim();
          }
        });
      });
    });

    root.querySelector("#add-ex").addEventListener("click", async () => {
      const picked = await exercisePicker(exercises, {
        title: "Übung zum Plan hinzufügen",
        excludeIds: draft.exercises.map((e) => e.exerciseId),
      });
      if (!picked) return;
      draft.exercises.push(normalizeBlock({ exerciseId: picked.id, sets: 3, repsMin: 8, repsMax: 12, restSec: 90 }));
      draw();
    });

    root.querySelector("#add-cardio").addEventListener("click", async () => {
      const picked = await exercisePicker(exercises, {
        title: "Cardio-Gerät wählen",
        excludeIds: draft.exercises.map((e) => e.exerciseId),
      });
      if (!picked) return;
      draft.exercises.push(normalizeBlock({ exerciseId: picked.id, type: "cardio", cardioMinutes: 20, restSec: 0, repsMin: 1, repsMax: 1, sets: 1 }));
      draw();
    });

    root.querySelector("#load-preset").addEventListener("click", async () => {
      const preset = await presetPicker(plans, { excludeId: draft.id, title: "Aus Vorlage laden" });
      if (!preset) return;
      draft.exercises = (preset.exercises || []).map(normalizeBlock);
      toast(`Vorlage „${preset.name}" geladen`);
      draw();
    });

    root.querySelector("#save").addEventListener("click", async () => {
      const errors = validatePlan(draft);
      if (errors.length) {
        toast(errors[0], "error");
        return;
      }
      const saved = await store.savePlan(draft);
      toast("Plan gespeichert");
      location.hash = `#/plan/${saved.id}`;
    });
  }

  draw();
  return root;
}

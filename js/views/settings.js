// ============================================================
// settings.js – Einstellungen: Sicherung, Import, Daten löschen, Info.
// ============================================================

import * as db from "../db.js";
import * as store from "../store.js";
import { confirmDialog, icon, esc, openModal, onResult, toast } from "../ui.js";

const APP_VERSION = "1.0.0";

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function askImportMode() {
  return new Promise((resolve) => {
    const { close } = openModal(
      `<h2 class="modal-title">Sicherung importieren</h2>
       <p class="modal-text">Wie sollen die Daten aus der Datei übernommen werden?</p>
       <div class="modal-actions column">
         <button class="btn btn-primary" id="mode-replace">Alles ersetzen</button>
         <button class="btn btn-ghost" id="mode-merge">Zusammenführen</button>
         <button class="btn btn-ghost" data-close>Abbrechen</button>
       </div>`,
      {
        onMount(dialog, closeFn) {
          dialog.querySelector("#mode-replace").addEventListener("click", () => {
            closeFn("replace");
          });
          dialog.querySelector("#mode-merge").addEventListener("click", () => {
            closeFn("merge");
          });
          onResult(dialog, (value) => resolve(value || null));
        },
      }
    );
    void close;
  });
}

export async function renderSettings(ctx) {
  ctx.setTitle("Einstellungen");
  const estimate = await db.storageEstimate();
  const usage = estimate ? (estimate.usage / 1024 / 1024).toFixed(1) : null;
  const quota = estimate && estimate.quota ? (estimate.quota / 1024 / 1024 / 1024).toFixed(1) : null;

  // Trainings-Einstellungen laden (Defaults wie bisher im Code verankert).
  const [defaultRestSec, bumpStep, bumpMinReps, restNotify, vibrate] = await Promise.all([
    store.getSetting("defaultRestSec", 0),
    store.getSetting("bumpStepKg", 2.5),
    store.getSetting("bumpMinReps", 12),
    store.getSetting("restNotifyEnabled", true),
    store.getSetting("vibrateEnabled", true),
  ]);

  const root = document.createElement("div");
  root.className = "view";
  root.innerHTML = `
    <div class="section-head"><h2>Einstellungen</h2></div>

    <section class="card">
      <h3>Training</h3>
      <div class="settings-grid">
        <label class="field"><span>Standard-Satzpause (Sekunden)</span>
          <input class="input" id="set-rest" inputmode="numeric" value="${defaultRestSec > 0 ? Math.round(defaultRestSec) : ""}" placeholder="0 = wie Übung / Plan" />
        </label>
        <div class="chip-row" id="rest-presets" role="group" aria-label="Pausen-Vorlagen">
          <button class="btn btn-ghost btn-sm" data-sec="45">45 s</button>
          <button class="btn btn-ghost btn-sm" data-sec="60">60 s</button>
          <button class="btn btn-ghost btn-sm" data-sec="90">90 s</button>
          <button class="btn btn-ghost btn-sm" data-sec="120">120 s</button>
          <button class="btn btn-ghost btn-sm" data-sec="180">180 s</button>
          <button class="btn btn-ghost btn-sm" data-sec="0">Wie Übung</button>
        </div>
        <small class="muted">0 = die Pause der Übung bzw. des Plans gilt. Ein eigener Wert gilt für alle Übungen – außer du setzt die Pause einzeln in der Trainingsansicht („Einstellungen bearbeiten“).</small>

        <label class="field"><span>Steigerungsschritt (kg)</span>
          <input class="input" id="set-bump-step" inputmode="decimal" value="${bumpStep > 0 ? bumpStep : 2.5}" />
        </label>
        <label class="field"><span>Gewicht erhöhen ab (Wiederholungen)</span>
          <input class="input" id="set-bump-reps" inputmode="numeric" value="${bumpMinReps > 0 ? Math.round(bumpMinReps) : 12}" />
        </label>
        <small class="muted">Der Steigerungs-Dialog erscheint nach dem letzten Satz einer Übung, wenn die Wiederholungen über diesem Wert liegen. Der Schritt ist der Vorschlag im Dialog.</small>

        <label class="switch-row"><span>Pausen-Benachrichtigung</span>
          <input type="checkbox" id="set-notify" class="switch" ${restNotify ? "checked" : ""} />
        </label>
        <small class="muted">Der Pausen-Countdown läuft als Benachrichtigung weiter – auch ohne Bildschirm (Android / installierte PWA).</small>

        <label class="switch-row"><span>Vibration bei Pausenende</span>
          <input type="checkbox" id="set-vibrate" class="switch" ${vibrate ? "checked" : ""} />
        </label>
      </div>
    </section>

    <section class="card">
      <h3>Sicherung</h3>
      <p class="muted">Alle Daten liegen nur auf diesem Gerät. Exportiere regelmäßig eine Sicherung, bevor du den Browser-Speicher leerst oder das Handy wechselst.</p>
      <button class="btn btn-primary btn-block" id="export">${icon("download")} Sicherung exportieren</button>
      <button class="btn btn-ghost btn-block" id="import">${icon("upload")} Sicherung importieren</button>
      <input type="file" id="import-file" accept="application/json,.json" hidden />
    </section>

    <section class="card">
      <h3>Speicher</h3>
      <p class="muted">
        ${usage !== null ? `Belegt: ${usage} MB${quota ? ` von ca. ${quota} GB verfügbar` : ""}.` : "Speicherbelegung wird von diesem Browser nicht angezeigt."}
      </p>
    </section>

    <section class="card">
      <h3>Installation</h3>
      <p class="muted" id="sw-status">Offline-Status wird geprüft …</p>
      <p class="muted">FitLog läuft als installierbare Web-App und funktioniert danach ohne Internet. Auf Android: Chrome-Menü → „Zum Startbildschirm hinzufügen" → „Installieren". Am Besten einmal kurz online laden, damit der Offline-Cache vorbereitet wird.</p>
    </section>

    <section class="card">
      <h3>Daten</h3>
      <button class="btn btn-danger btn-block" id="reset">${icon("trash")} Alle Daten löschen</button>
      <p class="hint">Löscht Trainings, Pläne und eigene Übungen. Die Übungsbibliothek und der Ganzkörperplan werden neu angelegt.</p>
    </section>

    <section class="card about">
      <h3>FitLog ${APP_VERSION}</h3>
      <p class="muted">Krafttrainingstagebuch für Android. Offline, ohne Konto, ohne Tracking.</p>
    </section>
  `;

  // ---- Trainings-Einstellungen speichern #################################
  const parseNum = (v, fallback, min = 0) => {
    const n = Number(String(v).replace(",", "."));
    return Number.isFinite(n) && n >= min ? n : fallback;
  };

  const restInput = root.querySelector("#set-rest");
  const saveRest = () => {
    store.setSetting("defaultRestSec", parseNum(restInput.value, 0, 0));
    toast("Satzpause gespeichert");
  };
  restInput.addEventListener("change", saveRest);
  root.querySelectorAll("#rest-presets [data-sec]").forEach((btn) => {
    btn.addEventListener("click", () => {
      restInput.value = btn.dataset.sec === "0" ? "" : btn.dataset.sec;
      saveRest();
    });
  });

  const bumpStepInput = root.querySelector("#set-bump-step");
  bumpStepInput.addEventListener("change", () => {
    store.setSetting("bumpStepKg", parseNum(bumpStepInput.value, 2.5, 0.5));
    toast("Steigerungsschritt gespeichert");
  });

  const bumpRepsInput = root.querySelector("#set-bump-reps");
  bumpRepsInput.addEventListener("change", () => {
    store.setSetting("bumpMinReps", Math.round(parseNum(bumpRepsInput.value, 12, 1)));
    toast("Schwelle gespeichert");
  });

  root.querySelector("#set-notify").addEventListener("change", (ev) => {
    store.setSetting("restNotifyEnabled", ev.target.checked);
    toast(ev.target.checked ? "Pausen-Benachrichtigung an" : "Pausen-Benachrichtigung aus");
  });

  root.querySelector("#set-vibrate").addEventListener("change", (ev) => {
    store.setSetting("vibrateEnabled", ev.target.checked);
    toast(ev.target.checked ? "Vibration an" : "Vibration aus");
  });

  root.querySelector("#export").addEventListener("click", async () => {
    try {
      const data = await db.exportAll();
      const date = new Date().toISOString().slice(0, 10);
      downloadJson(data, `fitlog-sicherung-${date}.json`);
      toast("Sicherung exportiert");
    } catch (err) {
      toast(err.message || "Export fehlgeschlagen", "error");
    }
  });

  // Offline-Status: ist ein Service Worker registriert und aktiv?
  const swStatus = root.querySelector("#sw-status");
  if (!navigator.serviceWorker?.getRegistration) {
    swStatus.textContent = "Offline-Modus wird von diesem Browser nicht unterstützt.";
  } else {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      swStatus.innerHTML = reg?.active
        ? `${icon("check")} Offline-Cache aktiv – FitLog kann offline gestartet werden.`
        : "Noch nicht offline-ready. Einmal kurz online laden lassen (dauert ein paar Sekunden).";
    } catch {
      swStatus.textContent = "Offline-Status konnte nicht geprüft werden.";
    }
  }

  const fileInput = root.querySelector("#import-file");
  root.querySelector("#import").addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0];
    fileInput.value = "";
    if (!file) return;
    let data;
    try {
      data = JSON.parse(await file.text());
    } catch {
      toast("Datei ist kein gültiges JSON.", "error");
      return;
    }
    const mode = await askImportMode();
    if (!mode) return;
    try {
      await db.importAll(data, { mode });
      toast("Sicherung importiert");
      setTimeout(() => location.reload(), 600);
    } catch (err) {
      toast(err.message || "Import fehlgeschlagen", "error");
    }
  });

  root.querySelector("#reset").addEventListener("click", async () => {
    const ok = await confirmDialog({
      title: "Wirklich alles löschen?",
      message: "Trainings, Pläne und eigene Übungen werden dauerhaft entfernt. Eine Sicherung wird nicht automatisch angelegt.",
      confirmText: "Alles löschen",
      danger: true,
    });
    if (!ok) return;
    await db.deleteEverything();
    await store.ensureSeed();
    toast("Alle Daten gelöscht");
    setTimeout(() => location.reload(), 600);
  });

  return root;
}

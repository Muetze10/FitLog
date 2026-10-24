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

  const root = document.createElement("div");
  root.className = "view";
  root.innerHTML = `
    <div class="section-head"><h2>Einstellungen</h2></div>

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
      <p class="muted">FitLog läuft als installierbare Web-App und funktioniert danach ohne Internet. Auf Android: Chrome-Menü → „Zum Startbildschirm hinzufügen" → „Installieren".</p>
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

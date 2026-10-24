// ============================================================
// ui.js – kleine DOM-Helfer, Icons, Dialoge, Toast.
// Kein Framework, keine Abhängigkeiten.
// ============================================================

export function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  plan: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1.2"/><circle cx="3.5" cy="12" r="1.2"/><circle cx="3.5" cy="18" r="1.2"/>',
  dumbbell:
    '<path d="M6.5 6.5v11M3.5 9v5M17.5 6.5v11M20.5 9v5M6.5 12h11"/>',
  history: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/>',
  chart: '<path d="M4 20v-6M10 20V6M16 20v-9M22 20H2"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  check: '<path d="m4 12.5 5 5L20 6.5"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  play: '<path d="M7 4.5v15l13-7.5z"/>',
  download: '<path d="M12 3v12M7 11l5 5 5-5M4 21h16"/>',
  upload: '<path d="M12 21V9M7 13l5-5 5 5M4 3h16"/>',
  edit: '<path d="M4 20h4L20 8l-4-4L4 16z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>',
  flame: '<path d="M12 22c4 0 7-2.7 7-6.5 0-3-2-5.5-4-7.5-1.3 2-2 3.5-2 5.5-2-1.5-3-4-3-6-2 2.2-5 4.6-5 8C5 19.3 8 22 12 22z"/>',
  heart: '<path d="M12 20.5 4.9 13.4a4.9 4.9 0 0 1 6.9-7l.2.2.2-.2a4.9 4.9 0 0 1 6.9 7z"/>',
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  down: '<path d="M12 5v14M5 12l7 7 7-7"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
};

export function icon(name, cls = "icon") {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
}

let toastTimer = null;
export function toast(message, kind = "info") {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.className = "toast";
    document.body.append(el);
  }
  el.textContent = message;
  el.dataset.kind = kind;
  el.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), 2600);
}

function modalRoot() {
  let dialog = document.getElementById("modal");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "modal";
    dialog.className = "modal";
    document.body.append(dialog);
  }
  return dialog;
}

/** Öffnet einen Dialog. Rückgabe: { close }.
 *  resolve-Semantik: onMount erhält (dialog, close, setResult).
 *  `close()` stößt synchron das Auflösen der subscribed Promises an
 *  (setResult vor close = Rückgabewert), unabhängig vom "close"-Event,
 *  das je nach Manipulation (z. B. innerHTML= "") hinter dialog.close()
 *  unzuverlässig ausbleiben kann. */
export function openModal(html, { onMount } = {}) {
  const dialog = modalRoot();
  dialog.innerHTML = `<div class="modal-card">${html}</div>`;
  let result;
  let closed = false;
  const close = (value) => {
    if (value !== undefined) result = value;
    if (!closed) {
      closed = true;
      dialog.dispatchEvent(new CustomEvent("modalresult", { detail: result }));
    }
    if (dialog.open) dialog.close();
    dialog.innerHTML = "";
  };
  dialog.onclick = (event) => {
    if (event.target === dialog) close();
  };
  dialog.oncancel = (event) => {
    event.preventDefault();
    close();
  };
  dialog.showModal();
  dialog.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => close()));
  onMount?.(dialog, close, (value) => {
    result = value;
  });
  return { close };
}

/** Ergebnis-Abonnement für openModal: Löst synchron mit dem Schließen auf. */
export function onResult(dialog, fn) {
  dialog.addEventListener("modalresult", (event) => fn(event.detail), { once: true });
}

/** Ja/Nein-Dialog. Liefert true bei Bestätigung. */
export function confirmDialog({
  title = "Sicher?",
  message = "",
  confirmText = "Bestätigen",
  cancelText = "Abbrechen",
  danger = false,
} = {}) {
  return new Promise((resolve) => {
    openModal(
      `<h2 class="modal-title">${esc(title)}</h2>
       ${message ? `<p class="modal-text">${esc(message)}</p>` : ""}
       <div class="modal-actions">
         <button class="btn btn-ghost" data-close>${esc(cancelText)}</button>
         <button class="btn ${danger ? "btn-danger" : "btn-primary"}" id="modal-ok">${esc(confirmText)}</button>
       </div>`,
      {
        onMount(dialog, closeFn, setResult) {
          onResult(dialog, resolve);
          setResult(false); // Vorgabe: Abbrechen (auch bei Backdrop/Escape/data-close)
          dialog.querySelector("#modal-ok").addEventListener("click", () => {
            setResult(true);
            closeFn();
          });
        },
      }
    );
  });
}

/** Übungsauswahl mit Suche. Liefert die gewählte Übung oder null. */
export function exercisePicker(exercises, { title = "Übung wählen", excludeIds = [] } = {}) {
  return new Promise((resolve) => {
    const list = exercises.filter((e) => !excludeIds.includes(e.id));
    openModal(
      `<div class="modal-head">
         <h2 class="modal-title">${esc(title)}</h2>
         <button class="icon-btn" data-close aria-label="Schließen">${icon("close")}</button>
       </div>
       <label class="search-field">
         ${icon("search")}
         <input id="pick-search" class="input" type="search" placeholder="Übung suchen…" autocomplete="off" />
       </label>
       <div class="pick-list" id="pick-list"></div>`,
      {
        onMount(dialog, closeFn, setResult) {
          onResult(dialog, resolve);
          setResult(null); // Vorgabe: keine Auswahl (auch bei Backdrop/Escape/data-close)
          const listEl = dialog.querySelector("#pick-list");
          const input = dialog.querySelector("#pick-search");
          const draw = () => {
            const q = input.value.trim().toLowerCase();
            const rows = list.filter((e) => e.name.toLowerCase().includes(q) || e.muscle.includes(q));
            listEl.innerHTML = rows.length
              ? rows
                  .map(
                    (e) => `<button class="pick-item" data-id="${esc(e.id)}">
                      <span>${esc(e.name)}</span>
                      <small>${esc(muscleLabel(e.muscle))}</small>
                    </button>`
                  )
                  .join("")
              : `<p class="empty">Keine Übung gefunden.</p>`;
          };
          input.addEventListener("input", draw);
          listEl.addEventListener("click", (event) => {
            const btn = event.target.closest("[data-id]");
            if (!btn) return;
            setResult(list.find((e) => e.id === btn.dataset.id) || null);
            closeFn();
          });
          draw();
          setTimeout(() => input.focus(), 40);
        },
      }
    );
  });
}

// Wird hier importiert, damit exercisePicker die Anzeigenamen nutzen kann.
import { muscleLabel } from "./core/validation.js";

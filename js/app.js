// ============================================================
// app.js – Start, Router und Grundgerüst der App.
// ============================================================

import { ensureSeed, migrateData } from "./store.js";
import { renderHome } from "./views/home.js";
import { renderWorkout } from "./views/workout.js";
import { renderPlans, renderPlanDetail, renderPlanEditor } from "./views/plans.js";
import { renderExercises, renderExerciseDetail } from "./views/exercises.js";
import { renderHistory, renderWorkoutDetail } from "./views/history.js";
import { renderStats } from "./views/stats.js";
import { renderSettings } from "./views/settings.js";
import { icon } from "./ui.js";

const ROUTES = [
  { pattern: /^\/?$/, render: renderHome, tab: "home" },
  { pattern: /^\/training$/, render: renderWorkout, tab: null },
  { pattern: /^\/plaene$/, render: renderPlans, tab: "plaene" },
  { pattern: /^\/plan-neu$/, render: (ctx) => renderPlanEditor(ctx, {}), tab: "plaene" },
  { pattern: /^\/plan\/([^/]+)\/bearbeiten$/, render: (ctx, m) => renderPlanEditor(ctx, { id: m[1] }), tab: "plaene" },
  { pattern: /^\/plan\/([^/]+)$/, render: (ctx, m) => renderPlanDetail(ctx, { id: m[1] }), tab: "plaene" },
  { pattern: /^\/uebungen$/, render: renderExercises, tab: "uebungen" },
  { pattern: /^\/uebung\/([^/]+)$/, render: (ctx, m) => renderExerciseDetail(ctx, { id: m[1] }), tab: "uebungen" },
  { pattern: /^\/verlauf$/, render: renderHistory, tab: "verlauf" },
  { pattern: /^\/workout\/([^/]+)$/, render: (ctx, m) => renderWorkoutDetail(ctx, { id: m[1] }), tab: "verlauf" },
  { pattern: /^\/statistik$/, render: renderStats, tab: "statistik" },
  { pattern: /^\/einstellungen$/, render: renderSettings, tab: null },
];

const TABS = [
  { id: "home", href: "#/", label: "Heute", icon: "home" },
  { id: "plaene", href: "#/plaene", label: "Pläne", icon: "plan" },
  { id: "uebungen", href: "#/uebungen", label: "Übungen", icon: "dumbbell" },
  { id: "verlauf", href: "#/verlauf", label: "Verlauf", icon: "history" },
  { id: "statistik", href: "#/statistik", label: "Statistik", icon: "chart" },
];

const viewEl = document.getElementById("view");
const titleEl = document.getElementById("page-title");
const navEl = document.getElementById("tabbar");

let cleanup = null;

function buildShell() {
  navEl.innerHTML = TABS.map(
    (tab) => `<a class="tab" href="${tab.href}" data-tab="${tab.id}">
      ${icon(tab.icon)}
      <span>${tab.label}</span>
    </a>`
  ).join("");
}

function currentPath() {
  const hash = location.hash.replace(/^#/, "");
  return hash || "/";
}

function setActiveTab(tabId) {
  navEl.querySelectorAll(".tab").forEach((el) => {
    el.classList.toggle("is-active", el.dataset.tab === tabId);
  });
}

async function route() {
  if (cleanup) {
    try {
      cleanup();
    } catch {
      /* Aufräumen darf nie blockieren */
    }
    cleanup = null;
  }

  const path = currentPath();
  const match = ROUTES.map((r) => ({ route: r, m: path.match(r.pattern) })).find((x) => x.m);

  if (!match) {
    viewEl.innerHTML = `<div class="view"><p class="empty">Seite nicht gefunden. <a class="link" href="#/">Zur Startseite</a></p></div>`;
    return;
  }

  const ctx = {
    setTitle(title) {
      titleEl.textContent = title;
      document.title = title === "FitLog" ? "FitLog" : `${title} · FitLog`;
    },
    onUnmount(fn) {
      cleanup = fn;
    },
  };

  setActiveTab(match.route.tab);
  viewEl.innerHTML = `<div class="view"><p class="loading">Laden…</p></div>`;

  try {
    const node = await match.route.render(ctx, match.m);
    viewEl.replaceChildren(node);
    window.scrollTo({ top: 0 });
  } catch (err) {
    console.error(err);
    viewEl.innerHTML = `<div class="view">
      <h2>Etwas ist schiefgelaufen</h2>
      <p class="muted">${err?.message ? String(err.message) : "Unbekannter Fehler"}</p>
      <a class="btn btn-primary" href="#/">Zur Startseite</a>
    </div>`;
  }
}

async function start() {
  buildShell();
  document.getElementById("btn-settings").innerHTML = icon("gear");
  document.getElementById("btn-settings").addEventListener("click", () => {
    if (currentPath() === "/einstellungen") location.hash = "#/";
    else location.hash = "#/einstellungen";
  });

  try {
    await ensureSeed();
  } catch (err) {
    console.error("Startbefüllung fehlgeschlagen:", err);
  }

  try {
    await migrateData();
  } catch (err) {
    console.error("Migration fehlgeschlagen:", err);
  }

  window.addEventListener("hashchange", route);
  await route();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch((err) => {
        console.warn("Service Worker nicht registriert:", err);
      });
    });
  }
}

start();

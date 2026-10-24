// ============================================================
// db.js – IndexedDB-Zugriff (offline, nur lokal auf dem Gerät).
// Alle Funktionen sind Promise-basiert. Keine externen Abhängigkeiten.
// ============================================================

const DB_NAME = "fitlog";
const DB_VERSION = 1;
const STORES = ["exercises", "plans", "workouts", "settings"];

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(new Error("IndexedDB ist in diesem Browser nicht verfügbar."));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("exercises")) db.createObjectStore("exercises", { keyPath: "id" });
      if (!db.objectStoreNames.contains("plans")) db.createObjectStore("plans", { keyPath: "id" });
      if (!db.objectStoreNames.contains("workouts")) db.createObjectStore("workouts", { keyPath: "id" });
      if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings", { keyPath: "key" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("Datenbank konnte nicht geöffnet werden."));
    req.onblocked = () => reject(new Error("Datenbank ist durch ein anderes Fenster blockiert."));
  });
  return dbPromise;
}

function runRequest(store, mode, action) {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const os = tx.objectStore(store);
        let request;
        try {
          request = action(os);
        } catch (err) {
          reject(err);
          return;
        }
        tx.oncomplete = () => resolve(request ? request.result : undefined);
        tx.onerror = () => reject(tx.error || new Error("Datenbankfehler"));
        tx.onabort = () => reject(tx.error || new Error("Datenbankvorgang abgebrochen"));
      })
  );
}

export function getAll(store) {
  if (!STORES.includes(store)) return Promise.reject(new Error(`Unbekannter Store: ${store}`));
  return runRequest(store, "readonly", (os) => os.getAll());
}

export function getOne(store, key) {
  return runRequest(store, "readonly", (os) => os.get(key));
}

export function put(store, value) {
  return runRequest(store, "readwrite", (os) => os.put(value));
}

export function putMany(store, values) {
  return runRequest(store, "readwrite", (os) => {
    for (const v of values) os.put(v);
    return null;
  });
}

export function remove(store, key) {
  return runRequest(store, "readwrite", (os) => os.delete(key));
}

export function clear(store) {
  return runRequest(store, "readwrite", (os) => os.clear());
}

/** Vollständiger Export aller Daten als reines JSON-Objekt. */
export async function exportAll() {
  const [exercises, plans, workouts, settings] = await Promise.all(STORES.map((s) => getAll(s)));
  return {
    app: "FitLog",
    version: 1,
    exportedAt: new Date().toISOString(),
    exercises,
    plans,
    workouts,
    settings,
  };
}

/**
 * Importiert einen Export. `mode: "replace"` löscht vorher alles,
 * `mode: "merge"` ergänzt und überschreibt Datensätze mit gleicher ID.
 */
export async function importAll(data, { mode = "replace" } = {}) {
  if (!data || data.app !== "FitLog" || !Array.isArray(data.exercises)) {
    throw new Error("Das ist keine gültige FitLog-Sicherung.");
  }
  const db = await openDB();
  await new Promise((resolve, reject) => {
    const stores = mode === "replace" ? STORES : ["exercises", "plans", "workouts", "settings"];
    const tx = db.transaction(stores, "readwrite");
    if (mode === "replace") {
      for (const s of STORES) tx.objectStore(s).clear();
    }
    const write = (store, rows) => {
      for (const row of rows || []) tx.objectStore(store).put(row);
    };
    write("exercises", data.exercises);
    write("plans", data.plans);
    write("workouts", data.workouts);
    write("settings", data.settings);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error("Import fehlgeschlagen"));
    tx.onabort = () => reject(tx.error || new Error("Import abgebrochen"));
  });
  return true;
}

/** Löscht alle Daten (Einstellungen bleiben optional erhalten). */
export async function deleteEverything({ keepSettings = true } = {}) {
  await Promise.all([clear("exercises"), clear("plans"), clear("workouts")]);
  if (!keepSettings) await clear("settings");
}

/** Grobe Speicherbelegung in Bytes (falls der Browser es anbietet). */
export async function storageEstimate() {
  if (!navigator.storage?.estimate) return null;
  try {
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return { usage, quota };
  } catch {
    return null;
  }
}

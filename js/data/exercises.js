// ============================================================
// exercises.js – Startbestand der Übungsbibliothek (Fitnessstudio).
// IDs sind stabil und dürfen nie geändert werden (Datenbezug!).
// Neue Übungen: hier ergänzen oder in der App selbst anlegen.
// ============================================================

export const SEED_EXERCISES = [
  // ---------- Brust ----------
  { id: "bankdruecken-lh", name: "Bankdrücken (Langhantel)", muscle: "brust", equipment: "langhantel" },
  { id: "bankdruecken-kh", name: "Bankdrücken (Kurzhantel)", muscle: "brust", equipment: "kurzhantel" },
  { id: "schraegbankdruecken-lh", name: "Schrägbankdrücken (Langhantel)", muscle: "brust", equipment: "langhantel" },
  { id: "schraegbankdruecken-kh", name: "Schrägbankdrücken (Kurzhantel)", muscle: "brust", equipment: "kurzhantel" },
  { id: "fliegende-kh", name: "Fliegende (Kurzhantel)", muscle: "brust", equipment: "kurzhantel" },
  { id: "kabelzug-fliegende", name: "Kabelzug-Fliegende", muscle: "brust", equipment: "kabelzug" },
  { id: "brustpresse", name: "Brustpresse (Maschine)", muscle: "brust", equipment: "maschine" },
  { id: "dips-brust", name: "Dips (Brust)", muscle: "brust", equipment: "koerpergewicht" },

  // ---------- Rücken ----------
  { id: "klimmzuege", name: "Klimmzüge", muscle: "ruecken", equipment: "koerpergewicht" },
  { id: "latzug", name: "Latzug", muscle: "ruecken", equipment: "kabelzug" },
  { id: "rudern-lh", name: "Rudern (Langhantel)", muscle: "ruecken", equipment: "langhantel" },
  { id: "rudern-kh", name: "Rudern (Kurzhantel)", muscle: "ruecken", equipment: "kurzhantel" },
  { id: "rudern-kabel", name: "Rudern am Kabelzug", muscle: "ruecken", equipment: "kabelzug" },
  { id: "rudern-maschine", name: "Rudern (Maschine)", muscle: "ruecken", equipment: "maschine" },
  { id: "tbar-rudern", name: "T-Bar-Rudern", muscle: "ruecken", equipment: "langhantel" },
  { id: "kreuzheben", name: "Kreuzheben", muscle: "ruecken", equipment: "langhantel" },
  { id: "ueberzuege", name: "Überzüge (Kabelzug)", muscle: "ruecken", equipment: "kabelzug" },
  { id: "hyperextensions", name: "Hyperextensions", muscle: "ruecken", equipment: "koerpergewicht" },

  // ---------- Schultern ----------
  { id: "schulterdruecken-lh", name: "Schulterdrücken (Langhantel)", muscle: "schultern", equipment: "langhantel" },
  { id: "schulterdruecken-kh", name: "Schulterdrücken (Kurzhantel)", muscle: "schultern", equipment: "kurzhantel" },
  { id: "schulterpresse", name: "Schulterpresse (Maschine)", muscle: "schultern", equipment: "maschine" },
  { id: "seitheben", name: "Seitheben (Kurzhantel)", muscle: "schultern", equipment: "kurzhantel" },
  { id: "seitheben-kabel", name: "Seitheben (Kabelzug)", muscle: "schultern", equipment: "kabelzug" },
  { id: "vorgebeugtes-seitheben", name: "Vorgebeugtes Seitheben", muscle: "schultern", equipment: "kurzhantel" },
  { id: "face-pulls", name: "Face Pulls", muscle: "schultern", equipment: "kabelzug" },
  { id: "aufrechtes-rudern", name: "Aufrechtes Rudern", muscle: "schultern", equipment: "langhantel" },
  { id: "nackendruecken", name: "Nackendrücken (Maschine)", muscle: "schultern", equipment: "maschine" },

  // ---------- Bizeps ----------
  { id: "langhantel-curls", name: "Langhantel-Curls", muscle: "bizeps", equipment: "langhantel" },
  { id: "kurzhantel-curls", name: "Kurzhantel-Curls", muscle: "bizeps", equipment: "kurzhantel" },
  { id: "hammer-curls", name: "Hammer-Curls", muscle: "bizeps", equipment: "kurzhantel" },
  { id: "scott-curls", name: "Scott-Curls", muscle: "bizeps", equipment: "langhantel" },
  { id: "kabel-curls", name: "Kabel-Curls", muscle: "bizeps", equipment: "kabelzug" },
  { id: "konzentrations-curls", name: "Konzentrations-Curls", muscle: "bizeps", equipment: "kurzhantel" },

  // ---------- Trizeps ----------
  { id: "trizepsdruecken-kabel", name: "Trizepsdrücken (Kabelzug)", muscle: "trizeps", equipment: "kabelzug" },
  { id: "dips-trizeps", name: "Dips (Trizeps)", muscle: "trizeps", equipment: "koerpergewicht" },
  { id: "franzoesisch", name: "Französisches Drücken", muscle: "trizeps", equipment: "kurzhantel" },
  { id: "trizeps-kickbacks", name: "Trizeps-Kickbacks", muscle: "trizeps", equipment: "kurzhantel" },
  { id: "eng-bankdruecken", name: "Enges Bankdrücken", muscle: "trizeps", equipment: "langhantel" },
  { id: "trizeps-presse", name: "Trizeps-Presse (Maschine)", muscle: "trizeps", equipment: "maschine" },

  // ---------- Beine ----------
  { id: "kniebeugen", name: "Kniebeugen (Langhantel)", muscle: "beine", equipment: "langhantel" },
  { id: "frontkniebeugen", name: "Frontkniebeugen", muscle: "beine", equipment: "langhantel" },
  { id: "beinpresse", name: "Beinpresse", muscle: "beine", equipment: "maschine" },
  { id: "hackenschmidt", name: "Hackenschmidt", muscle: "beine", equipment: "maschine" },
  { id: "ausfallschritte", name: "Ausfallschritte (Kurzhantel)", muscle: "beine", equipment: "kurzhantel" },
  { id: "rumaenisches-kreuzheben", name: "Rumänisches Kreuzheben", muscle: "beine", equipment: "langhantel" },
  { id: "beinbeuger", name: "Beinbeuger (Maschine)", muscle: "beine", equipment: "maschine" },
  { id: "beinstrecker", name: "Beinstrecker (Maschine)", muscle: "beine", equipment: "maschine" },
  { id: "wadenheben-stehend", name: "Wadenheben (stehend)", muscle: "beine", equipment: "maschine" },
  { id: "wadenheben-sitzend", name: "Wadenheben (sitzend)", muscle: "beine", equipment: "maschine" },
  { id: "beinpresse-ei", name: "Einbeinige Beinpresse", muscle: "beine", equipment: "maschine" },

  // ---------- Gesäß ----------
  { id: "hip-thrust", name: "Hip Thrust", muscle: "gesaess", equipment: "langhantel" },
  { id: "glute-bridge", name: "Glute Bridge", muscle: "gesaess", equipment: "koerpergewicht" },
  { id: "kabel-kickbacks", name: "Kabel-Kickbacks (Gesäß)", muscle: "gesaess", equipment: "kabelzug" },
  { id: "abduktoren", name: "Abduktoren-Maschine", muscle: "gesaess", equipment: "maschine" },

  // ---------- Bauch ----------
  { id: "plank", name: "Plank (Unterarmstütz)", muscle: "bauch", equipment: "koerpergewicht" },
  { id: "crunches", name: "Crunches", muscle: "bauch", equipment: "koerpergewicht" },
  { id: "kabel-crunches", name: "Kabel-Crunches", muscle: "bauch", equipment: "kabelzug" },
  { id: "beinheben", name: "Beinheben (hängend)", muscle: "bauch", equipment: "koerpergewicht" },
  { id: "russian-twist", name: "Russian Twist", muscle: "bauch", equipment: "koerpergewicht" },
  { id: "ab-wheel", name: "Ab-Wheel", muscle: "bauch", equipment: "koerpergewicht" },

  // ---------- Ganzkörper ----------
  { id: "kreuzheben-rumaenisch-gh", name: "Kreuzheben (Rumänisch, Ganzkörper)", muscle: "ganzkoerper", equipment: "langhantel" },
  { id: "kettlebell-swing", name: "Kettlebell-Swing", muscle: "ganzkoerper", equipment: "kurzhantel" },
  { id: "farmers-walk", name: "Farmer's Walk", muscle: "ganzkoerper", equipment: "kurzhantel" },
];

/** Übungen mit stabilen, sprechenden IDs und ohne Duplikate. */
export function seedExercises() {
  return SEED_EXERCISES.map((e) => ({ ...e, custom: false }));
}

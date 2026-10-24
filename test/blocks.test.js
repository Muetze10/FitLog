import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GRIP_SUGGESTIONS,
  SETUP_FIELDS,
  blockTargetLine,
  cardioSummary,
  isCardio,
  moveBlock,
  normalizeBlock,
  normalizeSetup,
  parseOptionalNumber,
  setupSummary,
} from "../js/core/blocks.js";
import { validatePlan } from "../js/core/validation.js";

test("parseOptionalNumber akzeptiert Zahlen, Kommas und leere Werte", () => {
  assert.equal(parseOptionalNumber("8"), 8);
  assert.equal(parseOptionalNumber("82,5"), 82.5);
  assert.equal(parseOptionalNumber(8.5), 8.5);
  assert.equal(parseOptionalNumber(""), null);
  assert.equal(parseOptionalNumber(null), null);
  assert.equal(parseOptionalNumber("abc"), null);
  assert.equal(parseOptionalNumber("-3"), null);
});

test("normalizeSetup füllt alle Felder mit null", () => {
  assert.deepEqual(normalizeSetup({ sitz: 8, winkel: "2" }), { sitz: 8, winkel: 2, polster: null, fuss: null });
  assert.deepEqual(normalizeSetup(), { sitz: null, winkel: null, polster: null, fuss: null });
});

test("normalizeBlock ergänzt fehlende Felder alter Pläne", () => {
  const block = normalizeBlock({ exerciseId: "bankdruecken-lh", sets: 4, repsMin: 6, repsMax: 8, restSec: 180 });
  assert.equal(block.type, "kraft");
  assert.equal(block.targetWeight, 0);
  assert.equal(block.grip, "");
  assert.deepEqual(block.setup, { sitz: null, winkel: null, polster: null, fuss: null });
  assert.equal(block.cardioMinutes, 0);
});

test("normalizeBlock bewahrt Klasse-Blöcke: Dezimal-Einstellungen, Griff, Notiz", () => {
  const block = normalizeBlock({
    exerciseId: "beinpresse",
    sets: 4,
    repsMin: 8,
    repsMax: 10,
    restSec: 120,
    targetWeight: 71,
    grip: "Breiter Griff",
    setup: { sitz: "8", winkel: "2" },
    setupText: "Polster gerade",
    note: "langsamer ablassen",
  });
  assert.deepEqual(block.setup, { sitz: 8, winkel: 2, polster: null, fuss: null });
  assert.equal(block.targetWeight, 71);
  assert.equal(block.grip, "Breiter Griff");
  assert.equal(block.note, "langsamer ablassen");
});

test("isCardio erkennt Cardio-Blöcke, alte Blöcke gelten als Kraft", () => {
  assert.equal(isCardio({ type: "cardio" }), true);
  assert.equal(isCardio({}), false);
  assert.equal(isCardio({ type: "kraft" }), false);
});

test("setupSummary listet Griff, Zahlen und Freitext", () => {
  assert.equal(
    setupSummary({ grip: "Seil", setup: { sitz: 8, winkel: 2 }, setupText: "Polster gerade" }),
    "Seil · Sitz 8 · Winkel 2 · Polster gerade"
  );
  assert.equal(setupSummary({ note: "seitlich abwechselnd" }), "seitlich abwechselnd");
  assert.equal(setupSummary({}), "");
});

test("cardioSummary zeigt Dauer und Puls", () => {
  assert.equal(cardioSummary({ cardioMinutes: 5, cardioTargetBpm: 130 }), "5 min · 130 BPM");
  assert.equal(cardioSummary({ cardioMinutes: 20 }), "20 min");
  assert.equal(cardioSummary({}), "");
});

test("blockTargetLine für Kraft mit Gewicht", () => {
  assert.equal(blockTargetLine({ sets: 3, repsMin: 8, repsMax: 10 }), "3 × 8–10");
  assert.equal(blockTargetLine({ sets: 3, repsMin: 8, repsMax: 8, targetWeight: 40 }), "3 × 8 · 40 kg");
  assert.equal(blockTargetLine({ type: "cardio", cardioMinutes: 20, cardioTargetBpm: 160 }), "20 min · 160 BPM");
});

test("moveBlock schiebt Blöcke nach oben und unten", () => {
  const blocks = ["a", "b", "c"];
  assert.deepEqual(moveBlock(blocks, 1, 0), ["b", "a", "c"]);
  assert.deepEqual(moveBlock(blocks, 1, 2), ["a", "c", "b"]);
  assert.deepEqual(moveBlock(blocks, 0, 0), ["a", "b", "c"]);
  assert.deepEqual(moveBlock(blocks, -5, 5), ["b", "c", "a"]);
});

test("GRIP_SUGGESTIONS und SETUP_FIELDS existieren", () => {
  assert.ok(GRIP_SUGGESTIONS.includes("Seil"));
  assert.deepEqual(SETUP_FIELDS.map((f) => f.key), ["sitz", "winkel", "polster", "fuss"]);
});

test("validatePlan akzeptiert Cardio-Blöcke ohne Sätze", () => {
  assert.deepEqual(
    validatePlan({
      name: "Studio",
      exercises: [{ type: "cardio", cardioMinutes: 20, cardioTargetBpm: 160 }, { sets: 3, repsMin: 8, repsMax: 10 }],
    }),
    []
  );
  assert.ok(
    validatePlan({ name: "Studio", exercises: [{ type: "cardio", cardioMinutes: 0 }] }).length > 0,
    "Cardio braucht eine Dauer"
  );
});

import assert from "node:assert/strict";
import test from "node:test";
import { createStudentAliasPreview } from "../lib/teacher-onboarding/student-aliases.ts";

test("transforme immédiatement les noms complets sans les retourner", () => {
  const source = "Pelletier, Mathieu\nCamille Roy\nGagnon\tSamuel";
  const preview = createStudentAliasPreview(source);
  assert.deepEqual(preview.aliases, ["Mathieu P.", "Camille R.", "Samuel G."]);
  assert.doesNotMatch(JSON.stringify(preview), /Pelletier|Roy|Gagnon/);
});

test("signale les alias ambigus avant l’enregistrement", () => {
  const preview = createStudentAliasPreview("Mathieu Pelletier\nMathieu Parent");
  assert.deepEqual(preview.aliases, ["Mathieu P."]);
  assert.deepEqual(preview.ambiguousAliases, ["Mathieu P."]);
});

test("ignore les lignes qui ne peuvent pas être anonymisées", () => {
  const preview = createStudentAliasPreview("Mathieu Pelletier\nInconnu\n\n");
  assert.equal(preview.ignoredLineCount, 1);
});

test("reconnaît les colonnes Mozaïk ou GPI séparées par des barres", () => {
  const source = "| FIC11092407 | Gagnon | Léa | HST-401 | 4e sec. |\n| FIC12101809 | Lavoie | Thomas | HST-401 | 4e sec. |";
  const preview = createStudentAliasPreview(source);
  assert.deepEqual(preview.aliases, ["Léa G.", "Thomas L."]);
  assert.doesNotMatch(JSON.stringify(preview), /FIC|Gagnon|Lavoie|HST/);
});

test("ignore l’en-tête d’un tableau collé", () => {
  const preview = createStudentAliasPreview("| Fiche | Nom | Prénom | Groupe |\n| FIC123 | Côté | Emma | HST-401 |");
  assert.deepEqual(preview.aliases, ["Emma C."]);
  assert.equal(preview.ignoredLineCount, 1);
});

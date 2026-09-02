import assert from "node:assert/strict";
import test from "node:test";
import { activityTitleWithoutStudentIdentity } from "../lib/activity-title.ts";

test("retire toute identité élève des titres de consolidation", () => {
  assert.equal(activityTitleWithoutStudentIdentity("Consolidation personnalisée — Emma C."), "Consolidation personnalisée");
  assert.equal(activityTitleWithoutStudentIdentity("Consolidation personnalisée - Jacob B."), "Consolidation personnalisée");
  assert.equal(activityTitleWithoutStudentIdentity("Révision de l’Acte d’Union"), "Révision de l’Acte d’Union");
});

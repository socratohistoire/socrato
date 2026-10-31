import assert from "node:assert/strict";
import test from "node:test";

import { PEDAGOGICAL_QUESTION_CATALOG } from "../lib/pedagogical-reference/question-catalog.ts";

const explicitDistractorRejection = /\b(?:écarte(?:r|z)?|rejet(?:er|ez)?|distracteur|discrimin(?:er|ez))\b/iu;
const documentRejectionInGuide = /\bdocument(?:s)?\b[^.]{0,120}\b(?:écart\w*|rejet\w*|distracteur\w*|discrimin\w*)\b/iu;

test("aucune question n’exige de justifier le rejet d’un document distracteur", () => {
  for (const question of PEDAGOGICAL_QUESTION_CATALOG) {
    assert.doesNotMatch(question.instruction, explicitDistractorRejection, question.id);
    assert.doesNotMatch(question.expectedAnswer, documentRejectionInGuide, question.id);
    for (const commonError of question.commonErrors) {
      assert.doesNotMatch(commonError, documentRejectionInGuide, question.id);
    }
  }
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  RIEL_POLITICAL_DILEMMA_CARTOON_DOCUMENT,
  RIEL_POLITICAL_DILEMMA_DOCUMENTS,
  RIEL_PRIVY_COUNCIL_MEMORANDUM_DOCUMENT,
  RIEL_SENTENCE_NON_INTERVENTION_DOCUMENT,
} from "../lib/pedagogical-reference/federal-provincial-relations-primary-documents.ts";
import { validateHistoricalDocument } from "../lib/pedagogical-reference/historical-document.ts";
import { PEDAGOGICAL_QUESTION_CATALOG, RIEL_POLITICAL_DILEMMA_QUESTION } from "../lib/pedagogical-reference/question-catalog.ts";

test("la question sur le dilemme politique de Macdonald réunit la caricature et le mémoire officiel", () => {
  assert.equal(RIEL_POLITICAL_DILEMMA_QUESTION.operationId, "causal_connections");
  assert.deepEqual(RIEL_POLITICAL_DILEMMA_QUESTION.historicalDocumentIds, ["RFP-I-004", "RFP-T-022", "RFP-T-023"]);
  assert.match(RIEL_POLITICAL_DILEMMA_QUESTION.prompt, /deux éléments de la caricature/);
  assert.match(RIEL_POLITICAL_DILEMMA_QUESTION.expectedAnswer, /English Influence/);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.includes(RIEL_POLITICAL_DILEMMA_QUESTION));
});

test("les deux documents sont documentés, lisibles et historiquement nuancés", () => {
  for (const document of RIEL_POLITICAL_DILEMMA_DOCUMENTS) {
    assert.deepEqual(validateHistoricalDocument(document), {});
  }

  assert.equal(RIEL_POLITICAL_DILEMMA_CARTOON_DOCUMENT.historicalDate, "29 août 1885");
  assert.match(RIEL_POLITICAL_DILEMMA_CARTOON_DOCUMENT.interpretationCautions.join(" "), /avant l’exécution/);
  assert.match(RIEL_PRIVY_COUNCIL_MEMORANDUM_DOCUMENT.transcription, /\[…\]/);
  assert.match(RIEL_PRIVY_COUNCIL_MEMORANDUM_DOCUMENT.transcription, /partisanes, religieuses et nationales/);
  assert.match(RIEL_SENTENCE_NON_INTERVENTION_DOCUMENT.transcription, /laisser la loi suivre son cours/);
  assert.match(RIEL_SENTENCE_NON_INTERVENTION_DOCUMENT.historicalContext, /ne l’a pas commuée/);

  const image = readFileSync("public/historical-documents/riel-ugly-position-bengough-1885-annotated-v3.png");
  assert.ok(image.byteLength > 1_000_000);
});

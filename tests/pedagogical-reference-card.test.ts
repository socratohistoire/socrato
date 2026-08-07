import assert from "node:assert/strict";
import test from "node:test";
import {
  createEmptyNotionReferenceCard,
  getIntellectualOperation,
  INTELLECTUAL_OPERATIONS,
  INTELLECTUAL_OPERATION_IDS,
  INTELLECTUAL_OPERATION_SOURCES,
  isNotionReferenceCardReady,
  validateNotionReferenceCard,
  type NotionReferenceCard,
  type SourcedStatement,
} from "../lib/pedagogical-reference/index.ts";

const officialSource = {
  id: "pfeq-hqc",
  kind: "official-program" as const,
  title: "Programme de formation – Histoire du Québec et du Canada",
  publisher: "Gouvernement du Québec",
  url: "https://cdn-contenu.quebec.ca/programme.pdf",
  locator: "p. 49",
  verificationStatus: "verified" as const,
};

function statement(id: string, text: string): SourcedStatement {
  return { id, text, sourceIds: [officialSource.id] };
}

function completeCard(status: NotionReferenceCard["status"] = "ready-for-review"): NotionReferenceCard {
  return {
    ...createEmptyNotionReferenceCard("acte-union"),
    status,
    summary: statement("summary", "Synthèse historique fictive et sourcée."),
    context: statement("context", "Contexte historique fictif et sourcé."),
    historicalSignificance: statement("significance", "Importance historique fictive et sourcée."),
    expectedDepth: "Profondeur adaptée à la quatrième secondaire.",
    compatibleOperationIds: ["establish_facts", "causes_and_consequences"],
    sourceCatalog: [officialSource],
  };
}

test("crée une fiche vide uniquement pour une rubrique officielle", () => {
  const card = createEmptyNotionReferenceCard("acte-union");
  assert.equal(card.schemaVersion, 2);
  assert.equal(card.id, "reference-card:acte-union");
  assert.equal(card.historicalRecordId, "historical-record:acte-union");
  assert.equal(card.status, "not-started");
  assert.equal(card.summary, null);
  assert.deepEqual(card.sourceCatalog, []);
  assert.throws(() => createEmptyNotionReferenceCard("notion-inconnue"), /inconnue/);
});

test("fixe les sept opérations intellectuelles canoniques", () => {
  assert.deepEqual(INTELLECTUAL_OPERATION_IDS, [
    "time_and_space",
    "establish_facts",
    "differences_and_similarities",
    "causes_and_consequences",
    "changes_and_continuities",
    "relationships_between_facts",
    "causal_connections",
  ]);
  assert.deepEqual(INTELLECTUAL_OPERATIONS.map(({ officialOrder }) => officialOrder), [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(getIntellectualOperation("differences_and_similarities").officialLabel, "Dégager des différences et des similitudes");
  assert.ok(INTELLECTUAL_OPERATIONS.every(({ expectedBehaviors, sourceIds }) => expectedBehaviors.length > 0 && sourceIds.length > 0));
  const sourceIds = new Set(INTELLECTUAL_OPERATION_SOURCES.map(({ id }) => id));
  assert.ok(INTELLECTUAL_OPERATIONS.every((operation) => operation.sourceIds.every((id) => sourceIds.has(id))));
});

test("autorise une fiche brouillon incomplète sans la déclarer prête à valider", () => {
  const card = { ...createEmptyNotionReferenceCard("acte-union"), status: "draft" as const };
  assert.deepEqual(validateNotionReferenceCard(card), {});
  assert.equal(isNotionReferenceCardReady(card), false);
});

test("exige le noyau éditorial et des sources vérifiées avant la validation", () => {
  const card = { ...createEmptyNotionReferenceCard("acte-union"), status: "ready-for-review" as const };
  const errors = validateNotionReferenceCard(card);
  assert.match(errors.core ?? "", /obligatoires/);
  assert.match(errors.sources ?? "", /source vérifiée/);
});

test("accepte une fiche complète prête à valider", () => {
  assert.deepEqual(validateNotionReferenceCard(completeCard()), {});
});

test("refuse une affirmation sans source vérifiée et les références inconnues", () => {
  const card = completeCard();
  card.summary = { ...card.summary!, sourceIds: ["source-inconnue"] };
  card.relationships = [
    {
      ...statement("relation", "Relation historique fictive."),
      relationshipType: "connection",
      relatedKnowledgeHeadingIds: ["notion-inconnue"],
    },
  ];
  const errors = validateNotionReferenceCard(card);
  assert.match(errors.sources ?? "", /source vérifiée/);
  assert.match(errors.relationships ?? "", /inconnue/);
});

test("exige une validation complète pour approuver une fiche", () => {
  const card = completeCard("approved");
  assert.match(validateNotionReferenceCard(card).review ?? "", /liste de validation/);

  card.validation = {
    checklist: {
      alignedWithOfficialProgram: true,
      historicallyAccurate: true,
      sufficientlySourced: true,
      neutralAndNuanced: true,
      appropriateForSecondaryFour: true,
      internallyConsistent: true,
      pedagogicallyRelevant: true,
      documentLinksReviewed: true,
    },
    reviewerComment: "Fiche pilote approuvée.",
    approvedVersion: "1.0",
    approvedAt: "2026-07-30",
  };
  assert.deepEqual(validateNotionReferenceCard(card), {});
});

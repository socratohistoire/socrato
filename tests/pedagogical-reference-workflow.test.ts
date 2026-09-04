import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  acceptHistoricalRecordReviewItems,
  ACTE_UNION_HISTORICAL_RECORD,
  RESPONSIBLE_GOVERNMENT_HISTORICAL_RECORD,
  ACTE_UNION_CAUSAL_PILOT_QUESTION,
  ACTE_UNION_TIMELINE_PROTOTYPE_QUESTION,
  ACTE_UNION_TIMELINE_CAUSAL_DEVELOPMENT_QUESTION,
  ACTE_UNION_DEFINITION_MULTIPLE_CHOICE_QUESTION,
  ACTE_UNION_DURHAM_DEFINITION_MULTIPLE_CHOICE_QUESTION,
  ACTE_UNION_EQUAL_REPRESENTATION_MULTIPLE_CHOICE_QUESTION,
  ACTE_UNION_LANGUAGE_MULTIPLE_CHOICE_QUESTION,
  ACTE_UNION_PROVINCE_SECTIONS_SHORT_ANSWER_QUESTION,
  ACTE_UNION_RESPONSIBLE_GOVERNMENT_SHORT_ANSWER_QUESTION,
  ACTE_UNION_SHARED_DEBT_SHORT_ANSWER_QUESTION,
  ACTE_UNION_LAFONTAINE_OPPOSITION_SHORT_ANSWER_QUESTION,
  ACTE_UNION_DOCUMENT_SOURCE_CATALOG,
  createEmptyApprovedQuestion,
  createEmptyHistoricalRecord,
  PEDAGOGICAL_REFERENCE_PILOTS,
  PEDAGOGICAL_QUESTION_CATALOG,
  getQuestionsForKnowledgeHeading,
  validateApprovedQuestion,
  validateHistoricalRecord,
  canApproveHistoricalRecord,
  countHistoricalRecordReview,
  createHistoricalRecordReviewDraft,
  getHistoricalRecordReviewItems,
} from "../lib/pedagogical-reference/index.ts";

test("documente la monographie du gouvernement responsable sans l’approuver", () => {
  const record = RESPONSIBLE_GOVERNMENT_HISTORICAL_RECORD;
  assert.equal(record.id, "historical-record:gouvernement-responsable");
  assert.equal(record.status, "draft");
  assert.ok(record.manual.sections.length >= 7);
  assert.ok(record.manual.sections.flatMap(({ paragraphs }) => paragraphs).length >= 20);
  assert.deepEqual(record.chronologicalMarkers.map(({ sortYear }) => sortYear), [1841, 1842, 1843, 1848, 1849, 1864]);
  assert.ok(record.knowledgePrecisions.every(({ coverageStatus, linkedStatementIds }) => coverageStatus === "complete" && linkedStatementIds.length > 0));
  assert.ok(record.misconceptions.some(({ misconception }) => /indépendant/.test(misconception)));
  assert.ok(record.expectedLearning.some(({ text }) => /La Fontaine-Baldwin/.test(text)));
  assert.deepEqual(record.knowledgePrecisions.map(({ officialLabel }) => officialLabel), [
    "Alliance des Réformistes",
    "Fonctionnement du gouvernement responsable",
    "Instabilité ministérielle",
  ]);
  assert.ok(record.manual.sections.some(({ id }) => id === "gr-mono-instability"));
  assert.deepEqual(record.manual.sections.map(({ id }) => id), [
    "gr-mono-definition",
    "gr-mono-union",
    "gr-mono-alliance",
    "gr-mono-crises",
    "gr-mono-1848",
    "gr-mono-effects",
    "gr-mono-instability",
    "gr-mono-limits",
  ]);
  assert.deepEqual(validateHistoricalRecord(record), {});
});

test("sépare formellement le dossier, la fiche et la question", () => {
  const record = createEmptyHistoricalRecord("acte-union");
  const question = createEmptyApprovedQuestion("acte-union", 1);
  assert.equal(record.id, "historical-record:acte-union");
  assert.equal(question.historicalRecordId, record.id);
  assert.equal(question.referenceCardId, "reference-card:acte-union");
  assert.equal(question.scope, "notional");
  assert.deepEqual(question.relatedKnowledgeHeadingIds, ["acte-union"]);
});

test("relie explicitement les acquis de 3e secondaire au début de la 4e secondaire", () => {
  const bridge = ACTE_UNION_HISTORICAL_RECORD.manual.sections.find(({ id }) => id === "mono-secondary-three-bridge");
  assert.ok(bridge);
  assert.equal(bridge.paragraphs.length, 10);
  assert.deepEqual(ACTE_UNION_HISTORICAL_RECORD.manual.sections.map(({ id }) => id), [
    "mono-before-union",
    "mono-secondary-three-bridge",
    "mono-durham",
    "mono-adoption",
    "mono-introduction",
    "mono-reactions",
    "mono-structure",
    "mono-representation",
    "mono-administration",
    "mono-language-territory",
    "mono-consequences",
  ]);
  assert.match(bridge.paragraphs.at(-1)?.text ?? "", /92 Résolutions.*résolutions Russell.*Rébellions.*Durham.*Acte d’Union/);
  assert.ok(ACTE_UNION_HISTORICAL_RECORD.sourceCatalog.some(({ id }) => id === "anq-chronology-1837-1838"));
  assert.ok(ACTE_UNION_HISTORICAL_RECORD.sourceCatalog.some(({ id }) => id === "canada-discover-rebellions-1837-1838"));
});

test("répertorie aussi les sources de la banque de documents dans le catalogue de l’Acte d’Union", () => {
  const catalogUrls = new Set(ACTE_UNION_HISTORICAL_RECORD.sourceCatalog.map(({ url }) => url).filter(Boolean));
  assert.ok(ACTE_UNION_DOCUMENT_SOURCE_CATALOG.length > 20);
  for (const source of ACTE_UNION_DOCUMENT_SOURCE_CATALOG) assert.ok(catalogUrls.has(source.url), source.url);
  assert.equal(catalogUrls.size, ACTE_UNION_HISTORICAL_RECORD.sourceCatalog.filter(({ url }) => url).length);
});

test("ajoute une seule dérivation non redondante sur les 92 Résolutions et la réponse Russell", () => {
  const objectives = ACTE_UNION_HISTORICAL_RECORD.expectedLearning;
  const comparison = objectives.find(({ id }) => id === "e-demands-response");
  const chain = objectives.find(({ id }) => id === "e-chain");
  assert.ok(comparison);
  assert.deepEqual(comparison.operationIds, ["differences_and_similarities", "relationships_between_facts"]);
  assert.match(chain?.text ?? "", /92 Résolutions.*résolutions Russell.*Rébellions.*rapport Durham.*Acte d’Union/);
  assert.equal(objectives.filter(({ text }) => /Comparer les principales demandes des 92 Résolutions/.test(text)).length, 1);
  assert.equal(new Set(objectives.map(({ id }) => id)).size, objectives.length);
  assert.ok(ACTE_UNION_HISTORICAL_RECORD.chronologicalMarkers.some(({ id }) => id === "c-ninety-two-resolutions"));
  assert.ok(ACTE_UNION_HISTORICAL_RECORD.chronologicalMarkers.some(({ id }) => id === "c-russell-resolutions"));
});

test("complète les faits essentiels sans répéter ceux déjà présents", () => {
  const facts = ACTE_UNION_HISTORICAL_RECORD.narrative;
  assert.deepEqual(facts.slice(0, 3).map(({ id }) => id), ["ninety-two-resolutions", "russell-resolutions", "context"]);
  assert.match(facts[0]?.text ?? "", /Conseil législatif électif.*exécutif.*revenus publics/);
  assert.match(facts[1]?.text ?? "", /refusent.*Conseil législatif électif.*exécutif responsable.*revenus/);
  assert.match(facts[2]?.text ?? "", /morts.*arrestations.*pendaisons.*déportations.*exils.*Conseil spécial/);
  assert.equal(new Set(facts.map(({ id }) => id)).size, facts.length);
  assert.equal(facts.filter(({ text }) => /92 Résolutions/.test(text)).length, 1);
  assert.equal(facts.filter(({ text }) => /résolutions Russell/.test(text)).length, 1);
});

test("empêche l’approbation d’un dossier ou d’une question non documentés", () => {
  const record = { ...createEmptyHistoricalRecord("acte-union"), status: "approved" as const };
  const question = { ...createEmptyApprovedQuestion("acte-union", 1), status: "approved" as const };
  assert.ok(Object.keys(validateHistoricalRecord(record)).length > 0);
  assert.ok(Object.keys(validateApprovedQuestion(question)).length > 0);
});

test("prépare trois dossiers pilotes, trente-cinq questions approuvées et quatorze questions du gouvernement responsable à valider", () => {
  assert.deepEqual(PEDAGOGICAL_REFERENCE_PILOTS.map(({ knowledgeHeadingId }) => knowledgeHeadingId), [
    "acte-union",
    "premiere-phase-d-industrialisation",
    "revolution-tranquille",
  ]);
  assert.ok(PEDAGOGICAL_REFERENCE_PILOTS.every(({ questionDraft }) => questionDraft.status === "not-started" && !questionDraft.prompt));
  assert.equal(PEDAGOGICAL_QUESTION_CATALOG.length, 49);
  assert.equal(PEDAGOGICAL_QUESTION_CATALOG.filter(({ status }) => status === "approved").length, 35);
  assert.ok(PEDAGOGICAL_QUESTION_CATALOG.every((question) => Object.keys(validateApprovedQuestion(question)).length === 0));
  assert.equal(getQuestionsForKnowledgeHeading("acte-union").length, 34);
  assert.equal(getQuestionsForKnowledgeHeading("gouvernement-responsable").length, 15);
  assert.ok(getQuestionsForKnowledgeHeading("gouvernement-responsable").some(({ prompt }) => /incendie du Parlement/.test(prompt)));
  const responsibleTimeline = getQuestionsForKnowledgeHeading("gouvernement-responsable").find(({ format }) => format === "interactive-timeline");
  assert.ok(responsibleTimeline?.timelineInteraction);
  assert.deepEqual(responsibleTimeline.timelineInteraction.dates, ["1841", "1841-1842", "1843", "1848", "1849", "1854-1864", "1864"]);
  assert.equal(responsibleTimeline.timelineInteraction.entries.length, 7);
  const responsibleDevelopment = getQuestionsForKnowledgeHeading("gouvernement-responsable").find(({ format }) => format === "development-150");
  assert.equal(responsibleDevelopment?.operationId, "causal_connections");
  assert.deepEqual(responsibleDevelopment?.historicalDocumentIds, ["GR-D-001"]);
  assert.match(responsibleDevelopment?.prompt ?? "", /Grande Coalition en 1864 \(150 mots\)/);
  assert.deepEqual(validateApprovedQuestion(responsibleDevelopment!), {});
  const elginRole = getQuestionsForKnowledgeHeading("gouvernement-responsable").find(({ prompt }) => prompt === "Quel rôle lord Elgin joue-t-il dans l’obtention du gouvernement responsable en 1848?");
  assert.equal(elginRole?.format, "short-answer");
  assert.equal(elginRole?.operationId, "causal_connections");
  const elginLetterInterpretation = getQuestionsForKnowledgeHeading("gouvernement-responsable").find(({ id }) => id === "question:gouvernement-responsable:document-interpretation-004");
  assert.equal(elginLetterInterpretation?.operationId, "relationships_between_facts");
  assert.deepEqual(elginLetterInterpretation?.historicalDocumentIds, ["GR-T-006"]);
  const coalitionInterpretation = getQuestionsForKnowledgeHeading("gouvernement-responsable").find(({ id }) => id === "question:gouvernement-responsable:document-interpretation-005");
  assert.equal(coalitionInterpretation?.prompt, "Pourquoi d’anciens adversaires politiques forment-ils la Grande Coalition en 1864?");
  assert.deepEqual(coalitionInterpretation?.historicalDocumentIds, ["GR-T-007"]);
  const causalChain = getQuestionsForKnowledgeHeading("gouvernement-responsable").find(({ causalChainInteraction }) => causalChainInteraction);
  assert.equal(causalChain?.format, "short-answer");
  assert.deepEqual(causalChain?.historicalDocumentIds, []);
  assert.equal(causalChain?.causalChainInteraction?.steps.length, 6);
  assert.ok(causalChain?.causalChainInteraction?.steps.find(({ id }) => id === "gr-chain-1848")?.acceptedAnswers.includes("responsabilité ministérielle"));
  assert.ok(causalChain?.causalChainInteraction?.steps.find(({ id }) => id === "gr-chain-cause")?.acceptedAnswers.includes("les coalitions sont fragiles"));
  assert.ok(causalChain?.causalChainInteraction?.steps.find(({ id }) => id === "gr-chain-cause")?.acceptedAnswers.includes("appui des deux sections"));
  assert.equal(causalChain?.causalChainInteraction?.steps.at(-1)?.expectedAnswer, "La Grande Coalition");
  const functioning = getQuestionsForKnowledgeHeading("gouvernement-responsable").find(({ id }) => id === "question:gouvernement-responsable:short-answer-003");
  assert.deepEqual(functioning?.historicalDocumentIds, ["GR-D-002"]);
  const instability = getQuestionsForKnowledgeHeading("gouvernement-responsable").find(({ id }) => id === "question:gouvernement-responsable:short-answer-005");
  assert.deepEqual(instability?.historicalDocumentIds, ["GR-T-011", "GR-T-012", "GR-T-013", "GR-T-007"]);
  assert.equal(instability?.sourceCatalog.length, 4);
  const limitedParticipation = getQuestionsForKnowledgeHeading("gouvernement-responsable").find(({ prompt }) => /toute la population ne participe pas/.test(prompt));
  assert.deepEqual(limitedParticipation?.historicalDocumentIds, ["GR-T-001-P1"]);
  assert.match(limitedParticipation?.expectedAnswer ?? "", /exclut explicitement toutes les femmes du vote/);
  assert.ok(responsibleTimeline.timelineInteraction.entries.some(({ date, title }) => date === "1848" && /gouvernement responsable/i.test(title)));
  assert.ok(responsibleTimeline.sourceCatalog.every(({ verificationStatus }) => verificationStatus === "verified"));
  assert.equal(ACTE_UNION_CAUSAL_PILOT_QUESTION.status, "approved");
  assert.deepEqual(ACTE_UNION_CAUSAL_PILOT_QUESTION.historicalDocumentIds, ["PAT-T-002", "PAT-T-003", "PAT-T-007"]);
  assert.deepEqual(validateApprovedQuestion(ACTE_UNION_CAUSAL_PILOT_QUESTION), {});
  assert.equal(ACTE_UNION_TIMELINE_PROTOTYPE_QUESTION.status, "approved");
  assert.deepEqual(validateApprovedQuestion(ACTE_UNION_TIMELINE_PROTOTYPE_QUESTION), {});
  assert.equal(ACTE_UNION_TIMELINE_PROTOTYPE_QUESTION.timelineInteraction.entries.length, 6);
  assert.equal(ACTE_UNION_TIMELINE_CAUSAL_DEVELOPMENT_QUESTION.format, "development-150");
  assert.deepEqual(validateApprovedQuestion(ACTE_UNION_TIMELINE_CAUSAL_DEVELOPMENT_QUESTION), {});
  assert.deepEqual(validateApprovedQuestion(ACTE_UNION_DEFINITION_MULTIPLE_CHOICE_QUESTION), {});
  assert.deepEqual(validateApprovedQuestion(ACTE_UNION_DURHAM_DEFINITION_MULTIPLE_CHOICE_QUESTION), {});
  assert.deepEqual(validateApprovedQuestion(ACTE_UNION_EQUAL_REPRESENTATION_MULTIPLE_CHOICE_QUESTION), {});
  assert.deepEqual(validateApprovedQuestion(ACTE_UNION_LANGUAGE_MULTIPLE_CHOICE_QUESTION), {});
  assert.deepEqual(validateApprovedQuestion(ACTE_UNION_PROVINCE_SECTIONS_SHORT_ANSWER_QUESTION), {});
  assert.deepEqual(validateApprovedQuestion(ACTE_UNION_RESPONSIBLE_GOVERNMENT_SHORT_ANSWER_QUESTION), {});
  assert.deepEqual(validateApprovedQuestion(ACTE_UNION_SHARED_DEBT_SHORT_ANSWER_QUESTION), {});
  assert.deepEqual(validateApprovedQuestion(ACTE_UNION_LAFONTAINE_OPPOSITION_SHORT_ANSWER_QUESTION), {});
});

test("documente le dossier pilote de l’Acte d’Union sans l’approuver", () => {
  assert.equal(ACTE_UNION_HISTORICAL_RECORD.status, "draft");
  assert.equal(ACTE_UNION_HISTORICAL_RECORD.manual.audience, "internal-pedagogical-reference");
  assert.ok(ACTE_UNION_HISTORICAL_RECORD.manual.sections.length >= 10);
  assert.match(ACTE_UNION_HISTORICAL_RECORD.manual.editorialMethod ?? "", /Synthèse originale/);
  assert.match(ACTE_UNION_HISTORICAL_RECORD.manual.scopeBoundary ?? "", /prochaine notion/);
  assert.deepEqual(ACTE_UNION_HISTORICAL_RECORD.knowledgePrecisions.map(({ officialLabel }) => officialLabel), [
    "Contexte sociopolitique et économique",
    "Structure politique",
    "Dispositions administratives",
    "Territoire de la Province du Canada",
  ]);
  assert.ok(ACTE_UNION_HISTORICAL_RECORD.knowledgePrecisions.every(({ coverageStatus, linkedStatementIds }) => coverageStatus === "complete" && linkedStatementIds.length > 0));
  const manualParagraphs = ACTE_UNION_HISTORICAL_RECORD.manual.sections.flatMap(({ paragraphs }) => paragraphs);
  assert.ok(manualParagraphs.length >= 50);
  assert.ok(manualParagraphs.every(({ sourceIds }) => sourceIds.length > 0));
  const manualTables = ACTE_UNION_HISTORICAL_RECORD.manual.sections.flatMap(({ tables = [] }) => tables);
  const manualTableRows = manualTables.flatMap(({ rows }) => rows);
  assert.ok(manualTables.length >= 3);
  assert.ok(manualTableRows.length >= 10);
  assert.ok(manualTableRows.every(({ sourceIds, cells }) => sourceIds.length > 0 && cells.length > 0));
  const populationEstimate = manualTableRows.find(({ id }) => id === "table-pop-lower-1841-estimate");
  assert.match(populationEstimate?.text ?? "", /650 000/);
  assert.match(populationEstimate?.cells.join(" ") ?? "", /1841 \(estimation\)/);
  assert.match(manualParagraphs.find(({ id }) => id === "mono-population-1")?.text ?? "", /Il ne s’agit pas d’un recensement réalisé en 1841/);
  const verifiedSourceIds = new Set(ACTE_UNION_HISTORICAL_RECORD.sourceCatalog.filter(({ verificationStatus }) => verificationStatus === "verified").map(({ id }) => id));
  assert.ok([...manualParagraphs, ...manualTableRows].every(({ sourceIds }) => sourceIds.every((sourceId) => verifiedSourceIds.has(sourceId))));
  assert.ok(ACTE_UNION_HISTORICAL_RECORD.narrative.length >= 10);
  assert.ok(ACTE_UNION_HISTORICAL_RECORD.chronologicalMarkers.length >= 8);
  assert.ok(ACTE_UNION_HISTORICAL_RECORD.sourceCatalog.length >= 8);
  assert.ok(ACTE_UNION_HISTORICAL_RECORD.vocabulary.length >= 5);
  assert.ok(ACTE_UNION_HISTORICAL_RECORD.misconceptions.length >= 5);
  assert.match(ACTE_UNION_HISTORICAL_RECORD.expectedLearning[0]?.text ?? "", /Expliquer ce qu’est l’Acte d’Union/);
  assert.ok(ACTE_UNION_HISTORICAL_RECORD.expectedLearning.every(({ origin, programBasis, knowledgeFocus, operationIds }) => origin === "socrato-editorial-derivation" && programBasis.length > 0 && knowledgeFocus.length > 0 && operationIds.length > 0));
  assert.ok(ACTE_UNION_HISTORICAL_RECORD.sourceCatalog.every(({ verificationStatus }) => verificationStatus === "verified"));
  assert.deepEqual(validateHistoricalRecord(ACTE_UNION_HISTORICAL_RECORD), {});
});

test("approuve sans refaire une liste de contrôle lorsque tout le contenu est validé", () => {
  const review = createHistoricalRecordReviewDraft(ACTE_UNION_HISTORICAL_RECORD);
  const items = getHistoricalRecordReviewItems(ACTE_UNION_HISTORICAL_RECORD);
  assert.equal(canApproveHistoricalRecord(ACTE_UNION_HISTORICAL_RECORD, review), false);
  assert.deepEqual(review.corrections, {});
  assert.ok(items.length >= 150);
  assert.deepEqual(countHistoricalRecordReview(ACTE_UNION_HISTORICAL_RECORD, review), { accepted: 0, changesRequested: 0, pending: items.length, total: items.length });
  for (const { id } of items) review.decisions[id] = "accepted";
  review.reviewerName = "Responsable du référentiel";
  assert.equal(canApproveHistoricalRecord(ACTE_UNION_HISTORICAL_RECORD, review), true);
});

test("valide un groupe sans effacer les corrections déjà signalées", () => {
  const review = createHistoricalRecordReviewDraft(ACTE_UNION_HISTORICAL_RECORD);
  const chapterIds = ACTE_UNION_HISTORICAL_RECORD.manual.sections[0]!.paragraphs.map(({ id }) => id);
  review.decisions[chapterIds[0]!] = "changes-requested";
  review.corrections[chapterIds[0]!] = { itemId: chapterIds[0]!, comment: "À revoir", status: "open", requestedAt: "2026-07-31T00:00:00.000Z", resolvedAt: null };
  const updated = acceptHistoricalRecordReviewItems(review, chapterIds);
  assert.equal(updated.decisions[chapterIds[0]!], "changes-requested");
  assert.ok(chapterIds.slice(1).every((id) => updated.decisions[id] === "accepted"));
  assert.equal(updated.status, "draft");
  assert.equal(updated.approvedAt, null);
  const approvalAttempt = { ...updated, decisions: { ...updated.decisions }, reviewerName: "Responsable" };
  for (const id of Object.keys(approvalAttempt.decisions)) approvalAttempt.decisions[id] = "accepted";
  assert.equal(canApproveHistoricalRecord(ACTE_UNION_HISTORICAL_RECORD, approvalAttempt), false);
  approvalAttempt.corrections[chapterIds[0]!] = { ...approvalAttempt.corrections[chapterIds[0]!]!, status: "resolved", resolvedAt: "2026-07-31T01:00:00.000Z" };
  approvalAttempt.corrections["ancien-identifiant"] = { itemId: "ancien-identifiant", comment: "Historique conservé", status: "open", requestedAt: "2026-07-30T00:00:00.000Z", resolvedAt: null };
  assert.equal(canApproveHistoricalRecord(ACTE_UNION_HISTORICAL_RECORD, approvalAttempt), true);
});

test("expose le module local Administration → Référentiel pédagogique", () => {
  const source = readFileSync("app/admin/pedagogical-reference/page.tsx", "utf8");
  assert.match(source, /Administration/);
  assert.match(source, /Banque de questions/);
  const view = readFileSync("app/admin/pedagogical-reference/reference-validation-view.tsx", "utf8");
  assert.match(view, /Référentiel pédagogique/);
  const styles = readFileSync("app/admin/pedagogical-reference/pedagogical-reference.css", "utf8");
  assert.match(styles, /\.reference-period-grid\{align-items:start\}/);
  assert.match(view, /Monographie/);
  assert.match(view, />Documents historiques<\/Link>/);
  assert.doesNotMatch(view, />Banque de documents historiques<\/Link>/);
  assert.match(view, /Structure pédagogique/);
  assert.match(view, /\["appropriation", "Approbation"\]/);
  assert.match(view, />Questions<\/Link>/);
  assert.doesNotMatch(view, /\["appropriation", "Appropriation"\]/);
  assert.doesNotMatch(view, /\["sources", "Sources"\]/);
  assert.doesNotMatch(view, /activeSection === "sources"/);
  assert.match(view, /aucune source manquante/);
  assert.match(view, /Valider la vérification des sources/);
  const notionTabs = readFileSync("app/admin/pedagogical-reference/notion-tabs.tsx", "utf8");
  assert.match(notionTabs, /\["questions", "Questions"\]/);
  assert.match(notionTabs, /questions\?notion=/);
  const questionBankPage = readFileSync("app/admin/pedagogical-reference/questions/page.tsx", "utf8");
  assert.match(questionBankPage, /Un seul catalogue, organisé selon les quatre périodes/);
  assert.match(questionBankPage, /PEDAGOGICAL_QUESTION_CATALOG/);
  assert.match(questionBankPage, /SECONDARY_FOUR_PERIODS\.map/);
  assert.match(questionBankPage, /Questions transversales/);
  assert.match(questionBankPage, /searchParams: Promise<QuestionBankQuery>/);
  assert.match(styles, /\.review-tabs\{gap:6px\}/);
  assert.match(view, /\["operations", "Opérations intellectuelles"\]/);
  assert.match(view, /record\.manual\.sections\.map/);
  assert.match(view, /Monographie soumise à révision/);
  assert.doesNotMatch(view, /reading-section--new-bridge/);
  assert.doesNotMatch(view, /reading-paragraph--new-bridge/);
  assert.match(view, /Méthode éditoriale/);
  assert.match(view, /Comment lire les références/);
  assert.match(view, /Sources du passage/);
  assert.match(view, /source-note-/);
  assert.match(view, /Source \{number\}/);
  assert.match(view, /Annexe A — Chronologie essentielle/);
  assert.match(view, /Précisions des connaissances/);
  assert.match(view, /Couverture ministérielle obligatoire/);
  assert.doesNotMatch(view, /Audit du manuel/);
  assert.match(view, /Affirmations essentielles/);
  assert.match(view, /Repères structurés/);
  assert.match(view, /Objectifs de maîtrise proposés/);
  assert.match(view, /Opérations intellectuelles officielles/);
  assert.match(view, /Comportements attendus/);
  assert.match(view, /Dérivation éditoriale de Socrato/);
  assert.match(view, /validateGroup/);
  assert.match(view, /pageValidation/);
  assert.match(view, /Valider cette monographie/);
  assert.match(view, /Retour en haut/);
  assert.match(view, /href="#reference-top"/);
  assert.match(view, /Valider la structure pédagogique/);
  assert.match(view, /Valider les opérations intellectuelles/);
  assert.ok(view.indexOf("Objectifs de maîtrise proposés") < view.indexOf("Opérations intellectuelles officielles"));
  assert.ok(view.indexOf("Objectifs de maîtrise proposés") < view.indexOf("Relations historiques"));
  assert.ok(view.indexOf("Relations historiques") < view.indexOf("Opérations intellectuelles officielles"));
  assert.match(view, /Valider la vérification des sources/);
  assert.doesNotMatch(view, /Signaler une correction/);
  assert.doesNotMatch(view, /Source vérifiée/);
  assert.match(view, /StatementReferences/);
  assert.match(view, /Approuver le dossier/);
  assert.match(view, /Approbation finale/);
  assert.doesNotMatch(view, /Liste de contrôle finale/);
  assert.doesNotMatch(view, /approval-checklist/);
  assert.doesNotMatch(view, /Cadre institutionnel à confirmer/);
  assert.doesNotMatch(view, /Décrire la correction/);
  assert.match(view, /Historique des révisions/);
  assert.match(view, /EDITORIAL_REVISION_LOG/);
  assert.match(view, /Réorganisation complète du texte en ordre chronologique/);
  assert.match(view, /Anciennes corrections enregistrées/);
  assert.match(styles, /\.correction-history>summary/);
  assert.match(view, /Dossier d’approbation/);
  assert.match(view, /review\.status === "approved" \? "Documenté" : "En validation"/);
  assert.match(view, /ont été validées/);
  assert.doesNotMatch(view, /Confirmer les corrections demandées/);
  assert.doesNotMatch(view, /submitChanges/);
  assert.match(view, /localStorage/);
});

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT,
  ACTE_UNION_BERMUDA_EXILE_DOCUMENT,
  ACTE_UNION_DURHAM_DOCUMENT,
  ACTE_UNION_DURHAM_PRESENTATIONS,
  ACTE_UNION_DEBT_COMPARISON_CHART,
  ACTE_UNION_HISTORICAL_DOCUMENT_NEEDS,
  ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT,
  ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT,
  ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT,
  ACTE_UNION_POPULATION_COMPARISON_CHART,
  ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT,
  ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT,
  ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT,
  ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT,
  ACTE_UNION_MAP_ADAPTATION_DRAFT,
  ACTE_UNION_MAP_CANDIDATES,
  RESPONSIBLE_GOVERNMENT_ICONOGRAPHIC_DOCUMENTS,
  RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT,
  RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_PRESENTATION,
  PATRIOTES_ICONOGRAPHIC_DOCUMENTS,
  PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT,
  PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT,
  PATRIOTES_MINERVE_BRITISH_REFUSAL_RESISTANCE_DOCUMENT,
  PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT,
  PATRIOTES_MINERVE_RESIGNATION_DOCUMENT,
  PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT,
  PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT,
  ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM,
  ACTE_UNION_STUDENT_TIMELINE,
  validateHistoricalDocument,
  validateHistoricalDocumentPresentation,
  type HistoricalDocumentRecord,
} from "../lib/pedagogical-reference/index.ts";

test("conserve un seul rapport Durham et sept présentations élèves retenues", () => {
  assert.equal(ACTE_UNION_DURHAM_DOCUMENT.status, "approved");
  assert.equal(ACTE_UNION_DURHAM_DOCUMENT.creator, "John George Lambton, comte de Durham");
  assert.match(ACTE_UNION_DURHAM_DOCUMENT.rightsStatement, /domaine public/);
  assert.equal(ACTE_UNION_DURHAM_PRESENTATIONS.length, 7);
  assert.ok(ACTE_UNION_DURHAM_PRESENTATIONS.every(({ documentId }) => documentId === ACTE_UNION_DURHAM_DOCUMENT.id));
  assert.ok(ACTE_UNION_DURHAM_PRESENTATIONS.every(({ status, contentSelectionStatus }) => status === "approved" && contentSelectionStatus === "retained"));
  assert.ok(ACTE_UNION_DURHAM_PRESENTATIONS.every(({ sourceSegmentLocators, sourceUrls, observationGuide, interpretationCautions }) => sourceSegmentLocators.length > 0 && sourceUrls.length === 3 && observationGuide.length > 0 && interpretationCautions.length > 0));
  assert.deepEqual(ACTE_UNION_DURHAM_PRESENTATIONS.map(({ title }) => title), [
    "Le diagnostic de Durham",
    "Le projet d’anglicisation",
    "Pourquoi Durham propose l’Union",
    "Revenus, dette et travaux publics",
    "La responsabilité ministérielle",
    "Les continuités après l’Union",
    "L’anglais et l’avancement politique",
  ]);
  assert.ok(ACTE_UNION_DURHAM_PRESENTATIONS.filter(({ studentText }) => studentText.includes("[…]")).length >= 5);
  assert.ok(ACTE_UNION_DURHAM_PRESENTATIONS.every(({ title }) => !/majorité anglaise recherchée/i.test(title)));
  const anglicizationExcerpt = ACTE_UNION_DURHAM_PRESENTATIONS.find(({ id }) => id === "historical-presentation:acte-union:durham-anglicisation");
  assert.ok(anglicizationExcerpt);
  assert.match(anglicizationExcerpt.studentText, /union des deux provinces donnerait une nette majorité anglaise/);
  assert.match(anglicizationExcerpt.studentText, /immigration anglaise/);
  const advancementExcerpt = ACTE_UNION_DURHAM_PRESENTATIONS.find(({ id }) => id === "historical-presentation:acte-union:durham-anglicisation-avancement");
  assert.ok(advancementExcerpt);
  assert.match(advancementExcerpt.studentText, /fondre son caractère français et à adopter complètement une nationalité américaine/);
  assert.match(advancementExcerpt.studentText, /les Français se qualifièrent en apprenant l’anglais/);
  assert.match(advancementExcerpt.studentText, /une majorité anglaise prédominera en permanence/);
  assert.match(advancementExcerpt.editorialNote, /traduction française abrégée et fidèle/i);
});

test("valide séparément la source Durham et ses présentations élèves", () => {
  assert.deepEqual(validateHistoricalDocument(ACTE_UNION_DURHAM_DOCUMENT), {});
  assert.ok(ACTE_UNION_DURHAM_PRESENTATIONS.every((presentation) => Object.keys(validateHistoricalDocumentPresentation(presentation, ACTE_UNION_DURHAM_DOCUMENT)).length === 0));

  const unapprovedSource = {
    ...ACTE_UNION_DURHAM_DOCUMENT,
    status: "ready-for-review" as const,
    approvedAt: null,
  };
  assert.deepEqual(validateHistoricalDocumentPresentation(ACTE_UNION_DURHAM_PRESENTATIONS[0], unapprovedSource), {
    approval: "Une présentation ne peut être approuvée qu’après son document source; elle doit aussi être complète, versionnée et datée.",
  });
});

test("prépare cinq besoins documentaires sans inventer de document approuvé", () => {
  assert.equal(ACTE_UNION_HISTORICAL_DOCUMENT_NEEDS.length, 5);
  assert.ok(ACTE_UNION_HISTORICAL_DOCUMENT_NEEDS.every((document) => document.status === "research-needed"));
  assert.ok(ACTE_UNION_HISTORICAL_DOCUMENT_NEEDS.every((document) => document.periodIds.includes("1840-1896") && document.knowledgeHeadingIds.includes("acte-union")));
  assert.ok(ACTE_UNION_HISTORICAL_DOCUMENT_NEEDS.every((document) => !document.assetUrl && !document.sourceUrl && !document.rightsStatement && !document.approvedAt));
});

test("conserve trois cartes candidates avec provenance, droits, forces et limites", () => {
  assert.equal(ACTE_UNION_MAP_CANDIDATES.length, 3);
  assert.equal(ACTE_UNION_MAP_CANDIDATES.filter(({ recommendation }) => recommendation === "preferred").length, 1);
  assert.ok(ACTE_UNION_MAP_CANDIDATES.every((candidate) => candidate.needId === "document-need:acte-union:territory-map"));
  assert.ok(ACTE_UNION_MAP_CANDIDATES.every((candidate) => candidate.sourceUrl && candidate.sourceLocator && candidate.rightsAssessment && candidate.strengths.length > 0 && candidate.limitations.length > 0));
});

test("conserve séparément la carte originale et sa version pédagogique officielle", () => {
  assert.equal(ACTE_UNION_MAP_ADAPTATION_DRAFT.status, "approved");
  assert.match(ACTE_UNION_MAP_ADAPTATION_DRAFT.originalAssetUrl, /original\.jpg$/);
  assert.match(ACTE_UNION_MAP_ADAPTATION_DRAFT.previewUrl, /modifiee-officielle\.png$/);
  assert.match(ACTE_UNION_MAP_ADAPTATION_DRAFT.editableAssetUrl, /socrato\.svg$/);
  assert.ok(ACTE_UNION_MAP_ADAPTATION_DRAFT.modifications.some((item) => item.includes("Canada-Ouest")));
  assert.ok(ACTE_UNION_MAP_ADAPTATION_DRAFT.modifications.some((item) => item.includes("États-Unis")));
  assert.ok(ACTE_UNION_MAP_ADAPTATION_DRAFT.modifications.some((item) => item.includes("frontières sont approximatives")));
  assert.match(ACTE_UNION_MAP_ADAPTATION_DRAFT.cartographicReferenceUrl, /canada\.ca/);
  assert.match(ACTE_UNION_MAP_ADAPTATION_DRAFT.attribution, /James Wyld/);
  assert.match(ACTE_UNION_MAP_ADAPTATION_DRAFT.attribution, /carte modifiée/);
  assert.equal(ACTE_UNION_MAP_ADAPTATION_DRAFT.version, "1.0");
  assert.ok(ACTE_UNION_MAP_ADAPTATION_DRAFT.approvedAt);
});

test("approuve l’adresse de La Fontaine avec sa provenance complète", () => {
  assert.equal(ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.status, "approved");
  assert.equal(ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.creator, "Louis-Hippolyte La Fontaine");
  assert.deepEqual(ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.periodIds, ["1840-1896"]);
  assert.deepEqual(ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.knowledgeHeadingIds, ["acte-union"]);
  assert.equal(ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.operationIds.length, 4);
  assert.match(ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.transcription, /usage de notre langue/);
  assert.match(ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.transcription, /dette que nous n’avons pas contractée/);
  assert.match(ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.sourceUrl, /banq\.qc\.ca/);
  assert.match(ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.assetUrl, /openedition\.org/);
  assert.deepEqual(validateHistoricalDocument(ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT), {});
});

test("approuve les points de vue favorables de Russell et du Conseil spécial", () => {
  assert.equal(ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT.status, "approved");
  assert.equal(ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.id, "AU-T-003");
  assert.equal(ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.status, "approved");
  assert.match(ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.transcription, /nécessité indispensable et urgente/);
  assert.match(ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.sourceUrl, /canadiana\.ca/);
  assert.deepEqual(validateHistoricalDocument(ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT), {});
  assert.deepEqual(validateHistoricalDocument(ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT), {});
});

test("approuve un extrait reliant explicitement les Rébellions au Conseil spécial", () => {
  assert.equal(ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.status, "approved");
  assert.match(ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.transcription, /insurrection/);
  assert.match(ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.transcription, /Conseil spécial/);
  assert.ok(ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.operationIds.includes("causes_and_consequences"));
  assert.deepEqual(validateHistoricalDocument(ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT), {});
});

test("approuve le supplément du Mercury comme source textuelle indépendante", () => {
  assert.equal(PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.id, "PAT-T-001");
  assert.equal(PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.kind, "newspaper");
  assert.equal(PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.status, "approved");
  assert.match(PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.transcription, /\[…\]/);
  assert.match(PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.transcription, /six canons/);
  assert.match(PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.transcription, /complètement encerclées/);
  assert.ok(PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.knowledgeHeadingIds.includes("acte-union"));
  assert.deepEqual(validateHistoricalDocument(PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT), {});
});

test("approuve les résolutions 14 et 28 comme source sur une cause politique", () => {
  assert.equal(PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.id, "PAT-T-002");
  assert.equal(PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.status, "approved");
  assert.match(PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.sourceLocator, /résolutions 14 et 28/);
  assert.match(PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.transcription, /Conseil législatif/);
  assert.match(PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.transcription, /\[…\]/);
  assert.match(PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.transcription, /pouvoir exécutif/);
  assert.deepEqual(validateHistoricalDocument(PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT), {});
});

test("approuve les résolutions Russell comme réponse aux revendications", () => {
  assert.equal(PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.id, "PAT-T-003");
  assert.equal(PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.status, "approved");
  assert.match(PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.sourceLocator, /résolutions 4, 5 et 8/);
  assert.match(PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.transcription, /Conseil législatif électif/);
  assert.match(PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.transcription, /Conseil exécutif/);
  assert.match(PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.transcription, /revenus de la province/);
  assert.equal((PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.transcription.match(/\[…\]/g) ?? []).length, 2);
  assert.deepEqual(validateHistoricalDocument(PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT), {});
});

test("approuve un premier extrait indépendant de La Minerve sur la répression politique", () => {
  assert.equal(PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.id, "PAT-T-004");
  assert.equal(PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.kind, "newspaper");
  assert.equal(PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.status, "approved");
  assert.match(PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.transcription, /assemblées politiques/);
  assert.match(PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.transcription, /système d’oppression/);
  assert.match(PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.transcription, /\[…\]/);
  assert.deepEqual(validateHistoricalDocument(PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT), {});
});

test("approuve un deuxième extrait indépendant de La Minerve sur une démission politique", () => {
  assert.equal(PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.id, "PAT-T-005");
  assert.equal(PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.kind, "newspaper");
  assert.equal(PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.status, "approved");
  assert.match(PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.transcription, /commission comme juge de paix/);
  assert.match(PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.transcription, /administration/);
  assert.deepEqual(validateHistoricalDocument(PATRIOTES_MINERVE_RESIGNATION_DOCUMENT), {});
});

test("approuve un troisième extrait indépendant de La Minerve sur l’idée d’indépendance", () => {
  assert.equal(PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.id, "PAT-T-006");
  assert.equal(PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.kind, "newspaper");
  assert.equal(PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.status, "approved");
  assert.match(PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.transcription, /joug de l’Angleterre/);
  assert.match(PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.transcription, /indépendant/);
  assert.ok(PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.interpretationCautions.some((item) => /adaptation pédagogique assemblée/.test(item)));
  assert.deepEqual(validateHistoricalDocument(PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT), {});
});

test("approuve un extrait de La Minerve reliant le refus britannique à la résistance", () => {
  assert.equal(PATRIOTES_MINERVE_BRITISH_REFUSAL_RESISTANCE_DOCUMENT.id, "PAT-T-007");
  assert.equal(PATRIOTES_MINERVE_BRITISH_REFUSAL_RESISTANCE_DOCUMENT.kind, "newspaper");
  assert.match(PATRIOTES_MINERVE_BRITISH_REFUSAL_RESISTANCE_DOCUMENT.transcription, /repousse toutes et chacune des réformes/);
  assert.match(PATRIOTES_MINERVE_BRITISH_REFUSAL_RESISTANCE_DOCUMENT.transcription, /celle de la résistance/);
  assert.deepEqual(validateHistoricalDocument(PATRIOTES_MINERVE_BRITISH_REFUSAL_RESISTANCE_DOCUMENT), {});
});

test("approuve l’extrait sur l’exil de chefs patriotes aux Bermudes", () => {
  assert.equal(ACTE_UNION_BERMUDA_EXILE_DOCUMENT.status, "approved");
  assert.match(ACTE_UNION_BERMUDA_EXILE_DOCUMENT.transcription, /Wolfred Nelson/);
  assert.match(ACTE_UNION_BERMUDA_EXILE_DOCUMENT.transcription, /Bermudes/);
  assert.match(ACTE_UNION_BERMUDA_EXILE_DOCUMENT.historicalContext, /Rébellion de 1837/);
  assert.ok(ACTE_UNION_BERMUDA_EXILE_DOCUMENT.interpretationCautions.some((item) => /légalement aux Bermudes/.test(item)));
  assert.deepEqual(validateHistoricalDocument(ACTE_UNION_BERMUDA_EXILE_DOCUMENT), {});
});

test("approuve le document sur les 58 Patriotes déportés en Australie", () => {
  assert.equal(ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.status, "approved");
  assert.match(ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.transcription, /58 prisonniers/);
  assert.match(ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.transcription, /Nouvelle-Galles du Sud/);
  assert.deepEqual(validateHistoricalDocument(ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT), {});
});

test("approuve le point de vue favorable de l’Assemblée du Haut-Canada", () => {
  assert.equal(ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.id, "AU-T-005");
  assert.equal(ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.status, "approved");
  assert.match(ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.transcription, /législature unie/);
  assert.match(ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.sourceUrl, /canadiana\.ca/);
  assert.deepEqual(validateHistoricalDocument(ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT), {});
});

test("approuve l’abrogation de la restriction linguistique de 1848", () => {
  assert.equal(ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.id, "AU-T-004");
  assert.equal(ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.status, "approved");
  assert.equal(ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.historicalDate, "14 août 1848");
  assert.match(ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.transcription, /uniquement en anglais est abrogée/);
  assert.match(ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.assetUrl, /UnionActAmendmentAct1848\.pdf$/);
  assert.deepEqual(validateHistoricalDocument(ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT), {});
});

test("prépare deux graphiques approuvés et réutilisables dans les cartes élèves", () => {
  assert.equal(ACTE_UNION_DEBT_COMPARISON_CHART.id, "AU-G-001");
  assert.deepEqual(ACTE_UNION_DEBT_COMPARISON_CHART.items.map(({ value }) => value), [133000, 1537142]);
  assert.equal(ACTE_UNION_POPULATION_COMPARISON_CHART.id, "AU-G-002");
  assert.deepEqual(ACTE_UNION_POPULATION_COMPARISON_CHART.items.map(({ value }) => value), [650000, 450000]);
  assert.ok([ACTE_UNION_DEBT_COMPARISON_CHART, ACTE_UNION_POPULATION_COMPARISON_CHART].every(({ sourceUrl, methodology, observationGuide }) => sourceUrl && methodology && observationGuide.length > 0));
});

test("ne conserve que les documents du gouvernement responsable réutilisables sans permission écrite", () => {
  assert.equal(RESPONSIBLE_GOVERNMENT_ICONOGRAPHIC_DOCUMENTS.length, 4);
  assert.deepEqual(RESPONSIBLE_GOVERNMENT_ICONOGRAPHIC_DOCUMENTS.map(({ id }) => id), ["GR-I-002", "GR-I-005", "GR-I-006", "GR-I-007"]);
  assert.ok(RESPONSIBLE_GOVERNMENT_ICONOGRAPHIC_DOCUMENTS.every((document) => document.knowledgeHeadingIds.includes("gouvernement-responsable")));
  assert.ok(RESPONSIBLE_GOVERNMENT_ICONOGRAPHIC_DOCUMENTS.every((document) => document.previewAssetUrls.length > 0));
  assert.ok(RESPONSIBLE_GOVERNMENT_ICONOGRAPHIC_DOCUMENTS.every((document) => Object.keys(validateHistoricalDocument(document)).length === 0));
});

test("prépare la loi électorale de 1849 comme extrait élève vérifiable", () => {
  assert.equal(RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT.id, "GR-T-001");
  assert.match(RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_PRESENTATION.studentText, /aucune femme ne peut voter/);
  assert.deepEqual(RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_PRESENTATION.sourceSegmentLocators, ["Article XLII", "Article XLIV", "Article XLVI"]);
  assert.deepEqual(validateHistoricalDocument(RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT), {});
});

test("prépare trois images libres sur les Patriotes et un schéma original", () => {
  assert.deepEqual(PATRIOTES_ICONOGRAPHIC_DOCUMENTS.map(({ id }) => id), ["PAT-I-001", "PAT-I-002", "PAT-I-003"]);
  assert.ok(PATRIOTES_ICONOGRAPHIC_DOCUMENTS.every(({ rightsStatement }) => /UTILISATION AUTORIS/.test(rightsStatement)));
  assert.ok(PATRIOTES_ICONOGRAPHIC_DOCUMENTS.every(({ knowledgeHeadingIds }) => knowledgeHeadingIds.includes("rebellions-1837-1838") && knowledgeHeadingIds.includes("acte-union")));
  assert.equal(ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM.id, "AU-D-001");
  assert.match(ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM.rightsStatement, /Schéma original de Socrato/);
});

test("présente les trois images des Patriotes comme documents indépendants", () => {
  const page = readFileSync("app/admin/pedagogical-reference/documents/page.tsx", "utf8");
  assert.match(page, /Document iconographique indépendant/);
  assert.match(page, /PATRIOTES_ICONOGRAPHIC_DOCUMENTS\.map\(\(document\) => <section/);
  assert.doesNotMatch(page, /Trois images intégrées au contexte politique/);
  assert.doesNotMatch(page, /Trois images réutilisables sans permission écrite/);
});

test("crée une ligne du temps illustrée de 1837 au gouvernement responsable", () => {
  assert.equal(ACTE_UNION_STUDENT_TIMELINE.id, "AU-D-002");
  assert.deepEqual(ACTE_UNION_STUDENT_TIMELINE.entries.map(({ date }) => date), ["1837-1838", "1839", "1840", "1841", "1843", "1848"]);
  const metcalfeCrisis = ACTE_UNION_STUDENT_TIMELINE.entries.find(({ date }) => date === "1843");
  assert.ok(metcalfeCrisis);
  assert.match(metcalfeCrisis.description, /démissionnent/);
  assert.match(metcalfeCrisis.credit, /domaine public/);
  assert.ok(ACTE_UNION_STUDENT_TIMELINE.entries.every(({ imageUrl, sourceUrl }) => imageUrl && sourceUrl));
  assert.doesNotMatch(JSON.stringify(ACTE_UNION_STUDENT_TIMELINE.entries), /1849/);
});

test("approuve AU-T-001 avec sa provenance et ses usages pédagogiques", () => {
  assert.equal(ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.id, "AU-T-001");
  assert.equal(ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.status, "approved");
  assert.equal(ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.kind, "law-or-official-text");
  assert.deepEqual(ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.periodIds, ["1840-1896"]);
  assert.deepEqual(ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.knowledgeHeadingIds, ["acte-union"]);
  assert.equal(ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.operationIds.length, 4);
  assert.match(ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.sourceUrl, /primarydocuments\.ca\/acte-dunion-1840-r-u/);
  assert.match(ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.assetUrl, /Act-of-Union-1840\.pdf$/);
  assert.deepEqual(validateHistoricalDocument(ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT), {});
});

test("exige provenance, droits, accessibilité et contexte avant la validation", () => {
  const draft = { ...ACTE_UNION_HISTORICAL_DOCUMENT_NEEDS[0], status: "ready-for-review" as const };
  assert.deepEqual(validateHistoricalDocument(draft), {
    provenance: "Un document prêt à valider exige une provenance précise, le fichier consulté et des droits documentés.",
    accessibility: "Une description accessible est obligatoire avant la validation.",
    pedagogy: "Le contexte, les éléments à observer et les usages pédagogiques doivent être documentés.",
  });
  const complete: HistoricalDocumentRecord = {
    ...draft,
    status: "approved",
    historicalDate: "1841",
    creator: "Auteur vérifié",
    holdingInstitution: "Institution de conservation",
    sourceUrl: "https://example.org/notice",
    sourceLocator: "Notice et cote vérifiées",
    assetUrl: "https://example.org/document.jpg",
    rightsStatement: "Droits vérifiés avant utilisation",
    accessibleDescription: "Description complète du contenu visuel.",
    historicalContext: "Contexte historique documenté.",
    observationGuide: ["Élément à observer"],
    interpretationCautions: ["Précaution d’interprétation"],
    version: "1.0",
    approvedAt: "2026-08-01T00:00:00.000Z",
  };
  assert.deepEqual(validateHistoricalDocument(complete), {});
});

test("expose la banque par période, notion et fiche documentaire", () => {
  const page = readFileSync("app/admin/pedagogical-reference/documents/page.tsx", "utf8");
  const referenceView = readFileSync("app/admin/pedagogical-reference/reference-validation-view.tsx", "utf8");
  assert.match(page, /Banque de documents historiques/);
  assert.match(page, /Par période et par notion/);
  assert.match(page, /HistoricalDocumentsNotionPage/);
  assert.match(page, /documents\/\$\{heading\.id\}/);
  assert.doesNotMatch(page, /ACTE_UNION_MAP_CANDIDATES/);
  assert.match(page, /ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT/);
  assert.match(page, /ACTE_UNION_DURHAM_DOCUMENT/);
  assert.match(page, /ACTE_UNION_DURHAM_PRESENTATIONS/);
  assert.match(page, /Aperçu exact du contenu de la carte élève/);
  assert.match(page, /lord-durham-portrait\.jpg/);
  assert.match(page, /Portrait de John George Lambton, lord Durham/);
  assert.match(page, /Approuvé · v\{presentation.version\}/);
  assert.doesNotMatch(page, /Décision consignée/);
  assert.doesNotMatch(page, /Les extraits 1, 2, 3, 5, 6 et 7 ont été retenus/);
  assert.match(page, /ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT/);
  assert.match(page, /ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT/);
  assert.match(page, /PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT/);
  assert.match(page, /PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT/);
  assert.match(page, /PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT/);
  assert.match(page, /function HistoricalExcerpt/);
  assert.match(page, /<blockquote>« \{text\} »<\/blockquote>/);
  assert.match(page, /<cite>— \{attribution\}<\/cite>/);
  assert.match(page, /attribution=\{ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT\.creator\}/);
  assert.match(page, /attribution=\{ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT\.creator\}/);
  assert.match(page, /Aucun fac-similé modifié/);
  assert.match(page, /ACTE_UNION_BERMUDA_EXILE_DOCUMENT/);
  assert.match(page, /ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT/);
  assert.match(page, /ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT/);
  assert.match(page, /ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT/);
  assert.match(page, /ACTE_UNION_DEBT_COMPARISON_CHART/);
  assert.match(page, /ACTE_UNION_POPULATION_COMPARISON_CHART/);
  assert.match(page, /HistoricalComparisonChart/);
  assert.match(page, /ComparisonChartDocument chart=\{ACTE_UNION_DEBT_COMPARISON_CHART\}/);
  assert.match(page, /ComparisonChartDocument chart=\{ACTE_UNION_POPULATION_COMPARISON_CHART\}/);
  assert.doesNotMatch(page, /Deux comparaisons au moment de l’Union/);
  assert.match(page, /RESPONSIBLE_GOVERNMENT_ICONOGRAPHIC_DOCUMENTS/);
  assert.match(page, /Notion · Gouvernement responsable/);
  assert.match(page, /Notions · Rébellions de 1837-1838 · Acte d’Union/);
  assert.match(page, /notionId === "rebellions-1837-1838" \|\| notionId === "acte-union"/);
  assert.match(page, /ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM/);
  assert.match(page, /ACTE_UNION_STUDENT_TIMELINE/);
  assert.match(page, /student-timeline__rail/);
  assert.match(page, /Ligne du temps horizontale de 1837 à 1848/);
  assert.match(page, /Détails de vérification/);
  assert.match(page, /ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT/);
  assert.match(page, /ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT/);
  assert.match(page, /executive-council-act-title/);
  assert.match(page, /Code documentaire/);
  assert.match(page, /Approuvé/);
  assert.doesNotMatch(page, /Cartes candidates pour le territoire/);
  assert.doesNotMatch(page, /Recherche en cours · Besoin 1/);
  assert.doesNotMatch(page, /Prototype documentaire · Besoin 1/);
  assert.doesNotMatch(page, /Carte adaptée pour la lecture des frontières/);
  assert.match(page, /ACTE_UNION_MAP_ADAPTATION_DRAFT/);
  assert.match(page, /les frontières représentées sont approximatives/);
  assert.doesNotMatch(page, /ACTE_UNION_HISTORICAL_DOCUMENT_NEEDS/);
  assert.match(referenceView, /Documents historiques/);
  assert.match(referenceView, /\/admin\/pedagogical-reference\/documents\/\$\{record\.knowledgeHeadingId\}/);
  const notionPage = readFileSync("app/admin/pedagogical-reference/documents/[notionId]/page.tsx", "utf8");
  assert.match(notionPage, /HistoricalDocumentsNotionPage/);
});

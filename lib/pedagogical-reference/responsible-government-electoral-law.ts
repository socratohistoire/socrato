import type { HistoricalDocumentRecord, HistoricalDocumentStudentPresentation } from "./historical-document.ts";

export const RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT = {
  schemaVersion: 1, id: "GR-T-001", title: "Les femmes exclues du droit de vote", kind: "law-or-official-text", status: "ready-for-review",
  periodIds: ["1840-1896"], knowledgeHeadingIds: ["role-des-femmes"], operationIds: ["establish_facts", "changes_and_continuities", "relationships_between_facts"],
  historicalDate: "30 mai 1849", creator: "Parlement de la Province du Canada", holdingInstitution: "British North American Legislative Database, Université du Nouveau-Brunswick",
  sourceUrl: "https://bnald.lib.unb.ca/legislation/act-repeal-certain-acts-therein-mentioned-and-amend-consolidate-and-reduce-one-act",
  sourceLocator: "12 Victoria, chapitre 27, articles XLII, XLIV et XLVI, pages 188-189 de la loi imprimée.", assetUrl: "https://bnald.lib.unb.ca/sites/default/files/UnC.1849.ch_.27_0.pdf",
  rightsStatement: "Texte législatif canadien de 1849 appartenant au domaine public. La traduction pédagogique de Socrato doit demeurer identifiée comme une adaptation; conserver le lien vers la loi originale.",
  transcription: "Article XLII : le votant doit être sujet britannique et avoir au moins vingt et un ans. Article XLIV : un vote donné sans les qualifications exigées est nul et entraîne une pénalité. Article XLVI : aucune femme ne peut voter à une élection de comté, de circonscription, de cité ou de ville.",
  accessibleDescription: "Extrait adapté de trois dispositions d’une loi électorale de 1849 qui précise certaines qualifications nécessaires pour voter et exclut explicitement les femmes.",
  historicalContext: "Avant 1849, certaines femmes propriétaires avaient exercé le droit de vote dans les colonies canadiennes. Cette loi de la Province du Canada rend leur exclusion explicite, tout en maintenant d’autres conditions liées notamment à l’âge, au statut de sujet britannique et à la propriété.",
  observationGuide: ["Relever les conditions nécessaires pour voter.", "Identifier le groupe explicitement exclu par la loi.", "Distinguer une pratique électorale d’une interdiction inscrite dans une loi."],
  interpretationCautions: ["Le texte présenté aux élèves est une traduction adaptée qui regroupe trois articles distincts.", "La loi ne permet pas, à elle seule, de décrire toutes les formes d’exclusion politique vécues par les Autochtones ou les hommes sans propriété."],
  pedagogicalUses: ["Établir qui peut participer au système électoral en 1849.", "Déterminer un changement dans les droits politiques des femmes.", "Mettre en relation les critères électoraux et la représentation politique."],
  version: "1.0", approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_PRESENTATION = {
  schemaVersion: 1, id: "GR-T-001-P1", documentId: "GR-T-001", title: "Les femmes exclues du droit de vote", kind: "excerpt", status: "ready-for-review", contentSelectionStatus: "retained",
  periodIds: ["1840-1896"], knowledgeHeadingIds: ["role-des-femmes"], operationIds: ["establish_facts", "changes_and_continuities", "relationships_between_facts"],
  typeLabel: "Extrait d’une loi électorale", dateLabel: "30 mai 1849", authorLabel: "Parlement de la Province du Canada", originalDocumentLabel: "Loi électorale de la Province du Canada, 12 Victoria, chapitre 27",
  studentText: "Toute personne qui vote sans posséder les qualifications exigées par la loi s’expose à une amende et son vote est annulé. La loi exige notamment d’être sujet britannique et d’avoir au moins 21 ans. Toutefois, aucune femme ne peut voter lors d’une élection, que ce soit dans un comté, une circonscription, une cité ou une ville.",
  sourceLabel: "Parlement de la Province du Canada, loi électorale du 30 mai 1849", sourceUrls: ["https://bnald.lib.unb.ca/sites/default/files/UnC.1849.ch_.27_0.pdf"], sourceSegmentLocators: ["Article XLII", "Article XLIV", "Article XLVI"],
  rightsLabel: "Texte législatif de 1849 dans le domaine public; traduction adaptée par Socrato.", editorialNote: "Traduction française modernisée et regroupement de trois dispositions. Le sens juridique est conservé, mais le texte n’est pas présenté comme une traduction officielle mot à mot.",
  accessibleDescription: "Carte textuelle présentant les conditions d’accès au vote et l’exclusion explicite des femmes en 1849.", historicalContext: RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT.historicalContext,
  pointOfView: "Le texte exprime la volonté du législateur de définir et de limiter le corps électoral de la Province du Canada.", observationGuide: RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT.observationGuide,
  interpretationCautions: RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT.interpretationCautions, pedagogicalUses: RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT.pedagogicalUses, version: "1.0", approvedAt: null,
} as const satisfies HistoricalDocumentStudentPresentation;

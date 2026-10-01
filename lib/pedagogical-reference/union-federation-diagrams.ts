import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion } from "./types.ts";
import { ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM } from "./responsible-government-iconography.ts";

const shared = {
  schemaVersion: 1, kind: "political-diagram", status: "ready-for-review",
  periodIds: ["1840-1896"], knowledgeHeadingIds: ["acte-de-l-amerique-du-nord-britannique", "acte-union"],
  operationIds: ["changes_and_continuities"],
  creator: "Socrato, d’après les textes constitutionnels", holdingInstitution: "Socrato · schéma pédagogique original",
  rightsStatement: "Schéma original de Socrato construit d’après des textes constitutionnels. Ce n’est pas une source primaire ni une reproduction d’un document d’époque.",
  observationGuide: ["Comparer le nombre de législatures et les territoires auxquels elles s’appliquent."],
  interpretationCautions: ["Schéma pédagogique simplifié : les gouvernements exécutifs et les mécanismes de contrôle constitutionnel ne sont pas détaillés."],
  pedagogicalUses: ["Dégager le changement de structure politique entre l’Union et la fédération."],
  version: "1.0", approvedAt: null,
} as const;

export const UNION_FEDERATION_DIAGRAMS = [
  {...shared, id: "AANB-D-001", title: "La Province du Canada en 1841", historicalDate: "1841",
    sourceUrl: "https://primarydocuments.ca/acte-dunion-1840-r-u/?lang=fr",
    sourceLocator: "Acte d’Union (1840), articles I et III; entrée en vigueur en 1841.",
    assetUrl: "/historical-documents/union-1841-legislatures.svg",
    transcription: "",
    accessibleDescription: "La Province du Canada comporte deux sections : Canada-Ouest et Canada-Est. Un Parlement commun, composé de la Couronne représentée par le gouverneur, du Conseil législatif et de l’Assemblée législative, adopte des lois pour les deux sections. Ces sections n’ont pas chacune une législature distincte.",
    historicalContext: "Organisation législative de la Province du Canada lors de l’entrée en vigueur de l’Acte d’Union. Le schéma ne représente pas les changements dans le fonctionnement de l’exécutif après 1848."
  },
  {...shared, id: "AANB-D-002", title: "Le Dominion du Canada en 1867", historicalDate: "1867",
    sourceUrl: "https://laws-lois.justice.gc.ca/fra/Const/TexteComplet.html",
    sourceLocator: "AANB (1867), articles 6, 9 à 17, 24 à 25, 37, 55, 58, 63, 69 à 72, 88 et 90 à 93. Dispositions historiques de 1867. Les liens de confiance relèvent des conventions du gouvernement responsable.",
    assetUrl: "/historical-documents/federation-1867-legislatures.svg",
    transcription: "",
    accessibleDescription: "La Couronne britannique nomme le gouverneur général. Celui-ci nomme en conseil les lieutenants-gouverneurs. Le premier ministre choisit ses ministres, nommés officiellement par le gouverneur sur sa recommandation. Au fédéral, le cabinet doit conserver la confiance de la Chambre des communes élue; les sénateurs sont nommés officiellement par le gouverneur général sur recommandation du premier ministre (sauf la désignation initiale par la Reine dans la proclamation de 1867). Au Québec, le Conseil exécutif doit conserver la confiance de l’Assemblée législative élue; le Conseil législatif est nommé. L’Ontario possède sa propre législature sans Conseil législatif. Le Nouveau-Brunswick et la Nouvelle-Écosse ont aussi leurs institutions provinciales. Les compétences sont réparties par l’AANB.",
    historicalContext: "L’ancienne Province du Canada est divisée en Ontario et Québec au sein du Dominion avec le Nouveau-Brunswick et la Nouvelle-Écosse. Le Québec illustre l’ordre provincial, sans généraliser son organisation à toutes les provinces.",
    interpretationCautions: ["Schéma pédagogique simplifié, non source primaire. Le désaveu et tous les mécanismes constitutionnels ne sont pas représentés.", "La responsabilité du cabinet devant la chambre élue relève des conventions constitutionnelles. Les nominations s’inscrivent dans le gouvernement responsable.", "Les premiers sénateurs sont désignés par la Reine dans la proclamation de 1867 (article 25 original).", "Électeurs admissibles ne signifie pas suffrage universel."],
    version: "1.3"
  },
] as const satisfies readonly HistoricalDocumentRecord[];

const questionDocuments = [ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM, UNION_FEDERATION_DIAGRAMS[1]] as const;
const sources = questionDocuments.map(document => ({id: `document-source:${document.id}`, kind: "government" as const, title: document.sourceLocator, publisher: document.id === "AU-D-001" ? "DocumentsPrimaires.ca" : "Ministère de la Justice du Canada", url: document.sourceUrl, locator: document.sourceLocator, verificationStatus: "verified" as const}));

export const UNION_FEDERATION_CHANGE_QUESTION = {
  schemaVersion: 1, id: "question:acte-de-l-amerique-du-nord-britannique:union-federation-change",
  scope: "notional", knowledgeHeadingId: "acte-de-l-amerique-du-nord-britannique",
  relatedKnowledgeHeadingIds: ["acte-de-l-amerique-du-nord-britannique"],
  referenceCardId: "reference-card:acte-de-l-amerique-du-nord-britannique",
  historicalRecordId: "historical-record:acte-de-l-amerique-du-nord-britannique",
  status: "ready-for-review", format: "document-interpretation",
  prompt: "Quel changement dans l’organisation politique du territoire auparavant appelé la Province du Canada l’AANB de 1867 apporte-t-il? Appuie ta réponse sur les deux schémas.",
  instruction: "Compare l’organisation représentée dans les documents 1 et 2. Décris la situation avant et après 1867 et appuie ta réponse sur un élément de chaque schéma.",
  expectedAnswer: "Sous l’Acte d’Union, le Canada-Est et le Canada-Ouest appartiennent à une même province et relèvent d’un Parlement commun (document 1). En 1867, ils deviennent le Québec et l’Ontario, chacun avec sa législature provinciale, au sein d’une fédération où les compétences sont réparties entre les ordres fédéral et provincial (document 2). Accepter toute formulation équivalente montrant le passage d’une union législative à une fédération, avec un indice de chaque document. Les termes « union législative » et « fédération » ne sont pas obligatoires si l’organisation est correctement expliquée. Réponse complète : Parlement commun avant; législatures distinctes de l’Ontario et du Québec après, en plus du Parlement fédéral et d’un partage constitutionnel des compétences. Réponse partielle : seulement le changement de noms, seulement l’apparition de deux provinces, ou seulement une description de 1867. Ne pas accepter l’indépendance du Québec et de l’Ontario, la disparition de toute institution commune, ni l’idée que toutes les compétences appartiennent au fédéral. Les détails sur la composition des chambres ou l’année 1848 ne sont pas exigés.",
  historicalDocumentIds: questionDocuments.map(document => document.id),
  commonErrors: ["Décrire uniquement 1867 sans établir de changement.", "Réduire le changement à de nouveaux noms.", "Présenter les provinces comme des pays indépendants.", "Confondre la fédération de 1867 et l’obtention du gouvernement responsable en 1848."],
  distractors: [], operationId: "changes_and_continuities",
  sourceIds: sources.map(source => source.id), sourceCatalog: sources,
  rationale: "Déterminer un changement institutionnel à partir de deux représentations comparables. Les schémas rendent visibles les institutions sans fournir une phrase de comparaison toute faite.",
  review: {documented: true, historicallyVerified: true, pedagogicallyVerified: false, biasAndLanguageReviewed: true, approvedBy: null, approvedVersion: null, approvedAt: null},
} as const satisfies ApprovedQuestion;

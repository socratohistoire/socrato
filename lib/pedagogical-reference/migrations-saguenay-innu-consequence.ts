import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

export const MIGRATIONS_INNU_TERRITORIAL_PROTEST_DOCUMENT = {
  schemaVersion: 1,
  id: "MIG-T-010",
  title: "Les Innus protestent contre la vente de leurs territoires de chasse",
  kind: "law-or-official-text",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["migrations"],
  operationIds: ["causes_and_consequences", "establish_facts"],
  historicalDate: "16 juillet 1851",
  creator: "Innus du Saguenay, représentés par Peter McLeod fils, John Lesueur et Frederick Braun; acte reçu par les notaires Ovide Bossé et Louis-Zéphirin Rousseau",
  holdingInstitution: "Archives nationales du Québec à Québec · transcription diffusée par Les Classiques des sciences sociales",
  sourceUrl: "https://classiques.uqam.ca/collection_histoire_SLSJ/girard_camil/Protet_des_Innus_1851/Protet_des_Innus_1851_texte.html",
  sourceLocator: "« Protêt par Peter McLeod Junior, John Lesueur et Frederick Braun », 16 juillet 1851, greffe de Louis-Zéphirin Rousseau, ANQ Québec, CN301, S247, acte no 112; transcription intégrale présentée par Camil Girard",
  assetUrl: "https://classiques.uqam.ca/collection_histoire_SLSJ/girard_camil/Protet_des_Innus_1851/Protet_des_Innus_1851.html",
  rightsStatement: "Acte notarié rédigé en 1851 et appartenant au domaine public; extrait abrégé en quatre phrases, vocabulaire actualisé et ponctuation modernisée par Socrato.",
  transcription: "Les terres des cantons de Jonquière, Kénogami, Caron, Signaï, Labarre, Métabetchouan et d’autres lieux [dans la région du Saguenay–Lac-Saint-Jean] appartiennent aux Innus depuis un temps immémorial. Elles leur servent de résidence et de terrains de chasse, seul moyen d’existence pour eux et leurs familles. Les Innus demandent à l’agent des terres de la Couronne de ne vendre aucun de ces lots. Ils affirment que le gouvernement ne peut vendre ces terres sans avoir d’abord négocié avec eux leurs droits de possession et de propriété.",
  accessibleDescription: "Extrait de quatre phrases du protêt de 1851 dans lequel les Innus affirment que les terres mises en vente constituent leur territoire ancestral, leur résidence et leurs terrains de chasse essentiels à leur subsistance.",
  historicalContext: "Après l’ouverture du Saguenay à la propriété privée et à l’agriculture, les terres de plusieurs cantons sont offertes aux colons. En 1851, des représentants agissant au nom des Innus déposent un acte notarié pour s’opposer à ces ventes réalisées sans négociation préalable.",
  observationGuide: [
    "Identifier l’usage que les Innus font du territoire revendiqué.",
    "Repérer l’action du gouvernement contestée dans le document.",
    "Expliquer pourquoi la vente des lots menace les activités de subsistance.",
  ],
  interpretationCautions: [
    "Le texte original emploie le terme historique « Montagnais »; le mot « Innus » est utilisé ici conformément à l’appellation actuelle.",
    "L’acte est rédigé par des notaires et présenté par des procureurs au nom des Innus; il ne constitue pas une transcription directe de paroles prononcées en innu-aimun.",
  ],
  pedagogicalUses: [
    "Montrer que la colonisation entraîne la vente de territoires ancestraux sans consentement innu.",
    "Relier la perte d’accès au territoire à la chasse et à la subsistance des familles.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const MIGRATIONS_INNU_HUNTING_FISHING_TERRITORY_DOCUMENT = {
  schemaVersion: 1,
  id: "MIG-T-011",
  title: "L’appauvrissement des territoires de chasse et de pêche",
  kind: "other",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["migrations"],
  operationIds: ["causes_and_consequences", "time_and_space"],
  historicalDate: "Après 1838; faits rapportés pour 1847 et 1856",
  creator: "Parcs Canada; Université du Québec à Trois-Rivières",
  holdingInstitution: "Parc marin du Saguenay–Saint-Laurent · UQTR",
  sourceUrl: "https://parcs.canada.ca/amnc-nmca/qc/saguenay/info/plan/gestion-management",
  sourceLocator: "Parcs Canada, Plan directeur du parc marin du Saguenay–Saint-Laurent, section « De nouvelles communautés et de nouveaux usages »; UQTR, Portrait historique du Saguenay–Lac-Saint-Jean, 2025, p. 4-5",
  assetUrl: "https://oraprdnt.uqtr.uquebec.ca/portail/docs/GSC3636/O0006682870_02_Saguenay_Lac_St_Jean_2025.pdf",
  rightsStatement: "Synthèse de publications institutionnelles de Parcs Canada et de l’UQTR; passage reformulé en quatre phrases par Socrato à des fins pédagogiques.",
  transcription: "Après 1838, l’ouverture des scieries, l’industrie forestière et l’expansion des villages transforment le Saguenay–Lac-Saint-Jean. Dès 1847, les Innus dénoncent l’appauvrissement de leurs territoires de chasse et de pêche. En 1856, les autorités établissent les Innus Pekuakamiulnuatsh dans la réserve de Mashteuiatsh au Lac-Saint-Jean. La colonisation réduit ainsi leur accès à certaines ressources du territoire et favorise la sédentarisation d’une partie de la population innue.",
  accessibleDescription: "Synthèse de quatre phrases reliant l’expansion forestière et villageoise à l’appauvrissement des territoires de chasse et de pêche dénoncé par les Innus, puis à la création de Mashteuiatsh en 1856.",
  historicalContext: "À partir de 1838, la région s’ouvre à l’exploitation forestière et à l’établissement de familles canadiennes-françaises. Les nouveaux usages du territoire se superposent aux activités innues et contribuent à la création de terres réservées, dont Mashteuiatsh en 1856.",
  observationGuide: [
    "Relever les nouvelles activités qui transforment la région.",
    "Identifier ce que les Innus dénoncent dès 1847.",
    "Relier la création de Mashteuiatsh aux transformations du territoire.",
  ],
  interpretationCautions: [
    "Il s’agit d’une synthèse historique actuelle et non d’un témoignage innu rédigé au XIXe siècle.",
    "La création de Mashteuiatsh ne met pas fin à toutes les activités pratiquées sur le Nitassinan; les familles innues continuent de fréquenter leurs territoires ancestraux.",
  ],
  pedagogicalUses: [
    "Expliquer l’effet de la colonisation et de l’industrie forestière sur les activités de chasse et de pêche.",
    "Relier l’ouverture de la région à la sédentarisation et à la concentration territoriale.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const MIGRATIONS_SAGUENAY_INNU_CONSEQUENCE_DOCUMENTS = [
  MIGRATIONS_INNU_TERRITORIAL_PROTEST_DOCUMENT,
  MIGRATIONS_INNU_HUNTING_FISHING_TERRITORY_DOCUMENT,
] as const;

const MIGRATIONS_SAGUENAY_INNU_CONSEQUENCE_SOURCES: ReferenceSource[] =
  MIGRATIONS_SAGUENAY_INNU_CONSEQUENCE_DOCUMENTS.map((document) => ({
    id: `document-source:${document.id}`,
    kind: document.id === MIGRATIONS_INNU_TERRITORIAL_PROTEST_DOCUMENT.id ? "museum-or-archive" : "government",
    title: document.title,
    creator: document.creator,
    publisher: document.holdingInstitution,
    publicationYear: document.id === MIGRATIONS_INNU_TERRITORIAL_PROTEST_DOCUMENT.id ? 1851 : 2025,
    url: document.sourceUrl,
    locator: document.sourceLocator,
    rightsNote: document.rightsStatement,
    verificationStatus: "verified",
  }));

export const MIGRATIONS_SAGUENAY_INNU_CONSEQUENCE_QUESTION = {
  schemaVersion: 1,
  id: "question:migrations:short-answer-006",
  scope: "notional",
  knowledgeHeadingId: "migrations",
  relatedKnowledgeHeadingIds: ["migrations"],
  referenceCardId: "reference-card:migrations",
  historicalRecordId: "historical-record:migrations",
  status: "ready-for-review",
  format: "short-answer",
  prompt: "Expliquez une conséquence de l’ouverture à la colonisation du Saguenay–Lac-Saint-Jean, entre 1838 et 1896.",
  instruction: "Appuyez votre explication sur un changement observable dans les documents et reliez-le à l’ouverture de la région à la colonisation.",
  initialGuidance: "J’attends votre explication…",
  expectedAnswer: "L’ouverture du Saguenay–Lac-Saint-Jean à la colonisation permet la vente de lots, l’établissement de villages, l’agriculture et l’exploitation forestière sur le Nitassinan, sans que les Innus aient cédé leurs droits territoriaux. Une conséquence possible est la réduction et l’appauvrissement de certains territoires de chasse et de pêche : l’occupation des terres et l’exploitation des ressources diminuent l’accès aux animaux, aux poissons et aux lieux utilisés pour la subsistance. Les Innus contestent donc la vente de leurs terres en 1851. La création de Mashteuiatsh en 1856 contribue aussi à concentrer et à sédentariser une partie de la population sur un espace plus restreint, même si les familles continuent de fréquenter leurs territoires ancestraux.",
  historicalDocumentIds: MIGRATIONS_SAGUENAY_INNU_CONSEQUENCE_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Décrire l’arrivée des colons sans expliquer son effet sur le territoire ou sur une activité innue.",
    "Affirmer que les Innus arrivent dans la région après l’ouverture à la colonisation alors qu’il s’agit de leur territoire ancestral.",
    "Présenter la création de Mashteuiatsh comme la reconnaissance de l’ensemble du Nitassinan plutôt que comme la concentration d’une partie de la population sur un territoire plus restreint.",
    "Affirmer que la chasse et la pêche disparaissent complètement après 1838.",
  ],
  distractors: [],
  operationId: "causes_and_consequences",
  sourceIds: MIGRATIONS_SAGUENAY_INNU_CONSEQUENCE_SOURCES.map(({ id }) => id),
  sourceCatalog: MIGRATIONS_SAGUENAY_INNU_CONSEQUENCE_SOURCES,
  rationale: "Le protêt de 1851 permet d’entendre une revendication territoriale formulée au nom des Innus, tandis que la synthèse institutionnelle montre l’appauvrissement des territoires de chasse et de pêche ainsi que la création de Mashteuiatsh. L’élève doit relier l’ouverture de la région à un effet précis sur le territoire ou les activités, sans supposer la disparition complète des pratiques innues.",
  review: {
    documented: true,
    historicallyVerified: true,
    pedagogicallyVerified: false,
    biasAndLanguageReviewed: true,
    approvedBy: null,
    approvedVersion: null,
    approvedAt: null,
  },
} as const satisfies ApprovedQuestion;

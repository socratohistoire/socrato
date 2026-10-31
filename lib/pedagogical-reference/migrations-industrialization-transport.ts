import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

export const MIGRATIONS_INDUSTRIALIZATION_URBAN_MOVEMENT_DOCUMENT = {
  schemaVersion: 1,
  id: "MIG-T-012",
  title: "Des familles canadiennes-françaises vers les centres industriels",
  kind: "other",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["migrations"],
  operationIds: ["causal_connections", "causes_and_consequences"],
  historicalDate: "1878",
  creator: "Honoré Beaugrand",
  holdingInstitution: "Project Gutenberg · transcription de l’édition de 1878",
  sourceUrl: "https://www.gutenberg.org/files/14536/14536-h/14536-h.htm",
  sourceLocator: "Honoré Beaugrand, Jeanne la Fileuse, deuxième partie, chapitres I et III, « L’émigration canadienne aux États-Unis » et « Les Canadiens de Fall River », Fall River, 1878",
  assetUrl: "https://www.gutenberg.org/ebooks/14536",
  rightsStatement: "Ouvrage publié en 1878 et appartenant au domaine public; quatre phrases originales rapprochées par Socrato. Les crochets signalent uniquement des mots retranchés.",
  transcription: "Un mouvement d’émigration […] s’est produit, depuis quelques années, dans les campagnes du Canada français. Des milliers de familles ont pris la route de l’exil, poussées […] vers les ateliers industriels de la grande république américaine. Sous le rapport du travail, les familles entières, comme règle générale, entrent dans les filatures de coton. Hommes, femmes et enfants obtiennent des emplois plus ou moins lucratifs.",
  accessibleDescription: "Extrait de quatre phrases dans lequel Honoré Beaugrand associe le départ de familles des campagnes canadiennes-françaises aux emplois offerts dans les centres industriels des États-Unis.",
  historicalContext: "Installé à Fall River, au Massachusetts, Honoré Beaugrand publie en 1878 un ouvrage consacré à l’émigration canadienne-française. Il décrit le déplacement de familles des campagnes vers les filatures de coton de la Nouvelle-Angleterre.",
  observationGuide: [
    "Identifier le milieu de départ et le milieu d’arrivée.",
    "Repérer le type d’établissement qui offre du travail aux familles.",
    "Expliquer comment les emplois industriels influencent ce déplacement.",
  ],
  interpretationCautions: [
    "Jeanne la Fileuse mêle récit littéraire, observation sociale et argumentation politique; l’extrait exprime le point de vue de Beaugrand sur l’émigration.",
    "Les crochets indiquent des passages retranchés; aucun renseignement contemporain n’a été ajouté au texte original.",
  ],
  pedagogicalUses: [
    "Relier l’industrialisation à l’émigration de familles canadiennes-françaises.",
    "Identifier les emplois en filature comme facteur d’attraction des centres industriels.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const MIGRATIONS_RAILWAY_NEW_ENGLAND_MOVEMENT_DOCUMENT = {
  schemaVersion: 1,
  id: "MIG-T-013",
  title: "Un horaire ferroviaire relie Montréal à la Nouvelle-Angleterre",
  kind: "other",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["migrations"],
  operationIds: ["causal_connections", "time_and_space"],
  historicalDate: "Juillet 1880",
  creator: "Compagnie du chemin de fer du Grand Tronc du Canada",
  holdingInstitution: "Railway Pages · reproduction numérique offerte par Dianne McIntosh",
  sourceUrl: "https://www.railwaypages.com/files/319032/1880-gtr-courtesy-dianne.pdf",
  sourceLocator: "Grand Trunk Railway of Canada, General Time Tables, juillet 1880, horaire de la ligne principale, Montréal–Portland–Boston, p. 6",
  assetUrl: "https://www.railwaypages.com/timetables",
  rightsStatement: "Horaire officiel publié en 1880 et appartenant au domaine public; données du tableau mises en phrases par Socrato. Les crochets signalent les précisions éditoriales.",
  transcription: "L’horaire officiel du Grand Tronc indique un départ de Montréal à 7 h 30 [par le train de jour]. Le même tableau donne une arrivée à Portland à 17 h. Une correspondance permet ensuite d’atteindre Boston à 22 h. Un train de nuit quitte aussi Montréal à 22 h et permet d’arriver à Boston à 13 h 15 le lendemain.",
  accessibleDescription: "Données tirées d’un horaire ferroviaire de 1880 montrant que des trains relient Montréal, Portland et Boston en moins d’une journée.",
  historicalContext: "En 1880, la ligne principale du Grand Tronc relie Montréal à Portland et à Boston. Cet horaire permet de constater que le chemin de fer rend les déplacements entre le Québec et la Nouvelle-Angleterre rapides et réguliers.",
  observationGuide: [
    "Identifier les villes reliées par l’horaire ferroviaire.",
    "Calculer approximativement la durée du trajet entre Montréal et Boston.",
    "Expliquer comment une liaison rapide et régulière peut faciliter un déplacement de population.",
  ],
  interpretationCautions: [
    "Les données du tableau ont été mises en phrases; les crochets indiquent les précisions ajoutées pour en faciliter la lecture.",
    "L’horaire atteste la possibilité matérielle du déplacement, mais ne permet pas à lui seul de connaître les motifs des voyageurs.",
  ],
  pedagogicalUses: [
    "Relier le développement des transports à l’intensification d’un mouvement migratoire.",
    "Distinguer le moyen qui facilite le déplacement du facteur économique qui attire les migrants.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const MIGRATIONS_INDUSTRIALIZATION_TRANSPORT_DOCUMENTS = [
  MIGRATIONS_INDUSTRIALIZATION_URBAN_MOVEMENT_DOCUMENT,
  MIGRATIONS_RAILWAY_NEW_ENGLAND_MOVEMENT_DOCUMENT,
] as const;

const MIGRATIONS_INDUSTRIALIZATION_TRANSPORT_SOURCES: ReferenceSource[] =
  MIGRATIONS_INDUSTRIALIZATION_TRANSPORT_DOCUMENTS.map((document) => ({
    id: `document-source:${document.id}`,
    kind: document.id === MIGRATIONS_INDUSTRIALIZATION_URBAN_MOVEMENT_DOCUMENT.id ? "other" : "museum-or-archive",
    title: document.title,
    creator: document.creator,
    publisher: document.holdingInstitution,
    publicationYear: document.id === MIGRATIONS_INDUSTRIALIZATION_URBAN_MOVEMENT_DOCUMENT.id ? 1878 : 1880,
    url: document.sourceUrl,
    locator: document.sourceLocator,
    rightsNote: document.rightsStatement,
    verificationStatus: "verified",
  }));

export const MIGRATIONS_INDUSTRIALIZATION_TRANSPORT_QUESTION = {
  schemaVersion: 1,
  id: "question:migrations:short-answer-007",
  scope: "notional",
  knowledgeHeadingId: "migrations",
  relatedKnowledgeHeadingIds: ["migrations"],
  referenceCardId: "reference-card:migrations",
  historicalRecordId: "historical-record:migrations",
  status: "ready-for-review",
  format: "short-answer",
  prompt: "Expliquez comment l’industrialisation et le développement des transports influencent les déplacements de population au Québec entre 1840 et 1896. Dans votre réponse, établissez un lien de causalité pour chacun de ces facteurs.",
  instruction: "Établissez un premier lien entre l’industrialisation et un déplacement de population, puis un second entre le développement des transports et un déplacement de population. Appuyez chaque lien sur un indice tiré d’un document.",
  initialGuidance: "J’attends vos deux liens de causalité…",
  expectedAnswer: "Premier lien : le développement des filatures dans les centres industriels de la Nouvelle-Angleterre offre du travail rémunéré à plusieurs membres d’une même famille. Ces emplois attirent des familles canadiennes-françaises qui quittent les campagnes du Québec pour les États-Unis. Second lien : le développement du chemin de fer relie Montréal à Portland et à Boston en moins d’une journée. En rendant les centres industriels de la Nouvelle-Angleterre rapidement accessibles, le train facilite l’émigration de Canadiens français. L’élève doit distinguer l’attrait économique des emplois industriels du rôle matériel des transports qui rendent le déplacement plus facile.",
  historicalDocumentIds: MIGRATIONS_INDUSTRIALIZATION_TRANSPORT_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Nommer l’industrialisation et le chemin de fer sans expliquer comment ils influencent un déplacement de population.",
    "Donner deux exemples liés seulement à l’industrialisation ou seulement aux transports.",
    "Confondre l’exode rural vers les villes québécoises avec l’émigration vers les États-Unis.",
    "Présenter le chemin de fer comme la cause économique du départ plutôt que comme un moyen qui facilite le déplacement.",
  ],
  distractors: [],
  operationId: "causal_connections",
  sourceIds: MIGRATIONS_INDUSTRIALIZATION_TRANSPORT_SOURCES.map(({ id }) => id),
  sourceCatalog: MIGRATIONS_INDUSTRIALIZATION_TRANSPORT_SOURCES,
  rationale: "Les deux sources primaires isolent deux mécanismes complémentaires. Le texte de Beaugrand permet de relier les emplois des filatures au départ de familles canadiennes-françaises; l’horaire du Grand Tronc permet de relier la rapidité du trajet ferroviaire à l’accessibilité de la Nouvelle-Angleterre. L’élève doit construire deux enchaînements causaux distincts.",
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

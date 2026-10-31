import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

export const MANIFESTATIONS_LAVAL_HIGHER_EDUCATION_DOCUMENT = {
  schemaVersion: 1,
  id: "MSC-D-002",
  title: "Le développement de l’Université Laval — 1852-1896",
  kind: "statistics",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["manifestations-socioculturelles"],
  operationIds: ["differences_and_similarities"],
  historicalDate: "1852-1896",
  creator: "Université Laval",
  holdingInstitution: "Canadiana · Université Laval",
  sourceUrl: "https://www.canadiana.ca/view/oocihm.8_01858_39",
  sourceLocator: "Annuaire de l’Université Laval pour l’année académique 1895-96, no 39; Constitutions et règlements de l’Université Laval, Québec, 1879, charte royale et organisation des facultés",
  assetUrl: "https://www.canadiana.ca/view/oocihm.8_01858_39",
  rightsStatement: "Publications de 1879 et de 1895-1896 appartenant au domaine public. Le tableau est une transcription structurée de renseignements tirés de la charte et de l’annuaire; il ne constitue pas un extrait continu.",
  transcription: "En 1852, l’Université Laval est érigée par charte royale. Elle comprend les facultés de théologie, de droit, de médecine et des arts. En 1895-1896, l’annuaire en français présente les étudiants admis aux cours à Québec, les collèges agrégés et la faculté de médecine de l’Université Laval à Montréal. Ces données montrent le développement d’un réseau d’enseignement supérieur francophone lié à plusieurs établissements.",
  accessibleDescription: "Tableau présentant quatre repères sur l’Université Laval : sa création en 1852, ses facultés, son développement à Québec et à Montréal ainsi que la langue française de son annuaire.",
  historicalContext: "Fondée par le Séminaire de Québec et érigée par charte royale en 1852, l’Université Laval devient la première université francophone catholique en Amérique du Nord. Son développement passe par ses facultés à Québec, des collèges agrégés et une succursale universitaire à Montréal.",
  observationGuide: [
    "Repérer le statut accordé à l’Université Laval en 1852.",
    "Identifier les quatre facultés mentionnées.",
    "Observer les indices d’un développement au-delà du seul campus de Québec.",
  ],
  interpretationCautions: [
    "Le tableau réunit des renseignements provenant de la charte et de l’annuaire; il ne reproduit pas un passage continu.",
    "La langue de l’annuaire indique le principal milieu linguistique desservi, sans signifier que chaque membre de l’Université parle uniquement français.",
  ],
  pedagogicalUses: [
    "Comparer le développement institutionnel de l’enseignement supérieur francophone et anglophone.",
    "Faire ressortir la création de facultés et l’élargissement du réseau universitaire francophone.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const MANIFESTATIONS_MCGILL_HIGHER_EDUCATION_DOCUMENT = {
  schemaVersion: 1,
  id: "MSC-D-003",
  title: "Le développement de l’Université McGill — 1852-1896",
  kind: "statistics",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["manifestations-socioculturelles"],
  operationIds: ["differences_and_similarities"],
  historicalDate: "1852-1896",
  creator: "McGill University",
  holdingInstitution: "McGill University Library · Internet Archive",
  sourceUrl: "https://www.library.mcgill.ca/hostedjournals/calendars.html",
  sourceLocator: "Annual Calendar of McGill College and University, Session 1895-96, page de titre et sections consacrées aux facultés, aux sciences appliquées et au cours Donalda",
  assetUrl: "https://archive.org/details/McGillLibrary-rbsc_calendar-mcgill-college_1895-96_octavo13936-20805",
  rightsStatement: "Annuaire universitaire publié en 1895 et appartenant au domaine public. Le tableau est une transcription structurée de renseignements tirés de l’annuaire; il ne constitue pas un extrait continu.",
  transcription: "En 1852, McGill College est réorganisé par une charte amendée. En 1895-1896, son annuaire en anglais présente les facultés des arts, de droit, de médecine, des sciences appliquées ainsi que de médecine comparée et vétérinaire. Les sciences appliquées comprennent notamment le génie civil, mécanique, minier et électrique. La Faculté des arts offre aussi le cours spécial Donalda destiné aux femmes.",
  accessibleDescription: "Tableau présentant quatre repères sur l’Université McGill : sa réorganisation en 1852, ses facultés en 1895-1896, ses programmes scientifiques et techniques ainsi que la langue anglaise de son annuaire.",
  historicalContext: "Créée par une charte royale en 1821, McGill est réorganisée par une charte amendée en 1852. À la fin du XIXe siècle, l’établissement anglophone développe plusieurs facultés et diversifie ses programmes scientifiques, techniques et professionnels.",
  observationGuide: [
    "Distinguer la fondation antérieure de McGill de sa réorganisation en 1852.",
    "Repérer les facultés et les domaines spécialisés présents en 1895-1896.",
    "Identifier l’indice d’un élargissement de l’accès aux études supérieures.",
  ],
  interpretationCautions: [
    "Le tableau réunit des renseignements provenant de plusieurs sections du même annuaire; il ne reproduit pas un passage continu.",
    "Le cours Donalda marque un accès accru des femmes, mais les classes féminines demeurent alors séparées de celles des hommes.",
  ],
  pedagogicalUses: [
    "Comparer le développement institutionnel de l’enseignement supérieur anglophone et francophone.",
    "Faire ressortir la diversification scientifique, technique et professionnelle de McGill.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const MANIFESTATIONS_HIGHER_EDUCATION_DOCUMENTS = [
  MANIFESTATIONS_LAVAL_HIGHER_EDUCATION_DOCUMENT,
  MANIFESTATIONS_MCGILL_HIGHER_EDUCATION_DOCUMENT,
] as const;

const MANIFESTATIONS_HIGHER_EDUCATION_SOURCES: ReferenceSource[] = MANIFESTATIONS_HIGHER_EDUCATION_DOCUMENTS.map((document) => ({
  id: `document-source:${document.id}`,
  kind: "museum-or-archive",
  title: document.title,
  creator: document.creator,
  publisher: document.holdingInstitution,
  publicationYear: 1895,
  url: document.sourceUrl,
  locator: document.sourceLocator,
  rightsNote: document.rightsStatement,
  verificationStatus: "verified",
}));

export const MANIFESTATIONS_HIGHER_EDUCATION_COMPARISON_QUESTION = {
  schemaVersion: 1,
  id: "question:manifestations-socioculturelles:short-answer-002",
  scope: "notional",
  knowledgeHeadingId: "manifestations-socioculturelles",
  relatedKnowledgeHeadingIds: ["manifestations-socioculturelles"],
  referenceCardId: "reference-card:manifestations-socioculturelles",
  historicalRecordId: "historical-record:manifestations-socioculturelles",
  status: "ready-for-review",
  format: "short-answer",
  prompt: "Comparez le développement de l’enseignement supérieur francophone et anglophone au Québec entre 1852 et 1896. Indiquez une similitude et une différence.",
  instruction: "À l’aide des deux documents, relevez d’abord une similitude dans le développement des deux universités, puis une différence. Appuyez chaque comparaison sur un renseignement précis.",
  initialGuidance: "J’attends une similitude et une différence appuyées par les deux documents…",
  expectedAnswer: "Similitude : entre 1852 et 1896, les deux établissements se structurent et développent plusieurs facultés afin d’offrir un enseignement supérieur dans différents domaines, notamment les arts, le droit et la médecine. Différence : Laval, université francophone érigée en 1852, conserve quatre facultés traditionnelles et étend son réseau par des collèges agrégés et une présence à Montréal, tandis que McGill, établissement anglophone réorganisé en 1852, se diversifie davantage dans les sciences appliquées, le génie et la médecine vétérinaire. Une autre différence acceptable est que Laval est créée comme université en 1852, alors que McGill, fondée plus tôt, est réorganisée cette année-là. Accepter toute similitude et toute différence exactes qui mobilisent les deux documents.",
  historicalDocumentIds: MANIFESTATIONS_HIGHER_EDUCATION_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Décrire séparément les deux universités sans formuler une similitude et une différence.",
    "Comparer uniquement la langue des annuaires sans expliquer le développement des établissements.",
    "Affirmer que McGill est fondée en 1852 plutôt que réorganisée cette année-là.",
    "Nommer un élément qui concerne une seule université sans établir de comparaison avec l’autre.",
  ],
  distractors: [],
  operationId: "differences_and_similarities",
  sourceIds: MANIFESTATIONS_HIGHER_EDUCATION_SOURCES.map(({ id }) => id),
  sourceCatalog: MANIFESTATIONS_HIGHER_EDUCATION_SOURCES,
  rationale: "Deux tableaux construits selon les mêmes repères permettent à l’élève de comparer les trajectoires institutionnelles sans que la similitude et la différence soient déjà formulées dans les documents.",
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

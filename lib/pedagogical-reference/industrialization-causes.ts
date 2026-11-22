import type { LearningSessionDocument } from "../student-learning-session/types.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

const knowledgeHeadingId = "premiere-phase-d-industrialisation";
const operationId = "causes_and_consequences";

const investment = {
  id: "document-source:IND-T-006",
  kind: "museum-or-archive",
  title: "La filature Hudon",
  publisher: "MEM – Centre des mémoires montréalaises",
  url: "https://ville.montreal.qc.ca/memoiresdesmontrealais/la-filature-hudon",
  locator: "Sections sur la fondation et la création de la filature.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

const railAndLabor = {
  id: "document-source:IND-T-007",
  kind: "academic",
  title: "Women in the Quebec Cotton Industry, 1890–1950",
  creator: "Gail Cuthbert Brandt",
  publisher: "Material History Bulletin",
  url: "https://journals.lib.unb.ca/index.php/MCR/article/download/17452/22575?inline=1",
  locator: "Paragraphes 6 et 9.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

const testimony = {
  id: "document-source:IND-T-008",
  kind: "government",
  title: "Témoignage d’Adèle Lavoie sur ses horaires",
  creator: "Adèle Lavoie",
  publisher: "Commission royale sur les relations du travail avec le capital au Canada",
  publicationYear: 1889,
  url: "https://documents.recitus.qc.ca/dossiers/document/contexte-temoignage-d-adele-lavoie",
  locator: "Témoignage du 16 février 1888, partie I, Témoignages – Québec, p. 311–313.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

const engine = {
  id: "document-source:IND-I-006",
  kind: "other",
  title: "La machine à vapeur Wheelock",
  creator: "Goldie & McCulloch",
  publisher: "Goldie & McCulloch, Galt (Ontario)",
  publicationYear: 1889,
  url: "https://commons.wikimedia.org/wiki/File:Wheelock_Engine_Illustration.png",
  locator: "Catalogue des machines à vapeur de Goldie & McCulloch, 1889.",
  verificationStatus: "verified",
} as const satisfies ReferenceSource;

function excerptDocument(
  source: ReferenceSource,
  typeLabel: string,
  excerpt: string,
  editorialNote: string,
  dateLabel?: string,
): LearningSessionDocument {
  return {
    id: source.id.replace("document-source:", ""),
    title: source.title,
    typeLabel,
    dateLabel,
    authorLabel: source.creator,
    institutionLabel: source.publisher,
    sourceLabel: source.locator,
    sourceUrls: source.url ? [source.url] : [],
    rightsLabel: dateLabel ? "Témoignage du XIXᵉ siècle, domaine public." : "Reformulation pédagogique avec attribution.",
    editorialNote,
    content: { kind: "historical_excerpt", excerpt, adapted: true },
    historicalKnowledgeIds: [knowledgeHeadingId],
    intellectualOperationIds: [operationId],
  };
}

export const INDUSTRIALIZATION_CAUSES_DOCUMENTS: LearningSessionDocument[] = [
  {
    id: "IND-I-006",
    title: engine.title,
    typeLabel: "Illustration de catalogue",
    dateLabel: "1889",
    authorLabel: engine.creator,
    sourceLabel: engine.locator,
    sourceUrls: [engine.url, "https://archive.org/details/cihm_90256"],
    rightsLabel: "Illustration du XIXᵉ siècle, domaine public.",
    content: {
      kind: "historical_image",
      localSrc: "https://upload.wikimedia.org/wikipedia/commons/3/30/Wheelock_Engine_Illustration.png",
      alt: "Vue de trois quarts d’une machine à vapeur Wheelock avec son grand volant et son cylindre horizontal.",
      description: "Machine à vapeur industrielle fabriquée par Goldie & McCulloch à Galt, en Ontario, et présentée dans son catalogue de 1889.",
    },
    historicalKnowledgeIds: [knowledgeHeadingId],
    intellectualOperationIds: [operationId],
  },
  excerptDocument(
    investment,
    "Article du MEM",
    "En 1872, Victor Hudon lance un projet de filature à Hochelaga. La compagnie est constituée en 1873 avec un capital autorisé de 200 000 dollars. À l’ouverture de l’usine en 1874, ce montant est porté à 600 000 dollars. Une partie de l’investissement sert à acquérir de la machinerie en Angleterre.",
    "Texte pédagogique adapté d’un article du MEM sur la filature Hudon.",
  ),
  excerptDocument(
    railAndLabor,
    "Étude historique",
    "À la fin du XIXᵉ siècle, Montréal est un important carrefour ferroviaire. Les filatures peuvent faire venir du coton brut des États-Unis par le train. Le réseau leur donne aussi accès aux marchés de l’Ouest canadien. Des entreprises textiles recrutent des familles dans les campagnes pour les faire travailler dans les centres où se trouvent leurs usines.",
    "Texte pédagogique adapté d’une étude de Gail Cuthbert Brandt sur l’industrie cotonnière québécoise.",
  ),
  excerptDocument(
    testimony,
    "Témoignage",
    "La journée commence à six heures et demie du matin. Nous finissons à six heures et quart les jours ordinaires. Les jours où nous devons rester plus tard, nous finissons à sept heures et quart. Ces jours-là, nous n’avons pas de pause supplémentaire et partir avant la fin peut nous faire renvoyer.",
    "Témoignage adapté à partir des réponses d’Adèle Lavoie sur ses horaires en manufacture.",
    "1888",
  ),
];

const sources = [engine, investment, railAndLabor, testimony];

export const INDUSTRIALIZATION_CAUSES_QUESTION = {
  schemaVersion: 1,
  id: "question:premiere-phase-d-industrialisation:causes",
  scope: "notional",
  knowledgeHeadingId,
  relatedKnowledgeHeadingIds: [knowledgeHeadingId],
  referenceCardId: "reference-card:premiere-phase-d-industrialisation",
  historicalRecordId: "historical-record:premiere-phase-d-industrialisation",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Décrivez deux causes de la première phase d’industrialisation au Québec entre 1850 et 1896.",
  instruction: "Expliquez comment chacune de ces causes favorise l’industrialisation.",
  expectedAnswer: [
    "Disponibilité de la main-d’œuvre : l’exode rural et l’immigration fournissent des travailleurs aux usines.",
    "Disponibilité des capitaux : des investisseurs, notamment britanniques, financent la construction d’usines et l’achat de machines.",
    "Développement des transports : l’expansion du réseau ferroviaire facilite l’approvisionnement en matières premières et la distribution des produits.",
    "Progrès technologiques : l’utilisation de machines à vapeur permet d’augmenter la production et de développer les usines.",
    "Accepter deux causes distinctes, chacune accompagnée d’une explication de son effet sur l’industrialisation. L’élève peut répondre sans citer les documents ni indiquer lequel écarter.",
  ].join("\n"),
  historicalDocumentIds: INDUSTRIALIZATION_CAUSES_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Décrire les longues journées en manufacture comme une cause du développement industriel.",
    "Nommer deux facteurs sans expliquer comment ils favorisent l’industrialisation.",
  ],
  distractors: [],
  operationId,
  sourceIds: sources.map(({ id }) => id),
  sourceCatalog: sources,
  rationale: "Le dossier fournit des indices sur les capitaux, le chemin de fer, le recrutement en milieu rural et la mécanisation. Le témoignage sur les horaires décrit les conditions de travail et constitue le document à écarter.",
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

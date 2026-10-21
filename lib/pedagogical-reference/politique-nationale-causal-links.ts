import type { HistoricalDocumentRecord } from "./historical-document.ts";
import { POLITIQUE_NATIONALE_MANUFACTURER_TARIFF_DOCUMENT } from "./politique-nationale-tariff-comparison.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

export const POLITIQUE_NATIONALE_CPR_CONTRACT_DOCUMENT = {
  schemaVersion: 1,
  id: "PN-T-003",
  title: "Le gouvernement finance la construction du Canadien Pacifique",
  kind: "law-or-official-text",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["politique-nationale"],
  operationIds: ["causal_connections", "relationships_between_facts"],
  historicalDate: "15 février 1881",
  creator: "Parlement du Canada",
  holdingInstitution: "Canadiana — Institut canadien de microreproductions historiques",
  sourceUrl: "https://www.canadiana.ca/view/oocihm.02046/1",
  sourceLocator: "Acte concernant le chemin de fer Canadien du Pacifique, 44 Victoria, chapitre 1, article 3",
  assetUrl: "https://commons.wikimedia.org/wiki/File:Contract_between_the_government_of_the_Dominion_of_Canada_and_the_Canadian_Pacific_Railway_Company_(microform)_-_also,_the_Consolidated_Railway_Act_(1879),_and_the_act_of_1881_amending_it_(IA_cihm_02046).pdf",
  rightsStatement: "Loi canadienne de 1881 dans le domaine public; traduction et adaptation pédagogique par Socrato.",
  transcription: "En échange de l’achèvement et de l’exploitation continue et efficace du chemin de fer, le gouvernement peut accorder à la Compagnie une subvention de 25 millions de dollars et 25 millions d’acres de terre. Ces subventions doivent être versées et concédées au fur et à mesure de l’avancement des travaux. Le gouvernement peut aussi accorder les terres nécessaires à la voie ferrée, aux gares et à d’autres installations.",
  accessibleDescription: "Extrait adapté de la loi de 1881 qui lie l’aide financière et les concessions de terres du gouvernement à la construction et à l’exploitation du Canadien Pacifique.",
  historicalContext: "Le contrat de 1880 est ratifié par le Parlement en 1881. L’aide publique en argent et en terres réduit le risque financier de la compagnie et rend possible la construction du chemin de fer transcontinental.",
  observationGuide: [
    "Repérer ce que le gouvernement accorde à la compagnie.",
    "Identifier ce que la compagnie doit accomplir en échange.",
    "Formuler le lien de causalité entre l’aide publique et la construction du chemin de fer.",
  ],
  interpretationCautions: [
    "L’extrait est traduit et resserré à partir de l’article 3; il conserve les montants, les terres et la condition principale de la loi.",
    "Les terres accordées ne sont pas des territoires vides : elles se trouvent dans un Ouest déjà habité par des Premières Nations et des Métis.",
  ],
  pedagogicalUses: [
    "Expliquer comment les subventions et les concessions de terres soutiennent la construction du Canadien Pacifique.",
    "Relier le financement du chemin de fer à la colonisation des terres de l’Ouest.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const POLITIQUE_NATIONALE_CPR_SETTLEMENT_BROCHURE_DOCUMENT = {
  schemaVersion: 1,
  id: "PN-T-004",
  title: "Le Canadien Pacifique fait la promotion des terres de l’Ouest",
  kind: "other",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["politique-nationale"],
  operationIds: ["causal_connections", "relationships_between_facts"],
  historicalDate: "1892",
  creator: "Compagnie du chemin de fer Canadien Pacifique",
  holdingInstitution: "Internet Archive — collection de l’Institut canadien de microreproductions historiques",
  sourceUrl: "https://archive.org/details/cihm_03416",
  sourceLocator: "Fermes gratuites, Manitoba, Assiniboia, Alberta, Saskatchewan, p. 9 (PDF, p. 13)",
  assetUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Fermes_gratuites%2C_Manitoba%2C_Assiniboia%2C_Alberta%2C_Saskatchewan_%28microforme%29_-_les_quatres_grandes_provinces_fertiles_de_l%27ouest_canadien_%28IA_cihm_03416%29.pdf#page=13",
  rightsStatement: "Brochure publicitaire canadienne de 1892 dans le domaine public; extrait modernisé et resserré par Socrato.",
  transcription: "Le gouvernement du Canada offre gratuitement 160 acres aux hommes âgés de plus de 18 ans pour les inciter à s’établir dans les Prairies. Ces concessions sont habituellement situées de 15 à 50 milles, parfois davantage, des gares. Selon la compagnie, un colon qui dispose de 1 000 à 2 000 dollars gagne à acheter une terre près d’une ligne ferroviaire, car il économise sur le transport de ses denrées. L’éloignement du chemin de fer constitue la principale différence entre les terres gratuites et les terres vendues.",
  accessibleDescription: "Extrait d’une brochure promotionnelle du Canadien Pacifique qui présente les concessions de 160 acres et insiste sur l’avantage économique d’une terre située près du chemin de fer.",
  historicalContext: "Le gouvernement et les compagnies ferroviaires cherchent à attirer des colons dans l’Ouest. Le Canadien Pacifique possède lui-même de vastes terres, vend des lots et profite du transport des personnes, de l’équipement et des récoltes.",
  observationGuide: [
    "Repérer la mesure utilisée pour attirer des colons.",
    "Comparer l’emplacement des terres gratuites et des terres vendues.",
    "Expliquer pourquoi la proximité du chemin de fer facilite l’établissement agricole.",
  ],
  interpretationCautions: [
    "La brochure est une publicité de la compagnie ferroviaire : elle cherche à convaincre et minimise les difficultés de l’établissement dans l’Ouest.",
    "Le terme « terres gratuites » masque les conditions d’obtention d’une concession et la présence antérieure de populations autochtones et métisses.",
  ],
  pedagogicalUses: [
    "Établir un lien de causalité entre l’accès ferroviaire et la colonisation de l’Ouest.",
    "Montrer que la compagnie ferroviaire a intérêt à attirer des colons près de son réseau.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const POLITIQUE_NATIONALE_CAUSAL_LINKS_NEW_DOCUMENTS = [
  POLITIQUE_NATIONALE_CPR_CONTRACT_DOCUMENT,
  POLITIQUE_NATIONALE_CPR_SETTLEMENT_BROCHURE_DOCUMENT,
] as const;

export const POLITIQUE_NATIONALE_CAUSAL_LINKS_DOCUMENTS = [
  POLITIQUE_NATIONALE_MANUFACTURER_TARIFF_DOCUMENT,
  ...POLITIQUE_NATIONALE_CAUSAL_LINKS_NEW_DOCUMENTS,
] as const;

const POLITIQUE_NATIONALE_CAUSAL_LINKS_SOURCES: ReferenceSource[] = [
  {
    id: `document-source:${POLITIQUE_NATIONALE_MANUFACTURER_TARIFF_DOCUMENT.id}`,
    kind: "government",
    title: "Budget Speech — 18 February 1881",
    creator: POLITIQUE_NATIONALE_MANUFACTURER_TARIFF_DOCUMENT.creator,
    publisher: POLITIQUE_NATIONALE_MANUFACTURER_TARIFF_DOCUMENT.holdingInstitution,
    publicationYear: 1881,
    url: POLITIQUE_NATIONALE_MANUFACTURER_TARIFF_DOCUMENT.sourceUrl,
    locator: POLITIQUE_NATIONALE_MANUFACTURER_TARIFF_DOCUMENT.sourceLocator,
    rightsNote: POLITIQUE_NATIONALE_MANUFACTURER_TARIFF_DOCUMENT.rightsStatement,
    verificationStatus: "verified",
  },
  {
    id: `document-source:${POLITIQUE_NATIONALE_CPR_CONTRACT_DOCUMENT.id}`,
    kind: "museum-or-archive",
    title: "Contract between the government of the Dominion of Canada and the Canadian Pacific Railway Company",
    creator: "Parlement du Canada",
    publisher: POLITIQUE_NATIONALE_CPR_CONTRACT_DOCUMENT.holdingInstitution,
    publicationYear: 1881,
    url: POLITIQUE_NATIONALE_CPR_CONTRACT_DOCUMENT.sourceUrl,
    locator: POLITIQUE_NATIONALE_CPR_CONTRACT_DOCUMENT.sourceLocator,
    rightsNote: POLITIQUE_NATIONALE_CPR_CONTRACT_DOCUMENT.rightsStatement,
    verificationStatus: "verified",
  },
  {
    id: `document-source:${POLITIQUE_NATIONALE_CPR_SETTLEMENT_BROCHURE_DOCUMENT.id}`,
    kind: "museum-or-archive",
    title: "Fermes gratuites, Manitoba, Assiniboia, Alberta, Saskatchewan",
    creator: POLITIQUE_NATIONALE_CPR_SETTLEMENT_BROCHURE_DOCUMENT.creator,
    publisher: POLITIQUE_NATIONALE_CPR_SETTLEMENT_BROCHURE_DOCUMENT.holdingInstitution,
    publicationYear: 1892,
    url: POLITIQUE_NATIONALE_CPR_SETTLEMENT_BROCHURE_DOCUMENT.sourceUrl,
    locator: POLITIQUE_NATIONALE_CPR_SETTLEMENT_BROCHURE_DOCUMENT.sourceLocator,
    rightsNote: POLITIQUE_NATIONALE_CPR_SETTLEMENT_BROCHURE_DOCUMENT.rightsStatement,
    verificationStatus: "verified",
  },
];

export const POLITIQUE_NATIONALE_TARIFF_RAILWAY_SETTLEMENT_CAUSAL_QUESTION = {
  schemaVersion: 1,
  id: "question:politique-nationale:document-interpretation-003",
  scope: "notional",
  knowledgeHeadingId: "politique-nationale",
  relatedKnowledgeHeadingIds: ["politique-nationale"],
  referenceCardId: "reference-card:politique-nationale",
  historicalRecordId: "historical-record:politique-nationale",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Établis des liens de causalité entre les tarifs douaniers de la Politique nationale, le chemin de fer Canadien Pacifique et la colonisation de l’Ouest.",
  instruction: "À l’aide des trois documents, construis une explication dans laquelle chaque élément entraîne ou favorise le suivant. Ne te contente pas d’énumérer les trois composantes.",
  expectedAnswer: "Le gouvernement accorde au Canadien Pacifique 25 millions de dollars et 25 millions d’acres afin de favoriser la construction et l’exploitation du chemin de fer. Le rail rend ensuite les terres de l’Ouest plus accessibles et diminue le coût du transport des personnes, de l’équipement et des récoltes, ce qui encourage l’établissement de colons près des lignes. Cette colonisation forme un marché plus vaste dans l’Ouest : les colons achètent notamment des machines et d’autres produits manufacturés. Les tarifs douaniers protègent les fabricants canadiens contre la concurrence étrangère, tandis que le chemin de fer leur permet d’expédier leurs marchandises vers ce nouveau marché. Les trois mesures se renforcent donc pour intégrer l’Est manufacturier et l’Ouest agricole au marché canadien.",
  historicalDocumentIds: POLITIQUE_NATIONALE_CAUSAL_LINKS_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Énumérer les tarifs, le chemin de fer et la colonisation sans employer de relation de cause à effet.",
    "Affirmer que les trois composantes sont créées en même temps par une seule loi de 1879.",
    "Présenter les tarifs douaniers comme une interdiction complète des produits étrangers.",
    "Affirmer que l’Ouest est vide avant l’arrivée des colons.",
    "Oublier que la brochure du Canadien Pacifique est un document publicitaire intéressé.",
  ],
  distractors: [],
  operationId: "causal_connections",
  sourceIds: POLITIQUE_NATIONALE_CAUSAL_LINKS_SOURCES.map(({ id }) => id),
  sourceCatalog: POLITIQUE_NATIONALE_CAUSAL_LINKS_SOURCES,
  rationale: "Les documents permettent de reconstruire un système de causes qui se renforcent : l’aide publique soutient le rail; le rail facilite l’établissement et le transport; la population colonisatrice agrandit le marché occidental auquel les fabricants canadiens protégés peuvent vendre leurs produits.",
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

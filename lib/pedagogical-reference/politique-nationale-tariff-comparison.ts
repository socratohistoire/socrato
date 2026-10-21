import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

export const POLITIQUE_NATIONALE_MANUFACTURER_TARIFF_DOCUMENT = {
  schemaVersion: 1,
  id: "PN-T-001",
  title: "Tilley présente l’Ouest comme un marché protégé",
  kind: "law-or-official-text",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["politique-nationale"],
  operationIds: ["differences_and_similarities", "causes_and_consequences"],
  historicalDate: "18 février 1881",
  creator: "Samuel Leonard Tilley, ministre des Finances",
  holdingInstitution: "Bibliothèque du Parlement",
  sourceUrl: "https://lop.parl.ca/staticfiles/ParlInfo/Documents/Budgets/En/1881-02-18.pdf",
  sourceLocator: "Débats de la Chambre des communes, 18 février 1881, p. 1023-1024 (PDF, p. 6)",
  assetUrl: "https://lop.parl.ca/staticfiles/ParlInfo/Documents/Budgets/En/1881-02-18.pdf#page=6",
  rightsStatement: "Débats parlementaires canadiens du XIXe siècle dans le domaine public; traduction et adaptation pédagogique par Socrato.",
  transcription: "Sous l’ancien tarif, les wagons ferroviaires étaient importés des États-Unis. Dans la production de machines agricoles, de voitures et d’autres articles, les deux dernières années ont connu une forte augmentation. Les chiffres du Manitoba montrent une hausse remarquable des achats de produits manufacturés canadiens, dont une part importante est constituée de machines agricoles. Un nouveau marché s’est ouvert à nos marchandises, tandis que les produits américains en ont été exclus.",
  accessibleDescription: "Court extrait traduit d’un discours budgétaire dans lequel le ministre des Finances associe le tarif à la croissance de la production canadienne et à l’ouverture du marché manitobain aux manufacturiers du pays.",
  historicalContext: "Deux ans après l’adoption du tarif protecteur de 1879, Tilley défend la Politique nationale devant la Chambre des communes. Il présente la hausse de la production manufacturière et les ventes de machines agricoles au Manitoba comme des résultats favorables du tarif.",
  observationGuide: [
    "Repérer ce qui était auparavant importé des États-Unis.",
    "Relever les expressions qui indiquent une hausse de la production et des ventes canadiennes.",
    "Identifier le marché régional qui s’ouvre aux manufacturiers canadiens.",
  ],
  interpretationCautions: [
    "Extrait traduit et resserré par Socrato à partir du discours anglais; les passages retenus se suivent dans la même intervention.",
    "Tilley est le ministre qui défend le tarif : son discours expose le point de vue du gouvernement, et non le témoignage neutre d’un manufacturier.",
  ],
  pedagogicalUses: [
    "Déterminer un effet favorable du tarif pour les manufacturiers du Québec ou de l’Ontario.",
    "Comparer le point de vue gouvernemental aux critiques formulées au nom des agriculteurs des Prairies.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const POLITIQUE_NATIONALE_PRAIRIE_FARMER_TARIFF_DOCUMENT = {
  schemaVersion: 1,
  id: "PN-T-002",
  title: "Laurier dénonce le poids du tarif pour les agriculteurs",
  kind: "other",
  status: "ready-for-review",
  periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["politique-nationale"],
  operationIds: ["differences_and_similarities", "causes_and_consequences"],
  historicalDate: "20 juin 1893",
  creator: "Wilfrid Laurier, chef du Parti libéral du Canada",
  holdingInstitution: "Internet Archive — collection de l’Institut canadien de microreproductions historiques",
  sourceUrl: "https://archive.org/details/cihm_09048",
  sourceLocator: "Official Report of the Liberal Convention, discours de Wilfrid Laurier, p. 31-32 (PDF, p. 46-47)",
  assetUrl: "https://archive.org/download/cihm_09048/cihm_09048.pdf#page=46",
  rightsStatement: "Discours politique canadien de 1893 dans le domaine public; traduction et adaptation pédagogique par Socrato.",
  transcription: "Je demande aux agriculteurs présents s’il n’est pas vrai que la période la plus difficile pour le cultivateur est celle qui suit son établissement [son installation sur une terre agricole]. C’est le moment où, s’il doit être favorisé, il devrait être aidé; pourtant, les agriculteurs du Manitoba ont été forcés de payer tribut aux manufacturiers de l’Est. Le Manitoba accueillerait avec joie le jour où il serait libéré du poids de la Politique nationale.",
  accessibleDescription: "Court extrait traduit d’un discours de Wilfrid Laurier qui présente le tarif comme un poids imposé aux agriculteurs du Manitoba au profit des manufacturiers de l’Est.",
  historicalContext: "Lors du congrès libéral de 1893, Laurier critique la Politique nationale conservatrice. Il affirme que les agriculteurs nouvellement établis dans l’Ouest doivent acheter des biens protégés au bénéfice des manufacturiers de l’Est.",
  observationGuide: [
    "Repérer le groupe que Laurier présente comme étant en difficulté.",
    "Expliquer l’expression « payer tribut aux manufacturiers de l’Est ».",
    "Identifier la région qui, selon Laurier, supporte le poids de la Politique nationale.",
  ],
  interpretationCautions: [
    "Extrait traduit et resserré par Socrato à partir du discours anglais; une phrase intermédiaire qui répète l’idée générale a été omise.",
    "Laurier dirige l’opposition libérale : son discours formule une critique partisane et ne constitue pas le témoignage direct d’un agriculteur.",
  ],
  pedagogicalUses: [
    "Déterminer un effet défavorable attribué au tarif pour les agriculteurs des Prairies.",
    "Comparer un coût supporté par les agriculteurs de l’Ouest à l’avantage commercial obtenu par les manufacturiers de l’Est.",
  ],
  version: "0.1.0",
  approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const POLITIQUE_NATIONALE_TARIFF_COMPARISON_DOCUMENTS = [
  POLITIQUE_NATIONALE_MANUFACTURER_TARIFF_DOCUMENT,
  POLITIQUE_NATIONALE_PRAIRIE_FARMER_TARIFF_DOCUMENT,
] as const;

const POLITIQUE_NATIONALE_TARIFF_COMPARISON_SOURCES = POLITIQUE_NATIONALE_TARIFF_COMPARISON_DOCUMENTS.map((document): ReferenceSource => ({
  id: `document-source:${document.id}`,
  kind: document.id === "PN-T-001" ? "government" : "museum-or-archive",
  title: document.id === "PN-T-001" ? "Budget Speech — 18 February 1881" : "Official Report of the Liberal Convention, Ottawa, June 20 and 21, 1893",
  creator: document.creator,
  publisher: document.holdingInstitution,
  publicationYear: document.id === "PN-T-001" ? 1881 : 1893,
  url: document.sourceUrl,
  locator: document.sourceLocator,
  rightsNote: document.rightsStatement,
  verificationStatus: "verified",
}));

export const POLITIQUE_NATIONALE_TARIFF_EFFECTS_COMPARISON_QUESTION = {
  schemaVersion: 1,
  id: "question:politique-nationale:document-interpretation-001",
  scope: "notional",
  knowledgeHeadingId: "politique-nationale",
  relatedKnowledgeHeadingIds: ["politique-nationale"],
  referenceCardId: "reference-card:politique-nationale",
  historicalRecordId: "historical-record:politique-nationale",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Après l’adoption du tarif protecteur de la Politique nationale en 1879, compare un effet de ce tarif pour un manufacturier du Québec ou de l’Ontario et pour un agriculteur des Prairies.",
  instruction: "À l’aide des deux documents, relève l’effet présenté pour chacun des deux groupes, puis formule clairement la différence entre leurs situations. Appuie chaque effet sur un indice précis du document correspondant.",
  expectedAnswer: "Pour un manufacturier du Québec ou de l’Ontario, le tarif protecteur réserve une plus grande part du marché canadien aux produits fabriqués au pays : Tilley souligne l’augmentation de la production de machines agricoles et l’ouverture du marché du Manitoba aux marchandises canadiennes tandis que les produits américains en sont écartés. Pour un agriculteur des Prairies, ce même tarif peut augmenter le coût des biens manufacturés et réduire son choix : Laurier affirme que les agriculteurs du Manitoba « paient tribut » aux manufacturiers de l’Est. Le tarif peut donc favoriser les ventes et la production des manufacturiers de l’Est tout en imposant un coût ou une dépendance aux agriculteurs de l’Ouest. Les documents expriment des points de vue politiques opposés; toute comparaison équivalente correctement appuyée doit être acceptée.",
  historicalDocumentIds: POLITIQUE_NATIONALE_TARIFF_COMPARISON_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Affirmer que le tarif verse directement une subvention aux manufacturiers.",
    "Affirmer que le tarif interdit toutes les importations.",
    "Présenter tous les manufacturiers ou tous les agriculteurs comme touchés de façon identique.",
    "Résumer séparément les documents sans formuler une différence entre les deux groupes.",
    "Traiter l’un ou l’autre discours politique comme un témoignage neutre.",
  ],
  distractors: [],
  operationId: "differences_and_similarities",
  sourceIds: POLITIQUE_NATIONALE_TARIFF_COMPARISON_SOURCES.map(({ id }) => id),
  sourceCatalog: POLITIQUE_NATIONALE_TARIFF_COMPARISON_SOURCES,
  rationale: "Les deux extraits contemporains présentent des effets régionaux et sociaux opposés du même tarif. Leur comparaison fait distinguer l’avantage commercial recherché par les manufacturiers de l’Est du coût dénoncé au nom des agriculteurs de l’Ouest, tout en obligeant à tenir compte du point de vue politique de chaque auteur.",
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

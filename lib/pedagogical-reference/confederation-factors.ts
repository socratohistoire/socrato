import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion } from "./types.ts";

const shared = {
  schemaVersion: 1, kind: "other", status: "ready-for-review", periodIds: ["1840-1896"],
  knowledgeHeadingIds: ["acte-de-l-amerique-du-nord-britannique"], operationIds: ["causes_and_consequences"],
  observationGuide: ["Repérer le problème évoqué et expliquer en quoi l’union des colonies peut y répondre."],
  pedagogicalUses: ["Expliquer les facteurs favorisant la création du Dominion."], version: "1.0", approvedAt: null,
} as const;

export const CONFEDERATION_FACTORS_DOCUMENTS = [
  { ...shared, id: "AANB-T-012", title: "Discours de George-Étienne Cartier",
    historicalDate: "7 février 1865", creator: "George-Étienne Cartier",
    holdingInstitution: "Le Journal de Québec · DocumentsPrimaires.ca",
    sourceUrl: "https://primarydocuments.ca/province-du-canada-assemblee-legislative-le-journal-de-quebec-7-fevrier-1865/?lang=fr",
    assetUrl: "https://primarydocuments.ca/province-du-canada-assemblee-legislative-le-journal-de-quebec-7-fevrier-1865/?lang=fr",
    sourceLocator: "Discours du 7 février 1865, publié dans Le Journal de Québec du 10 février 1865; passage sur la défense des provinces.",
    rightsStatement: "Discours de 1865 dans le domaine public. Extrait français; […] indique une coupure.",
    transcription: "Nous savons que l’Angleterre est déterminée à nous aider et à nous appuyer dans toute lutte avec nos voisins. Les provinces anglaises, séparées comme elles sont à présent, ne pourraient pas se défendre seules. […] Quand nous serons unis, l’ennemi saura que s’il attaque quelque partie de ces provinces, soit l’Île du Prince-Édouard, soit le Canada, il aura à rencontrer les forces combinées de l’empire. Le Canada, en demeurant séparé, serait dans une position dangereuse si une guerre se déclarait.",
    accessibleDescription: "Cartier évoque la vulnérabilité des colonies séparées et la défense commune que permettrait leur union.",
    historicalContext: "Cartier défend le projet de Confédération pendant la guerre de Sécession; ses voisins désignent les États-Unis.",
    interpretationCautions: ["Un discours de partisan de la Confédération, non une preuve qu’une invasion américaine est décidée.", "La crainte militaire constitue ici un enjeu politique de sécurité et de maintien du lien britannique."],
  },
  { ...shared, id: "AANB-T-013", title: "Discours de George Brown sur les échanges commerciaux",
    historicalDate: "8 février 1865", creator: "George Brown, président du Conseil exécutif",
    holdingInstitution: "Assemblée législative de la Province du Canada · DocumentsPrimaires.ca",
    sourceUrl: "https://primarydocuments.ca/confederation-debates-legislative-assembly-february-8-1865/",
    assetUrl: "https://primarydocuments.ca/confederation-debates-legislative-assembly-february-8-1865/",
    sourceLocator: "Débats parlementaires sur la Confédération, 8 février 1865, discours de George Brown, p. 104–105, passages sur la réciprocité et les achats des colonies maritimes.",
    rightsStatement: "Discours parlementaire de 1865 dans le domaine public. Traduction française par Socrato; […] signale les coupures.",
    transcription: "Je suis favorable à une union de ces provinces, parce qu’elle nous permettra de faire face sans inquiétude à l’abrogation du traité de réciprocité avec les États-Unis, si ceux-ci insistent pour l’abolir. […] J’ai en main un relevé des articles achetés par les provinces maritimes aux États-Unis en 1863, que le Canada aurait pu fournir. […] Mais, d’un autre côté, lorsque nous aurons cette union, ces produits descendront, comme ils le devraient naturellement, le Saint-Laurent, non seulement à l’avantage de nos agriculteurs, mais aussi en augmentant l’activité de notre propre navigation.",
    accessibleDescription: "Brown relie la possible abolition du traité à l’intérêt de développer les échanges entre la Province du Canada et les colonies maritimes.",
    historicalContext: "En février 1865, Brown anticipe la fin du traité, qui survient en mars 1866. Il présente l’union comme un moyen de développer de nouveaux débouchés intercoloniaux et les transports.",
    interpretationCautions: ["Traduction de trois phrases du discours anglais, rapprochées par des coupures signalées.", "Brown parle d’une abolition possible, non d’un traité déjà aboli en février 1865.", "La fin du traité n’interdit pas tout commerce avec les États-Unis. Brown défend l’union et présente des avantages attendus, non des résultats garantis."],
  },
] as const satisfies readonly HistoricalDocumentRecord[];

const sources = CONFEDERATION_FACTORS_DOCUMENTS.map(d => ({
  id: `document-source:${d.id}`, kind: "government" as const, title: d.sourceLocator,
  publisher: d.holdingInstitution, url: d.sourceUrl, locator: d.sourceLocator, verificationStatus: "verified" as const,
}));
export const CONFEDERATION_FACTORS_QUESTION = {
  schemaVersion: 1, id: "question:acte-de-l-amerique-du-nord-britannique:confederation-factors",
  scope: "notional", knowledgeHeadingId: "acte-de-l-amerique-du-nord-britannique",
  relatedKnowledgeHeadingIds: ["acte-de-l-amerique-du-nord-britannique"],
  referenceCardId: "reference-card:acte-de-l-amerique-du-nord-britannique",
  historicalRecordId: "historical-record:acte-de-l-amerique-du-nord-britannique",
  status: "ready-for-review", format: "document-interpretation",
  prompt: "Explique deux facteurs, l’un politique et l’autre économique, qui favorisent la création du Dominion du Canada en 1867.",
  instruction: "Pour chaque facteur, explique comment il favorise l’union des colonies britanniques d’Amérique du Nord. Appuie ta réponse sur les documents.",
  expectedAnswer: "Le facteur politique, à dimension militaire, est la crainte d’une invasion ou d’une annexion américaine : les colonies séparées sont jugées vulnérables, tandis que l’union permettrait de coordonner leur défense, de réunir leurs forces et de préserver leur autonomie face aux États-Unis avec l’appui britannique (Cartier). Le facteur économique est la fin du traité de réciprocité, anticipée par Brown en 1865 et effective en 1866 : la perte des avantages commerciaux avec les États-Unis pousse les colonies à rechercher des débouchés et à développer leurs échanges entre elles. Un marché intérieur élargi rend ainsi l’union plus attrayante (Brown). Accepter toute formulation équivalente établissant ces deux liens de causalité. Nommer seulement les deux facteurs constitue une réponse partielle. Ne pas exiger la date exacte de la fin du traité. La fin du traité ne supprime pas tout commerce et n’est pas à l’origine, à elle seule, du projet déjà engagé.",
  historicalDocumentIds: CONFEDERATION_FACTORS_DOCUMENTS.map(d => d.id),
  commonErrors: ["Nommer les facteurs sans expliquer comment ils favorisent l’union.", "Présenter une invasion américaine comme une certitude.", "Affirmer que tout commerce avec les États-Unis devient interdit.", "Faire naître le projet d’union seulement après la fin du traité en 1866."],
  distractors: [], operationId: "causes_and_consequences",
  sourceIds: sources.map(s => s.id), sourceCatalog: sources,
  rationale: "Expliquer un facteur de sécurité politique et militaire ainsi qu’un facteur économique, à partir de deux sources primaires complémentaires.",
  review: { documented: true, historicallyVerified: true, pedagogicallyVerified: false, biasAndLanguageReviewed: true, approvedBy: null, approvedVersion: null, approvedAt: null },
} as const satisfies ApprovedQuestion;

import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

const sources = [
  {
    id: "pfeq-industrialization-phases",
    kind: "government",
    title: "Programme d’études – Histoire du Québec et du Canada",
    publisher: "Ministère de l’Éducation du Québec",
    url: "https://cdn-contenu.quebec.ca/cdn-contenu/education/pfeq/secondaire/programmes/PFEQ-histoire-quebec-canada-secondaire.pdf",
    locator: "Périodes 1840-1896 et 1896-1945. Première et deuxième phases d’industrialisation.",
    verificationStatus: "verified",
  },
  {
    id: "canada-automation-survey-1986",
    kind: "government",
    title: "Working with Technology: A Survey of Automation in Canada",
    creator: "Gordon Betcherman et Kathryn McMullen",
    publisher: "Conseil économique du Canada",
    publicationYear: 1986,
    url: "https://publications.gc.ca/site/eng/9.866233/publication.html",
    locator: "Enquête du Conseil économique du Canada sur l’automatisation, 1986.",
    verificationStatus: "verified",
  },
] as const satisfies readonly ReferenceSource[];

const entries = [
  {
    id: "industrialization-mechanized-factories",
    date: "1840–1896",
    title: "Mécanisation des manufactures de textile et de chaussures",
    description: "Des machines actionnées par l’eau ou la vapeur permettent de produire davantage en usine.",
  },
  {
    id: "industrialization-hydroelectricity",
    date: "1896–1945",
    title: "Essor des pâtes et papiers, des mines et de l’hydroélectricité",
    description: "L’exploitation des ressources naturelles et l’électricité soutiennent le développement de grandes industries.",
  },
  {
    id: "industrialization-electronics-robotics",
    date: "Fin du XXᵉ siècle",
    title: "Automatisation des usines grâce à l’électronique et aux robots",
    description: "Les commandes électroniques et les robots prennent en charge certaines tâches de production.",
  },
] as const;

export const INDUSTRIALIZATION_PHASES_TIMELINE_QUESTION = {
  schemaVersion: 1,
  id: "question:transversal:industrialisation:trois-phases",
  scope: "transversal",
  knowledgeHeadingId: "premiere-phase-d-industrialisation",
  relatedKnowledgeHeadingIds: ["premiere-phase-d-industrialisation", "deuxieme-phase-d-industrialisation", "ere-de-l-information"],
  referenceCardId: "reference-card:premiere-phase-d-industrialisation",
  historicalRecordId: "historical-record:premiere-phase-d-industrialisation",
  status: "ready-for-review",
  format: "interactive-timeline",
  prompt: "Replace les trois phases de l’industrialisation dans l’ordre chronologique.",
  instruction: "Associe chaque carte à la période qui lui correspond.",
  expectedAnswer: "1840–1896 — mécanisation des manufactures de textile et de chaussures. 1896–1945 — essor des pâtes et papiers, des mines et de l’hydroélectricité. Fin du XXᵉ siècle — automatisation des usines grâce à l’électronique et aux robots.",
  historicalDocumentIds: ["IND-I-001"],
  commonErrors: [
    "Confondre l’essor de l’hydroélectricité avec l’automatisation par l’électronique.",
    "Placer l’introduction des robots avant la mécanisation des manufactures.",
  ],
  distractors: [],
  operationId: "time_and_space",
  sourceIds: sources.map(({ id }) => id),
  sourceCatalog: sources,
  rationale: "La frise relie les deux phases d’industrialisation du programme à l’automatisation industrielle de la fin du XXᵉ siècle. Les périodes sont des repères pédagogiques pour situer des transformations progressives.",
  timelineInteraction: {
    documentId: "IND-D-001",
    dates: entries.map(({ date }) => date),
    entries,
  },
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

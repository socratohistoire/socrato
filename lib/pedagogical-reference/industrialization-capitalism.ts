import type { LearningSessionDocument } from "../student-learning-session/types.ts";
import type { ApprovedQuestion, ReferenceSource } from "./types.ts";

const knowledgeHeadingId = "premiere-phase-d-industrialisation";
const operationId = "causal_connections";

const sources = [
  {
    id: "document-source:IND-CAP-CENSUS",
    kind: "government",
    title: "Le capital investi dans les manufactures du Québec",
    creator: "Bureau du recensement du Canada",
    publisher: "Gouvernement du Canada",
    url: "https://upload.wikimedia.org/wikipedia/commons/9/95/Census_of_Canada%2C_1891.Bulletin._Manufactures_%3D_Recensement_du_Canada%2C_1891._Bulletin._Manufactures._%28IA_1891981891PNO101891engfra%29.pdf",
    locator: "Recensement du Canada de 1891, bulletin des manufactures, tableau du Québec dans la section des détails par province.",
    verificationStatus: "verified",
  },
  {
    id: "document-source:IND-CAP-DOMINION",
    kind: "government",
    title: "Les dividendes d’une compagnie de filatures",
    creator: "Dominion Cotton Mills",
    publisher: "Commission royale d’enquête sur l’industrie textile",
    publicationYear: 1893,
    url: "https://publications.gc.ca/collections/collection_2016/bcp-pco/Z1-1936-1-1-fra.pdf",
    locator: "Procès-verbaux de la Dominion Cotton Mills pour 1893, reproduits dans le rapport de la Commission (1938), p. 39.",
    verificationStatus: "verified",
  },
  {
    id: "document-source:IND-CAP-UNION",
    kind: "other",
    title: "Des travailleurs montréalais s’organisent",
    creator: "Union Saint-Joseph de Montréal",
    publisher: "Plinguet et cie",
    publicationYear: 1856,
    url: "https://dejouerfatalite.uqam.ca/introduction/introduction-archives/#:~:text=Constitution%20et%20r%C3%A8glement%20de%20l%E2%80%99Union%20Saint%2DJoseph",
    locator: "Constitution et règlements, Montréal, 1856, ICMH nº 48809, extrait reproduit par l’UQAM.",
    verificationStatus: "verified",
  },
] as const satisfies readonly ReferenceSource[];

const excerpts = [
  {
    id: "IND-CAP-CENSUS",
    typeLabel: "Recensement des manufactures",
    dateLabel: "1891",
    excerpt: "En 1891, près de 117 millions de dollars sont investis dans les établissements industriels du Québec. Ces établissements emploient environ 117 000 personnes. Ils versent près de 31 millions de dollars en salaires. Les biens qu’ils fabriquent valent environ 153 millions de dollars.",
    editorialNote: "Les chiffres du tableau ont été arrondis. Le dernier montant indique la valeur des biens produits.",
  },
  {
    id: "IND-CAP-DOMINION",
    typeLabel: "Procès-verbaux d’une compagnie de filatures",
    dateLabel: "1893",
    excerpt: "Vous avez sans doute remarqué que le Parlement débat des droits de douane. Ces taxes sur les produits importés changeront probablement. Quel que soit le résultat, nous pensons que notre compagnie pourra continuer à verser un bon dividende.",
    editorialNote: "Les administrateurs s’adressent aux actionnaires, qui détiennent une part de la compagnie. Un dividende est une somme versée aux actionnaires à partir des bénéfices de l’entreprise. Le rapport de la Commission indique que la compagnie a versé un dividende de 6 % en 1893.",
  },
  {
    id: "IND-CAP-UNION",
    typeLabel: "Règlements d’une association de travailleurs",
    dateLabel: "1856",
    excerpt: "Nous voulons réunir les travailleurs canadiens-français de Montréal dans une association d’entraide. Chaque membre verse une petite somme chaque année. Si l’un de nous tombe malade ou subit un accident, il peut recevoir de l’aide grâce à cet argent. Pour l’ouvrier qui n’a que son travail pour faire vivre sa famille, ne plus pouvoir travailler peut la laisser sans revenu.",
    editorialNote: "Passage adapté à la première personne à partir des règlements de l’Union Saint-Joseph de Montréal.",
  },
];

export const INDUSTRIALIZATION_CAPITALISM_DOCUMENTS: LearningSessionDocument[] = excerpts.map(
  ({ id, typeLabel, dateLabel, excerpt, editorialNote }, index) => {
    const source = sources[index];
    return {
      id,
      title: source.title,
      typeLabel,
      dateLabel,
      authorLabel: source.creator,
      institutionLabel: source.publisher,
      sourceLabel: source.locator,
      sourceUrls: [source.url],
      rightsLabel: "Passage adapté d’une source primaire.",
      editorialNote,
      historicalKnowledgeIds: [knowledgeHeadingId],
      intellectualOperationIds: [operationId],
      content: { kind: "historical_excerpt", adapted: true, excerpt },
    };
  },
);

export const INDUSTRIALIZATION_CAPITALISM_QUESTION = {
  schemaVersion: 1,
  id: "question:premiere-phase-d-industrialisation:capitalisme-industriel",
  scope: "notional",
  knowledgeHeadingId,
  relatedKnowledgeHeadingIds: [knowledgeHeadingId],
  referenceCardId: "reference-card:premiere-phase-d-industrialisation",
  historicalRecordId: "historical-record:premiere-phase-d-industrialisation",
  status: "ready-for-review",
  format: "document-interpretation",
  prompt: "Explique comment le capital investi par les bourgeois leur permet de faire des profits grâce au travail des ouvriers dans les manufactures du Québec entre 1850 et 1896.",
  instruction: "Utilise les mots « capital », « bourgeois » et « ouvriers » dans ta réponse.",
  expectedAnswer: "Les bourgeois investissent leur capital pour équiper des manufactures et embaucher des ouvriers. Comme le montre le recensement, ces établissements versent des salaires à ceux qui fabriquent les biens. Lorsque les ventes dépassent les coûts de production, dont les salaires, l’entreprise réalise un profit. Les actionnaires peuvent en recevoir une part sous forme de dividendes, comme ceux dont parlent les administrateurs de la Dominion Cotton Mills. Le texte de l’Union Saint-Joseph illustre la dépendance des ouvriers à leur revenu de travail.",
  historicalDocumentIds: INDUSTRIALIZATION_CAPITALISM_DOCUMENTS.map(({ id }) => id),
  commonErrors: [
    "Nommer les bourgeois et les ouvriers sans expliquer le lien entre l’investissement, le travail salarié et le profit.",
    "Confondre le salaire des ouvriers avec le profit des propriétaires.",
    "Prendre la valeur totale des biens fabriqués pour le montant des profits.",
  ],
  distractors: [],
  operationId,
  sourceIds: sources.map(({ id }) => id),
  sourceCatalog: [...sources],
  rationale: "Le recensement met en regard le capital investi, les salaires et la valeur des biens produits. Les procès-verbaux de la Dominion Cotton Mills montrent que ses administrateurs s’attendent à verser des dividendes aux actionnaires. Les règlements de l’Union Saint-Joseph montrent l’importance du salaire pour les familles ouvrières.",
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

import type { HistoricalDocumentRecord } from "./historical-document.ts";
import type { ApprovedQuestion } from "./types.ts";
import { CONFERENCE_1887_DOCUMENTS } from "./conference-1887.ts";

export const PROVINCIAL_DISALLOWANCE_ACT_DOCUMENT = {
  schemaVersion: 1, id: "RFP-T-014", title: "Extraits de l’Acte de l’Amérique du Nord britannique", kind: "law-or-official-text", status: "ready-for-review",
  periodIds: ["1840-1896"], knowledgeHeadingIds: ["relations-federales-provinciales"], operationIds: ["causes_and_consequences"],
  historicalDate: "1867", creator: "Parlement du Royaume-Uni",
  holdingInstitution: "Ministère de la Justice du Canada",
  sourceUrl: "https://laws-lois.justice.gc.ca/fra/const/page-2.html",
  assetUrl: "https://laws-lois.justice.gc.ca/fra/const/page-3.html",
  sourceLocator: "Loi constitutionnelle de 1867 (titre d’origine : Acte de l’Amérique du Nord britannique), article 90 et début de l’article 92, avec le paragraphe 16. Version française diffusée par Justice Canada.",
  rightsStatement: "Texte législatif de 1867. Reproduction d’extraits de la version française diffusée par Justice Canada, conformément au Décret sur la reproduction de la législation fédérale; cette sélection n’est pas une version officielle. Les omissions sont indiquées par […].",
  transcription: "Art. 90 — Les dispositions suivantes de la présente loi, concernant le parlement du Canada, savoir : — les dispositions relatives […] au désaveu des lois […] s’étendront et s’appliqueront aux législatures des différentes provinces […] en substituant toutefois le lieutenant-gouverneur de la province au gouverneur-général, le gouverneur-général à la Reine et au secrétaire d’État, un an à deux ans, et la province au Canada.\n\nArt. 92 — Dans chaque province la législature pourra exclusivement faire des lois relatives aux matières tombant dans les catégories de sujets ci-dessous énumérés, savoir : […] 16. Généralement toutes les matières d’une nature purement locale ou privée dans la province.",
  accessibleDescription: "Deux passages du texte constitutionnel : application du mécanisme de désaveu aux provinces et compétence exclusive sur les matières locales ou privées.",
  historicalContext: "L’article 90 transpose aux provinces le mécanisme de désaveu de l’article 56, avec un délai d’un an. Dans le fonctionnement du gouvernement responsable, le gouverneur général en conseil agit sur l’avis du gouvernement fédéral. L’article 92 énumère les domaines législatifs provinciaux.",
  observationGuide: ["Repérer à quelles législatures s’applique le désaveu.", "Repérer le mot qui caractérise le pouvoir législatif provincial dans l’article 92.", "Mettre ces dispositions en relation avec la critique exprimée dans le journal."],
  interpretationCautions: ["Extraits de la version française actuelle des dispositions de 1867; les ajouts constitutionnels postérieurs ne sont pas reproduits.", "Le désaveu est un mécanisme politique, distinct d’un jugement sur la constitutionnalité d’une loi.", "Les substitutions de l’article 90 concernent notamment l’article 56 : il ne faut pas attribuer le désaveu provincial au lieutenant-gouverneur seul."],
  pedagogicalUses: ["Expliquer l’opposition au désaveu fédéral en reliant compétences exclusives et autonomie provinciale."],
  version: "1.0", approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

const documents = [PROVINCIAL_DISALLOWANCE_ACT_DOCUMENT, CONFERENCE_1887_DOCUMENTS[1]] as const;

export const PROVINCIAL_DISALLOWANCE_QUESTION = {
  schemaVersion: 1, id: "question:relations-federales-provinciales:document-interpretation-011",
  scope: "notional", knowledgeHeadingId: "relations-federales-provinciales", relatedKnowledgeHeadingIds: ["relations-federales-provinciales"],
  referenceCardId: "reference-card:relations-federales-provinciales", historicalRecordId: "historical-record:relations-federales-provinciales",
  status: "ready-for-review", format: "document-interpretation",
  prompt: "Pourquoi le pouvoir du gouvernement fédéral de désavouer une loi provinciale suscite-t-il l’opposition de dirigeants provinciaux?",
  instruction: "À l’aide des deux documents, explique la raison de cette opposition. Relie le pouvoir de désaveu aux compétences des provinces. Vocabulaire : désavouer une loi signifie la priver d’effet selon le mécanisme constitutionnel; une législature est l’institution qui adopte les lois.",
  expectedAnswer: "Des dirigeants provinciaux s’opposent au désaveu parce qu’il permet au gouvernement fédéral de faire cesser l’effet d’une loi provinciale, même lorsqu’elle porte sur un domaine attribué exclusivement à la province. Ils y voient une intervention dans leurs décisions et une atteinte à leur autonomie : les choix de leurs représentants peuvent être écartés par le gouvernement fédéral. L’article 92 établit des compétences exclusives; l’article du Globe dénonce un veto arbitraire et propose un contrôle de constitutionnalité par une autorité indépendante plutôt que par le gouvernement fédéral. Accepter toute formulation équivalente reliant le pouvoir fédéral à la limitation de l’autonomie provinciale. Une simple mention de désaccord sans expliquer ce lien est insuffisante. Ne pas exiger le numéro des articles. Le désaveu est prévu par la Constitution; il ne s’agit pas nécessairement d’une intervention illégale ni d’une décision d’un tribunal. Les demandes de 1887 n’abolissent pas ce pouvoir.",
  historicalDocumentIds: documents.map(({ id }) => id),
  commonErrors: ["Dire seulement que les dirigeants ne sont pas d’accord, sans expliquer pourquoi.", "Confondre désaveu fédéral et invalidation judiciaire d’une loi.", "Affirmer que le désaveu ne concerne que des lois déjà déclarées inconstitutionnelles.", "Présenter l’opposition comme un refus de tout contrôle judiciaire ou une demande d’indépendance.", "Affirmer que le désaveu est aboli en 1887."],
  distractors: [], operationId: "causes_and_consequences",
  sourceIds: documents.map(({ id }) => `document-source:${id}`),
  sourceCatalog: documents.map(document => ({ id: `document-source:${document.id}`, kind: document.id === "RFP-T-014" ? "government" as const : "museum-or-archive" as const, title: document.title, creator: document.creator, publisher: document.holdingInstitution, publicationYear: document.id === "RFP-T-014" ? 1867 : 1887, url: document.sourceUrl, locator: document.sourceLocator, rightsNote: document.rightsStatement, verificationStatus: "verified" as const })),
  rationale: "Déterminer la cause de l’opposition des dirigeants provinciaux en confrontant un texte constitutionnel à une critique contemporaine du désaveu.",
  review: { documented: true, historicallyVerified: true, pedagogicallyVerified: false, biasAndLanguageReviewed: true, approvedBy: null, approvedVersion: null, approvedAt: null },
} as const satisfies ApprovedQuestion;

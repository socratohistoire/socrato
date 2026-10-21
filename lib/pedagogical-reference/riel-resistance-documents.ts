import type { HistoricalDocumentRecord } from "./historical-document.ts";

export const RIEL_TRIAL_PHOTOGRAPH = {
  schemaVersion: 1, id: "RFP-I-003", title: "Le procès de Louis Riel", kind: "image", status: "ready-for-review",
  periodIds: ["1840-1896"], knowledgeHeadingIds: ["relations-federales-provinciales"], operationIds: ["causes_and_consequences"],
  historicalDate: "1885", creator: "Oliver B. Buell",
  holdingInstitution: "Bibliothèque et Archives Canada · reproduction sur Wikimedia Commons",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:LouisRielTrial.jpg",
  sourceLocator: "Louis Riel addressing the jury during his trial for treason, Regina, 1885; Bibliothèque et Archives Canada, MIKAN 3192595, C-001879, e010933908.",
  assetUrl: "/historical-documents/riel-trial-1885-public-domain.jpg",
  rightsStatement: "Photographie de 1885 marquée comme appartenant au domaine public sur Wikimedia Commons (Public Domain Mark 1.0); photographie d’Oliver B. Buell, collection de Bibliothèque et Archives Canada. Reproduction sans filigrane, non retouchée.",
  transcription: "",
  accessibleDescription: "Photographie de la salle du tribunal de Regina montrant Louis Riel debout alors qu’il s’adresse au jury pendant son procès pour haute trahison.",
  historicalContext: "Après la défaite de la résistance de 1885, Riel est jugé pour haute trahison à Regina. Cette photographie le montre debout dans la salle d’audience alors qu’il s’adresse au jury.",
  observationGuide: ["Repérer Louis Riel debout dans la salle d’audience.", "Identifier le cadre judiciaire de la photographie."],
  interpretationCautions: ["La photographie situe le procès mais ne permet pas, seule, de déterminer les causes de la résistance.", "Ne pas déduire les convictions des personnes de leur apparence ni attribuer à la photographie les paroles de Riel."],
  pedagogicalUses: ["Situer une déclaration de Riel dans son contexte judiciaire."], version: "1.0", approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const RIEL_RESISTANCE_TESTIMONY = {
  schemaVersion: 1, id: "RFP-T-010", title: "Déclaration de Louis Riel au jury", kind: "other", status: "ready-for-review",
  periodIds: ["1840-1896"], knowledgeHeadingIds: ["relations-federales-provinciales"], operationIds: ["causes_and_consequences"],
  historicalDate: "31 juillet 1885", creator: "Louis Riel",
  holdingInstitution: "Rapport du procès de Louis Riel · transcription diffusée par Famous Trials",
  sourceUrl: "https://www.famous-trials.com/louisriel/859-statement",
  sourceLocator: "Final Statement of Louis Riel at his Trial in Regina, 31 juillet 1885; passages commençant par « We have made petitions », « We have taken time », « The agitation in the North-West Territories » et « When we sent petitions ».",
  assetUrl: "https://www.famous-trials.com/louisriel/859-statement",
  rightsStatement: "Déclaration de 1885, domaine public. Traduction française par Socrato de passages du discours anglais; les […] indiquent des omissions.",
  transcription: "Nous avons présenté des pétitions; j’en ai rédigé avec d’autres à l’intention du gouvernement canadien pour lui demander d’améliorer la situation de ce pays. […] Nous avons pris le temps; nous avons essayé d’unir toutes les classes et même, si je puis dire, tous les partis. […] L’agitation dans les Territoires du Nord-Ouest aurait été constitutionnelle, et le serait certainement encore aujourd’hui si, à mon avis, nous n’avions pas été attaqués. […] Lorsque nous envoyions des pétitions au gouvernement, il nous répondait en envoyant la police […].",
  accessibleDescription: "Quatre phrases traduites de la déclaration de Riel : pétitions, démarches collectives, attaque alléguée et réponse policière du gouvernement.",
  historicalContext: "Riel s’adresse au jury lors de son procès pour haute trahison à Regina après la résistance de 1885. Il justifie ses actions et présente sa propre interprétation du comportement du gouvernement canadien.",
  observationGuide: ["Repérer les démarches pacifiques mentionnées.", "Identifier la réponse gouvernementale décrite par Riel.", "Expliquer le lien que Riel établit entre une attaque alléguée et la résistance."],
  interpretationCautions: ["Il s’agit d’une défense judiciaire, non d’un récit neutre.", "Conserver la nuance « selon Riel » : le texte ne prouve pas à lui seul que le gouvernement a attaqué le premier.", "Traduction de passages sélectionnés; les omissions sont signalées par […]."],
  pedagogicalUses: ["Déterminer les causes invoquées par Riel pour expliquer le recours à la résistance en 1885."], version: "1.0", approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const METIS_LAND_PETITION_1882 = {
  schemaVersion: 1, id: "RFP-T-021", title: "Pétition des Métis de Saint-Antoine-de-Padoue", kind: "other", status: "ready-for-review",
  periodIds: ["1840-1896"], knowledgeHeadingIds: ["relations-federales-provinciales"], operationIds: ["causes_and_consequences"],
  historicalDate: "4 septembre 1882", creator: "Gabriel Dumont et 45 autres signataires métis",
  holdingInstitution: "Documents parlementaires du Canada · pétition adressée à John A. Macdonald",
  sourceUrl: "https://data2.archives.ca/rcap/pdf/rcap-572.pdf",
  sourceLocator: "Pétition de Gabriel Dumont et des Métis de Saint-Antoine-de-Padoue à John A. Macdonald, 4 septembre 1882; reproduite dans les Documents parlementaires du Canada, 1886, vol. 12, no 45, p. 23-24, et citée dans le rapport de la Commission royale sur les peuples autochtones.",
  assetUrl: "https://data2.archives.ca/rcap/pdf/rcap-572.pdf",
  rightsStatement: "Pétition de 1882. Traduction française et sélection de passages par Socrato; les […] indiquent des omissions et les crochets une courte précision ajoutée.",
  transcription: "Les terres déjà arpentées étant occupées ou vendues, nous avons été obligés d’occuper des terres qui ne l’étaient pas encore. […] Grande fut notre surprise et notre inquiétude lorsqu’on nous informa qu’après l’arpentage, nous devrions payer deux dollars l’acre au gouvernement si nos terres se trouvaient dans les sections impaires. […] Nous demandons un mode d’arpentage adapté à nos besoins [des lots longs et étroits donnant sur la rivière plutôt que des sections carrées].",
  accessibleDescription: "Extraits traduits d’une pétition de 1882 dans laquelle des Métis décrivent la pression créée par l’occupation ou la vente des terres, puis leur inquiétude devant l’arpentage fédéral.",
  historicalContext: "De nouveaux colons s’installent dans la vallée de la Saskatchewan-Sud tandis que plusieurs terres métisses ne possèdent toujours pas de titre reconnu. Gabriel Dumont et 45 autres Métis demandent au gouvernement de protéger les terres déjà occupées et d’adapter l’arpentage à leurs lots riverains.",
  observationGuide: ["Repérer pourquoi les Métis doivent s’établir sur des terres non encore arpentées.", "Identifier ce que l’arpentage pourrait les obliger à faire.", "Relever le type de lots qu’ils souhaitent conserver."],
  interpretationCautions: ["Il s’agit d’une pétition : les signataires cherchent à convaincre le gouvernement d’agir.", "L’arrivée de nouveaux colons est expliquée dans le contexte; l’extrait de la pétition parle plus précisément de terres déjà occupées ou vendues.", "La dernière précision entre crochets reformule le mode d’arpentage demandé; elle ne doit pas être présentée comme une citation mot à mot."],
  pedagogicalUses: ["Relier l’arrivée de nouveaux colons, l’arpentage et l’insécurité foncière aux inquiétudes métisses avant 1885."], version: "1.0", approvedAt: null,
} as const satisfies HistoricalDocumentRecord;

export const RIEL_RESISTANCE_DOCUMENTS = [RIEL_TRIAL_PHOTOGRAPH, RIEL_RESISTANCE_TESTIMONY, METIS_LAND_PETITION_1882] as const;

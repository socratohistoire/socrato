import type { HistoricalDocumentRecord } from "./historical-document.ts";

export const RIEL_TRIAL_PHOTOGRAPH = {
  schemaVersion: 1, id: "RFP-I-003", title: "Le procès de Louis Riel", kind: "image", status: "ready-for-review",
  periodIds: ["1840-1896"], knowledgeHeadingIds: ["relations-federales-provinciales"], operationIds: ["causes_and_consequences"],
  historicalDate: "1885", creator: "O. B. Buell",
  holdingInstitution: "Bibliothèque et Archives Canada · reproduction diffusée sur Wikimedia Commons",
  sourceUrl: "https://commons.wikimedia.org/wiki/File:CharlesFitzpatrickAtLouisRielTrial.jpg",
  sourceLocator: "Mr. Fitzpatrick addressing the jury during Riel’s Trial, Regina, 1885; R-B1415; référence des Archives nationales du Canada : C-1877.",
  assetUrl: "/historical-documents/riel-trial-1885.jpg",
  rightsStatement: "Photographie de 1885, domaine public au Canada. Reproduction de Bibliothèque et Archives Canada, C-001877, diffusée sur Wikimedia Commons sous mention de domaine public; crédit O. B. Buell. Image non retouchée.",
  transcription: "",
  accessibleDescription: "Photographie de la salle du tribunal de Regina : Charles Fitzpatrick s’adresse au jury; Louis Riel se trouve dans le box des accusés, la main au visage.",
  historicalContext: "Après la défaite de la résistance de 1885, Riel est jugé pour haute trahison à Regina. La photographie montre son avocat s’adressant au jury, et non Riel prononçant la déclaration reproduite dans l’autre document.",
  observationGuide: ["Repérer Riel et son avocat à l’aide de la légende.", "Identifier le cadre judiciaire de la photographie."],
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

export const RIEL_RESISTANCE_DOCUMENTS = [RIEL_TRIAL_PHOTOGRAPH, RIEL_RESISTANCE_TESTIMONY] as const;

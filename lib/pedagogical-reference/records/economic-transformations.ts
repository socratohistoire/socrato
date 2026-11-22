import { createEmptyHistoricalRecord } from "../historical-record.ts";
import type { HistoricalClaim, HistoricalRecord, ReferenceSource } from "../types.ts";

const sources = {
  program: { id: "pfeq-hqc-2017", kind: "official-program", title: "Histoire du Québec et du Canada", publisher: "Ministère de l’Éducation", publicationYear: 2017, url: "https://cdn-contenu.quebec.ca/cdn-contenu/education/pfeq/secondaire/programmes/PFEQ-histoire-quebec-canada-secondaire.pdf", locator: "Période 1840–1896, contexte économique et précision des connaissances, p. 47 du programme", verificationStatus: "verified" },
  canal: { id: "parks-lachine-industrialisation", kind: "government", title: "Le berceau de l’industrialisation", publisher: "Parcs Canada", url: "https://parcs.canada.ca/lhn-nhs/qc/canallachine/culture/histoire-history/industrialisation", locator: "Sections sur les débuts, l’expansion de 1880 à 1896 et les entreprises du canal", verificationStatus: "verified" },
  rail: { id: "parks-cartier-rail", kind: "government", title: "Ingénierie — Le pont Victoria", publisher: "Parcs Canada", url: "https://parcs.canada.ca/lhn-nhs/qc/etiennecartier/culture/ingenierie-engineering", locator: "Grand Tronc, pont Victoria et liaison Sarnia–Montréal–Portland", verificationStatus: "verified" },
  census: { id: "statcan-quebec-urban-rural-1871-1891", kind: "government", title: "Recensement du Canada de 1890-91", publisher: "Bureau du recensement", publicationYear: 1892, url: "https://www66.statcan.gc.ca/eng/1892/189201180102_p.%20102.pdf", locator: "p. 102, tableau 124, ligne Québec", verificationStatus: "verified" },
  ames: { id: "document-source:IND-URBANIZATION-AMES", kind: "museum-or-archive", title: "The City Below the Hill", creator: "Herbert Brown Ames", publisher: "Canadiana", publicationYear: 1897, url: "https://www.canadiana.ca/view/oocihm.02168", locator: "p. 45–46, enquête réalisée en 1896", verificationStatus: "verified" },
  strike: { id: "document-source:IND-I-004", kind: "museum-or-archive", title: "Grève des ouvriers du canal de Lachine", publisher: "Archives de la Ville de Montréal", publicationYear: 1878, url: "https://ville.montreal.qc.ca/memoiresdesmontrealais/files/canal-de-lachine-greve-des-ouvriers", locator: "Gravure publiée en janvier 1878, VM094-Y-1-17-D1568", verificationStatus: "verified" },
  price: { id: "dbc-william-price", kind: "academic", title: "Price, William", publisher: "Dictionnaire biographique du Canada", url: "https://www.biographi.ca/fr/bio/price_william_9F.html", locator: "Scieries, concessions, réseau maritime et activité au Saguenay", verificationStatus: "verified" },
  mcleod: { id: "dbc-peter-mcleod", kind: "academic", title: "McLeod, Peter", publisher: "Dictionnaire biographique du Canada", url: "https://www.biographi.ca/fr/bio/mcleod_peter_8E.html", locator: "Partenariat avec Price, établissements de la rivière du Moulin et de Chicoutimi", verificationStatus: "verified" },
  egan: { id: "dbc-john-egan", kind: "academic", title: "Egan, John", publisher: "Dictionnaire biographique du Canada", url: "https://www.biographi.ca/en/bio/egan_john_8E.html", locator: "Commerce du bois dans l’Outaouais et scierie de Quyon", verificationStatus: "verified" },
  saguenay: { id: "quebec-parks-saguenay-indigenous-colonization", kind: "government", title: "Plan directeur du parc marin du Saguenay–Saint-Laurent", publisher: "Parcs Canada et gouvernement du Québec", publicationYear: 2010, url: "https://cdn-contenu.quebec.ca/cdn-contenu/parcs/documents/PL_directeur_Saguenay-Saint-Laurent.pdf", locator: "p. 10, De nouvelles communautés et de nouveaux usages", verificationStatus: "verified" },
  barnard: { id: "dbc-edouard-barnard", kind: "academic", title: "Barnard, Édouard-André", publisher: "Dictionnaire biographique du Canada", url: "https://www.biographi.ca/fr/bio/barnard_edouard_andre_12F.html", locator: "École de laiterie de Saint-Denis, développement des fabriques et exportations", verificationStatus: "verified" },
  farm: { id: "quebec-patrimoine-agricole", kind: "government", title: "Patrimoine agricole bâti du Québec", publisher: "Ministère de la Culture et des Communications", url: "https://cdn-contenu.quebec.ca/cdn-contenu/adm/min/culture-communications/documents/patrimoine/GU-types-architecturaux-patrimoine-agricole.pdf", locator: "Chronologie, fiches sur la grange-étable et l’écurie", verificationStatus: "verified" },
  tenure: { id: "seigniorial-act-1854", kind: "government", title: "Acte seigneurial de 1854", creator: "Province du Canada", publisher: "British North American Legislative Database", publicationYear: 1854, url: "https://bnald.lib.unb.ca/sites/default/files/UnC.1854.ch_.3_0.pdf", locator: "18 Victoria, chap. 3, préambule et dispositions sur le franc-aleu roturier et la rente constituée", verificationStatus: "verified" },
} as const satisfies Record<string, ReferenceSource>;

type SourceKey = keyof typeof sources;

function claim(id: string, claimKind: HistoricalClaim["claimKind"], text: string, ...references: SourceKey[]): HistoricalClaim {
  return { id, claimKind, text, sourceIds: references.map((key) => sources[key].id) };
}

function createRecord(
  knowledgeHeadingId: string,
  label: string,
  scope: string,
  sections: readonly (HistoricalRecord["manual"]["sections"][number] & { summary: HistoricalClaim })[],
  appendices: Pick<HistoricalRecord, "chronologicalMarkers" | "vocabulary">,
): HistoricalRecord {
  const narrative = sections.map(({ summary }) => summary);
  const usedSourceIds = new Set(sections.flatMap(({ paragraphs, summary }) =>
    [...paragraphs, summary].flatMap(({ sourceIds }) => sourceIds)));
  return {
    ...createEmptyHistoricalRecord(knowledgeHeadingId),
    ...appendices,
    title: `Dossier historique — ${label}`,
    scope,
    status: "draft",
    version: "1.0",
    manual: {
      title: `Monographie historique interne — ${label} au Québec, 1840–1896`,
      purpose: "Documenter les connaissances du programme de quatrième secondaire et fournir des repères pour la rédaction des activités de Socrato.",
      audience: "internal-pedagogical-reference",
      editorialMethod: "Chaque chapitre rattache ses affirmations à des sources consultables. Les exemples locaux éclairent des mécanismes et les données provinciales situent leur portée.",
      sections: sections.map(({ id, title, purpose, paragraphs }) => ({ id, title, purpose, paragraphs })),
    },
    knowledgePrecisions: sections.map(({ id, title, summary, paragraphs }, index) => ({
      ...summary,
      id: `${id}-precision`,
      officialOrder: index + 1,
      officialLabel: title,
      coverageStatus: "complete",
      linkedStatementIds: paragraphs.map(({ id }) => id),
    })),
    narrative,
    sourceCatalog: Object.values(sources).filter(({ id }) => id === sources.program.id || usedSourceIds.has(id)),
    editorialNotes: "Brouillon soumis à validation pédagogique.",
  };
}

export const INDUSTRIALIZATION_HISTORICAL_RECORD = createRecord(
  "premiere-phase-d-industrialisation",
  "Première phase d’industrialisation",
  "Les transformations de la production, des transports, du travail et des villes au Québec de 1840 à 1896, avec Montréal et le canal de Lachine comme études de cas.",
  [
    {
      id: "ind-capital", title: "Capitalisme industriel", purpose: "Relier l’investissement à l’essor de la production en usine.",
      summary: claim("ind-capital-summary", "interpretation", "Les entrepreneurs investissent dans des bâtiments, des machines et des matières premières, puis embauchent des salariés pour produire à plus grande échelle.", "program", "canal"),
      paragraphs: [
        claim("ind-capital-1", "fact", "Au milieu du siècle, Montréal réunit un port, des marchands, des institutions financières et des voies de navigation. L’élargissement du canal de Lachine, achevé en 1848, donne aux fabricants accès à de nouveaux sites où l’eau peut actionner les machines.", "canal"),
        claim("ind-capital-2", "interpretation", "Pour établir une usine, les entrepreneurs doivent engager des capitaux avant de toucher les revenus des ventes. La propriété de l’établissement leur donne la maîtrise des décisions de production, tandis que les ouvriers tirent leur revenu du salaire.", "program", "canal"),
        claim("ind-capital-3", "fact", "La croissance passe aussi par des rachats. Les minoteries Ogilvie s’agrandissent en acquérant des concurrents, tandis que les Montreal Rolling Mills, établies en 1868, acquièrent des entreprises du secteur du fer et de l’acier.", "canal"),
      ],
    },
    {
      id: "ind-transport", title: "Réseau de transport continental de l’est", purpose: "Montrer comment les voies d’eau et le rail élargissent les marchés.",
      summary: claim("ind-transport-summary", "interpretation", "Les canaux et les chemins de fer font de Montréal un carrefour entre les Grands Lacs, le Saint-Laurent et les ports atlantiques.", "program", "rail", "canal"),
      paragraphs: [
        claim("ind-transport-1", "fact", "Le canal de Lachine permet de contourner les rapides et donne au port de Montréal accès à une voie navigable vers les Grands Lacs. Le long du canal, les usines profitent de la proximité des quais pour recevoir des matières premières et expédier leurs produits.", "canal"),
        claim("ind-transport-2", "fact", "La voie principale du Grand Tronc relie Sarnia à Portland en 1860. Le pont Victoria, terminé en 1859, permet aux trains de traverser le Saint-Laurent à Montréal et de gagner la côte atlantique par les Cantons-de-l’Est.", "rail"),
        claim("ind-transport-3", "interpretation", "Le rail vers Portland donne accès à un port maritime en hiver. Les chantiers et l’entretien des réseaux créent aussi une demande de matériel, de pièces métalliques et de services dans les villes qu’ils desservent.", "rail", "canal"),
      ],
    },
    {
      id: "ind-production", title: "Secteurs de production", purpose: "Comparer les activités de transformation et leurs débouchés.",
      summary: claim("ind-production-summary", "fact", "L’alimentation, le textile et la métallurgie comptent parmi les secteurs de la première industrialisation.", "program", "canal"),
      paragraphs: [
        claim("ind-production-1", "fact", "Les minoteries transforment le grain en farine. La raffinerie fondée par John Redpath en 1854 transforme le sucre brut. Ces établissements utilisent les réseaux commerciaux pour recevoir leurs intrants et écouler leur production.", "canal"),
        claim("ind-production-2", "fact", "Des fonderies, des clouteries et des fabricants d’outils s’installent dans le corridor du canal. La grande industrie textile s’y affirme entre 1880 et 1896, pendant une période d’expansion manufacturière soutenue en partie par la Politique nationale.", "canal"),
        claim("ind-production-3", "nuance", "Les secteurs se développent à des rythmes différents. Les établissements mécanisés de grande taille côtoient des ateliers et des activités de transformation déjà présentes au début du siècle.", "program", "canal"),
      ],
    },
    {
      id: "ind-division", title: "Division du travail", purpose: "Expliquer l’organisation des tâches dans la production industrielle.",
      summary: claim("ind-division-summary", "interpretation", "La division du travail répartit la fabrication entre des postes spécialisés et coordonne leur cadence.", "program", "canal"),
      paragraphs: [
        claim("ind-division-1", "interpretation", "Dans une usine textile, la préparation des fibres, la filature et le tissage correspondent à des tâches distinctes. La production dépend de l’enchaînement des opérations et du fonctionnement régulier des machines.", "program", "canal"),
        claim("ind-division-2", "nuance", "Le travail spécialisé comprend aussi des tâches qualifiées, notamment le réglage et l’entretien des machines. Le degré d’autonomie et les compétences requises varient selon le poste et le secteur.", "program", "canal"),
      ],
    },
    {
      id: "ind-conditions", title: "Conditions de vie et de travail des hommes, des femmes et des enfants", purpose: "Distinguer les expériences selon le poste, l’âge et le sexe.",
      summary: claim("ind-conditions-summary", "interpretation", "Les horaires, les salaires et les risques du travail industriel influencent les conditions de vie des ménages ouvriers.", "program", "ames"),
      paragraphs: [
        claim("ind-conditions-1", "fact", "Des hommes, des femmes et des enfants travaillent dans des manufactures, notamment dans le textile. La répartition des postes et des salaires varie selon l’âge et le sexe. Les bas salaires et les longues journées rendent le revenu de plusieurs membres du ménage important.", "program", "canal"),
        claim("ind-conditions-2", "interpretation", "Dans les manufactures, la cadence et la proximité des machines exposent les ouvriers à la fatigue et à des accidents. À la maison, le montant du loyer limite l’espace qu’un ménage peut occuper. L’enquête d’Ames documente le nombre de personnes par logement dans les quartiers étudiés.", "program", "ames"),
        claim("ind-conditions-3", "nuance", "L’étude d’Ames décrit une partie de Montréal observée en 1896. Elle permet d’étudier la densité d’occupation locale. Le recensement provincial mesure pour sa part la répartition de la population entre villes et campagnes.", "ames", "census"),
      ],
    },
    {
      id: "ind-workers", title: "Mouvement ouvrier", purpose: "Relier les revendications collectives aux conditions du travail salarié.",
      summary: claim("ind-workers-summary", "interpretation", "Les ouvriers s’organisent pour peser collectivement sur les rémunérations, les horaires et les conditions de travail.", "program", "strike"),
      paragraphs: [
        claim("ind-workers-1", "fact", "Le programme retient la légalisation des syndicats en 1872 comme repère. Les organisations ouvrières fournissent un cadre pour formuler des revendications et coordonner des actions, dont la grève.", "program"),
        claim("ind-workers-2", "fact", "Une gravure publiée en janvier 1878 représente une grève des ouvriers du canal de Lachine. Elle documente la visibilité publique de la mobilisation. Pour établir les revendications précises ou les suites du conflit, il faut la comparer à des sources écrites sur l’événement.", "strike"),
      ],
    },
    {
      id: "ind-city", title: "Urbanisation", purpose: "Relier la croissance des villes à la concentration des emplois et des logements.",
      summary: claim("ind-city-summary", "interpretation", "La concentration des emplois manufacturiers attire de la main-d’œuvre et contribue à la croissance des quartiers ouvriers.", "program", "canal", "census"),
      paragraphs: [
        claim("ind-city-1", "fact", "La part urbaine de la population du Québec passe de 19,5 % en 1871 à 22,8 % en 1881, puis à 29,2 % en 1891. En 1891, plus de sept personnes sur dix vivent encore en milieu rural.", "census"),
        claim("ind-city-2", "interpretation", "Autour du canal de Lachine, la proximité entre lieux de travail et logements raccourcit les déplacements quotidiens. La concentration des emplois et des ménages crée des besoins en logements et en services dans les quartiers en croissance.", "canal", "ames"),
      ],
    },
  ],
  {
    chronologicalMarkers: [
      { ...claim("ind-1848", "fact", "L’achèvement du premier élargissement du canal de Lachine donne accès à de nouveaux sites hydrauliques.", "canal"), dateLabel: "1848", sortYear: 1848 },
      { ...claim("ind-1860", "fact", "La voie principale du Grand Tronc relie Sarnia et Portland par Montréal.", "rail"), dateLabel: "1860", sortYear: 1860 },
      { ...claim("ind-1872", "fact", "Le Parlement du Canada légalise les syndicats.", "program"), dateLabel: "1872", sortYear: 1872 },
    ],
    vocabulary: [
      { ...claim("ind-v-capital", "interpretation", "Organisation de la production où les propriétaires engagent des capitaux dans les moyens de production et rémunèrent une main-d’œuvre salariée.", "program", "canal"), term: "Capitalisme industriel" },
      { ...claim("ind-v-city", "interpretation", "Croissance des villes et augmentation de la part de la population qui y vit.", "census"), term: "Urbanisation" },
    ],
  },
);

export const FORESTRY_HISTORICAL_RECORD = createRecord(
  "industrie-forestiere",
  "Industrie forestière",
  "Les régions d’exploitation et la chaîne du bois de sciage au Québec de 1840 à 1896, avec des exemples de l’Outaouais et du Saguenay.",
  [
    {
      id: "for-regions", title: "Régions d’exploitation", purpose: "Situer les bassins forestiers et expliquer le choix des sites.",
      summary: claim("for-regions-summary", "interpretation", "Les entreprises forestières s’implantent dans des bassins où elles peuvent combiner accès aux arbres, voies d’eau et débouchés commerciaux.", "program", "egan", "price"),
      paragraphs: [
        claim("for-regions-1", "fact", "Dans l’Outaouais, la rivière et ses affluents relient les territoires de coupe aux établissements de transformation. En 1846, John Egan construit à Quyon une scierie équipée de quatorze scies. Le site illustre l’investissement requis pour transformer le bois près du bassin d’approvisionnement.", "egan"),
        claim("for-regions-2", "fact", "Au Saguenay, Peter McLeod et William Price s’associent en 1842. Les installations de la rivière du Moulin et de Chicoutimi tirent parti des cours d’eau pour le sciage et du Saguenay pour l’expédition maritime. Des quais, des magasins et des logements se développent autour des établissements.", "price", "mcleod"),
        claim("for-regions-3", "nuance", "L’industrie forestière accompagne l’établissement de nouveaux villages au Saguenay sur des territoires déjà fréquentés par les Innus. Les chantiers, les scieries et l’expansion du peuplement modifient l’accès aux espaces de chasse et de pêche.", "saguenay"),
        claim("for-regions-4", "interpretation", "Les concessions de coupe donnent aux entrepreneurs un accès à la ressource. La maîtrise de plusieurs concessions et de moyens de transport permet à une entreprise comme celle de Price d’approvisionner ses moulins et de commercer à plus grande échelle.", "price"),
      ],
    },
    {
      id: "for-sawing", title: "Industrie du bois de sciage", purpose: "Suivre le bois depuis le chantier jusqu’au marché.",
      summary: claim("for-sawing-summary", "interpretation", "Le sciage transforme les billots en pièces standardisées et relie les chantiers forestiers, les moulins et les réseaux d’expédition.", "program", "price", "egan"),
      paragraphs: [
        claim("for-sawing-1", "interpretation", "La coupe, le déplacement des billots, le sciage et l’expédition mobilisent des métiers distincts. Le bois peut être acheminé par les cours d’eau jusqu’aux scieries, où la force hydraulique actionne les machines. À Chicoutimi, l’eau est conduite jusqu’au mécanisme du moulin.", "mcleod", "price"),
        claim("for-sawing-2", "fact", "Le bois équarri est taillé en grosses pièces pour le transport et la vente. Le bois scié comprend des madriers et des planches destinés notamment à la construction. Les deux produits coexistent dans les cargaisons de Price au milieu du siècle.", "price"),
        claim("for-sawing-3", "interpretation", "Une scierie doit disposer d’un arrivage régulier de billots et d’un accès aux acheteurs pour rentabiliser son équipement. Les quais et les navires des établissements de Price permettent de réunir les productions de plusieurs sites et de les acheminer vers les marchés.", "price", "mcleod"),
        claim("for-sawing-4", "nuance", "Le salaire gagné au chantier peut compléter des revenus agricoles, tandis que les moulins et les quais concentrent des emplois près des villages. Les études de l’Outaouais et du Saguenay montrent des combinaisons différentes de coupe, de transformation et de commerce.", "program", "egan", "mcleod"),
      ],
    },
  ],
  {
    chronologicalMarkers: [
      { ...claim("for-1842", "fact", "Peter McLeod et William Price s’associent pour exploiter des scieries au Saguenay.", "price", "mcleod"), dateLabel: "1842", sortYear: 1842 },
      { ...claim("for-1846", "fact", "John Egan fait construire une grande scierie à Quyon.", "egan"), dateLabel: "1846", sortYear: 1846 },
      { ...claim("for-1852", "fact", "Après la mort de McLeod, Price prend le contrôle de leurs établissements du Saguenay.", "mcleod"), dateLabel: "1852", sortYear: 1852 },
    ],
    vocabulary: [
      { ...claim("for-v-mill", "fact", "Établissement où des scies débitent les billots en pièces telles que des planches ou des madriers.", "mcleod", "price"), term: "Scierie" },
      { ...claim("for-v-square", "fact", "Bois taillé sur ses faces pour obtenir une pièce de section approximativement carrée.", "price"), term: "Bois équarri" },
    ],
  },
);

export const AGRICULTURE_HISTORICAL_RECORD = createRecord(
  "exploitations-agricoles",
  "Exploitations agricoles",
  "La production laitière, la mécanisation et les transformations de la tenure seigneuriale au Québec de 1840 à 1896.",
  [
    {
      id: "agr-dairy", title: "Production laitière", purpose: "Expliquer comment la fabrication de beurre et de fromage ouvre des débouchés.",
      summary: claim("agr-dairy-summary", "interpretation", "Les fabriques, la formation et l’accès aux marchés favorisent la spécialisation laitière dans une partie des campagnes québécoises.", "program", "barnard"),
      paragraphs: [
        claim("agr-dairy-1", "interpretation", "Le lait frais se conserve peu de temps. Sa transformation en beurre ou en fromage permet de commercialiser les produits plus loin. Les fabriques locales peuvent réunir le lait de plusieurs exploitations et répartir les coûts de transformation entre un plus grand nombre de producteurs.", "barnard"),
        claim("agr-dairy-2", "fact", "Édouard-André Barnard encourage l’ouverture de beurreries et de fromageries paroissiales. Il participe à la fondation d’une école de laiterie à Saint-Denis en 1881 et à la création de la Société d’industrie laitière de la province de Québec en 1882. Ces institutions contribuent à diffuser le savoir-faire des fabricants.", "barnard"),
        claim("agr-dairy-3", "nuance", "À la fin du siècle, les exportations de beurre et de fromage progressent, notamment vers le marché britannique. L’adoption de la production laitière dépend des débouchés et de la présence d’une fabrique accessible. Elle s’insère dans des exploitations qui ont aussi besoin de fourrages pour entretenir les troupeaux.", "barnard", "farm"),
      ],
    },
    {
      id: "agr-machines", title: "Mécanisation", purpose: "Distinguer le mécanisme de l’outil et sa source d’énergie.",
      summary: claim("agr-machines-summary", "interpretation", "L’équipement mécanisé modifie certaines tâches agricoles, avec une forte place accordée à la traction animale durant la période.", "program", "farm"),
      paragraphs: [
        claim("agr-machines-1", "interpretation", "Une faucheuse attelée transmet le mouvement de ses roues à un dispositif de coupe, ce qui permet d’avancer en coupant le fourrage. Une batteuse sépare le grain des épis. Ces machines servent à des opérations différentes du calendrier agricole.", "program", "farm"),
        claim("agr-machines-2", "fact", "Le cheval fournit une force motrice pour les travaux des champs et pour le transport. Les écuries et les espaces de remisage témoignent des besoins liés à la traction animale dans les exploitations.", "farm"),
        claim("agr-machines-3", "nuance", "L’achat d’un équipement, son entretien et l’entretien des chevaux représentent des coûts. L’intérêt de l’investissement dépend de la surface à travailler et du gain de temps, particulièrement lorsqu’une tâche doit être terminée dans une courte période de beau temps.", "program", "farm"),
      ],
    },
    {
      id: "agr-tenure", title: "Droits seigneuriaux", purpose: "Distinguer le changement de tenure des paiements qui subsistent.",
      summary: claim("agr-tenure-summary", "fact", "L’Acte seigneurial de 1854 abolit les droits féodaux au Bas-Canada et prévoit une rente constituée en remplacement de certaines charges.", "program", "tenure"),
      paragraphs: [
        claim("agr-tenure-1", "fact", "Dans les seigneuries, les censitaires détiennent des terres grevées de droits tels que le cens et les lods et ventes, perçus lors de certaines mutations. La loi de 1854 prévoit qu’après le dépôt du cadastre seigneurial et la publication de l’avis, la terre du censitaire est tenue en franc-aleu roturier.", "tenure"),
        claim("agr-tenure-2", "fact", "La loi prévoit des compensations et le remplacement des charges seigneuriales par une rente constituée rachetable. Les anciennes obligations féodales disparaissent selon les modalités d’application de la loi, tandis que des paiements peuvent suivre jusqu’au rachat de la rente.", "tenure"),
        claim("agr-tenure-3", "nuance", "La réforme touche la tenure seigneuriale du Bas-Canada. Pour interpréter un document foncier de la période, il faut donc repérer le régime applicable au lot et la date d’application de la réforme dans la seigneurie concernée.", "tenure"),
      ],
    },
  ],
  {
    chronologicalMarkers: [
      { ...claim("agr-1854", "fact", "L’Acte pour l’abolition des droits et devoirs féodaux dans le Bas-Canada reçoit la sanction royale.", "tenure"), dateLabel: "1854", sortYear: 1854 },
      { ...claim("agr-1881", "fact", "Une école de laiterie est fondée à Saint-Denis.", "barnard"), dateLabel: "1881", sortYear: 1881 },
      { ...claim("agr-1882", "fact", "La Société d’industrie laitière de la province de Québec est créée.", "barnard"), dateLabel: "1882", sortYear: 1882 },
    ],
    vocabulary: [
      { ...claim("agr-v-traction", "fact", "Utilisation de la force d’un animal attelé pour déplacer un véhicule ou faire fonctionner un outil agricole.", "farm"), term: "Traction animale" },
      { ...claim("agr-v-rente", "fact", "Paiement rachetable substitué par la loi de 1854 aux charges seigneuriales prévues par l’acte.", "tenure"), term: "Rente constituée" },
    ],
  },
);

import type { HistoricalDocumentRecord } from "./historical-document.ts";

export type IconographicDocumentRecord = HistoricalDocumentRecord & {
  previewAssetUrls: readonly string[];
  imageCredit: string;
};

const common = {
  schemaVersion: 1 as const,
  kind: "image" as const,
  status: "ready-for-review" as const,
  periodIds: ["1840-1896"] as const,
  knowledgeHeadingIds: ["gouvernement-responsable"] as const,
  version: "1.0",
  approvedAt: null,
};

const RESPONSIBLE_GOVERNMENT_ICONOGRAPHIC_CANDIDATES = [
  {
    ...common,
    id: "GR-I-001",
    title: "Young Canada Delighted with Responsible Government",
    operationIds: ["establish_facts", "relationships_between_facts", "causal_connections"] as const,
    historicalDate: "3 février 1849",
    creator: "Frederick W. Lock",
    holdingInstitution: "Bibliothèque et Archives Canada",
    sourceUrl: "https://www.historymuseum.ca/teachers-zone/stories-of-confederation/road-to-responsible-government/political-cartoon-young-canada-delighted-with-responsible-government/",
    sourceLocator: "Bibliothèque et Archives Canada, C-092201; notice pédagogique du Musée canadien de l’histoire.",
    assetUrl: "/historical-documents/gr-young-canada-cartoon.jpg",
    previewAssetUrls: ["/historical-documents/gr-young-canada-cartoon.jpg"],
    imageCredit: "Frederick W. Lock, 1849 · Bibliothèque et Archives Canada, C-092201",
    rightsStatement: "L’œuvre de 1849 est dans le domaine public, mais le fichier actuellement utilisé provient du Musée canadien de l’histoire. Une permission écrite du Musée est requise avant toute diffusion commerciale dans Socrato; ne pas approuver cette fiche avant l’obtention de la permission ou le remplacement par un fichier explicitement libre.",
    transcription: "Young Canada Delighted with Responsible Government",
    accessibleDescription: "Caricature représentant le Canada comme un bébé, Robert Baldwin comme une gouvernante et lord Elgin comme une marionnette, avec une couronne, un livre intitulé Lafontaine’s Fables et une référence ironique au français.",
    historicalContext: "La caricature exprime le point de vue de conservateurs qui jugent l’électorat immature et présentent Baldwin comme contrôlant le gouverneur Elgin après l’établissement du gouvernement responsable.",
    observationGuide: ["Identifier le bébé, Baldwin et Elgin.", "Interpréter la marionnette, la couronne et le livre.", "Déduire le point de vue critique du caricaturiste."],
    interpretationCautions: ["Une caricature exagère pour convaincre.", "Le message ne représente pas l’opinion de toute la population.", "Signaler le langage et les stéréotypes historiques difficiles."],
    pedagogicalUses: ["Établir le point de vue conservateur.", "Relier les symboles au fonctionnement du gouvernement responsable.", "Comparer cette critique au discours des réformistes."],
  },
  {
    ...common,
    id: "GR-I-002",
    title: "L’incendie du Parlement de Montréal",
    operationIds: ["establish_facts", "time_and_space", "causes_and_consequences", "causal_connections"] as const,
    historicalDate: "25 avril 1849",
    creator: "E. Hides; lithographie de Matthews’ Lith., Montréal",
    holdingInstitution: "Bibliothèque et Archives Canada",
    sourceUrl: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?app=fonandcol&idnumber=4207157",
    sourceLocator: "Collection d’estampes historiques canadiennes, R13133-432-3-E, item 4207157.",
    assetUrl: "/historical-documents/gr-parliament-fire.jpg",
    previewAssetUrls: ["/historical-documents/gr-parliament-fire.jpg"],
    imageCredit: "E. Hides et Matthews’ Lith., 1849 · Bibliothèque et Archives Canada",
    rightsStatement: "UTILISATION AUTORISABLE : droit d’auteur expiré selon la notice de Bibliothèque et Archives Canada, et fichier Wikimedia Commons marqué domaine public sans restriction connue. Conserver le titre, l’auteur, la notice source et le crédit Library and Archives Canada, R13133-413.",
    transcription: "Destruction of the Parliament House — Montreal — April 25th 1849",
    accessibleDescription: "Lithographie montrant une foule devant le Parlement de Montréal en flammes tandis que des pompiers montent à une échelle et déploient un boyau.",
    historicalContext: "Après la sanction de la loi d’indemnisation des victimes des rébellions par lord Elgin, une foule hostile au gouvernement La Fontaine–Baldwin incendie le Parlement de Montréal.",
    observationGuide: ["Repérer la foule, le feu et l’intervention des pompiers.", "Situer la scène à Montréal en 1849.", "Relier l’événement aux tensions entourant la responsabilité ministérielle."],
    interpretationCautions: ["L’image représente un événement réel, mais sa composition demeure un choix d’artiste.", "Ne pas déduire l’identité ou les intentions de chaque personnage représenté."],
    pedagogicalUses: ["Déterminer des causes et des conséquences.", "Établir une chronologie entre la loi, la sanction et l’émeute.", "Interpréter la violence politique sous le régime de l’Union."],
  },
  {
    ...common,
    id: "GR-I-003",
    title: "Un drapeau en faveur du gouvernement responsable",
    operationIds: ["establish_facts", "relationships_between_facts", "causal_connections"] as const,
    historicalDate: "1841-1842",
    creator: "John Henry Dunn et Isaac Buchanan",
    holdingInstitution: "Musée canadien de l’histoire",
    sourceUrl: "https://www.historymuseum.ca/teachers-zone/stories-of-confederation/road-to-responsible-government/flag/",
    sourceLocator: "Musée canadien de l’histoire, objet 2003.45.1, drapeau de soie portant la devise British Rule and British Institutions.",
    assetUrl: "/historical-documents/gr-responsible-government-flag.jpg",
    previewAssetUrls: ["/historical-documents/gr-responsible-government-flag.jpg"],
    imageCredit: "Dunn et Buchanan, 1841-1842 · Musée canadien de l’histoire, 2003.45.1",
    rightsStatement: "PERMISSION REQUISE : l’objet de 1841-1842 est ancien, mais la photographie provient du Musée canadien de l’histoire. Le Musée exige une permission écrite pour reproduire ou transmettre une image de ses collections hors usage privé ou recherche, et peut imposer des frais.",
    transcription: "British Rule and British Institutions — 1842 — Dunn & Buchanan",
    accessibleDescription: "Drapeau de soie portant une couronne impériale, une devise favorable aux institutions britanniques, la date 1842 et les noms Dunn et Buchanan.",
    historicalContext: "Les réformistes Dunn et Buchanan utilisent des symboles britanniques pour soutenir que le gouvernement responsable est compatible avec la monarchie et les institutions britanniques.",
    observationGuide: ["Relever la couronne et la devise.", "Interpréter le choix des symboles britanniques.", "Déduire le message politique des auteurs."],
    interpretationCautions: ["Le drapeau défend un point de vue réformiste précis.", "Distinguer l’objet original de sa photographie contemporaine."],
    pedagogicalUses: ["Caractériser une revendication réformiste.", "Relier symboles politiques et message.", "Comparer ce document à la caricature conservatrice de 1849."],
  },
  {
    ...common,
    id: "GR-I-004",
    title: "Des pierres lancées contre lord Elgin",
    operationIds: ["establish_facts", "causes_and_consequences", "causal_connections"] as const,
    historicalDate: "1849",
    creator: "Manifestants opposés à la loi d’indemnisation; auteur de la conservation inconnu",
    holdingInstitution: "Musée canadien de l’histoire",
    sourceUrl: "https://www.historymuseum.ca/teachers-zone/stories-of-confederation/road-to-responsible-government/stones-thrown-at-lord-elgin/",
    sourceLocator: "Objets présentés par le Musée canadien de l’histoire comme des pierres lancées contre la voiture de lord Elgin en 1849.",
    assetUrl: "/historical-documents/gr-elgin-stones.jpg",
    previewAssetUrls: ["/historical-documents/gr-elgin-stones.jpg"],
    imageCredit: "Musée canadien de l’histoire · photographie d’objets associés aux troubles de 1849",
    rightsStatement: "PERMISSION REQUISE : les objets datent de 1849, mais la photographie provient du Musée canadien de l’histoire. Une permission écrite est nécessaire pour l’intégrer à un produit diffusé; la provenance matérielle doit aussi être confirmée avant approbation.",
    transcription: "Pierres associées à l’attaque de la voiture de lord Elgin",
    accessibleDescription: "Photographie de plusieurs pierres conservées comme traces matérielles de l’attaque menée contre la voiture du gouverneur général lord Elgin en 1849.",
    historicalContext: "Lord Elgin est attaqué après avoir accordé la sanction royale à la loi d’indemnisation, conformément au principe voulant que le gouverneur suive les conseils d’un ministère soutenu par l’Assemblée.",
    observationGuide: ["Identifier la nature matérielle de la source.", "S’interroger sur sa provenance et sa conservation.", "Relier l’objet à la contestation de la sanction royale."],
    interpretationCautions: ["Un objet associé à un événement exige une chaîne de provenance solide.", "La photographie ne prouve pas à elle seule quand ni par qui chaque pierre a été lancée."],
    pedagogicalUses: ["Interpréter une source matérielle.", "Relier un geste violent à un conflit politique.", "Évaluer les limites d’une preuve historique."],
  },
  {
    ...common,
    id: "GR-I-005",
    title: "La collaboration de La Fontaine et Baldwin",
    operationIds: ["establish_facts", "relationships_between_facts", "causal_connections"] as const,
    historicalDate: "XIXe siècle",
    creator: "Portraitistes non identifiés dans les notices numériques consultées",
    holdingInstitution: "Reproductions d’œuvres du domaine public diffusées par Wikimedia Commons",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Louis-Hippolyte_Lafontaine.jpg",
    sourceLocator: "Portrait de Louis-Hippolyte La Fontaine et portrait de Robert Baldwin, présentés côte à côte dans une composition documentaire de Socrato.",
    assetUrl: "/historical-documents/gr-lafontaine-portrait.jpg",
    previewAssetUrls: ["/historical-documents/gr-lafontaine-portrait.jpg", "/historical-documents/gr-baldwin-portrait.jpg"],
    imageCredit: "Portraits de Louis-Hippolyte La Fontaine et Robert Baldwin · domaine public",
    rightsStatement: "UTILISATION AUTORISABLE AU CANADA : les deux fichiers sont marqués domaine public au Canada et aux États-Unis sur Wikimedia Commons. Conserver les liens vers les notices, les noms des sujets et préciser que la juxtaposition est une mise en page de Socrato, non un double portrait historique.",
    transcription: "Louis-Hippolyte La Fontaine — Robert Baldwin",
    accessibleDescription: "Deux portraits placés côte à côte : Louis-Hippolyte La Fontaine, représentant du Canada-Est, et Robert Baldwin, représentant du Canada-Ouest.",
    historicalContext: "L’alliance entre les réformistes La Fontaine et Baldwin réunit des élus du Canada-Est et du Canada-Ouest et permet la formation d’un ministère soutenu par une majorité de l’Assemblée en 1848.",
    observationGuide: ["Identifier les deux personnages.", "Associer chacun à une section de la Province du Canada.", "Relier leur collaboration à la majorité parlementaire de 1848."],
    interpretationCautions: ["La juxtaposition moderne ne constitue pas un double portrait produit à l’époque.", "Un portrait officiel renseigne peu sur les désaccords ou les rapports de force."],
    pedagogicalUses: ["Mettre en relation deux acteurs historiques.", "Expliquer le rôle d’une alliance transsectionnelle.", "Relier la majorité parlementaire à la formation du gouvernement."],
  },
] as const satisfies readonly IconographicDocumentRecord[];

export const RESPONSIBLE_GOVERNMENT_ICONOGRAPHIC_DOCUMENTS = RESPONSIBLE_GOVERNMENT_ICONOGRAPHIC_CANDIDATES.filter(({ id }) => id === "GR-I-002" || id === "GR-I-005");

export const PATRIOTES_ICONOGRAPHIC_DOCUMENTS = [
  {
    id: "PAT-I-001", knowledgeHeadingIds: ["rebellions-1837-1838", "acte-union"] as const, title: "L’assaut contre l’église de Saint-Eustache", historicalDate: "14 décembre 1837", creator: "Lord Charles Beauclerk; lithographie de Nathaniel Hartnell", sourceUrl: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?IdNumber=2837360&app=fonandcol&ecopy=c000392k&wbdisable=false", sourceLocator: "Bibliothèque et Archives Canada, collection Charles Beauclerk, C-000392, 1992-566-2.", assetUrl: "/historical-documents/patriotes-saint-eustache.jpg", imageCredit: "Beauclerk et Hartnell, 1840 · Bibliothèque et Archives Canada / 1992-566-2", rightsStatement: "UTILISATION AUTORISÉE : BAC indique que le droit d’auteur est expiré et qu’il n’existe aucune restriction d’utilisation pour reproduction ou publication. Conserver le crédit prescrit.", accessibleDescription: "Lithographie coloriée montrant l’artillerie britannique attaquant l’église de Saint-Eustache occupée par les insurgés.", historicalContext: "La bataille de Saint-Eustache du 14 décembre 1837 oppose les Patriotes aux forces britanniques. Beauclerk, officier britannique, produit le dessin à l’origine de cette lithographie publiée en 1840.", observationGuide: ["Repérer l’église, les soldats et l’artillerie.", "Identifier le point de vue militaire britannique.", "Distinguer la date de l’événement de celle de la publication."], interpretationCautions: ["La composition adopte le regard d’un officier britannique.", "L’image ne montre pas toute l’expérience des habitants ni celle des Patriotes."], pedagogicalUses: ["Situer l’affrontement dans le temps et l’espace.", "Établir le point de vue de l’auteur.", "Déterminer des causes et des conséquences de la répression."], operationIds: ["establish_facts", "time_and_space", "causes_and_consequences"] as const,
  },
  {
    id: "PAT-I-002", knowledgeHeadingIds: ["rebellions-1837-1838", "acte-union"] as const, title: "L’Assemblée des six comtés à Saint-Charles", historicalDate: "Événement de 1837; peinture de 1891", creator: "Charles Alexander Smith", sourceUrl: "https://commons.wikimedia.org/wiki/File:Assembl%C3%A9e_des_six-comt%C3%A9s_painting.jpg", sourceLocator: "Musée national des beaux-arts du Québec, 1937.54; reproduction diffusée sur Wikimedia Commons.", assetUrl: "/historical-documents/patriotes-six-comtes.jpg", imageCredit: "Charles Alexander Smith, 1891 · domaine public", rightsStatement: "UTILISATION AUTORISÉE : le fichier Wikimedia Commons est marqué domaine public. Conserver l’auteur, le titre, la date, la collection et le lien de la notice.", accessibleDescription: "Grande scène historique montrant Louis-Joseph Papineau s’adressant à une foule réunie autour de la colonne de la liberté et de bannières patriotes.", historicalContext: "La réunion des 23 et 24 octobre 1837 mobilise des délégués de six comtés contre les politiques du gouvernement colonial. Smith peint la scène en 1891, plus de cinquante ans après l’événement.", observationGuide: ["Repérer l’orateur, la foule, les bannières et la colonne.", "Identifier les signes de mobilisation collective.", "Comparer la date représentée et la date de création."], interpretationCautions: ["Il s’agit d’une reconstruction mémorielle tardive, non d’un témoignage visuel pris en 1837.", "La composition héroïque sélectionne et organise les personnages."], pedagogicalUses: ["Caractériser la mobilisation patriote.", "Distinguer événement et représentation ultérieure.", "Interpréter des symboles politiques."], operationIds: ["establish_facts", "relationships_between_facts", "changes_and_continuities"] as const,
  },
  {
    id: "PAT-I-003", knowledgeHeadingIds: ["rebellions-1837-1838", "acte-union"] as const, title: "Le Patriote — mémoire de 1837", historicalDate: "1904", creator: "Henri Julien", sourceUrl: "https://commons.wikimedia.org/wiki/File:Le_Patriote_-_Henri_Julien_1904.jpg", sourceLocator: "Henri Julien, Le Patriote, 1904; reproduction diffusée sur Wikimedia Commons.", assetUrl: "/historical-documents/patriotes-vieux-1837.jpg", imageCredit: "Henri Julien, 1904 · domaine public", rightsStatement: "UTILISATION AUTORISÉE : le fichier Wikimedia Commons est marqué domaine public. Conserver le nom d’Henri Julien, le titre, la date et le lien de la notice.", accessibleDescription: "Illustration d’un Patriote âgé portant une ceinture fléchée, un manteau, une tuque et un fusil.", historicalContext: "Henri Julien crée cette figure plusieurs décennies après les Rébellions. L’image participe à la construction d’une mémoire héroïque et populaire du Patriote de 1837.", observationGuide: ["Décrire les vêtements, la posture et les objets.", "Repérer les éléments qui construisent une figure héroïque.", "Comparer la date de l’œuvre à celle des Rébellions."], interpretationCautions: ["Cette image représente la mémoire de 1837, non une scène observée pendant les combats.", "Le personnage synthétise une identité collective et ne constitue pas le portrait de tous les Patriotes."], pedagogicalUses: ["Interpréter la mémoire d’un événement.", "Caractériser une représentation héroïque.", "Comparer cette œuvre à la lithographie britannique de Saint-Eustache."], operationIds: ["establish_facts", "changes_and_continuities", "relationships_between_facts"] as const,
  },
] as const;

export const ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM = {
  id: "AU-D-001", title: "La structure politique mise en place par l’Acte d’Union", historicalDate: "1841", creator: "Socrato, d’après l’Acte d’Union de 1840", sourceUrl: "https://primarydocuments.ca/acte-dunion-1840-r-u/?lang=fr", sourceLocator: "Acte d’Union, 3-4 Victoria, ch. 35, dispositions relatives au gouverneur, aux conseils et à l’Assemblée.", rightsStatement: "Schéma original de Socrato. Réutilisable dans les interfaces et cartes élèves de Socrato avec conservation de la référence au texte législatif.", operationIds: ["establish_facts", "relationships_between_facts", "causal_connections"] as const,
  historicalContext: "En 1841, la Province du Canada possède une Assemblée élue, mais le gouverneur et les conseils nommés conservent une place centrale. Le gouvernement responsable n’est pas garanti par l’Acte d’Union.", observationGuide: ["Distinguer les institutions nommées des représentants élus.", "Suivre le pouvoir de nomination et le parcours des projets de loi.", "Repérer la représentation égale du Canada-Est et du Canada-Ouest."], interpretationCautions: ["Le schéma simplifie le fonctionnement institutionnel.", "Il représente la structure juridique initiale de 1841, avant l’obtention du gouvernement responsable."], pedagogicalUses: ["Décrire la structure politique.", "Mettre en relation les institutions.", "Expliquer pourquoi l’Assemblée élue ne contrôle pas encore pleinement l’exécutif."],
} as const;

export const ACTE_UNION_STUDENT_TIMELINE = {
  id: "AU-D-002",
  title: "De la crise politique au gouvernement responsable",
  periodLabel: "1837-1848",
  creator: "Socrato",
  rightsStatement: "Frise originale de Socrato composée de quatre images du domaine public ou de documents officiels dont le droit d’auteur est expiré. Conserver le crédit et le lien associés à chaque image.",
  historicalContext: "La frise relie les Rébellions, le rapport Durham, l’adoption de l’Acte d’Union, sa mise en application et l’avènement du gouvernement responsable en 1848.",
  operationIds: ["time_and_space", "relationships_between_facts", "causal_connections"] as const,
  observationGuide: ["Remettre les cinq étapes en ordre.", "Distinguer l’adoption de la loi en 1840 de son application en 1841.", "Expliquer le délai entre la création de la Province du Canada et l’avènement du gouvernement responsable.", "Relier chaque image à l’événement qu’elle représente."],
  interpretationCautions: ["La vue de Kingston représente le lieu choisi comme première capitale, pas une séance parlementaire.", "La frise résume un enchaînement complexe et ne signifie pas qu’une seule cause explique l’Union."],
  entries: [
    { date: "1837-1838", phase: "La crise", title: "Rébellions dans les deux Canadas", description: "Des conflits armés éclatent contre les autorités coloniales.", imageUrl: "/historical-documents/patriotes-saint-eustache.jpg", imageAlt: "Assaut britannique contre l’église de Saint-Eustache occupée par les Patriotes", credit: "Beauclerk et Hartnell · BAC, 1992-566-2", sourceUrl: "https://recherche-collection-search.bac-lac.gc.ca/eng/home/record?IdNumber=2837360&app=fonandcol&ecopy=c000392k&wbdisable=false" },
    { date: "1839", phase: "La recommandation", title: "Publication du rapport Durham", description: "Durham recommande notamment l’union législative des deux Canadas.", imageUrl: "/historical-documents/lord-durham-portrait.jpg", imageAlt: "Portrait de John George Lambton, lord Durham", credit: "Thomas Phillips · domaine public", sourceUrl: "https://commons.wikimedia.org/wiki/File:John_George_Lambton,_1st_Earl_of_Durham_by_Thomas_Phillips.jpg" },
    { date: "1840", phase: "La loi", title: "Adoption de l’Acte d’Union", description: "Le Parlement britannique adopte la loi réunissant les deux colonies.", imageUrl: "/historical-documents/timeline-act-union-1840.jpg", imageAlt: "Première page de la reproduction officielle de l’Acte d’Union de 1840", credit: "Acte d’Union, 1840 · PrimaryDocuments.ca", sourceUrl: "https://primarydocuments.ca/acte-dunion-1840-r-u/?lang=fr" },
    { date: "1841", phase: "La mise en place", title: "Naissance de la Province du Canada", description: "La loi entre en vigueur; le premier Parlement se réunit à Kingston.", imageUrl: "/historical-documents/timeline-kingston-1841.jpg", imageAlt: "Vue de Kingston depuis la citadelle vers 1841", credit: "W. H. Bartlett · domaine public", sourceUrl: "https://commons.wikimedia.org/wiki/File:Citadel_of_Kingston.jpg" },
    { date: "1848", phase: "Le changement politique", title: "Avènement du gouvernement responsable", description: "Le gouvernement La Fontaine–Baldwin conserve la confiance de l’Assemblée; le gouverneur accepte que les ministres soient choisis parmi la majorité élue.", imageUrl: "/historical-documents/gr-lafontaine-portrait.jpg", imageAlt: "Portrait de Louis-Hippolyte La Fontaine, dirigeant réformiste du Canada-Est", credit: "Louis-Hippolyte La Fontaine · domaine public", sourceUrl: "https://commons.wikimedia.org/wiki/File:Louis-Hippolyte_Lafontaine.jpg" },
  ],
} as const;

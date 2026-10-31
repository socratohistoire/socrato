import type { ExpectedLearningObjective, HistoricalClaim, HistoricalRecord, IntellectualOperationId, ReferenceSource } from "../types.ts";

const SOURCES = {
  program: { id: "pfeq-hqc-2017", kind: "official-program", title: "Programme de formation de l’école québécoise – Histoire du Québec et du Canada", creator: "Ministère de l’Éducation", publisher: "Gouvernement du Québec", publicationYear: 2017, url: "https://cdn-contenu.quebec.ca/cdn-contenu/education/pfeq/secondaire/programmes/PFEQ-histoire-quebec-canada-secondaire.pdf", locator: "Précisions des connaissances, période 1840-1896, p. 46-47 du programme (p. 49-50 du PDF) : trois précisions sous « Manifestations socioculturelles »", verificationStatus: "verified" },
  garneau: { id: "dbc-francois-xavier-garneau", kind: "academic", title: "GARNEAU, FRANÇOIS-XAVIER", publisher: "Dictionnaire biographique du Canada, Université Laval/University of Toronto", url: "https://www.biographi.ca/fr/bio/garneau_francois_xavier_9F.html", locator: "Poésie patriotique; réaction à l’Union; premier volume de l’Histoire du Canada en 1845; objectif de soutenir la volonté de vivre des Canadiens français", verificationStatus: "verified" },
  gerinLajoie: { id: "dbc-antoine-gerin-lajoie", kind: "academic", title: "GÉRIN-LAJOIE, ANTOINE", publisher: "Dictionnaire biographique du Canada, Université Laval/University of Toronto", url: "https://www.biographi.ca/fr/bio/gerin_lajoie_antoine_11F.html", locator: "Composition d’Un Canadien errant en 1842 à la mémoire des exilés des Rébellions; diffusion de la chanson au Canada-Est", verificationStatus: "verified" },
  cremazie: { id: "dbc-octave-cremazie", kind: "academic", title: "CRÉMAZIE, OCTAVE", publisher: "Dictionnaire biographique du Canada, Université Laval/University of Toronto", url: "https://www.biographi.ca/fr/bio/cremazie_octave_10F.html", locator: "Poésie patriotique, Institut canadien de Québec, milieu littéraire de la librairie Crémazie et consécration par Le Drapeau de Carillon en 1858", verificationStatus: "verified" },
  carillon: { id: "dbc-charles-sabatier-carillon", kind: "academic", title: "WUGK, CHARLES-DÉSIRÉ-JOSEPH, dit Charles Sabatier", publisher: "Dictionnaire biographique du Canada, Université Laval/University of Toronto", url: "https://www.biographi.ca/fr/bio/wugk_charles_desire_joseph_9F.html", locator: "Première exécution du chant patriotique Le Drapeau de Carillon à Québec le 15 mai 1858; paroles de Crémazie et musique de Sabatier", verificationStatus: "verified" },
  dessaulles: { id: "dbc-louis-antoine-dessaulles", kind: "academic", title: "DESSAULLES, LOUIS-ANTOINE", creator: "Yvan Lamonde", publisher: "Dictionnaire biographique du Canada, Université Laval/University of Toronto", url: "https://www.biographi.ca/fr/bio/6064?revision_id=34705", locator: "Institut canadien de Montréal, bibliothèque, conférences, libéralisme intellectuel et conflit avec l’autorité ecclésiastique", verificationStatus: "verified" },
  ferland: { id: "dbc-jean-baptiste-antoine-ferland", kind: "academic", title: "FERLAND, JEAN-BAPTISTE-ANTOINE", creator: "Serge Gagnon", publisher: "Dictionnaire biographique du Canada, Université Laval/University of Toronto", url: "https://www.biographi.ca/fr/bio/4420", locator: "Cours publics d’histoire du Canada à l’Université Laval; recherches d’archives; publication du Cours d’histoire du Canada en 1861 et 1865", verificationStatus: "verified" },
  conan: { id: "dbc-laure-conan", kind: "academic", title: "ANGERS, FÉLICITÉ, dite Laure Conan", publisher: "Dictionnaire biographique du Canada, Université Laval/University of Toronto", url: "https://www.biographi.ca/fr/bio/angers_felicite_15F.html", locator: "Carrière de romancière et journaliste; publication d’Angéline de Montbrun; pseudonyme; présence croissante des femmes dans la presse après 1890", verificationStatus: "verified" },
  marchand: { id: "dbc-josephine-marchand-dandurand", kind: "academic", title: "MARCHAND, JOSÉPHINE (Dandurand)", publisher: "Dictionnaire biographique du Canada, Université Laval/University of Toronto", url: "https://www.biographi.ca/fr/bio/marchand_josephine_15E.html", locator: "Écriture sous pseudonyme; fondation du Coin du feu en 1893; première revue canadienne de langue française dirigée par une femme et destinée aux femmes", verificationStatus: "verified" },
  laval: { id: "ulaval-origine-histoire", kind: "academic", title: "Origine et histoire", creator: "Université Laval", publisher: "Université Laval", url: "https://www.ulaval.ca/notre-universite/origine-et-histoire", locator: "Charte royale de 1852; première université francophone en Amérique; succursale de Montréal ouverte en 1878", verificationStatus: "verified" },
  lavalCharter: { id: "ulaval-charte-1852", kind: "other", title: "Charte de l’Université Laval", creator: "Reine Victoria et Université Laval", publisher: "Université Laval", publicationYear: 1852, url: "https://www.ulaval.ca/sites/default/files/notre-universite/direction-gouv/BSG/Documents/Charte.pdf", locator: "Charte royale du 8 décembre 1852 autorisant notamment l’établissement à conférer des grades universitaires", verificationStatus: "verified" },
  casault: { id: "dbc-louis-jacques-casault", kind: "academic", title: "CASAULT, LOUIS-JACQUES", publisher: "Dictionnaire biographique du Canada, Université Laval/University of Toronto", url: "https://www.biographi.ca/fr/bio/4343", locator: "Organisation des facultés de l’Université Laval, édifices universitaires et conférences publiques à partir de 1857", verificationStatus: "verified" },
  mlea: { id: "mcgill-mlea-fonds", kind: "museum-or-archive", title: "Montreal Ladies Educational Association Fonds", creator: "McGill University Archives", publisher: "Université McGill", url: "https://archivalcollections.library.mcgill.ca/index.php/montreal-ladies-educational-association-fonds", locator: "Association active de 1871 à 1885; cours de niveau universitaire pour les femmes; examens, certificats et contribution à leur admission à McGill", verificationStatus: "verified" },
  donaldas: { id: "mcgill-first-women-donaldas", kind: "academic", title: "The Donaldas – The journey toward gender equity", creator: "Senate Subcommittee on Women", publisher: "Université McGill", url: "https://www.mcgill.ca/senate-subcommittee-women/first-women-mcgill", locator: "Admission des femmes en 1884; enseignement séparé; première cohorte de diplômées en 1888", verificationStatus: "verified" },
} as const satisfies Record<string, ReferenceSource>;

const ids = (...keys: (keyof typeof SOURCES)[]) => keys.map((key) => SOURCES[key].id);
const claim = (claimKind: HistoricalClaim["claimKind"], id: string, text: string, sourceIds: readonly string[]): HistoricalClaim => ({ id, text, sourceIds, claimKind });
const fact = (id: string, text: string, sourceIds: readonly string[]) => claim("fact", id, text, sourceIds);
const nuance = (id: string, text: string, sourceIds: readonly string[]) => claim("nuance", id, text, sourceIds);
const interpretation = (id: string, text: string, sourceIds: readonly string[]) => claim("interpretation", id, text, sourceIds);
const statement = (id: string, text: string, sourceIds: readonly string[]) => ({ id, text, sourceIds });
const objective = (id: string, text: string, sourceIds: readonly string[], programBasis: string, knowledgeFocus: readonly string[], operationIds: readonly IntellectualOperationId[]): ExpectedLearningObjective => ({ id, text, sourceIds, origin: "socrato-editorial-derivation", programBasis, knowledgeFocus, operationIds });

export const SOCIOCULTURAL_MANIFESTATIONS_HISTORICAL_RECORD: HistoricalRecord = {
  schemaVersion: 1,
  id: "historical-record:manifestations-socioculturelles",
  knowledgeHeadingId: "manifestations-socioculturelles",
  status: "draft",
  title: "Dossier historique — Les manifestations socioculturelles",
  scope: "Les œuvres patriotiques, l’émergence de la littérature féminine et le développement de l’enseignement supérieur au Québec de 1840 à 1896.",
  knowledgePrecisions: [
    { ...statement("ms-precision-patriotic", "Des chansons, poèmes, récits historiques et activités littéraires expriment et diffusent une mémoire patriotique canadienne-française après l’Union et les Rébellions.", ids("program", "gerinLajoie", "garneau", "cremazie", "carillon")), officialOrder: 1, officialLabel: "Œuvres patriotiques", coverageStatus: "complete", linkedStatementIds: ["ms-patriotic-1", "ms-patriotic-2", "ms-patriotic-3", "ms-patriotic-4", "ms-patriotic-5"] },
    { ...statement("ms-precision-women", "Dans les dernières décennies du XIXe siècle, des femmes prennent une place plus visible dans le roman et la presse, souvent au prix de contraintes éditoriales et sociales particulières.", ids("program", "conan", "marchand")), officialOrder: 2, officialLabel: "Émergence de la littérature féminine", coverageStatus: "complete", linkedStatementIds: ["ms-women-1", "ms-women-2", "ms-women-3", "ms-women-4", "ms-women-5"] },
    { ...statement("ms-precision-higher", "La création de l’Université Laval, sa succursale montréalaise et l’admission progressive de femmes à McGill élargissent l’enseignement supérieur, sans le rendre accessible à toute la population.", ids("program", "laval", "lavalCharter", "casault", "mlea", "donaldas")), officialOrder: 3, officialLabel: "Enseignement supérieur", coverageStatus: "complete", linkedStatementIds: ["ms-higher-1", "ms-higher-2", "ms-higher-3", "ms-higher-4", "ms-higher-5", "ms-higher-6"] },
  ],
  manual: {
    title: "Les manifestations socioculturelles au Québec, 1840-1896",
    purpose: "Fournir une synthèse interne, originale et sourcée qui relie la production culturelle, la diffusion des idées, les institutions d’enseignement et les groupes qui y ont accès.",
    audience: "internal-pedagogical-reference",
    editorialMethod: "Synthèse originale fondée sur le programme ministériel, des biographies savantes du Dictionnaire biographique du Canada, des archives universitaires et les histoires institutionnelles de Laval et de McGill. Les œuvres sont replacées dans leurs conditions de création, de diffusion et de réception.",
    scopeBoundary: "La monographie couvre le Québec de 1840 à 1896. Elle se concentre sur les trois précisions officielles et ne prétend pas dresser un inventaire complet des arts, de la presse ou des établissements scolaires. La culture de masse, la professionnalisation littéraire du XXe siècle et l’essor universitaire après 1896 appartiennent à d’autres dossiers.",
    sections: [
      { id: "ms-mono-definition", title: "Repères — Produire, diffuser et recevoir la culture", purpose: "Définir la notion et ses trois axes officiels.", paragraphs: [
        fact("ms-definition-1", "Une manifestation socioculturelle est une création, une pratique ou une institution par laquelle une société exprime des idées, transmet une mémoire, organise le savoir ou rend visibles de nouveaux acteurs.", ids("program")),
        interpretation("ms-definition-2", "Une œuvre devient patriotique non seulement par son sujet, mais aussi par l’usage qui en est fait : chantée, lue, enseignée ou célébrée, elle contribue à construire une mémoire collective.", ids("gerinLajoie", "garneau", "cremazie")),
        nuance("ms-definition-3", "L’émergence d’une littérature féminine ne signifie pas que les femmes étaient auparavant sans voix. Elle désigne ici leur présence plus visible comme auteures publiées, journalistes et directrices de revue.", ids("conan", "marchand")),
        nuance("ms-definition-4", "Le développement de l’enseignement supérieur désigne la création et l’expansion d’institutions capables de donner une formation avancée et de conférer des grades; il ne signifie pas que l’université devient accessible à tous.", ids("laval", "lavalCharter", "donaldas")),
      ] },
      { id: "ms-mono-context", title: "Après 1840 — Une culture au service de la mémoire et de la survivance", purpose: "Relier les créations culturelles au contexte politique de l’Union.", paragraphs: [
        fact("ms-context-1", "L’Acte d’Union, la répression des Rébellions et l’exil de Patriotes nourrissent chez plusieurs auteurs le besoin de raconter le passé, de commémorer les vaincus et d’affirmer la continuité des Canadiens français.", ids("gerinLajoie", "garneau")),
        fact("ms-context-2", "Antoine Gérin-Lajoie compose Un Canadien errant en 1842 à la mémoire des Canadiens déportés en Australie après les Rébellions. La chanson se diffuse rapidement dans le Canada-Est.", ids("gerinLajoie")),
        fact("ms-context-3", "François-Xavier Garneau participe aux mobilisations contre l’Union et entreprend une histoire nationale afin de répondre au découragement et aux récits britanniques du passé canadien.", ids("garneau")),
        interpretation("ms-context-4", "Dans ce contexte, chanson et histoire ne sont pas de simples divertissements : elles permettent de conserver une mémoire, de donner un sens aux défaites et de soutenir une identité collective.", ids("gerinLajoie", "garneau")),
      ] },
      { id: "ms-mono-patriotic", title: "1842-1865 — Des œuvres patriotiques dans plusieurs genres", purpose: "Comparer la chanson, la poésie et l’histoire comme formes de patriotisme culturel.", paragraphs: [
        fact("ms-patriotic-1", "Un Canadien errant transforme le sort des exilés de 1837-1838 en complainte. Son air mémorable favorise une circulation orale qui dépasse le milieu scolaire où la chanson est créée.", ids("gerinLajoie")),
        fact("ms-patriotic-2", "Le premier volume de l’Histoire du Canada de Garneau paraît en 1845. L’auteur cherche à raconter le passé du point de vue d’un Canadien français et à fournir des raisons de résister au découragement produit par l’Union.", ids("garneau")),
        fact("ms-patriotic-3", "Le Drapeau de Carillon, dont les paroles sont d’Octave Crémazie et la musique de Charles Sabatier, est exécuté pour la première fois à Québec en 1858 et devient un chant patriotique largement connu.", ids("cremazie", "carillon")),
        fact("ms-patriotic-4", "Autour de la librairie Crémazie et de sociétés littéraires se rencontrent auteurs, historiens et lecteurs. Ces réseaux favorisent la circulation des textes et la formation d’un milieu littéraire canadien-français.", ids("cremazie", "garneau")),
        nuance("ms-patriotic-5", "Les œuvres patriotiques ne portent pas toutes le même projet politique. Garneau peut défendre des valeurs libérales, tandis que d’autres auteurs inscrivent davantage la nation dans une interprétation catholique et cléricale du passé.", ids("garneau", "ferland")),
      ], tables: [
        { id: "ms-table-works", title: "Trois formes d’œuvre patriotique", introduction: "Les œuvres utilisent des moyens différents pour transmettre mémoire et identité.", columns: ["Repère", "Forme et diffusion", "Fonction socioculturelle"], rows: [
          { ...statement("ms-row-errant", "La chanson de 1842 commémore les exilés des Rébellions.", ids("gerinLajoie")), cells: ["Un Canadien errant, 1842", "Chanson diffusée oralement", "Transformer l’exil en mémoire partagée"] },
          { ...statement("ms-row-garneau", "L’ouvrage de Garneau propose un récit national à partir de 1845.", ids("garneau")), cells: ["Histoire du Canada, 1845-1852", "Volumes imprimés, puis abrégé scolaire", "Donner aux Canadiens français une histoire écrite de leur propre point de vue"] },
          { ...statement("ms-row-carillon", "Le chant de Crémazie et Sabatier mobilise un symbole historique en 1858.", ids("cremazie", "carillon")), cells: ["Le Drapeau de Carillon, 1858", "Poème mis en musique et exécuté publiquement", "Célébrer une mémoire héroïque et affirmer la nation"] },
        ] },
      ] },
      { id: "ms-mono-networks", title: "Sociétés, bibliothèques, presse et conférences", purpose: "Expliquer les infrastructures qui rendent les œuvres publiques.", paragraphs: [
        fact("ms-networks-1", "Les instituts canadiens, les sociétés littéraires, les librairies et les journaux créent des lieux de lecture, de discussion et de publication. Ils permettent à une élite lettrée de débattre de politique, d’histoire, de sciences et de littérature.", ids("dessaulles", "cremazie")),
        fact("ms-networks-2", "L’Institut canadien de Montréal possède une bibliothèque et organise des conférences. Son libéralisme intellectuel provoque un conflit durable avec l’autorité catholique montréalaise.", ids("dessaulles")),
        fact("ms-networks-3", "À Québec, la librairie des frères Crémazie devient un lieu de rencontre pour plusieurs écrivains associés au mouvement littéraire de la ville.", ids("cremazie")),
        interpretation("ms-networks-4", "Une production culturelle dépend donc d’un réseau : l’auteur crée, mais les imprimeurs, libraires, journaux, associations, écoles et publics rendent l’œuvre visible et durable.", ids("dessaulles", "cremazie", "marchand")),
        nuance("ms-networks-5", "Ces réseaux ne sont ni neutres ni accessibles à tous. La richesse, l’alphabétisation, la langue, la religion, le sexe et la proximité d’un centre urbain influencent la participation.", ids("dessaulles", "conan", "marchand", "mlea")),
      ] },
      { id: "ms-mono-women", title: "1878-1896 — L’émergence d’une littérature féminine", purpose: "Montrer comment des auteures entrent dans le roman et la presse.", paragraphs: [
        fact("ms-women-1", "Félicité Angers publie sous le nom de Laure Conan. Angéline de Montbrun paraît d’abord en feuilleton au début des années 1880, puis en volume en 1884, et fait d’elle une figure majeure de l’émergence du roman féminin canadien-français.", ids("conan")),
        fact("ms-women-2", "Joséphine Marchand publie des contes et des pièces sous le pseudonyme de Josette avant de lancer à Montréal Le Coin du feu en janvier 1893.", ids("marchand")),
        fact("ms-women-3", "Le Coin du feu est la première revue canadienne de langue française dirigée par une femme et destinée spécialement aux femmes. Marchand y aborde la littérature, la famille, l’éducation intellectuelle des femmes, le féminisme et la politique.", ids("marchand")),
        interpretation("ms-women-4", "Le pseudonyme peut faciliter l’entrée dans un monde éditorial dominé par les hommes, mais il montre aussi les contraintes qui pèsent sur la reconnaissance publique d’une auteure.", ids("conan", "marchand")),
        nuance("ms-women-5", "Parler d’émergence ne suppose ni égalité ni rupture complète. Les auteures doivent composer avec les attentes religieuses, familiales et littéraires de leur milieu, et leur accès à la publication demeure exceptionnel.", ids("conan", "marchand")),
      ] },
      { id: "ms-mono-higher", title: "1852-1896 — Le développement de l’enseignement supérieur", purpose: "Suivre la création d’une université francophone et l’ouverture graduelle de l’université aux femmes.", paragraphs: [
        fact("ms-higher-1", "En 1852, une charte royale autorise le Séminaire de Québec à créer l’Université Laval et à conférer des grades. Laval devient la première université francophone en Amérique.", ids("laval", "lavalCharter")),
        fact("ms-higher-2", "L’Université Laval organise des facultés de théologie, de droit, de médecine et des arts. À partir de 1857, des conférences publiques complètent un enseignement régulier encore limité dans certains domaines.", ids("laval", "casault")),
        fact("ms-higher-3", "Jean-Baptiste-Antoine Ferland enseigne l’histoire du Canada à Laval, donne des conférences publiques et publie son Cours d’histoire du Canada en 1861 et 1865.", ids("ferland")),
        fact("ms-higher-4", "En 1878, l’Université Laval ouvre une succursale à Montréal. Cette implantation rapproche l’enseignement universitaire catholique francophone de la principale ville du Québec.", ids("laval")),
        fact("ms-higher-5", "Des femmes de la Montreal Ladies’ Educational Association suivent dès 1871 des cours de niveau universitaire sans être admises aux programmes ordinaires de McGill.", ids("mlea")),
        fact("ms-higher-6", "McGill admet des étudiantes en 1884, dans un cadre d’enseignement séparé, puis décerne en 1888 des baccalauréats à une première cohorte de femmes appelées les Donaldas.", ids("donaldas")),
        nuance("ms-higher-7", "L’expansion institutionnelle ne démocratise pas encore l’université. Les études supérieures demeurent surtout accessibles à une minorité favorisée, et l’accès varie selon le sexe, la langue, la religion, la préparation scolaire et le lieu de résidence.", ids("laval", "mlea", "donaldas")),
      ], tables: [
        { id: "ms-table-higher", title: "Repères de l’enseignement supérieur", introduction: "Le tableau distingue création institutionnelle, public visé et limites d’accès.", columns: ["Repère", "Apport", "Limite à retenir"], rows: [
          { ...statement("ms-row-laval", "La charte de 1852 crée une université francophone capable de conférer des grades.", ids("laval", "lavalCharter")), cells: ["Université Laval, 1852", "Enseignement universitaire francophone à Québec", "Institution catholique liée au Séminaire; accès socialement restreint"] },
          { ...statement("ms-row-branch", "La succursale montréalaise étend l’implantation de Laval en 1878.", ids("laval")), cells: ["Succursale de Montréal, 1878", "Présence universitaire francophone à Montréal", "Ne constitue pas encore l’Université de Montréal autonome"] },
          { ...statement("ms-row-mlea", "L’association offre des cours supérieurs aux femmes avant leur admission régulière.", ids("mlea")), cells: ["Montreal Ladies’ Educational Association, 1871-1885", "Cours, examens et certificats pour femmes", "Association surtout bourgeoise anglophone; pas encore de diplôme universitaire"] },
          { ...statement("ms-row-donaldas", "McGill admet les femmes en 1884 et diplôme une première cohorte en 1888.", ids("donaldas")), cells: ["McGill, 1884-1888", "Accès féminin au baccalauréat", "Enseignement séparé et accès limité à certains programmes"] },
        ] },
      ] },
      { id: "ms-mono-connections", title: "Culture, religion, langue et pouvoir", purpose: "Relier les trois précisions aux tensions sociales de la période.", paragraphs: [
        interpretation("ms-connections-1", "Les œuvres patriotiques participent au nationalisme de survivance lorsqu’elles associent la mémoire du passé à la défense de la langue et de la nation; elles peuvent toutefois porter des interprétations politiques ou religieuses différentes.", ids("garneau", "cremazie", "ferland")),
        interpretation("ms-connections-2", "L’Université Laval illustre le lien entre enseignement supérieur francophone et présence de l’Église catholique, tandis que McGill et les associations féminines anglophones appartiennent à d’autres réseaux linguistiques et confessionnels.", ids("laval", "casault", "mlea", "donaldas")),
        interpretation("ms-connections-3", "La littérature féminine et l’accès des femmes aux études supérieures se renforcent mutuellement : une formation plus avancée, des associations et une presse destinée aux femmes créent de nouveaux publics et de nouvelles auteures.", ids("conan", "marchand", "mlea", "donaldas")),
        nuance("ms-connections-4", "La culture étudiée ici est surtout celle que les institutions écrites ont conservée. Les traditions orales, populaires, ouvrières et autochtones sont moins visibles dans ces sources et ne doivent pas être considérées comme absentes.", ids("program", "gerinLajoie")),
      ] },
      { id: "ms-mono-balance", title: "Bilan — Une vie culturelle plus structurée, mais inégalement accessible", purpose: "Formuler les changements et les limites de 1840 à 1896.", paragraphs: [
        interpretation("ms-balance-1", "Entre 1840 et 1896, les œuvres patriotiques donnent une forme littéraire et musicale à la mémoire collective; des sociétés, des journaux et des librairies en assurent la diffusion.", ids("gerinLajoie", "garneau", "cremazie", "dessaulles")),
        interpretation("ms-balance-2", "Des femmes deviennent plus visibles comme romancières, journalistes et directrices de revue, sans que le milieu littéraire cesse d’être structuré par les normes de genre.", ids("conan", "marchand")),
        interpretation("ms-balance-3", "La fondation de Laval, son implantation montréalaise et l’admission des femmes à McGill élargissent l’enseignement supérieur, mais celui-ci demeure réservé à une minorité.", ids("laval", "mlea", "donaldas")),
        nuance("ms-balance-4", "La période ne correspond donc ni à une culture uniforme ni à une démocratisation complète. Elle voit plutôt se consolider des réseaux culturels et universitaires concurrents, marqués par la langue, la confession, le sexe et la classe sociale.", ids("dessaulles", "laval", "conan", "donaldas")),
      ] },
    ],
  },
  narrative: [
    fact("ms-narrative-union", "Après l’Union et les Rébellions, des œuvres patriotiques commémorent l’exil, racontent le passé et soutiennent l’identité canadienne-française.", ids("gerinLajoie", "garneau")),
    fact("ms-narrative-networks", "Les journaux, librairies, sociétés littéraires et instituts donnent aux œuvres des lieux de création et de diffusion.", ids("cremazie", "dessaulles")),
    fact("ms-narrative-laval", "L’Université Laval est créée par charte royale en 1852 et ouvre une succursale à Montréal en 1878.", ids("laval", "lavalCharter")),
    fact("ms-narrative-women", "Dans les années 1880 et 1890, Laure Conan et Joséphine Marchand rendent plus visible la présence des femmes dans le roman et la presse.", ids("conan", "marchand")),
    fact("ms-narrative-mcgill", "McGill admet des femmes en 1884 et diplôme une première cohorte en 1888.", ids("donaldas")),
    interpretation("ms-narrative-result", "La vie culturelle et universitaire se structure davantage, mais l’accès demeure inégal selon le sexe, la classe, la langue et la confession.", ids("laval", "conan", "mlea", "donaldas")),
  ],
  chronologicalMarkers: [
    { ...statement("ms-c-1842", "Antoine Gérin-Lajoie compose Un Canadien errant à la mémoire des exilés des Rébellions.", ids("gerinLajoie")), dateLabel: "1842", sortYear: 1842 },
    { ...statement("ms-c-1845", "Parution du premier volume de l’Histoire du Canada de François-Xavier Garneau.", ids("garneau")), dateLabel: "1845", sortYear: 1845 },
    { ...statement("ms-c-1852", "La charte royale crée l’Université Laval.", ids("laval", "lavalCharter")), dateLabel: "1852", sortYear: 1852 },
    { ...statement("ms-c-1858", "Première exécution publique du Drapeau de Carillon à Québec.", ids("cremazie", "carillon")), dateLabel: "1858", sortYear: 1858 },
    { ...statement("ms-c-1861", "Parution du premier volume du Cours d’histoire du Canada de Ferland.", ids("ferland")), dateLabel: "1861", sortYear: 1861 },
    { ...statement("ms-c-1871", "La Montreal Ladies’ Educational Association commence à offrir des cours supérieurs aux femmes.", ids("mlea")), dateLabel: "1871", sortYear: 1871 },
    { ...statement("ms-c-1878", "L’Université Laval ouvre une succursale à Montréal.", ids("laval")), dateLabel: "1878", sortYear: 1878 },
    { ...statement("ms-c-1884", "Angéline de Montbrun paraît en volume et McGill admet des étudiantes.", ids("conan", "donaldas")), dateLabel: "1884", sortYear: 1884 },
    { ...statement("ms-c-1888", "Une première cohorte féminine obtient le baccalauréat de McGill.", ids("donaldas")), dateLabel: "1888", sortYear: 1888 },
    { ...statement("ms-c-1893", "Joséphine Marchand lance Le Coin du feu à Montréal.", ids("marchand")), dateLabel: "1893", sortYear: 1893 },
  ],
  actors: [
    { ...statement("ms-a-garneau", "Historien et poète qui écrit une histoire nationale canadienne-française.", ids("garneau")), actorType: "person", name: "François-Xavier Garneau" },
    { ...statement("ms-a-gerin", "Auteur d’Un Canadien errant, chanson consacrée aux exilés des Rébellions.", ids("gerinLajoie")), actorType: "person", name: "Antoine Gérin-Lajoie" },
    { ...statement("ms-a-cremazie", "Poète, libraire et animateur d’un réseau littéraire québécois.", ids("cremazie", "carillon")), actorType: "person", name: "Octave Crémazie" },
    { ...statement("ms-a-conan", "Romancière et journaliste connue sous le nom de Laure Conan.", ids("conan")), actorType: "person", name: "Félicité Angers, dite Laure Conan" },
    { ...statement("ms-a-marchand", "Écrivaine, journaliste et fondatrice du Coin du feu.", ids("marchand")), actorType: "person", name: "Joséphine Marchand-Dandurand" },
    { ...statement("ms-a-laval", "Première université francophone en Amérique, créée à Québec en 1852.", ids("laval", "lavalCharter")), actorType: "institution", name: "Université Laval" },
    { ...statement("ms-a-mcgill", "Université anglophone qui admet des étudiantes à partir de 1884.", ids("mlea", "donaldas")), actorType: "institution", name: "Université McGill" },
  ],
  territories: [
    statement("ms-t-quebec", "Québec est le siège de l’Université Laval et un centre important de librairie, de poésie, d’histoire et de conférences publiques.", ids("cremazie", "laval", "casault")),
    statement("ms-t-montreal", "Montréal concentre McGill, l’Institut canadien, la succursale de Laval, des associations féminines et une presse en expansion.", ids("dessaulles", "laval", "mlea", "marchand")),
    statement("ms-t-canada-east", "Le Canada-Est forme avant 1867 le cadre politique où se diffusent plusieurs œuvres patriotiques canadiennes-françaises.", ids("gerinLajoie", "garneau")),
  ],
  relationships: [
    { ...statement("ms-r-union", "L’Union et la répression des Rébellions stimulent des œuvres qui entretiennent la mémoire des exilés et affirment l’existence nationale des Canadiens français.", ids("gerinLajoie", "garneau")), relationshipType: "cause", relatedKnowledgeHeadingIds: ["acte-union"] },
    { ...statement("ms-r-church", "L’Université Laval et une partie de l’historiographie s’inscrivent dans des institutions catholiques, tandis que l’Institut canadien illustre les conflits entre libéralisme intellectuel et autorité ecclésiale.", ids("laval", "ferland", "dessaulles")), relationshipType: "connection", relatedKnowledgeHeadingIds: ["presence-de-l-eglise-catholique"] },
    { ...statement("ms-r-women", "L’éducation supérieure, les associations et la presse contribuent à rendre les femmes plus visibles comme étudiantes, auteures et journalistes.", ids("mlea", "donaldas", "conan", "marchand")), relationshipType: "change", relatedKnowledgeHeadingIds: ["role-des-femmes"] },
    { ...statement("ms-r-national", "Les œuvres patriotiques soutiennent des formes de nationalisme qui réagissent aux transformations politiques de la période.", ids("garneau", "cremazie", "ferland")), relationshipType: "connection", relatedKnowledgeHeadingIds: ["relations-federales-provinciales"] },
  ],
  vocabulary: [
    { ...statement("ms-v-patriotic", "Œuvre qui célèbre, commémore ou défend une collectivité, son histoire et ses symboles.", ids("gerinLajoie", "garneau", "cremazie")), term: "Œuvre patriotique" },
    { ...statement("ms-v-memory", "Représentation partagée du passé construite par des récits, des commémorations, des chansons et des symboles.", ids("gerinLajoie", "garneau")), term: "Mémoire collective" },
    { ...statement("ms-v-pseudonym", "Nom d’emprunt utilisé par une personne qui publie une œuvre.", ids("conan", "marchand")), term: "Pseudonyme" },
    { ...statement("ms-v-serial", "Publication d’une œuvre en épisodes successifs dans un journal ou une revue avant ou sans édition en volume.", ids("conan")), term: "Feuilleton" },
    { ...statement("ms-v-higher", "Formation avancée offerte par des établissements autorisés à organiser des facultés et à conférer des grades.", ids("lavalCharter", "laval")), term: "Enseignement supérieur" },
  ],
  misconceptions: [
    { ...statement("ms-m-patriotic", "La chanson, le poème et l’histoire diffusent chacun le patriotisme par des moyens et auprès de publics différents.", ids("gerinLajoie", "garneau", "cremazie")), misconception: "Une œuvre patriotique est nécessairement un discours politique officiel." },
    { ...statement("ms-m-uniform", "Garneau, Ferland, Crémazie et les instituts ne proposent pas une interprétation unique de la nation, de la religion ou du libéralisme.", ids("garneau", "ferland", "cremazie", "dessaulles")), misconception: "Toute la culture canadienne-française exprime la même idéologie." },
    { ...statement("ms-m-women", "Laure Conan et Joséphine Marchand rendent les femmes plus visibles dans l’imprimé, mais elles ne sont ni les premières femmes à écrire ni la preuve d’une égalité acquise.", ids("conan", "marchand")), misconception: "La littérature féminine naît soudainement avec une seule auteure." },
    { ...statement("ms-m-laval", "La succursale montréalaise ouverte en 1878 demeure rattachée à Laval et ne devient autonome qu’au XXe siècle.", ids("laval")), misconception: "L’Université de Montréal autonome est fondée en 1878." },
    { ...statement("ms-m-mcgill", "L’admission des étudiantes à McGill en 1884 se fait dans un cadre séparé et ne rend pas tous les programmes accessibles.", ids("donaldas")), misconception: "Les femmes obtiennent une égalité universitaire complète en 1884." },
    { ...statement("ms-m-democratic", "L’université demeure réservée à une minorité qui possède la préparation scolaire et les ressources nécessaires.", ids("laval", "mlea", "donaldas")), misconception: "La création d’universités rend immédiatement les études supérieures accessibles à toute la population." },
  ],
  expectedLearning: [
    objective("ms-e-three", "Définir et distinguer les trois précisions officielles de la notion.", ids("program", "garneau", "conan", "laval"), "Rubrique officielle « Manifestations socioculturelles » du programme de quatrième secondaire.", ["Œuvres patriotiques", "Littérature féminine", "Enseignement supérieur"], ["establish_facts", "differences_and_similarities"]),
    objective("ms-e-works", "Comparer la chanson, la poésie et l’histoire comme formes de diffusion d’une mémoire patriotique.", ids("gerinLajoie", "garneau", "cremazie", "carillon"), "Précision officielle « Œuvres patriotiques ».", ["Un Canadien errant", "Histoire du Canada", "Le Drapeau de Carillon"], ["differences_and_similarities", "relationships_between_facts"]),
    objective("ms-e-context", "Expliquer le lien entre l’Union, les Rébellions et la production d’œuvres patriotiques.", ids("gerinLajoie", "garneau"), "Contexte politique et culturel de la période 1840-1896.", ["Exil", "Union", "Mémoire", "Identité"], ["causal_connections", "causes_and_consequences"]),
    objective("ms-e-networks", "Établir le rôle des librairies, journaux, sociétés et instituts dans la diffusion des œuvres et des idées.", ids("cremazie", "dessaulles", "marchand"), "Conditions de production et de diffusion culturelles.", ["Imprimé", "Association", "Bibliothèque", "Public"], ["relationships_between_facts", "causal_connections"]),
    objective("ms-e-women", "Expliquer deux manifestations de l’émergence de la littérature féminine et une contrainte vécue par les auteures.", ids("conan", "marchand"), "Précision officielle « Émergence de la littérature féminine ».", ["Roman", "Presse", "Pseudonyme", "Publication"], ["establish_facts", "changes_and_continuities"]),
    objective("ms-e-higher", "Situer les principales étapes du développement de l’enseignement supérieur entre 1852 et 1888.", ids("laval", "lavalCharter", "mlea", "donaldas"), "Précision officielle « Enseignement supérieur ».", ["Université Laval", "Succursale de Montréal", "Cours féminins", "McGill"], ["time_and_space", "changes_and_continuities"]),
    objective("ms-e-access", "Comparer l’apport et les limites d’accès de Laval, de la Montreal Ladies’ Educational Association et de McGill.", ids("laval", "mlea", "donaldas"), "Développement institutionnel et inégalités d’accès.", ["Langue", "Religion", "Sexe", "Classe sociale"], ["differences_and_similarities", "relationships_between_facts"]),
    objective("ms-e-balance", "Formuler un bilan nuancé de la structuration de la vie culturelle et universitaire entre 1840 et 1896.", ids("garneau", "dessaulles", "conan", "laval", "donaldas"), "Bilan des changements et continuités de la période.", ["Réseaux", "Institutions", "Accès", "Diversité"], ["changes_and_continuities", "causes_and_consequences"]),
  ],
  sourceCatalog: Object.values(SOURCES),
  editorialNotes: "Première rédaction complète de la monographie. Les œuvres sont étudiées comme créations et comme objets diffusés par des réseaux. À soumettre à la validation historique et pédagogique avant approbation.",
  version: null,
  approvedAt: null,
};

import type { MigrationsSchemaFieldId } from "./migrations-partie-b.ts";

// Importé uniquement par la page enseignant authentifiée. Aucun corrigé dans le composant élève.
export const MIGRATIONS_CORRECTION: Record<MigrationsSchemaFieldId, { answer: string; criteria: string; documents: number[] }> = {
  object: {
    answer: "Les migrations ou les mouvements migratoires.",
    criteria: "2 points : notion générale exacte. 1 point : réponse partielle, par exemple seulement l’immigration ou l’émigration. 0 point : autre phénomène, réponse incorrecte ou absence de réponse.",
    documents: [],
  },
  us_destination: {
    answer: "La Nouvelle-Angleterre, une région du nord-est des États-Unis.",
    criteria: "La région attendue est la Nouvelle-Angleterre. « Les États-Unis » seul indique le pays, mais ne précise pas la région : réponse plus ou moins correcte. « Le nord-est des États-Unis » ou une ville comme Boston seule sont également des réponses plus ou moins précises. Accepter toute formulation équivalente qui identifie clairement la Nouvelle-Angleterre.",
    documents: [2],
  },
  us_causes: {
    answer: "Une seule cause suffit : l’endettement, les mauvaises récoltes, les difficultés agricoles ou les difficultés d’accès aux marchés. Accepter aussi le manque de terres accessibles ou l’attrait des emplois industriels américains si la réponse est historiquement exacte.",
    criteria: "La cause doit se rattacher à l’émigration. Une formulation précise comme « les mauvaises récoltes » suffit; ne pas exiger deux causes ni un développement de section C. Le document 5 présente des facteurs de départ, pas les salaires américains.",
    documents: [5],
  },
  colonization: {
    answer: "L’ouverture ou la promotion de régions de colonisation au Québec pour y établir des familles, par exemple dans les Laurentides, au Saguenay–Lac-Saint-Jean ou en Outaouais.",
    criteria: "Accepter une mesure concrète et pertinente comme l’aménagement de chemins de colonisation ou l’offre de terres dans ces régions. Le nom du curé Labelle seul ne décrit pas une mesure. La colonisation de l’Ouest canadien ne répond pas à l’objectif de retenir des familles au Québec.",
    documents: [7],
  },
  transatlantic: {
    answer: "L’Irlande est la réponse illustrée par le dossier. Accepter aussi l’Angleterre, l’Écosse ou le Royaume-Uni, ainsi que tout autre pays d’origine historiquement attesté pour un important groupe d’immigrants au Québec durant les années 1840.",
    criteria: "L’Irlande est le pays documenté, mais elle n’est pas la seule réponse recevable. L’Angleterre, l’Écosse et le Royaume-Uni sont acceptés comme origines britanniques; le Royaume-Uni inclut alors l’Irlande. Accepter également un autre pays si l’existence d’un important groupe immigrant au Québec dans les années 1840 est historiquement attestée. Ne pas refuser une réponse exacte au seul motif qu’elle n’apparaît pas dans le dossier. Évaluer le pays indépendamment des deux précisions, puis vérifier que l’événement de départ et la mesure à l’arrivée correspondent au groupe nommé. « Les îles Britanniques » est plus ou moins précis pour une question qui demande un pays; « l’Europe » est trop vague.",
    documents: [4],
  },
  famine: {
    answer: "La Grande Famine en Irlande, à partir de 1845, liée à la destruction des récoltes de pommes de terre.",
    criteria: "Pour l’Irlande, le nom de la Grande Famine suffit; la date et le mildiou ne sont pas exigés. Si l’élève nomme un autre pays recevable dans l’élément central, accepter un autre événement de départ historiquement attesté, compatible avec ce groupe et les années 1840; ne pas exiger la famine irlandaise pour tous les pays. L’événement doit correspondre au groupe nommé dans l’élément central. « La pauvreté » seule n’identifie pas l’événement demandé.",
    documents: [4],
  },
  quarantine: {
    answer: "La mise en quarantaine à Grosse-Île, la séparation des passagers en santé et des malades, les déplacements soumis à autorisation ou l’hospitalisation des malades.",
    criteria: "Une seule mesure concrète et historiquement exacte appliquée aux immigrants à leur arrivée suffit. « Grosse-Île » seul est un lieu, pas une mesure. Accepter les mesures de quarantaine et d’isolement attestées dans le document 9, ainsi que l’inspection médicale si l’élève mobilise ses connaissances. Ne pas exiger plusieurs mesures ni une durée d’isolement qui n’est pas donnée dans cet extrait.",
    documents: [9],
  },
};

export const MIGRATIONS_DOCUMENT_FEEDBACK: Record<number, { useful: boolean; explanation: string }> = {
  1: { useful: false, explanation: "Le chantier du pont Victoria illustre les transports, sans préciser les migrations ni les interventions demandées dans les cases." },
  2: { useful: true, explanation: "Les flèches montrent des déplacements du sud du Québec vers le nord-est des États-Unis. Les connaissances de l’élève permettent de nommer la Nouvelle-Angleterre, dont le nom est retiré de la carte. Il s’agit d’une carte pédagogique de Socrato, et non d’une source d’époque; les flèches schématiques ne mesurent pas le nombre d’émigrants." },
  3: { useful: false, explanation: "Cette publicité de 1892 encourage l’établissement au Manitoba et dans l’Ouest canadien. Elle appartient à la période étudiée, mais ne décrit pas une mesure destinée à retenir les familles au Québec. Elle ne répond pas non plus à la question sur la destination américaine ni aux questions sur l’immigration irlandaise des années 1840." },
  4: { useful: true, explanation: "La gravure de Clonakilty représente une scène de la Grande Famine; le pays n’est pas écrit dans sa présentation à l’élève. Les connaissances de l’élève permettent de situer Clonakilty en Irlande. La mendicité représentée illustre la détresse de la population; les connaissances de l’élève complètent le lien avec les départs. Un même document peut soutenir deux cases." },
  5: { useful: true, explanation: "Le rapport de 1849 nomme des causes de départ : endettement, mauvaises récoltes, difficultés agricoles et éloignement des marchés." },
  6: { useful: false, explanation: "La migration loyaliste de Boston vers Halifax se situe vers 1776, hors de la période étudiée et dans un autre contexte." },
  7: { useful: true, explanation: "La carte des cantons proposés à la colonisation soutient l’ouverture de régions d’établissement au Québec. La finalité de retenir des familles se complète par les connaissances de l’élève." },
  8: { useful: false, explanation: "Le rapport sur les logements de 1946 appartient à une autre période et ne décrit pas les déplacements demandés." },
  9: { useful: true, explanation: "Dans sa lettre de 1848, Lord Elgin décrit la séparation des passagers en santé et des malades, l’autorisation nécessaire pour changer de section et l’hospitalisation afin de limiter la propagation de la fièvre. Le document atteste des mesures de quarantaine appliquées à Grosse-Île." },
  10: { useful: false, explanation: "Le tableau renseigne sur l’urbanisation, mais aucune case ne demande ici l’exode rural. Il ne prouve pas à lui seul le déplacement des campagnes vers les villes et n’établit ni une destination étrangère ni une cause de départ." },
};

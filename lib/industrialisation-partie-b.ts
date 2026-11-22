export const INDUSTRIALISATION_ACTIVITY_ID = "industrialisation-partie-b-v1";
export const INDUSTRIALISATION_TITLE = "La production et le monde ouvrier au Québec, 1840-1896";
export const INDUSTRIALISATION_INSTRUCTION = "Décrivez les transformations de la production et de la condition ouvrière au Québec entre 1840 et 1896. Complétez le schéma à l’aide de vos connaissances et des documents pertinents. Pour chaque document, choisissez « Utile » ou « À discriminer » selon la période étudiée.";
export const SCHEMA_FIELDS = [
  {
    "id": "object",
    "prompt": "Nommez le phénomène économique qui transforme la société québécoise entre 1840 et 1896.",
    "answer": "La première phase d’industrialisation."
  },
  {
    "id": "central1",
    "prompt": "Indiquez une transformation dans la façon dont les ouvriers se regroupent pour défendre leurs intérêts à cette époque.",
    "answer": "Les ouvriers forment des syndicats et développent le mouvement ouvrier."
  },
  {
    "id": "detail1",
    "prompt": "Indiquez une condition de travail qui pousse les ouvriers à s’organiser.",
    "answer": "Travail des enfants, faibles salaires ou amendes imposées aux apprentis (document 4), ou longues journées : Adèle Lavoie commence à 6 h 30 et termine à 18 h 15 ou à 19 h 15 (document 9)."
  },
  {
    "id": "detail2",
    "prompt": "Nommez une forme d’action ouvrière.",
    "answer": "La grève (document 8)."
  },
  {
    "id": "central2",
    "prompt": "Indiquez une transformation dans l’organisation de la production des biens au Québec.",
    "answer": "La production se concentre dans des manufactures plutôt que dans de petits ateliers artisanaux."
  },
  {
    "id": "detail3",
    "prompt": "Indiquez dans quel type de milieu se concentre la production industrielle.",
    "answer": "Le milieu urbain : les villes, notamment Montréal, où se regroupent des établissements industriels près du canal de Lachine (documents 2 et 5)."
  },
  {
    "id": "detail4",
    "prompt": "Indiquez une infrastructure qui favorise le développement de la production industrielle à Montréal.",
    "answer": "Le canal de Lachine (document 5)."
  }
] as const;
export type SchemaFieldId = (typeof SCHEMA_FIELDS)[number]["id"];
export type AnswerFeedback = { status: "recognized" | "partial" | "review"; label: string; message: string };
// Conservative local assistance, not a semantic grade. Ambiguous or negative
// statements must never pass solely because they contain a target keyword.
const LOCAL_ANSWER_RULES: Record<SchemaFieldId, { accepted: RegExp[]; related: RegExp; hint: string }> = {
  object: {
    accepted: [/\bindustrialisation\b/, /\brevolution industrielle\b/],
    related: /\b(usines?|machines?|urbanisation|industrie)\b/,
    hint: "Nommez le phénomène économique, plutôt qu’un de ses effets ou un équipement."
  },
  central1: {
    accepted: [/\bsyndicalisme\b/, /\bmouvement ouvrier\b/, /\b(developpement|essor|apparition).{0,35}(syndicats?|organisations? ouvrieres?|organisations? syndicales?)\b/],
    related: /\b(syndicats?|ouvriers?|travailleurs?|organisation collective|greves?)\b/,
    hint: "Précisez la transformation : le développement du mouvement ouvrier et du syndicalisme."
  },
  detail1: {
    accepted: [/\btravail des enfants\b/, /\benfants.{0,25}travaill/, /\b(longues? journees?|longs? horaires?)\b/, /\bjournees? (de travail )?(longues?|de (1[0-6]|dix|onze|douze|treize|quatorze) heures)\b/, /\b(salaires? (faibles?|bas|insuffisants?)|faibles? salaires?|mal payes?)\b/, /\b(punitions? corporelles?|coups|battus?|battues?|violence physique)\b/, /\b(conditions? dangereuses?|risques? d accidents?|accidents? de travail|amendes)\b/],
    related: /\b(difficiles?|mauvaises?|dures?|enfants|heures|salaires?|danger)\b/,
    hint: "Décrivez une condition concrète : travail des enfants, longues journées, faible salaire ou danger, par exemple."
  },
  detail2: {
    accepted: [/\bgreves?\b/, /\bfaire (la |une )?greve\b/],
    related: /\b(protestations?|mobilisations?|manifestations?|actions? collectives?|ouvriers?|travailleurs?)\b/,
    hint: "Nommez une action précise menée collectivement par les ouvriers : la grève."
  },
  central2: {
    accepted: [/\b(concentration|regroupement).{0,45}(production|activites?).{0,45}(usines?|manufactures?)\b/, /\b(production|fabrication).{0,30}(usines?|manufactures?)\b/, /\b(passage|transition).{0,45}(ateliers?|artisanat|production artisanale).{0,55}(usines?|manufactures?|production industrielle)\b/, /\b(developpement|essor|multiplication).{0,35}(usines?|manufactures?)\b/],
    related: /\b(production|usines?|manufactures?|ateliers?|artisanat|industrie)\b/,
    hint: "Précisez comment la production s’organise : elle se concentre dans des manufactures plutôt que dans de petits ateliers artisanaux."
  },
  detail3: {
    accepted: [/\b(villes?|urbain|urbaine|urbains|urbaines)\b/],
    related: /\b(montreal|quebec|usines?|manufactures?|lachine)\b/,
    hint: "Nommez le type de milieu : un nom de ville ou de bâtiment seul ne suffit pas à le préciser."
  },
  detail4: {
    accepted: [/\bcanal de lachine\b/, /\bcanal lachine\b/],
    related: /\b(canal|canaux|lachine|voie navigable|infrastructures?|ports?|chemins? de fer)\b/,
    hint: "Nommez l’infrastructure montréalaise appuyée par le document 5 : le canal de Lachine."
  }
};
export function assessIndustrialisationAnswer(id: SchemaFieldId, answer: string): AnswerFeedback {
  const text = answer.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[’']/g, " ").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const rule = LOCAL_ANSWER_RULES[id];
  const review = (message: string): AnswerFeedback => ({ status: "review", label: "À vérifier", message });
  if (!text) return review("Aucune réponse à vérifier.");
  if (text.length > 260 || /\b(ne|n|pas|non|aucun|aucune|jamais|sans|sauf|contraire|plutot|mais|ou|peut etre|sais|refuse|refusent|refuser)\b/.test(text)) return review("Votre formulation demande une lecture humaine : comparez-la au corrigé ou faites-la valider par l’enseignant.");
  if (/\b(rural|rurale|campagnes?|agriculture|agricole|bourgeoisie|patrons?|esclaves?|deuxieme|seconde|electricite|ordinateurs?|robots?)\b/.test(text)) return review("Vérifiez le groupe, le milieu ou la période évoqués : cette formulation ne peut pas être validée automatiquement.");
  const longWorkingDay = id === "detail1" && /\b(travaille|travaillent|travailler) (pendant |jusqu a |plus de |environ )?(1[0-6]|dix|onze|douze|treize|quatorze|quinze|seize) heures (par jour|chaque jour|quotidiennement)\b/.test(text);
  if (rule.accepted.some(pattern => pattern.test(text)) || longWorkingDay) return { status: "recognized", label: "Réponse reconnue", message: "Votre réponse contient une formulation attendue pour cette case. Cette reconnaissance locale ne garantit pas la justesse de toute la phrase." };
  if (rule.related.test(text)) return { status: "partial", label: "À préciser", message: rule.hint };
  return review("Cette formulation n’est pas reconnue; elle n’est pas nécessairement fausse. Comparez-la à la piste de réponse ou consultez l’enseignant.");
}
export type DocumentChoice = "" | "direct" | "exclude";
export type IndustrialisationDraft = { answers: Record<SchemaFieldId, string>; choices: Record<string, DocumentChoice>; submitted: boolean };
export const INDUSTRIALISATION_DOCUMENTS = [
  {
    "number": 1,
    "date": "HOCHELAGA, ANNÉES 1870",
    "title": "Les machines de la filature Hudon",
    "excerpt": "À la filature Hudon, trois cents métiers à tisser occupent le premier étage, tandis que les deux étages suivants abritent les fuseaux servant à filer le coton. Un bâtiment distinct, à l’arrière de la filature, contient six chaudières alimentant une machine à vapeur d’une puissance de six cents chevaux. Le charbon utilisé pour produire cette vapeur impose l’installation d’une haute cheminée, qui domine les environs de l’établissement.",
    "note": "",
    "source": "Texte adapté de « La filature Hudon », Encyclopédie du MEM, 6 décembre 2017, Atelier d’histoire Mercier-Hochelaga-Maisonneuve, avec André Cousineau. Source secondaire : reformulation de la notice historique, non citation d’époque.",
    "links": [
      {
        "url": "https://ville.montreal.qc.ca/memoiresdesmontrealais/la-filature-hudon",
        "label": "MEM — La filature Hudon"
      }
    ]
  },
  {
    "number": 2,
    "date": "MONTRÉAL, 1896",
    "title": "Vue de Montréal",
    "note": "Photographie prise depuis la cheminée de la centrale de la Montreal Street Railway, en 1896.",
    "source": "Source primaire : Wm. Notman & Son, Vue de Montréal depuis la cheminée de la centrale de la Montreal Street Railway, 1896. Musée McCord Stewart, Archives photographiques Notman, VIEW-2944. Plaque sèche à la gélatine. Image du domaine public, reproduite via Wikimedia Commons.",
    "image": {
      "url": "https://upload.wikimedia.org/wikipedia/commons/f/f5/Canal_Lachine_Montreal_1896.jpg",
      "alt": "Vue d’ensemble de Montréal autour du canal de Lachine en 1896 : bâtiments, installations industrielles et cheminées dans le paysage urbain.",
      "width": 741,
      "height": 523
    },
    "links": [
      {
        "url": "https://collections.musee-mccord-stewart.ca/en/collection/artifacts/VIEW-2944",
        "label": "Musée McCord Stewart — VIEW-2944"
      },
      {
        "url": "https://commons.wikimedia.org/wiki/File:Canal_Lachine_Montreal_1896.jpg",
        "label": "Photographie et droits de reproduction"
      }
    ]
  },
  {
    "number": 3,
    "date": "QUÉBEC, À PARTIR DE 1963",
    "title": "Le regroupement des entreprises électriques",
    "excerpt": "À compter de 1963, Hydro-Québec prend en charge de grands distributeurs d’électricité privés, ainsi que des réseaux municipaux et coopératifs. Ce regroupement rassemble près de quatre-vingts entreprises au sein de la société d’État. Cette deuxième nationalisation permet de réunir la production, le transport et la distribution de l’électricité afin d’uniformiser les tarifs à l’échelle du Québec.",
    "note": "",
    "source": "Texte adapté de Hydro-Québec, Une dimension panquébécoise; reformulation, non citation littérale.",
    "links": [
      {
        "url": "https://www.hydroquebec.com/histoire-electricite-au-quebec/grandes-periodes/1963-une-dimension-panquebecoise.html",
        "label": "Hydro-Québec, Une dimension panquébécoise"
      }
    ]
  },
  {
    "number": 4,
    "date": "MONTRÉAL, RAPPORT DE 1889",
    "title": "Le salaire et les amendes d’un jeune apprenti",
    "excerpt": "« J’ai commencé mon apprentissage à douze ans. L’entente prévoyait 1 $ par semaine la première année, 2 $ la deuxième et 3 $ la troisième. Une semaine, j’avais gagné 1,60 $, mais j’ai reçu une amende de 1,75 $ après avoir travaillé dix heures par jour [et sept heures le samedi]. À la fin de la semaine, je devais donc 15 cents à mon employeur. »",
    "note": "Réponses de Ferdinand Brissette, fabricant de cigares âgé de 17 ans, aux questions des commissaires. Traduction française et regroupement pédagogique de ses réponses; l’ajout entre crochets précise l’horaire du samedi.",
    "source": "Source primaire : témoignage de Ferdinand Brissette devant la Commission royale d’enquête sur les relations entre le capital et le travail, Montréal, rapport publié à Ottawa en 1889, Evidence — Quebec, part I, p. 28 (page 30 du PDF).",
    "links": [
      {
        "url": "https://publications.gc.ca/collections/collection_2024/bcp-pco/Z1-1886-1-31-3-eng.pdf?wbdisable=true#page=30",
        "label": "Commission royale de 1889 — témoignage de Ferdinand Brissette, p. 28"
      }
    ]
  },
  {
    "number": 5,
    "date": "MONTRÉAL, XIXᵉ SIÈCLE",
    "title": "Le canal de Lachine",
    "excerpt": "Le canal de Lachine offre aux navires un passage qui contourne les rapides du Saint-Laurent et fournit aux industries une force motrice tirée de l’eau. Ses rives accueillent des manufactures aux productions variées et deviennent, dès le milieu du XIXe siècle, un important centre industriel canadien.",
    "note": "",
    "source": "Texte adapté de Parcs Canada, Canal-de-Lachine; reformulation, non citation littérale.",
    "links": [
      {
        "url": "https://www.pc.gc.ca/apps/dfhd/page_nhs_fra.aspx?id=627",
        "label": "Parcs Canada, Canal-de-Lachine"
      }
    ]
  },
  {
    "number": 6,
    "date": "CANADA, 1881-1891",
    "title": "La population urbaine",
    "note": "Chiffres de la synthèse de l’Annuaire de 1892; définitions historiques. Ils concernent le Canada entier, et non le Québec seul.",
    "source": "Source : Statistique Canada, Le Canada en statistiques, 1892. Mise en tableau pédagogique.",
    "links": [
      {
        "url": "https://www65.statcan.gc.ca/acyb07/acyb07_0005-fra.htm",
        "label": "Statistique Canada, Le Canada en statistiques, 1892"
      }
    ],
    "table": {
      "headers": [
        "Année",
        "Part urbaine"
      ],
      "rows": [
        [
          "1881",
          "21,1 %"
        ],
        [
          "1891",
          "28,7 %"
        ]
      ]
    }
  },
  {
    "number": 7,
    "date": "SAINT-JEAN-SUR-RICHELIEU, 1941-1943",
    "title": "Une travailleuse chez Singer",
    "excerpt": "Au cours de la Deuxième Guerre mondiale, l’établissement Singer de Saint-Jean-sur-Richelieu réoriente sa production de machines à coudre vers les munitions et recrute davantage de travailleuses. Lorida Landry Langlois quitte son poste de bureau pour participer à cette production dans l’usine. Elle y vérifie des détonateurs de bombes, puis cesse d’y travailler à son mariage, en 1943.",
    "note": "",
    "source": "Texte adapté du Musée canadien de la guerre, Lorida Landry Langlois; reformulation, non citation littérale. Récit historique sur son emploi pendant la Deuxième Guerre mondiale.",
    "links": [
      {
        "url": "https://www.museedelaguerre.ca/wp-content/uploads/2024/01/T5.3.5-PS-Fr-Langlois.pdf",
        "label": "Musée canadien de la guerre, Lorida Landry Langlois"
      }
    ]
  },
  {
    "number": 8,
    "date": "CANADA, 1872",
    "title": "Une mobilisation de travailleurs",
    "excerpt": "En 1872, des ouvriers dont les journées dépassent souvent dix heures se mobilisent pour limiter le travail quotidien à neuf heures. À Toronto, les responsables d’une grève sont arrêtés, car l’organisation syndicale se heurte alors à la loi.",
    "note": "",
    "source": "Texte adapté de Patrimoine canadien, 150ᵉ anniversaire du Mouvement pour une journée de travail de neuf heures; reformulation, non citation littérale.",
    "links": [
      {
        "url": "https://www.canada.ca/fr/patrimoine-canadien/services/anniversaires-importance/2022.html",
        "label": "Patrimoine canadien, 150ᵉ anniversaire du Mouvement pour une journée de travail de neuf heures"
      }
    ]
  },
  {
    "number": 9,
    "date": "16 FÉVRIER 1888",
    "title": "L’horaire décrit par Adèle Lavoie",
    "note": "Adèle Lavoie, 19 ans, employée de la manufacture de coton Sainte-Anne. Mise en tableau de son témoignage, avec les heures au format de 24 heures. Ce sont les bornes de la journée, non la durée nette travaillée : les pauses ne sont pas déduites.",
    "source": "Source primaire : Rapport de la Commission royale sur les relations du travail avec le capital au Canada, Ottawa, 1889, partie I, Témoignages — Québec, p. 311-313. Transcription : RÉCIT de l’univers social, d’après Michel Brunet, Histoire du Canada par les textes, tome II, 1963, p. 49-50.",
    "links": [
      {
        "url": "https://documents.recitus.qc.ca/dossiers/document/contexte-temoignage-d-adele-lavoie",
        "label": "Transcription : RÉCIT de l’univers social"
      }
    ],
    "table": {
      "headers": [
        "Repère",
        "Heure"
      ],
      "rows": [
        [
          "Début de la journée",
          "6 h 30"
        ],
        [
          "Fin sans travail du soir",
          "18 h 15"
        ],
        [
          "Fin avec travail du soir",
          "19 h 15"
        ]
      ]
    }
  },
  {
    "number": 10,
    "date": "QUÉBEC, 1925-1927",
    "title": "Une invention d’Arthur Sicard",
    "excerpt": "Arthur Sicard met au point une souffleuse à neige en 1925. Deux ans plus tard, Outremont devient la première municipalité à acheter son appareil de déneigement. En février 1927, les élus montréalais permettent également au service municipal des travaux publics d’essayer une machine fabriquée par l’inventeur.",
    "note": "",
    "source": "Texte adapté des Archives de Montréal, Arthur Sicard, Mario Robert, 2013; reformulation, non citation littérale.",
    "links": [
      {
        "url": "https://archivesdemontreal.com/2013/02/15/arthur-sicard-1876-1946-inventeur-de-la-souffleuse-a-neige/",
        "label": "Archives de Montréal, Arthur Sicard"
      }
    ]
  }
] as const;
export function emptyIndustrialisationDraft(): IndustrialisationDraft {
 return { answers: Object.fromEntries(SCHEMA_FIELDS.map(({id})=>[id,""])) as Record<SchemaFieldId,string>, choices: {}, submitted:false };
}
export function restoreIndustrialisationDraft(raw: unknown): IndustrialisationDraft {
 const draft=emptyIndustrialisationDraft();
 if(!raw || typeof raw!=="object") return draft;
 const value=raw as Record<string,unknown>;
 const record=(item:unknown): Record<string,unknown> => item && typeof item==="object" && !Array.isArray(item) ? item as Record<string,unknown> : {};
 for(const {id} of SCHEMA_FIELDS) { const text=record(value.answers)[id]; if(typeof text==="string") draft.answers[id]=text.slice(0,2000); }
 for(const doc of INDUSTRIALISATION_DOCUMENTS) {
 const choice=record(value.choices)[doc.number]; if(choice==="direct"||choice==="exclude") draft.choices[doc.number]=choice;
 if(choice==="context") draft.choices[doc.number]="direct";
 }
 draft.submitted=value.submitted===true && industrialisationMissingCount(draft)===0;
 return draft;
}
export function industrialisationMissingCount(draft: IndustrialisationDraft) {
 return SCHEMA_FIELDS.filter(({id})=>!draft.answers[id].trim()).length + INDUSTRIALISATION_DOCUMENTS.filter(({number})=>!draft.choices[number]).length;
}
export function expectedDocumentChoice(number: number): Exclude<DocumentChoice,""> { return [3,7,10].includes(number)?"exclude":"direct"; }
export const EXCLUDED_DOCUMENT_REASONS: Record<number,string> = {3:"1963 : Révolution tranquille.",7:"1941-1943 : Deuxième Guerre mondiale.",10:"1925-1927 : après la période 1840-1896."};

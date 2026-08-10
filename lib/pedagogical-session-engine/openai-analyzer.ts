import type { ResponseAnalyzer } from "./ports.ts";
import type { PedagogicalQuestionDefinition, StructuredResponseAnalysis, StudentResponse } from "./types.ts";
import { validateStructuredAnalysis } from "./validation.ts";
import { isExplicitHelpRequest } from "./help-request.ts";
import { PEDAGOGICAL_ANALYSIS_CONTRACT_V2 } from "./pedagogical-contract-v2.ts";

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export type OpenAIPedagogicalAnalyzerOptions = {
  apiKey: string;
  model: string;
  fetch?: FetchLike;
  endpoint?: string;
  contractVersion?: "v1" | "v2";
};

const ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "responseDisposition", "pedagogicalOutcome", "historicalAccuracy", "documentUse",
    "justificationQuality", "primaryOperationPerformance", "demonstratedKnowledgeIds",
    "observedOperationIds", "usedDocumentIds", "observedStrengths", "missingElements",
    "nextAction", "confidence",
  ],
  properties: {
    responseDisposition: { type: "string", description: "classe le sens pédagogique du message, y compris une demande d’aide, de réponse ou une diversion légère", enum: ["substantive", "too_short", "help_request", "answer_request", "playful_diversion", "off_topic", "incomprehensible", "nonsense_or_spam", "inappropriate"] },
    pedagogicalOutcome: { type: "string", description: "non_exploitable uniquement lorsqu’aucune idée historique liée à la question ne peut être évaluée", enum: ["satisfactory", "partially_satisfactory", "insufficient", "non_exploitable"] },
    historicalAccuracy: { type: "string", enum: ["demonstrated", "partial", "not_demonstrated", "not_assessed"] },
    documentUse: { type: "string", enum: ["demonstrated", "partial", "not_demonstrated", "not_assessed"] },
    justificationQuality: { type: "string", enum: ["demonstrated", "partial", "not_demonstrated", "not_assessed"] },
    primaryOperationPerformance: { type: "string", enum: ["demonstrated", "partial", "not_demonstrated", "not_assessed"] },
    demonstratedKnowledgeIds: { type: "array", items: { type: "string" } },
    observedOperationIds: { type: "array", items: { type: "string" } },
    usedDocumentIds: { type: "array", items: { type: "string" } },
    observedStrengths: { type: "array", items: { type: "string" } },
    missingElements: { type: "array", items: { type: "string" } },
    nextAction: { type: "string", enum: ["complete_question", "request_revision", "offer_hint", "handle_non_exploitable"] },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
  },
} as const;

const INTENT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["isHistoricalProposition", "responseDisposition", "confidence"],
  properties: {
    isHistoricalProposition: { type: "boolean" },
    responseDisposition: { type: "string", enum: ["substantive", "too_short", "help_request", "answer_request", "playful_diversion", "off_topic", "incomprehensible", "nonsense_or_spam", "inappropriate"] },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
  },
} as const;

const INTENT_ANALYSIS_INSTRUCTIONS = `
Détermine uniquement la nature du message de l’élève dans le contexte de la question d’histoire fourni.
isHistoricalProposition doit être true dès que le message affirme, nie, suppose, compare ou explique quelque chose au sujet d’un fait, d’un concept, d’un acteur, d’une date ou d’un document lié à la tâche. La proposition demeure historique même si elle est fausse, très courte, imprécise, mal orthographiée ou incomplète. Dans ce cas, responseDisposition doit être substantive.
isHistoricalProposition doit être false pour une demande d’aide ou de réponse, une diversion, un message hors sujet, incompréhensible, vide de sens ou inapproprié. Ne juge ni l’exactitude ni la qualité de la réponse à cette étape.
`.trim();

function analysisSchemaForSubstantiveResponse() {
  return {
    ...ANALYSIS_SCHEMA,
    properties: {
      ...ANALYSIS_SCHEMA.properties,
      responseDisposition: { ...ANALYSIS_SCHEMA.properties.responseDisposition, enum: ["substantive"] },
      pedagogicalOutcome: { ...ANALYSIS_SCHEMA.properties.pedagogicalOutcome, enum: ["satisfactory", "partially_satisfactory", "insufficient"] },
      nextAction: { ...ANALYSIS_SCHEMA.properties.nextAction, enum: ["complete_question", "request_revision", "offer_hint"] },
    },
  } as const;
}

const PEDAGOGICAL_ANALYSIS_CONTRACT_V1 = `
Tu analyses une réponse d’élève en histoire du Québec et du Canada à partir de quatre autorités distinctes du dossier pédagogique approuvé fourni : referenceMonograph est la référence historique de fond; approvedDocuments contient uniquement les documents historiques associés à la question; evaluationGuide précise les éléments acceptables et les erreurs fréquentes propres à cette question; pedagogicalRules fixe la manière d’accompagner l’élève. Respecte leur rôle et leur portée.
Utilise evaluationGuide comme une grille conceptuelle, jamais comme une réponse à recopier. Accepte les synonymes, les paraphrases, les formulations d’élèves, les fautes et tout raisonnement historiquement équivalent. Ne demande pas un détail absent de questionPrompt et successCriteria simplement parce qu’il figure dans expectedAnswer.

Respecte strictement les identifiants. N’invente aucun fait, document, connaissance ou opération. Compare la réponse à la question, aux documents et aux critères de réussite. Ne pénalise pas l’orthographe, la grammaire ou une formulation différente des documents.

Décide d’abord responseDisposition selon ces règles :
- substantive : toute affirmation historique compréhensible et liée à la question ou aux documents, même si elle est très courte, incomplète, imprécise, partiellement fausse ou insuffisamment justifiée;
- too_short : seulement une réponse sans proposition historique évaluable. Une négation comme « aucune », « aucun » ou « il n’y en a pas » est toutefois une affirmation évaluable lorsque la question demande une différence, une conséquence, une cause ou un élément historique : classe-la substantive, puis explique chaleureusement ce qui doit être corrigé;
- help_request : l’élève demande de l’aide, un indice, une méthode ou dit ne pas savoir comment commencer;
- answer_request : l’élève demande que Socrato lui donne la réponse complète ou fasse le travail à sa place, même de façon elliptique comme « réponse svp »;
- playful_diversion : une interjection, une onomatopée, une plaisanterie brève ou un petit aparté compréhensible sans contenu historique, comme « atchoum »; ne la classe pas incomprehensible;
- off_topic : une proposition compréhensible, mais sans rapport avec la question;
- incomprehensible : aucune proposition ne peut être comprise;
- nonsense_or_spam : caractères aléatoires, répétitions vides ou contenu manifestement destiné à contourner l’activité;
- inappropriate : contenu injurieux ou dangereux.

Une réponse substantive ne doit jamais produire pedagogicalOutcome=non_exploitable ni nextAction=handle_non_exploitable. Évalue-la plutôt comme satisfactory, partially_satisfactory ou insufficient. Une idée historique pertinente mais incomplète est normalement partially_satisfactory ou insufficient, avec request_revision ou offer_hint. Une réponse correcte qui accomplit l’opération intellectuelle centrale et répond directement à la question doit être satisfactory avec complete_question, même si un document d’appui n’est pas nommé explicitement ou si un élément d’enrichissement pourrait être ajouté. Dans ce cas, indique documentUse=partial, conserve seulement les usedDocumentIds réellement mobilisés et formule l’enrichissement souhaitable dans missingElements; ne bloque pas la réussite pour cette seule omission.

Reconnais les relations exprimées dans le langage ordinaire de l’élève. Une formulation qui indique qu’un élément existait avant et demeure après démontre déjà une continuité; une formulation qui oppose deux situations démontre déjà une différence; une formulation qui relie un fait à un effet démontre déjà un lien causal. Ne demande jamais à l’élève d’expliquer de nouveau une relation qu’il vient d’exprimer clairement, même sans employer le nom savant de l’opération intellectuelle.

N’exige jamais un numéro d’article, une date exacte, le titre officiel d’une disposition ou un terme juridique spécialisé si questionPrompt, instruction et successCriteria ne le demandent pas explicitement. Lorsque l’élève explique correctement le concept attendu avec ses propres mots, la réponse peut être satisfactory. Ajoute alors la précision savante seulement comme enrichissement bref dans missingElements, sans question supplémentaire.

Lorsqu’une question demande de justifier à l’aide d’un ou plusieurs documents, une reformulation fidèle d’un élément pertinent de chaque document constitue une justification complète. N’exige ni citation textuelle, ni passage exact, ni titre du document, sauf si questionPrompt ou instruction demande explicitement de « citer ». Si toutes les réponses demandées sont nommées et chacune est expliquée fidèlement avec le contenu pertinent, produis satisfactory et complete_question dès cette tentative.

À partir de la deuxième tentative, priorTurn résume les acquis reconnus et l’élément qui manquait au tour précédent. Construis un dialogue socratique cumulatif pouvant aller jusqu’à trois réponses d’élève. Conserve dans observedStrengths les acquis conceptuels déjà reconnus, en les fusionnant avec le nouvel acquis sans recopier la conversation. Ne demande pas à l’élève de redémontrer un acquis reconnu et ne suppose jamais qu’un élément manquant est acquis sans preuve dans sa nouvelle réponse.

Pour une réponse partielle, suis toujours ce rythme : reconnais précisément l’acquis, corrige au plus une confusion, puis pose dans missingElements[0] une seule question courte portant sur le prochain élément essentiel. Adapte cette question à la réponse réelle et au chemin déjà parcouru; n’utilise pas une relance générique. Dès que la nouvelle réponse apporte le dernier élément essentiel manquant, évalue l’ensemble cumulé comme satisfactory et complete_question. Ne demande jamais à l’élève de réunir ou reformuler tous ses acquis dans une phrase finale. L’objectif est de construire la réponse avec lui, sans lui dicter la réponse.

Réserve pedagogicalOutcome=non_exploitable et nextAction=handle_non_exploitable aux réponses dont responseDisposition n’est pas substantive.

Exemples de décision :
- « Les Britanniques refusent les demandes des Patriotes. » dans une question sur le rejet de revendications patriotes : substantive et évaluable, même si le lien causal demandé reste à développer;
- « Il sert à payer les dettes des deux Canadas. » dans une question demandant de définir le fonds consolidé et d’indiquer son usage : substantive et partially_satisfactory; reconnais l’usage donné, puis demande seulement ce qu’est ce fonds;
- une réponse qui relie correctement une revendication, son refus et la radicalisation qui mène à la rébellion : substantive et satisfactory, même si elle ne nomme pas explicitement le journal qui illustre cette radicalisation; ajoute alors la mention de cette source comme piste d’enrichissement dans missingElements;
- une réponse qui explique que l’anglais demeure la langue officielle des documents de la législature satisfait l’idée attendue, même sans nommer l’article 41; mentionne l’article seulement comme enrichissement;
- pour « Nomme deux recommandations de Durham et justifie-les avec les deux extraits », une réponse qui nomme l’union des provinces et la responsabilité devant la législature, puis explique fidèlement chacune avec ses propres mots, est satisfactory; ne demande pas ensuite de retrouver un passage exact;
- « aucune » à une question demandant une différence entre deux dates est substantive et historiquement évaluable, même si cette réponse est fausse; donne alors un indice ciblé sur le rôle distinct de chaque date;
- « J’aime les jeux vidéo. » pour une question d’histoire : off_topic et non_exploitable.
- un mot quotidien isolé sans rapport, comme « patate » ou « oignon », est off_topic; une répétition vide ou aléatoire est nonsense_or_spam. Décris seulement la disposition de la réponse, sans prêter une intention à l’élève.
- « je ne sais pas comment » est help_request; « donne-moi la réponse », « je veux la réponse » et « réponse svp » sont answer_request. Ces messages sont non_exploitable avec handle_non_exploitable afin que Socrato fournisse une aide sans évaluer une connaissance.
- une playful_diversion est non_exploitable avec handle_non_exploitable. Place dans missingElements[0] une seule question historique ciblée et courte permettant de reprendre exactement la tâche courante.
- pour playful_diversion, off_topic ou nonsense_or_spam, formule dans observedStrengths[0] une réaction très brève, chaleureuse et adaptée au message réel, sans jugement ni supposition d’intention. Place dans missingElements[0] une seule question historique ciblée sur la tâche courante. N’emploie pas une formule parlant d’un « mot » si l’élève a écrit une phrase.

Adresse-toi directement à l’élève avec un ton chaleureux, encourageant et naturel. Commence observedStrengths[0] par une reconnaissance brève comme « Oui, », « Bien vu, » ou « Bonne piste : », puis explique précisément en quoi l’élément donné contribue à la question. Évite les formulations vagues comme « tu as repéré », « tu mobilises un élément » ou « ta réponse est liée à la question ». Ne recopie jamais la réponse de l’élève. Lorsque la réponse est partielle ou insuffisante, missingElements[0] doit être une seule question d’aide courte, de 22 mots au maximum, fondée sur le document historique associé le plus pertinent. N’ajoute ni consigne avant cette question ni seconde question. N’utilise jamais l’identifiant interne d’un document (par exemple PAT-T-002); nomme-le uniquement par son title fourni dans approvedDocuments. Lorsque la réponse est satisfactory, missingElements peut contenir une seule précision historique brève tirée de referenceMonograph, mais aucune question. Évite les conseils génériques comme « précise ta réponse » et ne fournis jamais la réponse complète à la place de l’élève.
`.trim();

function required(value: string, name: string) {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${name} est requis pour activer l’analyse pédagogique OpenAI.`);
  return normalized;
}

function extractOutputText(payload: unknown) {
  if (!payload || typeof payload !== "object") throw new Error("La réponse OpenAI est absente.");
  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) throw new Error("La réponse OpenAI ne contient aucune sortie structurée.");
  for (const item of output) {
    if (!item || typeof item !== "object" || !Array.isArray((item as { content?: unknown }).content)) continue;
    for (const content of (item as { content: unknown[] }).content) {
      if (content && typeof content === "object" && (content as { type?: unknown }).type === "output_text" && typeof (content as { text?: unknown }).text === "string") {
        return (content as { text: string }).text;
      }
    }
  }
  throw new Error("La réponse OpenAI ne contient aucun texte structuré.");
}

function pedagogicalContext(response: StudentResponse, question: PedagogicalQuestionDefinition) {
  return {
    question: {
      id: question.id,
      notionId: question.notionId,
      primaryOperationId: question.primaryOperationId,
      operationIds: question.operationIds,
      historicalKnowledgeIds: question.historicalKnowledgeIds,
      documentIds: question.documentIds,
      requiredDocumentIds: question.requiredDocumentIds,
      evaluationContext: question.evaluationContext,
    },
    attemptNumber: response.attemptNumber,
    hintLevel: response.hintLevel,
    priorTurn: response.priorTurn,
    studentResponse: response.content,
  };
}

function normalizedWords(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

function longestSharedWordRun(responseWords: string[], documentWords: string[]) {
  let longest = 0;
  let previous = new Array(documentWords.length + 1).fill(0) as number[];
  for (const responseWord of responseWords) {
    const current = new Array(documentWords.length + 1).fill(0) as number[];
    for (let index = 1; index <= documentWords.length; index += 1) {
      if (responseWord === documentWords[index - 1]) {
        current[index] = previous[index - 1] + 1;
        longest = Math.max(longest, current[index]);
      }
    }
    previous = current;
  }
  return longest;
}

export function substantiallyCopiesApprovedDocument(response: string, question: PedagogicalQuestionDefinition) {
  const responseWords = normalizedWords(response);
  if (responseWords.length < 12) return false;
  return (question.evaluationContext?.approvedDocuments ?? []).some(({ content }) =>
    longestSharedWordRun(responseWords, normalizedWords(content)) >= Math.min(18, responseWords.length),
  );
}

function requirePersonalExplanation(analysis: StructuredResponseAnalysis, response: StudentResponse, question: PedagogicalQuestionDefinition): StructuredResponseAnalysis {
  if (analysis.pedagogicalOutcome !== "satisfactory" || !substantiallyCopiesApprovedDocument(response.content, question)) return analysis;
  return {
    ...analysis,
    pedagogicalOutcome: "partially_satisfactory",
    historicalAccuracy: analysis.historicalAccuracy === "not_assessed" ? "not_assessed" : "partial",
    documentUse: "partial",
    justificationQuality: "not_demonstrated",
    primaryOperationPerformance: "partial",
    demonstratedKnowledgeIds: [],
    observedOperationIds: [],
    observedStrengths: ["Tu as trouvé le passage pertinent dans le document."],
    missingElements: ["Avec tes propres mots, quelle idée du document répond directement à la question?"],
    nextAction: "request_revision",
  };
}

function preserveCumulativeStrengths(analysis: StructuredResponseAnalysis, response: StudentResponse): StructuredResponseAnalysis {
  if (analysis.pedagogicalOutcome === "non_exploitable" || !response.priorTurn) return analysis;
  const observedStrengths = [...analysis.observedStrengths];
  for (const strength of response.priorTurn.observedStrengths) {
    if (!observedStrengths.includes(strength)) observedStrengths.push(strength);
  }
  return { ...analysis, observedStrengths };
}

export class OpenAIPedagogicalResponseAnalyzer implements ResponseAnalyzer {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly fetcher: FetchLike;
  private readonly endpoint: string;
  private readonly instructions: string;

  constructor(options: OpenAIPedagogicalAnalyzerOptions) {
    this.apiKey = required(options.apiKey, "OPENAI_API_KEY");
    this.model = required(options.model, "SOCRATO_SOL_AI_MODEL");
    this.fetcher = options.fetch ?? fetch;
    this.endpoint = options.endpoint ?? "https://api.openai.com/v1/responses";
    this.instructions = options.contractVersion === "v1" ? PEDAGOGICAL_ANALYSIS_CONTRACT_V1 : PEDAGOGICAL_ANALYSIS_CONTRACT_V2;
  }

  async analyze(response: StudentResponse, question: PedagogicalQuestionDefinition): Promise<StructuredResponseAnalysis> {
    const requestStructuredOutput = async (instructions: string, schema: object, name: string) => {
      const apiResponse = await this.fetcher(this.endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        store: false,
        instructions,
        input: JSON.stringify(pedagogicalContext(response, question)),
        text: { format: { type: "json_schema", name, strict: true, schema } },
      }),
      });
      if (!apiResponse.ok) throw new Error(`L’analyse OpenAI a échoué (${apiResponse.status}).`);
      return JSON.parse(extractOutputText(await apiResponse.json())) as unknown;
    };

    const analyzeOnce = async (instructions: string, forceSubstantive = false) => preserveCumulativeStrengths(
      requirePersonalExplanation(validateStructuredAnalysis(
        await requestStructuredOutput(
          instructions,
          forceSubstantive ? analysisSchemaForSubstantiveResponse() : ANALYSIS_SCHEMA,
          "socrato_pedagogical_analysis",
        ),
        question,
      ), response, question),
      response,
    );

    const initial = await analyzeOnce(this.instructions);
    const isIntentionalNonAnswer = isExplicitHelpRequest(response.content)
      || ["help_request", "answer_request", "playful_diversion", "nonsense_or_spam", "inappropriate"].includes(initial.responseDisposition);
    if (initial.pedagogicalOutcome !== "non_exploitable" || isIntentionalNonAnswer) {
      if (response.attemptNumber >= 3 && initial.responseDisposition === "substantive" && initial.pedagogicalOutcome !== "satisfactory") {
        return analyzeOnce(`${this.instructions}\n\nCeci est le contrôle final cumulatif du troisième essai. Réévalue la réponse actuelle avec tous les acquis de priorTurn et les critères essentiels explicitement demandés. Si la réponse actuelle apporte l’élément demandé au tour précédent et que l’ensemble cumulé répond à la question, choisis obligatoirement satisfactory et complete_question. Ne maintiens pas un verdict partiel pour une précision facultative, un enrichissement ou parce que les acquis sont répartis entre plusieurs messages.`, true);
      }
      return initial;
    }

    if (["too_short", "incomprehensible"].includes(initial.responseDisposition)) {
      return analyzeOnce(`${this.instructions}\n\nLe premier passage n’a pas réussi à évaluer ce message. Traite-le maintenant comme une proposition de l’élève à propos de la tâche courante : détermine ce qu’elle apporte réellement, corrige-la si nécessaire et poursuis le dialogue socratique. Ne la déclare pas non exploitable simplement parce qu’elle est courte, maladroite ou formulée comme un fragment de phrase.`, true);
    }

    let intent: { isHistoricalProposition?: unknown; responseDisposition?: unknown; confidence?: unknown };
    try {
      intent = await requestStructuredOutput(INTENT_ANALYSIS_INSTRUCTIONS, INTENT_SCHEMA, "socrato_student_response_intent") as typeof intent;
    } catch {
      return initial;
    }
    if (intent.isHistoricalProposition !== true || intent.responseDisposition !== "substantive") return initial;

    return analyzeOnce(`${this.instructions}\n\nUne lecture spécialisée indépendante a établi que le message contient une proposition historique liée à la tâche. Évalue maintenant son exactitude et sa contribution réelle, même si cette proposition est fausse, courte ou incomplète. Ne la traite ni comme une diversion ni comme un message non exploitable.`, true);
  }
}

export function createConfiguredOpenAIPedagogicalAnalyzer(environment: Record<string, string | undefined> = process.env, fetcher?: FetchLike) {
  return new OpenAIPedagogicalResponseAnalyzer({
    apiKey: environment.OPENAI_API_KEY ?? "",
    model: environment.SOCRATO_SOL_AI_MODEL ?? "gpt-5.6-sol",
    fetch: fetcher,
    contractVersion: environment.SOCRATO_PEDAGOGICAL_CONTRACT === "v1" ? "v1" : "v2",
  });
}

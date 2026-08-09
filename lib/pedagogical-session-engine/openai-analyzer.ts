import type { ResponseAnalyzer } from "./ports.ts";
import type { PedagogicalQuestionDefinition, StructuredResponseAnalysis, StudentResponse } from "./types.ts";
import { validateStructuredAnalysis } from "./validation.ts";
import { isExplicitHelpRequest } from "./help-request.ts";

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export type OpenAIPedagogicalAnalyzerOptions = {
  apiKey: string;
  model: string;
  fetch?: FetchLike;
  endpoint?: string;
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

const PEDAGOGICAL_ANALYSIS_INSTRUCTIONS = `
Tu analyses une réponse d’élève en histoire du Québec et du Canada à partir de trois autorités distinctes du dossier pédagogique approuvé fourni : referenceMonograph est la référence historique de fond; approvedDocuments contient uniquement les documents historiques associés à la question; pedagogicalRules fixe la manière d’accompagner l’élève. Respecte leur rôle et leur portée.

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

N’exige jamais un numéro d’article, une date exacte, le titre officiel d’une disposition ou un terme juridique spécialisé si questionPrompt, instruction et successCriteria ne le demandent pas explicitement. Lorsque l’élève explique correctement le concept attendu avec ses propres mots, la réponse peut être satisfactory. Ajoute alors la précision savante seulement comme enrichissement bref dans missingElements, sans question supplémentaire.

À partir de la deuxième tentative, priorTurn résume les acquis reconnus et l’élément qui manquait au tour précédent. Évalue cumulativement ces acquis avec la nouvelle réponse : ne demande pas à l’élève de répéter un acquis déjà reconnu. Si la nouvelle réponse complète l’élément manquant, évalue l’ensemble comme satisfactory. Ne suppose jamais qu’un élément auparavant manquant est acquis si la nouvelle réponse ne l’apporte pas.

Réserve pedagogicalOutcome=non_exploitable et nextAction=handle_non_exploitable aux réponses dont responseDisposition n’est pas substantive.

Exemples de décision :
- « Les Britanniques refusent les demandes des Patriotes. » dans une question sur le rejet de revendications patriotes : substantive et évaluable, même si le lien causal demandé reste à développer;
- une réponse qui relie correctement une revendication, son refus et la radicalisation qui mène à la rébellion : substantive et satisfactory, même si elle ne nomme pas explicitement le journal qui illustre cette radicalisation; ajoute alors la mention de cette source comme piste d’enrichissement dans missingElements;
- une réponse qui explique que l’anglais demeure la langue officielle des documents de la législature satisfait l’idée attendue, même sans nommer l’article 41; mentionne l’article seulement comme enrichissement;
- « aucune » à une question demandant une différence entre deux dates est substantive et historiquement évaluable, même si cette réponse est fausse; donne alors un indice ciblé sur le rôle distinct de chaque date;
- « J’aime les jeux vidéo. » pour une question d’histoire : off_topic et non_exploitable.
- un mot quotidien isolé sans rapport, comme « patate » ou « oignon », est off_topic; une répétition vide ou aléatoire est nonsense_or_spam. Décris seulement la disposition de la réponse, sans prêter une intention à l’élève.
- « je ne sais pas comment » est help_request; « donne-moi la réponse », « je veux la réponse » et « réponse svp » sont answer_request. Ces messages sont non_exploitable avec handle_non_exploitable afin que Socrato fournisse une aide sans évaluer une connaissance.
- une playful_diversion est non_exploitable avec handle_non_exploitable. Place dans missingElements[0] une seule question historique ciblée et courte permettant de reprendre exactement la tâche courante.

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

const RELATION_STOP_WORDS = new Set([
  "alors", "apres", "avec", "cette", "comme", "dans", "depuis", "elle", "elles", "entre", "faire", "leurs",
  "mais", "meme", "parce", "pour", "pourquoi", "question", "seulement", "sont", "sous", "tous", "toute", "toutes",
]);

function normalizedTerms(value: string) {
  return new Set(value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().match(/[a-z]{5,}/g)?.filter((term) => !RELATION_STOP_WORDS.has(term)) ?? []);
}

function hasClearPedagogicalRelation(response: StudentResponse, question: PedagogicalQuestionDefinition) {
  if (isExplicitHelpRequest(response.content)) return false;
  const responseTerms = normalizedTerms(response.content);
  const context = question.evaluationContext;
  const normalizedResponse = response.content.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const prompt = `${context?.questionPrompt ?? ""} ${context?.instruction ?? ""}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const isEvaluableNegation = /^(aucun|aucune|aucuns|aucunes|il n['’ ]?y en a pas|pas de difference)[.!? ]*$/.test(normalizedResponse)
    && /\b(difference|consequence|cause|element|changement|effet|mesure|raison)\b/.test(prompt);
  if (isEvaluableNegation) return true;
  const referenceTerms = normalizedTerms([
    context?.questionPrompt, context?.instruction,
    ...(context?.approvedDocuments.flatMap(({ title, attribution, content }) => [title, attribution, content]) ?? []),
  ].filter(Boolean).join(" "));
  const sharedTerms = [...responseTerms].filter((term) => referenceTerms.has(term)).length;
  return response.content.trim().length < 20 ? sharedTerms >= 1 : sharedTerms >= 2;
}

function relatedResponseFallback(question: PedagogicalQuestionDefinition): StructuredResponseAnalysis {
  const document = question.evaluationContext?.approvedDocuments[0];
  const target = document
    ? `Dans « ${document.title} », quel élément pourrait appuyer ton idée?`
    : "Quel fait précis pourrait appuyer ton idée?";
  return {
    responseDisposition: "substantive",
    pedagogicalOutcome: "insufficient",
    historicalAccuracy: "not_assessed",
    documentUse: "not_assessed",
    justificationQuality: "not_assessed",
    primaryOperationPerformance: "partial",
    demonstratedKnowledgeIds: [],
    observedOperationIds: [question.primaryOperationId],
    usedDocumentIds: [],
    observedStrengths: ["Ta réponse mobilise plusieurs éléments directement liés à la question."],
    missingElements: [target],
    nextAction: "offer_hint",
    confidence: "low",
  };
}

export class OpenAIPedagogicalResponseAnalyzer implements ResponseAnalyzer {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly fetcher: FetchLike;
  private readonly endpoint: string;

  constructor(options: OpenAIPedagogicalAnalyzerOptions) {
    this.apiKey = required(options.apiKey, "OPENAI_API_KEY");
    this.model = required(options.model, "SOCRATO_PEDAGOGICAL_AI_MODEL");
    this.fetcher = options.fetch ?? fetch;
    this.endpoint = options.endpoint ?? "https://api.openai.com/v1/responses";
  }

  async analyze(response: StudentResponse, question: PedagogicalQuestionDefinition): Promise<StructuredResponseAnalysis> {
    const analyzeOnce = async (instructions: string) => {
      const apiResponse = await this.fetcher(this.endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        store: false,
        instructions,
        input: JSON.stringify(pedagogicalContext(response, question)),
        text: { format: { type: "json_schema", name: "socrato_pedagogical_analysis", strict: true, schema: ANALYSIS_SCHEMA } },
      }),
      });
      if (!apiResponse.ok) throw new Error(`L’analyse OpenAI a échoué (${apiResponse.status}).`);
      const parsed = JSON.parse(extractOutputText(await apiResponse.json())) as unknown;
      return validateStructuredAnalysis(parsed, question);
    };

    const initial = await analyzeOnce(PEDAGOGICAL_ANALYSIS_INSTRUCTIONS);
    if (initial.pedagogicalOutcome !== "non_exploitable" || !hasClearPedagogicalRelation(response, question)) return initial;
    const revised = await analyzeOnce(`${PEDAGOGICAL_ANALYSIS_INSTRUCTIONS}\n\nRévision obligatoire : la réponse contient plusieurs termes directement présents dans la question ou les documents. Elle exprime donc une idée historique liée et doit être responseDisposition=substantive. Réévalue son degré de réussite et donne une prochaine étape précise si elle demeure incomplète.`);
    return revised.pedagogicalOutcome === "non_exploitable" ? relatedResponseFallback(question) : revised;
  }
}

export function createConfiguredOpenAIPedagogicalAnalyzer(environment: Record<string, string | undefined> = process.env, fetcher?: FetchLike) {
  return new OpenAIPedagogicalResponseAnalyzer({
    apiKey: environment.OPENAI_API_KEY ?? "",
    model: environment.SOCRATO_PEDAGOGICAL_AI_MODEL ?? "",
    fetch: fetcher,
  });
}

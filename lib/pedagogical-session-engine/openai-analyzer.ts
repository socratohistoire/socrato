import type { ResponseAnalyzer } from "./ports.ts";
import type { PedagogicalQuestionDefinition, StructuredResponseAnalysis, StudentResponse } from "./types.ts";
import { validateStructuredAnalysis } from "./validation.ts";

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
    responseDisposition: { type: "string", enum: ["substantive", "too_short", "off_topic", "incomprehensible", "nonsense_or_spam", "inappropriate"] },
    pedagogicalOutcome: { type: "string", enum: ["satisfactory", "partially_satisfactory", "insufficient", "non_exploitable"] },
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
Tu analyses une réponse d’élève en histoire du Québec et du Canada à partir du dossier pédagogique approuvé fourni.

Respecte strictement les identifiants. N’invente aucun fait, document, connaissance ou opération. Compare la réponse à la question, aux documents et aux critères de réussite. Ne pénalise pas l’orthographe, la grammaire ou une formulation différente des documents.

Décide d’abord responseDisposition selon ces règles :
- substantive : toute affirmation historique compréhensible et liée à la question ou aux documents, même si elle est très courte, incomplète, imprécise, partiellement fausse ou insuffisamment justifiée;
- too_short : seulement une réponse sans proposition historique évaluable, par exemple « oui », « non » ou « je ne sais pas »;
- off_topic : une proposition compréhensible, mais sans rapport avec la question;
- incomprehensible : aucune proposition ne peut être comprise;
- nonsense_or_spam : caractères aléatoires, répétitions vides ou contenu manifestement destiné à contourner l’activité;
- inappropriate : contenu injurieux ou dangereux.

Une réponse substantive ne doit jamais produire pedagogicalOutcome=non_exploitable ni nextAction=handle_non_exploitable. Évalue-la plutôt comme satisfactory, partially_satisfactory ou insufficient. Une idée historique pertinente mais incomplète est normalement partially_satisfactory ou insufficient, avec request_revision ou offer_hint. Une réponse correcte et complète qui satisfait les critères doit être satisfactory avec complete_question, même si sa formulation diffère des documents.

Réserve pedagogicalOutcome=non_exploitable et nextAction=handle_non_exploitable aux réponses dont responseDisposition n’est pas substantive.

Exemples de décision :
- « Les Britanniques refusent les demandes des Patriotes. » dans une question sur le rejet de revendications patriotes : substantive et évaluable, même si le lien causal demandé reste à développer;
- une réponse qui relie correctement une revendication, son refus et la conséquence demandée : substantive et satisfactory si elle satisfait tous les critères;
- « J’aime les jeux vidéo. » pour une question d’histoire : off_topic et non_exploitable.

Les observations doivent être précises, brèves, pédagogiques et ne jamais recopier la réponse de l’élève.
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
    studentResponse: response.content,
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
    const apiResponse = await this.fetcher(this.endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        store: false,
        instructions: PEDAGOGICAL_ANALYSIS_INSTRUCTIONS,
        input: JSON.stringify(pedagogicalContext(response, question)),
        text: { format: { type: "json_schema", name: "socrato_pedagogical_analysis", strict: true, schema: ANALYSIS_SCHEMA } },
      }),
    });
    if (!apiResponse.ok) throw new Error(`L’analyse OpenAI a échoué (${apiResponse.status}).`);
    const parsed = JSON.parse(extractOutputText(await apiResponse.json())) as unknown;
    return validateStructuredAnalysis(parsed, question);
  }
}

export function createConfiguredOpenAIPedagogicalAnalyzer(environment: Record<string, string | undefined> = process.env, fetcher?: FetchLike) {
  return new OpenAIPedagogicalResponseAnalyzer({
    apiKey: environment.OPENAI_API_KEY ?? "",
    model: environment.SOCRATO_PEDAGOGICAL_AI_MODEL ?? "",
    fetch: fetcher,
  });
}

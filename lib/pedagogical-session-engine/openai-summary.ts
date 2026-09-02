import type { PedagogicalSummary } from "./types.ts";
import { recordAICall } from "./ai-call-tracking.ts";
import { runQueuedAnalysis } from "./analysis-queue.ts";

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export type OpenAISummaryWriterOptions = {
  apiKey: string;
  model: string;
  fetch?: FetchLike;
  endpoint?: string;
  retryBaseDelayMs?: number;
};

const SUMMARY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["encouragement", "strengths", "consolidationTargets", "recommendationLabel"],
  properties: {
    encouragement: { type: "string", minLength: 1, maxLength: 240 },
    strengths: { type: "array", minItems: 0, maxItems: 2, items: { type: "string", minLength: 1, maxLength: 240 } },
    consolidationTargets: { type: "array", minItems: 0, maxItems: 1, items: { type: "string", minLength: 1, maxLength: 240 } },
    recommendationLabel: { type: "string", minLength: 0, maxLength: 240 },
  },
} as const;

const SUMMARY_INSTRUCTIONS = `
Tu rédiges le bilan final d’une activité d’histoire pour un élève du secondaire.
Les données fournies sont déjà évaluées et constituent l’unique source autorisée. Tu ne dois modifier aucun niveau de maîtrise, inventer aucun fait, ni prétendre avoir lu les réponses originales.

Rédige en français québécois clair, chaleureux et sobre :
- un encouragement personnalisé de deux phrases au maximum;
- exactement deux points forts lorsqu’ils sont fournis dans sourceStrengths; privilégie une connaissance historique et une opération intellectuelle, sans inventer de preuve;
- une seule priorité dans sourceConsolidationTargets, obligatoirement liée à l’opération intellectuelle qui a causé la difficulté la plus importante ou nécessité le plus d’aide;
- une prochaine étape brève seulement si allowedRecommendation est fourni.

Le bilan porte uniquement sur les opérations intellectuelles et les connaissances historiques. N’ajoute aucune stratégie générale de lecture, d’étude, de mémorisation, de prise de notes, d’organisation ou de concentration. Une connaissance historique peut préciser le contenu à revoir, mais elle ne crée jamais une seconde priorité ni une seconde activité de consolidation.

Relie la prochaine étape à l’opération prioritaire. Décris la connaissance ou le raisonnement à travailler avec des mots accessibles : ne demande jamais de retrouver un passage exact, un numéro de document ou une citation. Invite l’élève à expliquer avec ses propres mots.

Les forces et les conseils fournis sont des observations métacognitives validées. Ne supprime, ne généralise et ne modifie jamais les exemples de questions qu’ils contiennent. Ne mentionne ni l’API, ni Sol, ni des identifiants techniques. N’utilise pas de note, de pourcentage ou de jugement sur la personne.
`.trim();

function required(value: string, name: string) {
  const normalized = value.trim();
  if (!normalized) throw new Error(`${name} est requis pour rédiger le bilan.`);
  return normalized;
}

function extractOutputText(payload: unknown) {
  if (!payload || typeof payload !== "object") throw new Error("La réponse OpenAI est absente.");
  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) throw new Error("La réponse OpenAI ne contient aucune sortie structurée.");
  for (const item of output) {
    if (!item || typeof item !== "object" || !Array.isArray((item as { content?: unknown }).content)) continue;
    for (const content of (item as { content: unknown[] }).content) {
      if (content && typeof content === "object" && (content as { type?: unknown }).type === "output_text" && typeof (content as { text?: unknown }).text === "string") return (content as { text: string }).text;
    }
  }
  throw new Error("La réponse OpenAI ne contient aucun texte structuré.");
}

function validText(value: unknown, maximum: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maximum;
}

function validTexts(value: unknown, maximum: number) {
  return Array.isArray(value) && value.length <= maximum && value.every((item) => validText(item, 240));
}

export async function writePersonalizedSummary(base: PedagogicalSummary, options: OpenAISummaryWriterOptions): Promise<PedagogicalSummary> {
  const apiKey = required(options.apiKey, "OPENAI_API_KEY");
  const model = required(options.model, "SOCRATO_SOL_AI_MODEL");
  const fetcher = options.fetch ?? fetch;
  const request = () => runQueuedAnalysis(async (waitDurationMs) => {
    recordAICall({ model, callType: "summary", activityId: base.activityId, questionId: null, waitDurationMs });
    return fetcher(options.endpoint ?? "https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        store: false,
        instructions: SUMMARY_INSTRUCTIONS,
        input: JSON.stringify({
          sourceStrengths: base.strengths,
          sourceConsolidationTargets: base.consolidationTargets,
          allowedRecommendation: base.recommendation?.label ?? "",
        }),
        text: { format: { type: "json_schema", name: "socrato_pedagogical_summary", strict: true, schema: SUMMARY_SCHEMA } },
      }),
    });
  });
  let response = await request();
  if (response.status === 429) {
    await new Promise((resolve) => setTimeout(resolve, options.retryBaseDelayMs ?? 300));
    response = await request();
  }
  if (!response.ok) throw new Error(`La rédaction OpenAI a échoué (${response.status}).`);
  const candidate = JSON.parse(extractOutputText(await response.json())) as Record<string, unknown>;
  if (!validText(candidate.encouragement, 240) || !validTexts(candidate.strengths, 2) || !validTexts(candidate.consolidationTargets, 1)
    || typeof candidate.recommendationLabel !== "string" || candidate.recommendationLabel.length > 240) throw new Error("Le bilan rédigé ne respecte pas le contrat attendu.");

  return {
    ...base,
    encouragement: candidate.encouragement.trim(),
    strengths: base.strengths,
    consolidationTargets: base.consolidationTargets,
    recommendation: base.recommendation && candidate.recommendationLabel.trim()
      ? { ...base.recommendation, label: candidate.recommendationLabel.trim() }
      : base.recommendation,
  };
}

export function createConfiguredOpenAISummaryWriter(base: PedagogicalSummary, environment: Record<string, string | undefined> = process.env, fetcher?: FetchLike) {
  return writePersonalizedSummary(base, {
    apiKey: environment.OPENAI_API_KEY ?? "",
    model: environment.SOCRATO_SOL_AI_MODEL ?? "gpt-5.6-terra",
    fetch: fetcher,
  });
}

import type { PedagogicalSummary } from "./types.ts";

type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export type OpenAISummaryWriterOptions = {
  apiKey: string;
  model: string;
  fetch?: FetchLike;
  endpoint?: string;
};

const SUMMARY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["encouragement", "strengths", "consolidationTargets", "recommendationLabel"],
  properties: {
    encouragement: { type: "string", minLength: 1, maxLength: 240 },
    strengths: { type: "array", minItems: 0, maxItems: 3, items: { type: "string", minLength: 1, maxLength: 240 } },
    consolidationTargets: { type: "array", minItems: 0, maxItems: 3, items: { type: "string", minLength: 1, maxLength: 240 } },
    recommendationLabel: { type: "string", minLength: 0, maxLength: 240 },
  },
} as const;

const SUMMARY_INSTRUCTIONS = `
Tu rédiges le bilan final d’une activité d’histoire pour un élève du secondaire.
Les données fournies sont déjà évaluées et constituent l’unique source autorisée. Tu ne dois modifier aucun niveau de maîtrise, inventer aucun fait, ni prétendre avoir lu les réponses originales.

Rédige en français québécois clair, chaleureux et sobre :
- un encouragement personnalisé de deux phrases au maximum;
- jusqu’à trois forces réellement présentes dans sourceStrengths;
- jusqu’à trois éléments réellement présents dans sourceConsolidationTargets;
- une prochaine étape brève seulement si allowedRecommendation est fourni.

Reformule les éléments redondants sans ajouter de nouvelle conclusion. Ne mentionne ni l’API, ni Terra, ni des identifiants techniques. N’utilise pas de note, de pourcentage ou de jugement sur la personne.
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

function validTexts(value: unknown) {
  return Array.isArray(value) && value.length <= 3 && value.every((item) => validText(item, 240));
}

export async function writePersonalizedSummary(base: PedagogicalSummary, options: OpenAISummaryWriterOptions): Promise<PedagogicalSummary> {
  const apiKey = required(options.apiKey, "OPENAI_API_KEY");
  const model = required(options.model, "SOCRATO_PEDAGOGICAL_AI_MODEL");
  const fetcher = options.fetch ?? fetch;
  const response = await fetcher(options.endpoint ?? "https://api.openai.com/v1/responses", {
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
  if (!response.ok) throw new Error(`La rédaction OpenAI a échoué (${response.status}).`);
  const candidate = JSON.parse(extractOutputText(await response.json())) as Record<string, unknown>;
  if (!validText(candidate.encouragement, 240) || !validTexts(candidate.strengths) || !validTexts(candidate.consolidationTargets)
    || typeof candidate.recommendationLabel !== "string" || candidate.recommendationLabel.length > 240) throw new Error("Le bilan rédigé ne respecte pas le contrat attendu.");

  return {
    ...base,
    encouragement: candidate.encouragement.trim(),
    strengths: (candidate.strengths as string[]).map((item) => item.trim()),
    consolidationTargets: (candidate.consolidationTargets as string[]).map((item) => item.trim()),
    recommendation: base.recommendation && candidate.recommendationLabel.trim()
      ? { ...base.recommendation, label: candidate.recommendationLabel.trim() }
      : base.recommendation,
  };
}

export function createConfiguredOpenAISummaryWriter(base: PedagogicalSummary, environment: Record<string, string | undefined> = process.env, fetcher?: FetchLike) {
  return writePersonalizedSummary(base, {
    apiKey: environment.OPENAI_API_KEY ?? "",
    model: environment.SOCRATO_PEDAGOGICAL_AI_MODEL ?? "",
    fetch: fetcher,
  });
}

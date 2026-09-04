import { randomUUID } from "node:crypto";
import { getSocratoDatabase } from "./database";

type AnalysisFailure = { activityId: string; questionId: string; attemptNumber: number; durationMs: number; error: unknown };

function errorDetails(error: unknown) {
  const candidate = error as { status?: unknown; requestId?: unknown; name?: unknown; message?: unknown };
  const status = typeof candidate?.status === "number" ? candidate.status : null;
  const message = typeof candidate?.message === "string" ? candidate.message : "unknown";
  const kind = message.includes("délai") || candidate?.name === "AbortError" ? "timeout"
    : status === 429 ? "rate_limit" : status ? "http" : error instanceof TypeError ? "network" : "invalid_response";
  return { kind, status, requestId: typeof candidate?.requestId === "string" ? candidate.requestId : null };
}

/** Enregistre uniquement des métadonnées techniques, jamais l'identité ni la réponse de l'élève. */
export async function recordStudentAnalysisFailure(failure: AnalysisFailure) {
  const details = errorDetails(failure.error);
  console.error("[student-analysis-failure]", { ...details, activityId: failure.activityId, questionId: failure.questionId, attemptNumber: failure.attemptNumber, durationMs: failure.durationMs });
  try {
    const sql = getSocratoDatabase();
    await sql`
      insert into socrato.student_analysis_failures (
        id, activity_id, question_id, attempt_number, failure_kind, http_status, request_id, duration_ms, occurred_at
      ) values (
        ${randomUUID()}, ${failure.activityId}, ${failure.questionId}, ${failure.attemptNumber}, ${details.kind},
        ${details.status}, ${details.requestId}, ${failure.durationMs}, now()
      )
    `;
  } catch (loggingError) {
    console.error("[student-analysis-failure-log-unavailable]", loggingError instanceof Error ? loggingError.message : "unknown");
  }
}

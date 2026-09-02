"use server";

import { cookies } from "next/headers";
import { getStudentAccessRuntime, STUDENT_SESSION_COOKIE } from "@/lib/student-access/local-runtime";
import { createConfiguredOpenAISummaryWriter } from "@/lib/pedagogical-session-engine/openai-summary";
import type { PedagogicalSummary } from "@/lib/pedagogical-session-engine/types";
import { getSocratoDatabase } from "@/lib/server/database";

const RESULT_STATUSES = new Set(["mastered", "to_consolidate", "to_work_on"]);

function validSummary(value: unknown): value is PedagogicalSummary {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  const texts = (input: unknown) => Array.isArray(input) && input.length <= 120 && input.every((entry) => typeof entry === "string" && entry.length <= 500);
  const results = (input: unknown) => Array.isArray(input) && input.every((entry) => entry && typeof entry === "object" && typeof (entry as Record<string, unknown>).id === "string" && RESULT_STATUSES.has(String((entry as Record<string, unknown>).status)));
  return typeof item.sessionId === "string" && typeof item.activityId === "string" && typeof item.notionId === "string"
    && typeof item.encouragement === "string" && texts(item.strengths) && texts(item.consolidationTargets)
    && results(item.operationResults) && results(item.historicalKnowledgeResults) && Array.isArray(item.workbookReferences)
    && typeof item.localDemoNotice === "string" && typeof item.completedAt === "string";
}

export async function personalizeCompletedStudentSummary(summary: PedagogicalSummary) {
  if (!validSummary(summary)) return { ok: false as const, summary, usedFallback: true as const };
  if (process.env.SOCRATO_PEDAGOGICAL_ANALYZER !== "openai") return { ok: true as const, summary, usedFallback: true as const };
  const token = (await cookies()).get(STUDENT_SESSION_COOKIE)?.value;
  const studentSession = token ? await getStudentAccessRuntime().sessions.findActiveByToken(token) : null;
  if (!studentSession) return { ok: true as const, summary, usedFallback: true as const };

  try {
    const sql = getSocratoDatabase();
    const rows = await sql<{ allowed: boolean }[]>`
      select true as allowed
      from socrato.activities a
      join socrato.activity_group_assignments aga on aga.activity_id = a.id
      join socrato.group_memberships gm on gm.group_id = aga.group_id and gm.active = true
      where a.id = ${summary.activityId} and a.publication_status = ${"published"}
        and gm.student_id = ${studentSession.anonymousStudentId}
        and (aga.id not like 'personal-%' or aga.id = 'personal-' || a.id || '-' || gm.student_id)
        and ${summary.notionId} = any(a.notion_ids)
      limit 1
    `;
    if (!rows[0]?.allowed) return { ok: true as const, summary, usedFallback: true as const };
    return { ok: true as const, summary: await createConfiguredOpenAISummaryWriter(summary), usedFallback: false as const };
  } catch {
    return { ok: true as const, summary, usedFallback: true as const };
  }
}

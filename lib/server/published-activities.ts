import { LOCAL_ACADEMIC_CONTEXT } from "../academic-context/index.ts";
import { normalizePublishedActivityContract, type PublishedActivityContract } from "../activity-contract/index.ts";
import type { TeacherActor } from "../authentication/teacher-session.ts";
import { getSocratoDatabase } from "./database.ts";

export function validateDemoPublishedActivity(value: unknown): PublishedActivityContract {
  const activity = normalizePublishedActivityContract(value);
  if (!activity) throw new Error("L’activité à publier est invalide.");
  const allowedGroups = new Set(LOCAL_ACADEMIC_CONTEXT.groups.map(({ id }) => id));
  if (activity.targetedGroupIds.length === 0 || activity.targetedGroupIds.some((id) => !allowedGroups.has(id))) {
    throw new Error("L’activité contient un groupe qui n’appartient pas à l’enseignant local.");
  }
  return activity;
}

export async function saveDemoPublishedActivity(value: unknown, teacher: TeacherActor) {
  if (process.env.SOCRATO_DEMO_DATABASE_WRITES !== "enabled") {
    throw new Error("La publication locale vers Supabase n’est pas activée.");
  }
  const activity = normalizePublishedActivityContract(value);
  if (!activity) throw new Error("L’activité à publier est invalide.");
  const sql = getSocratoDatabase();
  const ownedGroups = await sql<{ id: string }[]>`
    select id
    from socrato.groups
    where teacher_id = ${teacher.id}
      and archived_at is null
      and id = any(${activity.targetedGroupIds})
  `;
  const ownedGroupIds = new Set(ownedGroups.map(({ id }) => id));
  if (activity.targetedGroupIds.length === 0 || activity.targetedGroupIds.some((id) => !ownedGroupIds.has(id))) {
    throw new Error("L’activité contient un groupe qui n’appartient pas à l’enseignant.");
  }

  await sql.begin(async (transaction) => {
    await transaction`
      insert into socrato.activities (
        id, schema_version, teacher_id, title, work_type, notion_ids, operation_id,
        question_ids, publication_status, published_at, updated_at
      ) values (
        ${activity.id}, ${activity.schemaVersion}, ${teacher.id}, ${activity.title}, ${activity.workType},
        ${activity.notionIds}, ${activity.operationId}, ${activity.questionIds}, ${activity.publicationStatus},
        ${activity.publishedAt}, ${activity.updatedAt}
      )
      on conflict (id) do update set
        title = excluded.title,
        work_type = excluded.work_type,
        notion_ids = excluded.notion_ids,
        operation_id = excluded.operation_id,
        question_ids = excluded.question_ids,
        publication_status = excluded.publication_status,
        updated_at = excluded.updated_at
    `;
    await transaction`delete from socrato.activity_group_assignments where activity_id = ${activity.id}`;
    for (const groupId of activity.targetedGroupIds) {
      await transaction`
        insert into socrato.activity_group_assignments (id, activity_id, group_id)
        values (${`${activity.id}-${groupId}`}, ${activity.id}, ${groupId})
      `;
    }
  });

  return activity;
}

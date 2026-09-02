import { notFound } from "next/navigation";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { getStoredTeacherStudentDetail, listStoredTeacherGroups } from "@/lib/server/teacher-groups";
import { getStoredTeacherActivityForEditing } from "@/lib/server/teacher-activities";
import { isLocalActivityCreatorEnabled, LocalActivityCreatorProvider } from "@/lib/teacher-activity-creator";
import { TeacherActivityCreatorView } from "./teacher-activity-creator-view";
import { createCatalogLearningSessionQuestions } from "@/lib/student-learning-session/demo-provider";
import "./teacher-activity-creator.css";
import "./student-preview-frame.css";

export const dynamic = "force-dynamic";

export default async function TeacherActivityCreatorPage({ searchParams }: { searchParams: Promise<{ edit?: string | string[]; consolidationStudent?: string; consolidationGroup?: string; operation?: string; knowledge?: string; mode?: string; understand?: string; groups?: string | string[] }> }) {
  if (!isLocalActivityCreatorEnabled()) notFound();
  const teacher = await requireTeacherActor();
  const requested = await searchParams;
  const requestedEdit = requested.edit;
  const editId = typeof requestedEdit === "string" ? requestedEdit : requestedEdit?.[0];
  const [catalog, storedGroups, editingActivity] = await Promise.all([
    new LocalActivityCreatorProvider().getCatalog(),
    listStoredTeacherGroups(teacher.id),
    editId && /^activity-[a-z0-9-]+$/.test(editId) ? getStoredTeacherActivityForEditing(teacher.id, editId) : Promise.resolve(null),
  ]);
  const safeTargetIds = requested.consolidationStudent && requested.consolidationGroup
    && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(requested.consolidationStudent)
    && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(requested.consolidationGroup);
  const targetStudent = safeTargetIds
    ? await getStoredTeacherStudentDetail(teacher, requested.consolidationGroup!, requested.consolidationStudent!)
    : null;
  const consolidationQuestions = createCatalogLearningSessionQuestions(catalog.questions.map(({ id }) => id)).questions;
  const preferredQuestionIds = consolidationQuestions.filter((question) =>
    (!requested.operation || question.primaryOperationId === requested.operation)
    && (!requested.knowledge || question.historicalKnowledgeIds.includes(requested.knowledge))).map(({ id }) => id);
  const consolidationTarget = targetStudent ? {
    studentId: targetStudent.id,
    groupId: targetStudent.groupId,
    displayLabel: targetStudent.displayLabel,
    operationId: requested.operation && catalog.operations.some(({ id }) => id === requested.operation) ? requested.operation : null,
    knowledgeId: requested.knowledge ?? null,
    preferredQuestionIds,
  } : null;
  const activityCatalog = consolidationTarget ? {
    ...catalog,
    questions: catalog.questions.filter(({ format }) => format !== "interactive-timeline" && format !== "interactive-association"),
  } : catalog;
  const initialUnderstandingOperationId = requested.understand === "causes_and_consequences" ? requested.understand : null;
  const requestedGroupIds = (Array.isArray(requested.groups) ? requested.groups : requested.groups ? [requested.groups] : []).filter((id) => storedGroups.some((group) => group.id === id));
  return <TeacherActivityCreatorView initialTargetGroupIds={initialUnderstandingOperationId ? requestedGroupIds : null} initialUnderstandingOperationId={initialUnderstandingOperationId} classroomMode={requested.mode === "classroom"} consolidationTarget={consolidationTarget} editingActivity={editingActivity ? { id: editingActivity.id, title: editingActivity.title, workType: editingActivity.work_type, notionIds: editingActivity.notion_ids, operationId: editingActivity.operation_id, questionIds: editingActivity.question_ids, targetedGroupIds: editingActivity.targeted_group_ids, publishedAt: editingActivity.published_at.toISOString() } : null} catalog={{
    ...activityCatalog,
    groups: storedGroups.map(({ id, name }) => ({ id, name })),
  }} />;
}

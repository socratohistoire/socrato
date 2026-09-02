import { notFound } from "next/navigation";
import { StudentLearningSessionView } from "@/app/eleve/activite/[activityId]/session-view";
import { createDemoStudentLearningSession } from "@/lib/student-learning-session/demo-provider";
import { createLocalActivityPreview, getEligibleActivityQuestions, LocalActivityCreatorProvider, type ActivityConfiguration, type WorkType } from "@/lib/teacher-activity-creator";
import "../../../../eleve/activite/[activityId]/session.css";
import "./student-preview.css";

export default async function StudentActivityPreviewPage({ searchParams }: { searchParams: Promise<{ notion?: string; notions?: string; title?: string; variant?: string; workType?: string; operation?: string; questionIds?: string; questionNumber?: string; published?: string; embedded?: string; activityId?: string; publishedActivityId?: string; classroom?: string }> }) {
  const { notion = "acte-union", notions, title, variant, workType, operation, questionIds, questionNumber, published, embedded, activityId, publishedActivityId, classroom } = await searchParams;
  const data = createDemoStudentLearningSession("demo-activity-acte-union", notion, "teacher-assigned");
  if (!data) notFound();
  const catalog = await new LocalActivityCreatorProvider().getCatalog();
  const selectedWorkType: WorkType = workType === "enrichment" || workType === "development" ? workType : "revision";
  const config: ActivityConfiguration = {
    title: title?.trim() || data.activityTitle,
    durationMinutes: 10,
    questionCount: 1,
    selectedGroupIds: [],
    workType: selectedWorkType,
    notionIds: notions?.split(",").filter(Boolean) ?? [notion],
    operationId: operation?.trim() || null,
    questionValidated: false,
  };
  const eligibleQuestions = getEligibleActivityQuestions(config, catalog);
  const requestedIds = questionIds?.split(",").filter(Boolean) ?? [];
  const variants = requestedIds.length > 0
    ? requestedIds.map((id) => eligibleQuestions.findIndex((question) => question.id === id)).filter((index) => index >= 0)
    : [Number.parseInt(variant ?? "0", 10) || 0];
  const previews = variants.map((previewVariant) => createLocalActivityPreview(config, catalog, previewVariant));
  const questions = previews.map((preview, index) => ({
    id: preview.questionId ?? `teacher-preview-${variants[index] ?? index}`,
    format: preview.format,
    type: preview.causalChainInteraction ? "interactive_causal_chain" as const
      : preview.format === "interactive-timeline" ? "interactive_timeline" as const
      : preview.format === "interactive-association" ? "interactive_association" as const
      : preview.format === "multiple-choice" ? "multiple_choice" as const
      : preview.documents.length > 0 ? "question_with_documents" as const
      : "question_without_documents" as const,
    number: requestedIds.length === 1 ? Math.max(1, Number.parseInt(questionNumber ?? "1", 10) || 1) : index + 1,
    prompt: preview.question,
    instruction: preview.instruction,
    primaryOperationId: preview.operationId,
    featuredDocumentId: preview.documents[0]?.id,
    intellectualOperations: [{ id: preview.operationId, label: preview.operationLabel }],
    historicalKnowledgeIds: [...preview.historicalKnowledgeIds],
    documentRelations: preview.documents.map(({ id }, index) => ({ documentId: id, displayOrder: index + 1 })),
    requiredDocumentIds: preview.documents.map(({ id }) => id),
    localHint: preview.instruction,
    initialMessages: [{ id: `teacher-preview-welcome-${index}`, author: "socrato" as const, content: preview.guidance[0] }],
    answerOptions: preview.answerOptions,
    answerExplanation: preview.answerExplanation,
    timelineInteraction: preview.timelineInteraction,
    associationInteraction: preview.associationInteraction,
    causalChainInteraction: preview.causalChainInteraction,
  }));
  const documentCatalog = Array.from(new Map(previews.flatMap(({ documents }) => documents).map((document) => [document.id, document])).values());
  const preview = previews[0];
  if (!preview) notFound();
  const resolvedActivityId = published === "1" && (activityId || publishedActivityId) ? (activityId || publishedActivityId)! : data.activityId;
  return <div className={`student-preview-surface${classroom === "1" ? " student-preview-surface--classroom" : ""}${embedded === "1" ? " student-preview-surface--embedded" : ""}`}><StudentLearningSessionView classroomMode={classroom === "1"} teacherApiTest teacherPreview={classroom !== "1" && embedded !== "1" && published !== "1"} persistProgress={published === "1"} data={{ ...data, id: resolvedActivityId, activityId: resolvedActivityId, activityTitle: config.title, notionTitle: preview.notionTitle, questions, documentCatalog, dashboardHref: `/eleve/tableau-de-bord?activity=${encodeURIComponent(resolvedActivityId)}#activite` }} /></div>;
}

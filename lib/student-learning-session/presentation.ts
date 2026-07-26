import type { StudentLearningSessionData } from "./types.ts";

export function getCurrentLearningQuestion(data: StudentLearningSessionData) {
  return data.questions[data.currentQuestionIndex] ?? null;
}

export function getQuestionDocuments(data: StudentLearningSessionData) {
  const question = getCurrentLearningQuestion(data);
  if (!question) return [];
  const byId = new Map(data.documentCatalog.map((document) => [document.id, document]));
  return [...question.documentRelations]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .flatMap((relation) => {
      const document = byId.get(relation.documentId);
      return document ? [{ ...document, displayOrder: relation.displayOrder }] : [];
    });
}

export function getInitialQuestionDocument(data: StudentLearningSessionData) {
  const question = getCurrentLearningQuestion(data);
  const documents = getQuestionDocuments(data);
  if (!question || documents.length === 0) return null;
  const featured = question.featuredDocumentId
    ? documents.find(({ id }) => id === question.featuredDocumentId)
    : undefined;
  return featured ?? documents.find(({ content }) => content.kind === "historical_image") ?? documents[0];
}

export function getLearningSessionProgress(data: StudentLearningSessionData) {
  const total = data.questions.length;
  const current = total === 0 ? 0 : data.currentQuestionIndex + 1;
  return {
    current,
    total,
    percent: total === 0 ? 0 : Math.round((current / total) * 100),
  };
}

export function getLearningSessionHeading(data: StudentLearningSessionData) {
  const isTeacherAssigned = data.origin === "teacher_assigned";
  return {
    primaryTitle: isTeacherAssigned ? data.activityTitle : data.notionTitle,
    contextualNotion: isTeacherAssigned ? data.notionTitle : null,
  };
}

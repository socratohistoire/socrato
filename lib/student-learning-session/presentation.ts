import type { StudentLearningSessionData } from "./types.ts";

export function getCurrentLearningQuestion(data: StudentLearningSessionData) {
  return data.questions[data.currentQuestionIndex] ?? null;
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

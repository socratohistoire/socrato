import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { CausesConsequencesLearningAnalyzer } from "../lib/pedagogical-session-engine/causes-consequences-learning-analyzer.ts";
import { createPedagogicalQuestionDefinition } from "../lib/pedagogical-session-engine/question-context.ts";
import { createCatalogLearningSessionQuestions } from "../lib/student-learning-session/demo-provider.ts";
import {
  CAUSES_CONSEQUENCES_LEARNING_QUESTION_ID,
  INTELLECTUAL_OPERATION_LEARNING_DOCUMENTS,
} from "../lib/teacher-activity-creator/intellectual-operation-learning.ts";
import type { StudentResponse } from "../lib/pedagogical-session-engine/types.ts";

const groupViewPath = new URL("../app/teacher/activities/[activityId]/groups/[groupId]/teacher-group-detail-view.tsx", import.meta.url);
const operationPagePath = new URL("../app/teacher/activities/intellectual-operations/page.tsx", import.meta.url);
const creatorPagePath = new URL("../app/teacher/activities/new/page.tsx", import.meta.url);
const creatorViewPath = new URL("../app/teacher/activities/new/teacher-activity-creator-view.tsx", import.meta.url);
const publicationPath = new URL("../lib/server/published-activities.ts", import.meta.url);
const sessionProviderPath = new URL("../lib/student-learning-session/database-provider.ts", import.meta.url);
const dashboardProviderPath = new URL("../lib/student-dashboard/database-provider.ts", import.meta.url);
const progressActionsPath = new URL("../app/eleve/activite/progress-actions.ts", import.meta.url);

test("conserve l’élève ciblé du groupe jusqu’à la publication du guidage", async () => {
  const [groupView, operationPage, creatorPage, creatorView, publication] = await Promise.all([
    readFile(groupViewPath, "utf8"),
    readFile(operationPagePath, "utf8"),
    readFile(creatorPagePath, "utf8"),
    readFile(creatorViewPath, "utf8"),
    readFile(publicationPath, "utf8"),
  ]);

  assert.match(groupView, /intellectual-operations\?\$\{guidanceParams\.toString\(\)\}/);
  assert.match(groupView, /new URLSearchParams\(\{ student: student\.id, group: groupId \}\)/);
  assert.match(operationPage, /getStoredTeacherStudentDetail\(teacher/);
  assert.match(operationPage, /name="consolidationStudent" value=\{targetStudent\.id\}/);
  assert.match(operationPage, /name="consolidationGroup" value=\{targetStudent\.groupId\}/);
  assert.match(operationPage, /name="understand" value="causes_and_consequences"/);
  assert.match(creatorPage, /initialUnderstandingOperationId/);
  assert.match(creatorView, /savePersonalizedPublishedActivity|publishActivityToSupabase\(publishedActivity, consolidationTarget/);
  assert.match(publication, /g\.teacher_id = \$\{teacher\.id\}/);
  assert.match(publication, /s\.id = \$\{target\.studentId\}/);
  assert.match(publication, /personal-\$\{activity\.id\}-\$\{target\.studentId\}/);
});

test("isole l’assignation, la progression et le bilan au bon élève", async () => {
  const [sessionProvider, dashboardProvider, progressActions] = await Promise.all([
    readFile(sessionProviderPath, "utf8"),
    readFile(dashboardProviderPath, "utf8"),
    readFile(progressActionsPath, "utf8"),
  ]);
  const personalAssignmentGuard = /aga\.id not like 'personal-%' or aga\.id = 'personal-' \|\| a\.id \|\| '-' \|\| \$\{anonymousStudentId\}/;

  assert.match(sessionProvider, personalAssignmentGuard);
  assert.match(dashboardProvider, personalAssignmentGuard);
  assert.match(progressActions, /aga\.id not like 'personal-%'/);
  assert.match(progressActions, /saveStudentProgressToDatabase/);
  assert.match(progressActions, /saveStudentOutcomeToDatabase/);
});

test("prépare trois sources et réserve les interventions illimitées au guidage", () => {
  const session = createCatalogLearningSessionQuestions([CAUSES_CONSEQUENCES_LEARNING_QUESTION_ID]);
  assert.equal(session.questions.length, 1);
  assert.equal(session.questions[0]?.id, CAUSES_CONSEQUENCES_LEARNING_QUESTION_ID);
  assert.equal(session.questions[0]?.maxAttempts, null);
  assert.deepEqual(session.documents.map(({ id }) => id), INTELLECTUAL_OPERATION_LEARNING_DOCUMENTS.map(({ id }) => id));

  const ordinary = createCatalogLearningSessionQuestions(["question:acte-union:001"]);
  assert.notEqual(ordinary.questions[0]?.maxAttempts, null);
});

test("mène le guidage cause → événement → conséquence jusqu’à sa conclusion", async () => {
  const session = createCatalogLearningSessionQuestions([CAUSES_CONSEQUENCES_LEARNING_QUESTION_ID]);
  const question = session.questions[0];
  assert.ok(question);
  const definition = createPedagogicalQuestionDefinition(question, "acte-union", "Acte d’union", session.documents);
  const analyzer = new CausesConsequencesLearningAnalyzer();
  const response = (attemptNumber: number, content: string): StudentResponse => ({
    sessionId: "session-guidage",
    activityId: "activity-guidage",
    questionId: definition.id,
    notionId: definition.notionId,
    primaryOperationId: definition.primaryOperationId,
    operationIds: [...definition.operationIds],
    historicalKnowledgeIds: [...definition.historicalKnowledgeIds],
    documentIds: [...definition.documentIds],
    attemptNumber,
    hintLevel: 0,
    content,
  });

  const event = await analyzer.analyze(response(1, "Les Rébellions des Patriotes de 1837-1838."), definition);
  assert.equal(event.nextAction, "request_revision");
  assert.match(event.missingElements[0] ?? "", /document 1/);

  const cause = await analyzer.analyze(response(2, "Londres refuse les demandes et provoque le mécontentement."), definition);
  assert.equal(cause.nextAction, "request_revision");
  assert.match(cause.missingElements[0] ?? "", /document 3/);

  const consequence = await analyzer.analyze(response(3, "Après les Rébellions, lord Durham est envoyé pour enquêter et recommander des changements."), definition);
  assert.equal(consequence.nextAction, "complete_question");
  assert.equal(consequence.pedagogicalOutcome, "satisfactory");
  assert.deepEqual(consequence.usedDocumentIds, definition.documentIds);
});

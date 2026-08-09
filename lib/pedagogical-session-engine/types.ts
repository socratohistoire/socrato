export const MAX_PEDAGOGICAL_ATTEMPTS = 3 as const;
export const MAX_EXPLICIT_HINT_LEVEL = 2 as const;

export type HintLevel = 0 | 1 | 2;
export type ExplicitHintLevel = Exclude<HintLevel, 0>;
export type ResponseDisposition =
  | "substantive"
  | "too_short"
  | "help_request"
  | "answer_request"
  | "playful_diversion"
  | "off_topic"
  | "incomprehensible"
  | "nonsense_or_spam"
  | "inappropriate";
export type AssessmentLevel = "demonstrated" | "partial" | "not_demonstrated" | "not_assessed";
export type PedagogicalOutcome = "satisfactory" | "partially_satisfactory" | "insufficient" | "non_exploitable";
export type NextAction = "complete_question" | "request_revision" | "offer_hint" | "handle_non_exploitable";
export type ResultStatus = "mastered" | "to_consolidate" | "to_work_on";

export type PedagogicalIdentifiers = {
  sessionId: string;
  activityId: string;
  questionId: string;
  notionId: string;
  primaryOperationId: string;
  operationIds: string[];
  historicalKnowledgeIds: string[];
  documentIds: string[];
};

export type StudentResponse = PedagogicalIdentifiers & {
  attemptNumber: number;
  hintLevel: HintLevel;
  content: string;
  priorTurn?: {
    pedagogicalOutcome: PedagogicalOutcome;
    observedStrengths: string[];
    missingElements: string[];
  };
};

export type StructuredResponseAnalysis = {
  responseDisposition: ResponseDisposition;
  pedagogicalOutcome: PedagogicalOutcome;
  historicalAccuracy: AssessmentLevel;
  documentUse: AssessmentLevel;
  justificationQuality: AssessmentLevel;
  primaryOperationPerformance: AssessmentLevel;
  demonstratedKnowledgeIds: string[];
  observedOperationIds: string[];
  usedDocumentIds: string[];
  observedStrengths: string[];
  missingElements: string[];
  nextAction: NextAction;
  confidence: "low" | "medium" | "high";
};

export type PedagogicalFeedback = {
  acknowledgement?: string;
  assessment: string;
  missingElement?: string;
  priorityPrompt?: string;
  resourceDirection?: string;
  studentFacingText: string;
  technicalNotice?: string;
  relatedRuleIds: string[];
};

export type PedagogicalHint = {
  level: ExplicitHintLevel;
  text: string;
  documentId?: string;
  workbookReferenceId?: string;
  relatedRuleIds: string[];
};

export type WorkbookReference = {
  id: string;
  workbookId: string;
  editionId: string;
  label: string;
  pageRange: string;
  historicalKnowledgeIds: string[];
  approvedByTeacher: boolean;
};

export type PedagogicalQuestionDefinition = {
  id: string;
  notionId: string;
  primaryOperationId: string;
  operationIds: string[];
  historicalKnowledgeIds: string[];
  documentIds: string[];
  requiredDocumentIds: string[];
  hintSequence: Record<ExplicitHintLevel, string>;
  evaluationContext?: {
    questionPrompt: string;
    instruction: string;
    notionTitle: string;
    primaryOperationLabel: string;
    successCriteria: string[];
    referenceMonograph: {
      id: string;
      title: string;
      scope: string;
      scopeBoundary: string;
      sections: Array<{ id: string; title: string; paragraphs: Array<{ id: string; text: string; sourceIds: string[] }> }>;
    };
    pedagogicalRules: string[];
    approvedDocuments: Array<{
      id: string;
      title: string;
      typeLabel: string;
      attribution: string;
      content: string;
    }>;
  };
};

export type PedagogicalSessionDefinition = {
  sessionId: string;
  activityId: string;
  notionId: string;
  questions: PedagogicalQuestionDefinition[];
  dashboardHref: string;
};

export type QuestionResult = PedagogicalIdentifiers & {
  attemptNumber: number;
  hintLevel: HintLevel;
  status: ResultStatus;
  advancedMastery: boolean;
  demonstratedKnowledgeIds: string[];
  demonstratedOperationIds: string[];
  observedStrengths: string[];
  consolidationTargets: string[];
  completedAt: string;
};

export type QuestionRuntimeState = PedagogicalIdentifiers & {
  attemptNumber: number;
  hintLevel: HintLevel;
  hintRequestCount: number;
  nonExploitableCount: number;
  status: "presented" | "awaiting_response" | "completed";
  lastAnalysis?: StructuredResponseAnalysis;
  result?: QuestionResult;
};

export type PedagogicalResultEntry = {
  id: string;
  status: ResultStatus;
};

export type ConsolidationRecommendation = {
  kind: "optional_consolidation";
  targetOperationIds: string[];
  targetHistoricalKnowledgeIds: string[];
  label: string;
};

export type PedagogicalSummary = {
  sessionId: string;
  activityId: string;
  notionId: string;
  encouragement: string;
  strengths: string[];
  consolidationTargets: string[];
  operationResults: PedagogicalResultEntry[];
  historicalKnowledgeResults: PedagogicalResultEntry[];
  recommendation?: ConsolidationRecommendation;
  workbookReferences: WorkbookReference[];
  localDemoNotice: string;
  completedAt: string;
};

export type PedagogicalSessionState = {
  sessionId: string;
  activityId: string;
  notionId: string;
  dashboardHref: string;
  status: "active" | "completed";
  currentQuestionIndex: number;
  questionStates: QuestionRuntimeState[];
  summary?: PedagogicalSummary;
};

export type PedagogicalTransition = {
  state: PedagogicalSessionState;
  feedback?: PedagogicalFeedback;
  hint?: PedagogicalHint;
  questionCompleted: boolean;
  sessionCompleted: boolean;
};

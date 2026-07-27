import type {
  PedagogicalQuestionDefinition,
  PedagogicalSessionState,
  PedagogicalSummary,
  StructuredResponseAnalysis,
  StudentResponse,
  WorkbookReference,
} from "./types.ts";

export interface ResponseAnalyzer {
  analyze(response: StudentResponse, question: PedagogicalQuestionDefinition): Promise<unknown>;
}

export interface TemporarySessionRepository {
  findById(sessionId: string): Promise<PedagogicalSessionState | null>;
  save(state: PedagogicalSessionState): Promise<void>;
  delete(sessionId: string): Promise<void>;
}

export interface SummaryProducer {
  produce(state: PedagogicalSessionState, workbookReferences: WorkbookReference[]): Promise<PedagogicalSummary>;
}

export interface PedagogicalOutcomeRepository {
  saveSummary(summary: PedagogicalSummary): Promise<void>;
  findSummaryByActivityId(activityId: string): Promise<PedagogicalSummary | null>;
  deleteConversation(sessionId: string): Promise<void>;
}

export interface PedagogicalClock {
  now(): Date;
}

export interface WorkbookReferenceProvider {
  findApprovedForKnowledgeIds(historicalKnowledgeIds: string[]): Promise<WorkbookReference[]>;
}

export type ValidatedResponseAnalyzer = {
  analyze(response: StudentResponse, question: PedagogicalQuestionDefinition): Promise<StructuredResponseAnalysis>;
};

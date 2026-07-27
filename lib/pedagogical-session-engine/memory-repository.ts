import type { PedagogicalOutcomeRepository, TemporarySessionRepository } from "./ports.ts";
import type { PedagogicalSessionState, PedagogicalSummary } from "./types.ts";

export const TEMPORARY_SESSION_NOTICE = "État temporaire en mémoire : toutes les données sont perdues au redémarrage.";

export class InMemoryTemporarySessionRepository implements TemporarySessionRepository {
  private readonly states = new Map<string, PedagogicalSessionState>();

  constructor(environment = process.env.NODE_ENV) {
    if (environment === "production") throw new Error("The in-memory pedagogical session repository is disabled in production.");
  }

  async findById(sessionId: string) { return this.states.get(sessionId) ?? null; }
  async save(state: PedagogicalSessionState) { this.states.set(state.sessionId, structuredClone(state)); }
  async delete(sessionId: string) { this.states.delete(sessionId); }
}

export class InMemoryPedagogicalOutcomeRepository implements PedagogicalOutcomeRepository {
  private readonly summaries = new Map<string, PedagogicalSummary>();
  private readonly clearedConversationIds = new Set<string>();

  constructor(environment = process.env.NODE_ENV) {
    if (environment === "production") throw new Error("The in-memory pedagogical outcome repository is disabled in production.");
  }

  async saveSummary(summary: PedagogicalSummary) { this.summaries.set(summary.activityId, structuredClone(summary)); }
  async findSummaryByActivityId(activityId: string) { return this.summaries.get(activityId) ?? null; }
  async deleteConversation(sessionId: string) { this.clearedConversationIds.add(sessionId); }
  wasConversationDeleted(sessionId: string) { return this.clearedConversationIds.has(sessionId); }
}

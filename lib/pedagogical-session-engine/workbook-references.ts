import type { WorkbookReferenceProvider } from "./ports.ts";
import type { WorkbookReference } from "./types.ts";

export function validateWorkbookReference(reference: WorkbookReference): WorkbookReference {
  if (!reference.approvedByTeacher) throw new Error("La référence au cahier n’est pas approuvée par l’enseignant.");
  if (!reference.workbookId || !reference.editionId || !reference.label || !reference.pageRange) {
    throw new Error("La référence au cahier est incomplète.");
  }
  return reference;
}

export class EmptyWorkbookReferenceProvider implements WorkbookReferenceProvider {
  async findApprovedForKnowledgeIds(historicalKnowledgeIds: string[]): Promise<WorkbookReference[]> {
    void historicalKnowledgeIds;
    return [];
  }
}

export class LocalWorkbookReferenceProvider implements WorkbookReferenceProvider {
  constructor(private readonly references: WorkbookReference[]) {}

  async findApprovedForKnowledgeIds(historicalKnowledgeIds: string[]) {
    const requestedIds = new Set(historicalKnowledgeIds);
    return this.references
      .map(validateWorkbookReference)
      .filter(({ historicalKnowledgeIds: ids }) => ids.some((id) => requestedIds.has(id)));
  }
}

export type KnowledgeScrollState = {
  hasOverflow: boolean;
  isAtEnd: boolean;
};

export function getKnowledgeScrollState(
  scrollTop: number,
  clientHeight: number,
  scrollHeight: number,
): KnowledgeScrollState {
  const hasOverflow = scrollHeight - clientHeight > 2;
  const isAtEnd = !hasOverflow || scrollTop + clientHeight >= scrollHeight - 2;

  return { hasOverflow, isAtEnd };
}

export function getNextKnowledgeScrollTop(
  scrollTop: number,
  clientHeight: number,
  scrollHeight: number,
): number {
  return Math.min(scrollTop + clientHeight * 0.88, scrollHeight - clientHeight);
}

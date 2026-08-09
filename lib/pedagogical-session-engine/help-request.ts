export type HelpRequestKind = "forgotten" | "needs_method" | "asks_for_answer" | "general";

export function explicitHelpRequestKind(content: string): HelpRequestKind | null {
  const normalized = content.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr-CA").trim();
  if (/\b(donne[- ]?moi|dis[- ]?moi|ecris|reponds)(?:-moi)?\s+(?:la |l['’]|une )?(?:bonne )?reponse\b|\bquelle est la reponse\b/.test(normalized)) return "asks_for_answer";
  if (/\b(je ne sais pas comment|je sais pas comment|comment (?:faire|repondre|commencer)|aide[- ]?moi a commencer)\b/.test(normalized)) return "needs_method";
  if (/\b(je ne sais plus|je sais plus|je ne me souviens plus|je me souviens plus|aucune idee)\b/.test(normalized)) return "forgotten";
  if (/\b(je ne sais pas|je sais pas|aide[- ]?moi|peux[- ]?tu m['’]?aider)\b/.test(normalized)) return "general";
  return null;
}

export function isExplicitHelpRequest(content: string) {
  return explicitHelpRequestKind(content) !== null;
}

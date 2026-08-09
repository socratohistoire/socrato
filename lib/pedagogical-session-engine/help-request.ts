export type HelpRequestKind = "forgotten" | "needs_method" | "asks_for_answer" | "general";

function asksForCompleteAnswer(normalized: string) {
  const namesAnswer = /\b(reponse|solution|quoi (?:ecrire|dire|repondre))\b/.test(normalized);
  const requestsIt = /\b(je (?:veux|voudrais|souhaite)|donne|dis|ecris|reponds|revele|montre|peux[- ]?tu|pourrais[- ]?tu|c['’ ]?est quoi|quelle est)\b/.test(normalized);
  const delegatesWork = /\b(fais|fait|reponds|ecris)(?:-le|-la)?\s+(?:a ma place|pour moi)\b/.test(normalized);
  return (namesAnswer && requestsIt) || delegatesWork;
}

export function explicitHelpRequestKind(content: string): HelpRequestKind | null {
  const normalized = content.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr-CA").trim();
  if (asksForCompleteAnswer(normalized)) return "asks_for_answer";
  if (/\b(je ne sais pas comment|je sais pas comment|comment (?:faire|repondre|commencer)|aide[- ]?moi a commencer)\b/.test(normalized)) return "needs_method";
  if (/\b(je ne sais plus|je sais plus|je ne me souviens plus|je me souviens plus|aucune idee)\b/.test(normalized)) return "forgotten";
  if (/\b(je ne sais pas|je sais pas|aide[- ]?moi|peux[- ]?tu m['’]?aider)\b/.test(normalized)) return "general";
  return null;
}

export function isExplicitHelpRequest(content: string) {
  return explicitHelpRequestKind(content) !== null;
}

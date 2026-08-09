export function isExplicitHelpRequest(content: string) {
  const normalized = content.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr-CA").trim();
  return /\b(je ne sais pas|je sais pas|je ne sais plus|je sais plus|je ne me souviens plus|je me souviens plus|aucune idee|aide[- ]?moi|peux[- ]?tu m['’]?aider)\b/.test(normalized);
}

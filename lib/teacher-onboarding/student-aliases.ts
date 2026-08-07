export type StudentAliasPreview = {
  aliases: string[];
  ambiguousAliases: string[];
  ignoredLineCount: number;
};

function cleanPart(value: string) {
  return value.trim().replace(/\s+/g, " ").replace(/^['\"]|['\"]$/g, "");
}

function aliasFromLine(line: string) {
  const cells = line.split(/[\t;|]/).map(cleanPart).filter(Boolean);
  const normalizedCells = cells.map((cell) => cell.toLocaleLowerCase("fr-CA"));
  if (normalizedCells.includes("nom") && normalizedCells.some((cell) => cell.startsWith("prénom") || cell.startsWith("prenom"))) return null;
  const startsWithIdentifier = cells.length >= 3 && /\d/.test(cells[0]) && !/\s/.test(cells[0]);
  const value = startsWithIdentifier ? `${cells[1]}, ${cells[2]}` : cells.length >= 2 ? `${cells[0]}, ${cells[1]}` : cleanPart(line);
  if (!value) return null;
  const commaParts = value.split(",").map(cleanPart).filter(Boolean);
  let firstName = "";
  let lastName = "";
  if (commaParts.length >= 2) {
    [lastName, firstName] = commaParts;
  } else {
    const words = value.split(/\s+/).filter(Boolean);
    if (words.length < 2) return null;
    firstName = words[0];
    lastName = words.at(-1) ?? "";
  }
  const initial = lastName.match(/[\p{L}]/u)?.[0];
  if (!firstName || !initial) return null;
  return `${firstName} ${initial.toLocaleUpperCase("fr-CA")}.`;
}

export function createStudentAliasPreview(pastedRoster: string): StudentAliasPreview {
  const lines = pastedRoster.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const aliases = lines.map(aliasFromLine).filter((value): value is string => Boolean(value));
  const counts = new Map<string, number>();
  for (const alias of aliases) counts.set(alias, (counts.get(alias) ?? 0) + 1);
  return {
    aliases: [...new Set(aliases)],
    ambiguousAliases: [...counts].filter(([, count]) => count > 1).map(([alias]) => alias),
    ignoredLineCount: lines.length - aliases.length,
  };
}

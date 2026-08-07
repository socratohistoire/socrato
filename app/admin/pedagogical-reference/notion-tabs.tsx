import Link from "next/link";

export const NOTION_SECTIONS = [
  ["lecture", "Monographie"],
  ["documents", "Banque de documents historiques"],
  ["structure", "Structure pédagogique"],
  ["operations", "Opérations intellectuelles"],
  ["appropriation", "Approbation"],
] as const;

export type NotionSectionId = (typeof NOTION_SECTIONS)[number][0];

export function NotionTabs({ notionId, activeSection }: { notionId: string; activeSection: NotionSectionId }) {
  return <nav className="review-tabs notion-tabs" aria-label="Sections de la notion">
    {NOTION_SECTIONS.map(([id, label]) => <Link href={id === "documents" ? `/admin/pedagogical-reference/documents/${notionId}` : `/admin/pedagogical-reference/notions/${notionId}?section=${id}`} className={activeSection === id ? "is-active" : undefined} aria-current={activeSection === id ? "page" : undefined} key={id}>{label}</Link>)}
  </nav>;
}

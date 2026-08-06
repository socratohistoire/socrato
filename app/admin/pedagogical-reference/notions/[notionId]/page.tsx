import Link from "next/link";
import { ACTE_UNION_HISTORICAL_RECORD, getSecondaryFourKnowledgeHeading, getSecondaryFourPeriod } from "@/lib/pedagogical-reference";
import { NotionTabs, type NotionSectionId, NOTION_SECTIONS } from "../../notion-tabs";
import { ReferenceValidationView } from "../../reference-validation-view";
import "../../pedagogical-reference.css";

function isNotionSection(value: string | undefined): value is NotionSectionId {
  return NOTION_SECTIONS.some(([id]) => id === value);
}

export default async function PedagogicalReferenceNotionPage({ params, searchParams }: { params: Promise<{ notionId: string }>; searchParams: Promise<{ section?: string }> }) {
  const [{ notionId }, query] = await Promise.all([params, searchParams]);
  const heading = getSecondaryFourKnowledgeHeading(notionId);
  const period = heading ? getSecondaryFourPeriod(heading.periodId) : undefined;
  const section = isNotionSection(query.section) && query.section !== "documents" ? query.section : "lecture";
  if (notionId === "acte-union") return <ReferenceValidationView record={ACTE_UNION_HISTORICAL_RECORD} initialSection={section} />;
  const notionLabel = heading?.officialLabel ?? notionId;
  return <main className="reference-admin">
    <header className="reference-admin__header"><div><p>Administration · Référentiel pédagogique</p><h1>{notionLabel}</h1><span>{period ? `${period.officialPeriodLabel} · ${period.officialSocialReality}` : "Notion historique"}</span></div><div className="reference-admin__header-actions"><Link href="/admin/pedagogical-reference">Toutes les périodes</Link><Link href="/teacher">Espace enseignant</Link></div></header>
    <NotionTabs notionId={notionId} activeSection={section} />
    <section className="review-section reference-empty"><p>Dossier de la notion</p><h2>{NOTION_SECTIONS.find(([id]) => id === section)?.[1]}</h2><span>Cette section est prête à recevoir le contenu pédagogique de la notion « {notionLabel} ».</span></section>
  </main>;
}

import type { ReferenceSource, ReferenceSourceKind } from "./types.ts";
import {
  ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT,
  ACTE_UNION_BANQ_512_PRISONERS_DOCUMENT,
  ACTE_UNION_BERMUDA_EXILE_DOCUMENT,
  ACTE_UNION_CONSOLIDATED_REVENUE_FUND_DOCUMENT,
  ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT,
  ACTE_UNION_HINCKS_LAFONTAINE_ALLIANCE_DOCUMENT,
  ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT,
  ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT,
  ACTE_UNION_LANGUAGE_ARTICLE_DOCUMENT,
  ACTE_UNION_MAP_ADAPTATION_DRAFT,
  ACTE_UNION_MAP_CANDIDATES,
  ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT,
  ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT,
  ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT,
  ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT,
  ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT,
  PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT,
  PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT,
  PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT,
  PATRIOTES_MINERVE_RESIGNATION_DOCUMENT,
  PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT,
  PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT,
} from "./historical-document-needs.ts";
import { ACTE_UNION_DURHAM_DOCUMENT } from "./historical-document-presentations.ts";
import { ACTE_UNION_DEBT_COMPARISON_CHART, ACTE_UNION_POPULATION_COMPARISON_CHART } from "./historical-comparison-charts.ts";
import {
  ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM,
  ACTE_UNION_STUDENT_TIMELINE,
  PATRIOTES_ICONOGRAPHIC_DOCUMENTS,
  RESPONSIBLE_GOVERNMENT_ICONOGRAPHIC_DOCUMENTS,
} from "./responsible-government-iconography.ts";
import { RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT } from "./responsible-government-electoral-law.ts";

type SourceBearingRecord = {
  id: string;
  title: string;
  sourceUrl: string;
  sourceLocator?: string;
  creator?: string;
  holdingInstitution?: string;
  historicalDate?: string;
};

const DOCUMENTS: readonly SourceBearingRecord[] = [
  ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT,
  ACTE_UNION_BANQ_512_PRISONERS_DOCUMENT,
  ACTE_UNION_BERMUDA_EXILE_DOCUMENT,
  ACTE_UNION_CONSOLIDATED_REVENUE_FUND_DOCUMENT,
  ACTE_UNION_DURHAM_DOCUMENT,
  ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT,
  ACTE_UNION_HINCKS_LAFONTAINE_ALLIANCE_DOCUMENT,
  ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT,
  ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT,
  ACTE_UNION_LANGUAGE_ARTICLE_DOCUMENT,
  ACTE_UNION_MAP_ADAPTATION_DRAFT,
  ...ACTE_UNION_MAP_CANDIDATES,
  ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT,
  ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM,
  ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT,
  ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT,
  ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT,
  ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT,
  ACTE_UNION_DEBT_COMPARISON_CHART,
  ACTE_UNION_POPULATION_COMPARISON_CHART,
  ...PATRIOTES_ICONOGRAPHIC_DOCUMENTS,
  PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT,
  PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT,
  PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT,
  PATRIOTES_MINERVE_RESIGNATION_DOCUMENT,
  PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT,
  PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT,
  RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT,
  ...RESPONSIBLE_GOVERNMENT_ICONOGRAPHIC_DOCUMENTS,
  ...ACTE_UNION_STUDENT_TIMELINE.entries.map((entry, index) => ({
    id: `${ACTE_UNION_STUDENT_TIMELINE.id}-source-${index + 1}`,
    title: `${entry.credit} — ${entry.title}`,
    sourceUrl: entry.sourceUrl,
    sourceLocator: `${entry.date} — ${entry.title}; image utilisée dans la frise chronologique.`,
    creator: entry.credit,
    holdingInstitution: "Source indiquée dans la frise chronologique",
    historicalDate: entry.date,
  })),
];

function sourceKind(url: string): ReferenceSourceKind {
  if (/assnat\.qc\.ca|canada\.ca|gc\.ca|parliament\.uk/.test(url)) return "government";
  if (/banq\.qc\.ca|canadiana\.ca|bac-lac\.gc\.ca|collectionscanada\.gc\.ca|historymuseum\.ca|loc\.gov/.test(url)) return "museum-or-archive";
  if (/biographi\.ca|openedition\.org/.test(url)) return "academic";
  return "other";
}

const byUrl = new Map<string, ReferenceSource>();
for (const document of DOCUMENTS) {
  if (!document.sourceUrl || byUrl.has(document.sourceUrl)) continue;
  const year = document.historicalDate?.match(/\b(1[0-9]{3}|20[0-9]{2})\b/)?.[1];
  byUrl.set(document.sourceUrl, {
    id: `document-source:${document.id}`,
    kind: sourceKind(document.sourceUrl),
    title: document.title,
    creator: document.creator,
    publisher: document.holdingInstitution ?? "Institution ou dépôt indiqué dans la fiche documentaire",
    publicationYear: year ? Number(year) : undefined,
    url: document.sourceUrl,
    locator: document.sourceLocator ?? `Notice ou document source associé à ${document.id}.`,
    verificationStatus: "verified",
  });
}

export const ACTE_UNION_DOCUMENT_SOURCE_CATALOG = [...byUrl.values()] as readonly ReferenceSource[];

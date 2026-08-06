export const ACTIVITY_CONTRACT_VERSION = 1 as const;

export type ActivityWorkType = "revision" | "enrichment" | "development";
export type ActivityPublicationStatus = "published" | "suspended" | "archived";

export type PublishedActivityContract = {
  schemaVersion: typeof ACTIVITY_CONTRACT_VERSION;
  id: string;
  title: string;
  workType: ActivityWorkType;
  publishedAt: string;
  updatedAt: string;
  targetedGroupIds: string[];
  notionIds: string[];
  /** Une valeur nulle signifie que l’opération sera attribuée aléatoirement. */
  operationId: string | null;
  /** Les identifiants sont conservés dans l’ordre présenté aux élèves. */
  questionIds: string[];
  publicationStatus: ActivityPublicationStatus;
};

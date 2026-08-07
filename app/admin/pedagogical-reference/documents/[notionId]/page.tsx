import { HistoricalDocumentsNotionPage } from "../page";

export default async function HistoricalDocumentsByNotionPage({ params }: { params: Promise<{ notionId: string }> }) {
  const { notionId } = await params;
  return <HistoricalDocumentsNotionPage notionId={notionId} />;
}

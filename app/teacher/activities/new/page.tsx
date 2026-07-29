import { notFound } from "next/navigation";
import { isLocalActivityCreatorEnabled, LocalActivityCreatorProvider } from "@/lib/teacher-activity-creator";
import { TeacherActivityCreatorView } from "./teacher-activity-creator-view";
import "./teacher-activity-creator.css";

export const dynamic = "force-dynamic";

export default async function TeacherActivityCreatorPage() {
  if (!isLocalActivityCreatorEnabled()) notFound();
  const catalog = await new LocalActivityCreatorProvider().getCatalog();
  return <TeacherActivityCreatorView catalog={catalog} />;
}

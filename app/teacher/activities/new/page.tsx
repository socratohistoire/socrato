import { notFound } from "next/navigation";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { listStoredTeacherGroups } from "@/lib/server/teacher-groups";
import { isLocalActivityCreatorEnabled, LocalActivityCreatorProvider } from "@/lib/teacher-activity-creator";
import { TeacherActivityCreatorView } from "./teacher-activity-creator-view";
import "./teacher-activity-creator.css";
import "./student-preview-frame.css";

export const dynamic = "force-dynamic";

export default async function TeacherActivityCreatorPage() {
  if (!isLocalActivityCreatorEnabled()) notFound();
  const teacher = await requireTeacherActor();
  const [catalog, storedGroups] = await Promise.all([
    new LocalActivityCreatorProvider().getCatalog(),
    listStoredTeacherGroups(teacher.id),
  ]);
  return <TeacherActivityCreatorView catalog={{
    ...catalog,
    groups: storedGroups.map(({ id, name }) => ({ id, name })),
  }} />;
}

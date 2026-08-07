import { notFound } from "next/navigation";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { createTeacherGroupDetailViewModel } from "@/lib/teacher-group-detail";
import { getStoredTeacherGroupDetail } from "@/lib/server/teacher-groups";
import { TeacherGroupDetailView } from "../../activities/[activityId]/groups/[groupId]/teacher-group-detail-view";
import "../../teacher-dashboard.css";
import "../../activities/[activityId]/groups/[groupId]/teacher-group-detail.css";

export const dynamic = "force-dynamic";

export default async function StoredTeacherGroupPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(groupId) || groupId.length > 80) notFound();
  const teacher = await requireTeacherActor();
  const record = await getStoredTeacherGroupDetail(teacher, groupId);
  if (!record) notFound();
  return <TeacherGroupDetailView data={createTeacherGroupDetailViewModel(record)} />;
}

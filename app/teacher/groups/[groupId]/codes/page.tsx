import { notFound } from "next/navigation";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { getStoredTeacherGroupIdentity, listStoredGroupStudentAliases } from "@/lib/server/teacher-groups";
import { GroupAccessCodesView } from "./group-access-codes-view";

export const dynamic = "force-dynamic";

export default async function GroupAccessCodesPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(groupId) || groupId.length > 80) notFound();
  const teacher = await requireTeacherActor();
  const [group, students] = await Promise.all([getStoredTeacherGroupIdentity(teacher.id, groupId), listStoredGroupStudentAliases(teacher.id, groupId)]);
  if (!group) notFound();
  return <GroupAccessCodesView groupId={groupId} groupName={group.name} students={students} />;
}

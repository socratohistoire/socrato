import { notFound } from "next/navigation";
import { createTeacherStudentDetailViewModel, isLocalTeacherStudentDetailEnabled, isSafeTeacherStudentContextId, LocalTeacherStudentDetailProvider } from "@/lib/teacher-student-detail";
import { TeacherStudentDetailView } from "./teacher-student-detail-view";
import "../../../../../../teacher-dashboard.css";
import "../../teacher-group-detail.css";
import "./teacher-student-detail.css";

export const dynamic = "force-dynamic";

export default async function TeacherStudentDetailPage({ params }: { params: Promise<{ activityId: string; groupId: string; studentId: string }> }) {
  if (!isLocalTeacherStudentDetailEnabled()) notFound();
  const { activityId, groupId, studentId } = await params;
  if (!isSafeTeacherStudentContextId(activityId) || !isSafeTeacherStudentContextId(groupId) || !isSafeTeacherStudentContextId(studentId)) notFound();
  const record = await new LocalTeacherStudentDetailProvider().getStudentDetail(activityId, groupId, studentId);
  if (!record) notFound();
  return <TeacherStudentDetailView data={createTeacherStudentDetailViewModel(record)} />;
}

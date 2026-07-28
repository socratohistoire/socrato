import { notFound } from "next/navigation";
import { LocalTeacherGroupDetailProvider, createTeacherGroupDetailViewModel, isLocalTeacherGroupDetailEnabled, isSafeTeacherContextId } from "@/lib/teacher-group-detail";
import { TeacherGroupDetailView } from "./teacher-group-detail-view";
import "../../../../teacher-dashboard.css";
import "./teacher-group-detail.css";

export const dynamic = "force-dynamic";

export default async function TeacherGroupDetailPage({ params }: { params: Promise<{ activityId: string; groupId: string }> }) {
  if (!isLocalTeacherGroupDetailEnabled()) notFound();
  const { activityId, groupId } = await params;
  if (!isSafeTeacherContextId(activityId) || !isSafeTeacherContextId(groupId)) notFound();
  const record = await new LocalTeacherGroupDetailProvider().getGroupDetail(activityId, groupId);
  if (!record) notFound();
  return <TeacherGroupDetailView data={createTeacherGroupDetailViewModel(record)} />;
}

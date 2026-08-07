import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ThemeToggle } from "@/app/eleve/tableau-de-bord/theme-toggle";
import { TeacherGroupsDisclosure } from "@/app/teacher/teacher-groups-disclosure";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { getStoredTeacherStudentDetail } from "@/lib/server/teacher-groups";
import "../../../../teacher-dashboard.css";
import "../../../../activities/[activityId]/groups/[groupId]/teacher-group-detail.css";
import "./stored-student-detail.css";

export const dynamic = "force-dynamic";
const SAFE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export default async function StoredTeacherStudentPage({ params }: { params: Promise<{ groupId: string; studentId: string }> }) {
  const { groupId, studentId } = await params;
  if (!SAFE_ID.test(groupId) || !SAFE_ID.test(studentId) || groupId.length > 80 || studentId.length > 80) notFound();
  const teacher = await requireTeacherActor();
  const student = await getStoredTeacherStudentDetail(teacher, groupId, studentId);
  if (!student) notFound();
  const initials = teacher.displayName.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const groupHref = `/teacher/groups/${encodeURIComponent(groupId)}`;

  return <main className="teacher-dashboard teacher-group-detail-page stored-student-detail-page">
    <aside className="teacher-sidebar" aria-label="Navigation enseignante">
      <Link className="teacher-brand" href="/teacher" aria-label="Retour à l’espace enseignant"><span className="teacher-brand-lockup"><span className="teacher-brand-symbol"><Image className="socrato-brand-logo" src="/logos/socrato-logo-blanc-recadre.png" width={486} height={696} alt="Logo Socrato" priority unoptimized /></span><span className="teacher-brand-copy"><strong className="teacher-brand-name">SOCRATO</strong><small className="teacher-brand-subtitle">Espace enseignant</small></span></span></Link>
      <nav aria-label="Navigation principale"><Link className="sidebar-nav-tile teacher-space-link" href="/teacher"><span>Espace enseignant</span><span aria-hidden="true">→</span></Link><TeacherGroupsDisclosure groups={student.groups.map((group) => ({ ...group, detailsHref: `/teacher/groups/${encodeURIComponent(group.id)}` }))} /><Link className="sidebar-create-action" href="/teacher/activities/new" aria-label="Créer une activité"><span>Créer une activité</span><span aria-hidden="true">→</span></Link></nav>
      <div className="teacher-profile"><span aria-hidden="true">{initials}</span><p><strong>{teacher.displayName}</strong><small>{teacher.email ?? "Compte enseignant"}</small></p></div>
    </aside>
    <section className="teacher-content group-detail-content" aria-labelledby="stored-student-title">
      <header className="group-detail-topbar"><Link href={groupHref}>← Retour à {student.groupName}</Link><div className="group-detail-heading"><h1 id="stored-student-title">{student.displayLabel}</h1><p>{student.groupName}</p></div><ThemeToggle /></header>
      <div className="stored-student-detail-main">
        <section className="stored-student-card stored-student-socrato" aria-labelledby="stored-student-socrato-title"><Image src="/logos/socrato-logo-v2.png" width={78} height={78} alt="" aria-hidden="true" unoptimized /><div><h2 id="stored-student-socrato-title">Suivi de l’élève</h2><p>{student.activityState === "completed" ? student.strengths[0] ?? "L’activité est terminée et le bilan est disponible." : student.activityState === "in_progress" ? "L’élève a commencé l’activité. Le bilan se précisera à mesure de sa progression." : "Aucun résultat individuel n’est disponible pour le moment. La fiche se complétera lorsque l’élève commencera une activité."}</p>{student.activityState === "completed" ? <p><strong>À consolider :</strong> {student.consolidationTargets[0] ?? "Aucun élément prioritaire."}</p> : null}</div></section>
        <section className="stored-student-card" aria-labelledby="stored-student-status-title"><h2 id="stored-student-status-title">Situation actuelle</h2><dl><div><dt>Groupe</dt><dd>{student.groupName}</dd></div><div><dt>Activité assignée</dt><dd>{student.assignedActivityTitle ?? "Aucune activité assignée"}</dd></div><div><dt>Progression</dt><dd>{student.activityState === "completed" ? "Terminée" : student.activityState === "in_progress" ? `En cours · ${student.progressPercentage} %` : "Non commencée"}</dd></div><div><dt>Priorité</dt><dd>Suivi normal</dd></div></dl></section>
      </div>
    </section>
  </main>;
}

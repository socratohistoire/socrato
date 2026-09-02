import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ThemeToggle } from "@/app/eleve/tableau-de-bord/theme-toggle";
import { TeacherGroupsDisclosure } from "@/app/teacher/teacher-groups-disclosure";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { getStoredTeacherStudentDetail } from "@/lib/server/teacher-groups";
import { PROGRESS_STATUS_LABELS } from "@/lib/student-dashboard/presentation";
import "../../../../teacher-dashboard.css";
import "../../../../activities/[activityId]/groups/[groupId]/teacher-group-detail.css";
import "./stored-student-detail.css";

export const dynamic = "force-dynamic";
const SAFE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESULT_LABELS = PROGRESS_STATUS_LABELS;

function TeacherStrategyEntry({ entry }: { entry: string }) {
  const [title, ...parts] = entry.split("\n");
  const questionIndex = parts.indexOf("Question");
  const verificationIndex = parts.indexOf("À vérifier");
  const progressIndex = parts.indexOf("Comment progresser");
  if (verificationIndex < 0 || progressIndex <= verificationIndex) return <>{entry}</>;
  const context = parts.slice(questionIndex >= 0 ? questionIndex + 1 : 0, verificationIndex).join(" ").replace(/[.:]+$/u, "");
  return <div className="stored-strategy-entry">
    <strong>{title}</strong>
    <div><b>{context || "Dans cette question"}</b><p>{parts.slice(verificationIndex + 1, progressIndex).join(" ")}</p></div>
    <div><b>Pour progresser</b><p>{parts.slice(progressIndex + 1).join(" ")}</p></div>
  </div>;
}

export default async function StoredTeacherStudentPage({ params }: { params: Promise<{ groupId: string; studentId: string }> }) {
  const { groupId, studentId } = await params;
  if (!SAFE_ID.test(groupId) || !SAFE_ID.test(studentId) || groupId.length > 80 || studentId.length > 80) notFound();
  const teacher = await requireTeacherActor();
  const student = await getStoredTeacherStudentDetail(teacher, groupId, studentId);
  if (!student) notFound();
  const initials = teacher.displayName.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join("").toUpperCase();
  const groupHref = `/teacher/groups/${encodeURIComponent(groupId)}`;
  const completed = student.activityState === "completed";
  const strengths = completed ? student.strengths : [];
  const consolidationTargets = completed ? student.consolidationTargets.slice(0, 1) : [];

  return <main className="teacher-dashboard teacher-group-detail-page stored-student-detail-page">
    <aside className="teacher-sidebar" aria-label="Navigation enseignante">
      <Link className="teacher-brand" href="/teacher" aria-label="Retour à l’espace enseignant"><span className="teacher-brand-lockup"><span className="teacher-brand-symbol"><Image className="socrato-brand-logo" src="/logos/socrato-logo-blanc-recadre.png" width={486} height={696} alt="Logo Socrato" priority unoptimized /></span><span className="teacher-brand-copy"><strong className="teacher-brand-name">SOCRATO</strong><small className="teacher-brand-subtitle">Espace enseignant</small></span></span></Link>
      <nav aria-label="Navigation principale"><Link className="sidebar-nav-tile teacher-space-link" href="/teacher"><span>Espace enseignant</span><span aria-hidden="true">→</span></Link><TeacherGroupsDisclosure groups={student.groups.map((group) => ({ ...group, detailsHref: `/teacher/groups/${encodeURIComponent(group.id)}` }))} /><Link className="sidebar-create-action" href="/teacher/activities/new" aria-label="Créer une activité"><svg className="sidebar-create-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M13 5h27l11 11v40H13z" /><path d="M40 5v12h11M21 27h21M21 35h17M21 43h13" /><circle cx="15" cy="48" r="10" /><path d="M15 42v12M9 48h12" /></svg><span>Créer une activité</span><span className="sidebar-create-divider" aria-hidden="true" /><span className="sidebar-create-arrow" aria-hidden="true">→</span></Link></nav>
      <div className="teacher-profile"><span aria-hidden="true">{initials}</span><p><strong>{teacher.displayName}</strong><small>{teacher.email ?? "Compte enseignant"}</small></p></div>
    </aside>
    <section className="teacher-content group-detail-content" aria-labelledby="stored-student-title">
      <header className="group-detail-topbar"><Link href={groupHref}>← Retour à {student.groupName}</Link><div className="group-detail-heading"><h1 id="stored-student-title">{student.displayLabel}</h1><p>{student.groupName}</p></div><ThemeToggle /></header>
      <div className="stored-student-detail-main">
        <header className="stored-student-activity-heading"><p>Activité</p><h2>{student.assignedActivityTitle ?? "Aucune activité assignée"}</h2></header>
        <section className="stored-student-card stored-student-summary" aria-labelledby="stored-student-summary-title">
          <div className="stored-student-summary-heading"><Image src="/logos/socrato-logo-v2.png" width={66} height={66} alt="" aria-hidden="true" unoptimized /><div><h2 id="stored-student-summary-title">Bilan et recommandations de Socrato</h2><p>{completed ? "Voici les résultats enregistrés pour cette activité." : student.activityState === "in_progress" ? `Activité en cours · ${student.progressPercentage} % complété.` : "Le bilan apparaîtra lorsque l’élève aura commencé une activité."}</p></div></div>
          <div className="stored-student-summary-grid">
            <article className="stored-summary-item stored-summary-strength"><span aria-hidden="true">✓</span><div><h3>Ce que tu as bien réussi</h3>{strengths.length ? <ul>{strengths.map((entry) => { const [subtitle, ...comment] = entry.split("\n"); return <li key={entry}><strong>{subtitle}</strong><p>{comment.join(" ") || subtitle}</p></li>; })}</ul> : <p>{completed ? "Aucun point fort confirmé pour cette activité." : "En attente des résultats de l’activité."}</p>}</div></article>
            <article className="stored-summary-item stored-summary-consolidate"><span aria-hidden="true">◎</span><div><h3>Éléments à consolider</h3>{consolidationTargets.length ? <ul>{consolidationTargets.map((entry) => <li key={entry}><TeacherStrategyEntry entry={entry} /></li>)}</ul> : <p>{completed ? "Aucun élément prioritaire à consolider." : "En attente des résultats de l’activité."}</p>}</div></article>
          </div>
        </section>
        <section className="stored-student-card stored-results-card" aria-labelledby="stored-operations-title"><header><h2 id="stored-operations-title">Opérations intellectuelles</h2><p>Résultats de cette activité</p></header><div className="stored-results-list">{student.operations.length ? student.operations.map((result) => <article className={`stored-result-row stored-result-${result.status}`} key={result.id}><span aria-hidden="true">◉</span><h3>{result.label}</h3><strong>{RESULT_LABELS[result.status]}</strong></article>) : <p className="stored-results-empty">Aucune opération évaluée n’est encore enregistrée.</p>}</div></section>
      </div>
    </section>
  </main>;
}

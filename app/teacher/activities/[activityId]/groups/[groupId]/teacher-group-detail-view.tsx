"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "@/app/eleve/tableau-de-bord/theme-toggle";
import { TeacherGroupsDisclosure } from "@/app/teacher/teacher-groups-disclosure";
import { filterTeacherGroupStudents, TEACHER_GROUP_STATE_LABELS, type TeacherGroupDetailViewModel, type TeacherGroupPriorityFilter, type TeacherGroupStateFilter, type TeacherGroupStudent } from "@/lib/teacher-group-detail";
import { applyLocalActivityToGroupDetail } from "@/lib/local-published-activities";
import { createTeacherGroupDetailViewModel } from "@/lib/teacher-group-detail";
import { createConfiguredDataRepository } from "@/lib/data-repository";

function StudentDetailAction({ student }: { student: TeacherGroupStudent }) {
  const label = `Voir le bilan de ${student.displayLabel.replace(/\s*\([^)]*\)$/, "")}`;
  if (student.studentDetailHref) return <Link className="group-student-detail" href={student.studentDetailHref} aria-label={label}>Détails <span aria-hidden="true">→</span></Link>;
  return <button type="button" className="group-student-detail" disabled aria-disabled="true" aria-label={`${label} — Fonction à venir`} title="Fonction à venir">Détails <span aria-hidden="true">→</span></button>;
}

export function TeacherGroupDetailView({ data }: { data: TeacherGroupDetailViewModel }) {
  const [displayData, setDisplayData] = useState(data);
  const [priorityFilter, setPriorityFilter] = useState<TeacherGroupPriorityFilter>("all");
  const [stateFilter, setStateFilter] = useState<TeacherGroupStateFilter>("all");
  useEffect(() => {
    if (data.source === "server" || !/^activity-local-[0-9]+$/.test(data.activityId)) return;
    const repository = createConfiguredDataRepository(window.localStorage);
    let active = true;
    void Promise.all([repository.listPublishedActivities(), repository.listStudentOutcomes(), repository.listStudentProgress()]).then(([activities, outcomes, progressRecords]) => {
      const activity = activities.find(({ id }) => id === data.activityId);
      if (active && activity) setDisplayData(createTeacherGroupDetailViewModel(applyLocalActivityToGroupDetail(data, activity, outcomes[data.activityId], progressRecords[data.activityId])));
    });
    return () => { active = false; };
  }, [data]);
  const visibleStudents = useMemo(() => filterTeacherGroupStudents(displayData.students, priorityFilter, stateFilter), [displayData.students, priorityFilter, stateFilter]);
  const completedStudentLabel = `${displayData.completedStudentCount} élève${displayData.completedStudentCount > 1 ? "s" : ""}`;
  const participationLabel = `${completedStudentLabel} sur ${displayData.targetedStudentCount} ont terminé l’activité, soit ${displayData.participationPercentage} %.`;

  return <main className="teacher-dashboard teacher-group-detail-page">
    <aside className="teacher-sidebar" aria-label="Navigation enseignante">
      <Link className="teacher-brand" href={displayData.returnHref} aria-label="Retour à l’espace enseignant">
        <span className="teacher-brand-lockup"><span className="teacher-brand-symbol"><Image className="socrato-brand-logo" src="/logos/socrato-logo-blanc-recadre.png" width={486} height={696} alt="Logo Socrato" priority unoptimized /></span><span className="teacher-brand-copy"><strong className="teacher-brand-name">SOCRATO</strong><small className="teacher-brand-subtitle">Espace enseignant</small></span></span>
      </Link>
      <nav aria-label="Navigation principale">
        <Link className="sidebar-nav-tile teacher-space-link" href={displayData.returnHref}><span className="sidebar-nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M4 19V8l8-5 8 5v11M9 19v-6h6v6" /></svg></span><span>Espace enseignant</span><span aria-hidden="true">→</span></Link>
        <TeacherGroupsDisclosure groups={displayData.groups.map((group) => ({ ...group, detailsHref: displayData.source === "server" ? `/teacher/groups/${encodeURIComponent(group.id)}` : undefined }))} />
        <Link className="sidebar-create-action" href="/teacher/activities/new" aria-label="Créer une activité"><svg className="sidebar-create-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M13 5h27l11 11v40H13z" /><path d="M40 5v12h11M21 27h21M21 35h17M21 43h13" /><circle cx="15" cy="48" r="10" /><path d="M15 42v12M9 48h12" /></svg><span>Créer une activité</span><span className="sidebar-create-divider" aria-hidden="true" /><span className="sidebar-create-arrow" aria-hidden="true">→</span></Link>
      </nav>
      <div className="teacher-profile"><span aria-hidden="true">{displayData.teacher.initials}</span><p><strong>{displayData.teacher.displayLabel}</strong><small>{displayData.teacher.roleLabel}</small></p></div>
    </aside>

    <section className="teacher-content group-detail-content" aria-labelledby="group-detail-title">
      <header className="group-detail-topbar"><Link href={displayData.returnHref}>← Retour à l’espace enseignant</Link><div className="group-detail-heading"><h1 id="group-detail-title">{displayData.groupName}</h1><p>{displayData.activityTitle}</p></div><ThemeToggle /></header>
      <div className="group-detail-main">
        <section className="group-detail-hero">
          <div className="group-participation-summary" role="img" aria-label={participationLabel}><div className="group-participation-ring" style={{ "--participation": `${displayData.participationPercentage}%` } as React.CSSProperties}><strong>{displayData.participationPercentage} %</strong></div><div><strong>Participation</strong><p>{completedStudentLabel} sur {displayData.targetedStudentCount} ont terminé</p></div></div>
          <div className="group-socrato-summary"><Image src="/logos/socrato-logo-v2.png" width={58} height={58} alt="" aria-hidden="true" unoptimized /><div><strong>Synthèse de Socrato</strong><p>{displayData.socratoSummaryText}</p></div></div>
        </section>

        <section className="group-students-card" aria-labelledby="group-students-title">
          <div className="group-students-heading"><div><h2 id="group-students-title">Élèves du groupe</h2><p>Suivi synthétique pour cette activité.</p></div><div className="group-filters" aria-label="Filtres des élèves">
            {displayData.source === "server" ? <Link className="group-access-codes-link" href={`/teacher/groups/${encodeURIComponent(displayData.groupId)}/codes`}>Gérer les codes d’accès</Link> : null}
            <div className="priority-filter" role="group" aria-label="Filtrer selon la priorité"><button type="button" aria-pressed={priorityFilter === "all"} onClick={() => setPriorityFilter("all")}>Tous les élèves</button><button type="button" aria-pressed={priorityFilter === "high"} onClick={() => setPriorityFilter("high")}>Prioritaires seulement</button></div>
            <label><span className="sr-only">Filtrer selon l’état de l’activité</span><select value={stateFilter} onChange={(event) => setStateFilter(event.target.value as TeacherGroupStateFilter)} aria-label="Tous les états"><option value="all">Tous les états</option><option value="completed">Terminée</option><option value="in_progress">En cours</option><option value="not_started">Non commencée</option></select></label>
          </div></div>
          {visibleStudents.length ? <div className="group-students-table-wrap"><table><thead><tr><th scope="col">Élève</th><th scope="col">État de l’activité</th><th scope="col">Priorité</th><th scope="col">Principale difficulté</th><th scope="col">Bilan</th></tr></thead><tbody>{visibleStudents.map((student) => <tr key={student.id}><th scope="row" data-label="Élève">{student.studentDetailHref ? <Link className="group-student-name" href={student.studentDetailHref}>{student.displayLabel}</Link> : student.displayLabel}</th><td data-label="État de l’activité"><span className={`activity-state activity-state--${student.activityState}`}>{TEACHER_GROUP_STATE_LABELS[student.activityState]}</span>{student.activityState === "in_progress" ? <small className="student-progress-value">{student.progressPercentage ?? 0} % complété</small> : null}</td><td data-label="Priorité"><span className={`student-priority student-priority--${student.priority}`}>{student.priority === "high" ? "Priorité élevée" : "Suivi normal"}</span></td><td data-label="Principale difficulté">{student.mainDifficulty}</td><td data-label="Bilan"><StudentDetailAction student={student} /></td></tr>)}</tbody></table></div> : <div className="group-filter-empty" role="status"><strong>Aucun élève ne correspond à ces filtres.</strong><p>Modifiez la priorité ou l’état sélectionné.</p></div>}
        </section>
      </div>
    </section>
  </main>;
}

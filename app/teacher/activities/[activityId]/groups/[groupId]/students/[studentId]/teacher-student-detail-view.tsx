"use client";

import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/app/eleve/tableau-de-bord/theme-toggle";
import { TeacherGroupsDisclosure } from "@/app/teacher/teacher-groups-disclosure";
import { TEACHER_STUDENT_RESULT_LABELS, type TeacherStudentDetailViewModel, type TeacherStudentWorkedResult } from "@/lib/teacher-student-detail";

function ResultList({ items }: { items: readonly TeacherStudentWorkedResult[] }) {
  return <ul className="student-result-list">{items.map((item) => <li key={item.id}><span>{item.label}</span><span className={`student-result-status student-result-status--${item.status}`}><span aria-hidden="true" />{TEACHER_STUDENT_RESULT_LABELS[item.status]}</span></li>)}</ul>;
}

function PedagogicalIcon({ kind, label }: { kind: "strength" | "difficulty" | "path"; label: string }) {
  const paths = {
    strength: <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />,
    difficulty: <><path d="M12 6v8" /><path d="M12 18h.01" /></>,
    path: <><path d="m5 17 5-5 3 3 6-7" /><path d="M15 8h4v4" /></>,
  };
  return <span className={`student-pedagogical-icon student-pedagogical-icon--${kind}`}><svg viewBox="0 0 24 24" role="img" aria-label={label} focusable="false">{paths[kind]}</svg></span>;
}

export function TeacherStudentDetailView({ data }: { data: TeacherStudentDetailViewModel }) {
  return <main className="teacher-dashboard teacher-group-detail-page teacher-student-detail-page">
    <aside className="teacher-sidebar" aria-label="Navigation enseignante">
      <Link className="teacher-brand" href={data.teacherReturnHref} aria-label="Retour à l’espace enseignant"><span className="teacher-brand-lockup"><span className="teacher-brand-symbol"><Image className="socrato-brand-logo" src="/logos/socrato-logo-blanc-recadre.png" width={486} height={696} alt="Logo Socrato" priority unoptimized /></span><span className="teacher-brand-copy"><strong className="teacher-brand-name">SOCRATO</strong><small className="teacher-brand-subtitle">Espace enseignant</small></span></span></Link>
      <nav aria-label="Navigation principale"><TeacherGroupsDisclosure groups={data.groups} /><Link className="sidebar-nav-tile teacher-space-link" href={data.teacherReturnHref}><span className="sidebar-nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M4 19V8l8-5 8 5v11M9 19v-6h6v6" /></svg></span><span>Espace enseignant</span><span aria-hidden="true">→</span></Link></nav>
      <div className="teacher-profile"><span aria-hidden="true">{data.teacher.initials}</span><p><strong>{data.teacher.displayLabel}</strong><small>{data.teacher.roleLabel}</small></p></div>
    </aside>

    <section className="teacher-content group-detail-content" aria-labelledby="student-detail-title">
      <header className="group-detail-topbar"><Link href={data.groupReturnHref}>← Retour au groupe fictif 401</Link><div className="group-detail-heading"><h1 id="student-detail-title">{data.studentDisplayLabel}</h1><p>{data.activityTitle}</p></div><ThemeToggle /></header>
      <div className="student-detail-main">
        <div className="student-detail-first-row">
          <section className="student-detail-card student-overview-card" aria-labelledby="student-overview-title"><h2 id="student-overview-title">Bilan individuel</h2><div className="student-overview-badges"><span className="student-overview-state student-overview-state--completed">{data.activityStateLabel}</span><span className="student-overview-state student-overview-state--priority">{data.priorityLabel}</span></div><p>{data.groupName}</p></section>
          <section className="student-detail-card student-socrato-card" aria-labelledby="student-socrato-title"><Image src="/logos/socrato-logo-v2.png" width={96} height={96} alt="" aria-hidden="true" unoptimized /><div><h2 id="student-socrato-title">Synthèse de Socrato</h2><p>{data.socratoSummary}</p></div></section>
        </div>
        <div className="student-detail-second-row">
          <section className="student-detail-card student-pedagogical-card" aria-labelledby="student-pedagogical-title"><h2 id="student-pedagogical-title">Bilan pédagogique</h2><dl><div className="student-pedagogical-item student-pedagogical-item--strength"><dt><PedagogicalIcon kind="strength" label="Point fort" /><span>Point fort</span></dt><dd>{data.pedagogicalSummary.strength}</dd></div><div className="student-pedagogical-item student-pedagogical-item--difficulty"><dt><PedagogicalIcon kind="difficulty" label="Difficulté principale" /><span>Difficulté principale</span></dt><dd>{data.pedagogicalSummary.mainDifficulty}</dd></div><div className="student-pedagogical-item student-pedagogical-item--path"><dt><PedagogicalIcon kind="path" label="Piste de consolidation" /><span>Piste de consolidation</span></dt><dd>{data.pedagogicalSummary.consolidationPath}</dd></div></dl><button type="button" className="student-consolidation-action" disabled aria-disabled="true" title="Fonction à venir">Créer une activité de consolidation <span aria-hidden="true">→</span><span className="sr-only"> — Fonction à venir</span></button></section>
          <div className="student-worked-results">
            <section className="student-detail-card" aria-labelledby="student-operations-title"><h2 id="student-operations-title">Opérations intellectuelles travaillées</h2><ResultList items={data.operations} /></section>
            <section className="student-detail-card" aria-labelledby="student-knowledge-title"><h2 id="student-knowledge-title">Connaissances historiques travaillées</h2><ResultList items={data.historicalKnowledge} /></section>
          </div>
        </div>
      </div>
    </section>
  </main>;
}

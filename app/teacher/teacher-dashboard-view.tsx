"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ThemeToggle } from "../eleve/tableau-de-bord/theme-toggle";
import { composeTeacherPedagogicalSummary, formatTeacherGreeting, LocalTeacherPedagogicalSummaryProvider, type TeacherDashboardViewModel } from "@/lib/teacher-dashboard";
import { ScrollRegion } from "./scroll-region";
import { TeacherGroupsDisclosure } from "./teacher-groups-disclosure";
import { TypewriterMessage } from "./typewriter-message";
import { createLocalTeacherActivitySummaries, type LocalActivityPublicationStatus, type LocalPublishedActivity } from "@/lib/local-published-activities";
import type { StoredStudentActivityOutcomes } from "@/lib/student-activity-outcomes/browser-store";
import type { TeacherActivityDraft } from "@/lib/teacher-activity-drafts";
import type { StudentProgressContract } from "@/lib/student-progress";
import { createConfiguredDataRepository } from "@/lib/data-repository";

type SectionIconName = "portrait" | "support";

function SectionIcon({ name }: { name: SectionIconName }) {
  const paths = {
    portrait: <><path d="M5 19V10h4v9M10 19V5h4v14M15 19v-7h4v7" /><path d="M3 19h18" /></>,
    support: <><circle cx="10" cy="8" r="3" /><path d="M4 19c.5-4 2.5-6 6-6 2.1 0 3.7.7 4.8 2" /><circle cx="18" cy="17" r="3" /><path d="M18 15.5v1.8l1.1.7" /></>,
  };
  return <span className={`section-icon section-icon-${name}`} data-section-icon={name} aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false">{paths[name]}</svg></span>;
}

function UnavailableAction({ children, className = "", accessibleLabel }: { children: React.ReactNode; className?: string; accessibleLabel?: string }) {
  return <button type="button" className={className} disabled aria-disabled="true" aria-label={accessibleLabel} title="Fonction à venir">{children}<span className="sr-only"> — Fonction à venir</span></button>;
}

function CardTitle({ icon, id, title, description, className = "" }: { icon: SectionIconName; id: string; title: string; description: string; className?: string }) {
  return <div className={`section-title ${className}`.trim()}><SectionIcon name={icon} /><div><h2 id={id}>{title}</h2><p>{description}</p></div></div>;
}

function StudentPortraitControl({ student }: { student: TeacherDashboardViewModel["highPriorityStudents"][number] }) {
  const accessibleLabel = `Voir le portrait de ${student.displayLabel.replace(/\s*\([^)]*\)$/, "")}`;
  if (student.studentPortraitHref) {
    return <Link className="priority-detail-action teacher-details-action" href={student.studentPortraitHref} aria-label={accessibleLabel}>Détails <span aria-hidden="true">→</span></Link>;
  }
  return <UnavailableAction className="priority-detail-action teacher-details-action" accessibleLabel={`${accessibleLabel} — Fonction à venir`}>Détails <span aria-hidden="true">→</span></UnavailableAction>;
}

function GroupPortraitControl({ group }: { group: TeacherDashboardViewModel["selectedActivity"]["groupPortraits"][number] }) {
  const accessibleLabel = `Consulter le portrait détaillé de ${group.name}`;
  if (group.groupDetailHref) return <Link className="portrait-detail-action teacher-details-action" href={group.groupDetailHref} aria-label={accessibleLabel}>Détails <span aria-hidden="true">→</span></Link>;
  return <UnavailableAction className="portrait-detail-action teacher-details-action" accessibleLabel={`${accessibleLabel} — Fonction à venir`}>Détails <span aria-hidden="true">→</span></UnavailableAction>;
}

function activityTypeLabel(activityType: TeacherDashboardViewModel["selectedActivity"]["activityType"]) {
  return activityType === "revision" ? "Activité de révision" : activityType === "development" ? "Question à développement" : "Activité d’enrichissement";
}

function formatPublishedAt(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function percentOf(value: number, total: number) {
  if (!total) return 0;
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}

const localPedagogicalSummaryProvider = new LocalTeacherPedagogicalSummaryProvider();

export function TeacherDashboardView({ data }: { data: TeacherDashboardViewModel }) {
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(() => data.selectedActivityId);
  const [highlightCreationAction, setHighlightCreationAction] = useState(false);
  const [localActivities, setLocalActivities] = useState<LocalPublishedActivity[]>([]);
  const [studentOutcomes, setStudentOutcomes] = useState<StoredStudentActivityOutcomes>({});
  const [activityDraft, setActivityDraft] = useState<TeacherActivityDraft | null>(null);
  const [studentProgress, setStudentProgress] = useState<Record<string, StudentProgressContract>>({});
  const [dataError, setDataError] = useState("");
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const repository = createConfiguredDataRepository(window.localStorage);
    void Promise.all([repository.listPublishedActivities(), repository.listStudentOutcomes(), repository.readActiveDraftSummary(), repository.listStudentProgress()]).then(([storedActivities, outcomes, draft, progress]) => {
      if (!active) return;
      setLocalActivities(storedActivities); setStudentOutcomes(outcomes); setActivityDraft(draft); setStudentProgress(progress);
      const requestedActivityId = new URL(window.location.href).searchParams.get("activity");
      if (requestedActivityId && storedActivities.some(({ id }) => id === requestedActivityId)) setSelectedActivityId(requestedActivityId);
    }).catch(() => { if (active) setDataError("Les données locales n’ont pas pu être chargées. Actualisez la page pour réessayer."); }).finally(() => { if (active) setDataLoading(false); });
    return () => { active = false; };
  }, []);

  const localActivitySummaries = useMemo(() => createLocalTeacherActivitySummaries(localActivities, data.allGroups, studentOutcomes, studentProgress), [data.allGroups, localActivities, studentOutcomes, studentProgress]);
  const activities = useMemo(() => [...localActivitySummaries, ...data.activities], [data.activities, localActivitySummaries]);

  useEffect(() => {
    if (!selectedActivityId) return;
    const url = new URL(window.location.href);
    url.searchParams.set("activity", selectedActivityId);
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  }, [selectedActivityId]);

  const activeActivity = activities.find((activity) => activity.id === selectedActivityId) ?? data.selectedActivity;
  const pedagogicalSummary = data.hasCreatedActivity ? localPedagogicalSummaryProvider.createSummary({ activity: activeActivity }) : null;
  const composedPedagogicalSummary = pedagogicalSummary ? composeTeacherPedagogicalSummary(pedagogicalSummary) : null;
  const teacherGreeting = formatTeacherGreeting(data.teacher.firstName);
  const isInitialWelcome = !data.hasCreatedActivity;
  const socratoMessage = isInitialWelcome
    ? `${teacherGreeting} Bienvenue dans Socrato. Commençons par préparer une première activité adaptée à tes élèves. Clique sur « Créer une activité » : je t’accompagnerai ensuite dans chacune des étapes.`
    : composedPedagogicalSummary
      ? `${teacherGreeting} ${composedPedagogicalSummary}`
      : `${teacherGreeting} Socrato prépare sa synthèse à mesure que les élèves terminent l’activité.`;
  const socratoMessageKey = isInitialWelcome ? "teacher-welcome-v1" : `activity-summary-${activeActivity.id}-${activeActivity.summaryVersion}`;
  const handleWelcomeMessageComplete = useCallback(() => setHighlightCreationAction(true), []);

  useEffect(() => {
    if (!highlightCreationAction) return;
    const timeoutId = window.setTimeout(() => setHighlightCreationAction(false), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [highlightCreationAction]);
  const activityPickerAccessibleLabel = "Changer d’activité";
  const activitiesByPublication = useMemo(() => [...activities].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt)), [activities]);

  async function changeLocalActivityStatus(activityId: string, status: LocalActivityPublicationStatus) {
    try { setLocalActivities(await createConfiguredDataRepository(window.localStorage).setPublishedActivityStatus(activityId, status)); }
    catch { setDataError("La modification n’a pas pu être enregistrée. Réessayez."); }
  }

  async function deleteActivityDraft() {
    if (!window.confirm("Supprimer ce brouillon d’activité? Cette action ne peut pas être annulée.")) return;
    try { await createConfiguredDataRepository(window.localStorage).clearActiveDraft(); setActivityDraft(null); }
    catch { setDataError("Le brouillon n’a pas pu être supprimé. Réessayez."); }
  }

  return (
    <main className="teacher-dashboard">
      <aside className="teacher-sidebar" aria-label="Navigation enseignante">
        <Link className="teacher-brand" href="/teacher" aria-label="Accueil Socrato enseignant">
          <span className="teacher-brand-lockup">
            <span className="teacher-brand-symbol">
              <Image className="socrato-brand-logo" src="/logos/socrato-logo-blanc-recadre.png" width={486} height={696} alt="Logo Socrato" priority unoptimized />
            </span>
            <span className="teacher-brand-copy">
              <strong className="teacher-brand-name">SOCRATO</strong>
              <small className="teacher-brand-subtitle">Espace enseignant</small>
            </span>
          </span>
        </Link>
        <nav aria-label="Navigation principale">
          <TeacherGroupsDisclosure groups={data.groups} />
          <Link className={`sidebar-create-action${highlightCreationAction ? " sidebar-create-action--welcome-attention" : ""}`} href="/teacher/activities/new" aria-label="Créer une activité">
            <svg className="sidebar-create-icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M13 5h27l11 11v40H13z" /><path d="M40 5v12h11M21 27h21M21 35h17M21 43h13" /><circle cx="15" cy="48" r="10" /><path d="M15 42v12M9 48h12" /></svg>
            <span>Créer une activité</span>
            <span className="sidebar-create-divider" aria-hidden="true" />
            <span className="sidebar-create-arrow" aria-hidden="true">→</span>
          </Link>
        </nav>
        <div className="teacher-profile"><span aria-hidden="true">{data.teacher.initials}</span><p><strong>{data.teacher.displayLabel}</strong><small>{data.teacher.roleLabel}</small></p></div>
      </aside>

      <section className="teacher-content" aria-labelledby="teacher-dashboard-title">
        <header className="teacher-context-header">
          <div className="teacher-context-main">
            <div className="teacher-title-theme-row">
              <span className="teacher-context-rule teacher-context-rule-left" aria-hidden="true" />
              <h1 className="teacher-activity-title" id="teacher-dashboard-title">{activeActivity.customTitle}</h1>
              <span className="teacher-context-rule teacher-context-rule-right" aria-hidden="true" />
            </div>
            <div className="teacher-context-meta">
              <p className="teacher-context-date">Publiée le {formatPublishedAt(activeActivity.publishedAt)}</p>
              <label className="activity-picker" htmlFor="teacher-activity-picker">
                <span className="sr-only">{activityPickerAccessibleLabel}</span>
                <span className="activity-picker-control">
                  <select id="teacher-activity-picker" value="" onChange={(event) => setSelectedActivityId(event.target.value)} aria-label={activityPickerAccessibleLabel}>
                    <option value="" disabled>{activityPickerAccessibleLabel}</option>
                    {activities.map((activity) => <option key={activity.id} value={activity.id}>{activity.customTitle} — {activityTypeLabel(activity.activityType)} · {formatPublishedAt(activity.publishedAt)}</option>)}
                  </select>
                  <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false"><path d="m2 4 4 4 4-4" /></svg>
                </span>
              </label>
            </div>
          </div>
          <div className="teacher-theme-area">
            <ThemeToggle />
          </div>
        </header>

        <div className="teacher-dashboard-body">
        {dataLoading ? <p className="teacher-data-loading" role="status">Chargement des activités et des progressions…</p> : null}
        {dataError ? <p className="teacher-data-error" role="alert">{dataError}</p> : null}
        <div className="teacher-main-grid">
        <div className="teacher-left-stack">
        <section className="socrato-observation-card" aria-label="Accueil de Socrato">
          <div className="socrato-spoken-row">
            <Image className="socrato-observation-avatar" src="/logos/socrato-logo-v2.png" width={80} height={80} alt="" aria-hidden="true" unoptimized />
            <div className="socrato-advice-message">
              <TypewriterMessage key={socratoMessageKey} messageKey={socratoMessageKey} text={socratoMessage} onFirstViewComplete={isInitialWelcome ? handleWelcomeMessageComplete : undefined} />
            </div>
          </div>
        </section>

        <section className={`teacher-card support-card${data.highPriorityStudents.length ? " priority-card--attention" : ""}`} aria-labelledby="support-title">
          <div className="scroll-card-header"><CardTitle className="analysis-section-title" icon="support" id="support-title" title="Élèves prioritaires" description="Élèves nécessitant une intervention prioritaire." /></div>
          {data.highPriorityStudents.length ? <ScrollRegion className={`support-scroll${data.highPriorityStudents.length > 3 ? " support-scroll--overflowing" : ""}`} label="Élèves prioritaires, faire défiler pour voir les autres élèves" hint="Faire défiler pour voir les autres élèves ↓" hintInsideViewport showHintControl={data.highPriorityStudents.length > 3}><ul className="priority-list">
            {data.highPriorityStudents.map((student) => <li key={student.id}>
              <div className="student-summary"><strong>{student.displayLabel}</strong><small>{student.groupLabel}</small><p>{student.reasonLabel}</p></div>
              <div className="priority-actions">
                <span className="priority-pill">Priorité élevée</span>
                <StudentPortraitControl student={student} />
              </div>
            </li>)}
          </ul></ScrollRegion> : <p className="empty-priority">Aucun élève en priorité élevée pour cette activité.</p>}
        </section>
        </div>

          <section className="teacher-card portrait-card" aria-labelledby="global-portrait-title">
            <div className="scroll-card-header"><CardTitle className="analysis-section-title" icon="portrait" id="global-portrait-title" title="Portrait des groupes" description="Bilan et suggestions de Socrato pour les groupes concernés." /></div>
            {activeActivity.groupPortraits.length ? <>
              <div className="briefing-columns" aria-hidden="true"><span>Groupe et observation</span><span>Suggestion de Socrato</span><span>Participation</span><span>Portrait détaillé</span></div>
              <ScrollRegion className={`portrait-scroll${activeActivity.groupPortraits.length > 7 ? " portrait-scroll--overflowing" : ""}`} label="Portrait des groupes, faire défiler pour voir les autres groupes" hint="Faire défiler pour voir les autres groupes ↓" hintInsideViewport showHintControl={activeActivity.groupPortraits.length > 7}>
              <div className="briefing-list">
                {activeActivity.groupPortraits.map((group) => {
                  const participationPercentage = percentOf(group.completedStudentCount, group.targetedStudentCount);
                  const participationLabel = group.targetedStudentCount === 0 ? "Aucune participation disponible" : `${group.completedStudentCount} élèves sur ${group.targetedStudentCount} ont terminé l’activité, soit ${participationPercentage} %.`;
                  return <article key={group.id} className="briefing-item">
                    <div className="briefing-observation"><h3>{group.name}</h3><p>{group.observation}</p></div>
                    <div className="briefing-suggestion"><p>{group.suggestion.replace(/^Suggestion fictive :\s*/i, "")}</p></div>
                    <div className="briefing-participation" role="img" aria-label={participationLabel}>
                      <div className="participation-ring" style={{ "--participation": `${participationPercentage}%` } as React.CSSProperties}><strong>{group.targetedStudentCount === 0 ? "—" : `${participationPercentage} %`}</strong></div>
                      <span>{group.targetedStudentCount === 0 ? "Aucune donnée" : `${group.completedStudentCount} sur ${group.targetedStudentCount}`}</span>
                    </div>
                    <GroupPortraitControl group={group} />
                  </article>;
                })}
              </div>
              </ScrollRegion>
            </> : <p className="empty-priority">Aucun portrait de groupe n’est encore disponible pour cette activité.</p>}
          </section>

        </div>

        {activityDraft ? <section className="teacher-card activity-draft-card" aria-labelledby="activity-draft-title">
          <header><div><p>Brouillon enregistré automatiquement</p><h2 id="activity-draft-title">{activityDraft.configuration.title.trim() || "Activité sans titre"}</h2></div><span>Mis à jour le {formatPublishedAt(activityDraft.updatedAt)}</span></header>
          <div className="activity-draft-details"><p><strong>{activityDraft.configuration.questionCount} question{activityDraft.configuration.questionCount !== 1 ? "s" : ""}</strong><span>{activityDraft.configuration.notionIds.length} notion{activityDraft.configuration.notionIds.length !== 1 ? "s" : ""}</span><span>{activityDraft.configuration.selectedGroupIds.length} groupe{activityDraft.configuration.selectedGroupIds.length !== 1 ? "s" : ""}</span></p><div><Link href="/teacher/activities/new">Continuer</Link><button type="button" onClick={deleteActivityDraft}>Supprimer</button></div></div>
        </section> : null}

        <section className="teacher-card all-activities-card" aria-labelledby="all-activities-title">
          <header><div><p>Historique de publication</p><h2 id="all-activities-title">Toutes les activités</h2><span>De la plus récemment publiée à la plus ancienne.</span></div><strong>{activitiesByPublication.length} activité{activitiesByPublication.length > 1 ? "s" : ""}</strong></header>
          <ol>{activitiesByPublication.map((activity) => {
            const participationPercentage = percentOf(activity.completedStudentCount, activity.targetedStudentCount);
            const startedStudentCount = activity.startedStudentCount ?? activity.completedStudentCount;
            const notStartedStudentCount = Math.max(0, activity.targetedStudentCount - startedStudentCount);
            const lifecycleLabel = activity.lifecycleStatus === "suspended" ? "Suspendue" : activity.lifecycleStatus === "archived" ? "Archivée" : null;
            const resultLabel = lifecycleLabel ?? (activity.resultAvailability === "available" ? "Résultats disponibles" : activity.resultAvailability === "partial" ? "Résultats partiels" : activity.startedStudentCount ? `${activity.startedStudentCount} en cours` : "En attente de résultats");
            const isLocalActivity = activity.id.startsWith("activity-local-");
            return <li key={activity.id} className={activity.id === activeActivity.id ? "all-activities-item--active" : undefined}><div className="all-activities-row"><button type="button" className="activity-select" onClick={() => setSelectedActivityId(activity.id)} aria-current={activity.id === activeActivity.id ? "true" : undefined}><span className="all-activities-date"><time dateTime={activity.publishedAt}>{formatPublishedAt(activity.publishedAt)}</time><small>{activityTypeLabel(activity.activityType)}</small></span><span className="all-activities-name"><strong>{activity.customTitle}</strong><small>{activity.targetedGroupIds.length} groupe{activity.targetedGroupIds.length > 1 ? "s" : ""} visé{activity.targetedGroupIds.length > 1 ? "s" : ""}</small></span><span className="all-activities-participation"><strong>{activity.targetedStudentCount ? `${participationPercentage} %` : "—"}</strong><small>{startedStudentCount} commencé · {activity.completedStudentCount} terminé · {notStartedStudentCount} non commencé</small></span><span className={`all-activities-status all-activities-status--${activity.lifecycleStatus ?? activity.resultAvailability}`}>{resultLabel}</span><span className="all-activities-arrow" aria-hidden="true">→</span></button>{isLocalActivity ? <div className="local-activity-actions" aria-label={`Gestion de ${activity.customTitle}`}>{activity.lifecycleStatus !== "published" ? <button type="button" onClick={() => changeLocalActivityStatus(activity.id, "published")}>Réactiver l’activité</button> : <button type="button" onClick={() => changeLocalActivityStatus(activity.id, "suspended")}>Suspendre l’activité</button>}{activity.lifecycleStatus !== "archived" ? <button type="button" onClick={() => changeLocalActivityStatus(activity.id, "archived")}>Archiver</button> : null}</div> : null}</div></li>;
          })}</ol>
        </section>
        </div>
      </section>
    </main>
  );
}

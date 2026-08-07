"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { createConfiguredDataRepository } from "@/lib/data-repository";
import { getHistoricalPeriodLabel } from "@/lib/student-dashboard/historical-period";
import { getSelectedActivity, getActivityDashboardUrl, getLearningSessionUrl } from "@/lib/student-dashboard/selection";
import {
  ACTIVITY_STATUS_LABELS,
  ACTIVITY_TYPE_LABELS,
  DASHBOARD_LABELS,
  getActivityActionLabel,
  getWorkedHistoricalKnowledge,
  getWorkedOperations,
  PROGRESS_STATUS_LABELS,
} from "@/lib/student-dashboard/presentation";
import type { HistoricalKnowledge, IntellectualOperation, StudentActivity, StudentDashboardData } from "@/lib/student-dashboard/types";
import { ThemeToggle } from "./theme-toggle";
import { KnowledgeScrollRegion } from "./knowledge-scroll-region";
import { StudentLogoutButton } from "../logout-button";

export function StudentDashboardView({ data }: { data: StudentDashboardData }) {
  const searchParams = useSearchParams();
  const testMode = searchParams.get("test") === "1";
  const [dashboardData, setDashboardData] = useState(data);
  useEffect(() => {
    let active = true;
    if (data.source === "server") {
      void Promise.resolve().then(() => {
        if (!active) return;
        setDashboardData(data);
      });
      return () => { active = false; };
    }
    const repository = createConfiguredDataRepository(window.localStorage);
    void repository.loadStudentDashboard(data, searchParams.get("activity")).then((nextDashboardData) => {
      if (!active) return;
      setDashboardData(nextDashboardData);
    });
    return () => { active = false; };
  }, [data, searchParams]);
  if (!dashboardData.activities.length) return <main className="student-dashboard min-h-screen"><DashboardHero /><div className="dashboard-body"><section className="student-empty-dashboard"><Image src="/logos/socrato-logo-v2.png" width={86} height={86} alt="Portrait de Socrato" unoptimized /><h2>Aucune activité pour le moment</h2><p>Ton enseignant n’a pas encore assigné d’activité à ton groupe. Tu pourras revenir ici avec le même code lorsqu’une activité sera disponible.</p></section></div></main>;
  const activity = getSelectedActivity(dashboardData);
  return (
    <main className="student-dashboard min-h-screen">
      <DashboardHero />
      <div className="dashboard-body">
        <section id="activite" className="activity-overview" aria-label="Activité sélectionnée">
          <SocratoWelcome activity={activity} data={dashboardData} />
          <MainActivityCard activity={activity} testMode={testMode} />
        </section>
        <SummaryPanel activity={activity} />
        <section className="activity-results" aria-label="Résultats de cette activité">
          <OperationResults items={activity.operations} />
          <KnowledgeResults items={activity.historicalKnowledge} />
        </section>
        <ActivityList activities={dashboardData.activities} selectedActivityId={dashboardData.selectedActivityId} />
        <p className="dashboard-note"><span aria-hidden="true">i</span> Les connaissances non travaillées n’ont pas encore été couvertes dans cette activité.</p>
      </div>
    </main>
  );
}

function DashboardHero() {
  return (
    <header className="dashboard-hero">
      <div className="dashboard-hero-overlay" />
      <div className="dashboard-hero-content">
        <Link href="/" className="brand-lockup" aria-label="Accueil Socrato">
          <Image src="/logos/socrato-logo-blanc-recadre.png" alt="Logo Socrato" width={38} height={38} priority unoptimized className="brand-mark" />
          <span className="brand-copy"><span className="brand-name">SOCRATO</span><span className="brand-signature">ESPACE ÉLÈVE</span></span>
        </Link>
        <div className="hero-title-block"><h1>{DASHBOARD_LABELS.title}</h1></div>
        <div className="dashboard-header-actions"><ThemeToggle /><StudentLogoutButton /></div>
      </div>
    </header>
  );
}

function SocratoWelcome({ activity, data }: { activity: StudentActivity; data: StudentDashboardData }) {
  const completed = activity.activityStatus === "completed";
  const notionTitles = activity.notionIds.map((id) => data.notions.find((notion) => notion.id === id)?.title).filter(Boolean);
  return (
    <aside className="welcome-panel" aria-labelledby="welcome-title">
      <div className="new-activity-heading"><BookIcon /><h2 id="welcome-title">{completed ? "Activité terminée" : "Nouvelle activité disponible"}</h2></div>
      <div className="welcome-copy">
        <span className="welcome-portrait" aria-label="Portrait de Socrato" role="img">
          <Image src="/logos/socrato-logo-blanc.png" alt="" width={94} height={94} unoptimized className="welcome-portrait-light" />
          <Image src="/logos/socrato-logo-v2.png" alt="" width={94} height={94} unoptimized className="welcome-portrait-dark" />
        </span>
        <div>
          <h2>{completed ? "Bravo ! Tu as terminé cette activité de révision !" : "Bonjour !"}</h2>
          {completed ? (
            <p>Ton bilan personnalisé est présenté ci-dessous.</p>
          ) : (
            <>
              <p>Ton enseignant t’a préparé une activité de révision sur :</p>
              <ul>{notionTitles.map((title) => <li key={title}>{title}</li>)}</ul>
              <p>Je vais t’accompagner tout au long de cette activité.</p>
              <p>Commence lorsque tu te sentiras prêt.</p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

function MainActivityCard({ activity, testMode }: { activity: StudentActivity; testMode: boolean }) {
  const period = getHistoricalPeriodLabel(activity.historicalPeriod);
  async function restartActivity() {
    const repository = createConfiguredDataRepository(window.localStorage);
    await repository.clearStudentOutcome(activity.id);
    await repository.clearStudentProgress(activity.id);
    const mode = activity.origin === "teacher_assigned" ? "teacher-assigned" : "notion-review";
    window.location.assign(getLearningSessionUrl(activity.id, activity.notionIds[0] ?? "acte-union", mode));
  }
  return (
    <article className={`main-activity-card activity-${activity.origin}`}>
      <div className="activity-card-topline">
        <span className="activity-type">{ACTIVITY_TYPE_LABELS[activity.activityType]}</span>
        <span className="publication-date"><CalendarIcon /> Publiée le {activity.publicationDate}</span>
      </div>
      <h2>{activity.activityTitle}</h2>
      {period ? <p className="main-activity-period">{period}</p> : null}
      <div className="activity-card-content">
        <div className="activity-details">
          <div className="activity-facts">{activity.durationMinutes > 0 ? <span>◷ {activity.durationMinutes} minutes</span> : null}<span>▤ {activity.historicalKnowledgeIds.length} connaissances</span></div>
          {activity.historicalKnowledge.length > 0 ? (
            <ul className="targeted-knowledge">{activity.historicalKnowledge.map((item) => <li key={item.id}>{item.label}</li>)}</ul>
          ) : <p className="no-targeted-knowledge">Aucune connaissance historique approuvée n’est associée à cette activité.</p>}
        </div>
        <div className="activity-progress" aria-label={`Progression ${activity.progressPercentage} %`} style={{ "--progress": `${activity.progressPercentage * 3.6}deg` } as CSSProperties}>
          <div><strong>{activity.progressPercentage}%</strong><span>complété</span></div>
        </div>
      </div>
      {activity.activityStatus === "completed"
        ? testMode
          ? <button type="button" className="main-activity-action" onClick={restartActivity}>Refaire cette activité <span aria-hidden="true">→</span></button>
          : <button type="button" className="main-activity-action" disabled>Activité complétée</button>
        : <Link href={activity.actionHref} className="main-activity-action">{getActivityActionLabel(activity)} <span aria-hidden="true">→</span></Link>}
    </article>
  );
}

function SummaryPanel({ activity }: { activity: StudentActivity }) {
  const complete = activity.summary.state !== "pending";
  const consolidationProgress = activity.summary.consolidationProgress;
  const consolidationSource = consolidationProgress?.source === "teacher_assigned" ? "Assignée par l’enseignant" : "Proposée par Socrato";
  const items = complete ? [
    { kind: "strength", title: "Tes points forts", text: activity.summary.strengths.join(" ") },
    { kind: "consolidate", title: "Les éléments à consolider", text: activity.summary.consolidationTargets.join(" ") },
    { kind: "recommend", title: "Une activité de consolidation", text: activity.summary.consolidationActivity ?? activity.summary.recommendation ?? "Aucune recommandation confirmée." },
  ] : [
    { kind: "strength", title: "Tes points forts", text: "Ils apparaîtront après le traitement confirmé de l’activité." },
    { kind: "consolidate", title: "Les éléments à consolider", text: "Ils seront réutilisés depuis le bilan enregistré de la séance." },
    { kind: "recommend", title: "Une activité de consolidation, si nécessaire", text: "Elle sera proposée uniquement à partir d’un résultat confirmé." },
  ];
  return (
    <section id="bilan" className="summary-panel" aria-labelledby="summary-title">
      <div className="summary-heading"><CompassIcon /><div><h2 id="summary-title">{DASHBOARD_LABELS.summary}</h2><p>{complete ? "Voici les résultats enregistrés pour cette activité." : "Lorsque tu auras terminé cette activité, Socrato préparera un bilan personnalisé."}</p></div></div>
      {consolidationProgress && <article className={`consolidation-progress consolidation-progress--${consolidationProgress.state}`} aria-labelledby="consolidation-progress-title"><div><span>Progression après consolidation</span><h3 id="consolidation-progress-title">{consolidationProgress.previousLevel} <span aria-hidden="true">→</span> {consolidationProgress.currentLevel}</h3><p>{consolidationProgress.observation}</p></div><dl><div><dt>Origine</dt><dd>{consolidationSource}</dd></div><div><dt>Terminée le</dt><dd>{consolidationProgress.completedAt}</dd></div></dl></article>}
      <div className="summary-grid">{items.map((item) => <article key={item.kind} className={`summary-item summary-${item.kind}`}><span aria-hidden="true">{item.kind === "strength" ? "✓" : item.kind === "consolidate" ? "◎" : "✎"}</span><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div>
    </section>
  );
}

function OperationResults({ items }: { items: IntellectualOperation[] }) {
  const workedItems = getWorkedOperations(items);
  return (
    <section className="results-panel" aria-labelledby="operations-title">
      <ResultsHeading id="operations-title" title={DASHBOARD_LABELS.operations} />
      <div className="results-list">{workedItems.length ? workedItems.map((item) => <ResultRow key={item.id} id={item.id} label={item.label} status={item.status} />) : <div className="results-empty">Tes résultats apparaîtront ici après le début de l’activité.</div>}</div>
    </section>
  );
}

function KnowledgeResults({ items }: { items: HistoricalKnowledge[] }) {
  const workedItems = getWorkedHistoricalKnowledge(items);
  return (
    <section className="results-panel knowledge-results" aria-labelledby="knowledge-title">
      <ResultsHeading id="knowledge-title" title={DASHBOARD_LABELS.knowledge} />
      <KnowledgeScrollRegion total={workedItems.length}>
        {workedItems.length ? workedItems.map((item) => <ResultRow key={item.id} id={item.id} label={item.label} status={item.status} />) : <div className="results-empty">Tes connaissances travaillées apparaîtront ici au fil de l’activité.</div>}
      </KnowledgeScrollRegion>
    </section>
  );
}

function ResultsHeading({ id, title }: { id: string; title: string }) {
  return <div className="results-heading"><h2 id={id}>{title}</h2><p>Résultats de cette activité</p></div>;
}

function ResultRow({ id, label, status }: { id: string; label: string; status: IntellectualOperation["status"] }) {
  return <article className={`result-row status-${status}`}><OperationIcon id={id} /><h3>{label}</h3><span>{PROGRESS_STATUS_LABELS[status]}</span></article>;
}

function ActivityList({ activities, selectedActivityId }: { activities: StudentActivity[]; selectedActivityId: string }) {
  return (
    <section className="activities-panel" aria-labelledby="activities-title">
      <h2 id="activities-title">{DASHBOARD_LABELS.activities}</h2>
      <div className="activities-list">{activities.map((activity) => (
        <Link key={activity.id} href={getActivityDashboardUrl(activity.id)} aria-current={activity.id === selectedActivityId ? "page" : undefined} className={`activity-row status-${activity.activityStatus}`}>
          <span className="activity-row-icon" aria-hidden="true">★</span>
          <span className="activity-row-title"><small>{ACTIVITY_TYPE_LABELS[activity.activityType]}</small><strong>{activity.activityTitle}</strong></span>
          <span className="activity-row-date">Publiée le {activity.publicationDate}<small>{getHistoricalPeriodLabel(activity.historicalPeriod)}</small></span>
          <span className="activity-row-status">{ACTIVITY_STATUS_LABELS[activity.activityStatus]} <span aria-hidden="true">→</span></span>
        </Link>
      ))}</div>
    </section>
  );
}

function OperationIcon({ id }: { id: string }) {
  const paths: Record<string, string> = {
    establish_facts: "M8 5h10l4 4v14H8zM18 5v4h4M11 14h8M11 18h6",
    causes_and_consequences: "M16 5v22M9 8h14M8 8l-4 9h8L8 8ZM24 8l-4 9h8l-4-9Z",
    time_and_space: "M16 5a9 9 0 1 0 9 9M16 9v6l4 2M25 17c0 5-5 10-5 10s-5-5-5-10a5 5 0 0 1 10 0Z",
    relationships_between_facts: "M16 5v8M7 24l9-11 9 11M7 24h18M16 13l-9-4M16 13l9-4",
    changes_and_continuities: "M25 11A10 10 0 0 0 7 8L5 11M7 21a10 10 0 0 0 18-3l2 3",
    differences_and_similarities: "M12 6a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM20 6a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z",
    causal_connections: "M13 19l-3 3a5 5 0 0 1-7-7l4-4a5 5 0 0 1 7 0M19 13l3-3a5 5 0 0 1 7 7l-4 4a5 5 0 0 1-7 0M11 16h10",
  };
  return <span className="result-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d={paths[id] ?? "M8 8h16v16H8z"} /></svg></span>;
}

function BookIcon() { return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 7c5-1 9 1 12 4 3-3 7-5 12-4v18c-5-1-9 1-12 4-3-3-7-5-12-4V7Zm12 4v18" /></svg>; }
function CalendarIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4v3M19 4v3M4 9h16M5 6h14v14H5z" /></svg>; }
function CompassIcon() { return <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="18"/><path d="m31 17-4 10-10 4 4-10 10-4Z"/><circle cx="24" cy="24" r="2"/></svg>; }

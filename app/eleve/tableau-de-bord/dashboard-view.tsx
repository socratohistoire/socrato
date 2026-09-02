"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { createConfiguredDataRepository } from "@/lib/data-repository";
import { getHistoricalPeriodLabel } from "@/lib/student-dashboard/historical-period";
import { getSelectedActivity, getActivityDashboardUrl, getConsolidationSessionUrl, getConsolidationStrategyAdvice, getConsolidationStrategyKey, getLearningSessionUrl, normalizeConsolidationStrategyAdvice } from "@/lib/student-dashboard/selection";
import {
  ACTIVITY_STATUS_LABELS,
  ACTIVITY_TYPE_LABELS,
  DASHBOARD_LABELS,
  getActivityActionLabel,
  getWorkedHistoricalKnowledge,
  getWorkedOperations,
  PROGRESS_STATUS_LABELS,
} from "@/lib/student-dashboard/presentation";
import type { IntellectualOperation, StudentActivity, StudentDashboardData } from "@/lib/student-dashboard/types";
import { ThemeToggle } from "./theme-toggle";
import { StudentLogoutButton } from "../logout-button";

function SummaryEntry({ entry, formatStrategy = false }: { entry: string; formatStrategy?: boolean }) {
  if (formatStrategy && entry === "Aucune stratégie prioritaire pour le moment.") return <p>{entry}</p>;
  const [title, ...bodyParts] = entry.split("\n");
  if (!formatStrategy) {
    const body = bodyParts.join(" ").trim();
    return body ? <div className="summary-entry"><strong>{title}</strong><p>{body}</p></div> : <p>{entry}</p>;
  }
  const difficultyIndex = bodyParts.indexOf("Difficulté observée");
  const operationWorkIndex = bodyParts.indexOf("Comment travailler cette opération");
  if (difficultyIndex >= 0 && operationWorkIndex > difficultyIndex) {
    return <div className="summary-entry summary-entry--structured">
      <strong>{title}</strong>
      <div><b>Le point à travailler</b><p>{bodyParts.slice(difficultyIndex + 1, operationWorkIndex).join(" ")}</p></div>
      <div><b>Comment travailler cette opération</b><p>{normalizeConsolidationStrategyAdvice(bodyParts.slice(operationWorkIndex + 1).join(" "))}</p></div>
    </div>;
  }
  const questionIndex = bodyParts.indexOf("Question");
  const verificationIndex = bodyParts.indexOf("À vérifier");
  const progressIndex = bodyParts.indexOf("Comment progresser");
  if (verificationIndex > 0 && progressIndex > verificationIndex) {
    const savedContext = bodyParts.slice(questionIndex >= 0 ? questionIndex + 1 : 0, verificationIndex).join(" ").replace(/[.:]+$/u, "");
    const context = title === "Associer les données à la bonne colonie"
      ? "Dans la question sur la population et la dette des deux Canadas"
      : savedContext;
    const savedVerification = bodyParts.slice(verificationIndex + 1, progressIndex).join(" ");
    const verification = title === "Associer les données à la bonne colonie"
      ? "Tu as inversé les données des deux colonies : le Haut-Canada compte environ 450 000 habitants et porte une dette d’environ 1 540 000 £, tandis que le Bas-Canada compte environ 650 000 habitants et une dette d’environ 133 000 £. La mise en commun peut donc sembler injuste au Canada-Est, puisque sa population plus nombreuse contribue au remboursement de la dette beaucoup plus élevée du Haut-Canada."
      : savedVerification;
    return <div className="summary-entry summary-entry--structured">
      <strong>{title}</strong>
      <div><b>{context || "Dans cette question"}</b><p>{verification}</p></div>
      <div><b>Pour progresser</b><p>{normalizeConsolidationStrategyAdvice(bodyParts.slice(progressIndex + 1).join(" "))}</p></div>
    </div>;
  }
  const body = bodyParts.join("\n").trim()
    .replace(" Choisis un seul critère de comparaison à la fois, puis", " Pour mieux structurer ta comparaison, choisis un seul critère à la fois, puis")
    .replace(" Construis une chaîne courte :", " Pour rendre ton raisonnement plus clair, construis une chaîne courte :")
    .replace(" Compare un avant et un après, puis distingue", " Pour mieux distinguer les changements des continuités, compare un avant et un après, puis précise")
    .replace(" Replace d’abord les faits dans l’ordre", " Pour mieux organiser tes repères, replace d’abord les faits dans l’ordre")
    .replace(" Pour mieux organiser tes repères, replace d’abord les faits dans l’ordre — avant, événement central, après — puis vérifie les dates et les lieux.", " Pour mieux organiser tes repères, décris d’abord la situation avant l’événement, puis précise ce qui change après en vérifiant les noms, les dates et les lieux.")
    .replace(" Nomme les deux faits, puis complète mentalement", " Pour rendre le lien plus explicite, nomme les deux faits, puis complète mentalement")
    .replace(" Repère le verbe de la question, reformule", " Pour répondre plus précisément, repère le verbe de la question, reformule")
    .replace(" Commence par vérifier que tu réponds", " Pour éviter cet oubli la prochaine fois, commence par vérifier que tu réponds");
  const legacyMarker = ", ton premier essai demandait encore cette vérification : ";
  const markerIndex = body.indexOf(legacyMarker);
  if (markerIndex > 0) {
    const context = `${body.slice(0, markerIndex)}.`;
    const remainder = body.slice(markerIndex + legacyMarker.length);
    const adviceStarts = ["Pour mieux", "Pour rendre", "Pour éviter", "Pour répondre", "Relève l’apport", "Choisis dans le document", "Avant d’interpréter"];
    const adviceIndex = adviceStarts.map((start) => remainder.lastIndexOf(` ${start}`)).filter((index) => index > 0).sort((a, b) => a - b)[0] ?? -1;
    const verification = adviceIndex > 0 ? remainder.slice(0, adviceIndex).trim() : remainder;
    const legacyAdvice = adviceIndex > 0 ? remainder.slice(adviceIndex).trim() : "Reprends cette vérification avant d’envoyer ta prochaine réponse.";
    const advice = legacyAdvice.startsWith("Relève l’apport de chaque document")
      ? "À ta prochaine question avec plusieurs documents, note d’abord l’idée utile de chacun. Vérifie ensuite s’ils se complètent ou s’opposent avant de formuler ta conclusion."
      : /année|date|adoption|entrée en vigueur/iu.test(`${context} ${verification}`) && legacyAdvice.startsWith("Pour mieux organiser tes repères")
        ? "À ta prochaine question comportant plusieurs dates, écris chaque date à côté d’un verbe d’action précis, par exemple « adopter », « entrer en vigueur » ou « appliquer », puis vérifie que tu ne les as pas inversées."
      : legacyAdvice.startsWith("Choisis dans le document")
        ? `À ta prochaine question avec un document, ${legacyAdvice.charAt(0).toLowerCase()}${legacyAdvice.slice(1)}`
        : legacyAdvice.startsWith("Avant d’interpréter")
          ? `À ta prochaine question avec un document, ${legacyAdvice.charAt(0).toLowerCase()}${legacyAdvice.slice(1)}`
          : legacyAdvice;
    return <div className="summary-entry summary-entry--structured">
      <strong>{title}</strong>
      <div><b>{context.replace(/[.:]+$/u, "")}</b><p>{verification}</p></div>
      <div><b>Pour progresser</b><p>{advice}</p></div>
    </div>;
  }
  if (!body) return <div className="summary-entry summary-entry--structured"><strong>Reprendre le point essentiel</strong><div><b>Dans cette question</b><p>{entry}</p></div><div><b>Pour progresser</b><p>À ta prochaine question, vérifie ce point avant d’envoyer ta réponse.</p></div></div>;
  return <div className="summary-entry"><strong>{title}</strong><p>{body}</p></div>;
}

function SummaryCard({ item, operations, consolidationHref }: {
  item: { kind: string; title: string; entries: string[] };
  operations: IntellectualOperation[];
  consolidationHref: string | null;
}) {
  if (item.kind === "operations") return <div className="summary-operations summary-item"><span aria-hidden="true"><ReasoningIcon /></span><div><OperationResults items={operations} /></div></div>;
  const formatStrategy = item.kind === "consolidate";
  const content = item.kind === "strength"
    ? item.entries.length ? <ul>{item.entries.map((entry) => {
      const [subtitle, ...comment] = entry.split("\n");
      return <li key={entry}><div className="summary-entry summary-strength-entry"><h4>{subtitle}</h4><p>{comment.join(" ") || subtitle}</p></div></li>;
    })}</ul> : <p>Aucun point fort confirmé pour cette activité.</p>
    : item.entries.length > 1
      ? <ul>{item.entries.map((entry) => <li key={entry}><SummaryEntry entry={entry} formatStrategy={formatStrategy} /></li>)}</ul>
      : <SummaryEntry entry={item.entries[0] ?? (item.kind === "consolidate" ? "Aucune stratégie prioritaire pour le moment." : "Bilan enregistré.")} formatStrategy={formatStrategy} />;
  return <article className={`summary-item summary-${item.kind}`}><span aria-hidden="true">{item.kind === "strength" ? "✓" : item.kind === "consolidate" ? "◎" : "✎"}</span><div><h3>{item.title}</h3>{content}{item.kind === "recommend" && consolidationHref ? <Link className="consolidation-action" href={consolidationHref}>Commencer l’activité de consolidation <span aria-hidden="true">→</span></Link> : null}</div></article>;
}

function operationFocusedEntry(entry: string, operation?: IntellectualOperation) {
  if (!operation || !/^Opération intellectuelle à consolider\n/iu.test(entry)) return entry;
  const concernsDebtAndPopulation = /population/iu.test(entry) && /dette|mise en commun/iu.test(entry);
  const difficulty = concernsDebtAndPopulation
    ? "Tu as d’abord inversé les données des deux colonies et tu n’as pas relié cet écart financier à l’opposition du Canada-Est. La cause et la conséquence devaient être distinguées puis reliées explicitement."
    : "Ton premier raisonnement ne réalisait pas encore complètement la relation demandée par cette opération intellectuelle.";
  const process = operation.id === "causes_and_consequences"
    ? "Distingue ce qui explique la situation de ce qui en découle, puis formule explicitement le lien entre la cause et la conséquence."
    : operation.id === "causal_connections"
      ? "Nomme la cause, explique le mécanisme qui relie les faits, puis formule la conséquence."
      : "Relève les faits pertinents, organise-les selon la relation demandée, puis vérifie que ta réponse réalise bien l’opération intellectuelle.";
  return `${operation.label}\nDifficulté observée\n${difficulty}\nComment travailler cette opération\n${process}`;
}

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
          <SocratoWelcome activity={activity} />
          <MainActivityCard activity={activity} data={dashboardData} testMode={testMode} />
        </section>
        <SummaryPanel activity={activity} reveal={searchParams.get("reveal") === "bilan"} />
        <ActivityList activities={dashboardData.activities} selectedActivityId={dashboardData.selectedActivityId} />
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

function SocratoWelcome({ activity }: { activity: StudentActivity }) {
  const completed = activity.activityStatus === "completed";
  return (
    <aside className="welcome-panel" aria-labelledby="welcome-title">
      <div className="new-activity-heading"><BookIcon /><h2 id="welcome-title">{completed ? "Activité complétée" : "Nouvelle activité disponible"}</h2></div>
      <div className="welcome-copy">
        <span className="welcome-portrait" aria-label="Portrait de Socrato" role="img">
          <Image src="/logos/socrato-logo-blanc.png" alt="" width={94} height={94} unoptimized className="welcome-portrait-light" />
          <Image src="/logos/socrato-logo-v2.png" alt="" width={94} height={94} unoptimized className="welcome-portrait-dark" />
        </span>
        <div className="welcome-message">
          <h2>{completed ? "Bravo ! Tu as terminé cette activité de révision !" : "Bonjour !"}</h2>
          {completed ? (
            <p>Ton bilan personnalisé est présenté ci-dessous.</p>
          ) : (
            <>
              <p>Ton enseignant t’a préparé cette activité de révision.</p>
              <p>Je vais t’accompagner tout au long de l’activité. Commence lorsque tu te sentiras prêt.</p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

function MainActivityCard({ activity, data, testMode }: { activity: StudentActivity; data: StudentDashboardData; testMode: boolean }) {
  const period = getHistoricalPeriodLabel(activity.historicalPeriod);
  const coveredNotions = activity.notionIds.map((id) => data.notions.find((notion) => notion.id === id)?.title ?? id);
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
      <div className="activity-card-content">
        <div className="activity-title-region">
          <h2>{activity.activityTitle}</h2>
          {period ? <p className="main-activity-period">{period}</p> : null}
          {activity.durationMinutes > 0 ? <p className="activity-duration">◷ {activity.durationMinutes} minutes</p> : null}
        </div>
        <div className="activity-notions-region">
          <h3>Notions abordées dans cette activité</h3>
          {coveredNotions.length > 0 ? (
            <ul className="targeted-knowledge">{coveredNotions.map((title) => <li key={title}>{title}</li>)}</ul>
          ) : <p className="no-targeted-knowledge">Aucune notion n’est associée à cette activité.</p>}
        </div>
      </div>
      <div className={`activity-card-footer activity-card-footer-${activity.activityStatus}`}>
        <div className="activity-card-side">
          {activity.activityStatus === "completed"
            ? testMode ? <button type="button" className="main-activity-action" onClick={restartActivity}>Refaire cette activité <span aria-hidden="true">→</span></button> : null
            : <Link href={activity.actionHref} className="main-activity-action">{getActivityActionLabel(activity)} <span aria-hidden="true">→</span></Link>}
        </div>
        <div className="activity-progress" aria-label={`Progression ${activity.progressPercentage} %`} style={{ "--progress-value": `${activity.progressPercentage}%` } as CSSProperties}>
          <div className="activity-progress-copy"><span>Progression</span><strong>{activity.progressPercentage} %</strong></div>
          <div className="activity-progress-track" aria-hidden="true"><span /></div>
        </div>
      </div>
    </article>
  );
}

function SummaryPanel({ activity, reveal }: { activity: StudentActivity; reveal: boolean }) {
  const complete = activity.summary.state !== "pending";
  const savedConsolidationProgress = activity.summary.consolidationProgress;
  const hasPersistentDifficulty = activity.operations.some(({ status }) => status === "needs_work");
  const targetOperationMastered = Boolean(savedConsolidationProgress && activity.operations.some(({ id, label, status }) =>
    (status === "mastered" || status === "consolidate") && (
      id === savedConsolidationProgress.targetOperationId
      || (savedConsolidationProgress.strategyLabel
        && label.localeCompare(savedConsolidationProgress.strategyLabel, "fr-CA", { sensitivity: "base" }) === 0)
    )));
  const consolidationProgress = savedConsolidationProgress && hasPersistentDifficulty
    ? null
    : savedConsolidationProgress?.state === "continue" && targetOperationMastered && !hasPersistentDifficulty
    ? {
      ...savedConsolidationProgress,
      state: "consolidated" as const,
      currentLevel: "Consolidée",
      observation: `Tu as réussi à appliquer la stratégie « ${savedConsolidationProgress.strategyLabel} » avec l’aide de Socrato.`,
    }
    : savedConsolidationProgress;
  const consolidationSource = consolidationProgress?.source === "teacher_assigned" ? "Assignée par l’enseignant" : "Proposée par Socrato";
  const consolidationProgressTitle = consolidationProgress?.state === "consolidated" ? "Stratégie réussie"
    : consolidationProgress?.state === "continue" ? "Stratégie à poursuivre" : "Progression dans la stratégie";
  const consolidatedStrategyKey = consolidationProgress?.state === "consolidated" ? consolidationProgress.strategyKey : undefined;
  const workedKnowledge = getWorkedHistoricalKnowledge(activity.historicalKnowledge);
  // Une opération réussie avec l’aide de Socrato est comprise. Seule une
  // difficulté persistante peut donc déclencher une nouvelle activité.
  const consolidationStatuses = new Set(["needs_work"]);
  const operationTargets = getWorkedOperations(activity.operations).filter(({ status }) => consolidationStatuses.has(status));
  const knowledgeTargets = workedKnowledge.filter(({ status }) => consolidationStatuses.has(status));
  const confirmedTargets = [...operationTargets, ...knowledgeTargets];
  const consolidationTargets = confirmedTargets.length ? activity.summary.consolidationTargets.filter((entry) =>
    getConsolidationStrategyKey(entry) !== consolidatedStrategyKey
      && !/^Décomposer la consigne\n|^Décoder la consigne\n|^Repère le verbe de la question|^Croiser plusieurs documents|^Identifier le point de vue et le contexte|^Prélever et expliquer une preuve/iu.test(entry)) : [];
  const savedTargetText = consolidationTargets[0] ?? "";
  const concernsDebtAndPopulation = /population/iu.test(savedTargetText) && /dette|mise en commun/iu.test(savedTargetText);
  const inferredTargetOperation = concernsDebtAndPopulation ? operationTargets.find(({ id }) => id === "causes_and_consequences") : undefined;
  const targetOperation = inferredTargetOperation
    ?? activity.summary.recommendedOperationIds?.map((id) => operationTargets.find((item) => item.id === id)).find(Boolean)
    ?? operationTargets.find(({ status }) => status === "needs_work") ?? operationTargets[0];
  const targetKnowledge = activity.summary.recommendedHistoricalKnowledgeIds?.map((id) => workedKnowledge.find((item) => item.id === id)).find(Boolean)
    ?? knowledgeTargets.find(({ status }) => status === "needs_work") ?? knowledgeTargets[0];
  const consolidationEntries = [...new Set(consolidationTargets)].slice(0, 1).map((entry) => operationFocusedEntry(entry, targetOperation));
  const priorityStrategy = getConsolidationStrategyKey(consolidationEntries[0]);
  const priorityStrategyAdvice = getConsolidationStrategyAdvice(consolidationEntries[0]);
  const strategyKnowledge = priorityStrategy === "data-association" || concernsDebtAndPopulation
    ? activity.historicalKnowledge.find(({ id }) => id === "dette-publique")
    : undefined;
  const effectiveTargetKnowledge = strategyKnowledge ?? targetKnowledge;
  const hasActionableConsolidation = confirmedTargets.length > 0 && consolidationEntries.length > 0;
  const nextStep = !hasActionableConsolidation
    ? "Aucune activité supplémentaire n’est nécessaire pour le moment."
    : targetOperation && effectiveTargetKnowledge
    ? `Dans une courte activité de consolidation, tu travailleras l’opération « ${targetOperation.label} » à partir de la connaissance historique « ${effectiveTargetKnowledge.label} ».`
    : targetOperation
      ? `Dans une courte activité de consolidation, tu travailleras précisément l’opération « ${targetOperation.label} ».`
      : effectiveTargetKnowledge
        ? `Dans une courte activité de consolidation, tu reprendras précisément la connaissance historique « ${effectiveTargetKnowledge.label} ».`
        : "Aucune activité supplémentaire n’est nécessaire pour le moment.";
  const consolidationHref = hasActionableConsolidation ? getConsolidationSessionUrl(activity.id, activity.notionIds[0] ?? "acte-union", targetOperation?.id, effectiveTargetKnowledge?.id, priorityStrategy, priorityStrategyAdvice) : null;
  const hideEmptyStrengthsAfterConsolidation = consolidationProgress?.state === "consolidated" && activity.summary.strengths.length === 0;
  const items = complete ? [
    ...hideEmptyStrengthsAfterConsolidation ? [] : [{ kind: "strength", title: "Ce que tu as bien réussi", entries: activity.summary.strengths }],
    { kind: "consolidate", title: "Ma stratégie pour progresser", entries: consolidationEntries.length ? consolidationEntries : ["Aucune stratégie prioritaire pour le moment."] },
    { kind: "operations", title: "Mes opérations intellectuelles", entries: [] },
    ...(hasActionableConsolidation ? [{ kind: "recommend", title: "Activité de consolidation", entries: [nextStep] }] : []),
  ] : [
    { kind: "strength", title: "Ce que tu as bien réussi", entries: ["Ces réussites apparaîtront après le traitement confirmé de l’activité."] },
    { kind: "consolidate", title: "Ma stratégie pour progresser", entries: ["Elle sera proposée à partir du bilan enregistré de la séance."] },
    { kind: "recommend", title: "Une activité de consolidation, si nécessaire", entries: ["Elle sera proposée uniquement à partir d’un résultat confirmé."] },
  ];
  return (
    <section id="bilan" className={`summary-panel${reveal ? " summary-panel--reveal" : ""}`} aria-labelledby="summary-title">
      <div className="summary-heading"><CompassIcon /><div><h2 id="summary-title">{DASHBOARD_LABELS.summary}</h2>{complete ? <p>Voici les résultats enregistrés pour cette activité.</p> : null}</div></div>
      {consolidationProgress && <article className={`consolidation-progress consolidation-progress--${consolidationProgress.state}`} aria-labelledby="consolidation-progress-title"><div><span>Activité de consolidation</span><h3 id="consolidation-progress-title">{consolidationProgressTitle}</h3><p>{consolidationProgress.observation}</p></div><dl><div><dt>Origine</dt><dd>{consolidationSource}</dd></div><div><dt>Terminée le</dt><dd>{consolidationProgress.completedAt}</dd></div></dl></article>}
      {complete ? <div className="summary-grid">
        <div className="summary-column">{items.filter(({ kind }) => kind === "strength" || kind === "operations").map((item) => <SummaryCard key={item.kind} item={item} operations={activity.operations} consolidationHref={consolidationHref} />)}</div>
        <div className="summary-column">{items.filter(({ kind }) => kind === "consolidate" || kind === "recommend").map((item) => <SummaryCard key={item.kind} item={item} operations={activity.operations} consolidationHref={consolidationHref} />)}</div>
      </div> : <div className="summary-pending"><article className="summary-pending-item summary-strength"><span aria-hidden="true">✓</span><h3>Ce que tu as bien réussi</h3></article><article className="summary-pending-item summary-consolidate"><span aria-hidden="true">◎</span><h3>Ma stratégie pour progresser</h3></article><article className="summary-pending-item summary-operations-preview"><span aria-hidden="true"><ReasoningIcon /></span><h3>Mes opérations intellectuelles</h3></article><p>Les résultats apparaîtront ici après le début de l’activité.</p></div>}
    </section>
  );
}

function OperationResults({ items }: { items: IntellectualOperation[] }) {
  const order = { needs_work: 0, consolidate: 1, mastered: 2, covered: 3, not_assessed: 4 } as const;
  const workedItems = [...getWorkedOperations(items)].sort((left, right) => order[left.status] - order[right.status]);
  return (
    <section className="results-panel" aria-labelledby="operations-title">
      <ResultsHeading id="operations-title" title={DASHBOARD_LABELS.operations} />
      <div className="results-list">{workedItems.length ? workedItems.map((item) => <ResultRow key={item.id} id={item.id} label={item.label} status={item.status} />) : <div className="results-empty">Tes résultats apparaîtront ici après le début de l’activité.</div>}</div>
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
          <span className={`activity-row-icon${activity.isRecent ? "" : " activity-row-icon-empty"}`} aria-hidden="true">{activity.isRecent ? "★" : ""}</span>
          <span className="activity-row-title"><small>{ACTIVITY_TYPE_LABELS[activity.activityType]}</small><strong>{activity.activityTitle}</strong>{activity.id === selectedActivityId ? <em>Activité actuelle</em> : null}</span>
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
function ReasoningIcon() { return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M10.5 19.5a9 9 0 1 1 11 0c-1.3 1-2 2.1-2 3.5h-7c0-1.4-.7-2.5-2-3.5Z"/><path d="M12.5 26h7M14 29h4M16 3V1M5.5 7.5 4 6M26.5 7.5 28 6M7 16H4M28 16h-3"/></svg>; }

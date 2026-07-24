import Image from "next/image";
import Link from "next/link";
import type {
  HistoricalKnowledge,
  IntellectualOperation,
  Notion,
  ProgressStatus,
  StudentDashboardData,
  TeacherPractice,
} from "@/lib/student-dashboard/types";
import {
  DASHBOARD_LABELS,
  getActivityActionLabel,
  getActivityCardLabel,
  getActivityOriginLabel,
} from "@/lib/student-dashboard/presentation";
import { presentIntellectualOperations } from "@/lib/student-dashboard/operation-presentation";
import { presentHistoricalKnowledge } from "@/lib/student-dashboard/knowledge-presentation";
import {
  getLearningSessionUrl,
  getNotionDashboardUrl,
  getSelectedNotionContext,
} from "@/lib/student-dashboard/selection";
import { ThemeToggle } from "./theme-toggle";
import { KnowledgeScrollRegion } from "./knowledge-scroll-region";
import { getHistoricalPeriodLabel } from "@/lib/student-dashboard/historical-period";

export function StudentDashboardView({ data }: { data: StudentDashboardData }) {
  const context = getSelectedNotionContext(data);
  const selectedNotion = data.notions.find(
    ({ id }) => id === context.notionId,
  );

  return (
    <main className="student-dashboard min-h-screen">
      <DashboardHero />
      <div className="dashboard-body mx-auto max-w-[1440px] px-5 pb-12 sm:px-8 lg:px-12">
        <div id="tableau-notion" className="dashboard-top-grid">
          <ActiveRevisionCard
            activity={context.activity}
            periodLabel={getHistoricalPeriodLabel(selectedNotion?.historicalPeriod)}
          />
          <NotebookCard
            recommendation={context.notebookRecommendation}
            emptyMessage={context.recommendationEmptyMessage}
          />
        </div>

        <section className="dashboard-progress-section" aria-label="Progression">
          <OperationCollection items={context.operations} />
          <KnowledgeCollection
            context={selectedNotion?.title ?? "Acte d’union"}
            items={context.historicalKnowledge}
          />
        </section>

        <NotionSection
          notions={data.notions}
          selectedNotionId={data.selectedNotionId}
        />
        <TeacherPracticesSection
          practices={data.teacherPractices}
          notions={data.notions}
        />
      </div>
    </main>
  );
}

function DashboardHero() {
  return (
    <header className="dashboard-hero">
      <div className="dashboard-hero-overlay" />
      <div className="dashboard-hero-content relative z-10 mx-auto flex h-full max-w-[1440px] items-center justify-between gap-5 px-5 sm:px-8 lg:px-12">
        <Link href="/" className="brand-lockup" aria-label="Accueil Socrato">
          <Image
            src="/logos/socrato-logo-blanc.png"
            alt="Logo Socrato"
            width={76}
            height={76}
            priority
            unoptimized
            className="brand-mark"
          />
          <span className="brand-copy">
            <span className="brand-name">SOCRATO</span>
            <span className="brand-signature">TON TUTEUR INTELLIGENT EN HISTOIRE</span>
          </span>
        </Link>

        <div className="hero-title-block">
          <p>ESPACE ÉLÈVE</p>
          <h1>{DASHBOARD_LABELS.title}</h1>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}

function ActiveRevisionCard({
  activity,
  periodLabel,
}: {
  activity: StudentDashboardData["notionContexts"][number]["activity"];
  periodLabel: string | null;
}) {
  const isStudentSelected = activity?.origin === "student_selected";

  return (
    <section
      id="activite"
      className={`activity-card ${isStudentSelected ? "activity-card-student-selected" : "activity-card-teacher-assigned"}`}
    >
      <div
        className="activity-illustration"
        aria-hidden={isStudentSelected || !activity ? true : undefined}
        style={activity ? {
          backgroundImage: `linear-gradient(90deg, rgba(105,67,38,.08), rgba(105,67,38,.18)), url('${activity.illustrationSrc}')`,
          backgroundPosition: activity.illustrationPosition,
        } : undefined}
      >
        {activity && !isStudentSelected ? (
          <span className="teacher-assigned-banner" role="note">
            <span className="teacher-assigned-star" aria-hidden="true">★</span>
            Assignée par ton enseignant
          </span>
        ) : null}
      </div>
      <div className="activity-copy">
        <div className="activity-label-row">
          <p>{activity ? getActivityCardLabel(activity) : DASHBOARD_LABELS.activity}</p>
          {activity && isStudentSelected ? (
            <span className="activity-origin">
              {getActivityOriginLabel(activity)}
            </span>
          ) : null}
          {activity?.isNew && !isStudentSelected ? (
            <span className="recent-badge">
              <span className="recent-dot" />
              Publiée récemment
            </span>
          ) : null}
        </div>
        <h2>{activity?.title ?? "Aucune activité publiée"}</h2>
        {activity && periodLabel ? (
          <p className="activity-period">{periodLabel}</p>
        ) : null}
        {activity ? (
          <Link href={activity.actionHref} className="primary-action">
            {getActivityActionLabel(activity)}
            <span aria-hidden="true">→</span>
          </Link>
        ) : (
          <p className="activity-context">
            Une activité apparaîtra ici lorsqu’elle sera publiée pour ton groupe.
          </p>
        )}
      </div>
      {activity ? (
        <div className="progress-zone" aria-label={`Progression ${activity.progressPercent} %`}>
          <div
            className="progress-ring"
            style={{ "--progress": `${activity.progressPercent * 3.6}deg` } as React.CSSProperties}
          >
            <div className="progress-ring-center">
              <strong>{activity.progressPercent}%</strong>
              <span>complété</span>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function NotebookCard({
  recommendation,
  emptyMessage,
}: {
  recommendation: StudentDashboardData["notionContexts"][number]["notebookRecommendation"];
  emptyMessage: string;
}) {
  return (
    <aside className="notebook-card">
      <div className="notebook-heading">
        <span className="notebook-compass" aria-hidden="true">
          <svg viewBox="0 0 48 48" focusable="false">
            <circle cx="24" cy="24" r="16.5" />
            <path d="m29.8 18.2-3.7 8-8 3.7 3.7-8 8-3.7Z" />
            <circle cx="24" cy="24" r="2.2" />
            <path d="M24 4.5v3M24 40.5v3M4.5 24h3M40.5 24h3" />
          </svg>
        </span>
        <h2 className="notebook-kicker" aria-label={DASHBOARD_LABELS.recommendations}>
          <span>RECOMMANDATIONS</span>
          <span>DE SOCRATO</span>
        </h2>
      </div>
      <div className="notebook-divider" aria-hidden="true">
        <span />
      </div>
      <div className="notebook-content">
        {recommendation ? (
          <>
            <h3>Pages recommandées</h3>
            <p>Socrato te suggère de réviser les pages {recommendation.pages}.</p>
            {recommendation.resourceHref ? (
              <a href={recommendation.resourceHref} className="notebook-action">
                Ouvrir le cahier
              </a>
            ) : null}
          </>
        ) : (
          <>
            <h3>Aucune page recommandée</h3>
            <p>{emptyMessage}</p>
            <NotebookEmptyIllustration />
          </>
        )}
      </div>
    </aside>
  );
}

function NotebookEmptyIllustration() {
  return (
    <svg
      className="notebook-empty-illustration"
      viewBox="0 0 210 92"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="notebook-glow">
          <stop offset="0" stopColor="#e4b65d" stopOpacity=".52" />
          <stop offset="1" stopColor="#e4b65d" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="notebook-pages" x1="0" x2="0" y1="0" y2="1">
          <stop stopColor="#71899b" />
          <stop offset="1" stopColor="#344f65" />
        </linearGradient>
      </defs>
      <ellipse cx="105" cy="48" rx="49" ry="39" fill="url(#notebook-glow)" />
      <g className="notebook-particles" fill="#e7bd70">
        <circle cx="48" cy="32" r="1.3" />
        <circle cx="158" cy="27" r="1" />
        <circle cx="171" cy="54" r="1.4" />
      </g>
      <path d="M105 74c-15-11-32-14-55-12V35c23-2 40 2 55 13v26Z" fill="url(#notebook-pages)" stroke="#9bb0bd" />
      <path d="M105 74c15-11 32-14 55-12V35c-23-2-40 2-55 13v26Z" fill="url(#notebook-pages)" stroke="#9bb0bd" />
      <path d="M105 49v25M58 42c17 0 31 3 42 11M152 42c-17 0-31 3-42 11" fill="none" stroke="#c0cbd1" strokeOpacity=".55" />
      <g transform="translate(105 25)">
        <path d="M0-15a10 10 0 0 0-10 10C-10 3 0 13 0 13S10 3 10-5A10 10 0 0 0 0-15Z" fill="#d9a94f" stroke="#f0cf8a" />
        <circle cy="-5" r="3.2" fill="#122d43" />
      </g>
    </svg>
  );
}

function OperationCollection({ items }: { items: IntellectualOperation[] }) {
  const presentedItems = presentIntellectualOperations(items);

  return (
    <section id="operations" aria-labelledby="operations-title">
      <SectionHeading id="operations-title" title={DASHBOARD_LABELS.operations} />
      <div className="operation-grid">
        {presentedItems.map((item) => (
          <article
            key={item.id}
            className={`operation-item operation-status-${item.status}`}
          >
            <OperationIcon operationId={item.id} />
            <h3>{item.label}</h3>
            <p className="operation-status-text">{item.statusLabel}</p>
            <a href="#operations" className="operation-review-button">
              <span>{item.reviewLabel}</span>
              <span aria-hidden="true">→</span>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

function OperationIcon({ operationId }: { operationId: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
  };

  return (
    <div className="operation-icon-circle" aria-hidden="true">
      <svg viewBox="0 0 32 32" focusable="false">
        {operationId === "establish_facts" ? (
          <g {...common}>
            <path d="M9 5.5h10l4 4V18" />
            <path d="M19 5.5v4h4M9 5.5v21h9" />
            <path d="M12.5 13h7M12.5 17h5" />
            <path d="m19.5 23 2.4 2.4 5-6" />
          </g>
        ) : null}
        {operationId === "causes_and_consequences" ? (
          <g {...common}>
            <path d="M16 6v20M10 9h12M8 9l-4 8h8L8 9ZM24 9l-4 8h8l-4-8Z" />
            <path d="M4 17c.7 2.4 7.3 2.4 8 0M20 17c.7 2.4 7.3 2.4 8 0M11 26h10" />
          </g>
        ) : null}
        {operationId === "time_and_space" ? (
          <g {...common}>
            <circle cx="12.5" cy="14" r="7.5" />
            <path d="M12.5 10v4l3 2" />
            <path d="M25.5 15.5c0 4.8-5 9.8-5 9.8s-5-5-5-9.8a5 5 0 0 1 10 0Z" />
            <circle cx="20.5" cy="15.5" r="1.6" />
          </g>
        ) : null}
        {operationId === "relationships_between_facts" ? (
          <g {...common}>
            <circle cx="16" cy="7" r="3" />
            <circle cx="7" cy="23" r="3" />
            <circle cx="25" cy="23" r="3" />
            <path d="m14.4 9.7-5.8 10.6M17.6 9.7l5.8 10.6M10 23h12" />
          </g>
        ) : null}
        {operationId === "changes_and_continuities" ? (
          <g {...common}>
            <path d="M25.5 12A10.5 10.5 0 0 0 8 7.5L5.5 10" />
            <path d="M5.5 10V5.5M6.5 20A10.5 10.5 0 0 0 24 24.5l2.5-2.5" />
            <path d="M26.5 22v4.5" />
          </g>
        ) : null}
        {operationId === "differences_and_similarities" ? (
          <g {...common}>
            <circle cx="12" cy="12" r="6.5" />
            <circle cx="20" cy="12" r="6.5" />
            <circle cx="16" cy="20" r="6.5" />
          </g>
        ) : null}
        {operationId === "causal_connections" ? (
          <g {...common}>
            <path d="m13.2 19.2-2.3 2.3a4.5 4.5 0 0 1-6.4-6.4l4.2-4.2a4.5 4.5 0 0 1 6.4 0" />
            <path d="m18.8 12.8 2.3-2.3a4.5 4.5 0 0 1 6.4 6.4l-4.2 4.2a4.5 4.5 0 0 1-6.4 0" />
            <path d="m11.5 16 9-0.1" />
          </g>
        ) : null}
      </svg>
    </div>
  );
}

function KnowledgeCollection({
  context,
  items,
}: {
  context: string;
  items: HistoricalKnowledge[];
}) {
  const presentedItems = presentHistoricalKnowledge(items);

  return (
    <section id="connaissances" aria-labelledby="knowledge-title">
      <SectionHeading
        id="knowledge-title"
        title={DASHBOARD_LABELS.knowledge}
      />
      <p className="knowledge-notion-title">{context}</p>
      <KnowledgeScrollRegion total={presentedItems.length}>
        {presentedItems.length > 0 ? presentedItems.map((item) => (
          <article
            key={item.id}
            className={`knowledge-row knowledge-status-${item.status}`}
          >
            <KnowledgeStatusIcon status={item.status} />
            <h3>{item.label}</h3>
            <p className="knowledge-status-text">{item.statusLabel}</p>
            <a href="#connaissances" className="knowledge-review-button">
              <span>{item.reviewLabel}</span>
              <span aria-hidden="true">→</span>
            </a>
          </article>
        )) : (
          <div className="knowledge-empty-state">
            <p>Les connaissances pour cette notion seront ajoutées ultérieurement.</p>
          </div>
        )}
      </KnowledgeScrollRegion>
      <p className="knowledge-note">
        <span aria-hidden="true">i</span>
        Les connaissances non travaillées n’ont pas encore été couvertes dans cette activité.
      </p>
    </section>
  );
}

function KnowledgeStatusIcon({ status }: { status: ProgressStatus }) {
  return (
    <span className="knowledge-status-icon" aria-hidden="true">
      {status === "mastered" ? "✓" : null}
      {status === "needs_work" ? "!" : null}
      {status === "consolidate" ? <span className="knowledge-status-dot" /> : null}
    </span>
  );
}

function SectionHeading({
  id,
  title,
  eyebrow,
}: {
  id: string;
  title: string;
  eyebrow?: string;
}) {
  return (
    <div className="section-heading">
      {eyebrow ? <p>{eyebrow}</p> : null}
      <h2 id={id}>{title}</h2>
      <span aria-hidden="true" />
    </div>
  );
}

function NotionSection({
  notions,
  selectedNotionId,
}: {
  notions: Notion[];
  selectedNotionId: string;
}) {
  return (
    <section className="notion-section" aria-labelledby="notions-title">
      <SectionHeading id="notions-title" title={DASHBOARD_LABELS.notions} />
      <div className="notion-carousel">
        {notions.map((notion, index) => (
          <Link
            key={notion.id}
            href={getNotionDashboardUrl(notion.id)}
            aria-current={notion.id === selectedNotionId ? "page" : undefined}
            aria-label={`${notion.title}, ${getHistoricalPeriodLabel(notion.historicalPeriod) ?? "période non précisée"}`}
            className={`notion-card notion-card-${(index % 3) + 1} ${notion.id === selectedNotionId ? "notion-card-selected" : ""}`}
          >
            <div className="notion-card-overlay" />
            <div className="notion-card-copy">
              <p>NOTION {String(index + 1).padStart(2, "0")}</p>
              <h3>{notion.title}</h3>
              <span className="notion-card-period">
                {getHistoricalPeriodLabel(notion.historicalPeriod)}
              </span>
              <span>{notion.description}</span>
              <span className="notion-card-action">
                {notion.id === selectedNotionId ? "Notion sélectionnée" : "Réviser cette notion"}
                <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function TeacherPracticesSection({
  practices,
  notions,
}: {
  practices: TeacherPractice[];
  notions: Notion[];
}) {
  return (
    <section className="teacher-practices" aria-labelledby="teacher-practices-title">
      <SectionHeading id="teacher-practices-title" title={DASHBOARD_LABELS.teacherPractices} />
      <div className="teacher-practice-list">
        {practices.length > 0 ? practices.map((practice) => {
          const notion = notions.find(({ id }) => id === practice.notionId);
          const periodLabel = getHistoricalPeriodLabel(
            practice.historicalPeriod ?? notion?.historicalPeriod,
          );
          const progressPercent = practice.progressPercent ?? 0;
          const content = (
            <>
              <Image
                src={practice.illustrationSrc}
                alt=""
                fill
                unoptimized
                className="teacher-practice-image"
                style={{ objectPosition: practice.illustrationPosition }}
              />
              <span className="teacher-practice-overlay" aria-hidden="true" />
              <span className="teacher-practice-banner">
                <span aria-hidden="true">★</span> Assignée par ton enseignant
              </span>
              <span className="teacher-practice-copy">
                <span className="teacher-practice-state">
                  {practice.state === "active" ? "Disponible" : practice.state}
                </span>
                <strong>{practice.title}</strong>
                {periodLabel ? <span className="teacher-practice-period">{periodLabel}</span> : null}
                {practice.progressPercent !== undefined ? (
                  <span className="teacher-practice-progress">Progression · {progressPercent}%</span>
                ) : null}
                <span className="teacher-practice-action">
                  {progressPercent > 0 ? "Poursuivre" : "Commencer"} <span aria-hidden="true">→</span>
                </span>
              </span>
            </>
          );

          return practice.state === "active" && practice.notionId ? (
            <Link
              key={practice.id}
              href={getLearningSessionUrl(practice.id, practice.notionId, "teacher-assigned")}
              className="teacher-practice-card"
              aria-label={`${practice.title}${periodLabel ? `, ${periodLabel}` : ""}, ${progressPercent > 0 ? "Poursuivre" : "Commencer"}`}
            >
              {content}
            </Link>
          ) : (
            <article key={practice.id} className="teacher-practice-card">
              {content}
            </article>
          );
        }) : <p>Aucune pratique disponible pour le moment.</p>}
      </div>
    </section>
  );
}

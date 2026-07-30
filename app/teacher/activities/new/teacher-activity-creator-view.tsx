"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  createLocalActivityPreview,
  getProgressionCopy,
  isActivityConfigurationComplete,
  validateActivityConfiguration,
  type ActivityConfiguration,
  type ActivityCreatorCatalog,
  type WorkType,
} from "@/lib/teacher-activity-creator";

const WORK_TYPES: { id: WorkType; label: string }[] = [
  { id: "revision", label: "Révision" },
  { id: "enrichment", label: "Enrichissement" },
  { id: "development", label: "Question à développement" },
];

const DURATION_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40];
const QUESTION_COUNT_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);

const INITIAL_CONFIGURATION = (catalog: ActivityCreatorCatalog): ActivityConfiguration => ({
  title: "Révision avant l’évaluation",
  durationMinutes: null,
  questionCount: null,
  selectedGroupIds: catalog.groups.map(({ id }) => id),
  workType: "revision",
  notionIds: [catalog.notions[0].id],
  operationId: null,
  questionValidated: false,
});

function Icon({ name }: { name: "groups" | "school" | "edit" | "format" | "target" | "eye" }) {
  const paths = {
    groups: <><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 20c.4-4 2.3-6 5.5-6s5.1 2 5.5 6M14 15c3.7-.8 6.7 1.2 7.3 5"/></>,
    school: <><path d="m3 9 9-5 9 5M5 10v9M9 10v9M15 10v9M19 10v9M3 20h18"/></>,
    edit: <><path d="m4 20 4.5-1 10-10-3.5-3.5-10 10L4 20Z"/><path d="m13.5 7 3.5 3.5"/></>,
    format: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></>,
    target: <><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="m15 9 5-5"/></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
  };
  return <svg className="creator-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">{paths[name]}</svg>;
}

function ConfigCard({ id, icon, title, children }: { id: string; icon: "format" | "groups" | "target"; title: string; children: React.ReactNode }) {
  return <section className="creator-card" aria-labelledby={id}><h2 id={id}><span><Icon name={icon}/></span>{title}</h2>{children}</section>;
}

function documentBody(document: ActivityCreatorCatalog["documents"][number]) {
  if (document.content.kind === "historical_image") return <Image src={document.content.localSrc} alt={document.content.alt} width={680} height={410} unoptimized />;
  if (document.content.kind === "population_table") return <table><thead><tr><th>Région</th><th>Population</th><th>Représentation</th></tr></thead><tbody>{document.content.rows.map((row) => <tr key={row.region}><td>{row.region}</td><td>{row.population}</td><td>{row.representatives}</td></tr>)}</tbody></table>;
  return <blockquote>{document.content.excerpt}</blockquote>;
}

export function TeacherActivityCreatorView({ catalog }: { catalog: ActivityCreatorCatalog }) {
  const [config, setConfig] = useState(() => INITIAL_CONFIGURATION(catalog));
  const [previewVariant, setPreviewVariant] = useState(0);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [demoMessage, setDemoMessage] = useState("");
  const [showPublishReview, setShowPublishReview] = useState(false);
  const preview = useMemo(() => createLocalActivityPreview(config, catalog, previewVariant), [config, catalog, previewVariant]);
  const progression = getProgressionCopy(config);
  const errors = validateActivityConfiguration(config);
  const complete = isActivityConfigurationComplete(config);
  const allGroupsSelected = config.selectedGroupIds.length === catalog.groups.length;
  const selectedNotions = catalog.notions.filter(({ id }) => config.notionIds.includes(id));
  const selectedGroups = catalog.groups.filter(({ id }) => config.selectedGroupIds.includes(id));
  const notionPeriods = Array.from(new Map(catalog.notions.map(({ periodId, periodLabel }) => [periodId, periodLabel]))).map(([id, label]) => ({
    id,
    label,
    notions: catalog.notions.filter(({ periodId }) => periodId === id),
  }));
  const notionSelectionSummary = selectedNotions.length === 0
    ? "Choisir une notion"
    : selectedNotions.length === 1
      ? selectedNotions[0].title
      : `${selectedNotions.length} notions sélectionnées`;
  const publishLabel = config.workType === "revision" ? "Publier l’activité de révision" : config.workType === "enrichment" ? "Publier l’activité d’enrichissement" : "Publier la question à développement";
  const workTypeLabel = WORK_TYPES.find(({ id }) => id === config.workType)?.label;
  const automaticQuestionCount = config.questionCount === null ? null : Math.max(0, config.questionCount - (config.questionValidated ? 1 : 0));

  function update(patch: Partial<ActivityConfiguration>) {
    setConfig((current) => ({ ...current, ...patch, questionValidated: patch.questionValidated ?? false }));
    setDemoMessage("");
  }

  function selectWorkType(workType: WorkType) {
    update({ workType, operationId: null, notionIds: config.notionIds.slice(0, workType === "development" ? 1 : undefined) });
  }

  function toggleGroup(groupId: string) {
    update({ selectedGroupIds: config.selectedGroupIds.includes(groupId) ? config.selectedGroupIds.filter((id) => id !== groupId) : [...config.selectedGroupIds, groupId] });
  }

  function toggleNotion(notionId: string) {
    if (config.workType === "development") return update({ notionIds: [notionId] });
    update({ notionIds: config.notionIds.includes(notionId) ? config.notionIds.filter((id) => id !== notionId) : [...config.notionIds, notionId] });
  }

  return <main className="activity-creator" data-theme={theme}>
    <aside className="creator-sidebar" aria-label="Navigation enseignante">
      <Link href="/teacher" className="creator-brand" aria-label="Accueil Socrato enseignant">
        <Image src="/logos/socrato-logo-blanc-recadre.png" alt="Logo Socrato" width={38} height={38} unoptimized />
        <strong>SOCRATO</strong><small>Espace enseignant</small>
      </Link>
      <nav aria-label="Navigation principale">
        <Link href="/teacher"><Icon name="school"/>Espace enseignant</Link>
        <Link className="creator-create-link" href="/teacher/activities/new" aria-current="page"><span className="creator-create-icon"><Icon name="edit"/></span><span>Créer une activité</span><span className="creator-create-arrow" aria-hidden="true">→</span></Link>
      </nav>
    </aside>

    <section className="creator-workspace">
      <header className="creator-header">
        <Link href="/teacher" className="creator-back">← Retour à l’espace enseignant</Link>
        <div className="creator-heading"><h1>Créer une activité</h1><p>Construire une pratique adaptée au groupe</p></div>
        <div className="creator-theme" role="group" aria-label="Choisir le thème"><button type="button" aria-label="Thème clair" title="Thème clair" aria-pressed={theme === "light"} onClick={() => setTheme("light")}>☀</button><button type="button" aria-label="Thème sombre" title="Thème sombre" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>☾</button></div>
      </header>

      <div className="creator-layout">
        <div className="creator-config" aria-label="Configuration de l’activité">
          <ConfigCard id="format-title" icon="format" title="Quel format ?">
            <label>Titre de l’activité<input value={config.title} onChange={(event) => update({ title: event.target.value })} aria-invalid={Boolean(errors.title)} /></label>
            <div className="format-grid">
              <label>Durée<select value={config.durationMinutes ?? ""} onChange={(event) => update({ durationMinutes: event.target.value ? Number(event.target.value) : null })}><option value="">Aucune durée</option>{DURATION_OPTIONS.map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}</select></label>
              <label>Nombre de questions<select value={config.questionCount ?? ""} onChange={(event) => update({ questionCount: event.target.value ? Number(event.target.value) : null })}><option value="">Aucun maximum</option>{QUESTION_COUNT_OPTIONS.map((count) => <option key={count} value={count}>{count} question{count > 1 ? "s" : ""}</option>)}</select></label>
            </div>
            <p className="dynamic-help" aria-live="polite"><strong>{progression.summary}</strong><span>{progression.help}</span></p>
            {errors.format && <p className="field-error" role="alert">{errors.format}</p>}
          </ConfigCard>

          <ConfigCard id="audience-title" icon="groups" title="À qui s’adresse l’activité ?">
            <fieldset><legend>Groupes fictifs</legend><button type="button" className="all-groups" aria-pressed={allGroupsSelected} onClick={() => update({ selectedGroupIds: allGroupsSelected ? [] : catalog.groups.map(({ id }) => id) })}>✓ Tous les groupes</button><div className="choice-chips">{catalog.groups.map((group) => <button key={group.id} type="button" aria-pressed={config.selectedGroupIds.includes(group.id)} onClick={() => toggleGroup(group.id)}>{config.selectedGroupIds.includes(group.id) ? "✓ " : "+ "}{group.name}</button>)}</div></fieldset>
            {errors.groups && <p className="field-error" role="alert">{errors.groups}</p>}
          </ConfigCard>

          <ConfigCard id="work-title" icon="target" title="Que voulez-vous travailler ?">
            <fieldset><legend>Type de travail</legend><div className="work-types">{WORK_TYPES.map((type) => <button key={type.id} type="button" aria-pressed={config.workType === type.id} onClick={() => selectWorkType(type.id)}>{type.label}</button>)}</div></fieldset>
            {config.workType === "development" && <p className="mode-help">Réponse développée d’environ 150 mots. Cette cible pédagogique est souple et ne bloque pas automatiquement la réponse.</p>}
            {config.workType === "enrichment" && <p className="mode-help">Approfondissement exigeant fondé uniquement sur les référentiels et documents approuvés.</p>}
            <fieldset><legend>Notions {config.workType === "development" && <em>Une seule</em>}</legend><details className="notion-picker"><summary>{notionSelectionSummary}<span aria-hidden="true">⌄</span></summary><div className="notion-picker-options">{notionPeriods.map((period) => <section className="notion-period" key={period.id} aria-labelledby={`period-${period.id}`}><h3 id={`period-${period.id}`}>{period.label}</h3>{period.notions.map((notion) => <label key={notion.id}><input type={config.workType === "development" ? "radio" : "checkbox"} name={config.workType === "development" ? "development-notion" : undefined} checked={config.notionIds.includes(notion.id)} onChange={() => toggleNotion(notion.id)} /><span>{notion.title}</span></label>)}</section>)}</div></details></fieldset>
            {errors.notions && <p className="field-error" role="alert">{errors.notions}</p>}
            {config.notionIds.length > 0 ? <><label className="progressive-field">Opération {config.workType === "development" && <em>Requis</em>}<select value={config.operationId ?? (config.workType === "development" ? "" : "random")} onChange={(event) => update({ operationId: event.target.value === "random" || event.target.value === "" ? null : event.target.value })}>{config.workType === "development" ? <option value="" disabled>Choisir une opération</option> : <option value="random">Aléatoire</option>}{catalog.operations.map((operation) => <option key={operation.id} value={operation.id}>{operation.label}</option>)}</select></label>{errors.operation && <p className="field-error" role="alert">{errors.operation}</p>}</> : <p className="progressive-hint">Choisissez d’abord une notion pour préciser l’opération intellectuelle.</p>}
          </ConfigCard>
        </div>

        <section className="live-preview" aria-labelledby="preview-title">
          <header><h2 id="preview-title"><Icon name="eye"/>Aperçu en direct</h2><span className={complete ? "complete" : "incomplete"}>{complete ? "✓ Configuration complète" : "Configuration à compléter"}</span><span className="question-nav">{progression.navigation}</span></header>
          <div className="preview-paper">
            <div className="preview-question"><div className="preview-section-heading"><span>Question proposée</span><span className={config.questionValidated ? "question-state validated" : "question-state draft"}>{config.questionValidated ? "✓ Gardée" : "Aperçu"}</span></div><span className="operation-pill">{preview.operationLabel}</span><p className="preview-notion">{preview.notionTitle}</p><h3>{preview.question}</h3><p>{preview.instruction}</p><div className="socrato-guidance"><Image src="/logos/socrato-logo-v2.png" width={52} height={52} alt="" aria-hidden="true" unoptimized/><div><strong>Accompagnement Socrato</strong>{preview.guidance.map((line) => <p key={line}>{line}</p>)}</div></div></div>
            <section className="preview-documents" aria-labelledby="documents-title"><h3 id="documents-title">Documents approuvés</h3>{preview.documents.length ? <div className="document-grid">{preview.documents.map((document, index) => <article key={document.id} className={index === 3 ? "featured-document" : ""}><small>Document {index + 1}</small><h4>{document.title}</h4>{documentBody(document)}<p>{document.sourceLabel}</p></article>)}</div> : <p className="no-documents">Aucun document historique approuvé n’est disponible pour cette notion. L’aperçu n’en invente aucun.</p>}</section>
          </div>
          <div className="preview-actions"><button type="button" className="regenerate-question" onClick={() => { setPreviewVariant((value) => value + 1); update({ questionValidated: false }); }}>↻ Changer</button><button type="button" className="keep-question" aria-pressed={config.questionValidated} onClick={() => update({ questionValidated: true })}>✓ {config.questionValidated ? "Question gardée" : "Garder cette question"}</button></div>
          <footer className={`creator-footer ${complete ? "is-ready" : "is-pending"}`}><button type="button" disabled aria-disabled="true" title="Fonction à venir">◉ Voir comme un élève <small>Fonction à venir</small></button><button type="button" className="publish-button" disabled={!complete} onClick={() => setShowPublishReview(true)}>Vérifier et publier →</button></footer>
        </section>
      </div>

      <div className="creator-announcer" aria-live="polite">{demoMessage || (!complete ? Object.values(errors)[0] : "Configuration prête pour une démonstration locale.")}</div>
    </section>
    {showPublishReview && <div className="publish-review-backdrop" role="presentation" onKeyDown={(event) => { if (event.key === "Escape") setShowPublishReview(false); }} onMouseDown={(event) => { if (event.target === event.currentTarget) setShowPublishReview(false); }}>
      <section className="publish-review" role="dialog" aria-modal="true" aria-labelledby="publish-review-title">
        <button type="button" className="publish-review-close" aria-label="Fermer le résumé" autoFocus onClick={() => setShowPublishReview(false)}>×</button>
        <header><span>Dernière vérification</span><h2 id="publish-review-title">Prêt à publier cette activité ?</h2><p>Vérifiez les principaux paramètres avant de confirmer.</p></header>
        <dl>
          <div><dt>Activité</dt><dd>{config.title}</dd></div>
          <div><dt>Type</dt><dd>{workTypeLabel}</dd></div>
          <div><dt>Groupes</dt><dd>{selectedGroups.map(({ name }) => name).join(", ")}</dd></div>
          <div><dt>Notions</dt><dd>{selectedNotions.map(({ title }) => title).join(", ")}</dd></div>
          <div><dt>Format</dt><dd>{progression.summary}</dd></div>
          <div><dt>Question aperçue</dt><dd>{config.questionValidated ? "Gardée dans l’activité" : "Non gardée"}</dd></div>
          <div className="automatic-questions"><dt>Génération automatique</dt><dd>{automaticQuestionCount === null ? "Les questions seront générées selon la durée choisie." : `${automaticQuestionCount} question${automaticQuestionCount > 1 ? "s" : ""} seront générée${automaticQuestionCount > 1 ? "s" : ""} automatiquement selon cette configuration.`}</dd></div>
        </dl>
        <footer><button type="button" className="review-back" onClick={() => setShowPublishReview(false)}>Retour aux réglages</button><button type="button" className="confirm-publish" onClick={() => { setShowPublishReview(false); setDemoMessage("Démonstration locale : aucune activité n’a été publiée."); }}>{publishLabel} →</button></footer>
      </section>
    </div>}
  </main>;
}

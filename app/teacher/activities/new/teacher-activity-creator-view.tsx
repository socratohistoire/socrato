"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createLocalActivityPreview,
  createSolSummaryPilotConfiguration,
  getActivityQuestionSelection,
  getActivityQuestionCategory,
  getEligibleActivityQuestions,
  getProgressionCopy,
  isActivityConfigurationComplete,
  validateActivityConfiguration,
  type ActivityConfiguration,
  type ActivityCreatorCatalog,
  type WorkType,
} from "@/lib/teacher-activity-creator";
import { downloadActivityWord } from "@/lib/teacher-activity-creator/word-export";
import { createLocalPublishedActivity } from "@/lib/local-published-activities";
import { createTeacherActivityDraft } from "@/lib/teacher-activity-drafts";
import { createConfiguredDataRepository } from "@/lib/data-repository";
import { publishActivityToSupabase } from "./actions";

const WORK_TYPES: { id: WorkType; label: string }[] = [
  { id: "revision", label: "Révision" },
  { id: "development", label: "Question à développement" },
];

const QUESTION_COUNT_OPTIONS = Array.from({ length: 20 }, (_, index) => index + 1);
const INITIAL_CONFIGURATION = (catalog: ActivityCreatorCatalog): ActivityConfiguration => ({
  title: "",
  durationMinutes: null,
  questionCount: 1,
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

function WordIcon() {
  return <svg className="word-icon" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect x="3" y="5" width="17" height="22" rx="2"/><path d="M20 9h7v18H11"/><path d="m7 11 2.2 10 2.7-7 2.7 7 2.4-10"/></svg>;
}

function ConfigCard({ id, icon, title, children }: { id: string; icon: "format" | "groups" | "target"; title: string; children: React.ReactNode }) {
  return <section className="creator-card" aria-labelledby={id}><h2 id={id}><span><Icon name={icon}/></span>{title}</h2>{children}</section>;
}

export function TeacherActivityCreatorView({ catalog }: { catalog: ActivityCreatorCatalog }) {
  const [config, setConfig] = useState(() => INITIAL_CONFIGURATION(catalog));
  const [previewVariant, setPreviewVariant] = useState(0);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [demoMessage, setDemoMessage] = useState("");
  const [showPublishReview, setShowPublishReview] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);
  const [publishingActivity, setPublishingActivity] = useState(false);
  const [previouslyAssignedQuestionIds, setPreviouslyAssignedQuestionIds] = useState<string[]>([]);
  const [questionOverrides, setQuestionOverrides] = useState<Record<number, string>>({});
  const [draftReady, setDraftReady] = useState(false);
  const [draftTouched, setDraftTouched] = useState(false);
  const notionPickerRef = useRef<HTMLDetailsElement>(null);
  const automaticActivityQuestions = useMemo(() => getActivityQuestionSelection(config, catalog, previouslyAssignedQuestionIds), [config, catalog, previouslyAssignedQuestionIds]);
  const eligibleQuestions = useMemo(() => getEligibleActivityQuestions(config, catalog), [config, catalog]);
  const activityQuestions = useMemo(() => automaticActivityQuestions.map((question, index) =>
    eligibleQuestions.find(({ id }) => id === questionOverrides[index]) ?? question), [automaticActivityQuestions, eligibleQuestions, questionOverrides]);
  const activityQuestionCount = activityQuestions.length;
  const currentActivityQuestionIndex = activityQuestionCount > 0 ? previewVariant % activityQuestionCount : 0;
  const currentActivityQuestion = activityQuestions[currentActivityQuestionIndex];
  const currentEligibleVariant = currentActivityQuestion ? Math.max(0, eligibleQuestions.findIndex(({ id }) => id === currentActivityQuestion.id)) : 0;
  const preview = useMemo(() => createLocalActivityPreview(config, catalog, currentEligibleVariant), [config, catalog, currentEligibleVariant]);
  const currentQuestionNumber = activityQuestionCount > 0 ? currentActivityQuestionIndex + 1 : 0;
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
  const fullPreviewQuestionIds = activityQuestions.map(({ id }) => id).join(",");
  const selectedNotionIds = config.notionIds.join(",");
  const previewBaseQuery = `notion=${encodeURIComponent(config.notionIds[0] ?? "acte-union")}&notions=${encodeURIComponent(selectedNotionIds)}&title=${encodeURIComponent(config.title)}&workType=${encodeURIComponent(config.workType)}&operation=${encodeURIComponent(config.operationId ?? "")}`;
  const singlePreviewHref = `/teacher/activities/new/student-preview?${previewBaseQuery}&questionIds=${encodeURIComponent(currentActivityQuestion?.id ?? "")}&questionNumber=${currentQuestionNumber}&embedded=1`;
  const fullPreviewHref = `/teacher/activities/new/student-preview?${previewBaseQuery}&questionIds=${encodeURIComponent(fullPreviewQuestionIds)}`;

  useEffect(() => {
    function closeNotionPickerOnOutsideClick(event: PointerEvent) {
      const picker = notionPickerRef.current;
      if (picker?.open && event.target instanceof Node && !picker.contains(event.target)) picker.removeAttribute("open");
    }
    document.addEventListener("pointerdown", closeNotionPickerOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeNotionPickerOnOutsideClick);
  }, []);

  useEffect(() => {
    let active = true;
    void createConfiguredDataRepository(window.localStorage).readActiveDraft(catalog).then((draft) => {
      if (!active || !draft) return;
      const availableGroupIds = new Set(catalog.groups.map(({ id }) => id));
      const selectedGroupIds = draft.configuration.selectedGroupIds.filter((id) => availableGroupIds.has(id));
      setConfig({
        ...draft.configuration,
        selectedGroupIds: selectedGroupIds.length > 0 ? selectedGroupIds : catalog.groups.map(({ id }) => id),
      });
      setQuestionOverrides(draft.questionOverrides); setPreviewVariant(draft.previewQuestionIndex); setDraftTouched(true);
    }).catch(() => { if (active) setDemoMessage("Le brouillon n’a pas pu être chargé."); }).finally(() => { if (active) setDraftReady(true); });
    return () => { active = false; };
  }, [catalog]);

  useEffect(() => {
    if (!draftReady || !draftTouched) return;
    void createConfiguredDataRepository(window.localStorage).saveDraft(createTeacherActivityDraft(config, questionOverrides, previewVariant)).catch(() => setDemoMessage("Le brouillon n’a pas pu être enregistré. Réessayez."));
  }, [config, draftReady, draftTouched, previewVariant, questionOverrides]);

  function update(patch: Partial<ActivityConfiguration>) {
    setDraftTouched(true);
    setConfig((current) => ({ ...current, ...patch, questionValidated: patch.questionValidated ?? false }));
    if (patch.questionValidated === undefined) {
      setQuestionOverrides({});
      setPreviewVariant(0);
    }
    setDemoMessage("");
  }

  function selectWorkType(workType: WorkType) {
    update({ workType, operationId: null });
  }

  function prepareSolSummaryPilot() {
    setDraftTouched(true);
    setConfig(createSolSummaryPilotConfiguration(catalog, config.selectedGroupIds));
    setQuestionOverrides({});
    setPreviewVariant(0);
    setDemoMessage("L’activité pilote est prête : 10 questions variées sur l’Acte d’Union.");
  }

  function toggleGroup(groupId: string) {
    update({ selectedGroupIds: config.selectedGroupIds.includes(groupId) ? config.selectedGroupIds.filter((id) => id !== groupId) : [...config.selectedGroupIds, groupId] });
  }

  function toggleNotion(notionId: string) {
    update({ notionIds: config.notionIds.includes(notionId) ? config.notionIds.filter((id) => id !== notionId) : [...config.notionIds, notionId] });
  }

  function moveToQuestion(direction: -1 | 1) {
    if (activityQuestionCount === 0) return;
    setPreviewVariant((current) => Math.max(0, Math.min(activityQuestionCount - 1, current + direction)));
    setDraftTouched(true);
    setDemoMessage("");
  }

  function changeCurrentQuestion() {
    if (!currentActivityQuestion || eligibleQuestions.length < 2) return;
    const otherQuestions = activityQuestions.filter((_, index) => index !== currentActivityQuestionIndex);
    const usedQuestionIds = new Set(otherQuestions.map(({ id }) => id));
    const usedDocumentIds = new Set(otherQuestions.flatMap(({ historicalDocumentIds }) => historicalDocumentIds));
    const currentEligibleIndex = eligibleQuestions.findIndex(({ id }) => id === currentActivityQuestion.id);
    const orderedCandidates = [...eligibleQuestions.slice(currentEligibleIndex + 1), ...eligibleQuestions.slice(0, currentEligibleIndex + 1)]
      .filter(({ id }) => id !== currentActivityQuestion.id && !usedQuestionIds.has(id));
    const sameCategory = (candidate: (typeof eligibleQuestions)[number]) => getActivityQuestionCategory(candidate.format) === getActivityQuestionCategory(currentActivityQuestion.format);
    const avoidsRepeatedDocuments = (candidate: (typeof eligibleQuestions)[number]) => candidate.historicalDocumentIds.every((id) => !usedDocumentIds.has(id));
    const replacement = orderedCandidates.find((candidate) => sameCategory(candidate) && avoidsRepeatedDocuments(candidate))
      ?? orderedCandidates.find(avoidsRepeatedDocuments)
      ?? orderedCandidates.find(sameCategory)
      ?? orderedCandidates[0];
    if (!replacement) return;
    setDraftTouched(true);
    setQuestionOverrides((current) => ({ ...current, [currentActivityQuestionIndex]: replacement.id }));
    setConfig((current) => ({ ...current, questionValidated: true }));
    setDemoMessage(`Question ${currentActivityQuestionIndex + 1} remplacée. La séquence contient toujours ${activityQuestionCount} question${activityQuestionCount > 1 ? "s" : ""}.`);
  }

  async function downloadWord() {
    setDownloadingWord(true);
    try {
      await downloadActivityWord(config, catalog, preview);
      setDemoMessage("Le fichier Word de l’activité a été téléchargé.");
    } finally {
      setDownloadingWord(false);
    }
  }

  async function confirmLocalPublication() {
    const nextHistory = Array.from(new Set([...previouslyAssignedQuestionIds, ...activityQuestions.map(({ id }) => id)]));
    setPreviouslyAssignedQuestionIds(nextHistory);
    const publishedActivity = createLocalPublishedActivity({
      title: config.title,
      workType: config.workType,
      targetedGroupIds: [...config.selectedGroupIds],
      notionIds: [...config.notionIds],
      operationId: config.operationId,
      questionIds: activityQuestions.map(({ id }) => id),
    });
    setPublishingActivity(true);
    try {
      await publishActivityToSupabase(publishedActivity);
      const repository = createConfiguredDataRepository(window.localStorage);
      await repository.savePublishedActivity(publishedActivity);
      await repository.clearActiveDraft();
      setShowPublishReview(false);
      window.location.assign(`/teacher?activity=${encodeURIComponent(publishedActivity.id)}`);
    } catch {
      setShowPublishReview(false);
      setDemoMessage("L’activité n’a pas pu être publiée dans Supabase. Aucun enregistrement local n’a été créé.");
    } finally {
      setPublishingActivity(false);
    }
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
        {!draftReady ? <p className="creator-draft-loading" role="status">Chargement du brouillon…</p> : null}
        <section className="sol-pilot" aria-labelledby="sol-pilot-title">
          <div><strong id="sol-pilot-title">Tester le bilan personnalisé de Sol</strong><span>Prépare une activité complète de 10 questions variées sur l’Acte d’Union.</span></div>
          <button type="button" onClick={prepareSolSummaryPilot}>Préparer l’activité pilote</button>
        </section>
        <div className="creator-config" aria-label="Configuration de l’activité">
          <ConfigCard id="format-title" icon="format" title="Quel format ?">
            <label className="format-section">Titre de l’activité<input value={config.title} placeholder="Inscrivez le titre de l’activité" onChange={(event) => update({ title: event.target.value })} aria-invalid={Boolean(errors.title)} /></label>
            <label className="format-section">Nombre de questions<select value={config.questionCount ?? 1} onChange={(event) => update({ questionCount: Number(event.target.value) })}>{QUESTION_COUNT_OPTIONS.map((count) => <option key={count} value={count}>{count} question{count > 1 ? "s" : ""}</option>)}</select></label>
            <fieldset className="format-section"><legend>Type de travail</legend><div className="work-types">{WORK_TYPES.map((type) => <button key={type.id} type="button" aria-pressed={config.workType === type.id} onClick={() => selectWorkType(type.id)}>{type.label}</button>)}</div></fieldset>
            {config.workType === "development" && <p className="mode-help">Réponse développée d’environ 150 mots. Cette cible pédagogique est souple et ne bloque pas automatiquement la réponse.</p>}
            {errors.format && <p className="field-error" role="alert">{errors.format}</p>}
          </ConfigCard>

          <ConfigCard id="work-title" icon="target" title="Quelle notion et opération voulez-vous travailler ?">
            <fieldset><legend>Notions</legend><details ref={notionPickerRef} className="notion-picker"><summary>{notionSelectionSummary}<span aria-hidden="true">⌄</span></summary><div className="notion-picker-options">{notionPeriods.map((period) => <section className="notion-period" key={period.id} aria-labelledby={`period-${period.id}`}><h3 id={`period-${period.id}`}>{period.label}</h3>{period.notions.map((notion) => <label key={notion.id}><input type="checkbox" checked={config.notionIds.includes(notion.id)} onChange={() => toggleNotion(notion.id)} /><span>{notion.title}</span></label>)}</section>)}</div></details></fieldset>
            {errors.notions && <p className="field-error" role="alert">{errors.notions}</p>}
            {config.notionIds.length > 0 ? <><label className="progressive-field">Opération<select value={config.operationId ?? "random"} onChange={(event) => update({ operationId: event.target.value === "random" ? null : event.target.value })}><option value="random">Aléatoire</option>{catalog.operations.map((operation) => <option key={operation.id} value={operation.id}>{operation.label}</option>)}</select></label>{errors.operation && <p className="field-error" role="alert">{errors.operation}</p>}</> : <p className="progressive-hint">Choisissez d’abord une notion pour préciser l’opération intellectuelle.</p>}
          </ConfigCard>

          <ConfigCard id="audience-title" icon="groups" title="À qui s’adresse l’activité ?">
            <fieldset><legend>Groupes fictifs</legend><button type="button" className="all-groups" aria-pressed={allGroupsSelected} onClick={() => update({ selectedGroupIds: allGroupsSelected ? [] : catalog.groups.map(({ id }) => id) })}>✓ Tous les groupes</button><div className="choice-chips">{catalog.groups.map((group) => <button key={group.id} type="button" aria-pressed={config.selectedGroupIds.includes(group.id)} onClick={() => toggleGroup(group.id)}>{config.selectedGroupIds.includes(group.id) ? "✓ " : "+ "}{group.name}</button>)}</div></fieldset>
            {errors.groups && <p className="field-error" role="alert">{errors.groups}</p>}
          </ConfigCard>
        </div>

        <section className="live-preview" aria-labelledby="preview-title">
          <header><h2 id="preview-title"><Icon name="eye"/>Aperçu en direct</h2><span className={complete ? "complete" : "incomplete"}>{complete ? "✓ Configuration complète" : "Configuration à compléter"}</span><span className="question-nav">{activityQuestionCount > 0 ? `${currentQuestionNumber} sur ${activityQuestionCount}` : "Aucune question disponible"}</span></header>
          <section className="student-page-preview" aria-label="Aperçu identique à la séance d’apprentissage de l’élève">
            {currentActivityQuestion ? <iframe key={`${currentActivityQuestion.id}-${config.workType}-${config.operationId ?? "random"}`} src={singlePreviewHref} title={`Aperçu élève de la question ${currentQuestionNumber}`} /> : <p className="student-page-preview__empty">Aucune question disponible pour cette sélection.</p>}
          </section>
          <footer className={`creator-footer ${complete ? "is-ready" : "is-pending"}`}>
            <button type="button" className="word-download" aria-label={downloadingWord ? "Création du fichier Word" : "Télécharger le fichier Word"} title={downloadingWord ? "Création du fichier Word…" : "Télécharger le fichier Word"} disabled={!complete || downloadingWord} onClick={downloadWord}><WordIcon/><span className="sr-only">{downloadingWord ? "Création du fichier Word…" : "Télécharger le fichier Word"}</span></button>
            <Link className="student-view-link" aria-disabled={activityQuestions.length === 0} href={activityQuestions.length > 0 ? fullPreviewHref : "#"} target="_blank">▶ Tester l’activité complète comme un élève</Link>
            <button type="button" className="sequence-question-button" disabled={currentActivityQuestionIndex === 0} onClick={() => moveToQuestion(-1)}>← Question précédente</button>
            <button type="button" className="change-question" onClick={changeCurrentQuestion}>Changer</button>
            <button type="button" className="sequence-question-button" disabled={currentActivityQuestionIndex >= activityQuestionCount - 1} onClick={() => moveToQuestion(1)}>Question suivante →</button>
            <button type="button" className="publish-button" onClick={() => setShowPublishReview(true)}>Publier →</button>
          </footer>
        </section>
      </div>

      <div className="creator-announcer" aria-live="polite">{demoMessage || (!complete ? Object.values(errors)[0] : "Configuration prête pour une démonstration locale.")}</div>
    </section>
    {showPublishReview && <div className="publish-review-backdrop" role="presentation" onKeyDown={(event) => { if (event.key === "Escape") setShowPublishReview(false); }} onMouseDown={(event) => { if (event.target === event.currentTarget) setShowPublishReview(false); }}>
      <section className="publish-review" role="dialog" aria-modal="true" aria-labelledby="publish-review-title">
        <button type="button" className="publish-review-close" aria-label="Fermer le résumé" autoFocus onClick={() => setShowPublishReview(false)}>×</button>
        <header><span>Confirmation</span><h2 id="publish-review-title">Publier cette activité ?</h2><p>Les paramètres ci-dessous seront utilisés pour créer et assigner l’activité.</p></header>
        <dl>
          <div><dt>Activité</dt><dd>{config.title}</dd></div>
          <div><dt>Type</dt><dd>{workTypeLabel}</dd></div>
          <div><dt>Groupes</dt><dd>{selectedGroups.map(({ name }) => name).join(", ")}</dd></div>
          <div><dt>Notions</dt><dd>{selectedNotions.map(({ title }) => title).join(", ")}</dd></div>
          <div><dt>Format</dt><dd>{progression.summary}</dd></div>
          <div><dt>Séquence à publier</dt><dd>{activityQuestionCount} question{activityQuestionCount > 1 ? "s" : ""}</dd></div>
          <div className="automatic-questions"><dt>Composition</dt><dd>Les questions et les opérations laissées en mode aléatoire seront attribuées automatiquement au moment de la publication. Les remplacements faits avec « Changer » seront conservés.</dd></div>
        </dl>
        <footer><button type="button" className="review-back" disabled={publishingActivity} onClick={() => setShowPublishReview(false)}>Retour aux réglages</button><button type="button" className="word-download" aria-label={downloadingWord ? "Création du fichier Word" : "Télécharger le fichier Word"} title={downloadingWord ? "Création du fichier Word…" : "Télécharger le fichier Word"} disabled={downloadingWord || publishingActivity} onClick={downloadWord}><WordIcon/><span className="sr-only">{downloadingWord ? "Création du fichier Word…" : "Télécharger le fichier Word"}</span></button><button type="button" className="confirm-publish" disabled={publishingActivity} onClick={confirmLocalPublication}>{publishingActivity ? "Publication…" : `${publishLabel} →`}</button></footer>
      </section>
    </div>}
  </main>;
}

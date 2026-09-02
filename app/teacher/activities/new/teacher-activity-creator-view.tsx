"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  createLocalActivityPreview,
  getActivityQuestionSelection,
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
import { CAUSES_CONSEQUENCES_LEARNING_QUESTION_ID } from "@/lib/teacher-activity-creator/intellectual-operation-learning";

const WORK_TYPES: { id: WorkType; label: string }[] = [
  { id: "revision", label: "Révision" },
  { id: "development", label: "Question à développement" },
];

const QUESTION_COUNT_OPTIONS = Array.from({ length: 24 }, (_, index) => index + 1);
const QUESTION_LIST_CATEGORIES = [
  { id: "multiple-choice", label: "Choix multiples" },
  { id: "short-answer", label: "Réponses courtes" },
  { id: "document-interpretation", label: "Interprétation de documents" },
  { id: "development-150", label: "Questions à développement" },
] as const;
type QuestionListCategoryId = (typeof QUESTION_LIST_CATEGORIES)[number]["id"];

function getQuestionListCategory(format: ActivityCreatorCatalog["questions"][number]["format"]): QuestionListCategoryId {
  if (format === "multiple-choice") return "multiple-choice";
  if (format === "short-answer") return "short-answer";
  if (format === "development-150") return "development-150";
  return "document-interpretation";
}

function questionSelectionOverrides(questionIds: readonly string[]) {
  return Object.fromEntries(questionIds.map((id, index) => [index, id]));
}
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

type EditingActivity = { id: string; title: string; workType: WorkType; notionIds: string[]; operationId: string | null; questionIds: string[]; targetedGroupIds: string[]; publishedAt: string };
type ConsolidationTarget = { studentId: string; groupId: string; displayLabel: string; operationId: string | null; knowledgeId: string | null; preferredQuestionIds: string[] };

export function TeacherActivityCreatorView({ catalog, editingActivity = null, consolidationTarget = null, classroomMode = false, initialUnderstandingOperationId = null, initialTargetGroupIds = null }: { catalog: ActivityCreatorCatalog; editingActivity?: EditingActivity | null; consolidationTarget?: ConsolidationTarget | null; classroomMode?: boolean; initialUnderstandingOperationId?: string | null; initialTargetGroupIds?: string[] | null }) {
  const [config, setConfig] = useState(() => editingActivity
    ? { ...INITIAL_CONFIGURATION(catalog), title: editingActivity.title, questionCount: editingActivity.questionIds.length, selectedGroupIds: editingActivity.targetedGroupIds, workType: editingActivity.workType, notionIds: editingActivity.notionIds, operationId: editingActivity.operationId, questionValidated: true }
    : initialUnderstandingOperationId === "causes_and_consequences"
      ? { ...INITIAL_CONFIGURATION(catalog), title: "Comprendre les causes et les conséquences", questionCount: 1, selectedGroupIds: consolidationTarget ? [consolidationTarget.groupId] : initialTargetGroupIds?.length ? initialTargetGroupIds : catalog.groups.map(({ id }) => id), notionIds: ["acte-union"], operationId: "causes_and_consequences", questionValidated: true }
    : consolidationTarget
      ? { ...INITIAL_CONFIGURATION(catalog), title: "Consolidation personnalisée", questionCount: 3, selectedGroupIds: [consolidationTarget.groupId], workType: "revision" as const, notionIds: ["acte-union"], operationId: consolidationTarget.operationId, questionValidated: true }
      : classroomMode
        ? { ...INITIAL_CONFIGURATION(catalog), title: "Activité en classe", questionValidated: true }
        : INITIAL_CONFIGURATION(catalog));
  const [previewVariant, setPreviewVariant] = useState(0);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [demoMessage, setDemoMessage] = useState("");
  const [showPublishReview, setShowPublishReview] = useState(false);
  const [downloadingWord, setDownloadingWord] = useState(false);
  const [publishingActivity, setPublishingActivity] = useState(false);
  const [previouslyAssignedQuestionIds, setPreviouslyAssignedQuestionIds] = useState<string[]>([]);
  const [selectionSeed, setSelectionSeed] = useState(() => Math.floor(Math.random() * 2_147_483_647));
  const [manualQuestionSelection, setManualQuestionSelection] = useState(Boolean(editingActivity || consolidationTarget || initialUnderstandingOperationId));
  const [questionOverrides, setQuestionOverrides] = useState<Record<number, string>>(() => {
    if (editingActivity) return Object.fromEntries(editingActivity.questionIds.map((id, index) => [index, id]));
    if (initialUnderstandingOperationId === "causes_and_consequences") return { 0: CAUSES_CONSEQUENCES_LEARNING_QUESTION_ID };
    if (!consolidationTarget) return initialUnderstandingOperationId === "causes_and_consequences" ? { 0: CAUSES_CONSEQUENCES_LEARNING_QUESTION_ID } : {};
    const preferredIds = new Set(consolidationTarget.preferredQuestionIds);
    const exactQuestions = catalog.questions.filter((question) => preferredIds.has(question.id));
    return Object.fromEntries(exactQuestions.slice(0, 3).map(({ id }, index) => [index, id]));
  });
  const [draftReady, setDraftReady] = useState(false);
  const [draftTouched, setDraftTouched] = useState(false);
  const notionPickerRef = useRef<HTMLDetailsElement>(null);
  const automaticActivityQuestions = useMemo(() => getActivityQuestionSelection(config, catalog, previouslyAssignedQuestionIds, selectionSeed), [config, catalog, previouslyAssignedQuestionIds, selectionSeed]);
  const eligibleQuestions = useMemo(() => getEligibleActivityQuestions(config, catalog), [config, catalog]);
  const activityQuestions = useMemo(() => {
    if (!manualQuestionSelection) return automaticActivityQuestions;
    const eligibleById = new Map(eligibleQuestions.map((question) => [question.id, question]));
    return Object.entries(questionOverrides)
      .sort(([left], [right]) => Number(left) - Number(right))
      .flatMap(([, id]) => eligibleById.get(id) ? [eligibleById.get(id)!] : []);
  }, [automaticActivityQuestions, eligibleQuestions, manualQuestionSelection, questionOverrides]);
  const activityQuestionCount = activityQuestions.length;
  const currentActivityQuestionIndex = activityQuestionCount > 0 ? previewVariant % activityQuestionCount : 0;
  const currentActivityQuestion = activityQuestions[currentActivityQuestionIndex];
  const selectedQuestionIds = new Set(activityQuestions.map(({ id }) => id));
  const targetQuestionCount = Math.min(config.questionCount ?? eligibleQuestions.length, eligibleQuestions.length);
  const selectionComplete = activityQuestionCount === targetQuestionCount;
  const questionGroups = QUESTION_LIST_CATEGORIES.map((category) => ({
    ...category,
    questions: eligibleQuestions.filter(({ format }) => getQuestionListCategory(format) === category.id),
  }));
  const availableReplacementQuestions = currentActivityQuestion
    ? eligibleQuestions.filter(({ id }) => id === currentActivityQuestion.id || !selectedQuestionIds.has(id))
    : [];
  const currentEligibleVariant = currentActivityQuestion ? Math.max(0, eligibleQuestions.findIndex(({ id }) => id === currentActivityQuestion.id)) : 0;
  const preview = useMemo(() => createLocalActivityPreview(config, catalog, currentEligibleVariant), [config, catalog, currentEligibleVariant]);
  const currentQuestionNumber = activityQuestionCount > 0 ? currentActivityQuestionIndex + 1 : 0;
  const progression = getProgressionCopy(config);
  const errors = validateActivityConfiguration(config);
  const complete = isActivityConfigurationComplete(config);
  const readyToPublish = complete && selectionComplete;
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
  const publishLabel = consolidationTarget ? "Assigner l’activité à l’élève" : config.workType === "revision" ? "Publier l’activité de révision" : config.workType === "enrichment" ? "Publier l’activité d’enrichissement" : "Publier la question à développement";
  const workTypeLabel = WORK_TYPES.find(({ id }) => id === config.workType)?.label;
  const fullPreviewQuestionIds = activityQuestions.map(({ id }) => id).join(",");
  const selectedNotionIds = config.notionIds.join(",");
  const previewBaseQuery = `notion=${encodeURIComponent(config.notionIds[0] ?? "acte-union")}&notions=${encodeURIComponent(selectedNotionIds)}&title=${encodeURIComponent(config.title)}&workType=${encodeURIComponent(config.workType)}&operation=${encodeURIComponent(config.operationId ?? "")}`;
  const singlePreviewHref = `/teacher/activities/new/student-preview?${previewBaseQuery}&questionIds=${encodeURIComponent(currentActivityQuestion?.id ?? "")}&questionNumber=${currentQuestionNumber}&embedded=1`;
  const fullPreviewHref = `/teacher/activities/new/student-preview?${previewBaseQuery}&questionIds=${encodeURIComponent(fullPreviewQuestionIds)}${classroomMode ? "&classroom=1" : ""}`;

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
    if (editingActivity || consolidationTarget || classroomMode || initialUnderstandingOperationId) { setDraftReady(true); setDraftTouched(true); return; }
    void createConfiguredDataRepository(window.localStorage).readActiveDraft(catalog).then((draft) => {
      if (!active || !draft) return;
      const availableGroupIds = new Set(catalog.groups.map(({ id }) => id));
      const selectedGroupIds = draft.configuration.selectedGroupIds.filter((id) => availableGroupIds.has(id));
      setConfig({
        ...draft.configuration,
        selectedGroupIds: selectedGroupIds.length > 0 ? selectedGroupIds : catalog.groups.map(({ id }) => id),
      });
      setQuestionOverrides(draft.questionOverrides);
      setManualQuestionSelection(Object.keys(draft.questionOverrides).length > 0);
      setPreviewVariant(draft.previewQuestionIndex);
      setDraftTouched(true);
    }).catch(() => { if (active) setDemoMessage("Le brouillon n’a pas pu être chargé."); }).finally(() => { if (active) setDraftReady(true); });
    return () => { active = false; };
  }, [catalog, classroomMode, consolidationTarget, editingActivity, initialUnderstandingOperationId]);

  useEffect(() => {
    if (!draftReady || !draftTouched || consolidationTarget || classroomMode) return;
    void createConfiguredDataRepository(window.localStorage).saveDraft(createTeacherActivityDraft(config, questionOverrides, previewVariant)).catch(() => setDemoMessage("Le brouillon n’a pas pu être enregistré. Réessayez."));
  }, [classroomMode, config, consolidationTarget, draftReady, draftTouched, previewVariant, questionOverrides]);

  function update(patch: Partial<ActivityConfiguration>) {
    setDraftTouched(true);
    setConfig((current) => ({ ...current, ...patch, questionValidated: patch.questionValidated ?? false }));
    const changesQuestionPool = patch.questionCount !== undefined
      || patch.workType !== undefined
      || patch.notionIds !== undefined
      || patch.operationId !== undefined;
    if (changesQuestionPool) {
      setQuestionOverrides({});
      setManualQuestionSelection(false);
      setSelectionSeed(Math.floor(Math.random() * 2_147_483_647));
      setPreviewVariant(0);
    }
    setDemoMessage("");
  }

  function selectWorkType(workType: WorkType) {
    update({ workType, operationId: null });
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
    if (!currentActivityQuestion || availableReplacementQuestions.length < 2) return;
    const currentEligibleIndex = eligibleQuestions.findIndex(({ id }) => id === currentActivityQuestion.id);
    const orderedCandidates = [...eligibleQuestions.slice(currentEligibleIndex + 1), ...eligibleQuestions.slice(0, currentEligibleIndex + 1)]
      .filter(({ id }) => id !== currentActivityQuestion.id && !selectedQuestionIds.has(id));
    const replacement = orderedCandidates[0];
    if (!replacement) return;
    setDraftTouched(true);
    const replacementIds = activityQuestions.map(({ id }) => id);
    replacementIds[currentActivityQuestionIndex] = replacement.id;
    setQuestionOverrides(questionSelectionOverrides(replacementIds));
    setManualQuestionSelection(true);
    setConfig((current) => ({ ...current, questionValidated: true }));
    setDemoMessage(`Question ${currentActivityQuestionIndex + 1} remplacée. La séquence contient toujours ${activityQuestionCount} question${activityQuestionCount > 1 ? "s" : ""}.`);
  }

  function toggleActivityQuestion(questionId: string) {
    const currentIds = activityQuestions.map(({ id }) => id);
    if (selectedQuestionIds.has(questionId)) {
      const nextIds = currentIds.filter((id) => id !== questionId);
      setQuestionOverrides(questionSelectionOverrides(nextIds));
      setManualQuestionSelection(true);
      setPreviewVariant((current) => Math.max(0, Math.min(current, nextIds.length - 1)));
      setConfig((current) => ({ ...current, questionValidated: false }));
      setDraftTouched(true);
      setDemoMessage(`Question retirée. ${nextIds.length} question${nextIds.length > 1 ? "s" : ""} sélectionnée${nextIds.length > 1 ? "s" : ""} sur ${targetQuestionCount}.`);
      return;
    }
    if (currentIds.length >= targetQuestionCount) {
      setDemoMessage(`La sélection contient déjà ${targetQuestionCount} question${targetQuestionCount > 1 ? "s" : ""}. Retirez-en une avant d’en ajouter une autre.`);
      return;
    }
    const nextIds = [...currentIds, questionId];
    setQuestionOverrides(questionSelectionOverrides(nextIds));
    setManualQuestionSelection(true);
    setPreviewVariant(nextIds.length - 1);
    setConfig((current) => ({ ...current, questionValidated: nextIds.length === targetQuestionCount }));
    setDraftTouched(true);
    setDemoMessage(`Question ajoutée. ${nextIds.length} question${nextIds.length > 1 ? "s" : ""} sélectionnée${nextIds.length > 1 ? "s" : ""} sur ${targetQuestionCount}.`);
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
    const newlyCreatedActivity = createLocalPublishedActivity({
      title: config.title,
      workType: config.workType,
      targetedGroupIds: [...config.selectedGroupIds],
      notionIds: [...config.notionIds],
      operationId: config.operationId,
      questionIds: activityQuestions.map(({ id }) => id),
    });
    const publishedActivity = editingActivity ? { ...newlyCreatedActivity, id: editingActivity.id, publishedAt: editingActivity.publishedAt } : newlyCreatedActivity;
    setPublishingActivity(true);
    try {
      await publishActivityToSupabase(publishedActivity, consolidationTarget ? { groupId: consolidationTarget.groupId, studentId: consolidationTarget.studentId } : undefined);
      const repository = createConfiguredDataRepository(window.localStorage);
      if (!consolidationTarget) await repository.savePublishedActivity(publishedActivity);
      await repository.clearActiveDraft();
      setShowPublishReview(false);
      window.location.assign(consolidationTarget
        ? `/teacher/groups/${encodeURIComponent(consolidationTarget.groupId)}/students/${encodeURIComponent(consolidationTarget.studentId)}?consolidation=assigned`
        : `/teacher?activity=${encodeURIComponent(publishedActivity.id)}`);
    } catch {
      setShowPublishReview(false);
      setDemoMessage("L’activité n’a pas pu être publiée dans Supabase. Aucun enregistrement local n’a été créé.");
    } finally {
      setPublishingActivity(false);
    }
  }

  return <main className="activity-creator" data-theme={theme}>
    <aside className="creator-sidebar" aria-label="Navigation enseignante">
      <Link href="/teacher" className="creator-brand" aria-label="Retour à l’espace enseignant">
        <Image src="/logos/socrato-logo-blanc-recadre.png" alt="Logo Socrato" width={38} height={38} unoptimized />
        <strong>SOCRATO</strong><small>Espace enseignant</small>
      </Link>
      <nav aria-label="Navigation principale">
        <Link href="/teacher"><Icon name="school"/>Espace enseignant</Link>
        <Link href="/teacher/activities/intellectual-operations"><Icon name="target"/>Comprendre les opérations</Link>
        <Link className="creator-create-link" href={classroomMode ? "/teacher/activities/new?mode=classroom" : "/teacher/activities/new"} aria-current="page"><span className="creator-create-icon"><Icon name="edit"/></span><span>{classroomMode ? "Mode classe" : "Créer une activité"}</span><span className="creator-create-arrow" aria-hidden="true">→</span></Link>
      </nav>
    </aside>

    <section className="creator-workspace">
      <header className="creator-header">
        <Link href="/teacher" className="creator-back">← Retour à l’espace enseignant</Link>
        <div className="creator-heading"><h1>{classroomMode ? "Mode classe" : "Créer une activité"}</h1><p>{classroomMode ? "Préparer une activité à animer avec tout le groupe" : "Construire une pratique adaptée au groupe"}</p></div>
        <div className="creator-theme" role="group" aria-label="Choisir le thème"><button type="button" aria-label="Thème clair" title="Thème clair" aria-pressed={theme === "light"} onClick={() => setTheme("light")}>☀</button><button type="button" aria-label="Thème sombre" title="Thème sombre" aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>☾</button></div>
      </header>

      <div className="creator-layout">
        {!draftReady ? <p className="creator-draft-loading" role="status">Chargement du brouillon…</p> : null}
        {classroomMode ? <section className="classroom-mode-banner" aria-label="Mode classe sans assignation"><strong>Activité animée en classe — non assignée</strong><span>Cette activité sera projetée devant le groupe et n’apparaîtra pas dans le tableau de bord des élèves.</span></section> : consolidationTarget ? <section className="personalized-assignment-banner" aria-label="Activité individuelle"><strong>{initialUnderstandingOperationId ? "Guidage individuel" : "Activité de consolidation"} pour {consolidationTarget.displayLabel}</strong><span>{initialUnderstandingOperationId ? "Vérifiez le guidage avant de l’assigner uniquement à cet élève." : "Vérifiez et modifiez les questions avant de l’assigner uniquement à cet élève."}</span></section> : null}
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

          {classroomMode ? <ConfigCard id="audience-title" icon="groups" title="À qui s’adresse l’activité ?"><p className="personalized-student-target"><strong>Tout le groupe présent en classe</strong><span>Aucune assignation aux comptes élèves</span></p></ConfigCard> : consolidationTarget ? <ConfigCard id="audience-title" icon="groups" title="À qui s’adresse l’activité ?"><p className="personalized-student-target"><strong>{consolidationTarget.displayLabel}</strong><span>Assignation individuelle</span></p></ConfigCard> : <ConfigCard id="audience-title" icon="groups" title="À qui s’adresse l’activité ?">
            <fieldset><legend>Groupes fictifs</legend><button type="button" className="all-groups" aria-pressed={allGroupsSelected} onClick={() => update({ selectedGroupIds: allGroupsSelected ? [] : catalog.groups.map(({ id }) => id) })}>✓ Tous les groupes</button><div className="choice-chips">{catalog.groups.map((group) => <button key={group.id} type="button" aria-pressed={config.selectedGroupIds.includes(group.id)} onClick={() => toggleGroup(group.id)}>{config.selectedGroupIds.includes(group.id) ? "✓ " : "+ "}{group.name}</button>)}</div></fieldset>
            {errors.groups && <p className="field-error" role="alert">{errors.groups}</p>}
          </ConfigCard>}
        </div>

        <div className="creator-question-workbench">
          <aside className="question-list-card" aria-labelledby="question-list-title">
            <header><div><span>Banque active</span><h2 id="question-list-title">Liste de questions</h2></div><strong>{activityQuestionCount}/{targetQuestionCount}</strong></header>
            <p className="question-list-help">Les questions colorées composent l’activité. Cliquez pour les retirer ou les ajouter.</p>
            <div className="question-list-scroll">
              {questionGroups.map((group) => <section className="question-list-group" key={group.id} aria-labelledby={`question-group-${group.id}`}>
                <header><h3 id={`question-group-${group.id}`}>{group.label}</h3><span>{group.questions.length}</span></header>
                {group.questions.length > 0 ? <div>{group.questions.map((question) => {
                  const selectedIndex = activityQuestions.findIndex(({ id }) => id === question.id);
                  const isSelected = selectedIndex >= 0;
                  return <button key={question.id} type="button" className={isSelected ? `question-list-item is-selected selected-tone-${selectedIndex % 6}` : "question-list-item"} aria-pressed={isSelected} onClick={() => toggleActivityQuestion(question.id)}><span className="question-list-marker">{isSelected ? selectedIndex + 1 : "+"}</span><span>{question.prompt}</span></button>;
                })}</div> : <p>Aucune question dans cette catégorie.</p>}
              </section>)}
            </div>
          </aside>

          <section className="live-preview" aria-labelledby="preview-title">
            <header><h2 id="preview-title"><Icon name="eye"/>Aperçu en direct</h2><span className={readyToPublish ? "complete" : "incomplete"}>{readyToPublish ? "✓ Sélection complète" : `${activityQuestionCount}/${targetQuestionCount} sélectionnées`}</span><span className="question-nav">{activityQuestionCount > 0 ? `${currentQuestionNumber} sur ${activityQuestionCount}` : "Aucune question disponible"}</span></header>
            <section className="student-page-preview" aria-label="Aperçu identique à la séance d’apprentissage de l’élève">
              {currentActivityQuestion ? <iframe key={`${currentActivityQuestion.id}-${config.workType}-${config.operationId ?? "random"}`} src={singlePreviewHref} title={`Aperçu élève de la question ${currentQuestionNumber}`} /> : <p className="student-page-preview__empty">Choisissez une question dans la liste.</p>}
            </section>
            <footer className={`creator-footer ${readyToPublish ? "is-ready" : "is-pending"}`}>
              <button type="button" className="word-download" aria-label={downloadingWord ? "Création du fichier Word" : "Télécharger le fichier Word"} title={downloadingWord ? "Création du fichier Word…" : "Télécharger le fichier Word"} disabled={!readyToPublish || downloadingWord} onClick={downloadWord}><WordIcon/><span className="sr-only">{downloadingWord ? "Création du fichier Word…" : "Télécharger le fichier Word"}</span></button>
              <Link className="student-view-link" aria-disabled={activityQuestions.length === 0} href={activityQuestions.length > 0 ? fullPreviewHref : "#"} target={classroomMode ? undefined : "_blank"}>▶ {classroomMode ? "Lancer en classe" : "Tester l’activité complète comme un élève"}</Link>
              <button type="button" className="sequence-question-button" disabled={currentActivityQuestionIndex === 0} onClick={() => moveToQuestion(-1)}>← Question précédente</button>
              <button type="button" className="change-question" disabled={availableReplacementQuestions.length < 2} onClick={changeCurrentQuestion}>Changer</button>
              <button type="button" className="sequence-question-button" disabled={currentActivityQuestionIndex >= activityQuestionCount - 1} onClick={() => moveToQuestion(1)}>Question suivante →</button>
              {classroomMode ? <Link className="publish-button classroom-launch-button" aria-disabled={!readyToPublish || activityQuestions.length === 0} href={readyToPublish && activityQuestions.length > 0 ? fullPreviewHref : "#"}>Lancer en classe →</Link> : <button type="button" className="publish-button" disabled={!readyToPublish} onClick={() => setShowPublishReview(true)}>Publier →</button>}
            </footer>
          </section>
        </div>
      </div>

      <div className="creator-announcer" aria-live="polite">{demoMessage || (!complete ? Object.values(errors)[0] : "Configuration prête pour une démonstration locale.")}</div>
    </section>
    {!classroomMode && showPublishReview && <div className="publish-review-backdrop" role="presentation" onKeyDown={(event) => { if (event.key === "Escape") setShowPublishReview(false); }} onMouseDown={(event) => { if (event.target === event.currentTarget) setShowPublishReview(false); }}>
      <section className="publish-review" role="dialog" aria-modal="true" aria-labelledby="publish-review-title">
        <button type="button" className="publish-review-close" aria-label="Fermer le résumé" autoFocus onClick={() => setShowPublishReview(false)}>×</button>
        <header><span>Confirmation</span><h2 id="publish-review-title">Publier cette activité ?</h2><p>Les paramètres ci-dessous seront utilisés pour créer et assigner l’activité.</p></header>
        <dl>
          <div><dt>Activité</dt><dd>{config.title}</dd></div>
          <div><dt>Type</dt><dd>{workTypeLabel}</dd></div>
          <div><dt>{consolidationTarget ? "Élève" : "Groupes"}</dt><dd>{consolidationTarget?.displayLabel ?? selectedGroups.map(({ name }) => name).join(", ")}</dd></div>
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

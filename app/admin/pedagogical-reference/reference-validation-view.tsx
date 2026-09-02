"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  acceptHistoricalRecordReviewItems,
  canApproveHistoricalRecord,
  countHistoricalRecordReview,
  createHistoricalRecordReviewDraft,
  getIntellectualOperation,
  INTELLECTUAL_OPERATIONS,
  INTELLECTUAL_OPERATION_SOURCES,
  type HistoricalRecord,
  type HistoricalRecordReviewDraft,
} from "@/lib/pedagogical-reference";

const LEGACY_STORAGE_KEYS = ["socrato:historical-record-review:acte-union:v3", "socrato:historical-record-review:acte-union:v2"] as const;
const CLAIM_KIND_LABELS = { fact: "Fait", interpretation: "Interprétation", nuance: "Nuance" } as const;
const EDITORIAL_REVISION_LOG = [
  { id: "monograph-context", area: "Monographie", date: "1er août 2026", summary: "Ajout du contexte, des causes et des conséquences des Rébellions de 1837-1838, dont les 92 Résolutions et les résolutions Russell." },
  { id: "monograph-chronology", area: "Monographie", date: "1er août 2026", summary: "Réorganisation complète du texte en ordre chronologique et suppression des répétitions." },
  { id: "pedagogical-structure", area: "Structure pédagogique", date: "1er août 2026", summary: "Ajout des faits essentiels et des repères de 1834 et de 1837 afin de relier la 3e secondaire au début de la 4e secondaire." },
  { id: "intellectual-operations", area: "Opérations intellectuelles", date: "1er août 2026", summary: "Ajout de dérivations éditoriales de Socrato sur les demandes patriotes, la réponse britannique et la chaîne causale menant à l’Acte d’Union, sans doublon." },
  { id: "document-bank", area: "Banque documentaire", date: "1er août 2026", summary: "Intégration de documents historiques indépendants, de la carte de Wyld modifiée et des extraits assemblés de La Minerve avec leur adaptation pédagogique signalée." },
  { id: "excerpt-presentation", area: "Présentation des extraits", date: "1er août 2026", summary: "Ajout systématique des guillemets français et de l’attribution de la personne, de l’institution ou du journal à l’origine des paroles citées." },
  { id: "source-audit", area: "Sources", date: "1er août 2026", summary: "Vérification et regroupement des sources de la monographie et de la banque documentaire dans un catalogue commun, sans source manquante." },
  { id: "navigation", area: "Navigation", date: "1er août 2026", summary: "Ajout de l’onglet Questions, retrait de l’onglet Sources redondant, réduction des boutons et correction de l’espace créé par l’ouverture d’une période." },
] as const;
function storageKey(record: HistoricalRecord) { return `socrato:historical-record-review:${record.knowledgeHeadingId}:v4`; }
function readStoredReview(record: HistoricalRecord) {
  const empty = createHistoricalRecordReviewDraft(record);
  try {
    const keys = record.knowledgeHeadingId === "acte-union" ? [storageKey(record), ...LEGACY_STORAGE_KEYS] : [storageKey(record)];
    const candidates = keys.flatMap((key) => {
      const stored = window.localStorage.getItem(key);
      if (!stored) return [];
      const parsed = JSON.parse(stored) as Partial<HistoricalRecordReviewDraft>;
      const completedDecisions = Object.values(parsed.decisions ?? {}).filter((decision) => decision !== "pending").length;
      return [{ parsed, completedDecisions }];
    });
    const parsed = candidates.sort((left, right) => right.completedDecisions - left.completedDecisions)[0]?.parsed;
    if (!parsed) return empty;
    const corrections = { ...empty.corrections, ...parsed.corrections };
    const decisions = { ...empty.decisions, ...parsed.decisions };
    for (const correction of Object.values(corrections)) {
      if (correction.status === "open" && correction.itemId in empty.decisions) decisions[correction.itemId] = "changes-requested";
    }
    return { ...empty, ...parsed, decisions, corrections };
  } catch {
    return empty;
  }
}

function StatementReferences({ sourceIds, sources }: { sourceIds: readonly string[]; sources: Map<string, HistoricalRecord["sourceCatalog"][number]> }) {
  return <details className="statement-references"><summary>Sources ({sourceIds.length})</summary><ul>{sourceIds.map((sourceId) => {
    const source = sources.get(sourceId);
    if (!source) return null;
    return <li key={sourceId}>{source.url ? <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a> : <strong>{source.title}</strong>}<span>{source.locator}</span></li>;
  })}</ul></details>;
}

function CitationMarkers({ sourceIds, sources, sourceNumbers }: { sourceIds: readonly string[]; sources: Map<string, HistoricalRecord["sourceCatalog"][number]>; sourceNumbers: Map<string, number> }) {
  return <sup className="reading-citation-markers">{sourceIds.map((sourceId) => {
    const source = sources.get(sourceId);
    const number = sourceNumbers.get(sourceId);
    if (!source || !number) return null;
    return <a key={sourceId} href={`#source-note-${sourceId}`} title={`${number}. ${source.title}`} aria-label={`Source ${number} : ${source.title}`}>[{number}]</a>;
  })}</sup>;
}

function ReadingReferences({ sourceIds, sources, sourceNumbers, label = "Sources du passage" }: { sourceIds: readonly string[]; sources: Map<string, HistoricalRecord["sourceCatalog"][number]>; sourceNumbers: Map<string, number>; label?: string }) {
  return <details open className="reading-inline-sources"><summary>{label} ({sourceIds.length})</summary><ul>{sourceIds.map((sourceId) => {
    const source = sources.get(sourceId);
    const number = sourceNumbers.get(sourceId);
    if (!source || !number) return null;
    return <li key={sourceId}><a href={`#source-note-${sourceId}`}><span>Source {number}</span><strong>{source.title}</strong></a><small>{source.locator}</small></li>;
  })}</ul></details>;
}

function TableReferenceLinks({ sourceIds, sources, sourceNumbers }: { sourceIds: readonly string[]; sources: Map<string, HistoricalRecord["sourceCatalog"][number]>; sourceNumbers: Map<string, number> }) {
  return <div className="reading-table-references"><strong>Sources de cette ligne</strong>{sourceIds.map((sourceId) => {
    const source = sources.get(sourceId);
    const number = sourceNumbers.get(sourceId);
    if (!source || !number) return null;
    return <a key={sourceId} href={`#source-note-${sourceId}`}><span>[{number}]</span>{source.title}</a>;
  })}</div>;
}

export function ReferenceValidationView({ record, initialSection = "lecture" }: { record: HistoricalRecord; initialSection?: "lecture" | "structure" | "operations" | "appropriation" }) {
  const [review, setReview] = useState<HistoricalRecordReviewDraft>(() => createHistoricalRecordReviewDraft(record));
  const [hydrated, setHydrated] = useState(false);
  const [activeSection, setActiveSection] = useState(initialSection);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => { setReview(readStoredReview(record)); setHydrated(true); }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [record]);
  useEffect(() => { if (hydrated) window.localStorage.setItem(storageKey(record), JSON.stringify(review)); }, [hydrated, record, review]);

  const progress = useMemo(() => countHistoricalRecordReview(record, review), [record, review]);
  const canApprove = canApproveHistoricalRecord(record, review);
  const sources = new Map(record.sourceCatalog.map((source) => [source.id, source]));
  const manualParagraphs = record.manual.sections.flatMap(({ paragraphs }) => paragraphs);
  const manualTables = record.manual.sections.flatMap(({ tables = [] }) => tables);
  const manualTableRows = manualTables.flatMap(({ rows }) => rows);
  const monographReviewIds = [...manualParagraphs, ...manualTableRows].map(({ id }) => id);
  const structureReviewIds = [
    ...record.knowledgePrecisions,
    ...record.narrative,
    ...record.chronologicalMarkers,
    ...record.actors,
    ...record.territories,
    ...record.vocabulary,
    ...record.misconceptions,
  ].map(({ id }) => id);
  const intellectualOperationsReviewIds = [...record.expectedLearning, ...record.relationships].map(({ id }) => id);
  const sourceReviewIds = record.sourceCatalog.map(({ id }) => `source:${id}`);
  const missingSourceCount = record.sourceCatalog.filter(({ verificationStatus, url, locator }) => verificationStatus !== "verified" || !url || !locator.trim()).length;
  const contentStatements = new Map([
    ...manualParagraphs,
    ...manualTableRows,
    ...record.narrative,
    ...record.chronologicalMarkers,
    ...record.actors,
    ...record.territories,
    ...record.relationships,
    ...record.vocabulary,
    ...record.misconceptions,
    ...record.expectedLearning,
  ].map((statement) => [statement.id, statement]));
  const correctionTargets = new Map<string, string>([
    ...Array.from(contentStatements, ([id, statement]) => [id, statement.text] as const),
    ...record.knowledgePrecisions.map(({ id, officialLabel }) => [id, officialLabel] as const),
    ...record.sourceCatalog.map(({ id, title }) => [`source:${id}`, title] as const),
  ]);
  const sourceNumbers = new Map(record.sourceCatalog.map((source, index) => [source.id, index + 1]));
  const correctionHistory = Object.values(review.corrections).sort((left, right) => right.requestedAt.localeCompare(left.requestedAt));
  const currentCorrectionHistory = correctionHistory.filter(({ itemId }) => correctionTargets.has(itemId));
  const archivedCorrectionHistory = correctionHistory.filter(({ itemId }) => !correctionTargets.has(itemId));
  const operationSources = new Map(INTELLECTUAL_OPERATION_SOURCES.map((source) => [source.id, source]));
  const statusLabel = review.status === "approved" ? "Approuvé localement" : review.status === "changes-requested" ? "Corrections demandées" : "En validation";

  function validateGroup(ids: readonly string[], label: string) {
    setReview((current) => {
      const accepted = acceptHistoricalRecordReviewItems(current, ids);
      const resolvedAt = new Date().toISOString();
      return {
        ...accepted,
        decisions: { ...accepted.decisions, ...Object.fromEntries(ids.map((id) => [id, "accepted"])) },
        corrections: Object.fromEntries(Object.entries(accepted.corrections).map(([id, correction]) => [id, ids.includes(id) && correction.status === "open" ? { ...correction, status: "resolved", resolvedAt } : correction])),
      };
    });
    setNotice(`${label} validé.`);
  }

  function pageValidation(ids: readonly string[], label: string, actionLabel: string, completedLabel: string) {
    const accepted = ids.filter((id) => review.decisions[id] === "accepted").length;
    const changesRequested = ids.filter((id) => review.decisions[id] === "changes-requested").length;
    const complete = accepted === ids.length;
    return <div className="page-validation">
      <span>{complete ? `${label} déjà validé.` : `${ids.length} éléments seront validés ensemble.`}{changesRequested > 0 ? ` L’historique des ${changesRequested} ancienne(s) correction(s) sera conservé.` : ""}</span>
      <button type="button" onClick={() => validateGroup(ids, label)} disabled={complete}>{complete ? completedLabel : actionLabel}</button>
    </div>;
  }

  function approve() {
    if (!canApprove) return;
    setReview((current) => ({ ...current, status: "approved", approvedAt: new Date().toISOString() }));
  }

  return <main id="reference-top" className="reference-admin">
    <header className="reference-admin__header">
      <div><p>Administration · Référentiel pédagogique</p><h1>{record.knowledgeHeadingId === "gouvernement-responsable" ? "Gouvernement responsable" : "Acte d’Union"}</h1><span>1840-1896 · La formation du régime fédéral canadien</span></div>
      <div className="reference-admin__header-actions"><Link href="/admin/pedagogical-reference">Toutes les périodes</Link><Link href="/teacher">Espace enseignant</Link></div>
    </header>

    <section className="review-overview" aria-label="État de la validation">
      <div><span className={`review-status review-status--${review.status}`}>{statusLabel}</span><strong>{progress.accepted} sur {progress.total}</strong><small>éléments validés</small></div>
      <div className="review-progress" role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.accepted}><span style={{ width: `${progress.total ? progress.accepted / progress.total * 100 : 0}%` }} /></div>
      <p>{progress.pending} à vérifier · {progress.changesRequested} à corriger · {record.sourceCatalog.length} sources</p>
    </section>

    {notice && <div className="review-notice" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice("")} aria-label="Fermer la confirmation">×</button></div>}

    <nav className="review-tabs" aria-label="Sections du dossier">
      <button type="button" aria-pressed={activeSection === "lecture"} onClick={() => setActiveSection("lecture")}>Monographie</button>
      <Link href={`/admin/pedagogical-reference/documents/${record.knowledgeHeadingId}`}>Documents historiques</Link>
      <Link href={`/admin/pedagogical-reference/questions?notion=${record.knowledgeHeadingId}`}>Questions</Link>
      {[["structure", "Structure pédagogique"], ["operations", "Opérations intellectuelles"], ["appropriation", "Approbation"]].map(([id, label]) => <button key={id} type="button" aria-pressed={activeSection === id} onClick={() => setActiveSection(id as typeof activeSection)}>{label}</button>)}
    </nav>

    {activeSection === "lecture" && <section className="review-section reading-view" aria-labelledby="reading-title">
      <header className="reading-cover">
        <p>Référentiel historique interne · Monographie soumise à révision</p>
        <h2 id="reading-title">{record.manual.title}</h2>
        <span>{record.scope}</span>
        <dl>
          <div><dt>État</dt><dd>Brouillon non approuvé</dd></div>
          <div><dt>Version de travail</dt><dd>{review.version || "À préciser"}</dd></div>
          <div><dt>Corpus</dt><dd>{record.manual.sections.length} chapitres · {manualParagraphs.length} paragraphes · {manualTables.length} tableaux · {record.sourceCatalog.length} sources</dd></div>
        </dl>
      </header>
      <div className="reading-notices">
        <aside className="reading-purpose"><strong>Fonction de ce document</strong><p>{record.manual.purpose}</p></aside>
        {record.manual.editorialMethod && <aside className="reading-purpose"><strong>Méthode éditoriale</strong><p>{record.manual.editorialMethod}</p></aside>}
        {record.manual.scopeBoundary && <aside className="reading-purpose reading-purpose--boundary"><strong>Limite avec la notion suivante</strong><p>{record.manual.scopeBoundary}</p></aside>}
        <aside className="reading-purpose reading-purpose--sources"><strong>Comment lire les références</strong><p>Chaque numéro entre crochets identifie une source. Ouvre « Sources du passage » pour voir immédiatement son titre et son localisateur, ou sélectionne le numéro pour rejoindre sa notice bibliographique complète.</p></aside>
      </div>
      <article className="reading-manuscript">{record.manual.sections.map((section) => <section key={section.id} aria-labelledby={`reading-${section.id}`}>
        <header><h3 id={`reading-${section.id}`}>{section.title}</h3><p>{section.purpose}</p></header>
        {section.paragraphs.map((paragraph) => <div id={`reading-${paragraph.id}`} className={`reading-paragraph reading-paragraph--${review.decisions[paragraph.id]}`} key={paragraph.id}>
          <p>{paragraph.text}<CitationMarkers sourceIds={paragraph.sourceIds} sources={sources} sourceNumbers={sourceNumbers} /></p>
          <ReadingReferences sourceIds={paragraph.sourceIds} sources={sources} sourceNumbers={sourceNumbers} />
        </div>)}
        {(section.tables ?? []).map((table) => <figure className="reading-table" key={table.id}>
          <figcaption><strong>{table.title}</strong><span>{table.introduction}</span></figcaption>
          <div><table><thead><tr>{table.columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead><tbody>{table.rows.map((row) => <tr className={`reading-table-row--${review.decisions[row.id]}`} key={row.id}>{row.cells.map((cell, index) => <td key={`${row.id}-${table.columns[index]}`}>{cell}{index === row.cells.length - 1 && <TableReferenceLinks sourceIds={row.sourceIds} sources={sources} sourceNumbers={sourceNumbers} />}</td>)}</tr>)}</tbody></table></div>
        </figure>)}
      </section>)}</article>
      <section className="reading-appendix" aria-labelledby="reading-chronology-title"><h3 id="reading-chronology-title">Annexe A — Chronologie essentielle</h3><ol>{record.chronologicalMarkers.map((marker) => <li key={marker.id}><time>{marker.dateLabel}</time><div><span>{marker.text}<CitationMarkers sourceIds={marker.sourceIds} sources={sources} sourceNumbers={sourceNumbers} /></span><ReadingReferences sourceIds={marker.sourceIds} sources={sources} sourceNumbers={sourceNumbers} label="Sources du repère" /></div></li>)}</ol></section>
      <section className="reading-appendix" aria-labelledby="reading-glossary-title"><h3 id="reading-glossary-title">Annexe B — Glossaire</h3><dl>{record.vocabulary.map((entry) => <div key={entry.id}><dt>{entry.term}</dt><dd>{entry.text}<CitationMarkers sourceIds={entry.sourceIds} sources={sources} sourceNumbers={sourceNumbers} /><ReadingReferences sourceIds={entry.sourceIds} sources={sources} sourceNumbers={sourceNumbers} label="Sources de la définition" /></dd></div>)}</dl></section>
      <section className="reading-bibliography" aria-labelledby="bibliography-title"><h3 id="bibliography-title">Annexe C — Bibliographie et localisateurs</h3><ol>{record.sourceCatalog.map((source, index) => <li id={`source-note-${source.id}`} key={source.id}><b>Source {index + 1}</b><strong>{source.title}</strong><span>{source.creator ? `${source.creator}. ` : ""}{source.publisher}{source.publicationYear ? `, ${source.publicationYear}` : ""}. {source.locator}</span>{source.url && <a href={source.url} target="_blank" rel="noreferrer">Consulter la source ↗</a>}</li>)}</ol></section>
      {pageValidation(monographReviewIds, "Monographie", "Valider cette monographie", "Monographie validée")}
      <a className="back-to-reference-top" href="#reference-top">↑ Retour en haut</a>
    </section>}

    {activeSection === "structure" && <section className="review-section structure-review" aria-labelledby="structure-title">
      <div className="review-section__intro"><p>Transposition pédagogique</p><h2 id="structure-title">Structure pédagogique de la notion</h2><span>Lis l’ensemble des éléments qui alimenteront Socrato, puis valide cette page en une seule fois.</span></div>

      <section className="structure-block" aria-labelledby="program-title">
        <header><div><p>Couverture ministérielle obligatoire</p><h3 id="program-title">Précisions des connaissances</h3></div></header>
        <div className="program-coverage-list">{record.knowledgePrecisions.map((precision) => <article className={`program-coverage-card program-coverage-card--${review.decisions[precision.id]}`} key={precision.id}>
          <header><span>{String.fromCharCode(96 + precision.officialOrder)}</span><div><h4>{precision.officialLabel}</h4><strong>{precision.coverageStatus === "complete" ? "Couverture documentaire complète" : precision.coverageStatus === "partial" ? "Couverture partielle" : "À documenter"}</strong></div></header>
          <p>{precision.text}</p><details className="coverage-evidence"><summary>Contenus reliés ({precision.linkedStatementIds.length})</summary><ul>{precision.linkedStatementIds.map((statementId) => { const linked = contentStatements.get(statementId); return linked && <li key={statementId}>{linked.text}</li>; })}</ul></details><StatementReferences sourceIds={precision.sourceIds} sources={sources} />
        </article>)}</div>
      </section>

      <section className="structure-block" aria-labelledby="claims-title">
        <header><div><p>Noyau historique structuré</p><h3 id="claims-title">Affirmations essentielles</h3></div></header>
        <div className="claim-list">{record.narrative.map((claim, index) => <article className={`claim-card claim-card--${review.decisions[claim.id]}`} key={claim.id}><header><span>{index + 1}</span><strong>{CLAIM_KIND_LABELS[claim.claimKind]}</strong></header><p>{claim.text}</p><StatementReferences sourceIds={claim.sourceIds} sources={sources} /></article>)}</div>
      </section>

      <section className="structure-block" aria-labelledby="chronology-title">
        <header><div><p>Repères structurés</p><h3 id="chronology-title">Chronologie</h3></div></header>
        <ol className="timeline">{record.chronologicalMarkers.map((marker) => <li key={marker.id}><time>{marker.dateLabel}</time><div className="structured-copy"><span>{marker.text}</span><StatementReferences sourceIds={marker.sourceIds} sources={sources} /></div></li>)}</ol>
      </section>

      <div className="structured-groups">
        <section className="structure-block"><header><h3>Acteurs</h3></header>{record.actors.map((actor) => <article className="structured-item" key={actor.id}><strong>{actor.name}</strong><p>{actor.text}</p><StatementReferences sourceIds={actor.sourceIds} sources={sources} /></article>)}</section>
        <section className="structure-block"><header><h3>Territoires</h3></header>{record.territories.map((territory) => <article className="structured-item" key={territory.id}><p>{territory.text}</p><StatementReferences sourceIds={territory.sourceIds} sources={sources} /></article>)}</section>
      </div>

      <div className="review-two-columns">
        <section className="structure-block"><header><h3>Vocabulaire essentiel</h3></header><dl className="review-definitions">{record.vocabulary.map((entry) => <div key={entry.id}><dt>{entry.term}</dt><dd>{entry.text}</dd><StatementReferences sourceIds={entry.sourceIds} sources={sources} /></div>)}</dl></section>
        <section className="structure-block"><header><h3>Confusions à prévenir</h3></header><ul className="misconception-list">{record.misconceptions.map((entry) => <li key={entry.id}><strong>{entry.misconception}</strong><span>{entry.text}</span><StatementReferences sourceIds={entry.sourceIds} sources={sources} /></li>)}</ul></section>
      </div>

      {pageValidation(structureReviewIds, "Structure pédagogique", "Valider la structure pédagogique", "Structure pédagogique validée")}
    </section>}

    {activeSection === "operations" && <section className="review-section structure-review" aria-labelledby="operations-title">
      <div className="review-section__intro"><p>Raisonnement historique</p><h2 id="operations-title">Opérations intellectuelles</h2><span>Cette page présente d’abord les objectifs de maîtrise proposés par Socrato, puis le cadre ministériel qui leur sert de référence.</span></div>
      <section className="structure-block"><header><div><p>Dérivations de Socrato</p><h3>Objectifs de maîtrise proposés</h3></div></header><p className="objectives-disclaimer">Ces objectifs sont des dérivations pédagogiques de Socrato, et non des formulations officielles du ministère.</p><ol className="learning-list">{record.expectedLearning.map((learning) => <li key={learning.id}><div className="objective-content"><div className="objective-status"><span>Dérivation éditoriale de Socrato</span></div><p>{learning.text}</p><dl className="objective-details"><div><dt>Assise dans le programme</dt><dd>{learning.programBasis}</dd></div><div><dt>Connaissances mobilisées</dt><dd>{learning.knowledgeFocus.join(" · ")}</dd></div><div><dt>Opérations intellectuelles</dt><dd>{learning.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl><StatementReferences sourceIds={learning.sourceIds} sources={sources} /></div></li>)}</ol></section>
      <section className="structure-block"><header><div><p>Raisonnement appliqué à la notion</p><h3>Relations historiques</h3></div></header><div className="relationship-list">{record.relationships.map((relationship) => <article className="structured-item" key={relationship.id}><strong>{relationship.relationshipType === "cause" ? "Cause" : relationship.relationshipType === "consequence" ? "Conséquence" : relationship.relationshipType === "change" ? "Changement" : relationship.relationshipType === "continuity" ? "Continuité" : "Lien"}</strong><p>{relationship.text}</p><StatementReferences sourceIds={relationship.sourceIds} sources={sources} /></article>)}</div></section>
      <section className="structure-block"><header><div><p>Cadre ministériel</p><h3>Opérations intellectuelles officielles</h3></div></header><p className="objectives-disclaimer">Ce catalogue global reproduit l’ordre et les libellés du cadre d’évaluation ministériel. Les comportements attendus proviennent du programme et des documents d’évaluation 2025-2026.</p><div className="operation-reference-list">{INTELLECTUAL_OPERATIONS.map((operation) => <article key={operation.id}><header><span>{operation.officialOrder}</span><div><h4>{operation.officialLabel}</h4><p>{operation.conciseDescription}</p></div><strong>{operation.detailedInMinisterialExamSectionA2025_2026 ? "Détaillée dans la section A" : "Définie par le programme et le cadre"}</strong></header><details><summary>Comportements attendus ({operation.expectedBehaviors.length})</summary><ul>{operation.expectedBehaviors.map((behavior) => <li key={behavior}>{behavior}</li>)}</ul></details><details><summary>Références ministérielles ({operation.sourceIds.length})</summary><ul>{operation.sourceIds.map((sourceId) => { const source = operationSources.get(sourceId); return source && <li key={sourceId}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a><span>{source.locator}</span></li>; })}</ul></details></article>)}</div></section>
      {pageValidation(intellectualOperationsReviewIds, "Opérations intellectuelles", "Valider les opérations intellectuelles", "Opérations intellectuelles validées")}
    </section>}

    {activeSection === "appropriation" && <section className="review-section approval-file-panel" aria-labelledby="approval-file-title">
      <div className="review-section__intro"><p>Préparation à une évaluation externe</p><h2 id="approval-file-title">Dossier d’approbation</h2><span>Cette vue prépare les preuves nécessaires à une révision institutionnelle. Elle ne signifie pas que Socrato ou ce dossier sont approuvés par le ministère.</span></div>
      <div className="approval-file-summary"><div><strong>{progress.accepted}/{progress.total}</strong><span>éléments du contenu validés</span></div><div><strong>{record.knowledgePrecisions.length}/4</strong><span>précisions ministérielles documentées</span></div><div><strong>{record.sourceCatalog.length}</strong><span>sources répertoriées · {missingSourceCount === 0 ? "aucune source manquante" : `${missingSourceCount} source(s) à compléter`}</span></div><div><strong>{currentCorrectionHistory.filter(({ status }) => status === "open").length}</strong><span>corrections ouvertes sur la version actuelle</span></div></div>
      <div className="approval-file-grid">
        <article><span className="file-status file-status--ready">Documenté</span><h3>Référentiel historique lisible</h3><p>Le texte continu, ses notes et sa bibliographie proviennent du même manuel canonique que la validation par chapitre.</p></article>
        <article><span className="file-status file-status--ready">Documenté</span><h3>Concordance avec le programme</h3><p>Les quatre précisions officielles de la notion sont reliées aux paragraphes, affirmations et sources.</p></article>
        <article><span className={`file-status file-status--${review.status === "approved" ? "ready" : "review"}`}>{review.status === "approved" ? "Documenté" : "En validation"}</span><h3>Piste de vérification</h3><p>{review.status === "approved" ? "La monographie, la structure pédagogique, les opérations intellectuelles et les sources ont été validées." : "La monographie, la structure pédagogique, les opérations intellectuelles et les sources doivent être validées."}</p></article>
        <article><span className="file-status file-status--todo">À préparer</span><h3>Fiche pédagogique concise</h3><p>La fiche destinée au fonctionnement de Socrato sera finalisée à partir du dossier historique approuvé.</p></article>
        <article><span className="file-status file-status--todo">À préparer</span><h3>Questions et documents destinés aux élèves</h3><p>Chaque question, document, réponse attendue et règle de rétroaction devra être documenté et approuvé séparément.</p></article>
        <article><span className="file-status file-status--todo">À planifier</span><h3>Évaluations transversales</h3><p>Les aspects pédagogiques, socioculturels, publicitaires, matériels, numériques, d’accessibilité et de vie privée devront être examinés.</p></article>
      </div>
      {pageValidation(sourceReviewIds, "Sources", "Valider la vérification des sources", "Vérification des sources validée")}
    </section>}

    {activeSection === "appropriation" && <section className="review-section" aria-labelledby="approval-title">
      <div className="approval-grid"><div><p>Décision administrative</p><h2 id="approval-title">Approbation finale</h2><p className="approval-summary-copy">Cette décision confirme que la monographie, la structure pédagogique, les opérations intellectuelles et les sources déjà validées peuvent former le dossier de référence officiel de Socrato pour cette notion.</p></div><div className="approval-form"><label>Nom de la personne responsable<input value={review.reviewerName} onChange={(event) => setReview((current) => ({ ...current, reviewerName: event.target.value }))} /></label><label>Version<input value={review.version} onChange={(event) => setReview((current) => ({ ...current, version: event.target.value }))} /></label><label>Commentaire de validation<textarea value={review.reviewerComment} onChange={(event) => setReview((current) => ({ ...current, reviewerComment: event.target.value }))} /></label><div className="approval-actions"><button className="approval-primary" type="button" onClick={approve} disabled={!canApprove}>Approuver le dossier</button></div>{!canApprove && <p className="approval-help">Pour approuver : valider la monographie, la structure pédagogique, les opérations intellectuelles et les sources, puis inscrire ton nom et une version.</p>}{review.status === "approved" && review.approvedAt && <p className="approval-success" role="status">Dossier approuvé localement le {new Intl.DateTimeFormat("fr-CA", { dateStyle: "long", timeStyle: "short" }).format(new Date(review.approvedAt))}.</p>}</div></div>
      <details className="correction-history">
        <summary><div><p>Traçabilité des révisions</p><h3>Historique des révisions</h3></div><span>{EDITORIAL_REVISION_LOG.length} révisions éditoriales · {currentCorrectionHistory.filter(({ status }) => status === "open").length} correction(s) ouverte(s)</span></summary>
        <div className="correction-history__content">
          <ol className="editorial-revision-list">{EDITORIAL_REVISION_LOG.map((revision) => <li key={revision.id}><div><strong>{revision.area}</strong><p>{revision.summary}</p></div><time>{revision.date}</time></li>)}</ol>
          <details className="legacy-revision-history"><summary>Anciennes corrections enregistrées ({correctionHistory.length})</summary>{correctionHistory.length === 0 ? <p className="correction-history__empty">Aucune correction n’a été enregistrée dans les versions précédentes.</p> : <ol>{[...currentCorrectionHistory, ...archivedCorrectionHistory].map((correction) => <li key={correction.itemId} className="correction-history__archived"><div><strong>Correction conservée dans l’historique</strong><span>{correctionTargets.get(correction.itemId) ?? correction.itemId}</span><p>{correction.comment}</p></div></li>)}</ol>}</details>
        </div>
      </details>
    </section>}
  </main>;
}

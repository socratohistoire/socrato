"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ThemeToggle } from "../../tableau-de-bord/theme-toggle";
import { getHistoricalPeriodLabel } from "@/lib/student-dashboard/historical-period";
import { getCurrentLearningQuestion, getInitialQuestionDocument, getLearningSessionHeading, getLearningSessionProgress, getQuestionDocuments } from "@/lib/student-learning-session/presentation";
import type { LearningSessionDocument, LearningSessionMessage, StudentLearningSessionData } from "@/lib/student-learning-session/types";

export function StudentLearningSessionView({ data }: { data: StudentLearningSessionData }) {
  const question = getCurrentLearningQuestion(data);
  const progress = getLearningSessionProgress(data);
  const heading = getLearningSessionHeading(data);
  const primaryOperation = question?.intellectualOperations.find(({ id }) => id === question.primaryOperationId);
  const initialDocumentId = getInitialQuestionDocument(data)?.id ?? null;
  const [messages, setMessages] = useState<LearningSessionMessage[]>(question?.initialMessages ?? []);
  const [response, setResponse] = useState("");
  const [hintVisible, setHintVisible] = useState(false);

  if (!question) return null;

  function submitLocalResponse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = response.trim();
    if (!content) return;
    setMessages((current) => [
      ...current,
      { id: `student-${current.length}`, author: "student", content },
      {
        id: `system-${current.length}`,
        author: "system",
        content: "Réponse ajoutée localement. Elle n’a pas été évaluée et sera perdue au rechargement.",
      },
    ]);
    setResponse("");
  }

  return (
    <main className="learning-session min-h-screen">
      <header className="session-header">
        <div className="session-header-top">
          <Link href={data.dashboardHref} className="session-brand" aria-label="Retour au tableau de bord Socrato">
            <Image src="/logos/socrato-logo-blanc.png" alt="Logo Socrato" width={64} height={64} priority unoptimized />
            <span>SOCRATO</span>
          </Link>
          <div className="session-title-block">
            <p>SÉANCE D’APPRENTISSAGE</p>
            <h1>{heading.primaryTitle}</h1>
            {heading.contextualNotion ? <strong>{heading.contextualNotion}</strong> : null}
            <span>Période historique · {getHistoricalPeriodLabel(data.historicalPeriod)}</span>
          </div>
          <ThemeToggle />
        </div>
        <div className="session-nav-row">
          <Link href={data.dashboardHref} className="session-back"><span aria-hidden="true">←</span> Retour au tableau de bord</Link>
          <p className="session-demo-notice" role="note">{data.localDemoNotice}</p>
          <div className="session-progress" aria-label={`Question ${progress.current} sur ${progress.total}, progression ${progress.percent} %`}>
            <span>Question {progress.current} sur {progress.total}</span>
            <span className="session-progress-track" aria-hidden="true"><span style={{ width: `${progress.percent}%` }} /></span>
            <strong>{progress.percent}%</strong>
          </div>
        </div>
      </header>

      <div className="session-layout">
        <div className="question-heading">
          <div className="question-heading-main">
            <h2 id="question-section-title" className="column-title question-number">Question {question.number}</h2>
            {primaryOperation ? <span className="operation-chip">{primaryOperation.label}</span> : null}
          </div>
          <span className="question-heading-accent" aria-hidden="true" />
        </div>
        <section className="question-pane" aria-labelledby="question-section-title">
          <div className="question-module">
            <div className="question-card">
              <h3 id="question-title">{question.prompt}</h3>
              <div className="question-support-row">
                <p>{question.instruction}</p>
                <div className="question-card-actions">
                  <button type="button" className="hint-button" aria-expanded={hintVisible} onClick={() => setHintVisible(true)}>
                    <svg className="hint-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M9 18h6M10 21h4M8.2 14.5A7 7 0 1 1 15.8 14.5c-.9.7-1.3 1.4-1.3 2.5h-5c0-1.1-.4-1.8-1.3-2.5Z" />
                      <path d="M12 5.5v3M8.8 8.1l2.1 2.1M15.2 8.1l-2.1 2.1" />
                    </svg>
                    Obtenir un indice
                  </button>
                </div>
              </div>
              {hintVisible ? <p className="local-hint" role="status">{question.localHint}</p> : null}
            </div>

            <section className="conversation" aria-label="Conversation locale avec Socrato">
            <div className="message-list" aria-live="polite" aria-relevant="additions">
              {messages.map((message) => (
                <article key={message.id} className={`message message-${message.author}`}>
                  <strong>{message.author === "student" ? "Toi" : message.author === "socrato" ? "Socrato" : "Démonstration locale"}</strong>
                  <p>{message.content}</p>
                </article>
              ))}
            </div>
            <form className="response-composer" onSubmit={submitLocalResponse}>
              <textarea id="student-response" aria-label="Réponse de l’élève" value={response} onChange={(event) => setResponse(event.target.value)} rows={3} placeholder="Écris ta réponse ici…" />
              <div className="response-actions">
                <button type="button" className="voice-button" disabled>
                  <svg className="microphone-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <rect x="8" y="2.5" width="8" height="13" rx="4" />
                    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.5M8.5 21.5h7" />
                  </svg>
                  <span className="voice-label">Dicter ma réponse</span>
                  <span className="voice-availability">Disponible bientôt</span>
                </button>
                <button type="submit" className="submit-button" disabled={!response.trim()}>Envoyer ma réponse <span aria-hidden="true">→</span></button>
              </div>
            </form>
            </section>
          </div>
        </section>

        <div className="documents-heading"><h2 id="documents-title" className="column-title">Documents historiques</h2><span /></div>
        <DocumentsPane documents={getQuestionDocuments(data)} initialDocumentId={initialDocumentId} />
      </div>
    </main>
  );
}

type OrderedDocument = LearningSessionDocument & { displayOrder: number };

function DocumentsPane({ documents, initialDocumentId }: { documents: OrderedDocument[]; initialDocumentId: string | null }) {
  const [selectedId, setSelectedId] = useState(initialDocumentId);
  const [consultedIds, setConsultedIds] = useState(() => new Set(initialDocumentId ? [initialDocumentId] : []));
  const [expanded, setExpanded] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const thumbnailRefs = useRef(new Map<string, HTMLButtonElement>());
  const selected = documents.find(({ id }) => id === selectedId) ?? documents[0];

  useEffect(() => {
    if (!expanded) return;
    closeButtonRef.current?.focus();
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        const scrollPosition = window.scrollY;
        setExpanded(false);
        requestAnimationFrame(() => {
          window.scrollTo({ top: scrollPosition, behavior: "auto" });
          thumbnailRefs.current.get(selected?.id ?? "")?.focus();
        });
      }
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [expanded, selected?.id]);

  function closeExpandedDocument() {
    const scrollPosition = window.scrollY;
    setExpanded(false);
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollPosition, behavior: "auto" });
      thumbnailRefs.current.get(selected?.id ?? "")?.focus();
    });
  }

  function selectDocument(documentId: string) {
    const scrollPosition = window.scrollY;
    setSelectedId(documentId);
    setConsultedIds((current) => new Set(current).add(documentId));
    requestAnimationFrame(() => window.scrollTo({ top: scrollPosition, behavior: "auto" }));
  }

  return (
    <aside className="documents-pane" aria-labelledby="documents-title">
      <div className="documents-module">
        {!selected ? (
          <div className="documents-empty" role="status">
            <span className="documents-empty-icon" aria-hidden="true">◇</span>
            <h3>Aucun document requis</h3>
            <p>Cette question ne nécessite aucun document historique. Appuie-toi sur tes connaissances pour formuler ta réponse.</p>
          </div>
        ) : (
          <>
          <div className="document-system-card">
            <article className="document-preview">
              <DocumentContent document={selected} onExpand={() => setExpanded(true)} />
            </article>
            <div className="document-separator" aria-hidden="true" />
            <div className="document-navigation" aria-label="Navigation entre les documents">
            <div className="document-navigation-status" aria-live="polite">{consultedIds.size} sur {documents.length} {consultedIds.size === 1 ? "consulté" : "consultés"}</div>
            <div className="document-thumbnails" role="group" aria-label="Choisir un document">
              {documents.map((document) => (
                <button
                  key={document.id}
                  ref={(element) => { if (element) thumbnailRefs.current.set(document.id, element); }}
                  type="button"
                  aria-pressed={document.id === selected?.id}
                  aria-label={`Ouvrir le document ${document.displayOrder}, ${getNeutralDocumentType(document).toLocaleLowerCase("fr")}${consultedIds.has(document.id) ? ", consulté" : ""}`}
                  onClick={() => selectDocument(document.id)}
                >
                  <DocumentThumbnailPreview document={document} />
                  <strong>Document {document.displayOrder}</strong>
                  <span>{getNeutralDocumentType(document)}</span>
                  {consultedIds.has(document.id) ? <em aria-hidden="true">✓ Consulté</em> : null}
                </button>
              ))}
            </div>
            </div>
          </div>
          {expanded ? (
            <div className="document-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeExpandedDocument(); }}>
              <section className="document-modal" role="dialog" aria-modal="true" aria-labelledby="expanded-document-title">
                <button ref={closeButtonRef} type="button" className="close-document" onClick={closeExpandedDocument} aria-label="Fermer la vue agrandie">×</button>
                <DocumentContent document={selected} expanded />
              </section>
            </div>
          ) : null}
          </>
        )}
      </div>
    </aside>
  );
}

function getNeutralDocumentType(document: OrderedDocument) {
  return document.content.kind === "population_table" ? "Tableau statistique" : document.typeLabel;
}

function DocumentThumbnailPreview({ document }: { document: OrderedDocument }) {
  if (document.content.kind === "historical_image") {
    return <Image className="document-thumbnail-image" src={document.content.localSrc} alt={`Aperçu du document ${document.displayOrder} : ${document.content.alt}`} width={180} height={92} unoptimized />;
  }
  if (document.content.kind === "population_table") {
    return (
      <div className="document-thumbnail-table" aria-hidden="true">
        <table><tbody>{document.content.rows.map((row) => <tr key={row.region}><th>{row.region}</th><td>{row.population}</td><td>{row.representatives}</td></tr>)}</tbody></table>
      </div>
    );
  }
  return <blockquote className="document-thumbnail-quote" aria-hidden="true">« {document.content.excerpt} »</blockquote>;
}

function DocumentContent({ document, expanded = false, onExpand }: { document: OrderedDocument; expanded?: boolean; onExpand?: () => void }) {
  const identification = document.content.kind === "population_table"
    ? "Données démographiques utilisées dans le débat sur l’Union · 1840"
    : document.content.kind === "historical_image"
      ? "James Duncan · Vers 1848"
    : document.id === "gosford-equal-representation"
      ? "Comte de Gosford · 30 juin 1840"
      : "Louis-Hippolyte La Fontaine · 25 août 1840";

  return (
    <div className={`document-content${expanded ? " document-content-expanded" : ""}`}>
      <div className={`document-content-group document-content-group-${document.content.kind === "historical_image" ? "visual" : "textual"}`}>
        <h3 id={expanded ? "expanded-document-title" : undefined}>
          <strong>Document {document.displayOrder}</strong>
          <span aria-hidden="true"> · </span>
          <small>{getNeutralDocumentType(document)}</small>
        </h3>
        {document.content.kind === "population_table" ? (
          <div className="population-table-wrap">
            <table>
              <caption>Population et représentation des deux Canadas</caption>
              <thead><tr><th scope="col">Section</th><th scope="col">Population</th><th scope="col">Représentation</th></tr></thead>
              <tbody>{document.content.rows.map((row) => <tr key={row.region}><th scope="row">{row.region}</th><td>{row.population}</td><td>{row.representatives}</td></tr>)}</tbody>
            </table>
          </div>
        ) : document.content.kind === "historical_image" ? (
          <div className="document-visual-viewport">
            <figure className="historical-document-figure">
              <Image className="historical-document-image" src={document.content.localSrc} alt={document.content.alt} width={1600} height={1100} unoptimized />
              <figcaption>{document.title}</figcaption>
            </figure>
          </div>
        ) : <blockquote>« {document.content.excerpt} »</blockquote>}
        {document.content.kind === "historical_excerpt"
          ? <cite className="document-identification">{identification}</cite>
          : <p className="document-identification">{identification}</p>}
      </div>
      <div className="document-flex-space" aria-hidden="true" />
      <div className="document-actions">
        {onExpand ? (
          <button type="button" className="expand-document" onClick={onExpand} aria-haspopup="dialog">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" /></svg>
            Agrandir
          </button>
        ) : null}
        <details className="document-details">
          <summary>Détails</summary>
          <dl className="document-metadata">
          <dt>Nature du document</dt><dd>{document.typeLabel}</dd>
          {document.content.kind === "historical_image" ? <><dt>Description factuelle</dt><dd>{document.content.description}</dd></> : null}
          {document.dateLabel ? <><dt>Date</dt><dd>{document.dateLabel}</dd></> : null}
          {document.authorLabel ? <><dt>Auteur</dt><dd>{document.authorLabel}</dd></> : null}
          {document.institutionLabel ? <><dt>Institution ou lieu de présentation</dt><dd>{document.institutionLabel}</dd></> : null}
          {document.originalDocumentLabel ? <><dt>Document original</dt><dd>{document.originalDocumentLabel}</dd></> : null}
          {document.publicationLabel ? <><dt>Publication</dt><dd>{document.publicationLabel}</dd></> : null}
          <dt>Source complète</dt><dd>{document.sourceLabel}</dd>
          {document.editorialNote ? <><dt>Note éditoriale</dt><dd>{document.editorialNote}</dd></> : null}
          <dt>Droits et attribution</dt><dd>{document.rightsLabel}</dd>
          </dl>
          {document.sourceUrls.length ? <ul className="document-links" aria-label="Liens de référence">{document.sourceUrls.map((url, index) => <li key={url}><a href={url} target="_blank" rel="noreferrer">Consulter la référence {index + 1}</a></li>)}</ul> : null}
        </details>
      </div>
    </div>
  );
}

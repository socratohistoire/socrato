"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { ThemeToggle } from "../../tableau-de-bord/theme-toggle";
import { getHistoricalPeriodLabel } from "@/lib/student-dashboard/historical-period";
import { getCurrentLearningQuestion, getLearningSessionHeading, getLearningSessionProgress } from "@/lib/student-learning-session/presentation";
import type { LearningSessionMessage, StudentLearningSessionData } from "@/lib/student-learning-session/types";

export function StudentLearningSessionView({ data }: { data: StudentLearningSessionData }) {
  const question = getCurrentLearningQuestion(data);
  const progress = getLearningSessionProgress(data);
  const heading = getLearningSessionHeading(data);
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
        <section className="question-pane" aria-labelledby="question-title">
          <div className="question-card">
            <div className="question-meta">
              <span className="question-number">Question {question.number}</span>
              {question.intellectualOperations.map((operation) => <span key={operation.id} className="operation-chip">{operation.label}</span>)}
              <button type="button" className="hint-button" aria-expanded={hintVisible} onClick={() => setHintVisible(true)}>
                <svg className="hint-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M9 18h6M10 21h4M8.2 14.5A7 7 0 1 1 15.8 14.5c-.9.7-1.3 1.4-1.3 2.5h-5c0-1.1-.4-1.8-1.3-2.5Z" />
                  <path d="M12 5.5v3M8.8 8.1l2.1 2.1M15.2 8.1l-2.1 2.1" />
                </svg>
                Obtenir un indice
              </button>
            </div>
            <h2 id="question-title">{question.prompt}</h2>
            <p>{question.instruction}</p>
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
        </section>

        <DocumentsPane documents={question.documents} />
      </div>
    </main>
  );
}

function DocumentsPane({ documents }: { documents: StudentLearningSessionData["questions"][number]["documents"] }) {
  const [selectedId, setSelectedId] = useState(documents[0]?.id ?? null);
  const selected = documents.find(({ id }) => id === selectedId) ?? documents[0];

  return (
    <aside className="documents-pane" aria-labelledby="documents-title">
      <div className="documents-heading"><h2 id="documents-title">Documents historiques</h2><span /></div>
      {!selected ? (
        <div className="documents-empty" role="status">
          <span className="documents-empty-icon" aria-hidden="true">◇</span>
          <h3>Aucun document requis</h3>
          <p>Cette question ne nécessite aucun document historique. Appuie-toi sur tes connaissances pour formuler ta réponse.</p>
        </div>
      ) : (
        <>
          <article className="document-preview">
            <h3>{selected.title}</h3>
            <Image src={selected.previewSrc} alt={selected.previewAlt} width={900} height={560} unoptimized />
            {selected.dateLabel ? <p>{selected.dateLabel}</p> : null}
            <p>Source : {selected.sourceLabel}</p><p>Droits : {selected.rightsLabel}</p>
            <button type="button">Agrandir</button>
          </article>
          <div className="document-thumbnails" role="group" aria-label="Choisir un document">
            {documents.map((document) => <button key={document.id} type="button" aria-pressed={document.id === selected?.id} onClick={() => setSelectedId(document.id)}>{document.title}</button>)}
          </div>
        </>
      )}
    </aside>
  );
}

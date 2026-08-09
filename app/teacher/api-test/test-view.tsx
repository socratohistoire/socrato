"use client";

import { useMemo, useState, useTransition } from "react";
import { analyzeActeUnionTestResponse } from "./actions";

type Question = {
  id: string; number: number; format: string; prompt: string; operation: string;
  expectedAnswer: string; documents: Array<{ id: string; title: string; typeLabel: string }>;
};
type Result = Awaited<ReturnType<typeof analyzeActeUnionTestResponse>>;
type Message = { id: string; author: "student" | "socrato" | "system"; content: string };

const OUTCOMES: Record<string, string> = {
  satisfactory: "Réussie", partially_satisfactory: "Partiellement réussie",
  insufficient: "Insuffisante", non_exploitable: "Non exploitable",
};

export function ApiTestView({ questions }: { questions: Question[] }) {
  const [index, setIndex] = useState(0);
  const [content, setContent] = useState("");
  const [result, setResult] = useState<Result>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [showExpected, setShowExpected] = useState(false);
  const [pending, startTransition] = useTransition();
  const question = questions[index];
  const counter = useMemo(() => `${index + 1} / ${questions.length}`, [index, questions.length]);

  function choose(next: number) {
    setIndex(next); setContent(""); setResult(undefined); setMessages([]); setAttemptNumber(1); setShowExpected(false);
  }
  function submit() {
    if (!question || !content.trim()) return;
    const answer = content.trim();
    const currentAttempt = attemptNumber;
    setContent("");
    setMessages((current) => [...current, { id: `student-${currentAttempt}`, author: "student", content: answer }]);
    startTransition(async () => {
      const nextResult = await analyzeActeUnionTestResponse({ questionId: question.id, content: answer, attemptNumber: currentAttempt });
      setResult(nextResult);
      setMessages((current) => [...current, {
        id: `reply-${currentAttempt}`,
        author: nextResult.ok ? "socrato" : "system",
        content: nextResult.ok ? nextResult.feedback.studentFacingText : nextResult.error,
      }]);
      setAttemptNumber(currentAttempt + 1);
    });
  }
  if (!question) return <p>Aucune question approuvée n’est disponible.</p>;
  const completed = result?.ok && result.analysis.pedagogicalOutcome === "satisfactory";
  const exhausted = attemptNumber > 3 && !completed;
  const canAnswer = !pending && !completed && !exhausted;

  return (
    <div className="api-test-grid">
      <aside className="api-test-list" aria-label="Questions de l’Acte d’Union">
        <label htmlFor="question-select">Question</label>
        <select id="question-select" value={index} onChange={(event) => choose(Number(event.target.value))}>
          {questions.map((item, itemIndex) => <option key={item.id} value={itemIndex}>{itemIndex + 1}. {item.prompt}</option>)}
        </select>
        <div className="api-test-nav"><button disabled={index === 0} onClick={() => choose(index - 1)}>Précédente</button><strong>{counter}</strong><button disabled={index === questions.length - 1} onClick={() => choose(index + 1)}>Suivante</button></div>
        <p className="api-test-cost">Chaque analyse utilise réellement l’API et peut consommer des crédits.</p>
      </aside>

      <section className="api-test-card">
        <div className="api-test-meta"><span>{question.format}</span><span>{question.operation}</span></div>
        <h2>{question.prompt}</h2>
        <div className="api-test-documents"><h3>Documents associés</h3>{question.documents.length ? <ul>{question.documents.map((document) => <li key={document.id}><strong>{document.title}</strong><small>{document.typeLabel}</small></li>)}</ul> : <p>Aucun document associé.</p>}</div>
        <div className="api-test-conversation" aria-live="polite">
          <article className="api-test-message api-test-message--socrato"><strong>Socrato</strong><p>{messages.length ? "Poursuivons ensemble." : "Prends ton temps. Je suis là pour t’aider à construire ta réponse."}</p></article>
          {messages.map((message) => <article key={message.id} className={`api-test-message api-test-message--${message.author}`}><strong>{message.author === "student" ? "Élève" : message.author === "socrato" ? "Socrato" : "Système"}</strong><p>{message.content}</p></article>)}
          {pending ? <article className="api-test-message api-test-message--socrato"><strong>Socrato</strong><p>Je regarde ta réponse…</p></article> : null}
        </div>
        {result?.ok ? <p className={`api-test-outcome api-test-outcome--${result.analysis.pedagogicalOutcome}`}>{OUTCOMES[result.analysis.pedagogicalOutcome]}</p> : null}
        {canAnswer ? <><label htmlFor="test-answer">Ta réponse — tentative {attemptNumber} sur 3</label><textarea id="test-answer" value={content} onChange={(event) => setContent(event.target.value)} rows={4} placeholder={attemptNumber === 1 ? "Écris une première réponse…" : "Tu peux préciser ou reformuler ta réponse…"} /></> : null}
        <div className="api-test-actions">
          {canAnswer ? <button className="api-test-primary" disabled={!content.trim()} onClick={submit}>Envoyer</button> : null}
          {(completed || exhausted) && index < questions.length - 1 ? <button className="api-test-primary" onClick={() => choose(index + 1)}>Question suivante</button> : null}
          <button onClick={() => setShowExpected((value) => !value)}>{showExpected ? "Masquer" : "Voir"} la réponse attendue</button>
          {messages.length ? <button onClick={() => choose(index)}>Recommencer cette question</button> : null}
        </div>
        {showExpected ? <div className="api-test-expected"><h3>Réponse attendue</h3><p>{question.expectedAnswer}</p></div> : null}
      </section>
    </div>
  );
}

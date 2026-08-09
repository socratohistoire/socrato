"use client";

import { useMemo, useState, useTransition } from "react";
import { analyzeActeUnionTestResponse } from "./actions";

type Question = {
  id: string; number: number; format: string; prompt: string; operation: string;
  expectedAnswer: string; documents: Array<{ id: string; title: string; typeLabel: string }>;
};
type Result = Awaited<ReturnType<typeof analyzeActeUnionTestResponse>>;

const OUTCOMES: Record<string, string> = {
  satisfactory: "Réussie", partially_satisfactory: "Partiellement réussie",
  insufficient: "Insuffisante", non_exploitable: "Non exploitable",
};

export function ApiTestView({ questions }: { questions: Question[] }) {
  const [index, setIndex] = useState(0);
  const [content, setContent] = useState("");
  const [result, setResult] = useState<Result>();
  const [showExpected, setShowExpected] = useState(false);
  const [pending, startTransition] = useTransition();
  const question = questions[index];
  const counter = useMemo(() => `${index + 1} / ${questions.length}`, [index, questions.length]);

  function choose(next: number) {
    setIndex(next); setContent(""); setResult(undefined); setShowExpected(false);
  }
  function submit() {
    if (!question || !content.trim()) return;
    startTransition(async () => setResult(await analyzeActeUnionTestResponse({ questionId: question.id, content })));
  }
  if (!question) return <p>Aucune question approuvée n’est disponible.</p>;

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
        <label htmlFor="test-answer">Réponse à tester</label>
        <textarea id="test-answer" value={content} onChange={(event) => setContent(event.target.value)} rows={7} placeholder="Écrivez ici une réponse d’élève possible…" />
        <div className="api-test-actions"><button className="api-test-primary" disabled={pending || !content.trim()} onClick={submit}>{pending ? "Analyse en cours…" : "Envoyer à Terra"}</button><button onClick={() => setShowExpected((value) => !value)}>{showExpected ? "Masquer" : "Voir"} la réponse attendue</button></div>
        {showExpected ? <div className="api-test-expected"><h3>Réponse attendue</h3><p>{question.expectedAnswer}</p></div> : null}
        {result ? result.ok ? <div className={`api-test-result api-test-result--${result.analysis.pedagogicalOutcome}`} aria-live="polite">
          <div className="api-test-result-heading"><h3>Décision de Terra</h3><strong>{OUTCOMES[result.analysis.pedagogicalOutcome]}</strong></div>
          <p className="api-test-feedback">{result.feedback.studentFacingText}</p>
        </div> : <p className="api-test-error" role="alert">{result.error}</p> : null}
      </section>
    </div>
  );
}

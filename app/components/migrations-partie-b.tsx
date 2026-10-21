"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/app/eleve/tableau-de-bord/theme-toggle";
import {
  MIGRATIONS_ACTIVITY_ID,
  MIGRATIONS_DOCUMENT_FEEDBACK,
  MIGRATIONS_DOCUMENTS,
  MIGRATIONS_INSTRUCTION,
  MIGRATIONS_SCHEMA_FIELDS,
  MIGRATIONS_TITLE,
  assessMigrationsAnswer,
  emptyMigrationsDraft,
  expectedMigrationsDocumentChoice,
  migrationsMissingCount,
  restoreMigrationsDraft,
  type MigrationsDocumentChoice,
  type MigrationsDraft,
  type MigrationsSchemaFieldId,
} from "@/lib/migrations-partie-b";
import "./industrialisation-partie-b.css";

export function MigrationsPartieB({ teacherMode = false, storageScope = "practice" }: { teacherMode?: boolean; storageScope?: string }) {
  const [draft, setDraft] = useState<MigrationsDraft>(emptyMigrationsDraft);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("Chargement des réponses…");
  const [error, setError] = useState("");
  const storageKey = `socrato:${MIGRATIONS_ACTIVITY_ID}:${storageScope}`;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) setDraft(restoreMigrationsDraft(JSON.parse(saved)));
        setNotice("Réponses conservées dans cet onglet. Elles ne sont pas transmises à un enseignant.");
      } catch {
        setNotice("La sauvegarde dans cet onglet est indisponible. Téléchargez vos réponses avant de quitter.");
      }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    const save = () => {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(draft));
      } catch {
        setNotice("La sauvegarde dans cet onglet est indisponible. Téléchargez vos réponses avant de quitter.");
      }
    };
    const timer = window.setTimeout(save, 150);
    window.addEventListener("pagehide", save);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pagehide", save);
    };
  }, [draft, ready, storageKey]);

  function answerBox(id: MigrationsSchemaFieldId) {
    const field = MIGRATIONS_SCHEMA_FIELDS.find((candidate) => candidate.id === id)!;
    return <div className="partieb-box">
      <label htmlFor={`migrations-${id}`}>{field.prompt}</label>
      <textarea
        id={`migrations-${id}`}
        maxLength={2000}
        rows={3}
        value={draft.answers[id]}
        disabled={!ready || draft.submitted}
        onChange={(event) => setDraft((current) => ({ ...current, answers: { ...current.answers, [id]: event.target.value } }))}
        placeholder="Votre réponse…"
      />
    </div>;
  }

  function finish() {
    const missing = migrationsMissingCount(draft);
    if (missing) {
      setError(`Complétez les cases du schéma et le classement des dix documents. Il reste ${missing} élément${missing > 1 ? "s" : ""} à compléter.`);
      return;
    }
    setError("");
    setDraft((current) => ({ ...current, submitted: true }));
  }

  function download() {
    const text = [
      MIGRATIONS_TITLE,
      "",
      ...MIGRATIONS_SCHEMA_FIELDS.flatMap(({ id, prompt }) => [prompt, draft.answers[id] || "—", ""]),
      "Dossier documentaire",
      ...MIGRATIONS_DOCUMENTS.flatMap(({ number, title }) => [title ? `Document ${number} — ${title}` : `Document ${number}`, `Choix : ${choiceLabels[draft.choices[number] || ""]}`, ""]),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "socrato-migrations-mes-reponses.txt";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <main className="partieb-page">
    <header className="partieb-site-header">
      <div className="partieb-site-header-top">
        <Link href={teacherMode ? "/teacher" : "/eleve/tableau-de-bord"} className="partieb-site-brand" aria-label="Retour au tableau de bord Socrato">
          <Image src="/logos/socrato-logo-blanc-recadre.png" alt="" width={38} height={38} priority unoptimized />
          <span><strong>SOCRATO</strong><small>{teacherMode ? "ESPACE ENSEIGNANT" : "SÉANCE D’APPRENTISSAGE"}</small></span>
        </Link>
        <div className="partieb-site-title">
          <h1>{MIGRATIONS_TITLE}</h1>
          <strong>Pratiquer · Partie B — Décrire une période historique</strong>
          <span>Période historique · 1840-1896</span>
        </div>
        <div className="partieb-site-tools"><ThemeToggle /><button className="partieb-print" type="button" onClick={() => window.print()}>Imprimer</button></div>
      </div>
      <nav className="partieb-site-nav" aria-label="Navigation de l’activité">
        <Link href={teacherMode ? "/teacher/activities/new" : "/eleve/tableau-de-bord"}>← {teacherMode ? "Retour au créateur" : "Retour au tableau de bord"}</Link>
        {teacherMode ? <Link href="/activites/migrations-partie-b" target="_blank">Ouvrir la version élève ↗</Link> : <span>Schéma de réponse · Dossier documentaire</span>}
      </nav>
    </header>

    <div className="partieb-content">
      <header className="partieb-intro">
        <h2>Consigne</h2>
        <p>{MIGRATIONS_INSTRUCTION}</p>
        {teacherMode
          ? <p className="partieb-mode">Modèle prêt à utiliser en classe · fondé sur les quatre précisions du <a href="https://cdn-contenu.quebec.ca/cdn-contenu/education/pfeq/secondaire/programmes/PFEQ-histoire-quebec-canada-secondaire.pdf" target="_blank" rel="noreferrer">programme de 4e secondaire ↗</a> · aucune assignation à un groupe.</p>
          : <p className="partieb-mode">Entraînement autonome · téléchargez vos réponses pour les remettre à votre enseignant.</p>}
      </header>

      <section className="partieb-schema-section" aria-labelledby="migrations-schema-title">
        <h2 id="migrations-schema-title">Schéma de réponse</h2>
        <div className="partieb-schema">
          <svg className="partieb-lines partieb-main-lines" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true"><path d="M 295 255 L 395 175 M 295 375 L 395 470" /></svg>
          <div className="partieb-object"><h3>Objet de la description</h3>{answerBox("object")}</div>
          <div className="partieb-groups">
            <section className="partieb-group" aria-label="Départs et déplacements de la population">
              <svg className="partieb-lines" viewBox="0 0 600 280" preserveAspectRatio="none" aria-hidden="true"><path d="M 265 155 L 375 76 M 265 180 L 375 210" /></svg>
              <div className="partieb-central"><h3>Élément central</h3>{answerBox("exode")}</div>
              <div className="partieb-details">{answerBox("us_destination")}{answerBox("us_causes")}</div>
            </section>
            <section className="partieb-group" aria-label="Immigration et intervention des autorités">
              <svg className="partieb-lines" viewBox="0 0 600 280" preserveAspectRatio="none" aria-hidden="true"><path d="M 265 155 L 375 76 M 265 180 L 375 210" /></svg>
              <div className="partieb-central"><h3>Élément central</h3>{answerBox("transatlantic")}</div>
              <div className="partieb-details">{answerBox("colonization")}{answerBox("quarantine")}</div>
            </section>
          </div>
        </div>
      </section>

      <section className="partieb-dossier" aria-labelledby="migrations-dossier-title">
        <h2 id="migrations-dossier-title">Dossier documentaire</h2>
        <div className="partieb-documents">
          {MIGRATIONS_DOCUMENTS.map((document) => <article key={document.number} className={`partieb-document${"image" in document ? " partieb-document-image" : ""}`}>
            <header><span>Document {document.number}</span><small>{document.date}</small>{document.title ? <h3>{document.title}</h3> : null}</header>
            {"excerpt" in document ? <blockquote>{document.excerpt}</blockquote> : null}
            {"attribution" in document ? <p className="partieb-note">{document.attribution}</p> : null}
            {"image" in document ? <a href={document.image.url} target="_blank" rel="noreferrer" aria-label={`Agrandir l’image du document ${document.number}`}>
              <Image src={document.image.url} alt={document.image.alt} width={document.image.width} height={document.image.height} unoptimized style={{ width: "100%", height: "auto", display: "block" }} />
              <span className="partieb-note">Agrandir l’image ↗</span>
            </a> : null}
            {"table" in document ? <table>
              <caption>{document.title}</caption>
              <thead><tr>{document.table.headers.map((header) => <th scope="col" key={header}>{header}</th>)}</tr></thead>
              <tbody>{document.table.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
            </table> : null}
            {document.note ? <p className="partieb-note">{document.note}</p> : null}
            <details className="partieb-source"><summary>Source et provenance</summary><p>{document.source}</p>{document.links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</details>
            <fieldset className="partieb-document-answer" disabled={!ready || draft.submitted}>
              <legend>Utile ou à discriminer</legend>
              <div className="partieb-document-choices">{(["direct", "exclude"] as const).map((choice) => <label key={choice}>
                <input type="radio" name={`migrations-choice-${document.number}`} value={choice} checked={draft.choices[document.number] === choice} onChange={() => setDraft((current) => ({ ...current, choices: { ...current.choices, [document.number]: choice } }))} />
                <span>{choiceLabels[choice]}</span>
              </label>)}</div>
            </fieldset>
          </article>)}
        </div>
      </section>

      <footer className="partieb-actions">
        <p role="status">{notice}</p>
        <div>
          <button type="button" onClick={download} disabled={!ready}>Télécharger mes réponses</button>
          {draft.submitted
            ? <button type="button" onClick={() => setDraft((current) => ({ ...current, submitted: false }))}>Reprendre mes réponses</button>
            : <button type="button" className="partieb-primary" disabled={!ready} onClick={finish}>Terminer et comparer au corrigé</button>}
        </div>
        {error ? <p role="alert">{error}</p> : null}
      </footer>

      {draft.submitted ? <section className="partieb-correction" aria-labelledby="migrations-feedback-title">
        <h2 id="migrations-feedback-title">Rétroaction sur mes réponses</h2>
        <p>Vérification locale sans IA ni envoi de vos réponses à une API. Elle reconnaît des formulations prévues, mais ne comprend pas toutes les phrases. « À vérifier » ne signifie pas « faux ». Aucune note n’est attribuée.</p>
        <dl>{MIGRATIONS_SCHEMA_FIELDS.map((field) => {
          const feedback = assessMigrationsAnswer(field.id, draft.answers[field.id]);
          return <div key={field.id}><dt>{field.prompt}</dt><dd><p>Votre réponse : {draft.answers[field.id]}</p><p><strong>{feedback.label}</strong> — {feedback.message}</p><p>Piste de réponse : {field.answer}</p></dd></div>;
        })}</dl>
      </section> : null}

      {teacherMode || draft.submitted ? <details className="partieb-correction" open={draft.submitted}>
        <summary>Corrigé — pistes de réponses</summary>
        <p>Plusieurs formulations sont acceptables. Les réponses ouvertes ne sont pas notées automatiquement. Vérifiez leur précision et les relations entre les faits.</p>
        <dl>{MIGRATIONS_SCHEMA_FIELDS.map((field) => <div key={field.id}><dt>{field.prompt}</dt><dd>{field.answer}</dd></div>)}</dl>
        <h3>Discrimination des documents</h3>
        <ul>{MIGRATIONS_DOCUMENTS.map(({ number }) => <li key={number}>
          <strong>Document {number} : {choiceLabels[expectedMigrationsDocumentChoice(number)]}.</strong> {MIGRATIONS_DOCUMENT_FEEDBACK[number]}
          {draft.submitted ? <span> Votre choix : {choiceLabels[draft.choices[number] || ""]} — {draft.choices[number] === expectedMigrationsDocumentChoice(number) ? "concorde avec le corrigé" : "à revoir"}.</span> : null}
        </li>)}</ul>
        <p>Le <a href="https://cdn-contenu.quebec.ca/cdn-contenu/education/pfeq/secondaire/programmes/PFEQ-histoire-quebec-canada-secondaire.pdf" target="_blank" rel="noreferrer">programme officiel de 4e secondaire ↗</a> retient quatre précisions pour la notion Migrations : exode rural, émigration vers les États-Unis, ouverture de régions de colonisation et immigration transatlantique. Activité inspirée du modèle ministériel fourni; ce n’est pas une épreuve ni un barème officiels du Ministère.</p>
      </details> : null}
    </div>
  </main>;
}

const choiceLabels: Record<MigrationsDocumentChoice, string> = { "": "Non classé", direct: "Utile", exclude: "À discriminer" };

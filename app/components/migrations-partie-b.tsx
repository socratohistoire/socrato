"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ThemeToggle } from "@/app/eleve/tableau-de-bord/theme-toggle";
import {
  MIGRATIONS_ACTIVITY_ID,
  MIGRATIONS_DOCUMENTS,
  MIGRATIONS_INSTRUCTION,
  MIGRATIONS_SCHEMA_FIELDS,
  MIGRATIONS_RELATION_RUBRIC,
  MIGRATIONS_TITLE,
  emptyMigrationsDraft,
  migrationsMissingCount,
  restoreMigrationsDraft,
  type MigrationsDraft,
  type MigrationsSchemaFieldId,
} from "@/lib/migrations-partie-b";
import "./industrialisation-partie-b.css";
import "./migrations-partie-b.css";

type MigrationsDocument = (typeof MIGRATIONS_DOCUMENTS)[number];

export function MigrationsPartieB({ teacherMode = false, storageScope = "evaluation", children }: { teacherMode?: boolean; storageScope?: string; children?: ReactNode }) {
  const [draft, setDraft] = useState<MigrationsDraft>(emptyMigrationsDraft);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("Chargement des réponses…");
  const [error, setError] = useState("");
  const [expandedDocument, setExpandedDocument] = useState<MigrationsDocument | null>(null);
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
      setError(`Il reste ${missing} case${missing > 1 ? "s" : ""} à compléter. Vous pouvez aussi télécharger vos réponses incomplètes avec le premier bouton.`);
      return;
    }
    setError("");
    download();
    setDraft((current) => ({ ...current, submitted: true }));
  }

  function download() {
    const text = [
      MIGRATIONS_TITLE,
      "",
      ...MIGRATIONS_SCHEMA_FIELDS.flatMap(({ id, prompt }) => [prompt, draft.answers[id] || "—", ""]),
      "Correction par l’enseignant : objet /2, première mise en relation /3, deuxième mise en relation /3. Total /8.",
    ].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "socrato-migrations-mes-reponses.txt";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <main className="partieb-page migrations-evaluation">
    <header className="partieb-site-header">
      <div className="partieb-site-header-top">
        <Link href={teacherMode ? "/teacher" : "/eleve/tableau-de-bord"} className="partieb-site-brand" aria-label="Retour au tableau de bord Socrato">
          <Image src="/logos/socrato-logo-blanc-recadre.png" alt="" width={38} height={38} priority unoptimized />
          <span><strong>SOCRATO</strong><small>{teacherMode ? "ESPACE ENSEIGNANT" : "SÉANCE D’APPRENTISSAGE"}</small></span>
        </Link>
        <div className="partieb-site-title">
          <h1>{MIGRATIONS_TITLE}</h1>
          <strong>Évaluation · Section B · 8 points</strong>
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
          ? <p className="partieb-mode">Évaluation locale : émigration et immigration · corrigé réservé à l’enseignant · aucune assignation à un groupe.</p>
          : <p className="partieb-mode">Correction par votre enseignant sur 8 points. Téléchargez vos réponses pour les lui remettre; elles ne sont pas transmises automatiquement.</p>}
        <p className="migrations-marking-summary">Objet de la description : 2 points · Première mise en relation : 3 points · Deuxième mise en relation : 3 points. Seules les réponses du schéma sont évaluées.</p>
      </header>

      <section className="partieb-schema-section" aria-labelledby="migrations-schema-title">
        <h2 id="migrations-schema-title">Schéma de réponse</h2>
        <div className="partieb-schema">
          <svg className="partieb-lines partieb-main-lines" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true"><path d="M 295 255 L 395 175 M 295 375 L 395 470" /></svg>
          <div className="partieb-object"><h3>Objet de la description</h3>{answerBox("object")}</div>
          <div className="partieb-groups">
            <section className="partieb-group" aria-label="Première mise en relation">
              <svg className="partieb-lines" viewBox="0 0 600 280" preserveAspectRatio="none" aria-hidden="true"><path d="M 265 155 L 375 76 M 265 180 L 375 210" /></svg>
              <div className="partieb-central"><h3>Élément central</h3>{answerBox("us_destination")}</div>
              <div className="partieb-details">{answerBox("us_causes")}{answerBox("colonization")}</div>
            </section>
            <section className="partieb-group" aria-label="Deuxième mise en relation">
              <svg className="partieb-lines" viewBox="0 0 600 280" preserveAspectRatio="none" aria-hidden="true"><path d="M 265 155 L 375 76 M 265 180 L 375 210" /></svg>
              <div className="partieb-central"><h3>Élément central</h3>{answerBox("transatlantic")}</div>
              <div className="partieb-details">{answerBox("famine")}{answerBox("quarantine")}</div>
            </section>
          </div>
        </div>
      </section>

      <section className="partieb-dossier" aria-labelledby="migrations-dossier-title">
        <h2 id="migrations-dossier-title">Dossier documentaire</h2>
        <div className="partieb-documents">
          {MIGRATIONS_DOCUMENTS.map((document) => <article key={document.number} className={`partieb-document${"image" in document ? " partieb-document-image" : ""}`}>
            <header><span>Document {document.number}</span><small>{document.date}</small>{document.title ? <h3>{document.title}</h3> : null}</header>
            {"excerpt" in document ? <blockquote><button type="button" className="migrations-text-trigger" onClick={() => setExpandedDocument(document)} aria-label={`Agrandir le texte du document ${document.number}`} aria-haspopup="dialog">
              <span>{document.excerpt}</span>
              <span className="partieb-note migrations-enlarge-hint">Agrandir le texte</span>
            </button></blockquote> : null}
            {teacherMode && "attribution" in document ? <p className="partieb-note">{document.attribution}</p> : null}
            {"image" in document ? <button type="button" className="migrations-image-trigger" onClick={() => setExpandedDocument(document)} aria-label={`Agrandir l’image du document ${document.number}`} aria-haspopup="dialog">
              <Image src={document.image.url} alt={document.image.alt} width={document.image.width} height={document.image.height} unoptimized style={{ width: "100%", height: "auto", display: "block" }} />
              <span className="partieb-note">Agrandir l’image</span>
            </button> : null}
            {"table" in document ? <>
              <MigrationsDocumentTable document={document} />
              <button type="button" className="migrations-text-trigger migrations-enlarge-hint" onClick={() => setExpandedDocument(document)} aria-label={`Agrandir le tableau du document ${document.number}`} aria-haspopup="dialog">Agrandir le tableau</button>
            </> : null}
            {document.note ? <p className="partieb-note">{document.note}</p> : null}
            <details className="partieb-source"><summary>Source</summary><p>{document.source}</p>{document.links.slice(0, 1).map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">Consulter la source originale ↗</a>)}</details>
          </article>)}
        </div>
      </section>

      <footer className="partieb-actions">
        <p role="status">{notice}</p>
        <div>
          <button type="button" onClick={download} disabled={!ready}>Télécharger mes réponses</button>
          {draft.submitted
            ? <p>Réponses finalisées et téléchargées. Remettez le fichier à votre enseignant.</p>
            : <button type="button" className="partieb-primary" disabled={!ready} onClick={finish}>Finaliser et télécharger mes réponses</button>}
        </div>
        {error ? <p role="alert">{error}</p> : null}
      </footer>

      <MigrationsRubric />
      {teacherMode ? children : null}
    </div>
    {expandedDocument ? <MigrationsDocumentDialog document={expandedDocument} onClose={() => setExpandedDocument(null)} /> : null}
  </main>;
}

function MigrationsDocumentTable({ document }: { document: MigrationsDocument }) {
  if (!("table" in document)) return null;
  return <table>
    <caption>{document.title}</caption>
    <thead><tr>{document.table.headers.map((header) => <th scope="col" key={header}>{header}</th>)}</tr></thead>
    <tbody>{document.table.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
  </table>;
}

function MigrationsDocumentDialog({ document: expandedDocument, onClose }: { document: MigrationsDocument; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);
  return <dialog ref={dialogRef} className={`migrations-image-dialog${"image" in expandedDocument ? "" : " migrations-written-dialog"}`} aria-labelledby="migrations-image-dialog-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <header><h2 id="migrations-image-dialog-title">Document {expandedDocument.number}</h2><button type="button" onClick={onClose} aria-label="Fermer la vue agrandie" autoFocus>×</button></header>
    <div className="migrations-image-dialog-content">
      {"image" in expandedDocument
        ? <Image src={expandedDocument.image.url} alt={expandedDocument.image.alt} width={expandedDocument.image.width} height={expandedDocument.image.height} unoptimized />
        : <article className="migrations-expanded-document">
          <p className="migrations-expanded-date">{expandedDocument.date}</p>
          {expandedDocument.title ? <h3>{expandedDocument.title}</h3> : null}
          {"excerpt" in expandedDocument ? <blockquote>{expandedDocument.excerpt}</blockquote> : null}
          {"table" in expandedDocument ? <div className="migrations-table-scroll"><MigrationsDocumentTable document={expandedDocument} /></div> : null}
          {expandedDocument.note ? <p className="migrations-expanded-note">{expandedDocument.note}</p> : null}
          <p className="migrations-expanded-source">Source : {expandedDocument.source}</p>
        </article>}
    </div>
  </dialog>;
}

function MigrationsRubric() {
  return <section className="migrations-rubric" aria-labelledby="migrations-rubric-title">
    <h2 id="migrations-rubric-title">Grille d’évaluation de la section B</h2>
    <p>Critère : représentation cohérente d’une période de l’histoire du Québec et du Canada.</p>
    <h3>Objet de la description - /2</h3>
    <div className="migrations-table-scroll"><table>
      <thead><tr><th>Objet correct</th><th>Objet plus ou moins correct</th><th>Objet incorrect ou absent</th></tr></thead>
      <tbody><tr><td>2 points</td><td>1 point</td><td>0 point</td></tr></tbody>
    </table></div>
    {[1, 2].map((relation) => <div key={relation}>
      <h3>{relation === 1 ? "Première" : "Deuxième"} mise en relation - /3</h3>
      <div className="migrations-table-scroll"><table>
        <thead><tr><th scope="col">Élément central</th><th scope="col">Les deux précisions sont correctes</th><th scope="col">Une précision est correcte</th><th scope="col">Aucune précision n’est correcte</th></tr></thead>
        <tbody>{MIGRATIONS_RELATION_RUBRIC.map((row) => <tr key={row.central}><th scope="row">{row.label}</th>{row.scores.map((score, index) => <td key={index}>{score} point{score > 1 ? "s" : ""}</td>)}</tr>)}</tbody>
      </table></div>
    </div>)}
    <p><strong>Total : /8.</strong> Une réponse correcte est complète, exacte et claire. Une réponse plus ou moins correcte est incomplète, imprécise ou contient une inexactitude. Les formulations équivalentes sont acceptées. Chaque précision doit se rattacher à l’élément central de sa branche. La sélection des documents ne reçoit pas de points distincts.</p>
    <p>Barème repris des <a href="https://cdn-contenu.quebec.ca/cdn-contenu/education/evaluation-epreuves-ministerielles/documents-information/HQC_Precisions_outils_evaluation.pdf" target="_blank" rel="noreferrer">précisions ministérielles sur les outils d’évaluation</a>. Cette activité est une évaluation locale de Socrato.</p>
  </section>;
}

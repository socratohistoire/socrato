"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/app/eleve/tableau-de-bord/theme-toggle";
import {
  POLITIQUE_NATIONALE_ACTIVITY_ID,
  POLITIQUE_NATIONALE_DOCUMENTS,
  POLITIQUE_NATIONALE_INSTRUCTION,
  POLITIQUE_NATIONALE_SCHEMA_FIELDS,
  POLITIQUE_NATIONALE_BRANCHES,
  POLITIQUE_NATIONALE_TITLE,
  emptyPolitiqueNationaleDraft,
  expectedPolitiqueNationaleDocumentChoice,
  scorePolitiqueNationaleRelation,
  restorePolitiqueNationaleDraft,
  type PolitiqueNationaleDocumentChoice,
  type PolitiqueNationaleDraft,
  type PolitiqueNationaleSchemaFieldId,
} from "@/lib/politique-nationale-partie-b";
import "./industrialisation-partie-b.css";
import "./politique-nationale-partie-b.css";

export function PolitiqueNationalePartieB({ teacherMode = false, storageScope = "evaluation", correctionAnswers, correctionFeedback }: { teacherMode?: boolean; storageScope?: string; correctionAnswers?: Record<PolitiqueNationaleSchemaFieldId, string>; correctionFeedback?: Record<number, string> }) {
  const [draft, setDraft] = useState<PolitiqueNationaleDraft>(emptyPolitiqueNationaleDraft);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("Chargement des réponses…");
  const storageKey = `socrato:${POLITIQUE_NATIONALE_ACTIVITY_ID}:${storageScope}`;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) setDraft(restorePolitiqueNationaleDraft(JSON.parse(saved)));
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

  function answerBox(id: PolitiqueNationaleSchemaFieldId) {
    const field = POLITIQUE_NATIONALE_SCHEMA_FIELDS.find((candidate) => candidate.id === id)!;
    return <div className="partieb-box">
      <label htmlFor={`politique-nationale-${id}`}>{field.prompt}</label>
      <textarea
        id={`politique-nationale-${id}`}
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
    setDraft((current) => ({ ...current, submitted: true }));
  }

  function download() {
    const text = [
      POLITIQUE_NATIONALE_TITLE,
      "",
      ...POLITIQUE_NATIONALE_SCHEMA_FIELDS.flatMap(({ id, prompt }) => [prompt, draft.answers[id] || "—", ""]),
      "Dossier documentaire",
      "Barème : objet /2; première mise en relation /3; deuxième mise en relation /3. Total /8.",
      "Correction par l’enseignant. Ce fichier n’est pas une remise automatique.",
    ].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "socrato-politique-nationale-mes-reponses.txt";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <main className="partieb-page pn-evaluation">
    <header className="partieb-site-header">
      <div className="partieb-site-header-top">
        <Link href={teacherMode ? "/teacher" : "/eleve/tableau-de-bord"} className="partieb-site-brand" aria-label="Retour au tableau de bord Socrato">
          <Image src="/logos/socrato-logo-blanc-recadre.png" alt="" width={38} height={38} priority unoptimized />
          <span><strong>SOCRATO</strong><small>{teacherMode ? "ESPACE ENSEIGNANT" : "SÉANCE D’APPRENTISSAGE"}</small></span>
        </Link>
        <div className="partieb-site-title">
          <h1>{POLITIQUE_NATIONALE_TITLE}</h1>
          <strong>Évaluation · Section B — Décrire une période historique</strong>
          <span>Période historique · 1840-1896</span>
        </div>
        <div className="partieb-site-tools"><ThemeToggle /><button className="partieb-print" type="button" onClick={() => window.print()}>Imprimer</button></div>
      </div>
      <nav className="partieb-site-nav" aria-label="Navigation de l’activité">
        <Link href={teacherMode ? "/teacher/activities/new" : "/eleve/tableau-de-bord"}>← {teacherMode ? "Retour au créateur" : "Retour au tableau de bord"}</Link>
        {teacherMode ? <Link href="/activites/politique-nationale-partie-b" target="_blank">Ouvrir la version élève ↗</Link> : <span>Schéma de réponse · Dossier documentaire</span>}
      </nav>
    </header>

    <div className="partieb-content">
      <header className="partieb-intro">
        <h2>Consigne</h2>
        <p>{POLITIQUE_NATIONALE_INSTRUCTION}</p>
        {teacherMode
          ? <p className="partieb-mode">Modèle prêt à utiliser en classe · fondé sur les quatre précisions du <a href="https://cdn-contenu.quebec.ca/cdn-contenu/education/pfeq/secondaire/programmes/PFEQ-histoire-quebec-canada-secondaire.pdf" target="_blank" rel="noreferrer">programme de 4e secondaire ↗</a> · aucune assignation à un groupe.</p>
          : <p className="partieb-mode">Évaluation sur 8 points · téléchargez vos réponses pour les remettre à votre enseignant. Le corrigé est réservé à l’espace enseignant.</p>}
      </header>

      <section className="partieb-schema-section" aria-labelledby="politique-nationale-schema-title">
        <h2 id="politique-nationale-schema-title">Schéma de réponse</h2>
        <div className="partieb-schema">
          <svg className="partieb-lines partieb-main-lines" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true"><path d="M 295 255 L 395 175 M 295 375 L 395 470" /></svg>
          <div className="partieb-object"><h3>Objet de la description</h3>{answerBox("object")}</div>
          <div className="partieb-groups">
            {POLITIQUE_NATIONALE_BRANCHES.map((branch, index) => <section key={branch.central} className="partieb-group" aria-label={`Mise en relation ${index + 1}`}>
              <svg className="partieb-lines" viewBox="0 0 600 280" preserveAspectRatio="none" aria-hidden="true"><path d="M 265 155 L 375 76 M 265 180 L 375 210" /></svg>
              <div className="partieb-central"><h3>Élément central</h3>{answerBox(branch.central)}</div>
              <div className="partieb-details">{branch.details.map((id) => <div key={id}>{answerBox(id)}</div>)}</div>
            </section>)}
          </div>
        </div>
      </section>

      <section className="partieb-dossier" aria-labelledby="politique-nationale-dossier-title">
        <h2 id="politique-nationale-dossier-title">Dossier documentaire</h2>
        <p className="partieb-document-note">Consultez les dix documents et sélectionnez ceux qui éclairent les éléments demandés. Tous ne sont pas nécessaires et un document peut servir à plusieurs cases. Les traductions, adaptations et synthèses sont signalées dans la provenance.</p>
        <div className="partieb-documents">
          {POLITIQUE_NATIONALE_DOCUMENTS.map((document) => <article key={document.number} className={`partieb-document${"image" in document ? " partieb-document-image" : ""}`}>
            <header><span>Document {document.number}</span>{document.date ? <small>{document.date}</small> : null}{document.title ? <h3>{document.title}</h3> : null}</header>
            {"excerpt" in document ? <blockquote>{document.excerpt}</blockquote> : null}
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
          </article>)}
        </div>
      </section>

      <footer className="partieb-actions">
        <p role="status">{notice}</p>
        <div>
          <button type="button" onClick={download} disabled={!ready}>Télécharger mes réponses</button>
          {draft.submitted
            ? <button type="button" onClick={() => setDraft((current) => ({ ...current, submitted: false }))}>Reprendre mes réponses</button>
            : <button type="button" className="partieb-primary" disabled={!ready} onClick={finish}>Terminer ma rédaction</button>}
        </div>
        {draft.submitted ? <p role="status">Rédaction terminée dans cet onglet. Téléchargez vos réponses et remettez le fichier à votre enseignant. Aucune note automatique n’est attribuée.</p> : null}
      </footer>

      <section className="partieb-correction pn-rubric" aria-labelledby="pn-rubric-title">
        <h2 id="pn-rubric-title">Grille d’évaluation — Section B</h2>
        <p>Critère : représentation cohérente d’une période de l’histoire du Québec et du Canada.</p>
        <p>Objet de la description : correct, 2 points; plus ou moins correct, 1 point; incorrect ou absent, 0 point.</p>
        <div className="pn-table-scroll"><table><caption>Barème de chacune des deux mises en relation</caption>
          <thead><tr><th scope="col">Élément central</th><th scope="col">Deux précisions correctes</th><th scope="col">Une précision correcte</th><th scope="col">Aucune précision correcte</th></tr></thead>
          <tbody>{([2, 1, 0] as const).map((central) => <tr key={central}><th scope="row">{["Incorrect ou absent", "Plus ou moins correct", "Correct"][central]}</th>{([2, 1, 0] as const).map((details) => <td key={details}>{scorePolitiqueNationaleRelation(central, details)} point(s)</td>)}</tr>)}</tbody>
        </table></div>
        <p><strong>Objet /2 + première mise en relation /3 + deuxième mise en relation /3 = total /8.</strong></p>
        <p>Une réponse correcte est complète, exacte et claire. Toute formulation équivalente est acceptée. Les deux précisions sont appréciées selon leur exactitude et leur relation avec l’élément central.</p>
        <a href="https://cdn-contenu.quebec.ca/cdn-contenu/education/evaluation-epreuves-ministerielles/documents-information/HQC_Precisions_outils_evaluation.pdf" target="_blank" rel="noreferrer">Source : modalités ministérielles, p. 10–12 ↗</a>
      </section>

      {teacherMode && correctionAnswers ? <details className="partieb-correction">
        <summary>Corrigé — pistes de réponses</summary>
        <p>Plusieurs formulations sont acceptables. Les réponses ouvertes ne sont pas notées automatiquement. Vérifiez leur précision et les relations entre les faits.</p>
        {POLITIQUE_NATIONALE_BRANCHES.map((branch) => <section key={branch.central}><h3>{branch.label}</h3><p>Évaluez l’élément central et ses deux précisions ensemble, selon la grille ci-dessus.</p></section>)}
        <dl>{POLITIQUE_NATIONALE_SCHEMA_FIELDS.map((field) => <div key={field.id}><dt>{field.prompt}</dt><dd>{correctionAnswers[field.id]}</dd></div>)}</dl>
        <h3>Discrimination des documents</h3>
        <ul>{POLITIQUE_NATIONALE_DOCUMENTS.map(({ number }) => <li key={number}>
          <strong>Document {number} : {choiceLabels[expectedPolitiqueNationaleDocumentChoice(number)]}.</strong> {correctionFeedback?.[number]}
        </li>)}</ul>
        <p>Le <a href="https://cdn-contenu.quebec.ca/cdn-contenu/education/pfeq/secondaire/programmes/PFEQ-histoire-quebec-canada-secondaire.pdf" target="_blank" rel="noreferrer">programme officiel de 4e secondaire ↗</a> retient quatre précisions pour la Politique nationale : crise économique de 1873, politique tarifaire, chemin de fer transcontinental du Canadien Pacifique et colonisation des terres de l’Ouest. Activité inspirée du modèle ministériel fourni; ce n’est pas une épreuve ni un barème officiels du Ministère.</p>
      </details> : null}
    </div>
  </main>;
}

const choiceLabels: Record<PolitiqueNationaleDocumentChoice, string> = { "": "Non classé", direct: "Utile", exclude: "À discriminer" };

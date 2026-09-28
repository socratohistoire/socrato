"use client";

import Link from "next/link";
import Image from "next/image";
import { assessIndustrialisationAnswer } from "@/lib/industrialisation-partie-b";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/app/eleve/tableau-de-bord/theme-toggle";
import { EXCLUDED_DOCUMENT_REASONS, INDUSTRIALISATION_ACTIVITY_ID, INDUSTRIALISATION_DOCUMENTS, INDUSTRIALISATION_INSTRUCTION, INDUSTRIALISATION_TITLE, SCHEMA_FIELDS, emptyIndustrialisationDraft, expectedDocumentChoice, industrialisationMissingCount, restoreIndustrialisationDraft, type DocumentChoice, type IndustrialisationDraft, type SchemaFieldId } from "@/lib/industrialisation-partie-b";
import "./industrialisation-partie-b.css";

export function IndustrialisationPartieB({ teacherMode = false, storageScope = "practice" }: { teacherMode?: boolean; storageScope?: string }) {
  const [draft, setDraft] = useState<IndustrialisationDraft>(emptyIndustrialisationDraft);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("Chargement des réponses…");
  const [error, setError] = useState("");
  const storageKey = `socrato:${INDUSTRIALISATION_ACTIVITY_ID}:${storageScope}`;
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) setDraft(restoreIndustrialisationDraft(JSON.parse(saved)));
      setNotice("Réponses conservées dans cet onglet. Elles ne sont pas transmises à un enseignant.");
    } catch { setNotice("La sauvegarde dans cet onglet est indisponible. Téléchargez vos réponses avant de quitter."); }
    setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, [storageKey]);
  useEffect(() => {
    if (!ready) return;
    const save = () => {
      try { sessionStorage.setItem(storageKey, JSON.stringify(draft)); }
      catch { setNotice("La sauvegarde dans cet onglet est indisponible. Téléchargez vos réponses avant de quitter."); }
    };
    const timer = window.setTimeout(save, 150);
    window.addEventListener("pagehide", save);
    return () => { window.clearTimeout(timer); window.removeEventListener("pagehide", save); };
  }, [draft, ready, storageKey]);

  function answerBox(id: SchemaFieldId) {
    const field = SCHEMA_FIELDS.find(field => field.id === id)!;
    return <div className="partieb-box"><label htmlFor={`partieb-${id}`}>{field.prompt}</label><textarea id={`partieb-${id}`} maxLength={2000} rows={3} value={draft.answers[id]} disabled={!ready || draft.submitted} onChange={event => setDraft(current => ({ ...current, answers: { ...current.answers, [id]: event.target.value } }))} placeholder="Votre réponse…" /></div>;
  }
  function finish() {
    const missing = industrialisationMissingCount(draft);
    if (missing) { setError(`Complétez les cases du schéma et le classement des dix documents. Il reste ${missing} élément${missing > 1 ? "s" : ""} à compléter.`); return; }
    setError(""); setDraft(current => ({ ...current, submitted: true }));
  }
  function download() {
    const text = [INDUSTRIALISATION_TITLE, "", ...SCHEMA_FIELDS.flatMap(({ id, prompt }) => [prompt, draft.answers[id] || "—", ""]), "Dossier documentaire", ...INDUSTRIALISATION_DOCUMENTS.flatMap(({ number, title }) => [`Document ${number} — ${title}`, `Choix : ${choiceLabels[draft.choices[number] || ""]}`, ""])].join("\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "socrato-industrialisation-mes-reponses.txt"; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <main className="partieb-page">
    <header className="partieb-site-header">
      <div className="partieb-site-header-top">
        <Link href={teacherMode ? "/teacher" : "/eleve/tableau-de-bord"} className="partieb-site-brand" aria-label="Retour au tableau de bord Socrato">
          <Image src="/logos/socrato-logo-blanc-recadre.png" alt="" width={38} height={38} priority unoptimized />
          <span><strong>SOCRATO</strong><small>{teacherMode ? "ESPACE ENSEIGNANT" : "SÉANCE D’APPRENTISSAGE"}</small></span>
        </Link>
        <div className="partieb-site-title"><h1>{INDUSTRIALISATION_TITLE}</h1><strong>Partie B · Décrire une période historique</strong><span>Période historique · 1840-1896</span></div>
        <div className="partieb-site-tools"><ThemeToggle /><button className="partieb-print" type="button" onClick={() => window.print()}>Imprimer</button></div>
      </div>
      <nav className="partieb-site-nav" aria-label="Navigation de l’activité"><Link href={teacherMode ? "/teacher/activities/new" : "/eleve/tableau-de-bord"}>← {teacherMode ? "Retour au créateur" : "Retour au tableau de bord"}</Link>{teacherMode ? <Link href="/activites/industrialisation-partie-b" target="_blank">Ouvrir la version élève ↗</Link> : <span>Schéma de réponse · Dossier documentaire</span>}</nav>
    </header>
    <div className="partieb-content">
      <header className="partieb-intro"><h2>Consigne</h2><p>{INDUSTRIALISATION_INSTRUCTION}</p>{teacherMode ? <p className="partieb-mode">Modèle prêt à utiliser en classe · aucune assignation à un groupe.</p> : <p className="partieb-mode">Entraînement autonome · téléchargez vos réponses pour les remettre à votre enseignant.</p>}</header>
      <section className="partieb-schema-section" aria-labelledby="partieb-schema-title"><h2 id="partieb-schema-title">Schéma de réponse</h2>
        <div className="partieb-schema">
          <svg className="partieb-lines partieb-main-lines" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true"><path d="M 295 255 L 395 175 M 295 375 L 395 470" /></svg>
          <div className="partieb-object"><h3>Objet de la description</h3>{answerBox("object")}</div>
          <div className="partieb-groups">{([1, 2] as const).map(group => <section key={group} className="partieb-group" aria-label={`Élément central ${group} et précisions`}>
            <svg className="partieb-lines" viewBox="0 0 600 280" preserveAspectRatio="none" aria-hidden="true"><path d="M 265 155 L 375 76 M 265 180 L 375 210" /></svg>
            <div className="partieb-central"><h3>Élément central</h3>{answerBox(group === 1 ? "central1" : "central2")}</div>
            <div className="partieb-details">{answerBox(group === 1 ? "detail1" : "detail3")}{answerBox(group === 1 ? "detail2" : "detail4")}</div>
          </section>)}</div>
        </div>
      </section>
      <section className="partieb-dossier" aria-labelledby="partieb-dossier-title"><h2 id="partieb-dossier-title">Dossier documentaire</h2><p className="partieb-document-note">Dix documents. […] indique une coupure; les autres crochets signalent un ajout. Le document 2 est une photographie d’époque; les documents 4 et 9 reposent sur des sources primaires transcrites. Chaque référence précise la nature de la source.</p>
        <div className="partieb-documents">{INDUSTRIALISATION_DOCUMENTS.map(doc => <article key={doc.number} className="partieb-document"><header><span>Document {doc.number}</span><small>{doc.date}</small>{[2, 6, 9].includes(doc.number) ? <h3>{doc.title}</h3> : null}</header>
          {"excerpt" in doc ? <blockquote>{doc.excerpt}</blockquote> : null}
          {"image" in doc ? <a href={doc.image.url} target="_blank" rel="noreferrer" aria-label={`Agrandir la photographie du document ${doc.number}`}><Image src={doc.image.url} alt={doc.image.alt} width={doc.image.width} height={doc.image.height} unoptimized style={{ width: "100%", height: "auto", display: "block" }} /><span className="partieb-note">Agrandir la photographie ↗</span></a> : null}
          {"table" in doc ? <table><caption>{doc.title}</caption><thead><tr>{doc.table.headers.map(header => <th scope="col" key={header}>{header}</th>)}</tr></thead><tbody>{doc.table.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table> : null}
          {doc.note ? <p className="partieb-note">{doc.note}</p> : null}
          <details className="partieb-source"><summary>Source et provenance</summary><p>{doc.source}</p>{doc.links.map(link => <a key={link.url} href={link.url} target="_blank" rel="noreferrer">{link.label} ↗</a>)}</details>
          <fieldset className="partieb-document-answer" disabled={!ready || draft.submitted}><legend>Utile ou à discriminer</legend><div className="partieb-document-choices">{(["direct", "exclude"] as const).map(choice => <label key={choice}><input type="radio" name={`partieb-choice-${doc.number}`} value={choice} checked={draft.choices[doc.number] === choice} onChange={() => setDraft(current => ({ ...current, choices: { ...current.choices, [doc.number]: choice } }))} /><span>{choiceLabels[choice]}</span></label>)}</div></fieldset>
        </article>)}</div>
      </section>
      <footer className="partieb-actions"><p role="status">{notice}</p><div><button type="button" onClick={download} disabled={!ready}>Télécharger mes réponses</button>{draft.submitted ? <button type="button" onClick={() => setDraft(current => ({ ...current, submitted: false }))}>Reprendre mes réponses</button> : <button type="button" className="partieb-primary" disabled={!ready} onClick={finish}>Terminer et comparer au corrigé</button>}</div>{error ? <p role="alert">{error}</p> : null}</footer>
      {draft.submitted ? <section className="partieb-correction" aria-labelledby="partieb-feedback-title"><h2 id="partieb-feedback-title">Rétroaction sur mes réponses</h2><p>Vérification locale sans IA ni envoi de vos réponses à une API. Elle reconnaît des formulations prévues, mais ne comprend pas toutes les phrases. « À vérifier » ne signifie pas « faux ». Aucune note n’est attribuée.</p><dl>{SCHEMA_FIELDS.map(field => { const feedback = assessIndustrialisationAnswer(field.id, draft.answers[field.id]); return <div key={field.id}><dt>{field.prompt}</dt><dd><p>Votre réponse : {draft.answers[field.id]}</p><p><strong>{feedback.label}</strong> — {feedback.message}</p><p>Piste de réponse : {field.answer}</p></dd></div>; })}</dl></section> : null}
      {teacherMode || draft.submitted ? <details className="partieb-correction" open={draft.submitted}><summary>Corrigé — pistes de réponses</summary><p>Plusieurs formulations sont acceptables. Les réponses ouvertes ne sont pas notées automatiquement. Vérifiez leur précision et les relations entre les faits.</p><dl>{SCHEMA_FIELDS.map(field => <div key={field.id}><dt>{field.prompt}</dt><dd>{field.answer}</dd></div>)}</dl><h3>Discrimination des documents</h3><ul>{INDUSTRIALISATION_DOCUMENTS.map(({ number }) => <li key={number}><strong>Document {number} : {choiceLabels[expectedDocumentChoice(number)]}.</strong> {EXCLUDED_DOCUMENT_REASONS[number] ?? (number === 6 ? "Contexte canadien de l’urbanisation, non une preuve directe d’une condition de travail au Québec." : "À mettre en relation avec les éléments du schéma.")}{draft.submitted ? <span> Votre choix : {choiceLabels[draft.choices[number] || ""]} — {draft.choices[number] === expectedDocumentChoice(number) ? "concorde avec le corrigé" : "à revoir"}.</span> : null}</li>)}</ul><p>Activité inspirée du modèle fourni; ce n’est pas une épreuve ni un barème officiels du Ministère.</p></details> : null}
    </div>
  </main>;
}

const choiceLabels: Record<DocumentChoice, string> = { "": "Non classé", direct: "Utile", exclude: "À discriminer" };

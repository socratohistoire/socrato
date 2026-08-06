import Link from "next/link";
import {
  getIntellectualOperation,
  getSecondaryFourKnowledgeHeading,
  PEDAGOGICAL_QUESTION_CATALOG,
  SECONDARY_FOUR_PERIODS,
} from "@/lib/pedagogical-reference";
import "../pedagogical-reference.css";
import "./question-bank-layout.css";

type QuestionBankQuery = { notion?: string; scope?: string };

const QUESTION_CATEGORIES = [
  { format: "multiple-choice", label: "Choix de réponse", description: "Questions proposant plusieurs réponses possibles." },
  { format: "short-answer", label: "Réponse courte", description: "Réponses brèves formulées en quelques mots ou quelques phrases." },
  { formats: ["document-interpretation", "interactive-timeline", "interactive-association"], format: "document-interpretation", label: "Interprétation de documents", description: "Analyse de documents historiques, incluant les lignes du temps, classements et associations interactives." },
  { format: "development-150", label: "Questions à développement · 150 mots", description: "Réponses développées d’environ 150 mots mobilisant une opération intellectuelle." },
] as const;

export default async function PedagogicalQuestionBankPage({ searchParams }: { searchParams: Promise<QuestionBankQuery> }) {
  const query = await searchParams;
  const selectedHeading = query.notion ? getSecondaryFourKnowledgeHeading(query.notion) : undefined;
  const transversalSelected = query.scope === "transversal";
  const visibleQuestions = transversalSelected
    ? PEDAGOGICAL_QUESTION_CATALOG.filter(({ scope }) => scope === "transversal")
    : selectedHeading
      ? PEDAGOGICAL_QUESTION_CATALOG.filter(({ relatedKnowledgeHeadingIds }) => relatedKnowledgeHeadingIds.includes(selectedHeading.id))
      : PEDAGOGICAL_QUESTION_CATALOG;
  const notionalCount = PEDAGOGICAL_QUESTION_CATALOG.filter(({ scope }) => scope === "notional").length;
  const transversalCount = PEDAGOGICAL_QUESTION_CATALOG.filter(({ scope }) => scope === "transversal").length;
  const approvedCount = PEDAGOGICAL_QUESTION_CATALOG.filter(({ status }) => status === "approved").length;
  const resultsTitle = transversalSelected ? "Questions transversales" : selectedHeading ? selectedHeading.officialLabel : "Toutes les questions";

  return <main className="reference-admin question-bank-page">
    <header className="reference-admin__header">
      <div><p>Administration · Référentiel pédagogique</p><h1>Banque de questions</h1><span>Un seul catalogue, organisé selon les quatre périodes et toutes les notions du programme</span></div>
      <div className="reference-admin__header-actions"><Link href="/admin/pedagogical-reference">Toutes les périodes</Link><Link href="/teacher">Espace enseignant</Link></div>
    </header>
    <section className="question-bank-summary" aria-label="État de la banque">
      <div><strong>{PEDAGOGICAL_QUESTION_CATALOG.length}</strong><span>questions au total</span></div><div><strong>{notionalCount}</strong><span>notionnelles</span></div><div><strong>{transversalCount}</strong><span>transversales</span></div><div><strong>{approvedCount}</strong><span>approuvées</span></div>
    </section>
    <div className="question-bank-catalog-layout">
      <nav className="question-bank-taxonomy" aria-label="Périodes et notions">
        <header><p>Classement du programme</p><h2>Périodes et notions</h2><Link href="/admin/pedagogical-reference/questions" aria-current={!selectedHeading && !transversalSelected ? "page" : undefined}>Toutes les questions <span>{PEDAGOGICAL_QUESTION_CATALOG.length}</span></Link></header>
        {SECONDARY_FOUR_PERIODS.map((period) => {
          const containsSelection = period.knowledgeHeadings.some(({ id }) => id === selectedHeading?.id);
          return <details key={period.id} open={containsSelection || period.officialOrder === 1}>
            <summary><span>{period.officialOrder}</span><div><strong>{period.officialPeriodLabel}</strong><small>{period.officialSocialReality}</small></div></summary>
            <ul>{period.knowledgeHeadings.map((heading) => {
              const count = PEDAGOGICAL_QUESTION_CATALOG.filter(({ relatedKnowledgeHeadingIds }) => relatedKnowledgeHeadingIds.includes(heading.id)).length;
              const active = selectedHeading?.id === heading.id && !transversalSelected;
              return <li key={heading.id}><Link href={`/admin/pedagogical-reference/questions?notion=${heading.id}`} aria-current={active ? "page" : undefined}><span>{heading.officialLabel}</span><strong>{count}</strong></Link></li>;
            })}</ul>
          </details>;
        })}
        <section className="question-bank-transversal"><p>Catégorie distincte</p><Link href="/admin/pedagogical-reference/questions?scope=transversal" aria-current={transversalSelected ? "page" : undefined}><span>Questions transversales</span><strong>{transversalCount}</strong></Link><small>Questions reliant plusieurs notions ou plusieurs périodes.</small></section>
      </nav>
      <section className="question-bank-workspace" aria-labelledby="question-bank-title">
        <header><div><p>{transversalSelected ? "Catégorie transversale" : selectedHeading ? "Notion sélectionnée" : "Catalogue unique"}</p><h2 id="question-bank-title">{resultsTitle}</h2><span>{selectedHeading ? "Seules les questions reliées à cette notion sont affichées." : transversalSelected ? "Cette catégorie regroupe les questions qui mobilisent plusieurs notions." : "Sélectionnez une notion dans une période pour filtrer la banque."}</span></div><button type="button" disabled title="Formulaire à construire">Ajouter une question à la banque</button></header>
        <div className="question-bank-filters" aria-label="Filtres complémentaires"><label>Recherche<input type="search" placeholder="Titre ou opération" disabled /></label><label>Opération<select disabled defaultValue="all"><option value="all">Toutes les opérations</option></select></label><label>Statut<select disabled defaultValue="all"><option value="all">Tous les statuts</option><option>Approuvée</option></select></label></div>
        <div className="question-category-list">{QUESTION_CATEGORIES.map((category) => {
          const categoryQuestions = visibleQuestions.filter(({ format }) => "formats" in category ? category.formats.some((categoryFormat) => categoryFormat === format) : format === category.format);
          return <section className="question-category" key={category.format} aria-labelledby={`question-category-${category.format}`}>
            <header><div><h3 id={`question-category-${category.format}`}>{category.label}</h3><p>{category.description}</p></div><strong>{categoryQuestions.length}</strong></header>
            {categoryQuestions.length > 0 ? <div className="question-bank-list">{categoryQuestions.map((question) => <article key={question.id}>
              <dl><div><dt>Notion</dt><dd>{getSecondaryFourKnowledgeHeading(question.knowledgeHeadingId)?.officialLabel ?? question.knowledgeHeadingId}</dd></div><div><dt>Opération</dt><dd>{getIntellectualOperation(question.operationId).officialLabel}</dd></div>{question.historicalDocumentIds.length > 0 ? <div className="question-documents-link"><dt>Documents</dt><dd>{question.historicalDocumentIds.map((documentId, index) => <Link key={documentId} href={`/admin/pedagogical-reference/documents/${question.knowledgeHeadingId}#${documentId}`} aria-label={`Voir le document historique ${index + 1}`}>Document {index + 1} →</Link>)}</dd></div> : null}</dl>
              <h3>{question.prompt}</h3>
              {question.answerOptions ? <ol className="question-answer-options">{question.answerOptions.map((option) => <li key={option.label}><strong>{option.label}</strong><span>{option.text}</span></li>)}</ol> : null}
              {question.format === "interactive-timeline" ? <Link href="/eleve/activite/demo-activity-timeline?notion=acte-union&mode=teacher-assigned">Essayer la question interactive →</Link> : null}
              {question.format === "interactive-association" ? <Link href="/eleve/activite/demo-activity-association?notion=acte-union&mode=teacher-assigned">Essayer la question interactive →</Link> : null}
              <footer><span>{question.status === "approved" ? `Approuvée · version ${question.review.approvedVersion}` : "Brouillon · à essayer et à approuver"}</span><strong>{question.scope === "transversal" ? "Transversale" : "Notionnelle"}</strong></footer>
            </article>)}</div> : <div className="question-category-empty">Aucune question dans cette catégorie pour le moment.</div>}
          </section>;
        })}</div>
      </section>
    </div>
  </main>;
}

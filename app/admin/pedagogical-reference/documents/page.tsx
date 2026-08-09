import Image from "next/image";
import Link from "next/link";
import { HistoricalComparisonChart } from "@/app/components/historical-comparison-chart";
import {
  ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT,
  ACTE_UNION_BANQ_512_PRISONERS_DOCUMENT,
  ACTE_UNION_BERMUDA_EXILE_DOCUMENT,
  ACTE_UNION_DEBT_COMPARISON_CHART,
  ACTE_UNION_DURHAM_DOCUMENT,
  ACTE_UNION_DURHAM_PRESENTATIONS,
  ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT,
  ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT,
  ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT,
  ACTE_UNION_LANGUAGE_ARTICLE_DOCUMENT,
  ACTE_UNION_MAP_ADAPTATION_DRAFT,
  ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT,
  ACTE_UNION_POPULATION_COMPARISON_CHART,
  ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT,
  ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT,
  ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT,
  ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT,
  getIntellectualOperation,
  SECONDARY_FOUR_PERIODS,
  RESPONSIBLE_GOVERNMENT_ICONOGRAPHIC_DOCUMENTS,
  RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT,
  RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_PRESENTATION,
  PATRIOTES_ICONOGRAPHIC_DOCUMENTS,
  PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT,
  PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT,
  PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT,
  PATRIOTES_MINERVE_RESIGNATION_DOCUMENT,
  PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT,
  PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT,
  ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM,
  ACTE_UNION_STUDENT_TIMELINE,
  type HistoricalDocumentStudentPresentation,
  type HistoricalComparisonChart as HistoricalComparisonChartRecord,
} from "@/lib/pedagogical-reference";
import "../pedagogical-reference.css";
import "./historical-documents.css";
import "./timeline-extension.css";
import { NotionTabs } from "../notion-tabs";

function DurhamStudentCardPreview({ presentation, number }: { presentation: HistoricalDocumentStudentPresentation; number: number }) {
  return <div className="student-document-preview" aria-label={`Aperçu de la carte élève : ${presentation.title}`}>
    <p className="student-document-preview__label">Aperçu exact du contenu de la carte élève</p>
    <div className="student-document-preview__card">
      <h4><strong>Document {number}</strong><span aria-hidden="true"> · </span><small>{presentation.typeLabel}</small></h4>
      <div className="student-document-preview__content">
        <figure className="student-document-preview__portrait">
          <Image src="/historical-documents/lord-durham-portrait.jpg" alt="Portrait de John George Lambton, lord Durham" width={240} height={311} />
          <figcaption><strong>Lord Durham</strong><span>Thomas Phillips · domaine public</span></figcaption>
        </figure>
        <div className="student-document-preview__excerpt"><blockquote>« {presentation.studentText} »</blockquote><cite>{presentation.authorLabel} · {presentation.dateLabel}</cite></div>
      </div>
      <details>
        <summary>Détails montrés à l’élève</summary>
        <dl>
          <dt>Nature du document</dt><dd>{presentation.typeLabel}</dd>
          <dt>Date</dt><dd>{presentation.dateLabel}</dd>
          <dt>Auteur</dt><dd>{presentation.authorLabel}</dd>
          <dt>Document original</dt><dd>{presentation.originalDocumentLabel}</dd>
          <dt>Source complète</dt><dd>{presentation.sourceLabel}</dd>
          <dt>Passage utilisé</dt><dd>{presentation.sourceSegmentLocators.join(" · ")}</dd>
          <dt>Note éditoriale</dt><dd>{presentation.editorialNote}</dd>
          <dt>Droits et attribution</dt><dd>{presentation.rightsLabel}</dd>
        </dl>
      </details>
    </div>
  </div>;
}

function HistoricalExcerpt({ text, attribution }: { text: string; attribution: string }) {
  return <div className="historical-excerpt">
    <blockquote>« {text} »</blockquote>
    <cite>— {attribution}</cite>
  </div>;
}

function ComparisonChartDocument({ chart }: { chart: HistoricalComparisonChartRecord }) {
  return <section id={chart.id} className="document-bank__charts" aria-labelledby={`${chart.id}-title`}>
    <div className="document-bank__section-title"><p>Document graphique approuvé · {chart.id}</p><h2 id={`${chart.id}-title`}>{chart.title}</h2></div>
    <article className="document-chart-card"><HistoricalComparisonChart chart={chart} /><details className="document-verification-details"><summary>Détails de vérification</summary><div>
      <dl><div><dt>Code documentaire</dt><dd>{chart.id}</dd></div><div><dt>Source</dt><dd>{chart.sourceLabel}</dd></div><div><dt>Méthode</dt><dd>{chart.methodology}</dd></div></dl>
      <div className="document-candidate__assessment"><section><h4>Mise en contexte · enseignant seulement</h4><p>{chart.historicalContext}</p></section><section><h4>Intention pédagogique</h4><ul>{chart.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
      <section><h4>Questions possibles</h4><ul>{chart.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h4>Précautions</h4><ul>{chart.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <div className="document-adaptation__links"><a href={chart.sourceUrl} target="_blank" rel="noreferrer">Consulter la source ↗</a></div>
    </div></details></article>
  </section>;
}

export function HistoricalDocumentsNotionPage({ notionId }: { notionId: string }) {
  const officialHeading = SECONDARY_FOUR_PERIODS.flatMap(({ knowledgeHeadings }) => knowledgeHeadings).find(({ id }) => id === notionId);
  const notionLabel = notionId === "rebellions-1837-1838" ? "Rébellions de 1837-1838" : officialHeading?.officialLabel ?? notionId;
  const hasDocuments = ["acte-union", "gouvernement-responsable", "rebellions-1837-1838"].includes(notionId);
  return <main className="reference-admin document-bank">
    <header className="reference-admin__header">
      <div><p>Administration · Référentiel pédagogique</p><h1>{notionLabel}</h1><span>{officialHeading ? `${SECONDARY_FOUR_PERIODS.find(({ id }) => id === officialHeading.periodId)?.officialPeriodLabel} · Dossier de la notion` : "Notion historique"}</span></div>
      <div className="reference-admin__header-actions"><Link href="/admin/pedagogical-reference">Toutes les périodes</Link><Link href="/teacher">Espace enseignant</Link></div>
    </header>
    <NotionTabs notionId={notionId} activeSection="documents" />
    <section className="document-bank__notion-title" aria-labelledby="pilot-title"><div className="document-bank__section-title"><p>Section de la notion</p><h2 id="pilot-title">Banque de documents historiques</h2><span>Documents originaux, notices de Socrato et usages pédagogiques approuvés</span></div></section>
    {!hasDocuments && <section className="document-bank__empty"><h2>Aucun document pour le moment</h2><p>Cette page est prête à recevoir les documents historiques associés à cette notion.</p></section>}

    {notionId === "acte-union" && <><section className="document-bank__adaptation" id={ACTE_UNION_MAP_ADAPTATION_DRAFT.id} aria-labelledby="acte-union-map-title">
      <div className="document-bank__section-title"><p>Document cartographique approuvé</p><h2 id="acte-union-map-title">{ACTE_UNION_MAP_ADAPTATION_DRAFT.title}</h2><span>James Wyld · vers 1842 · carte modifiée à des fins pédagogiques</span></div>
      <div className="document-adaptation"><figure><Image src={ACTE_UNION_MAP_ADAPTATION_DRAFT.previewUrl} alt="Carte historique de James Wyld modifiée montrant approximativement le Canada-Ouest en rouge, le Canada-Est en violet-bleu, la Terre de Rupert en orange, le Nouveau-Brunswick en vert et les États-Unis en jaune." width={5766} height={3814} unoptimized /><figcaption>James Wyld, vers 1842, carte modifiée à des fins pédagogiques. Les frontières et les zones colorées sont approximatives.</figcaption><ul className="document-map-legend" aria-label="Légende de la carte"><li><span className="map-swatch map-swatch--west" />Canada-Ouest</li><li><span className="map-swatch map-swatch--east" />Canada-Est</li><li><span className="map-swatch map-swatch--rupert" />Terre de Rupert</li><li><span className="map-swatch map-swatch--brunswick" />Nouveau-Brunswick</li><li><span className="map-swatch map-swatch--usa" />États-Unis</li></ul><p className="document-map-warning"><strong>Attention :</strong> les frontières représentées sont approximatives.</p></figure><aside><header><div><small>Document cartographique adapté</small><h3>Repérer les territoires de la Province du Canada</h3></div><strong>Approuvé</strong></header><section><h4>Modifications apportées</h4><ul>{ACTE_UNION_MAP_ADAPTATION_DRAFT.modifications.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h4>Notes cartographiques</h4><ul>{ACTE_UNION_MAP_ADAPTATION_DRAFT.validationNotes.map((item) => <li key={item}>{item}</li>)}</ul></section><p className="document-adaptation__rights">{ACTE_UNION_MAP_ADAPTATION_DRAFT.rightsAssessment}</p><div className="document-adaptation__links"><a href={ACTE_UNION_MAP_ADAPTATION_DRAFT.sourceUrl} target="_blank" rel="noreferrer">Consulter la carte originale ↗</a><a href={ACTE_UNION_MAP_ADAPTATION_DRAFT.cartographicReferenceUrl} target="_blank" rel="noreferrer">Vérifier les frontières ↗</a></div></aside></div>
    </section><section id={ACTE_UNION_STUDENT_TIMELINE.id} className="document-bank__timeline" aria-labelledby="acte-union-timeline-title">
      <div className="document-bank__section-title"><p>Document chronologique approuvé · {ACTE_UNION_STUDENT_TIMELINE.id}</p><h2 id="acte-union-timeline-title">{ACTE_UNION_STUDENT_TIMELINE.title}</h2><span>{ACTE_UNION_STUDENT_TIMELINE.periodLabel} · cinq repères illustrés</span></div>
      <article className="student-timeline-card"><div className="student-timeline-viewport" aria-label="Ligne du temps horizontale de 1837 à 1848"><div className="student-timeline"><div className="student-timeline__rail" aria-hidden="true" />{ACTE_UNION_STUDENT_TIMELINE.entries.map((entry) => <figure className="student-timeline__entry" key={entry.date}><div className="student-timeline__marker"><span aria-hidden="true" /><strong>{entry.date}</strong></div><div className="student-timeline__image"><Image src={entry.imageUrl} alt={entry.imageAlt} width={640} height={480} unoptimized /></div><figcaption><small>{entry.phase}</small><h3>{entry.title}</h3><p>{entry.description}</p><span>{entry.credit}</span></figcaption></figure>)}</div></div>
      <details className="document-verification-details"><summary>Détails de vérification</summary><div><dl><div><dt>Code documentaire</dt><dd>{ACTE_UNION_STUDENT_TIMELINE.id}</dd></div><div><dt>Droits</dt><dd>{ACTE_UNION_STUDENT_TIMELINE.rightsStatement}</dd></div><div><dt>Opérations suggérées</dt><dd>{ACTE_UNION_STUDENT_TIMELINE.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl><p>{ACTE_UNION_STUDENT_TIMELINE.historicalContext}</p><section><h4>Éléments à observer</h4><ul>{ACTE_UNION_STUDENT_TIMELINE.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h4>Précautions</h4><ul>{ACTE_UNION_STUDENT_TIMELINE.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section><div className="document-adaptation__links">{ACTE_UNION_STUDENT_TIMELINE.entries.map((entry) => <a href={entry.sourceUrl} target="_blank" rel="noreferrer" key={entry.date}>Source {entry.date} ↗</a>)}</div></div></details></article>
    </section><ComparisonChartDocument chart={ACTE_UNION_DEBT_COMPARISON_CHART} /><ComparisonChartDocument chart={ACTE_UNION_POPULATION_COMPARISON_CHART} />

    <section id={ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.id} className="document-bank__candidates" aria-labelledby="official-union-act-title">
      <div className="document-bank__section-title"><p>Document approuvé · {ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.id}</p><h2 id="official-union-act-title">{ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.title}</h2><span>Source primaire législative reliée à la période 1840–1896, à la notion Acte d’Union et aux opérations intellectuelles approuvées.</span></div>
      <div><article className="document-candidate document-candidate--preferred">
        <header><div><small>Texte législatif · {ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.historicalDate}</small><h3><cite>Acte pour réunir les Provinces du Haut et du Bas-Canada et pour le Gouvernement du Canada</cite></h3><p>{ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.creator}</p></div><strong>Approuvé · v{ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.version}</strong></header>
        <section><h4>Extrait</h4><HistoricalExcerpt text={ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.transcription} attribution={ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.creator} /></section>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><div><dt>Code documentaire</dt><dd>{ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.id}</dd></div><div><dt>Référence</dt><dd>{ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.sourceLocator}</dd></div><div><dt>Connaissances associées</dt><dd>Acte d’Union (1840) · Création de la Province du Canada · Structure des institutions politiques · Contexte de l’Acte d’Union</dd></div><div><dt>Opérations suggérées</dt><dd>{ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl>
          <div className="document-candidate__assessment"><section><h4>Mise en contexte · enseignant seulement</h4><p>{ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.historicalContext}</p></section><section><h4>Intention pédagogique</h4><ul>{ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.observationGuide.slice(0, 3).map((item) => <li key={item}>{item}</li>)}</ul></section></div>
          <section><h4>Questions possibles</h4><ul>{ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <div className="document-adaptation__links"><a href={ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.sourceUrl} target="_blank" rel="noreferrer">Consulter la version numérique ↗</a><a href={ACTE_UNION_OFFICIAL_EXCERPT_DOCUMENT.assetUrl} target="_blank" rel="noreferrer">Consulter le PDF source ↗</a></div>
        </div></details>
      </article></div>
    </section>

    <section id={ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT.id} className="document-bank__candidates" aria-labelledby="executive-council-act-title">
      <div className="document-bank__section-title"><p>Document approuvé · {ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT.id}</p><h2 id="executive-council-act-title">{ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT.title}</h2><span>Extrait de l’article 45 permettant de comparer l’Acte d’Union à la recommandation de Durham sur le gouvernement responsable.</span></div>
      <div><article className="document-candidate document-candidate--preferred">
        <header><div><small>Texte législatif · {ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT.historicalDate}</small><h3><cite>Acte pour réunir les Provinces du Haut et du Bas-Canada et pour le Gouvernement du Canada</cite></h3><p>{ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT.creator}</p></div><strong>Approuvé · v{ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT.version}</strong></header>
        <section><h4>Extrait adapté pour l’élève</h4><HistoricalExcerpt text={ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT.transcription} attribution={ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT.creator} /></section>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><div><dt>Code documentaire</dt><dd>{ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT.id}</dd></div><div><dt>Référence</dt><dd>{ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT.sourceLocator}</dd></div><div><dt>Connaissances associées</dt><dd>Acte d’Union · Conseil exécutif · Gouvernement responsable</dd></div><div><dt>Opérations suggérées</dt><dd>{ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl>
          <div className="document-candidate__assessment"><section><h4>Mise en contexte · enseignant seulement</h4><p>{ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT.historicalContext}</p></section><section><h4>Intention pédagogique</h4><ul>{ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
          <section><h4>Questions possibles</h4><ul>{ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <div className="document-adaptation__links"><a href={ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT.sourceUrl} target="_blank" rel="noreferrer">Consulter la version numérique ↗</a><a href={ACTE_UNION_EXECUTIVE_COUNCIL_DOCUMENT.assetUrl} target="_blank" rel="noreferrer">Consulter le PDF source ↗</a></div>
        </div></details>
      </article></div>
    </section>

    <section className="document-bank__candidates" id={ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.id} aria-labelledby="rebellion-consequence-title">
      <div className="document-bank__section-title"><p>Document approuvé · {ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.id}</p><h2 id="rebellion-consequence-title">{ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.title}</h2><span>Une conséquence politique directe des Rébellions de 1837-1838 au Bas-Canada.</span></div>
      <div><article className="document-candidate document-candidate--preferred">
        <header><div><small>Débat parlementaire · {ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.historicalDate}</small><h3>De l’insurrection au Conseil spécial</h3><p>{ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.creator}</p></div><strong>Approuvé · v{ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.version}</strong></header>
        <section><h4>Extrait adapté pour l’élève</h4><HistoricalExcerpt text={ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.transcription} attribution={ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.creator} /></section>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><div><dt>Code documentaire</dt><dd>{ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.id}</dd></div><div><dt>Référence</dt><dd>{ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.sourceLocator}</dd></div><div><dt>Traitement éditorial</dt><dd>Traduction-adaptation française d’un passage du débat britannique de 1840.</dd></div><div><dt>Opérations suggérées</dt><dd>{ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl>
          <div className="document-candidate__assessment"><section><h4>Mise en contexte · enseignant seulement</h4><p>{ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.historicalContext}</p></section><section><h4>Intention pédagogique</h4><ul>{ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
          <section><h4>Questions possibles</h4><ul>{ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section><h4>Précautions</h4><ul>{ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <div className="document-adaptation__links"><a href={ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.sourceUrl} target="_blank" rel="noreferrer">Consulter le débat officiel ↗</a><a href={ACTE_UNION_REBELLION_CONSEQUENCE_DOCUMENT.assetUrl} target="_blank" rel="noreferrer">Consulter la transcription complémentaire ↗</a></div>
        </div></details>
      </article></div>
    </section>

    <section className="document-bank__candidates" id={ACTE_UNION_BANQ_512_PRISONERS_DOCUMENT.id} aria-labelledby="banq-prisoners-title">
      <div className="document-bank__section-title"><p>Texte de référence archivistique approuvé · {ACTE_UNION_BANQ_512_PRISONERS_DOCUMENT.id}</p><h2 id="banq-prisoners-title">{ACTE_UNION_BANQ_512_PRISONERS_DOCUMENT.title}</h2><span>BAnQ · base contemporaine fondée sur les registres d’écrou historiques de Montréal</span></div>
      <div><article className="document-candidate document-candidate--preferred">
        <header><div><small>Texte institutionnel contemporain</small><h3>L’ampleur des emprisonnements</h3><p>{ACTE_UNION_BANQ_512_PRISONERS_DOCUMENT.creator}</p></div><strong>Approuvé · v{ACTE_UNION_BANQ_512_PRISONERS_DOCUMENT.version}</strong></header>
        <section><h4>Extrait présenté à l’élève</h4><HistoricalExcerpt text={ACTE_UNION_BANQ_512_PRISONERS_DOCUMENT.transcription} attribution={ACTE_UNION_BANQ_512_PRISONERS_DOCUMENT.creator} /></section>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><div><dt>Code documentaire</dt><dd>{ACTE_UNION_BANQ_512_PRISONERS_DOCUMENT.id}</dd></div><div><dt>Référence</dt><dd>{ACTE_UNION_BANQ_512_PRISONERS_DOCUMENT.sourceLocator}</dd></div><div><dt>Nature</dt><dd>Texte de présentation contemporain fondé sur des registres historiques, et non témoignage de 1837-1838.</dd></div></dl>
          <section><h4>Mise en contexte · enseignant seulement</h4><p>{ACTE_UNION_BANQ_512_PRISONERS_DOCUMENT.historicalContext}</p></section>
          <section><h4>Précautions</h4><ul>{ACTE_UNION_BANQ_512_PRISONERS_DOCUMENT.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <div className="document-adaptation__links"><a href={ACTE_UNION_BANQ_512_PRISONERS_DOCUMENT.sourceUrl} target="_blank" rel="noreferrer">Consulter la base BAnQ ↗</a></div>
        </div></details>
      </article></div>
    </section>

    <section className="document-bank__candidates" aria-labelledby="mercury-military-movements-title">
      <div className="document-bank__section-title"><p>Source journalistique approuvée · {PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.id}</p><h2 id="mercury-military-movements-title">{PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.title}</h2><span>Document textuel indépendant · point de vue loyaliste sur la répression militaire</span></div>
      <div><article className="document-candidate document-candidate--preferred">
        <header><div><small>Article de journal · {PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.historicalDate}</small><h3>Régiments, artillerie et volontaires contre les rebelles</h3><p>{PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.creator}</p></div><strong>Approuvé · v{PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.version}</strong></header>
        <section><h4>Extrait traduit et adapté</h4><HistoricalExcerpt text={PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.transcription} attribution={PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.creator} /></section>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><div><dt>Code documentaire</dt><dd>{PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.id}</dd></div><div><dt>Notions</dt><dd>Rébellions de 1837-1838 · Acte d’Union</dd></div><div><dt>Référence</dt><dd>{PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.sourceLocator}</dd></div><div><dt>Traitement éditorial</dt><dd>Traduction-adaptation française de deux passages; les coupures sont indiquées par […]. Aucun fac-similé modifié.</dd></div><div><dt>Opérations suggérées</dt><dd>{PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl>
          <div className="document-candidate__assessment"><section><h4>Mise en contexte · enseignant seulement</h4><p>{PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.historicalContext}</p></section><section><h4>Éléments à observer</h4><ul>{PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
          <section><h4>Usages pédagogiques</h4><ul>{PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h4>Précautions</h4><ul>{PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <p><strong>Droits :</strong> {PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.rightsStatement}</p><div className="document-adaptation__links"><a href={PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.sourceUrl} target="_blank" rel="noreferrer">Consulter la notice source ↗</a><a href={PATRIOTES_MERCURY_MILITARY_MOVEMENTS_DOCUMENT.assetUrl} target="_blank" rel="noreferrer">Consulter le fac-similé original ↗</a></div>
        </div></details>
      </article></div>
    </section>

    <section id={PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.id} className="document-bank__candidates" aria-labelledby="ninety-two-resolutions-title">
      <div className="document-bank__section-title"><p>Source officielle approuvée · {PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.id}</p><h2 id="ninety-two-resolutions-title">{PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.title}</h2><span>Cause politique des Rébellions · revendications institutionnelles de la Chambre d’assemblée</span></div>
      <div><article className="document-candidate document-candidate--preferred">
        <header><div><small>Résolutions parlementaires · {PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.historicalDate}</small><h3>Rendre le Conseil législatif électif</h3><p>{PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.creator}</p></div><strong>Approuvé · v{PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.version}</strong></header>
        <section><h4>Extrait adapté des 92 Résolutions</h4><HistoricalExcerpt text={PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.transcription} attribution={PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.creator} /></section>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><div><dt>Code documentaire</dt><dd>{PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.id}</dd></div><div><dt>Notion</dt><dd>Acte d’Union · contexte des Rébellions de 1837-1838</dd></div><div><dt>Référence</dt><dd>{PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.sourceLocator}</dd></div><div><dt>Traitement éditorial</dt><dd>Assemblage des résolutions 14 et 28 en français modernisé; la coupure est indiquée par […].</dd></div><div><dt>Opérations suggérées</dt><dd>{PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl>
          <div className="document-candidate__assessment"><section><h4>Mise en contexte · enseignant seulement</h4><p>{PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.historicalContext}</p></section><section><h4>Éléments à observer</h4><ul>{PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
          <section><h4>Usages pédagogiques</h4><ul>{PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h4>Précautions</h4><ul>{PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <p><strong>Droits :</strong> {PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.rightsStatement}</p><div className="document-adaptation__links"><a href={PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.sourceUrl} target="_blank" rel="noreferrer">Consulter la notice source ↗</a><a href={PATRIOTES_NINETY_TWO_RESOLUTIONS_DOCUMENT.assetUrl} target="_blank" rel="noreferrer">Consulter le fac-similé bilingue ↗</a></div>
        </div></details>
      </article></div>
    </section>

    <section id={PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.id} className="document-bank__candidates" aria-labelledby="russell-resolutions-title">
      <div className="document-bank__section-title"><p>Source officielle approuvée · {PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.id}</p><h2 id="russell-resolutions-title">{PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.title}</h2><span>Cause immédiate des Rébellions · réponse britannique aux revendications de l’Assemblée</span></div>
      <div><article className="document-candidate document-candidate--preferred">
        <header><div><small>Résolutions parlementaires · {PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.historicalDate}</small><h3>Refus politique et contournement financier</h3><p>{PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.creator}</p></div><strong>Approuvé · v{PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.version}</strong></header>
        <section><h4>Extrait traduit et adapté des résolutions Russell</h4><HistoricalExcerpt text={PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.transcription} attribution={PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.creator} /></section>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><div><dt>Code documentaire</dt><dd>{PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.id}</dd></div><div><dt>Notion</dt><dd>Acte d’Union · contexte des Rébellions de 1837-1838</dd></div><div><dt>Référence</dt><dd>{PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.sourceLocator}</dd></div><div><dt>Traitement éditorial</dt><dd>Assemblage des résolutions 4, 5 et 8 en français simplifié; les coupures sont indiquées par […].</dd></div><div><dt>Opérations suggérées</dt><dd>{PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl>
          <div className="document-candidate__assessment"><section><h4>Mise en contexte · enseignant seulement</h4><p>{PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.historicalContext}</p></section><section><h4>Éléments à observer</h4><ul>{PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
          <section><h4>Usages pédagogiques</h4><ul>{PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h4>Précautions</h4><ul>{PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <p><strong>Droits :</strong> {PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.rightsStatement}</p><div className="document-adaptation__links"><a href={PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.sourceUrl} target="_blank" rel="noreferrer">Consulter le débat et la transcription ↗</a><a href={PATRIOTES_RUSSELL_RESOLUTIONS_DOCUMENT.assetUrl} target="_blank" rel="noreferrer">Consulter le fac-similé ↗</a></div>
        </div></details>
      </article></div>
    </section>

    <section className="document-bank__candidates" aria-labelledby="minerve-political-repression-title">
      <div className="document-bank__section-title"><p>Source journalistique approuvée · {PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.id}</p><h2 id="minerve-political-repression-title">{PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.title}</h2><span>Cause politique des Rébellions · répression de la participation aux assemblées</span></div>
      <div><article className="document-candidate document-candidate--preferred">
        <header><div><small>Article de journal · {PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.historicalDate}</small><h3>Des fonctions officielles remises en question</h3><p>{PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.creator}</p></div><strong>Approuvé · v{PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.version}</strong></header>
        <section><h4>Adaptation pédagogique assemblée</h4><HistoricalExcerpt text={PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.transcription} attribution={PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.creator} /></section>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><div><dt>Code documentaire</dt><dd>{PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.id}</dd></div><div><dt>Notion</dt><dd>Acte d’Union · contexte des Rébellions de 1837-1838</dd></div><div><dt>Référence</dt><dd>{PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.sourceLocator}</dd></div><div><dt>Traitement éditorial</dt><dd>Adaptation pédagogique assemblée de passages du même numéro; formulation simplifiée et explicitée, donc non littérale. La coupure est indiquée par […].</dd></div><div><dt>Opérations suggérées</dt><dd>{PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl>
          <div className="document-candidate__assessment"><section><h4>Mise en contexte · enseignant seulement</h4><p>{PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.historicalContext}</p></section><section><h4>Éléments à observer</h4><ul>{PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
          <section><h4>Usages pédagogiques</h4><ul>{PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h4>Précautions</h4><ul>{PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <p><strong>Droits :</strong> {PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.rightsStatement}</p><div className="document-adaptation__links"><a href={PATRIOTES_MINERVE_POLITICAL_REPRESSION_DOCUMENT.sourceUrl} target="_blank" rel="noreferrer">Consulter le numéro original dans BAnQ ↗</a></div>
        </div></details>
      </article></div>
    </section>

    <section className="document-bank__candidates" aria-labelledby="minerve-resignation-title">
      <div className="document-bank__section-title"><p>Source journalistique approuvée · {PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.id}</p><h2 id="minerve-resignation-title">{PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.title}</h2><span>Cause politique des Rébellions · rupture de confiance envers l’administration coloniale</span></div>
      <div><article className="document-candidate document-candidate--preferred">
        <header><div><small>Lettre publiée dans un journal · {PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.historicalDate}</small><h3>Un juge de paix remet sa commission</h3><p>{PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.creator}</p></div><strong>Approuvé · v{PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.version}</strong></header>
        <section><h4>Adaptation pédagogique assemblée</h4><HistoricalExcerpt text={PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.transcription} attribution={PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.creator} /></section>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><div><dt>Code documentaire</dt><dd>{PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.id}</dd></div><div><dt>Notion</dt><dd>Acte d’Union · contexte des Rébellions de 1837-1838</dd></div><div><dt>Référence</dt><dd>{PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.sourceLocator}</dd></div><div><dt>Traitement éditorial</dt><dd>Adaptation pédagogique assemblée d’une lettre reproduite dans le journal; formulation simplifiée et explicitée, donc non littérale. La coupure est indiquée par […].</dd></div><div><dt>Opérations suggérées</dt><dd>{PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl>
          <div className="document-candidate__assessment"><section><h4>Mise en contexte · enseignant seulement</h4><p>{PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.historicalContext}</p></section><section><h4>Éléments à observer</h4><ul>{PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
          <section><h4>Usages pédagogiques</h4><ul>{PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h4>Précautions</h4><ul>{PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <p><strong>Droits :</strong> {PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.rightsStatement}</p><div className="document-adaptation__links"><a href={PATRIOTES_MINERVE_RESIGNATION_DOCUMENT.sourceUrl} target="_blank" rel="noreferrer">Consulter le numéro original dans BAnQ ↗</a></div>
        </div></details>
      </article></div>
    </section>

    <section id={PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.id} className="document-bank__candidates" aria-labelledby="minerve-independence-title">
      <div className="document-bank__section-title"><p>Source journalistique approuvée · {PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.id}</p><h2 id="minerve-independence-title">{PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.title}</h2><span>Cause politique des Rébellions · le mécontentement mène à envisager une rupture avec l’Angleterre</span></div>
      <div><article className="document-candidate document-candidate--preferred">
        <header><div><small>Article de journal · {PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.historicalDate}</small><h3>De la réforme à l’idée d’indépendance</h3><p>{PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.creator}</p></div><strong>Approuvé · v{PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.version}</strong></header>
        <section><h4>Adaptation pédagogique assemblée</h4><HistoricalExcerpt text={PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.transcription} attribution={PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.creator} /></section>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><div><dt>Code documentaire</dt><dd>{PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.id}</dd></div><div><dt>Notion</dt><dd>Acte d’Union · contexte des Rébellions de 1837-1838</dd></div><div><dt>Référence</dt><dd>{PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.sourceLocator}</dd></div><div><dt>Traitement éditorial</dt><dd>Adaptation pédagogique assemblée de passages du même numéro; formulation simplifiée et explicitée, donc non littérale. La coupure est indiquée par […].</dd></div><div><dt>Opérations suggérées</dt><dd>{PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl>
          <div className="document-candidate__assessment"><section><h4>Mise en contexte · enseignant seulement</h4><p>{PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.historicalContext}</p></section><section><h4>Éléments à observer</h4><ul>{PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
          <section><h4>Usages pédagogiques</h4><ul>{PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h4>Précautions</h4><ul>{PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <p><strong>Droits :</strong> {PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.rightsStatement}</p><div className="document-adaptation__links"><a href={PATRIOTES_MINERVE_INDEPENDENCE_DOCUMENT.sourceUrl} target="_blank" rel="noreferrer">Consulter le numéro original dans BAnQ ↗</a></div>
        </div></details>
      </article></div>
    </section>

    <section className="document-bank__candidates" id={ACTE_UNION_BERMUDA_EXILE_DOCUMENT.id} aria-labelledby="bermuda-exile-title">
      <div className="document-bank__section-title"><p>Document approuvé · {ACTE_UNION_BERMUDA_EXILE_DOCUMENT.id}</p><h2 id="bermuda-exile-title">{ACTE_UNION_BERMUDA_EXILE_DOCUMENT.title}</h2><span>Une conséquence judiciaire et politique de la Rébellion de 1837.</span></div>
      <div><article className="document-candidate document-candidate--preferred">
        <header><div><small>Ordonnance officielle · {ACTE_UNION_BERMUDA_EXILE_DOCUMENT.historicalDate}</small><h3>L’exil de prisonniers politiques</h3><p>{ACTE_UNION_BERMUDA_EXILE_DOCUMENT.creator}</p></div><strong>Approuvé · v{ACTE_UNION_BERMUDA_EXILE_DOCUMENT.version}</strong></header>
        <section><h4>Contexte</h4><p>Après la Rébellion de 1837, lord Durham cherche une solution au sort des prisonniers politiques du Bas-Canada.</p><h4>Extrait adapté pour l’élève</h4><HistoricalExcerpt text={ACTE_UNION_BERMUDA_EXILE_DOCUMENT.transcription} attribution={ACTE_UNION_BERMUDA_EXILE_DOCUMENT.creator} /></section>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><div><dt>Code documentaire</dt><dd>{ACTE_UNION_BERMUDA_EXILE_DOCUMENT.id}</dd></div><div><dt>Référence</dt><dd>{ACTE_UNION_BERMUDA_EXILE_DOCUMENT.sourceLocator}</dd></div><div><dt>Traitement éditorial</dt><dd>Traduction-adaptation française d’une ordonnance officielle rédigée en anglais.</dd></div><div><dt>Opérations suggérées</dt><dd>{ACTE_UNION_BERMUDA_EXILE_DOCUMENT.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl>
          <div className="document-candidate__assessment"><section><h4>Mise en contexte · enseignant seulement</h4><p>{ACTE_UNION_BERMUDA_EXILE_DOCUMENT.historicalContext}</p></section><section><h4>Intention pédagogique</h4><ul>{ACTE_UNION_BERMUDA_EXILE_DOCUMENT.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
          <section><h4>Questions possibles</h4><ul>{ACTE_UNION_BERMUDA_EXILE_DOCUMENT.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section><h4>Précautions</h4><ul>{ACTE_UNION_BERMUDA_EXILE_DOCUMENT.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <div className="document-adaptation__links"><a href={ACTE_UNION_BERMUDA_EXILE_DOCUMENT.sourceUrl} target="_blank" rel="noreferrer">Consulter la compilation historique ↗</a><a href={ACTE_UNION_BERMUDA_EXILE_DOCUMENT.assetUrl} target="_blank" rel="noreferrer">Consulter le document numérisé ↗</a></div>
        </div></details>
      </article></div>
    </section>

    <section className="document-bank__candidates" id={ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.id} aria-labelledby="australia-deportation-title">
      <div className="document-bank__section-title"><p>Document approuvé · {ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.id}</p><h2 id="australia-deportation-title">{ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.title}</h2><span>Une peine de mort commuée en déportation pénale à l’autre bout du monde.</span></div>
      <div><article className="document-candidate document-candidate--preferred">
        <header><div><small>Déportation pénale · {ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.historicalDate}</small><h3>Du Bas-Canada à la Nouvelle-Galles du Sud</h3><p>{ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.creator}</p></div><strong>Approuvé · v{ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.version}</strong></header>
        <section><h4>Extrait adapté pour l’élève</h4><HistoricalExcerpt text={ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.transcription} attribution={ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.creator} /></section>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><div><dt>Code documentaire</dt><dd>{ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.id}</dd></div><div><dt>Référence</dt><dd>{ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.sourceLocator}</dd></div><div><dt>Traitement éditorial</dt><dd>Résumé original de Socrato fondé sur des notices institutionnelles canadiennes et australiennes.</dd></div><div><dt>Opérations suggérées</dt><dd>{ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl>
          <div className="document-candidate__assessment"><section><h4>Mise en contexte · enseignant seulement</h4><p>{ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.historicalContext}</p></section><section><h4>Intention pédagogique</h4><ul>{ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
          <section><h4>Questions possibles</h4><ul>{ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section><h4>Précautions</h4><ul>{ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <div className="document-adaptation__links"><a href={ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.sourceUrl} target="_blank" rel="noreferrer">Consulter la notice canadienne ↗</a><a href={ACTE_UNION_AUSTRALIA_DEPORTATION_DOCUMENT.assetUrl} target="_blank" rel="noreferrer">Consulter les archives australiennes ↗</a></div>
        </div></details>
      </article></div>
    </section>

    <section id={ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT.id} className="document-bank__candidates" aria-labelledby="russell-point-of-view-title">
      <div className="document-bank__section-title"><p>Document approuvé · {ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT.id}</p><h2 id="russell-point-of-view-title">{ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT.title}</h2><span>Point de vue favorable à l’Union présenté devant la Chambre des communes britannique.</span></div>
      <div><article className="document-candidate document-candidate--preferred">
        <header><div><small>Débat parlementaire · {ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT.historicalDate}</small><h3>Un argument favorable à l’union législative</h3><p>{ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT.creator}</p></div><strong>Approuvé · v{ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT.version}</strong></header>
        <section><h4>Extrait adapté pour l’élève</h4><HistoricalExcerpt text={ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT.transcription} attribution={ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT.creator} /></section>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><div><dt>Code documentaire</dt><dd>{ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT.id}</dd></div><div><dt>Référence</dt><dd>{ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT.sourceLocator}</dd></div><div><dt>Point de vue</dt><dd>Ministre britannique qui présente l’Union comme un moyen d’établir des institutions représentatives communes et de favoriser la prospérité.</dd></div><div><dt>Opérations suggérées</dt><dd>{ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl>
          <div className="document-candidate__assessment"><section><h4>Mise en contexte · enseignant seulement</h4><p>{ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT.historicalContext}</p></section><section><h4>Intention pédagogique</h4><ul>{ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
          <section><h4>Questions possibles</h4><ul>{ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section><h4>Précautions</h4><ul>{ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <div className="document-adaptation__links"><a href={ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT.sourceUrl} target="_blank" rel="noreferrer">Consulter le débat officiel ↗</a><a href={ACTE_UNION_RUSSELL_POINT_OF_VIEW_DOCUMENT.assetUrl} target="_blank" rel="noreferrer">Consulter la transcription complémentaire ↗</a></div>
        </div></details>
      </article></div>
    </section>

    <section className="document-bank__candidates" aria-labelledby="upper-canada-assembly-title">
      <div className="document-bank__section-title"><p>Document approuvé · {ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.id}</p><h2 id="upper-canada-assembly-title">{ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.title}</h2><span>Point de vue favorable à l’Union exprimé par l’Assemblée du Haut-Canada en 1839.</span></div>
      <div><article className="document-candidate document-candidate--preferred">
        <header><div><small>Résolution officielle · {ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.historicalDate}</small><h3>Une union jugée « indispensable »</h3><p>{ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.creator}</p></div><strong>Approuvé · v{ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.version}</strong></header>
        <section><h4>Extrait adapté pour l’élève</h4><HistoricalExcerpt text={ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.transcription} attribution={ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.creator} /></section>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><div><dt>Code documentaire</dt><dd>{ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.id}</dd></div><div><dt>Référence</dt><dd>{ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.sourceLocator}</dd></div><div><dt>Point de vue</dt><dd>L’Assemblée du Haut-Canada présente l’Union comme une mesure indispensable qu’il serait nuisible de retarder davantage.</dd></div><div><dt>Opérations suggérées</dt><dd>{ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl>
          <div className="document-candidate__assessment"><section><h4>Mise en contexte · enseignant seulement</h4><p>{ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.historicalContext}</p></section><section><h4>Intention pédagogique</h4><ul>{ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
          <section><h4>Questions possibles</h4><ul>{ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section><h4>Précautions</h4><ul>{ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <div className="document-adaptation__links"><a href={ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.sourceUrl} target="_blank" rel="noreferrer">Consulter le recueil numérisé ↗</a><a href={ACTE_UNION_UPPER_CANADA_ASSEMBLY_DOCUMENT.assetUrl} target="_blank" rel="noreferrer">Consulter la transcription complémentaire ↗</a></div>
        </div></details>
      </article></div>
    </section>

    <section className="document-bank__candidates" aria-labelledby="special-council-title">
      <div className="document-bank__section-title" id={ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.id}><p>Document approuvé · {ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.id}</p><h2 id="special-council-title">{ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.title}</h2><span>Point de vue institutionnel favorable à l’Union adopté au Bas-Canada avant la loi de 1840.</span></div>
      <div><article className="document-candidate document-candidate--preferred">
        <header><div><small>Résolution officielle · {ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.historicalDate}</small><h3>Une « nécessité indispensable et urgente »</h3><p>{ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.creator}</p></div><strong>Approuvé · v{ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.version}</strong></header>
        <section><h4>Extrait adapté pour l’élève</h4><HistoricalExcerpt text={ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.transcription} attribution={ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.creator} /></section>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><div><dt>Code documentaire</dt><dd>{ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.id}</dd></div><div><dt>Référence</dt><dd>{ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.sourceLocator}</dd></div><div><dt>Point de vue</dt><dd>Conseil nommé qui présente l’Union comme une réponse urgente aux problèmes politiques du Bas-Canada.</dd></div><div><dt>Opérations suggérées</dt><dd>{ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl>
          <div className="document-candidate__assessment"><section><h4>Mise en contexte · enseignant seulement</h4><p>{ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.historicalContext}</p></section><section><h4>Intention pédagogique</h4><ul>{ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
          <section><h4>Questions possibles</h4><ul>{ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section><h4>Précautions</h4><ul>{ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <div className="document-adaptation__links"><a href={ACTE_UNION_SPECIAL_COUNCIL_RESOLUTIONS_DOCUMENT.sourceUrl} target="_blank" rel="noreferrer">Consulter les journaux numérisés ↗</a></div>
        </div></details>
      </article></div>
    </section>

    <section id={ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.id} className="document-bank__candidates" aria-labelledby="lafontaine-document-title">
      <div className="document-bank__section-title"><p>Document approuvé · {ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.id}</p><h2 id="lafontaine-document-title">{ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.title}</h2><span>Point de vue opposé à l’Union publié dans L’Aurore des Canadas le 28 août 1840.</span></div>
      <div><article className="document-candidate document-candidate--preferred">
        <header><div><small>Adresse politique · {ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.historicalDate}</small><h3><cite>Adresse aux électeurs du comté de Terrebonne</cite></h3><p>{ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.creator} · <cite>L’Aurore des Canadas</cite></p></div><strong>Approuvé · v{ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.version}</strong></header>
        <section><h4>Extrait</h4>{ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.transcription.split("\n\n").map((paragraph) => <HistoricalExcerpt key={paragraph} text={paragraph} attribution={ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.creator} />)}</section>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><div><dt>Référence</dt><dd>{ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.sourceLocator}</dd></div><div><dt>Notion</dt><dd>Acte d’Union · 1840–1896</dd></div></dl>
          <div className="document-candidate__assessment"><section><h4>Contexte et point de vue</h4><p>{ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.historicalContext}</p><p>La Fontaine s’oppose à l’Acte d’Union et cherche à convaincre les électeurs qu’il a été imposé au Bas-Canada, tout en dénonçant ses injustices politiques, linguistiques et financières.</p></section><section><h4>Éléments à relever</h4><ul>{ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
          <section><h4>Usages pédagogiques</h4><ul>{ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section><h4>Traitement éditorial</h4><ul>{ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <div className="document-adaptation__links"><a href={ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.sourceUrl} target="_blank" rel="noreferrer">Consulter la collection de L’Aurore des Canadas ↗</a><a href={ACTE_UNION_LAFONTAINE_DOCUMENT_DRAFT.assetUrl} target="_blank" rel="noreferrer">Consulter l’édition de référence ↗</a></div>
        </div></details>
      </article></div>
    </section>

    <section id={ACTE_UNION_LANGUAGE_ARTICLE_DOCUMENT.id} className="document-bank__candidates" aria-labelledby="language-article-title">
      <div className="document-bank__section-title"><p>Document approuvé · {ACTE_UNION_LANGUAGE_ARTICLE_DOCUMENT.id}</p><h2 id="language-article-title">{ACTE_UNION_LANGUAGE_ARTICLE_DOCUMENT.title}</h2><span>Article 41 · adaptation pédagogique assemblée par Socrato</span></div>
      <div><article className="document-candidate document-candidate--preferred">
        <header><div><small>Texte législatif · {ACTE_UNION_LANGUAGE_ARTICLE_DOCUMENT.historicalDate}</small><h3>La langue des documents officiels</h3><p>{ACTE_UNION_LANGUAGE_ARTICLE_DOCUMENT.creator}</p></div><strong>Approuvé · v{ACTE_UNION_LANGUAGE_ARTICLE_DOCUMENT.version}</strong></header>
        <section><h4>Adaptation pédagogique assemblée</h4>{ACTE_UNION_LANGUAGE_ARTICLE_DOCUMENT.transcription.split("\n\n").map((paragraph) => <HistoricalExcerpt key={paragraph} text={paragraph} attribution="Adaptation pédagogique assemblée par Socrato" />)}</section>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div><dl><div><dt>Code documentaire</dt><dd>{ACTE_UNION_LANGUAGE_ARTICLE_DOCUMENT.id}</dd></div><div><dt>Référence</dt><dd>{ACTE_UNION_LANGUAGE_ARTICLE_DOCUMENT.sourceLocator}</dd></div></dl><div className="document-candidate__assessment"><section><h4>Contexte</h4><p>{ACTE_UNION_LANGUAGE_ARTICLE_DOCUMENT.historicalContext}</p></section><section><h4>Éléments à relever</h4><ul>{ACTE_UNION_LANGUAGE_ARTICLE_DOCUMENT.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section></div><section><h4>Précautions</h4><ul>{ACTE_UNION_LANGUAGE_ARTICLE_DOCUMENT.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section><div className="document-adaptation__links"><a href={ACTE_UNION_LANGUAGE_ARTICLE_DOCUMENT.sourceUrl} target="_blank" rel="noreferrer">Consulter la transcription officielle ↗</a><a href={ACTE_UNION_LANGUAGE_ARTICLE_DOCUMENT.assetUrl} target="_blank" rel="noreferrer">Consulter le document original ↗</a></div></div></details>
      </article></div>
    </section>

    <section className="document-bank__candidates" aria-labelledby="language-repeal-title">
      <div className="document-bank__section-title"><p>Document approuvé · {ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.id}</p><h2 id="language-repeal-title">{ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.title}</h2><span>Une modification de 1848 qui permet d’étudier un changement linguistique sous le régime de l’Union.</span></div>
      <div><article className="document-candidate document-candidate--preferred">
        <header><div><small>Texte législatif · {ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.historicalDate}</small><h3>La restriction linguistique de 1840 est abrogée</h3><p>{ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.creator}</p></div><strong>Approuvé · v{ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.version}</strong></header>
        <section><h4>Extrait adapté pour l’élève</h4><HistoricalExcerpt text={ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.transcription} attribution={ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.creator} /></section>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><div><dt>Code documentaire</dt><dd>{ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.id}</dd></div><div><dt>Référence</dt><dd>{ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.sourceLocator}</dd></div><div><dt>Changement observé</dt><dd>La disposition exigeant l’emploi exclusif de l’anglais dans les documents parlementaires est abrogée.</dd></div><div><dt>Opérations suggérées</dt><dd>{ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl>
          <div className="document-candidate__assessment"><section><h4>Mise en contexte · enseignant seulement</h4><p>{ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.historicalContext}</p></section><section><h4>Intention pédagogique</h4><ul>{ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
          <section><h4>Questions possibles</h4><ul>{ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section><h4>Précautions</h4><ul>{ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <div className="document-adaptation__links"><a href={ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.sourceUrl} target="_blank" rel="noreferrer">Consulter la transcription ↗</a><a href={ACTE_UNION_LANGUAGE_REPEAL_DOCUMENT.assetUrl} target="_blank" rel="noreferrer">Consulter le document original ↗</a></div>
        </div></details>
      </article></div>
    </section>

    <section id={ACTE_UNION_DURHAM_DOCUMENT.id} className="document-bank__durham" aria-labelledby="durham-document-title">
      <div className="document-bank__section-title"><p>Source canonique et présentations élèves approuvées</p><h2 id="durham-document-title">{ACTE_UNION_DURHAM_DOCUMENT.title}</h2><span>Les six textes approuvés sont rattachés à un seul document historique. Chaque carte possède son propre objectif, ses pages sources et ses précautions.</span></div>
      <article className="durham-source-record">
        <header><div><small>Rapport officiel · {ACTE_UNION_DURHAM_DOCUMENT.historicalDate}</small><h3>{ACTE_UNION_DURHAM_DOCUMENT.creator}</h3></div><strong>Approuvé · v{ACTE_UNION_DURHAM_DOCUMENT.version}</strong></header>
        <details className="document-verification-details"><summary>Détails de la source</summary><div>
          <dl><div><dt>Provenance</dt><dd>{ACTE_UNION_DURHAM_DOCUMENT.holdingInstitution}</dd></div><div><dt>Passages retenus</dt><dd>{ACTE_UNION_DURHAM_DOCUMENT.sourceLocator}</dd></div><div><dt>Droits</dt><dd>{ACTE_UNION_DURHAM_DOCUMENT.rightsStatement}</dd></div></dl>
          <p>{ACTE_UNION_DURHAM_DOCUMENT.historicalContext}</p>
          <div><a href={ACTE_UNION_DURHAM_DOCUMENT.sourceUrl} target="_blank" rel="noreferrer">Consulter l’exemplaire Canadiana ↗</a><a href={ACTE_UNION_DURHAM_DOCUMENT.assetUrl} target="_blank" rel="noreferrer">Consulter l’exemplaire de 1839 ↗</a></div>
        </div></details>
      </article>
      <div className="durham-presentations">{ACTE_UNION_DURHAM_PRESENTATIONS.map((presentation, index) => <article className="durham-presentation" id={presentation.id} key={presentation.id}>
        <header><div><small>Présentation élève {index + 1} sur {ACTE_UNION_DURHAM_PRESENTATIONS.length}</small><h3>{presentation.title}</h3><p>{presentation.sourceSegmentLocators.join(" · ")} · {presentation.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</p></div><strong>Approuvé · v{presentation.version}</strong></header>
        <DurhamStudentCardPreview presentation={presentation} number={index + 1} />
        <details className="document-verification-details"><summary>Détails de vérification</summary><div className="durham-presentation__pedagogy">
          <section><h4>Contexte et point de vue</h4><p>{presentation.historicalContext}</p><p><strong>Point de vue :</strong> {presentation.pointOfView}</p></section>
          <section><h4>À faire observer</h4><ul>{presentation.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section><h4>Précautions</h4><ul>{presentation.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section><h4>Usages pédagogiques</h4><ul>{presentation.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section>
        </div></details>
      </article>)}</div>
    </section>

    </>}

    {notionId === "gouvernement-responsable" && <>
    <section className="document-bank__text-documents" aria-labelledby="responsible-government-electoral-law-title">
      <div className="document-bank__section-title"><p>Notion · Gouvernement responsable</p><h2 id="responsible-government-electoral-law-title">Documents textuels</h2></div>
      <article className="student-document-preview"><p className="student-document-preview__label">Aperçu exact du contenu de la carte élève</p><div className="student-document-preview__card">
        <h4><strong>{RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_PRESENTATION.title}</strong><span aria-hidden="true"> · </span><small>{RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_PRESENTATION.typeLabel}</small></h4>
        <div className="student-document-preview__excerpt"><blockquote>« {RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_PRESENTATION.studentText} »</blockquote><cite>{RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_PRESENTATION.authorLabel} · {RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_PRESENTATION.dateLabel}</cite></div>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><dt>Code documentaire</dt><dd>{RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT.id}</dd><dt>Document original</dt><dd>{RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_PRESENTATION.originalDocumentLabel}</dd><dt>Passages utilisés</dt><dd>{RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_PRESENTATION.sourceSegmentLocators.join(" · ")}</dd><dt>Référence</dt><dd>{RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT.sourceLocator}</dd><dt>Opérations suggérées</dt><dd>{RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></dl>
          <section><h4>Mise en contexte</h4><p>{RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT.historicalContext}</p></section><section><h4>Note éditoriale</h4><p>{RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_PRESENTATION.editorialNote}</p></section>
          <div className="document-candidate__assessment"><section><h4>Éléments à observer</h4><ul>{RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h4>Questions et usages possibles</h4><ul>{RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
          <section><h4>Précautions</h4><ul>{RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section><p><strong>Droits :</strong> {RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT.rightsStatement}</p><div className="document-adaptation__links"><a href={RESPONSIBLE_GOVERNMENT_ELECTORAL_LAW_DOCUMENT.assetUrl} target="_blank" rel="noreferrer">Consulter la loi originale ↗</a></div>
        </div></details>
      </div></article>
    </section>
    <section className="document-bank__iconography" aria-labelledby="responsible-government-iconography-title">
      <div className="document-bank__section-title"><p>Notion · Gouvernement responsable</p><h2 id="responsible-government-iconography-title">Documents iconographiques</h2><span>Cinq sources visuelles pour interpréter les appuis, les critiques, les acteurs et les tensions liés au gouvernement responsable.</span></div>
      <div className="iconographic-document-grid">{RESPONSIBLE_GOVERNMENT_ICONOGRAPHIC_DOCUMENTS.map((document) => <article className="iconographic-document-card" key={document.id}>
        <header><div><small>Document iconographique · {document.historicalDate}</small><h3>{document.title}</h3><p>{document.creator}</p></div><strong>À valider · v{document.version}</strong></header>
        <figure className={document.previewAssetUrls.length > 1 ? "iconographic-document-card__visual iconographic-document-card__visual--pair" : "iconographic-document-card__visual"}>
          <div>{document.previewAssetUrls.map((url, index) => <Image key={url} src={url} alt={document.previewAssetUrls.length > 1 ? index === 0 ? "Portrait de Louis-Hippolyte La Fontaine" : "Portrait de Robert Baldwin" : document.accessibleDescription} width={900} height={700} unoptimized />)}</div>
          <figcaption>{document.imageCredit}</figcaption>
        </figure>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><div><dt>Code documentaire</dt><dd>{document.id}</dd></div><div><dt>Notion</dt><dd>Gouvernement responsable · 1840–1896</dd></div><div><dt>Référence</dt><dd>{document.sourceLocator}</dd></div><div><dt>Opérations suggérées</dt><dd>{document.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl>
          <div className="document-candidate__assessment"><section><h4>Mise en contexte</h4><p>{document.historicalContext}</p></section><section><h4>Éléments à observer</h4><ul>{document.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
          <section><h4>Questions et usages possibles</h4><ul>{document.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <section><h4>Précautions</h4><ul>{document.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <p><strong>Droits :</strong> {document.rightsStatement}</p><div className="document-adaptation__links"><a href={document.sourceUrl} target="_blank" rel="noreferrer">Consulter la notice source ↗</a></div>
        </div></details>
      </article>)}</div>
    </section></>}

    {(notionId === "rebellions-1837-1838" || notionId === "acte-union") && PATRIOTES_ICONOGRAPHIC_DOCUMENTS.map((document) => <section className="document-bank__iconography" aria-labelledby={`patriotes-iconography-title-${document.id}`} key={document.id}>
      <div className="document-bank__section-title"><p>Document iconographique indépendant · {document.id}</p><h2 id={`patriotes-iconography-title-${document.id}`}>{document.title}</h2><span>Notions · Rébellions de 1837-1838 · Acte d’Union</span></div>
      <div className="iconographic-document-grid"><article className="iconographic-document-card">
        <header><div><small>Document iconographique · {document.historicalDate}</small><h3>{document.title}</h3><p>{document.creator}</p></div><strong>Droits vérifiés</strong></header>
        <figure className="iconographic-document-card__visual"><div><Image src={document.assetUrl} alt={document.accessibleDescription} width={1200} height={800} unoptimized /></div><figcaption>{document.imageCredit}</figcaption></figure>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div>
          <dl><div><dt>Code documentaire</dt><dd>{document.id}</dd></div><div><dt>Notions</dt><dd>Rébellions de 1837-1838 · Acte d’Union</dd></div><div><dt>Référence</dt><dd>{document.sourceLocator}</dd></div><div><dt>Opérations suggérées</dt><dd>{document.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl>
          <div className="document-candidate__assessment"><section><h4>Mise en contexte</h4><p>{document.historicalContext}</p></section><section><h4>Éléments à observer</h4><ul>{document.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section></div>
          <section><h4>Usages pédagogiques</h4><ul>{document.pedagogicalUses.map((item) => <li key={item}>{item}</li>)}</ul></section><section><h4>Précautions</h4><ul>{document.interpretationCautions.map((item) => <li key={item}>{item}</li>)}</ul></section>
          <p><strong>Droits :</strong> {document.rightsStatement}</p><div className="document-adaptation__links"><a href={document.sourceUrl} target="_blank" rel="noreferrer">Consulter la notice et les droits ↗</a></div>
        </div></details>
      </article></div>
    </section>)}

    {notionId === "acte-union" && <section id={ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM.id} className="document-bank__political-structure" aria-labelledby="acte-union-structure-title">
      <div className="document-bank__section-title"><p>Document schématique approuvé · {ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM.id}</p><h2 id="acte-union-structure-title">{ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM.title}</h2><span>Une lecture simplifiée de la structure initiale de 1841, adaptée aux élèves de quatrième secondaire.</span></div>
      <article className="political-structure-card">
        <header><div><small>Schéma original Socrato · {ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM.historicalDate}</small><h3>Qui nomme? Qui élit? Qui adopte les lois?</h3></div><strong>Prêt pour les cartes élèves</strong></header>
        <div className="political-structure-diagram" role="img" aria-label="Schéma de la structure politique de l’Acte d’Union : la Couronne nomme le gouverneur; le gouverneur nomme les conseils; les électeurs du Canada-Est et du Canada-Ouest élisent une Assemblée commune de 84 députés; les projets de loi doivent être adoptés puis sanctionnés.">
          <div className="structure-node structure-node--crown"><small>Autorité impériale</small><strong>Couronne et Parlement britannique</strong><span>Adoptent l’Acte d’Union</span></div><div className="structure-arrow">nomme ↓</div>
          <div className="structure-node structure-node--governor"><small>Pouvoir exécutif</small><strong>Gouverneur général</strong><span>Nomme les conseils · sanctionne ou réserve les lois</span></div><div className="structure-arrow">nomme et consulte ↓</div>
          <div className="structure-councils"><div className="structure-node"><small>Nommé</small><strong>Conseil exécutif</strong><span>Conseille le gouverneur et administre</span></div><div className="structure-node"><small>Nommé</small><strong>Conseil législatif</strong><span>Étudie et adopte les projets de loi</span></div></div>
          <div className="structure-arrow">projets de loi ↕</div><div className="structure-node structure-node--assembly"><small>Élue</small><strong>Assemblée législative · 84 députés</strong><span>Débat, vote les lois et les taxes</span><div><b>Canada-Ouest · 42</b><b>Canada-Est · 42</b></div></div><div className="structure-arrow">élisent ↑</div>
          <div className="structure-node structure-node--voters"><strong>Électeurs admissibles</strong></div>
        </div>
        <aside className="structure-key-message"><strong>À retenir</strong><p>L’Assemblée est élue, mais le gouverneur choisit encore les membres de l’exécutif. En 1841, l’Acte d’Union ne garantit donc pas encore le gouvernement responsable.</p></aside>
        <details className="document-verification-details"><summary>Détails de vérification</summary><div><dl><div><dt>Référence</dt><dd>{ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM.sourceLocator}</dd></div><div><dt>Droits</dt><dd>{ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM.rightsStatement}</dd></div><div><dt>Opérations suggérées</dt><dd>{ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM.operationIds.map((id) => getIntellectualOperation(id).officialLabel).join(" · ")}</dd></div></dl><p>{ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM.historicalContext}</p><section><h4>Éléments à observer</h4><ul>{ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM.observationGuide.map((item) => <li key={item}>{item}</li>)}</ul></section><div className="document-adaptation__links"><a href={ACTE_UNION_POLITICAL_STRUCTURE_DIAGRAM.sourceUrl} target="_blank" rel="noreferrer">Consulter l’Acte d’Union ↗</a></div></div></details>
      </article>
    </section>}

    {notionId === "acte-union" && <aside className="document-bank__next"><strong>Prochaine étape</strong><p>Obtenir et transcrire les 29 pages du tableau d’André Jobin avant de produire une présentation élève.</p></aside>}
  </main>;
}

export default function HistoricalDocumentsAdministrationPage() {
  return <main className="reference-admin document-bank">
    <header className="reference-admin__header"><div><p>Administration · Référentiel pédagogique</p><h1>Banque de documents historiques</h1><span>Choisir une période, puis une notion historique</span></div><div className="reference-admin__header-actions"><Link href="/admin/pedagogical-reference">Retour au référentiel</Link><Link href="/teacher">Espace enseignant</Link></div></header>
    <section className="document-bank__periods" aria-labelledby="periods-title"><div className="document-bank__section-title"><p>Classement principal</p><h2 id="periods-title">Par période et par notion</h2></div><div className="document-period-grid">{SECONDARY_FOUR_PERIODS.map((period) => <details className="document-period" key={period.id}><summary><span>{period.officialOrder}</span><div><h3>{period.officialPeriodLabel}</h3><p>{period.officialSocialReality}</p></div><span className="document-period__toggle" aria-hidden="true" /></summary><div className="document-period__notions">{period.knowledgeHeadings.map((heading) => <Link className={heading.id === "acte-union" || heading.id === "gouvernement-responsable" ? "is-active" : ""} href={`/admin/pedagogical-reference/documents/${heading.id}`} key={heading.id}>{heading.officialLabel}</Link>)}</div></details>)}</div></section>
    <section className="document-bank__additional-notions"><div className="document-bank__section-title"><p>Corpus complémentaire</p><h2>Autres notions documentées</h2></div><Link className="document-notion-link" href="/admin/pedagogical-reference/documents/rebellions-1837-1838"><strong>Rébellions de 1837-1838</strong><span>3 documents iconographiques →</span></Link></section>
  </main>;
}

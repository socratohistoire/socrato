import Link from "next/link";
import { SECONDARY_FOUR_PERIODS } from "@/lib/pedagogical-reference";
import "./pedagogical-reference.css";

export default function PedagogicalReferenceAdministrationPage() {
  return <main className="reference-admin reference-home">
    <header className="reference-admin__header">
      <div><p>Administration</p><h1>Référentiel pédagogique</h1><span>Choisir une période, puis une notion historique</span></div>
      <div className="reference-admin__header-actions"><Link href="/admin/pedagogical-reference/questions">Banque de questions</Link><Link href="/teacher">Espace enseignant</Link></div>
    </header>
    <section className="reference-periods" aria-labelledby="reference-periods-title">
      <div className="reference-periods__intro"><p>Histoire du Québec et du Canada · 4e secondaire</p><h2 id="reference-periods-title">Les quatre périodes historiques</h2><span>Chaque notion ouvre un dossier structuré de la même façon.</span></div>
      <div className="reference-period-grid">{SECONDARY_FOUR_PERIODS.map((period) => <details className="reference-period" key={period.id} open={period.officialOrder === 1}>
        <summary><span>{period.officialOrder}</span><div><h3>{period.officialPeriodLabel}</h3><p>{period.officialSocialReality}</p></div><i aria-hidden="true" /></summary>
        <div className="reference-period__notions">{period.id === "1840-1896" ? <Link className="reference-period__transversal" href="/admin/pedagogical-reference/periods/1840-1896"><strong>1840-1896</strong><span>Chronologies et questions transversales →</span></Link> : null}{period.knowledgeHeadings.map((heading) => <Link href={`/admin/pedagogical-reference/notions/${heading.id}`} key={heading.id}>{heading.officialLabel}<span>Ouvrir le dossier →</span></Link>)}</div>
      </details>)}</div>
    </section>
  </main>;
}

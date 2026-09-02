import Image from "next/image";
import Link from "next/link";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { INTELLECTUAL_OPERATIONS } from "@/lib/pedagogical-reference/intellectual-operations";
import { listStoredTeacherGroups } from "@/lib/server/teacher-groups";
import { getStoredTeacherStudentDetail } from "@/lib/server/teacher-groups";
import "./intellectual-operations.css";

export const dynamic = "force-dynamic";

export default async function IntellectualOperationsPage({ searchParams }: { searchParams: Promise<{ student?: string; group?: string }> }) {
  const teacher = await requireTeacherActor();
  const requested = await searchParams;
  const safeTarget = requested.student && requested.group && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(requested.student) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(requested.group);
  const [groups, targetStudent] = await Promise.all([
    listStoredTeacherGroups(teacher.id),
    safeTarget ? getStoredTeacherStudentDetail(teacher, requested.group!, requested.student!) : Promise.resolve(null),
  ]);
  return <main className="operation-learning-page">
    <aside className="operation-learning-sidebar" aria-label="Navigation enseignante">
      <Link href="/teacher" className="operation-learning-brand"><Image src="/logos/socrato-logo-blanc-recadre.png" alt="Logo Socrato" width={42} height={42} unoptimized/><strong>SOCRATO</strong><small>Espace enseignant</small></Link>
      <nav aria-label="Navigation principale">
        <Link href="/teacher">Espace enseignant <span>→</span></Link>
        <Link href="/teacher/activities/new">Créer une activité <span>→</span></Link>
        <Link className="is-current" href="/teacher/activities/intellectual-operations" aria-current="page">Comprendre les opérations <span>→</span></Link>
      </nav>
    </aside>
    <section className="operation-learning-content">
      <header><p>Parcours guidés par Socrato</p><h1>Comprendre les opérations intellectuelles</h1><span>Choisissez l’opération que les élèves apprendront dans une conversation socratique, puis assignez l’activité au groupe désiré.</span></header>
      <form className="operation-assignment-form" action="/teacher/activities/new" method="get">
        <input type="hidden" name="understand" value="causes_and_consequences" />
        {targetStudent ? <><input type="hidden" name="consolidationStudent" value={targetStudent.id}/><input type="hidden" name="consolidationGroup" value={targetStudent.groupId}/></> : null}
        <section className="operation-group-card" aria-labelledby="operation-group-title">
          <div><span className="operation-group-icon" aria-hidden="true">♙</span><div><h2 id="operation-group-title">{targetStudent ? "À quel élève s’adresse l’activité?" : "À quels groupes s’adresse l’activité?"}</h2><p>{targetStudent ? "Ce guidage sera assigné uniquement à l’élève sélectionné." : "Sélectionnez les groupes avant de préparer l’assignation."}</p></div></div>
          {targetStudent ? <div className="operation-target-student"><strong>{targetStudent.displayLabel}</strong><span>{targetStudent.groupName}</span></div> : groups.length > 0 ? <fieldset><legend className="sr-only">Groupes à cibler</legend>{groups.map((group) => <label key={group.id}><input type="checkbox" name="groups" value={group.id} defaultChecked/><span>{group.name}</span><small>{group.studentCount} élève{group.studentCount > 1 ? "s" : ""}</small></label>)}</fieldset> : <p className="operation-no-groups">Créez d’abord un groupe dans l’espace enseignant.</p>}
        </section>
        <header className="operation-list-heading"><p>Choisir un parcours</p><h2>Opérations intellectuelles à travailler</h2></header>
        <div className="operation-learning-grid">
        {INTELLECTUAL_OPERATIONS.map((operation) => {
          const available = operation.id === "causes_and_consequences";
          return <article key={operation.id} className={available ? "is-available" : "is-upcoming"}>
            <span className="operation-number">{operation.officialOrder}</span>
            <div><h2>{operation.officialLabel}</h2><p>{operation.conciseDescription}</p></div>
            {available ? <><p className="operation-example"><strong>Situation historique :</strong> les Rébellions des Patriotes de 1837-1838.</p><button className="operation-assign" type="submit" disabled={!targetStudent && groups.length === 0}>{targetStudent ? `Assigner ce guidage à ${targetStudent.displayLabel}` : "Assigner une activité de compréhension"} <span>→</span></button></> : <span className="operation-upcoming">Parcours à venir</span>}
          </article>;
        })}
        </div>
      </form>
    </section>
  </main>;
}

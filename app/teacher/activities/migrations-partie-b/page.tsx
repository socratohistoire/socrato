import { MigrationsPartieB } from "@/app/components/migrations-partie-b";
import { requireTeacherActor } from "@/lib/authentication/teacher-session";
import { MIGRATIONS_SCHEMA_FIELDS } from "@/lib/migrations-partie-b";
import { MIGRATIONS_CORRECTION, MIGRATIONS_DOCUMENT_FEEDBACK } from "@/lib/migrations-partie-b-correction";

export const dynamic = "force-dynamic";
export const metadata = { title: "Modèle d’activité — Migrations | Socrato" };

export default async function MigrationsTeacherPage() {
  const teacher = await requireTeacherActor();
  return <MigrationsPartieB teacherMode storageScope={`teacher-${teacher.id}`}>
    <section className="partieb-correction" aria-labelledby="migrations-teacher-correction-title">
      <h2 id="migrations-teacher-correction-title">Corrigé et critères de correction - espace enseignant</h2>
      <p>Attribuez 2 points à l’objet, puis jusqu’à 3 points à chacune des deux mises en relation selon la grille. Les quatre précisions ne valent pas chacune un point indépendant : la qualité de l’élément central détermine le résultat de la branche. N’attribuez aucun point supplémentaire au classement des documents.</p>
      <dl>{MIGRATIONS_SCHEMA_FIELDS.map(({ id, prompt }) => {
        const correction = MIGRATIONS_CORRECTION[id];
        return <div key={id}>
          <dt>{prompt}</dt>
          <dd><p>{correction.answer}</p><p><strong>Critères :</strong> {correction.criteria}</p>{correction.documents.length ? <p>Appui documentaire : {correction.documents.map((number) => `document ${number}`).join(", ")}.</p> : null}</dd>
        </div>;
      })}</dl>
      <h3>Rôle des documents</h3>
      <p>Les connaissances enseignées complètent le dossier. Le même document peut appuyer plusieurs cases. Les documents 1, 6 et 10 sont liés à l’histoire des transports, des migrations ou de la population, mais ne répondent pas aux cases précises de ce schéma.</p>
      <ul>{Object.entries(MIGRATIONS_DOCUMENT_FEEDBACK).map(([number, feedback]) => <li key={number}><strong>Document {number} - {feedback.useful ? "pertinent" : "à écarter pour ce schéma"} :</strong> {feedback.explanation}</li>)}</ul>
      <p>Cette évaluation cible l’émigration et l’immigration. L’exode rural peut faire l’objet d’une autre évaluation; il n’est pas nécessaire d’évaluer toutes les précisions de la notion dans un seul schéma.</p>
    </section>
  </MigrationsPartieB>;
}

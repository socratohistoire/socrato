import Link from "next/link";
import { getSocratoDatabase } from "@/lib/server/database";
import { requireAdminActor, type TeacherAccessRole } from "@/lib/authentication/teacher-access";
import { revokeTeacherAccess, saveTeacherAccess } from "./actions";
import "./teachers.css";

export const dynamic = "force-dynamic";

export default async function TeachersAdminPage() {
  const actor = await requireAdminActor();
  const sql = getSocratoDatabase();
  const teachers = await sql<{ email: string; role: TeacherAccessRole; active: boolean }[]>`select email, role, active from socrato.teacher_access_grants order by email`;
  return <main className="teachers-admin"><section><header><div><p>Administration Socrato</p><h1>Accès des enseignants</h1><span>Autorisez les collègues qui pourront recevoir un lien de connexion.</span></div><nav><Link href="/admin/pedagogical-reference">Référentiel</Link><Link href="/teacher">Mon espace enseignant</Link></nav></header>
    <form className="teacher-access-form" action={saveTeacherAccess}><label>Adresse courriel<input name="email" type="email" required placeholder="prenom.nom@ecole.ca" /></label><label>Rôle<select name="role" defaultValue="teacher"><option value="teacher">Enseignant</option><option value="admin">Administrateur</option></select></label><button type="submit">Autoriser cette personne</button></form>
    <div className="teacher-access-list"><h2>Personnes autorisées</h2>{teachers.length ? <ul>{teachers.map((teacher) => <li key={teacher.email}><div><strong>{teacher.email}</strong><span>{teacher.role === "admin" ? "Administration" : "Enseignement"} · {teacher.active ? "Accès actif" : "Accès retiré"}</span></div>{teacher.active && teacher.email !== actor.email?.toLowerCase() ? <form action={revokeTeacherAccess}><input type="hidden" name="email" value={teacher.email}/><button type="submit">Retirer l’accès</button></form> : null}</li>)}</ul> : <p>Aucun autre enseignant n’a encore été ajouté.</p>}</div>
  </section></main>;
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { addStudentToGroup, regenerateGroupAccessCodes, type AddedStudentCode, type RegeneratedStudentCode } from "../../access-code-actions";
import "./group-access-codes.css";

export function GroupAccessCodesView({ groupId, groupName, students }: { groupId: string; groupName: string; students: { alias: string; code: string | null }[] }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [addedStudent, setAddedStudent] = useState<AddedStudentCode | null>(null);
  const [generatedCodes, setGeneratedCodes] = useState<RegeneratedStudentCode[]>([]);
  async function addStudent() {
    setPending(true); setError(""); setAddedStudent(null);
    const result = await addStudentToGroup(groupId, firstName, familyName);
    setPending(false);
    if (!result.ok) { setError(result.error); return; }
    setAddedStudent(result.student); setFirstName(""); setFamilyName(""); setAdding(false);
  }
  async function regenerateAll() {
    if (!window.confirm("Tous les codes d’accès actuels seront définitivement désactivés et remplacés. Les élèves devront utiliser les nouveaux codes. Voulez-vous vraiment continuer?")) return;
    setPending(true); setError("");
    const result = await regenerateGroupAccessCodes(groupId);
    setPending(false);
    if (!result.ok) { setError(result.error); return; }
    setGeneratedCodes(result.generatedCodes);
  }
  return <main className="group-codes-page">
    <section className="group-codes-card" aria-labelledby="group-codes-title">
      <Link className="group-codes-back" href={`/teacher/groups/${encodeURIComponent(groupId)}`}>← Retour au groupe</Link>
      <p className="group-codes-eyebrow">Codes d’accès élèves</p>
      <h1 id="group-codes-title">{groupName}</h1>
      <button className="group-codes-secondary group-codes-add" type="button" onClick={() => setAdding((value) => !value)}>{adding ? "Annuler" : "+ Ajouter un élève"}</button>
      {adding ? <div className="group-codes-add-form"><label>Prénom<input value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="off" /></label><label>Nom de famille<input value={familyName} onChange={(event) => setFamilyName(event.target.value)} autoComplete="off" /></label><button className="group-codes-primary" type="button" disabled={pending || !firstName.trim() || !familyName.trim()} onClick={() => void addStudent()}>{pending ? "Ajout…" : "Ajouter et créer son code"}</button></div> : null}
      {addedStudent ? <div className="group-codes-success" role="status"><strong>{addedStudent.alias} a été ajouté.</strong><p>Son code d’accès est <b>{addedStudent.code}</b>. Notez-le maintenant : il ne sera plus affiché après avoir quitté cette page.</p></div> : null}
      {error ? <p className="group-codes-error" role="alert">{error}</p> : null}
      <p className="group-codes-intro">Ce groupe compte actuellement {students.length} élèves. L’ajout d’un élève ne modifie jamais les codes d’accès déjà attribués.</p>
      <div className="group-codes-list" aria-label="Codes d’accès du groupe">{students.map(({ alias, code }) => { const generated = generatedCodes.find((item) => item.alias === alias); return <p key={alias}><span>{alias}</span><strong>{generated?.code ?? (addedStudent?.alias === alias ? addedStudent.code : code ?? "À remplacer une dernière fois")}</strong></p>; })}</div>
      {students.some(({ code }) => !code) && !generatedCodes.length ? <p className="group-codes-security-note">Les codes créés avant cette mise à jour ne peuvent pas être reconstruits. Remplacez-les une dernière fois; les nouveaux resteront ensuite consultables ici.</p> : null}
      <div className="group-codes-regenerate"><h2>Remplacer tous les codes</h2><p>Cette action désactive les codes actuels de tous les élèves et en crée de nouveaux.</p><button className="group-codes-danger" type="button" disabled={pending} onClick={() => void regenerateAll()}>{pending ? "Régénération…" : "Générer de nouveaux codes d’accès"}</button></div>
    </section>
  </main>;
}

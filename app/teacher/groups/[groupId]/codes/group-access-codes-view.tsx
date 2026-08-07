"use client";

import Link from "next/link";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useState } from "react";
import { regenerateGroupAccessCodes, type RegeneratedStudentCode } from "../../access-code-actions";
import "./group-access-codes.css";

async function downloadCodesPdf(codes: RegeneratedStudentCode[]) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([612, 792]);
  let y = 744;
  const groupName = codes[0]?.groupName ?? "Groupe";
  page.drawText(`Socrato — codes d’accès — ${groupName}`, { x: 48, y, size: 17, font: bold, color: rgb(0.12, 0.18, 0.25) });
  y -= 30;
  page.drawText("Remettez un code à chaque élève. Les codes précédents ne fonctionnent plus.", { x: 48, y, size: 9, font: regular, color: rgb(0.25, 0.3, 0.36) });
  y -= 28;
  for (const item of codes) {
    if (y < 55) { page = pdf.addPage([612, 792]); y = 744; }
    page.drawText(item.alias, { x: 52, y, size: 12, font: regular, color: rgb(0.1, 0.13, 0.18) });
    page.drawText(item.code, { x: 320, y, size: 14, font: bold, color: rgb(0.06, 0.33, 0.23) });
    y -= 23;
  }
  const blob = new Blob([new Uint8Array(await pdf.save())], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `nouveaux-codes-${groupName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "groupe"}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

export function GroupAccessCodesView({ groupId, groupName, studentCount }: { groupId: string; groupName: string; studentCount: number }) {
  const [codes, setCodes] = useState<RegeneratedStudentCode[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function regenerate() {
    setPending(true); setError("");
    const result = await regenerateGroupAccessCodes(groupId);
    setPending(false);
    if (!result.ok) { setError(result.error); return; }
    setCodes(result.generatedCodes);
  }
  return <main className="group-codes-page">
    <section className="group-codes-card" aria-labelledby="group-codes-title">
      <Link className="group-codes-back" href={`/teacher/groups/${encodeURIComponent(groupId)}`}>← Retour au groupe</Link>
      <p className="group-codes-eyebrow">Codes d’accès élèves</p>
      <h1 id="group-codes-title">{groupName}</h1>
      {!codes.length ? <><p className="group-codes-intro">Générez un nouveau PDF pour les {studentCount} élèves de ce groupe si les codes originaux n’ont pas été téléchargés ou ont été perdus.</p><div className="group-codes-warning"><strong>Attention</strong><p>Cette action rend immédiatement les anciens codes inutilisables.</p></div>{error ? <p className="group-codes-error" role="alert">{error}</p> : null}<button className="group-codes-primary" type="button" disabled={pending} onClick={() => void regenerate()}>{pending ? "Génération…" : "Générer de nouveaux codes"}</button></> : <><p className="group-codes-success" role="status">Les nouveaux codes sont prêts. Téléchargez le PDF avant de quitter cette page.</p><div className="group-codes-list">{codes.map((item) => <p key={item.alias}><span>{item.alias}</span><strong>{item.code}</strong></p>)}</div><button className="group-codes-primary" type="button" onClick={() => void downloadCodesPdf(codes)}>Télécharger le PDF des codes</button><Link className="group-codes-secondary" href={`/teacher/groups/${encodeURIComponent(groupId)}`}>Terminer</Link></>}
    </section>
  </main>;
}

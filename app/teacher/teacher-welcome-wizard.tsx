"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createStudentAliasPreview } from "@/lib/teacher-onboarding/student-aliases";
import { completeTeacherOnboarding, createTeacherGroupWithCodes, type GeneratedStudentCode } from "./onboarding-actions";

type GroupDraft = { name: string; pastedRoster: string };
const emptyGroup = (): GroupDraft => ({ name: "", pastedRoster: "" });

async function downloadCodesPdf(codes: GeneratedStudentCode[]) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([612, 792]);
  let y = 742;
  const groupName = codes[0]?.groupName ?? "Groupe";
  page.drawText("Socrato - Codes d'accès des élèves", { x: 48, y, size: 18, font: bold, color: rgb(0.12, 0.04, 0.11) });
  y -= 30; page.drawText(groupName, { x: 48, y, size: 13, font: bold }); y -= 28;
  for (const item of codes) {
    if (y < 55) { page = pdf.addPage([612, 792]); y = 742; }
    page.drawText(item.alias, { x: 48, y, size: 11, font: regular });
    page.drawText(item.code, { x: 370, y, size: 11, font: bold });
    page.drawLine({ start: { x: 48, y: y - 7 }, end: { x: 564, y: y - 7 }, thickness: .5, color: rgb(.82, .82, .82) });
    y -= 24;
  }
  const bytes = await pdf.save();
  const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob); const link = document.createElement("a");
  link.href = url; link.download = `codes-${groupName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "groupe"}.pdf`; link.click(); URL.revokeObjectURL(url);
}

export function TeacherWelcomeWizard({ initiallyOpen, teacherName }: { initiallyOpen: boolean; teacherName: string }) {
  const [open, setOpen] = useState(initiallyOpen);
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(teacherName);
  const [group, setGroup] = useState<GroupDraft>(emptyGroup);
  const [codes, setCodes] = useState<GeneratedStudentCode[]>([]);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const preview = useMemo(() => createStudentAliasPreview(group.pastedRoster), [group.pastedRoster]);

  useEffect(() => { const reopen = () => { setStep(0); setCodes([]); setGroup(emptyGroup()); setError(""); setOpen(true); }; window.addEventListener("socrato:reopen-teacher-welcome", reopen); return () => window.removeEventListener("socrato:reopen-teacher-welcome", reopen); }, []);
  useEffect(() => { if (open) titleRef.current?.focus(); }, [open, step, codes.length]);
  if (!open) return null;

  function advance() { setError(""); if (step === 1 && !displayName.trim()) return setError("Inscrivez votre nom pour continuer."); setStep((value) => value + 1); }
  function createGroup() {
    if (!group.name.trim() || !preview.aliases.length) return setError("Ajoutez un nom de groupe et au moins un élève valide.");
    if (preview.ambiguousAliases.length) return setError("Corrigez les alias en double avant de continuer.");
    setError(""); startTransition(async () => { try { const result = await createTeacherGroupWithCodes({ displayName: displayName.trim(), group: { name: group.name.trim(), aliases: preview.aliases } }); if (!result.ok) return setError(result.error); setGroup((value) => ({ ...value, pastedRoster: "" })); setCodes(result.generatedCodes); } catch { setError("La connexion au serveur a été interrompue. Réessayez."); } });
  }
  function finishImport() { setError(""); startTransition(async () => { const result = await completeTeacherOnboarding(displayName); if (!result.ok) return setError(result.error); window.location.assign("/teacher?welcome=1"); }); }

  return <div className="teacher-welcome-backdrop"><section className="teacher-welcome-dialog" role="dialog" aria-modal="true" aria-labelledby="teacher-welcome-title">
    <div className="teacher-welcome-progress" aria-label={`Étape ${step + 1} sur 3`}>{[0,1,2].map((index)=><span key={index} className={index<=step?"is-active":""}/>)}</div>
    {step===0&&<><p className="teacher-welcome-eyebrow">Configuration initiale</p><h2 id="teacher-welcome-title" ref={titleRef} tabIndex={-1}>Bienvenue dans Socrato !</h2><p>En quelques minutes, nous allons préparer votre espace de travail. À la fin, vos élèves pourront déjà se connecter avec leur code d’accès et réaliser leur première activité de révision.</p><p>⏱️ Temps estimé : <strong>5 minutes</strong></p></>}
    {step===1&&<><p className="teacher-welcome-eyebrow">Étape 2 sur 3</p><h2 id="teacher-welcome-title" ref={titleRef} tabIndex={-1}>Quel est votre nom ?</h2><p>Il servira à personnaliser votre espace enseignant.</p><label className="teacher-welcome-field">Nom de l’enseignant<input value={displayName} onChange={(event)=>setDisplayName(event.target.value)} autoComplete="name"/></label></>}
    {step===2&&!codes.length&&<><p className="teacher-welcome-eyebrow">Étape 3 sur 3</p><h2 id="teacher-welcome-title" ref={titleRef} tabIndex={-1}>Ajoutez un groupe</h2><div className="teacher-welcome-groups"><fieldset><legend>Nouveau groupe</legend><label className="teacher-welcome-field">Nom du groupe<input value={group.name} onChange={(event)=>setGroup((value)=>({...value,name:event.target.value}))} placeholder="Ex. Histoire 404"/></label><label className="teacher-welcome-field">Copiez et collez votre liste ci-dessous à partir de Mozaïk ou GPI<textarea value={group.pastedRoster} onChange={(event)=>setGroup((value)=>({...value,pastedRoster:event.target.value}))} placeholder={'Pelletier, Mathieu\nRoy, Camille'}/></label><small className="teacher-welcome-paste-note">Le copier-coller provenant d’un PDF peut modifier la mise en page et n’est pas recommandé.</small><p className="teacher-welcome-aliases">Aperçu : {preview.aliases.join(", ")||"Aucun élève détecté"}</p>{preview.ambiguousAliases.length>0&&<p className="teacher-welcome-error">À distinguer : {preview.ambiguousAliases.join(", ")}</p>}</fieldset></div></>}
    {step===2&&codes.length>0&&<><p className="teacher-welcome-eyebrow">Groupe créé</p><h2 id="teacher-welcome-title" ref={titleRef} tabIndex={-1}>Les codes sont prêts</h2><p>Téléchargez les codes de ce groupe, puis ajoutez un autre groupe ou terminez l’importation.</p><div className="teacher-welcome-code-list">{codes.map((item)=><p key={item.alias}><span>{item.alias}</span><strong>{item.code}</strong></p>)}</div><button type="button" className="teacher-welcome-download" onClick={()=>void downloadCodesPdf(codes)}>Télécharger le PDF des codes</button></>}
    {error&&<p className="teacher-welcome-error" role="alert">{error}</p>}
    <div className="teacher-welcome-actions">
      {step>0&&!codes.length&&<button type="button" className="teacher-welcome-secondary" onClick={()=>setStep((value)=>value-1)}>Précédent</button>}
      {!codes.length&&<button type="button" className="teacher-welcome-primary" disabled={pending} onClick={step===2?createGroup:advance}>{step===0?"Commencer la configuration →":step===1?"Continuer →":pending?"Création…":"Créer les élèves et les codes pour ce groupe"}</button>}
      {codes.length>0&&<><button type="button" className="teacher-welcome-secondary" onClick={()=>{setCodes([]);setGroup(emptyGroup());setError("");}}>Ajouter le groupe suivant</button><button type="button" className="teacher-welcome-primary" disabled={pending} onClick={finishImport}>{pending?"Enregistrement…":"Importation des groupes terminée"}</button></>}
    </div>
  </section></div>;
}

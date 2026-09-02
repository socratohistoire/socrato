import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#eef1f2] px-5 py-8 text-[#0d2945] sm:px-8 sm:py-12">
      <article className="mx-auto max-w-4xl rounded-[28px] border border-[#d5b36d] bg-[#fbf8f2] px-6 py-8 shadow-[0_18px_50px_rgba(13,41,69,0.12)] sm:px-12 sm:py-11">
        <Link href="/" className="text-sm font-semibold text-[#315a78] underline underline-offset-4">← Retour à l’accueil</Link>
        <p className="mt-9 text-sm font-bold uppercase tracking-[0.16em] text-[#a56b1d]">Information aux parents</p>
        <h1 className="mt-3 font-[family:var(--font-cormorant)] text-4xl font-semibold leading-tight sm:text-5xl">Politique de confidentialité</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#40566a]">Socrato utilise seulement les renseignements nécessaires pour permettre à l’élève de réaliser ses activités d’histoire et pour présenter son cheminement à son enseignant.</p>

        <div className="mt-10 grid gap-8 border-t border-[#d9c49c] pt-8 sm:grid-cols-2">
          <section>
            <h2 className="text-xl font-bold">Renseignements utilisés</h2>
            <p className="mt-3 leading-7 text-[#40566a]">Le nom de l’élève, son groupe, son code d’accès, ses réponses, sa progression et les bilans associés à ses activités peuvent être enregistrés.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold">Pourquoi ils sont utilisés</h2>
            <p className="mt-3 leading-7 text-[#40566a]">Ces renseignements servent à accompagner l’élève, à conserver son travail et à permettre à son enseignant de suivre ses apprentissages.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold">Accompagnement par l’intelligence artificielle</h2>
            <p className="mt-3 leading-7 text-[#40566a]">Le service d’intelligence artificielle reçoit seulement la réponse de l’élève et le contexte pédagogique nécessaire pour produire une rétroaction. Il ne reçoit ni le nom de l’élève, ni son code d’accès, ni son identifiant personnel. Les renseignements permettant de reconnaître l’élève demeurent dans Socrato et ne sont pas transmis à ce service.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold">Accès et correction</h2>
            <p className="mt-3 leading-7 text-[#40566a]">Un parent peut demander l’accès, la correction ou le retrait des renseignements de son enfant en communiquant avec l’enseignant ou l’administrateur qui lui a donné accès à Socrato.</p>
          </section>
        </div>

        <p className="mt-10 rounded-2xl bg-[#e9f2f7] px-5 py-4 text-sm leading-6 text-[#315a78]">Cette page présente les pratiques de Socrato en langage simple. Elle pourra être précisée à mesure que les modalités d’utilisation du service évolueront.</p>
      </article>
    </main>
  );
}

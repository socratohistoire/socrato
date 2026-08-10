import Image from "next/image";
import Link from "next/link";
import { StudentAccessForm } from "./eleve/student-access-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#efefed] p-3 text-[#0d2945] sm:p-5">
      <div
        className="relative mx-auto flex min-h-[calc(100vh-24px)] max-w-[1500px] flex-col overflow-hidden rounded-[28px] border border-white/80 bg-[#fbf8f2] shadow-[0_14px_45px_rgba(15,23,42,0.12)] sm:min-h-[calc(100vh-40px)]"
        style={{
          backgroundImage:
            "url('/images/montrealfin1800.png')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        {/* Voile pâle sur les petits écrans */}
        <div className="pointer-events-none absolute inset-0 bg-[#fbf8f2]/70 lg:bg-transparent" />

        {/* En-tête */}
        <header className="relative z-10 px-6 pt-6 sm:px-10 sm:pt-8 lg:px-16">
          <Link
            href="/"
            className="inline-flex items-center"
            aria-label="Accueil Socrato"
          >
            {/* Tête de Socrate */}
<Image
  src="/logos/socrato-logo-v2.png"
  alt="Logo Socrato"
  width={74}
  height={74}
  priority
  unoptimized
  className="h-[64px] w-[64px] translate-x-2 object-contain sm:h-[74px] sm:w-[74px] sm:translate-x-3"
/>

            {/* Nom et sous-titre */}
            <div className="ml-1 flex h-[64px] flex-col justify-center sm:h-[74px]">
              <div className="font-[family:var(--font-cormorant)] text-[1.6rem] font-semibold leading-none tracking-[0.02em] sm:text-[1.9rem]">
                SOCRATO
              </div>

              <div className="mt-1.5 hidden text-[0.58rem] tracking-[0.11em] text-slate-600 sm:block sm:text-[0.62rem]">
                TON TUTEUR PÉDAGOGIQUE EN HISTOIRE
              </div>
            </div>
          </Link>
        </header>

        {/* Contenu principal */}
        <section className="relative z-10 flex flex-1 items-center px-6 pb-32 pt-12 sm:px-10 sm:pt-14 lg:px-16 lg:pb-28 lg:pt-16">
          {/*
            Ce déplacement remonte le titre, le sous-titre
            et la carte du code d’accès.
          */}
          <div className="w-full max-w-[590px] -translate-y-3 lg:ml-[78px] lg:w-[46%] lg:-translate-y-4">
            {/* Titre */}
            <h1 className="font-[family:var(--font-cormorant)] text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.025em] text-[#0d2945] sm:text-[3.25rem] lg:text-[3.65rem]">
              <span className="block whitespace-nowrap">
                Histoire du Québec
              </span>

              <span className="block whitespace-nowrap">
                et du Canada
              </span>
            </h1>

            {/* Sous-titre */}
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#0d2945] sm:text-lg">
              Révise tes notions en répondant aux questions de
              Socrato.
            </p>

            {/* Le même formulaire crée la session élève ici et sur /eleve. */}
            <StudentAccessForm />
          </div>
        </section>

        {/* Accès enseignant */}
        <footer className="absolute inset-x-6 bottom-7 z-10 flex items-center gap-6 sm:inset-x-10 lg:inset-x-16">
          <div className="h-px flex-1 bg-slate-300/90" />

          <a
            href="/teacher"
            className="group flex shrink-0 flex-col items-center gap-1 text-sm text-slate-600 transition hover:text-[#0d2945]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <rect
                x="5"
                y="10"
                width="14"
                height="11"
                rx="2"
              />

              <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />

              <path d="M12 14v3" />
            </svg>

            <span className="underline decoration-slate-400 underline-offset-4 group-hover:decoration-[#0d2945]">
              Accès enseignant
            </span>
          </a>

          <div className="h-px flex-1 bg-slate-300/90" />
        </footer>
      </div>
    </main>
  );
}

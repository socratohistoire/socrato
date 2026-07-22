import Image from "next/image";
import Link from "next/link";
import { StudentAccessForm } from "./student-access-form";

export default function StudentAccessPage() {
  return (
    <main className="min-h-screen bg-[#efefed] p-3 text-[#0d2945] sm:p-5">
      <div
        className="relative mx-auto flex min-h-[calc(100vh-24px)] max-w-[1500px] flex-col overflow-hidden rounded-[28px] border border-white/80 bg-[#fbf8f2] shadow-[0_14px_45px_rgba(15,23,42,0.12)] sm:min-h-[calc(100vh-40px)]"
        style={{
          backgroundImage: "url('/images/montrealfin1800.png')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[#fbf8f2]/70 lg:bg-transparent" />
        <header className="relative z-10 px-6 pt-6 sm:px-10 sm:pt-8 lg:px-16">
          <Link href="/" className="inline-flex items-center" aria-label="Accueil Socrato">
            <Image
              src="/logos/socrato-logo-v2.png"
              alt="Logo Socrato"
              width={74}
              height={74}
              priority
              unoptimized
              className="h-[64px] w-[64px] translate-x-2 object-contain sm:h-[74px] sm:w-[74px] sm:translate-x-3"
            />
            <div className="ml-1 flex h-[64px] flex-col justify-center sm:h-[74px]">
              <div className="font-[family:var(--font-cormorant)] text-[1.6rem] font-semibold leading-none tracking-[0.02em] sm:text-[1.9rem]">
                SOCRATO
              </div>
              <div className="mt-1.5 hidden text-[0.58rem] tracking-[0.11em] text-slate-600 sm:block sm:text-[0.62rem]">
                TON TUTEUR INTELLIGENT EN HISTOIRE
              </div>
            </div>
          </Link>
        </header>
        <section className="relative z-10 flex flex-1 items-center px-6 pb-20 pt-12 sm:px-10 lg:px-16">
          <div className="w-full max-w-[590px] -translate-y-3 lg:ml-[78px] lg:w-[46%]">
            <h1 className="font-[family:var(--font-cormorant)] text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.025em] sm:text-[3.25rem] lg:text-[3.65rem]">
              <span className="block whitespace-nowrap">Histoire du Québec</span>
              <span className="block whitespace-nowrap">et du Canada</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed sm:text-lg">
              Révise tes notions en répondant aux questions de Socrato.
            </p>
            <StudentAccessForm />
          </div>
        </section>
      </div>
    </main>
  );
}

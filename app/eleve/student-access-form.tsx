"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import {
  enterStudentSpace,
  type StudentAccessFormState,
} from "./actions";

const INITIAL_STATE: StudentAccessFormState = { message: "" };

export function StudentAccessForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    enterStudentSpace,
    INITIAL_STATE,
  );

  useEffect(() => {
    if (state.redirectTo) router.replace(state.redirectTo);
  }, [router, state.redirectTo]);

  return (
    <form
      action={formAction}
      className="mt-7 w-full max-w-[420px] rounded-[24px] bg-gradient-to-br from-[#0c2944] to-[#092038] px-7 py-7 shadow-[0_14px_30px_rgba(15,23,42,0.20)] sm:px-9"
    >
      <label
        htmlFor="code"
        className="block text-center text-base font-medium text-white sm:text-lg"
      >
        Code d’accès
      </label>
      <input
        id="code"
        name="code"
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={64}
        required
        aria-describedby={state.message ? "access-error" : undefined}
        className="mt-5 h-16 w-full rounded-2xl border border-slate-200 bg-white px-5 text-center text-lg font-semibold uppercase tracking-[0.12em] text-[#0d2945] shadow-inner outline-none transition focus:border-[#b99155] focus:ring-4 focus:ring-[#d9c399]/35"
      />
      {state.message ? (
        <p
          id="access-error"
          role="alert"
          className="mt-4 text-center text-sm leading-relaxed text-white"
        >
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || Boolean(state.redirectTo)}
        className="group mt-6 flex h-16 w-full items-center justify-center rounded-2xl bg-white px-6 text-base font-semibold text-[#0d2945] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-white/30 disabled:cursor-wait disabled:opacity-70 sm:text-lg"
      >
        <span>{pending || state.redirectTo ? "Ouverture…" : "Accéder à l’espace élève"}</span>
        <span
          aria-hidden="true"
          className="ml-4 text-2xl font-light transition-transform group-hover:translate-x-1"
        >
          →
        </span>
      </button>
    </form>
  );
}

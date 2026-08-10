"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  authenticateStudentAccess,
  GENERIC_ACCESS_ERROR,
} from "@/lib/student-access/authenticate";
import {
  getStudentAccessRuntime,
  STUDENT_SESSION_COOKIE,
} from "@/lib/student-access/local-runtime";

export type StudentAccessFormState = {
  message: string;
  redirectTo?: "/eleve/tableau-de-bord";
};

export async function leaveStudentSpace(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STUDENT_SESSION_COOKIE)?.value;

  if (token) {
    await getStudentAccessRuntime().sessions.revokeByToken(token);
  }

  cookieStore.delete(STUDENT_SESSION_COOKIE);
  redirect("/eleve");
}

export async function enterStudentSpace(
  _previousState: StudentAccessFormState,
  formData: FormData,
): Promise<StudentAccessFormState> {
  try {
    const runtime = getStudentAccessRuntime();
    const requestHeaders = await headers();
    const rawClientContext =
      requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      requestHeaders.get("x-real-ip") ||
      "local-client";

    const result = await authenticateStudentAccess(
      formData.get("code"),
      runtime.clientContext(rawClientContext),
      runtime,
    );

    if (!result.success) {
      return { message: result.message };
    }

    const cookieStore = await cookies();
    cookieStore.set(STUDENT_SESSION_COOKIE, result.session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/eleve",
      expires: result.session.expiresAt,
    });

    return { message: "", redirectTo: result.redirectTo };
  } catch {
    return { message: GENERIC_ACCESS_ERROR };
  }
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  if (process.env.SOCRATO_TEACHER_AUTH_ENABLED !== "enabled") return NextResponse.next();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return NextResponse.redirect(new URL("/teacher/login?error=configuration", request.url));
  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, publishableKey, { cookies: { getAll: () => request.cookies.getAll(), setAll: (values) => { values.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); values.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); } } });
  const { data: { user } } = await supabase.auth.getUser();
  const isTeacherRoute = request.nextUrl.pathname.startsWith("/teacher") && request.nextUrl.pathname !== "/teacher/login";
  if (isTeacherRoute && !user) { const loginUrl = request.nextUrl.clone(); loginUrl.pathname = "/teacher/login"; loginUrl.search = ""; return NextResponse.redirect(loginUrl); }
  if (request.nextUrl.pathname === "/teacher/login" && user) return NextResponse.redirect(new URL("/teacher", request.url));
  return response;
}

export const config = { matcher: ["/teacher/:path*", "/auth/:path*"] };

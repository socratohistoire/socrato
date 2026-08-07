import { AUTHENTICATION_API_ROUTES, type AuthenticatedSessionContract, type StudentCodeSessionResponse } from "./api-contract.ts";

export class AuthenticationApiError extends Error {
  constructor(message: string, readonly status: number, readonly code = "authentication_error") {
    super(message);
    this.name = "AuthenticationApiError";
  }
}

export class HttpAuthenticationClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string, private readonly fetchImplementation: typeof globalThis.fetch = globalThis.fetch) {
    const url = new URL(baseUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("L’adresse d’authentification doit utiliser HTTP ou HTTPS.");
    this.baseUrl = url.origin;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.fetchImplementation(`${this.baseUrl}${path}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: { code?: string; message?: string } } | null;
      throw new AuthenticationApiError(payload?.error?.message ?? "La connexion n’a pas pu être confirmée.", response.status, payload?.error?.code);
    }
    if (response.status === 204) return null as T;
    return response.json() as Promise<T>;
  }

  currentSession() {
    return this.request<AuthenticatedSessionContract | null>(AUTHENTICATION_API_ROUTES.currentSession);
  }

  createStudentSession(code: string) {
    return this.request<StudentCodeSessionResponse>(AUTHENTICATION_API_ROUTES.studentCodeSession, {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  async endSession() {
    await this.request<null>(AUTHENTICATION_API_ROUTES.currentSession, { method: "DELETE" });
  }

  teacherLoginUrl(returnTo = "/teacher") {
    if (!returnTo.startsWith("/") || returnTo.startsWith("//")) throw new Error("Le retour après connexion doit rester dans Socrato.");
    return `${this.baseUrl}${AUTHENTICATION_API_ROUTES.teacherLogin}?returnTo=${encodeURIComponent(returnTo)}`;
  }
}

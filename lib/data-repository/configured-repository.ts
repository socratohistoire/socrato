import { BrowserSocratoDataRepository } from "./browser-repository.ts";
import { HttpSocratoDataRepository } from "./http-repository.ts";
import type { SocratoDataRepository } from "./types.ts";

export type SocratoDataSourceMode = "local" | "server";

type RepositoryConfiguration = {
  mode?: string;
  apiBaseUrl?: string;
};

function validatedServerUrl(value: string | undefined) {
  if (!value) throw new Error("NEXT_PUBLIC_SOCRATO_API_BASE_URL est requise lorsque la source de données est « server ».");
  const url = new URL(value);
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("L’adresse du serveur Socrato doit utiliser HTTP ou HTTPS.");
  return url.origin;
}

export function createConfiguredDataRepository(storage: Storage, configuration: RepositoryConfiguration = {}): SocratoDataRepository {
  const mode = configuration.mode ?? process.env.NEXT_PUBLIC_SOCRATO_DATA_SOURCE ?? "local";
  if (mode === "local") return new BrowserSocratoDataRepository(storage);
  if (mode === "server") {
    const apiBaseUrl = configuration.apiBaseUrl ?? process.env.NEXT_PUBLIC_SOCRATO_API_BASE_URL;
    return new HttpSocratoDataRepository({ baseUrl: validatedServerUrl(apiBaseUrl) });
  }
  throw new Error(`Source de données Socrato inconnue : ${mode}. Utilisez « local » ou « server ».`);
}

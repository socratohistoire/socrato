import postgres, { type Sql } from "postgres";

const globalDatabase = globalThis as typeof globalThis & { socratoDatabase?: Sql };

export function getSocratoDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("La connexion à la base de données Socrato n’est pas configurée.");
  if (!globalDatabase.socratoDatabase) {
    globalDatabase.socratoDatabase = postgres(connectionString, {
      max: 5,
      connect_timeout: 15,
      idle_timeout: 20,
    });
  }
  return globalDatabase.socratoDatabase;
}

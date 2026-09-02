import postgres, { type Sql } from "postgres";

const DATABASE_POOL_VERSION = 2;
const globalDatabase = globalThis as typeof globalThis & {
  socratoDatabaseUnprepared?: Sql;
  socratoDatabasePoolVersion?: number;
};

export function getSocratoDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("La connexion à la base de données Socrato n’est pas configurée.");
  if (globalDatabase.socratoDatabaseUnprepared && globalDatabase.socratoDatabasePoolVersion !== DATABASE_POOL_VERSION) {
    void globalDatabase.socratoDatabaseUnprepared.end({ timeout: 1 }).catch(() => undefined);
    globalDatabase.socratoDatabaseUnprepared = undefined;
  }
  if (!globalDatabase.socratoDatabaseUnprepared) {
    globalDatabase.socratoDatabaseUnprepared = postgres(connectionString, {
      max: 5,
      connect_timeout: 30,
      // Une interaction élève dépasse souvent 20 secondes. Garder la connexion
      // évite de rouvrir un lien Supabase à presque chaque réponse.
      idle_timeout: 300,
      prepare: false,
    });
    globalDatabase.socratoDatabasePoolVersion = DATABASE_POOL_VERSION;
  }
  return globalDatabase.socratoDatabaseUnprepared;
}

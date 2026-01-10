import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";

const dbPath = process.env.DATABASE_URL || "sqlite.db";
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// Run migrations on startup
if (process.env.NODE_ENV === "production" || process.env.RUN_MIGRATIONS === "true") {
  migrate(db, { migrationsFolder: path.join(process.cwd(), "drizzle") });
}

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

const DEFAULT_NEON_URL = "postgresql://neondb_owner:npg_e1rlbnEoDLA7@ep-raspy-cloud-azjlesj3.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

function createPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const dbUrl = (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== "") 
    ? process.env.DATABASE_URL 
    : DEFAULT_NEON_URL;

  const isLocalSqlite = dbUrl.startsWith("file:");

  let client: PrismaClient;

  if (isLocalSqlite) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
      const dbPath = dbUrl.replace("file:", "");
      const adapter = new PrismaBetterSqlite3({ url: dbPath });
      client = new PrismaClient({ adapter });
    } catch (e) {
      console.error("SQLite adapter load error, falling back to pg pool:", e);
      if (!globalForPrisma.pool) {
        globalForPrisma.pool = new pg.Pool({ connectionString: DEFAULT_NEON_URL, max: 10, connectionTimeoutMillis: 10000 });
      }
      const adapter = new PrismaPg(globalForPrisma.pool);
      client = new PrismaClient({ adapter });
    }
  } else {
    // Singleton Pool connection management for Serverless Environments
    if (!globalForPrisma.pool) {
      globalForPrisma.pool = new pg.Pool({
        connectionString: dbUrl,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });

      globalForPrisma.pool.on("error", (err) => {
        console.error("[PostgreSQL Pool Error] Unexpected error on idle client:", err);
      });
    }

    const adapter = new PrismaPg(globalForPrisma.pool);
    client = new PrismaClient({ adapter });
  }

  // Cache singleton instance across all serverless invocations to prevent connection exhaustion
  globalForPrisma.prisma = client;

  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(_target, prop) {
    const instance = globalForPrisma.prisma ?? createPrismaClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (instance as any)[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

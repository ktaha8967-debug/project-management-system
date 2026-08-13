import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import pg from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ override: true });

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString || connectionString.startsWith("file:")) {
    let url = connectionString || "file:./dev.db";
    if (url.startsWith("file:./") || url.startsWith("file:../")) {
      const relativePath = url.replace("file:", "");
      const absolutePath = path.resolve(process.cwd(), relativePath);
      url = `file:${absolutePath}`;
    }
    
    const adapter = new PrismaBetterSqlite3({ url });
    return new PrismaClient({ adapter });
  }

  if (connectionString.startsWith("prisma")) {
    return new PrismaClient({
      // @ts-ignore
      accelerateUrl: connectionString,
    });
  }

  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;

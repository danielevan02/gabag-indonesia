import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

declare global {
  var db: PrismaClient | undefined
}

neonConfig.webSocketConstructor = ws;

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);
const prisma = global.db || new PrismaClient({
  adapter: adapter as any
});
if (process.env.NODE_ENV === 'development') global.db = prisma;

export default prisma;
import { PrismaClient } from '@/generated/prisma';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

declare global {
  var db: PrismaClient | undefined
}

neonConfig.webSocketConstructor = ws;

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaNeon({ connectionString });
const prisma = global.db || new PrismaClient({ adapter });
if (process.env.NODE_ENV === 'development') global.db = prisma;

export default prisma;
import { PrismaClient } from '@prisma/client';

declare global {
  var db: PrismaClient | undefined
}

let prisma: PrismaClient;

if (global.db) {
  prisma = global.db;
} else {
  // Use regular Prisma client with connection pooling
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  // Only cache in development to prevent connection issues
  if (process.env.NODE_ENV === 'development') {
    global.db = prisma;
  }
}

export default prisma;
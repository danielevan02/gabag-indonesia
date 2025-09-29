import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

declare global {
  var db: PrismaClient | undefined
}

// Configure Neon for WebSocket support - only in runtime, not during build
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  // Only set WebSocket constructor in server runtime environment, not during build
  if (process.env.NEXT_PHASE !== 'phase-production-build') {
    neonConfig.webSocketConstructor = ws;
  }
}

// Connection pool configuration for Neon
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({
  connectionString,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 5000, // Timeout for connection attempts
});

const adapter = new PrismaNeon(pool);

// Initialize Prisma with proper error handling and connection management
const prisma = global.db || new PrismaClient({
  adapter,
  errorFormat: 'minimal',
});

// Only use global instance in development to prevent multiple instances
if (process.env.NODE_ENV === 'development') {
  global.db = prisma;
}

// Graceful shutdown handling
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await pool.end();
});

export default prisma;
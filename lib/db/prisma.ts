import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';

// Set up WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Get connection string from environment variable
const connectionString = `${process.env.DATABASE_URL}`;

// Create a connection pool
const pool = new Pool({ connectionString });

// Instantiate Prisma adapter with Neon
const adapter = new PrismaNeon(pool);

// Extend PrismaClient to transform specific fields
export const prisma = new PrismaClient({ adapter })
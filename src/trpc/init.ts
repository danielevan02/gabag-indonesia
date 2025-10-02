import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson'
import { auth } from '../auth';

export const createTRPCContext = async () => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  try {
    const session = await auth();
    return {
      session,
      userId: session?.user?.id
    };
  } catch {
    // During build time or static generation, auth() may fail
    // Return null session for these cases
    return {
      session: null,
      userId: undefined
    };
  }
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

// Protected procedure - requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource'
    });
  }

  return next({
    ctx: {
      session: ctx.session,
      userId: ctx.session.user.id,
    },
  });
});

// Admin-only procedure - requires admin role
export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource'
    });
  }

  if (ctx.session.user.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have permission to access this resource'
    });
  }

  return next({
    ctx: {
      session: ctx.session,
      userId: ctx.session.user.id,
    },
  });
});
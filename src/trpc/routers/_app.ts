import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { productRouter } from './product';
import { authRouter } from './auth';

export const appRouter = createTRPCRouter({
  product: productRouter,
  auth: authRouter,
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
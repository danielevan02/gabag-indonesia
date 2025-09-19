import { createTRPCRouter } from '../init';
import { productRouter } from './product';
import { authRouter } from './auth';
import { cartRouter } from './cart';

export const appRouter = createTRPCRouter({
  product: productRouter,
  auth: authRouter,
  cart: cartRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
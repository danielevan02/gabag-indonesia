import { createTRPCRouter } from '../init';
import { productRouter } from './product';
import { authRouter } from './auth';
import { cartRouter } from './cart';
import { subCategoryRouter } from './subCategory';

export const appRouter = createTRPCRouter({
  product: productRouter,
  auth: authRouter,
  cart: cartRouter,
  subCategory: subCategoryRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
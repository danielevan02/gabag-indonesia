import { createTRPCRouter } from '../init';
import { productRouter } from './product';
import { authRouter } from './auth';
import { cartRouter } from './cart';
import { subCategoryRouter } from './subCategory';
import { categoryRouter } from './category';
import { orderRouter } from './order';
import { eventRouter } from './event';
import { courierRouter } from './courier';
import { inferRouterOutputs } from '@trpc/server';
import { voucherRouter } from './voucher';
import { galleryRouter } from './gallery';
import { carouselRouter } from './carousel';

export const appRouter = createTRPCRouter({
  product: productRouter,
  auth: authRouter,
  cart: cartRouter,
  subCategory: subCategoryRouter,
  category: categoryRouter,
  order: orderRouter,
  event: eventRouter,
  courier: courierRouter,
  voucher: voucherRouter,
  gallery: galleryRouter,
  carousel: carouselRouter
});
// export type definition of API
export type AppRouter = typeof appRouter;

export type RouterOutputs = inferRouterOutputs<AppRouter>
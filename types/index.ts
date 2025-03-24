import { Category, Product, Variant } from "@prisma/client";

export type FullProductType = Product & {
  variant: Variant[];
  categories: Category[]
}
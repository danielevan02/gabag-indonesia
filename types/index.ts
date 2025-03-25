import { Category, Product, Variant } from "@prisma/client";

export type FullProductType = Product & {
  variant: Variant[];
  categories: Category[]
}

export type CartItem = {
  productId: string
  name: string
  qty: number
  price: number
  variantId?:  string
  slug: string
  image: string
}
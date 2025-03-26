import { Category, Product as ProductPrisma, Variant, Cart as CartPrisma } from "@prisma/client";

export type Product = Omit<ProductPrisma, "weight"|"length"|"width"|"height"> & {
  weight: number;
  length: number;
  width: number;
  height: number;
}

export type FullProductType = Product & {
  variant: Variant[];
  categories: Category[]
}

export type Cart = Omit<CartPrisma, "weight"> & {
  weight: string
}

export type CartItem = {
  productId: string
  name: string
  weight?: number;
  qty: number
  price: number
  variantId?:  string
  slug: string
  image: string
}

export type CustomerAddress = {
  province: string;
  city: string;
  district: string;
  sub_district: string;
  specific_address: string;
  postal_code: string;
}

export type Courier = {
  available_for_cash_on_delivery: boolean;
  available_for_proof_of_delivery: boolean;
  available_for_instant_waybill_id: boolean;
  courier_name: string;
  courier_code: string;
  courier_service_name: string;
  courier_service_code: string;
  tier: string;
  description: string;
  service_type: string;
  shipping_type: string;
  shipment_duration_range: string;
  shipment_duration_unit: string;
};
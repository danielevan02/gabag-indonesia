import { addressSchema, orderSchema } from "@/lib/schema";
import { Category, Product as ProductPrisma, Variant, User as UserPrisma, Order, OrderItem as PrismaOrderItem } from "@prisma/client";
import { z } from "zod";

export type Product = Omit<ProductPrisma, "weight"|"length"|"width"|"height"> & {
  weight: number;
  length: number;
  width: number;
  height: number;
}

export type User = Omit<UserPrisma, "address"> & {
  address: Address
}

export type FullProductType = Product & {
  variant: Variant[];
  categories: Category[];
  orderItem: {
    qty: number
  }[]
}

type OrderItem = Omit<PrismaOrderItem, "weight"> & {
  weight: number
}

export type FullOrderType = Order & {
  orderItems: OrderItem[]
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

export type Address = z.infer<typeof addressSchema>

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

export type Areas = {
  id: string,
  name: string,
  country_name: string,
  country_code: string,
  administrative_division_level_1_name: string,
  administrative_division_level_1_type: string,
  administrative_division_level_2_name: string,
  administrative_division_level_2_type: string,
  administrative_division_level_3_name: string,
  administrative_division_level_3_type: string,
  postal_code: string
}

export type Rates = {
  available_for_cash_on_delivery: boolean,
  available_for_proof_of_delivery: boolean,
  available_for_instant_waybill_id: boolean,
  available_for_insurance: boolean,
  available_collection_method: string[],
  company: string,
  courier_name: string,
  courier_code: string,
  courier_service_name: string,
  courier_service_code: string,
  currency: string,
  description: string,
  duration: string,
  shipment_duration_range: string,
  shipment_duration_unit: string,
  service_type: string,
  shipping_type: string,
  price: number,
  tax_lines: [],
  type: string,
}

export type OrderType = z.infer<typeof orderSchema> & {
  address: Address
}

export type ShippingInfo = {
  address: string,
  name: string,
  phone: string,
  email: string,
  postal_code: string,
  area_id: string
}

export type TransactionDetails = {
  order_id: string;
  gross_amount: number;
};

export type ItemDetail = {
  id: string;
  price: number;
  quantity: number;
  name: string;
};

export type MidtransAddress = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  country_code?: string;
}

export type CustomerDetails = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  billing_address?: MidtransAddress;
  shipping_address?: MidtransAddress;
};

export type TransactionParams = {
  transaction_details: TransactionDetails;
  item_details: ItemDetail[];
  customer_details: CustomerDetails;
}

type VANumber = {
  bank: string;
  va_number: string;
};

export type MidtransTransactionResult = {
  bca_va_number: string;
  finish_redirect_url: string;
  fraud_status: string;
  gross_amount: string;
  order_id: string;
  payment_type: string;
  pdf_url: string;
  status_code: string;
  status_message: string;
  transaction_id: string;
  transaction_status: string;
  transaction_time: string;
  va_numbers: VANumber[];
};

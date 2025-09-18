import { addressSchema, orderSchema } from "@/lib/schema";
import { User as UserPrisma, Order, OrderItem as PrismaOrderItem, SubCategory as PrismaSubCategory, Review, Event as PrismaEvent } from "@/generated/prisma";
import { z } from "zod";

export type SubCategory = Omit<PrismaSubCategory, "image" | "discount"> & {
  image?: string;
  discount?: number;
}

export type ProductEvent = Omit<PrismaEvent, "discount"> & {
  discount?: number
}

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  stock: number;
  discount: number;
  hasVariant: boolean;
  height: number;
  length: number;
  sku?: string;
  weight: number;
  width: number;
  createdAt: Date;
  eventId?: string;
  subCategoryId: string;
  regularPrice: number;
  price: number;
  orderItems?: OrderItem[];
  event?: Event;
  subCategory?: SubCategory;
  reviews?: Review[];
  variants?: Variant[];
};

export type Variant = {
  id: string
  name: string
  discount?: number
  stock: number
  createdAt: Date
  image: string
  sku?: string
  productId: string
  regularPrice: number
  orderItems?: OrderItem[]
  product?: Product
  price: number
}

export type User = Omit<UserPrisma, "address"> & {
  address: Address
}

type OrderItem = Omit<PrismaOrderItem, "weight" | "length" | "width" | "height"> & {
  weight: number;
  length?: number;
  width?: number;
  height?: number;
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
  height?: number
  length?: number
  width?: number
}

export type Cart = {
  id: string
  orderId: string | null
  createdAt: Date
  itemsPrice: string
  totalPrice: string
  shippingPrice: string | undefined
  taxPrice: string
  notes: string | null
  userId: string | undefined
  sessionCartId: string
  items: CartItem[]
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
  payment_type: string;
  transaction_details: TransactionDetails;
  item_details?: ItemDetail[];
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

export type Item = {
  name: string;          
  description?: string;  
  sku?: string;          
  value: number;         
  quantity: number;      
  weight: number;        
  height?: number;       
  length?: number;       
  width?: number;        
};

export type OrderResponse = {
  success: boolean;
  message: string;
  object: string;
  id: string;
  draft_order_id: string | null;
  shipper: {
    name: string;
    email: string;
    phone: string;
    organization: string;
  };
  origin: {
    contact_name: string;
    contact_phone: string;
    coordinate: {
      latitude: number;
      longitude: number;
    };
    address: string;
    note: string;
    postal_code: number;
  };
  destination: {
    contact_name: string;
    contact_phone: string;
    contact_email: string;
    address: string;
    note: string;
    proof_of_delivery: {
      use: boolean;
      fee: number;
      note: string | null;
      link: string | null;
    };
    cash_on_delivery: {
      id: string;
      amount: number;
      amount_currency: string;
      fee: number;
      fee_currency: string;
      note: string | null;
      type: string;
    };
    coordinate: {
      latitude: number;
      longitude: number;
    };
    postal_code: number;
  };
  courier: {
    tracking_id: string;
    waybill_id: string | null;
    company: string;
    name: string | null; // Deprecated
    phone: string | null; // Deprecated
    driver_name: string | null;
    driver_phone: string | null;
    driver_photo_url: string | null;
    driver_plate_number: string | null;
    type: string;
    link: string | null;
    insurance: {
      amount: number;
      amount_currency: string;
      fee: number;
      fee_currency: string;
      note: string;
    };
    routing_code: string | null;
  };
  delivery: {
    datetime: Date
    note: string | null;
    type: string;
    distance: number;
    distance_unit: string;
  };
  reference_id: string | null;
  items: Item[]
  currency: string;
  price: number;
  note: string;
  status: string;
}

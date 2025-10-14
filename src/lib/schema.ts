import z from "zod";

export const signInSchema = z.object({
  email: z.string().email("Please input a valid email").min(1, "Email is required!"),
  password: z.string().min(5, "Password must be at least 6 characters"),
});

export const signUpSchema = z
  .object({
    email: z.string().email("Please input a valid email").min(1, "Email is required!"),
    fullName: z.string().min(1, "Please input your name"),
    password: z.string().min(5, "Password must be at least 6 characters"),
    phone: z.string().min(1, "Please enter the phone number"),
    confirmPassword: z.string().min(1, "Please re-input the password"),
  })
  .refine((val) => val.confirmPassword === val.password, {
    message: "Confirm password doesn't match the password",
    path: ["confirmPassword"],
  });

export const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^08[0-9]{7,11}$/, {
      message: "Phone number must start with 08 and consist of 9-13 digits total",
    }),
});

export const nameSchema = z.string().min(1, "Name is required");

export const addressSchema = z.object({
  province: z.string().min(1, "Please choose your province"),
  city: z.string().min(1, "Please choose your city"),
  district: z.string().min(1, "Please choose your district"),
  village: z.string().min(1, "Please choose your village"),
  address: z.string().min(1, "Please insert your address"),
  postalCode: z.string().max(5, "Please insert a valid postal code").optional(),
});

export const orderSchema = z.object({
  name: z.string().min(1, "Please enter the name of the recipient"),
  province: z.string().min(1, "Please enter the province"),
  city: z.string().min(1, "Please enter the city"),
  district: z.string().min(1, "Please enter the district"),
  village: z.string().min(1, "Please enter the village"),
  postal_code: z.string().min(1, "Please enter the postal code"),
  phone: z.string().min(1, "Please enter the phone number"),
  address: z.string().min(10, "Please enter a valid address. Min. 10 characters"),
  email: z.string().email("Please enter a valid email").min(1, "Please enter your email"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Please enter the name of the category"),
  mediaFileId: z.string().min(1, "Please pick an image for the category"),
});

export const productsSchema = z.object({
  name: z.string().min(1, "Please enter the name of the product"),
  slug: z.string(),
  description: z.string().min(1, "Please enter the product description"),
  images: z.array(z.string()).min(1, "Please enter the product images"),
  stock: z.number().min(1),
  discount: z
    .number()
    .min(0, "Please enter between 0 - 100")
    .max(100, "Please enter between 0 - 100")
    .default(0),
  hasVariant: z.boolean().default(false),
  width: z.number().default(0),
  length: z.number().default(0),
  height: z.number().default(0),
  weight: z.number().default(0),
  sku: z.string().optional(),
  regularPrice: z.number().default(0),
});

export const subCategorySchema = z.object({
  name: z.string().min(1, "Please enter the name of the sub category"),
  mediaFileId: z.string({ message: "Please insert an image for this sub category" }).optional(),
  discount: z.coerce.number().optional(),
  category: z.string(),
  products: z.array(z.string()).optional(),
});

export const variantSchema = z.object({
  name: z.string().min(1, "Please input variant name"),
  sku: z.string().min(1, "Please insert SKU for variant"),
  regularPrice: z.coerce.number().min(1, "Please input the price for variants"),
  stock: z.coerce.number().min(0, "Stock must be greater than or equal to 0"),
  discount: z.coerce.number().min(0).max(100).optional(),
  image: z.string().min(1, "Please input image for variant"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Please input product name"),
  sku: z.string().optional(),
  subCategory: z.string().min(1, "Please select subcategory"),
  price: z.coerce.number().min(0, "Price must be greater than or equal to 0").optional(),
  discount: z.coerce.number().min(0).max(100).optional(),
  images: z.array(z.string()).min(1, "Please input at least 1 image"),
  description: z.string().min(1, "Please input the description"),
  hasVariant: z.boolean().default(false),
  variants: z.array(variantSchema).optional(),
  stock: z.coerce.number().min(0, "Stock must be greater than or equal to 0").optional(),
  weight: z.coerce.number().min(1, "Please input the weight"),
  height: z.coerce.number().min(1, "Please input the height"),
  length: z.coerce.number().min(1, "Please input the length"),
  width: z.coerce.number().min(1, "Please input the width"),
});

export const mediaFileSchema = z.object({
  thumbnail_url: z.string().url("Must be a valid URL"),
  public_id: z.string().min(1, "Public ID is required"),
  secure_url: z
    .string()
    .url("Must be a valid HTTPS URL")
    .refine((url) => url.startsWith("https://"), "Must be a secure HTTPS URL"),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  format: z.string().max(10).optional(),
  bytes: z.number().int().positive().optional(),
  resource_type: z.string().max(20).default("image"),
  original_filename: z.string().max(255).optional(),
});

export const carouselSchema = z.object({
  name: z.string().min(1, "Please enter the name of carousel"),
  linkUrl: z.string().url("Please enter a valid URL").min(1, "Please enter the link URL"),
  altText: z.string().optional(),
  desktopImageId: z.string().min(1, "Please select desktop image"),
  mobileImageId: z.string().min(1, "Please select mobile image"),
  isActive: z.boolean().default(true),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

export const cartItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  name: z.string(),
  slug: z.string(),
  image: z.string(),
  price: z.number(),
  qty: z.number(),
  weight: z.number(),
  length: z.number(),
  width: z.number(),
  height: z.number(),
});

export const courierRatesSchema = z.object({
  destination_postal_code: z.string(),
  destination_area_id: z.string(),
  items: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
      quantity: z.number(),
      weight: z.number(),
      height: z.number(),
      width: z.number(),
      length: z.number()
    })
  ),
});

export const createShipmentSchema = z.object({
  courier: z.string(),
  orderId: z.string(),
  shippingInfo: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string(),
    address: z.string(),
    postal_code: z.string(),
    area_id: z.string(),
  }),
});

export const voucherSchema = z.object({
  code: z.string().min(1, "Voucher code is required").toUpperCase(),
  name: z.string().optional(),
  description: z.string().optional(),

  // Discount configuration
  discountType: z.enum(["FIXED", "PERCENT"], {
    required_error: "Please select discount type",
  }),
  discountValue: z.coerce.number().min(0, "Discount value must be positive"),
  maxDiscount: z.coerce.number().optional(), // For PERCENT type

  // Application scope
  applicationType: z.enum(["ALL_PRODUCTS", "CATEGORY", "SUBCATEGORY", "SPECIFIC_PRODUCTS", "SPECIFIC_VARIANTS"], {
    required_error: "Please select application type",
  }),
  categoryId: z.string().optional(),
  subCategoryId: z.string().optional(),
  productIds: z.array(z.string()).optional(),
  variantIds: z.array(z.string()).optional(),

  // Shipping configuration
  maxShippingDiscount: z.coerce.number().optional(), // Max discount for shipping fee

  // Date range
  startDate: z.date({ required_error: "Start date is required" }),
  expiryDate: z.date({ required_error: "Expiry date is required" }),

  // Limits
  minPurchase: z.coerce.number().optional(),
  totalLimit: z.coerce.number().optional(), // Total vouchers available
  limitPerUser: z.coerce.number().optional(),

  // Behavior
  autoApply: z.boolean().default(false),
  canCombine: z.boolean().default(false),
  isActive: z.boolean().default(true),
}).refine((data) => data.expiryDate > data.startDate, {
  message: "Expiry date must be after start date",
  path: ["expiryDate"],
}).refine((data) => {
  // If discount type is PERCENT, value should be between 0-100
  if (data.discountType === "PERCENT") {
    return data.discountValue <= 100;
  }
  return true;
}, {
  message: "Percentage discount must be between 0-100",
  path: ["discountValue"],
})
  .refine(
    (data) => {
      // If CATEGORY is selected, categoryId must be provided
      if (data.applicationType === "CATEGORY") {
        return !!data.categoryId;
      }
      return true;
    },
    {
      message: "Please select a category",
      path: ["categoryId"],
    }
  )
  .refine(
    (data) => {
      // If SUBCATEGORY is selected, subCategoryId must be provided
      if (data.applicationType === "SUBCATEGORY") {
        return !!data.subCategoryId;
      }
      return true;
    },
    {
      message: "Please select a subcategory",
      path: ["subCategoryId"],
    }
  )
  .refine(
    (data) => {
      // If SPECIFIC_PRODUCTS is selected, productIds must be provided
      if (data.applicationType === "SPECIFIC_PRODUCTS") {
        return data.productIds && data.productIds.length > 0;
      }
      return true;
    },
    {
      message: "Please select at least one product",
      path: ["productIds"],
    }
  )
  .refine(
    (data) => {
      // If SPECIFIC_VARIANTS is selected, variantIds must be provided
      if (data.applicationType === "SPECIFIC_VARIANTS") {
        return data.variantIds && data.variantIds.length > 0;
      }
      return true;
    },
    {
      message: "Please select at least one variant",
      path: ["variantIds"],
    }
  );

export const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  type: z.enum(["FLASH_SALE", "DAILY_DEALS", "PAYDAY_SALE", "SEASONAL", "CLEARANCE", "NEW_ARRIVAL"]),
  discountType: z.enum(["PERCENT", "FIXED"]),
  defaultDiscount: z.coerce.number().min(0, "Discount must be positive"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date().optional(), // Optional: for permanent campaigns
  totalStockLimit: z.coerce.number().optional(),
  priority: z.coerce.number().default(0),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    customDiscount: z.coerce.number().optional(),
    customDiscountType: z.enum(["PERCENT", "FIXED"]).optional(),
    stockLimit: z.coerce.number().optional(),
  })).min(1, "At least one item is required"),
}).refine((data) => {
  // Only validate if endDate is provided
  if (data.endDate) {
    return data.endDate > data.startDate;
  }
  return true; // Valid if no endDate (permanent campaign)
}, {
  message: "End date must be after start date",
  path: ["endDate"],
}).refine((data) => {
  if (data.discountType === "PERCENT") {
    return data.defaultDiscount <= 100;
  }
  return true;
}, {
  message: "Percentage discount must be between 0-100",
  path: ["defaultDiscount"],
});

export const campaignInputSchema = z.object({
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  type: z.enum([
    "FLASH_SALE",
    "DAILY_DEALS",
    "PAYDAY_SALE",
    "SEASONAL",
    "CLEARANCE",
    "NEW_ARRIVAL"
  ]),
  discountType: z.enum(["PERCENT", "FIXED"]),
  defaultDiscount: z.coerce.number().min(0, "Discount must be positive"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(), // Optional: for permanent campaigns
  totalStockLimit: z.coerce.number().optional(),
  priority: z.coerce.number().default(0),
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(), // NULL = whole product, NOT NULL = specific variant
    customDiscount: z.coerce.number().optional(),
    customDiscountType: z.enum(["PERCENT", "FIXED"]).optional(),
    stockLimit: z.coerce.number().optional(),
  })).min(1, "At least one item is required"),
}).refine((data) => {
  // Only validate if endDate is provided
  if (data.endDate) {
    return data.endDate > data.startDate;
  }
  return true; // Valid if no endDate (permanent campaign)
}, {
  message: "End date must be after start date",
  path: ["endDate"],
}).refine((data) => {
  if (data.discountType === "PERCENT") {
    return data.defaultDiscount <= 100;
  }
  return true;
}, {
  message: "Percentage discount must be between 0-100",
  path: ["defaultDiscount"],
});
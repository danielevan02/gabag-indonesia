import z from "zod";

export const loginSchema = z.object({
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
    .regex(/^\+62[0-9]{9,13}$/, {
      message: "Phone number must be start with +62 and consist of 9-13 digit",
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
  image: z.string().min(1, "Please pick an image for the sub category"),
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
  image: z.string({ message: "Please insert an image for this sub category" }).optional(),
  discount: z.coerce.number().optional(),
  category: z.object(
    {
      id: z.string(),
      name: z.string(),
    },
    { message: "Please choose a category" }
  ),
  products: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .optional(),
});

export const variantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().optional(),
  regularPrice: z.coerce.number().min(0, "Price must be greater than or equal to 0"),
  stock: z.coerce.number().min(0, "Stock must be greater than or equal to 0"),
  discount: z.coerce.number().min(0).max(100).optional(),
  image: z.string().min(1, "Variant image is required"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  slug: z.string(),
  subCategory: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable(),
  price: z.coerce.number().min(0, "Price must be greater than or equal to 0"),
  discount: z.coerce.number().min(0).max(100).optional(),
  images: z.array(z.string()).min(1, "Image is required").optional(),
  description: z.string().min(1, "Description is required"),
  hasVariant: z.boolean().default(false),
  variants: z.array(variantSchema).optional(),
  stock: z.coerce.number().min(0, "Stock must be greater than or equal to 0").optional(),
  weight: z.coerce.number().min(0, "Please input the weight"),
  height: z.coerce.number().min(0, "Please input the height"),
  length: z.coerce.number().min(0, "Please input the length"),
  width: z.coerce.number().min(0, "Please input the width"),
});

export const eventSchema = z.object({
  name: z.string().min(1, "Please enter the name of event"),
  discount: z.coerce.number().min(0).max(100).nullable(),
  products: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      })
    )
    .nullable(),
});

export const voucherSchema = z.object({
  code: z.string().min(1, "Please enter the code"),
  type: z.enum(["FIXED", "PERCENT"]),
  value: z.coerce.number().min(0, "Value must be greater than or equal to 0"),
  expires: z.date(),
  qty: z.coerce.number().min(0, "Quantity must be greater than or equal to 0"),
  min: z.coerce.number().optional(),
  autoApply: z.boolean().default(false),
})
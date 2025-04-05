import z from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please input a valid email').min(1, 'Email is required!'),
  password: z.string().min(5, "Password must be at least 6 characters"),
})

export const addressSchema = z.object({
  province: z.string().min(1, "Please choose your province"),
  city: z.string().min(1, "Please choose your city"),
  district: z.string().min(1, "Please choose your district"),
  village: z.string().min(1, "Please choose your village"),
  address: z.string().min(1, "Please insert your address"),
  postalCode: z.string().min(1, "Please insert your postal code").max(5, 'Please insert a valid postal code')
})

export const orderSchema = z.object({
  name: z.string().min(1, "Please enter the name of the recipient"),
  province: z.string().min(1, "Please enter the province"),
  city: z.string().min(1, "Please enter the city"),
  district: z.string().min(1, "Please enter the district"),
  village: z.string().min(1, "Please enter the village"),
  postal_code: z.string().min(1, "Please enter the postal code"),
  phone: z.string().min(1, "Please enter the phone number"),
  address: z.string().min(10, "Please enter a valid address. Min. 10 characters"),
  email: z.string().email("Please enter a valid email").min(1, "Please enter your email")
})
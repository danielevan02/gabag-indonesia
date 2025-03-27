import z from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please input a valid email').min(1, 'Email is required!'),
  password: z.string().min(5, "Password must be at least 6 characters"),
})

export const addressSchema = z.object({
  province: z.string().min(1, "Please choose your province"),
  regency: z.string().min(1, "Please choose your city"),
  district: z.string().min(1, "Please choose your district"),
  village: z.string().min(1, "Please choose your village"),
  address: z.string().min(1, "Please insert your address"),
  postalCode: z.string().min(1, "Please insert your postal code").max(5, 'Please insert a valid postal code')
})
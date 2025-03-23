import z from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Please input a valid email').min(1, 'Email is required!'),
  password: z.string().min(5, "Password must be at least 6 characters"),
})
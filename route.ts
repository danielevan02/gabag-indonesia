/**
 * An array of routes that can be accessible for public.
 * This routes do not required authentication
 */
export const publicRoutes = [
  '/'
]

/**
 * An array of routes that can be accessible only for authenticated user.
 * This routes required authentication
 */
export const protectedRoutes = [
  '/orders'
]

/**
 * An array of routes that can be accessible only for authenticated user.
 * This routes required authentication
 */
export const apiAuthPrefix = '/api/auth'

/**
 * The default redirect after user success login
 */
export const DEFAULT_LOGIN_REDIRECT = '/'
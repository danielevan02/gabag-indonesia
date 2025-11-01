import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit, getRateLimitIdentifier, RateLimitPresets } from "@/lib/rate-limit";

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting to sensitive endpoints
  if (
    pathname.startsWith("/api/auth/signin") ||
    pathname.startsWith("/api/auth/callback") ||
    pathname.startsWith("/api/auth/signup")
  ) {
    const identifier = getRateLimitIdentifier(request, "auth");
    const rateLimitResult = rateLimit({
      identifier,
      ...RateLimitPresets.AUTH,
    });

    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many authentication attempts. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(
              Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            ),
          },
        }
      );
    }
  }

  // Apply rate limiting to API routes
  if (pathname.startsWith("/api/trpc")) {
    const identifier = getRateLimitIdentifier(request, "api");
    const rateLimitResult = rateLimit({
      identifier,
      ...RateLimitPresets.API,
    });

    if (!rateLimitResult.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests. Please slow down.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(
              Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
            ),
            "X-RateLimit-Limit": String(RateLimitPresets.API.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimitResult.resetTime),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(RateLimitPresets.API.limit));
    response.headers.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
    response.headers.set("X-RateLimit-Reset", String(rateLimitResult.resetTime));
    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
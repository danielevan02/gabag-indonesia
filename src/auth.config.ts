import { type NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

export const authConfig = {
  providers:[], // Required by NextAuthConfig type
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ request, auth }) {
      // Array of regex patterns of paths we want to protect
      const protectedPaths = [/\/profile/, /\/orders(\/.*)?/, /\/admin/];
      const adminPaths = [/\/admin/];

      // Get pathname from the req URL object
      const { pathname } = request.nextUrl;

      // Check if user is not authenticated and accessing a protected path
      if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;

      // Check if non-admin user is trying to access admin paths
      if (auth?.user?.role !== 'admin' && adminPaths.some((p) => p.test(pathname))) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url)
      }

      // Check for session cart cookie
      if (!request.cookies.get("sessionCartId")) {
        // Generate new session cart id cookie
        const sessionCartId = crypto.randomUUID();

        // Create new response and add the new headers
        const response = NextResponse.next({
          request: {
            headers: new Headers(request.headers),
          },
        });

        // Set newly generated sessionCartId in the response cookies
        response.cookies.set("sessionCartId", sessionCartId);

        return response;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;

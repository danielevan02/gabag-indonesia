import NextAuth, { CredentialsSignin, type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { authConfig } from "./auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import { trpc } from "@/trpc/server";

class InvalidLoginError extends CredentialsSignin {
  code: string;

  constructor(message: string) {
    super(message); // ini akan menjadi isi `.message`
    this.code = message; // ini isi `.code`, bisa berbeda kalau mau
    this.name = "InvalidLoginError";
  }
}

export const config: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (credentials == null) throw new InvalidLoginError("There is no credentials");

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user || !user.password) throw new InvalidLoginError("This user is not exist");

        const isMatches = compareSync(credentials.password as string, user.password);

        if (!isMatches) throw new InvalidLoginError("Invalid password or email");

        if (user.emailVerified == null)
          throw new InvalidLoginError("Please verify your email first");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") {
        return true;
      }

      const existingUser = await trpc.auth.getUserById({id: user.id??""});

      if (!existingUser?.emailVerified) {
        return false;
      }

      // Handle cart migration on sign in
      try {
        const { cookies } = await import("next/headers");
        const cookiesObject = await cookies();
        const sessionCartId = cookiesObject.get("sessionCartId")?.value;

        if (sessionCartId) {
          const sessionCart = await prisma.cart.findFirst({
            where: {
              sessionCartId,
            },
          });

          if (sessionCart && sessionCart.userId == null) {
            await prisma.cart.deleteMany({
              where: {
                userId: user.id,
              },
            });

            await prisma.cart.update({
              where: {
                id: sessionCart.id,
              },
              data: {
                userId: user.id,
              },
            }).catch((e) => console.log("CART UPDATE ERROR AUTH:", e));
          }
        }
      } catch (error) {
        console.log("Cart migration error:", error);
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.picture = user.image
        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              name: token.name,
            },
          });
        }
      }

      if (session?.user.name && trigger === "update") {
        token.name = session.user.name;
      }
      return token;
    },
    async session({ session, user, token, trigger }) {
      session.user.id = token.sub!;
      session.user.role = token.role as string;
      session.user.name = token.name;
      session.user.image = token.picture;

      if (trigger === "update") {
        session.user.name = user.name;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);

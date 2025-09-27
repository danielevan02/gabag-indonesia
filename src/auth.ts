import NextAuth, { CredentialsSignin, type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./lib/prisma";
import { authConfig } from "./auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import { getUserById } from "./lib/actions/user.action";
import { cookies } from "next/headers";

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

      const existingUser = await getUserById(user.id ?? "");

      if (!existingUser?.emailVerified) {
        return false;
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
        if (trigger === "signIn" || trigger === "signUp") {
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get("sessionCartId")?.value;

          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: {
                sessionCartId,
              },
            });

            if (sessionCart) {
              // Check if user already has a cart
              const existingUserCart = await prisma.cart.findFirst({
                where: {
                  userId: user.id,
                },
              });

              if (existingUserCart) {
                // Merge items from session cart to user cart
                const sessionItems = sessionCart.items as any[];
                const userItems = existingUserCart.items as any[];

                // Merge logic: add session items to user cart, combining quantities if same product
                const mergedItems = [...userItems];

                sessionItems.forEach((sessionItem) => {
                  const existingItem = mergedItems.find((userItem) =>
                    sessionItem.variantId
                      ? userItem.productId === sessionItem.productId && userItem.variantId === sessionItem.variantId
                      : userItem.productId === sessionItem.productId && userItem.variantId == null
                  );

                  if (existingItem) {
                    existingItem.qty += sessionItem.qty;
                  } else {
                    mergedItems.push(sessionItem);
                  }
                });

                // Calculate new prices
                const itemsPrice = mergedItems.reduce((acc, item) => acc + Number(item.price) * item.qty, 0);
                const taxPrice = Math.round(0.01 * itemsPrice);
                const totalPrice = itemsPrice + taxPrice;

                // Update user cart with merged items
                await prisma.cart.update({
                  where: {
                    id: existingUserCart.id,
                  },
                  data: {
                    items: mergedItems,
                    itemsPrice,
                    taxPrice,
                    totalPrice,
                    shippingPrice: 0,
                  },
                });

                // Delete session cart
                await prisma.cart.delete({
                  where: {
                    id: sessionCart.id,
                  },
                });
              } else {
                // User doesn't have cart, transfer session cart to user
                await prisma.cart.update({
                  where: {
                    id: sessionCart.id,
                  },
                  data: {
                    userId: user.id,
                    sessionCartId: "",
                  },
                });
              }
            }
          }
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

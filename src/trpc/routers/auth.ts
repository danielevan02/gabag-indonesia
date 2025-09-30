import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import prisma from "@/lib/prisma";
import { serializeType } from "@/lib/utils";
import { hash } from "bcrypt-ts-edge";
import { sendVerificationEmail } from "@/email/send-verification";
import { TRPCError } from "@trpc/server";
import { auth, signIn, signOut } from "../../auth";
import { addressSchema, signInSchema, signUpSchema } from "@/lib/schema";
import { Address } from "@/types";

const updateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  image: z.string().optional(),
  userId: z.string(),
});

// Helper functions
const getVerificationToken = async (email: string) => {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 1); // 1 hour

  const existingToken = await prisma.verificationToken.findFirst({
    where: { identifier: email },
  });

  if (existingToken) {
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: existingToken.identifier,
          token: existingToken.token,
        },
      },
    });
  }

  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return verificationToken;
};

const handleAuthError = (error: unknown, operation: string) => {
  console.error(`${operation} error:`, error);

  if (typeof error === "string") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: error,
    });
  }

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: `Failed to ${operation.toLowerCase()}`,
  });
};

const handleAuthSuccess = (message: string) => {
  return {
    success: true,
    message,
  };
};

export const authRouter = createTRPCRouter({
  // Sign in with credentials
  signIn: baseProcedure.input(signInSchema).mutation(async ({ input }) => {
    try {
      await signIn("credentials", { ...input, redirect: false });
      return handleAuthSuccess("Login Success");
    } catch (error: any) {
      console.log(error);

      return {
        success: false,
        message: error.code as string,
      };
    }
  }),

  // Register user
  register: baseProcedure.input(signUpSchema).mutation(async ({ input }) => {
    try {
      const existUser = await prisma.user.findFirst({
        where: { email: input.email },
      });

      if (existUser?.emailVerified) {
        throw "This email is already in used, please use another email";
      }

      const existPhone = await prisma.user.findFirst({
        where: { phone: input.phone },
      });

      if (existPhone?.emailVerified) {
        throw "This phone number is already used, please use another number";
      }

      const email = input.email.toLowerCase();
      const hashedPassword = await hash(input.password, 10);

      if (!existUser) {
        await prisma.user.create({
          data: {
            email,
            name: input.fullName,
            phone: input.phone,
            password: hashedPassword,
          },
        });
      } else {
        await prisma.user.update({
          where: { id: existUser.id },
          data: {
            email,
            password: hashedPassword,
            phone: input.phone,
            name: input.fullName,
          },
        });
      }

      const verificationToken = await getVerificationToken(email);
      await sendVerificationEmail(email, verificationToken.token);

      return handleAuthSuccess("Email verification is sent");
    } catch (error) {
      handleAuthError(error, "Register");
    }
  }),

  // Verify email
  verifyEmail: baseProcedure.input(z.object({ token: z.string() })).mutation(async ({ input }) => {
    try {
      if (!input.token) {
        throw "There is no token provided";
      }

      const existToken = await prisma.verificationToken.findFirst({
        where: { token: input.token },
      });

      if (!existToken) {
        throw "Invalid token";
      }

      const isExpired = new Date(existToken.expires) < new Date();
      if (isExpired) {
        throw "Token is expired";
      }

      const existUser = await prisma.user.findFirst({
        where: { email: existToken.identifier },
      });

      if (!existUser) {
        throw "User not found";
      }

      await prisma.user.update({
        where: { id: existUser.id },
        data: { emailVerified: new Date() },
      });

      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: existToken.identifier,
            token: existToken.token,
          },
        },
      });

      return handleAuthSuccess("Email verified");
    } catch (error) {
      handleAuthError(error, "Verify email");
    }
  }),

  // Sign out user
  signOut: baseProcedure.mutation(async () => {
    try {
      await signOut({ redirect: false });
      return handleAuthSuccess("Sign out successful");
    } catch (error) {
      handleAuthError(error, "Sign out");
    }
  }),

  // Get user by ID
  getUserById: baseProcedure
    .input(z.object({ id: z.string().optional() }))
    .query(async ({ input }) => {
      if (!input.id) return null;

      const user = await prisma.user.findFirst({
        where: { id: input.id },
      });

      if (user) {
        return serializeType({
          ...user,
          address: user?.address as Address,
        });
      }

      return null;
    }),

  // Get current user
  getCurrentUser: baseProcedure.query(async () => {
    const session = await auth();

    if (!session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "User is not authenticated!",
      });
    }

    const user = await prisma.user.findFirst({
      where: { id: session?.user?.id },
    });

    if (user) {
      return serializeType({
        ...user,
        address: user.address as Address,
      });
    }

    return null;
  }),

  // Update profile
  updateProfile: baseProcedure.input(updateProfileSchema).mutation(async ({ input }) => {
    try {
      const { userId, ...updateData } = input;

      const dataToUpdate: Partial<{ name: string; phone: string; image: string }> = {};

      if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
      if (updateData.phone !== undefined) dataToUpdate.phone = updateData.phone;
      if (updateData.image !== undefined) dataToUpdate.image = updateData.image;

      if (Object.keys(dataToUpdate).length === 0) {
        throw "Tidak ada data yang ingin diperbarui.";
      }

      await prisma.user.update({
        where: { id: userId },
        data: dataToUpdate,
      });

      return handleAuthSuccess("Update success!");
    } catch (error) {
      handleAuthError(error, "Update profile");
    }
  }),

  // Update address
  updateAddress: baseProcedure
    .input(addressSchema.extend({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const { id, ...addressData } = input;
        console.log("Input data:", input);
        console.log("Address data to save:", addressData);

        const result = await prisma.user.update({
          where: { id },
          data: { address: addressData },
        });

        console.log("Update result:", result);
        return handleAuthSuccess("Address successfully updated");
      } catch (error) {
        console.error("Database error:", error);
        handleAuthError(error, "Update address");
      }
    }),
});

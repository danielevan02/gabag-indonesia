/**
 * Standardized error handling utilities
 */

import { TRPCError } from "@trpc/server";
import { logger } from "./logger";

/**
 * Standard error codes for the application
 */
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",

  // Validation
  VALIDATION_ERROR: "BAD_REQUEST",
  INVALID_INPUT: "BAD_REQUEST",

  // Resource
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "CONFLICT",

  // Business Logic
  INSUFFICIENT_STOCK: "BAD_REQUEST",
  PRICE_MISMATCH: "BAD_REQUEST",
  VOUCHER_INVALID: "BAD_REQUEST",
  PAYMENT_FAILED: "BAD_REQUEST",

  // System
  INTERNAL_ERROR: "INTERNAL_SERVER_ERROR",
  DATABASE_ERROR: "INTERNAL_SERVER_ERROR",
  EXTERNAL_SERVICE_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

/**
 * Application-specific error class
 */
export class AppError extends Error {
  constructor(
    public code: keyof typeof ErrorCodes,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }

  toTRPCError(): TRPCError {
    return new TRPCError({
      code: ErrorCodes[this.code] as any,
      message: this.message,
      cause: this.details,
    });
  }
}

/**
 * Handle mutation errors with logging
 */
export function handleMutationError(
  error: unknown,
  context?: string
): never {
  // Log error with context
  logger.error(`Mutation error${context ? ` in ${context}` : ""}`, error);

  // If it's already a TRPC error, rethrow it
  if (error instanceof TRPCError) {
    throw error;
  }

  // If it's our app error, convert to TRPC error
  if (error instanceof AppError) {
    throw error.toTRPCError();
  }

  // If it's a standard Error, wrap it
  if (error instanceof Error) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error.message || "An unexpected error occurred",
    });
  }

  // For string errors (legacy)
  if (typeof error === "string") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: error,
    });
  }

  // Unknown error type
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred",
  });
}

/**
 * Success response helper
 */
export function handleMutationSuccess(
  message: string,
  data?: unknown
): { success: true; message: string; data?: unknown } {
  if (data) {
    return {
      success: true,
      message,
      data,
    };
  }
  return {
    success: true,
    message,
  };
}

/**
 * Validation error helper
 */
export function throwValidationError(
  message: string,
  details?: unknown
): never {
  throw new AppError("VALIDATION_ERROR", message, details);
}

/**
 * Not found error helper
 */
export function throwNotFoundError(
  resource: string,
  identifier?: string
): never {
  const message = identifier
    ? `${resource} with identifier '${identifier}' not found`
    : `${resource} not found`;
  throw new AppError("NOT_FOUND", message);
}

/**
 * Insufficient stock error helper
 */
export function throwInsufficientStockError(
  productName: string,
  available: number,
  requested: number
): never {
  throw new AppError(
    "INSUFFICIENT_STOCK",
    `Insufficient stock for ${productName}. Available: ${available}, Requested: ${requested}`
  );
}

/**
 * Unauthorized error helper
 */
export function throwUnauthorizedError(message?: string): never {
  throw new AppError(
    "UNAUTHORIZED",
    message || "You must be logged in to access this resource"
  );
}

/**
 * Forbidden error helper
 */
export function throwForbiddenError(message?: string): never {
  throw new AppError(
    "FORBIDDEN",
    message || "You do not have permission to access this resource"
  );
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleMutationError(error, context);
    }
  }) as T;
}

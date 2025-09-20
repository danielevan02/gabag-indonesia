import { Prisma } from "@/generated/prisma";
import { clsx, type ClassValue } from "clsx"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

type SerializeValue<T> = T extends null
  ? undefined
  : T extends Prisma.Decimal
    ? number
    : T extends bigint
      ? number
    : T extends Date
      ? Date
    : T extends (infer U)[]
      ? SerializeValue<U>[]
      : T extends Record<string, unknown>
        ? { [K in keyof T]: SerializeValue<T[K]> }
        : T;

export function serializeType<T>(data: T): SerializeValue<T> {
  if (data === null || data === undefined) {
    return undefined as SerializeValue<T>;
  }

  if (Array.isArray(data)) {
    return data.map((item) => serializeType(item)) as SerializeValue<T>;
  }

  // Handle Prisma.Decimal specifically
  if (data instanceof Prisma.Decimal) {
    return Number(data) as SerializeValue<T>;
  }

  // Handle Date objects - keep as Date
  if (data instanceof Date) {
    return data as SerializeValue<T>;
  }

  // Handle bigint
  if (typeof data === "bigint") {
    return Number(data) as SerializeValue<T>;
  }

  if (typeof data === "object") {
    const result = {} as Record<string, unknown>;

    for (const [key, value] of Object.entries(data)) {
      if (value === null || value === undefined) {
        result[key] = undefined;
      } else if (value instanceof Prisma.Decimal) {
        result[key] = Number(value);
      } else if (value instanceof Date) {
        result[key] = value; // Keep Date as Date
      } else if (typeof value === "bigint") {
        result[key] = Number(value);
      } else if (Array.isArray(value)) {
        result[key] = value.map((item) => serializeType(item));
      } else if (typeof value === "object") {
        result[key] = serializeType(value);
      } else {
        result[key] = value;
      }
    }

    return result as SerializeValue<T>;
  }

  return data as SerializeValue<T>;
}

export const updateQueryParams = (
  newParams: Record<string, string | undefined>,
  currentParams: URLSearchParams,
  router: AppRouterInstance
) => {
  const updatedParams = new URLSearchParams(currentParams.toString());
  Object.entries(newParams).forEach(([key, value]) => {
    if (value) {
      updatedParams.set(key, value);
    } else {
      updatedParams.delete(key);
    }
  });

  const queryString = updatedParams.toString();
  router.replace(queryString ? `?${queryString}` : "/products");
};

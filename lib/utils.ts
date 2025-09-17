import { Prisma } from "@prisma/client";
import { clsx, type ClassValue } from "clsx";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type SerializeValue<T> = T extends null
  ? undefined
  : T extends Prisma.Decimal
    ? number
    : T extends bigint
      ? number
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

  if (typeof data === "object") {
    const result = {} as Record<string, unknown>;

    for (const [key, value] of Object.entries(data)) {
      if (value === null) {
        result[key] = undefined;
      } else if (value?.constructor?.name === "Decimal") {
        result[key] = Number(value);
      } else if (typeof value === "bigint") {
        result[key] = Number(value);
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function formatError(error: any) {
  if (error.name === "ZodError") {
    const fieldErrors = Object.keys(error.errors).map((field) => error.errors[field].message);
    return fieldErrors.join(". ");
  } else if (error.name === "PrismaClientKnownRequestError" && error.code === "P2002") {
    const field = error.meta?.target ? error.meta.target[0] : "Field";
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
  } else {
    return typeof error.message === "string" ? error.message : JSON.stringify(error.message);
  }
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

export const generateFileName = (prefix: string, name: string, imageUrl: string) => {
  const clearName = name.trim().toLowerCase();
  const format = imageUrl.split(".").pop();
  return `${prefix}_${clearName}-${Date.now()}.${format}`;
};

import { clsx, type ClassValue } from "clsx"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function formatError(error: any){
  if(error.name === 'ZodError') {
    const fieldErrors = Object.keys(error.errors).map((field) => error.errors[field].message)
    return fieldErrors.join(". ")
  } else if ( error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002'){
    const field = error.meta?.target ? error.meta.target[0] : "Field"
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
  } else {
    return typeof error.message === 'string' ? error.message : JSON.stringify(error.message)
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
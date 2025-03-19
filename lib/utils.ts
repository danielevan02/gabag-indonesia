import { clsx, type ClassValue } from "clsx"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
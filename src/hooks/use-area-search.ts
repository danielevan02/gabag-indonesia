import { useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";
import { Areas } from "@/types";
import { trpc } from "@/trpc/client";

interface UseAreaSearchProps {
  city: string;
  district: string;
  postalCode: string;
  enabled: boolean;
}

const DEBOUNCE_DELAY = 1000;

export const useAreaSearch = ({ city, district, postalCode, enabled }: UseAreaSearchProps) => {
  const [area, setArea] = useState<Areas>();
  const utils = trpc.useUtils();

  const debouncedFetch = useMemo(
    () =>
      debounce(async () => {
        if (!enabled) return;

        try {
          const searchQuery = `${city} ${district} ${postalCode}`.trim();
          if (!searchQuery) return;

          const res = await utils.courier.getMapsAreas.fetch(searchQuery);
          setArea((prev) => (prev === res[0] ? prev : res[0]));
        } catch (error) {
          console.error("Error fetching maps areas:", error);
        }
      }, DEBOUNCE_DELAY),
    [city, district, postalCode, enabled, utils.courier.getMapsAreas]
  );

  useEffect(() => {
    if (enabled) {
      debouncedFetch();
      return () => debouncedFetch.cancel();
    }
  }, [city, district, postalCode, enabled, debouncedFetch]);

  return { area };
};
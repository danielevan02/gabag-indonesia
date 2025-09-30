import { useEffect, useState, useTransition } from "react";
import { CartItem, Rates } from "@/types";
import { trpc } from "@/trpc/client";

interface UseCourierRatesProps {
  areaId?: string;
  postalCode: string;
  cartItems: CartItem[];
  enabled: boolean;
}

export const useCourierRates = ({ areaId, postalCode, cartItems, enabled }: UseCourierRatesProps) => {
  const [rateList, setRateList] = useState<Rates[]>();
  const [isLoading, startTransition] = useTransition();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!enabled || !areaId) {
      setRateList(undefined);
      return;
    }

    const fetchCourierRates = async () => {
      startTransition(async () => {
        const items = cartItems.map((item) => ({
          name: item.name,
          value: item.price,
          quantity: item.qty,
          weight: item.weight || 0,
          height: item.height || 1,
          length: item.length || 1,
          width: item.width || 1,
        }));

        try {
          const res = await utils.courier.getCourierRates.fetch({
            destination_area_id: areaId,
            destination_postal_code: postalCode,
            items,
          });

          setRateList(res);
        } catch (error) {
          console.error("Error fetching courier rates:", error);
          setRateList([]);
        }
      });
    };

    fetchCourierRates();
  }, [areaId, postalCode, cartItems, enabled, utils.courier.getCourierRates]);

  return { rateList, isLoading };
};
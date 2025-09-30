import { CircleAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Areas, Rates } from "@/types";
import { CourierRateItem } from "./courier-rate-item";

interface ShippingMethodListProps {
  rateList?: Rates[];
  area?: Areas;
  isLoading: boolean;
  selectedCourier?: string;
  onSelectCourier: (courier: string, price: number) => void;
}

export const ShippingMethodList: React.FC<ShippingMethodListProps> = ({
  rateList,
  area,
  isLoading,
  selectedCourier,
  onSelectCourier,
}) => {
  if (isLoading) {
    return <Skeleton className="rounded-md w-full h-14" />;
  }

  if (!rateList) {
    return (
      <div className="py-5 bg-neutral-100 dark:bg-neutral-800 rounded-md text-xs text-center text-neutral-500 dark:text-neutral-300">
        Enter your shipping address to view available shipping methods.
      </div>
    );
  }

  if (rateList.length === 0 || !area) {
    return (
      <div className="p-5 bg-red-100 border border-red-400 flex rounded-md gap-2">
        <CircleAlert className="w-10 h-fit text-red-400" />
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-sm">Shipping not available</p>
          <p className="text-xs">
            Your order cannot be shipped to the selected address. Review your address to
            ensure it&apos;s correct and try again, or select a different address.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border max-h-60 overflow-scroll">
      {rateList.map((rate) => (
        <CourierRateItem
          key={`${rate.company}-${rate.type}`}
          rate={rate}
          area={area}
          isSelected={`${rate.company}-${rate.type}` === selectedCourier}
          onSelect={onSelectCourier}
        />
      ))}
    </div>
  );
};
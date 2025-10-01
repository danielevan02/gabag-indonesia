import { cn } from "@/lib/utils";
import { Areas, Rates } from "@/types";
import { WAREHOUSE_LOCATION } from "@/lib/constants";

interface CourierRateItemProps {
  rate: Rates;
  area: Areas;
  isSelected: boolean;
  onSelect: (courier: string, price: number) => void;
}

export const CourierRateItem: React.FC<CourierRateItemProps> = ({
  rate,
  area,
  isSelected,
  onSelect,
}) => {
  const rateId = `${rate.company}-${rate.type}`;

  return (
    <div
      className={cn(
        "flex justify-between py-3 px-4 border-b hover:bg-neutral-100 transition-all cursor-pointer",
        isSelected && "bg-neutral-200"
      )}
      onClick={() => onSelect(rateId, rate.price)}
    >
      <div className="flex gap-3">
        <div
          className={cn(
            "w-4 h-4 rounded-full border transition",
            isSelected && "border-4 border-foreground"
          )}
        />
        <div className="flex flex-col gap-1 w-40 md:w-auto">
          <p className="text-xs">
            {rate.courier_name} - {rate.courier_service_name}
          </p>
          {rate.duration && (
            <p className="text-neutral-500 text-xs">{rate.duration}</p>
          )}
          <p className="text-xs text-neutral-500">
            Sending from {WAREHOUSE_LOCATION} to{" "}
            <span className="uppercase">
              {area.administrative_division_level_2_name}
            </span>
          </p>
        </div>
      </div>
      <p className="font-semibold text-sm">Rp {rate.price.toLocaleString()}</p>
    </div>
  );
};
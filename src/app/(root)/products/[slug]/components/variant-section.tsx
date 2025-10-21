import { cn } from "@/lib/utils";
import { RouterOutputs } from "@/trpc/routers/_app";
import Image from "next/image";

export type Variant = RouterOutputs['product']['getBySlug']['variants'][number]

interface VariantSectionProps {
  variants: Variant[];
  selectedVariant?: Variant;
  onVariantSelect: (variant: Variant) => void;
}

export const VariantSection = ({ variants, selectedVariant, onVariantSelect }: VariantSectionProps) => (
  <>
    <span className="text-sm font-semibold">Select Variants</span>
    <div className="grid grid-cols-4 gap-2 mt-3">
      {variants?.map((variant) => (
        <VariantItem 
          key={variant.id}
          variant={variant}
          isSelected={selectedVariant === variant}
          onSelect={onVariantSelect}
        />
      ))}
    </div>
  </>
);

export const VariantItem = ({
  variant,
  isSelected,
  onSelect
}: {
  variant: Variant;
  isSelected: boolean;
  onSelect: (variant: Variant) => void;
}) => (
  <div
    className="relative col-span-1 flex flex-col items-center gap-1 rounded-lg"
    onClick={() => variant.stock > 0 && onSelect(variant)}
  >
    <div className="relative">
      <Image
        src={variant.mediaFile.secure_url}
        alt={variant.name}
        width={100}
        height={100}
        className={cn(
          "size-full object-cover rounded-md hover:border-2 hover:border-primary transition-all",
          isSelected && "border-2 border-primary"
        )}
      />
      {variant.stock < 1 && (
        <div className="absolute inset-0 rounded-md bg-white/70 flex items-center justify-center p-3">
          <p className="text-center text-sm text-red-600">Out of Stock!</p>
        </div>
      )}
      {variant.campaign && (
        <div className="absolute top-1 right-1">
          <span className="px-1.5 py-0.5 text-[10px] font-bold text-white bg-orange-600 rounded shadow-sm">
            {variant.campaign.name}
          </span>
        </div>
      )}
    </div>
    <h3 className="text-xs text-neutral-500 dark:text-neutral-300 text-center">{variant.name}</h3>
  </div>
);
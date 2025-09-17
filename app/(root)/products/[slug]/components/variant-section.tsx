import { cn } from "@/lib/utils";
import { Variant } from "@/types";
import Image from "next/image";

interface VariantSectionProps {
  variants: Variant[];
  selectedVariant?: Variant;
  onVariantSelect: (variant: Variant) => void;
}

export const VariantSection = ({ variants, selectedVariant, onVariantSelect }: VariantSectionProps) => (
  <>
    <span className="uppercase tracking-widest text-sm">Variants:</span>
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
        src={variant.image}
        alt={variant.name}
        width={100}
        height={100}
        className={cn(
          "size-full object-cover rounded-md hover:border-2 hover:border-black/50 transition-all",
          isSelected && "border-2 border-black/50"
        )}
      />
      {variant.stock < 1 && (
        <div className="absolute inset-0 rounded-md bg-white/70 flex items-center justify-center p-3">
          <p className="text-center text-sm text-red-600">Out of Stock!</p>
        </div>
      )}
    </div>
    <h3 className="text-xs text-neutral-500 dark:text-neutral-300">{variant.name}</h3>
  </div>
);
import { Variant } from "./variant-section";

interface PriceTagProps {
  regularPrice?: number;
  price: number;
  discount?: number;
  variant?: Variant;
  hasVariant: boolean;
}

export const PriceTag = ({ price, regularPrice, discount, variant, hasVariant }: PriceTagProps) => {
  const displayPrice = variant ? variant.price : price;
  const displayRegularPrice = variant
    ? variant.regularPrice
    : regularPrice === 0 ? null : regularPrice;
  const hasDiscount = discount != null && discount > 0;

  if (!hasDiscount) {
    return (
      <h4 className="font-semibold text-lg tracking-wider mb-5">
        {!variant && hasVariant && <span className="font-normal text-sm">from </span>}
        Rp {displayPrice.toLocaleString()}
      </h4>
    );
  }

  return (
    <div className="flex flex-row md:flex-col lg:flex-row gap-3 md:gap-0 lg:gap-3 mb-5 items-center md:items-start lg:items-center">
      <p className="font-semibold md:text-lg tracking-wider">
        {!variant && hasVariant && <span className="font-normal text-sm">from </span>}
        Rp {displayPrice.toLocaleString()}
      </p>

      {displayRegularPrice != null && (
        <p className="line-through text-neutral-400 text-sm md:text-base">
          Rp {displayRegularPrice.toLocaleString()}
        </p>
      )}

      <p className="text-green-700 font-medium text-sm md:text-base">{discount}% off</p>
    </div>
  );
};
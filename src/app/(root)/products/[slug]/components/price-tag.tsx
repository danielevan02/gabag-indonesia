import { Variant } from "./variant-section";

interface PriceTagProps {
  regularPrice?: number;
  price: number;
  discount?: number;
  variant?: Variant;
  hasVariant: boolean;
  campaign?: {
    name: string;
    type: string;
    discount: number;
    discountType: "PERCENT" | "FIXED";
  };
}

export const PriceTag = ({ price, regularPrice, discount, variant, hasVariant, campaign }: PriceTagProps) => {
  const displayPrice = variant ? variant.price : price;
  const displayRegularPrice = variant
    ? variant.regularPrice
    : regularPrice === 0 ? null : regularPrice;

  // Calculate discount percentage to display
  let displayDiscount = 0;

  if (variant) {
    // Variant is selected
    if (variant.campaign) {
      // Variant has campaign
      const campaign = variant.campaign;

      if (campaign.discountType === "PERCENT") {
        // Campaign discount is PERCENT - use directly
        displayDiscount = campaign.discount;
      } else {
        // Campaign discount is FIXED - calculate percentage
        if (variant.regularPrice > 0) {
          displayDiscount = Math.round((campaign.discount / variant.regularPrice) * 100);
        }
      }
    } else if (variant.discount) {
      // No campaign, use variant's own discount
      displayDiscount = variant.discount;
    }
  } else {
    // No variant selected - check for product campaign first
    if (campaign) {
      // Product has campaign
      if (campaign.discountType === "PERCENT") {
        // Campaign discount is PERCENT - use directly
        displayDiscount = campaign.discount;
      } else {
        // Campaign discount is FIXED - calculate percentage
        if (regularPrice && regularPrice > 0) {
          displayDiscount = Math.round((campaign.discount / regularPrice) * 100);
        }
      }
    } else {
      // No campaign, use product discount
      displayDiscount = discount || 0;
    }
  }

  const hasDiscount = displayDiscount > 0;

  if (!hasDiscount) {
    return (
      <h4 className="font-semibold text-2xl tracking-wider mb-5">
        {!variant && hasVariant && <span className="font-normal text-sm">from </span>}
        Rp {displayPrice.toLocaleString()}
      </h4>
    );
  }

  return (
    <div className="flex flex-row md:flex-col lg:flex-row gap-2 md:gap-0 lg:gap-3 mb-5 items-center md:items-start lg:items-center">
      <p className="flex gap-2 font-semibold tracking-wider">
        {!variant && hasVariant && <span className="font-normal text-sm">from </span>}
        <span className="text-2xl">Rp {displayPrice.toLocaleString()}</span>
      </p>

      {displayRegularPrice != null && (
        <p className="line-through text-neutral-400 text-sm md:text-lg">
          Rp {displayRegularPrice.toLocaleString()}
        </p>
      )}

      <p className="text-green-700 font-medium text-sm md:text-base">{displayDiscount}% off</p>
    </div>
  );
};
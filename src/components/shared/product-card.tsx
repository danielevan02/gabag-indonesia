import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
  name: string;
  price: number;
  regularPrice: number;
  discount?: number;
  images: string;
  slug: string;
  hasVariant: boolean;
  className?: string;
  subCategory: {
    name: string;
  };
  campaign?: {
    name: string;
    type: string;
    discount: number;
    discountType: "PERCENT" | "FIXED";
  } | null;
  variants?: {
    price: number;
    regularPrice: number
  }[];
}

interface PriceTagProps {
  price: number;
  regularPrice: number;
  hasVariant: boolean;
  variants?: {
    price: number;
    regularPrice: number;
  }[];
  discount?: number;
  campaign?: {
    name: string;
    type: string;
    discount: number;
    discountType: "PERCENT" | "FIXED";
  } | null;
}

const ProductCard: React.FC<ProductCardProps> = ({
  discount,
  images,
  name,
  regularPrice,
  hasVariant,
  variants,
  price,
  slug,
  subCategory,
  campaign,
  className,
}) => {
  return (
    <Link
      prefetch
      href={`/products/${slug}`}
      className={cn(
        "relative flex flex-col shadow-0 hover:shadow flex-1 overflow-hidden group",
        className
      )}
    >
      {campaign && <CampaignBadge campaign={campaign} />}

      {/* Image Container */}
      <div className="product-card-image-container">
        <Image
          src={images}
          className="size-full object-cover group-hover:scale-110 transition-all"
          alt={`${name} product image`}
          width={450}
          height={450}
          sizes="(max-width: 768px) 224px, (max-width: 1024px) 320px, (max-width: 1280px) 384px, 450px"
        />
      </div>

      {/* Content Container */}
      <div className="p-1 mt-2 flex-1 flex flex-col justify-between h-auto">
        <div className="flex flex-col">
          <h4 className="text-foreground/50 uppercase text-xs font-semibold">{subCategory.name}</h4>
          <h3 className="line-clamp-2 text-foreground/80 text-sm lg:text-base font-semibold">
            {name}
          </h3>
        </div>

        <PriceTag
          regularPrice={regularPrice}
          price={price}
          hasVariant={hasVariant}
          variants={variants}
          discount={discount}
          campaign={campaign}
        />
      </div>
    </Link>
  );
};

// Helper functions for price calculations
const getLowestPrice = ({variants}: { variants: { price: number }[]}): number => {
  return Math.min(...variants.map((variant) => variant.price));
};

const hasVariantPriceDifferences = ({variants}: { variants: { price: number }[]}): boolean => {
  return new Set(variants.map((variant) => variant.price)).size > 1;
};

const formatPrice = (price: number): string => {
  return `Rp ${price.toLocaleString()}`;
};

// Component for displaying discount badge
const DiscountBadge: React.FC<{
  discount?: number;
  campaign?: {
    discount: number;
    discountType: "PERCENT" | "FIXED";
  } | null;
  regularPrice: number;
  hasVariant: boolean;
  variants?: {
    price: number;
    regularPrice: number;
  }[];
}> = ({ discount, campaign, regularPrice, hasVariant, variants }) => {
  let displayDiscount = 0;

  if (hasVariant && variants && variants.length > 0) {
    // Product has variants - find the biggest discount
    const discounts: number[] = [];

    // 1. Product discount (if exists)
    if (discount && discount > 0) {
      discounts.push(discount);
    }

    // 2. All variant discounts
    variants.forEach((variant) => {
      if (variant.regularPrice > 0 && variant.price >= 0) {
        const variantDiscountPercent = Math.round(
          ((variant.regularPrice - variant.price) / variant.regularPrice) * 100
        );
        if (variantDiscountPercent > 0 && isFinite(variantDiscountPercent)) {
          discounts.push(variantDiscountPercent);
        }
      }
    });

    // 3. Campaign discount (if exists)
    if (campaign && campaign.discount > 0) {
      let campaignDiscountPercent = 0;
      if (campaign.discountType === "PERCENT") {
        campaignDiscountPercent = campaign.discount;
      } else {
        // FIXED: calculate percentage from fixed amount
        if (regularPrice > 0) {
          campaignDiscountPercent = Math.round((campaign.discount / regularPrice) * 100);
        }
      }
      if (campaignDiscountPercent > 0 && isFinite(campaignDiscountPercent)) {
        discounts.push(campaignDiscountPercent);
      }
    }

    // Get the biggest discount
    displayDiscount = discounts.length > 0 ? Math.max(...discounts) : 0;
  } else {
    // Product without variants - simple logic
    if (campaign && campaign.discount > 0) {
      // Campaign discount
      if (campaign.discountType === "PERCENT") {
        displayDiscount = campaign.discount;
      } else {
        if (regularPrice > 0) {
          displayDiscount = Math.round((campaign.discount / regularPrice) * 100);
        }
      }
    } else if (discount && discount > 0) {
      // Product discount
      displayDiscount = discount;
    }
  }

  if (!displayDiscount || displayDiscount === 0) {
    return <div className="h-6" />;
  }

  return (
    <div className="bg-destructive text-white py-px text-xs font-bold relative min-w-9 w-min my-1 flex justify-center">
      {displayDiscount}%
    </div>
  );
};

// Component for displaying campaign badge
const CampaignBadge = ({ campaign }: { campaign: { name: string; type: string; discount: number; discountType: "PERCENT" | "FIXED" } }) => {
  const getCampaignColor = (type: string) => {
    switch (type) {
      case "FLASH_SALE":
        return "bg-orange-600";
      case "PAYDAY_SALE":
        return "bg-primary";
      case "SEASONAL":
        return "bg-[#bcb6db]";
      default:
        return "bg-destructive";
    }
  };
  return (
    <div className="absolute top-3 right-0 z-10 flex flex-col items-end gap-1">
      <p className={cn(
        "px-2 py-1 text-white text-xs font-bold uppercase",
        getCampaignColor(campaign.type)
      )}>
        {campaign.name}
      </p>
    </div>
  );
};

// Component for displaying variant prices
const VariantPricing = ({ variants }: { variants: { price: number; regularPrice: number;}[]  }) => {
  const hasPriceDifferences = hasVariantPriceDifferences({variants});
  const firstVariant = variants[0];
  

  if (hasPriceDifferences) {
    const lowestPrice = getLowestPrice({variants});
    return (
      <div className="flex gap-1">
        <span className="text-sm">from</span>
        <p className="text-sm lg:text-base">{formatPrice(lowestPrice)}</p>
      </div>
    );
  }

  // Single variant or all variants have the same price
  const hasDiscount = firstVariant.regularPrice !== firstVariant.price;

  if (hasDiscount) {

    return (
      <div className="flex gap-1">
        <h4 className="line-through text-neutral-400 text-xs lg:text-sm">
          {formatPrice(firstVariant.regularPrice)}
        </h4>
        <h4 className="text-sm lg:text-base">{formatPrice(firstVariant.price)}</h4>
      </div>
    );
  }

  return <h4 className="text-sm lg:text-base">{formatPrice(firstVariant.price)}</h4>;
};

// Component for displaying regular pricing (no variants)
const RegularPricing: React.FC<{ price: number; regularPrice: number }> = ({
  price,
  regularPrice,
}) => {
  const hasDiscount = price !== regularPrice;

  if (hasDiscount) {
    return (
      <div className="flex md:flex-row gap-1">
        <h4 className="line-through text-neutral-400 text-xs lg:text-sm">{formatPrice(regularPrice)}</h4>
        <h4 className="text-sm lg:text-base">{formatPrice(price)}</h4>
      </div>
    );
  }

  return <h4 className="text-sm lg:text-base">{formatPrice(price)}</h4>;
}; 

// Main PriceTag component
const PriceTag: React.FC<PriceTagProps> = ({
  price,
  regularPrice,
  hasVariant,
  variants,
  discount,
  campaign,
}) => {
  return (
    <div>
      <DiscountBadge
        discount={discount}
        campaign={campaign}
        regularPrice={regularPrice}
        hasVariant={hasVariant}
        variants={variants}
      />
      {hasVariant && variants ? (
        <VariantPricing variants={variants} />
      ) : (
        <RegularPricing price={price} regularPrice={regularPrice} />
      )}
    </div>
  );
};

export default ProductCard;

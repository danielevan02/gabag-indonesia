import { cn } from "@/lib/utils";
import Link from "next/link";
import BlurImage from "./blur-image";

interface ProductCardProps {
  name: string;
  price: number;
  regularPrice: number;
  discount?: number;
  image: string;
  slug: string;
  hasVariant: boolean;
  className?: string;
  subCategory: {
    name: string;
  };
  event?: {
    name: string;
  };
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
}

const ProductCard: React.FC<ProductCardProps> = ({
  discount,
  image,
  name,
  regularPrice,
  hasVariant,
  variants,
  price,
  slug,
  subCategory,
  event,
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
      <EventBadge event={event} />

      {/* Image Container */}
      <div className="product-card-image-container">
        <BlurImage
          src={image}
          className="w-full object-cover h-full group-hover:scale-110 transition-all"
          alt={`${name} product image`}
          height={200}
          width={200}
          dynamic
        />
      </div>

      {/* Content Container */}
      <div className="p-1 mt-2 flex-1 flex flex-col justify-between h-auto">
        <div className="flex flex-col">
          <h4 className="text-foreground/50 uppercase text-xs font-semibold">{subCategory.name}</h4>
          <h3 className="line-clamp-2 text-foreground/80 text-sm lg:text-base font-semibold min-h-14">
            {name}
          </h3>
        </div>

        <PriceTag
          regularPrice={regularPrice}
          price={price}
          hasVariant={hasVariant}
          variants={variants}
          discount={discount}
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
const DiscountBadge: React.FC<{ discount?: number }> = ({ discount }) => {
  if (!discount || discount === 0) {
    return <div className="h-6" />;
  }

  return (
    <div className="bg-red-600 text-white py-px text-xs font-bold relative min-w-9 w-min my-1 flex justify-center">
      {discount}%
    </div>
  );
};

// Component for displaying event badge
const EventBadge = ({ event }: { event?: { name: string } }) => {
  if (!event?.name) return null;

  return (
    <p className="absolute bg-red-700 top-3 px-1 py-1 capitalize right-0 z-10 text-white text-sm font-bold">
      {event.name}
    </p>
  );
};

// Component for displaying variant prices
const VariantPricing = ({ variants }: { variants: { price: number; regularPrice: number;}[] }) => {
  const hasPriceDifferences = hasVariantPriceDifferences({variants});
  const firstVariant = variants[0];

  if (hasPriceDifferences) {
    const lowestPrice = getLowestPrice({variants});
    return (
      <div className="flex gap-1">
        <span>from</span>
        <p>{formatPrice(lowestPrice)}</p>
      </div>
    );
  }

  // Single variant or all variants have the same price
  const hasDiscount = firstVariant.regularPrice !== firstVariant.price;

  if (hasDiscount) {
    return (
      <div className="flex flex-col md:flex-row gap-1">
        <h4 className="line-through text-neutral-400 text-sm">
          {formatPrice(firstVariant.regularPrice)}
        </h4>
        <h4>{formatPrice(firstVariant.price)}</h4>
      </div>
    );
  }

  return <h4>{formatPrice(firstVariant.price)}</h4>;
};

// Component for displaying regular pricing (no variants)
const RegularPricing: React.FC<{ price: number; regularPrice: number }> = ({
  price,
  regularPrice,
}) => {
  const hasDiscount = price !== regularPrice;

  if (hasDiscount) {
    return (
      <div className="flex flex-col md:flex-row gap-1">
        <h4 className="line-through text-neutral-400 text-sm">{formatPrice(regularPrice)}</h4>
        <h4>{formatPrice(price)}</h4>
      </div>
    );
  }

  return <h4>{formatPrice(price)}</h4>;
};

// Main PriceTag component
const PriceTag: React.FC<PriceTagProps> = ({
  price,
  regularPrice,
  hasVariant,
  variants,
  discount,
}) => {
  return (
    <>
      <DiscountBadge discount={discount} />
      {hasVariant && variants ? (
        <VariantPricing variants={variants} />
      ) : (
        <RegularPricing price={price} regularPrice={regularPrice} />
      )}
    </>
  );
};

export default ProductCard;

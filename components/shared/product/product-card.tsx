import { cn } from "@/lib/utils";
import { Variant } from "@/types";
import { Event, SubCategory } from "@prisma/client";
import Link from "next/link";
import BlurImage from "../blur-image";

interface ProductCardProps {
  name: string;
  price: number;
  regularPrice: number;
  discount?: number;
  image: string;
  slug: string;
  hasVariant: boolean
  className?: string;
  subCategory: SubCategory
  event?: Event
  variants?: Variant[]
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
  className
}) => {
  return (
    <Link 
      prefetch
      href={`/products/${slug}`} 
      className={cn(`
        relative 
        flex 
        flex-col 
        shadow-0 
        hover:shadow 
        flex-1 
        overflow-hidden 
        group 
        `, 
        className
      )}
    >
      {event?.name && <p className="absolute bg-red-700 top-3 px-1 py-1 capitalize right-0 z-10 text-white text-sm font-bold">{event.name}</p>}
      {/* IMAGE CONTAINER */}
      <div className={`
          overflow-hidden 
          min-h-64 
          max-h-64 
          md:min-h-96
          md:max-h-96
          xl:min-h-[450px]
          xl:max-h-[450px]
          w-full`
        }
      >
        <BlurImage
          src={image}
          className="w-full object-cover h-full group-hover:scale-110 transition-all"
          alt="Product"
          height={200}
          width={200}
          dynamic
        />
      </div>

      <div className="p-1 mt-2 flex-1 flex flex-col justify-between h-auto">
        <div className="flex flex-col">
          <h4 className="text-foreground/50 uppercase text-xs font-semibold">{subCategory.name}</h4>
          <h3 className="line-clamp-2 text-foreground/80 text-sm lg:text-base font-semibold min-h-14">{name}</h3>
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

interface PriceTagProps {
  price: number; 
  regularPrice: number;
  hasVariant: boolean;
  variants?: Variant[]
  discount?: number
}

const PriceTag = ({price, regularPrice, hasVariant, variants, discount}: PriceTagProps) => {
  let lowestPrice;
  if(variants){
    lowestPrice = Math.min(...variants.map((v) => v.price))
  }

  const hasDifferentVariantPrice = variants 
  ? new Set(variants.map(v => v.price)).size > 1 
  : false;
  return(
    <>
      {discount !== 0 ? (
        <div className="bg-red-600 text-white py-px text-xs font-bold relative min-w-9 w-min my-1 flex justify-center">{discount}%</div>
      ) : (
        <div className="h-6" />
      )}
      {hasVariant ? (
        hasDifferentVariantPrice ? (
          <div className="flex gap-1">
            <span>from</span>
            <p>Rp {lowestPrice?.toLocaleString()}</p>
          </div>
        ):(
          variants?.[0].regularPrice !== variants?.[0].price ? (
            <div className="flex flex-col md:flex-row gap-1">
              <h4 className="line-through text-neutral-400 text-sm">Rp {variants?.[0].regularPrice.toLocaleString()}</h4>
              <h4>Rp {variants?.[0].price.toLocaleString()}</h4>
            </div>
          ):(
            <h4>Rp {variants?.[0].price.toLocaleString()}</h4>
          )
        )
      ):(
        price !== regularPrice ? (
          <div className="flex flex-col md:flex-row gap-1">
            <h4 className="line-through text-neutral-400 text-sm">Rp {(regularPrice??0).toLocaleString()}</h4>
            <h4>Rp {price.toLocaleString()}</h4>
          </div>
        ):(
          <h4>Rp {price.toLocaleString()}</h4>
        )
      )}
    </>
  )
}

export default ProductCard;

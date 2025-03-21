import { cn } from "@/lib/utils";
import { Category } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  name: string;
  categoryName: string;
  price: bigint;
  discount?: number;
  rating: number;
  image: string;
  slug: string;
  className?: string;
  banner?: string;
  category: Category[]
}

const ProductCard: React.FC<ProductCardProps> = ({
  categoryName,
  discount,
  image,
  name,
  price,
  slug,
  banner,
  category,
  className
}) => {
  const categoryDiscount = category.reduce((prev, curr) => prev + (curr.discount??0), 0)
  return (
    <Link 
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
      {banner && <p className="absolute bg-red-700 top-3 px-1 py-1 capitalize right-0 z-10 text-white text-sm font-bold">{banner}</p>}
      <div className={`
          overflow-hidden 
          min-h-64 
          max-h-64 
          md:min-h-96
          md:max-h-96
          lg:min-h-[600px]
          lg:mx-h-[600px]
          w-full`
        }
      >
        <Image
          src={image}
          className="w-full object-cover h-full group-hover:scale-110 transition-all"
          alt="Product"
          height={500}
          width={500}
        />
      </div>
      <div className="p-1 md:p-3 flex-1 flex flex-col justify-between h-auto">
        <div className="flex flex-col">
          <h4 className="text-neutral-500 uppercase">{categoryName}</h4>
          <h3 className="line-clamp-2 text-neutral-600 font-semibold tracking-wider">{name}</h3>
        </div>
        <div>
          {discount !== 0 || categoryDiscount !==0 ? (
            <div className="bg-red-600 text-white px-2 py-px text-xs font-bold relative w-min my-1">{discount || categoryDiscount}%</div>
          ) : (
            <div className="h-6" />
          )}
          <PriceTag price={Number(price)} discount={discount || categoryDiscount}/>
        </div>
      </div>
    </Link>
  );
};

const PriceTag = ({price, discount}:{price: number; discount?: number;}) => {
  let lastPrice = price;
  if(discount){
    lastPrice = Number(price) - Number(price)*(discount/100)
  }
  return(
    <>
      {discount ? (
        <div className="flex flex-col md:flex-row gap-1">
          <h4 className="line-through text-neutral-400 text-sm">Rp{price.toLocaleString()}</h4>
          <h4>Rp{lastPrice.toLocaleString()}</h4>
        </div>
      ):(
        <h4>Rp{lastPrice.toLocaleString()}</h4>
      )}
    </>
  )
}

export default ProductCard;

import Image from "next/image";
import Link from "next/link";

interface ProductCardProps {
  name: string;
  category: string;
  price: number;
  discount?: number;
  rating: number;
  image: string;
  slug: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  category,
  discount,
  image,
  name,
  price,
  slug,
}) => {
  return (
    <Link href={`/products/${slug}`} className="flex flex-col shadow-2xs hover:shadow min-w-72 max-w-72 md:min-w-96 md:max-w-96 overflow-hidden group">
      <div className="overflow-hidden min-h-80 max-h-80 md:min-h-[500px] md:max-h-[500px] w-full">
        <Image
          src={image}
          className="w-full object-cover h-full group-hover:scale-110 transition-all"
          alt="Product"
          height={500}
          width={500}
        />
      </div>
      <div className="p-3">
        <h4 className="text-neutral-500">{category}</h4>
        <h3 className="font-bold">{name}</h3>
        {discount ? (
          <div className="bg-red-600 text-white px-2 py-px text-xs font-bold relative w-min my-1">{discount}%</div>
        ) : (
          <div className="h-6" />
        )}
        <PriceTag price={price} discount={discount}/>
      </div>
    </Link>
  );
};

const PriceTag = ({price, discount}:{price: number; discount?: number;}) => {
  let lastPrice = price;
  if(discount){
    lastPrice = price - price*(discount/100)
  }
  return(
    <>
      {discount ? (
        <div className="flex">
          <h4 className="line-through text-neutral-400 text-sm">Rp{price.toLocaleString()}</h4>
          <h4 className="font-bold">Rp{lastPrice.toLocaleString()}</h4>
        </div>
      ):(
        <h4 className="font-bold">Rp{lastPrice.toLocaleString()}</h4>
      )}
    </>
  )
}

export default ProductCard;

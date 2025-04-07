"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { addToCart } from "@/lib/actions/cart.action";
import { cn } from "@/lib/utils";
import { FullProductType } from "@/types";
import { Variant } from "@prisma/client";
import { Loader, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";
import { toast as hotToast } from "react-hot-toast";

const ProductDetailSection = ({ product }: { product: FullProductType }) => {
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const lowestPrice = Math.min(...product.variant.map((v) => Number(v.price)));
  const [price, setPrice] = useState(lowestPrice === Infinity ? product.price : lowestPrice);

  const imagesList = [...(product?.images || []), ...(product?.variant.map((v) => v.image) || [])];
  const [mainImage, setMainImage] = useState(imagesList[0]);

  const categoryDiscount = product?.categories.reduce(
    (prev, curr) => prev + (curr.discount ?? 0),
    0
  );
  const discount = variant?.discount || product?.discount || categoryDiscount || 0;
  const stock = product.variant.reduce((curr, v) => curr + v.stock, 0) || product.stock;

  const handleAddToCart = async () => {
    if (product.hasVariant && !variant) {
      return hotToast.error("Please select one variant");
    }
    setIsLoading(true);
    const res = await addToCart({
      image: variant?.image || product.images[0] || "/images/placeholder-product.png",
      name: variant ? product.name + " - " + variant?.name : product.name,
      price: Number(price) - Number(price) * Number(discount / 100),
      productId: product.id,
      variantId: variant?.id,
      qty: quantity,
      slug: product.slug,
      weight: product.weight || 0,
    });
    setIsLoading(false);
    return toast(res.message, {
      description: "Check out your cart to see the product",
      action: {
        label: "Go to Cart",
        onClick: () => router.push("/cart"),
      },
      duration: 5000,
    });
  };

  const handleDecreaseQty = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncreaseQty = () => {
    if (product.hasVariant) {
      if (variant && quantity < variant.stock) {
        setQuantity((prev) => prev + 1);
      }
    } else {
      if (quantity < product.stock) {
        setQuantity((prev) => prev + 1);
      }
    }
  };

  const isMinusDisabled = (product.hasVariant && !variant) || isLoading || quantity === 1;

  const isPlusDisabled =
    (product.hasVariant && !variant) ||
    isLoading ||
    (product.hasVariant ? variant?.stock === quantity : product.stock === quantity);

  return (
    <div className="relative flex flex-col md:flex-row md:gap-5 justify-center items-start w-full">
      {/* IMAGE SECTION */}
      <div
        className={`
        relative 
        md:sticky 
        flex 
        flex-col-reverse 
        md:flex-row 
        w-full 
        h-full
        lg:max-w-md
        xl:max-w-xl
        md:max-h-[500px]
        lg:max-h-[440px]
        xl:max-h-[600px]
        gap-2 
        md:left-0 
        md:top-56 
        lg:top-36
        xl:top-48
        overflow-hidden
        `}
      >
        {/* IMAGE LIST CONTAINER */}
        <div
          className={`
          flex 
          flex-row 
          md:flex-col 
          md:min-w-fit
          gap-3 
          max-h-full
          overflow-scroll 
          snap-x 
          md:snap-y 
          snap-mandatory
          `}
        >
          {imagesList.map((item) => (
            <Suspense key={item} fallback={<Skeleton className="w-20 h-20 rounded-md" />}>
              <div
                className="relative snap-start min-h-20 max-h-20 min-w-20 max-w-20 rounded-md overflow-hidden"
                onMouseEnter={() => setMainImage(item)}
              >
                <Image
                  src={item}
                  alt="Product Images"
                  height={100}
                  width={100}
                  className={`
                    h-full 
                    w-full
                    object-cover 
                  `}
                />
                <div
                  className={cn(
                    "absolute inset-0 rounded-md",
                    item === mainImage && "bg-black/30 "
                  )}
                />
              </div>
            </Suspense>
          ))}
        </div>

        {/* MAIN IMAGE */}
        <div className="flex-1 min-h-full w-full">
          <Suspense fallback={<Skeleton className="w-full h-full rounded-md" />}>
            <Image
              src={mainImage}
              alt={product?.name || "Product Images"}
              height={1000}
              width={1000}
              className={`
              w-full
              h-full
              max-h-[400px]
              min-h-[400px]
              md:max-h-full
              md:min-h-full
              object-cover 
              rounded-md
            `}
            />
          </Suspense>
        </div>
      </div>

      {/* PRODUCT DETAILS */}
      <div className="mt-5 min-w-80 flex-1 lg:max-w-96">
        <h2 className="uppercase tracking-wider text-foreground/60 text-sm md:text-base">
          {product?.categories[0].name}
        </h2>
        <h1 className="md:text-xl font-medium tracking-wider mb-5">{product?.name}</h1>
        <PriceTag
          price={Number(price)}
          discount={discount}
          variant={variant}
          hasVariant={product.hasVariant}
        />

        {product?.hasVariant && (
          <>
            <span className="uppercase tracking-widest text-sm">Variants:</span>
            <div className="flex gap-3 mt-3">
              {product?.variant.map((item) => (
                <div
                  key={item.id}
                  className="relative flex flex-col items-center gap-1 rounded-lg"
                  onClick={() => {
                    if (item.stock > 0) {
                      setVariant(item);
                      setMainImage(item.image);
                      setPrice(item.price);
                      setQuantity(1);
                    }
                  }}
                >
                  <Suspense fallback={<Skeleton className="w-20 h-20 rounded-md" />}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={200}
                      height={200}
                      className={cn(
                        "w-20 h-20 object-cover rounded-md hover:border-2 hover:border-black",
                        variant === item && "border-2 border-black",
                        true && ""
                      )}
                    />
                  </Suspense>
                  <h3 className="text-xs text-neutral-500 dark:text-neutral-300">{item.name}</h3>
                  {item.stock < 1 && <div className="absolute inset-0 rounded-md bg-white/50" />}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 mt-5 mb-10">
          {product.stock > 0 ? (
            <>
              <p>
                Stock: <span className="font-medium">{stock}</span>
              </p>
              <div className="flex items-center rounded-md border border-black w-fit py-1">
                <Button
                  variant="ghost"
                  disabled={isMinusDisabled}
                  onClick={handleDecreaseQty}
                >
                  <Minus />
                </Button>
                <div className="py-1 w-16 text-center">{quantity}</div>
                <Button
                  variant="ghost"
                  disabled={isPlusDisabled}
                  onClick={handleIncreaseQty}
                >
                  <Plus />
                </Button>
              </div>
            </>
          ) : (
            <p className="text-red-600 tracking-wider">Out of stock!</p>
          )}
          <Button
            className="uppercase tracking-widest rounded-full py-7 w-full mt-5"
            onClick={handleAddToCart}
            disabled={
              isLoading || (product.hasVariant ? !variant || variant.stock < 1 : product.stock < 1)
            }
          >
            {isLoading ? <Loader className="animate-spin" /> : "add to cart"}
          </Button>
        </div>

        <pre
          className="whitespace-pre-wrap text-neutral-700 dark:text-neutral-300 text-justify"
          style={{ fontFamily: "inherit" }}
        >
          {product?.description}
        </pre>
      </div>
    </div>
  );
};

export default ProductDetailSection;

const PriceTag = ({
  price,
  discount,
  variant,
  hasVariant,
}: {
  price: number;
  discount?: number;
  variant?: Variant;
  hasVariant: boolean;
}) => {
  let lastPrice = price;
  if (discount) {
    lastPrice = Number(price) - Number(price) * (discount / 100);
  }
  return (
    <>
      {discount ? (
        <div className="flex flex-row md:flex-col lg:flex-row gap-3 md:gap-0 lg:gap-3 mb-5 items-center md:items-start lg:items-center">
          <h3 className="font-semibold md:text-lg tracking-wider">
            {" "}
            {!variant && hasVariant && <span className="font-normal">From</span>} Rp{" "}
            {lastPrice.toLocaleString()}
          </h3>
          <h3 className="line-through text-neutral-400 text-sm md:text-base">
            Rp {price.toLocaleString()}
          </h3>
          <p className="text-green-700 font-medium text-sm md:text-base">{discount}% off</p>
        </div>
      ) : (
        <h4 className="font-semibold text-lg tracking-wider">Rp {lastPrice.toLocaleString()}</h4>
      )}
    </>
  );
};

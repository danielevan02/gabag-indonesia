"use client";

import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/actions/cart.action";
import { useCartStore } from "@/lib/stores/cart-store";
import { cn } from "@/lib/utils";
import { Product, Variant } from "@/types";
import { Loader, Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

const ProductDetailSection = ({ product }: { product: Product }) => {
  const router = useRouter();
  const { setOpenModal } = useCartStore();
  const [imageModal, setImageModal] = useState("");
  const [variant, setVariant] = useState<Variant>();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const lowestPrice = Math.min(...(product.variants?.map((v) => Number(v.price)) ?? [0]));

  const imagesList = [
    ...(product?.images || []),
    ...(product?.variants?.map((v) => v.image ?? [""]) || []),
  ];

  const [mainImage, setMainImage] = useState(imagesList[0]);

  const sold = product.orderItems?.reduce((initial, curr) => curr.qty + initial, 0) || 0;

  const isMinusDisabled = (product.hasVariant && !variant) || isLoading || quantity === 1;

  const isPlusDisabled =
    (product.hasVariant && !variant) ||
    isLoading ||
    (product.hasVariant ? variant?.stock === quantity : product.stock === quantity);

  const stock = product.variants?.reduce((curr, v) => curr + v.stock, 0) || product.stock || 0;

  const handleAddToCart = async () => {
    if (product.hasVariant && !variant) {
      return toast.error("Please select one variant");
    }
    setIsLoading(true);
    const res = await addToCart({
      image: variant?.image || product.images[0] || "/images/placeholder-product.png",
      name: variant ? product.name + " - " + variant?.name : product.name,
      price: variant?.price || product.price,
      productId: product.id,
      variantId: variant?.id,
      qty: quantity,
      slug: product.slug,
      weight: product.weight || 0,
    });
    setIsLoading(false);
    setOpenModal(true);
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

  return (
    <div className="relative flex flex-col md:flex-row md:gap-5 justify-center items-start w-full">
      {/* IMAGE SECTION */}
      <div className="image-section-container">
        {/* IMAGE LIST CONTAINER */}
        <div className="image-list-container">
          {imagesList.map((item, index) => (
            <div key={index} className="image-list-item" onMouseEnter={() => setMainImage(item)}>
              <Image
                src={item}
                alt="Product Images"
                height={100}
                width={100}
                className="size-full object-cover"
              />
              <div
                className={cn("absolute inset-0 rounded-md", item === mainImage && "bg-black/30 ")}
              />
            </div>
          ))}
        </div>

        {/* MAIN IMAGE */}
        <div className="flex-1 min-h-full w-full cursor-pointer" onClick={() => setImageModal(mainImage)}>
          <Image
            src={mainImage}
            alt={product?.name || "Product Images"}
            height={1000}
            width={1000}
            className="main-image border"
            priority
          />
        </div>

        {/* IMAGE MODAL WHEN CLICKED*/}
        {imageModal && (
          // THIS CREATE PORTAL IS TO MAKE THE MODAL PASSED TO THE BODY TAG SO IT ALWAYS ON TOP OF EVERYTHING
          createPortal(
            <div
              className="fixed inset-0 z-[99] flex items-center justify-center bg-black/40 backdrop-blur-md"
              onClick={() => setImageModal("")}
            >
              <div className="relative w-[30vw]">
                <Image
                  src={imageModal}
                  alt="Image Modal"
                  width={1000}
                  height={1000}
                  className="w-full"
                />
                <X className="hover:scale-125 transition-all absolute top-3 right-3 cursor-pointer" onClick={() => setImageModal("")} />
              </div>
            </div>,
            document.body
          )
        )}
      </div>

      {/* PRODUCT DETAILS */}
      <div className="mt-5 min-w-80 flex-1 lg:max-w-96">
        <h2 className="uppercase text-foreground/40 text-sm font-semibold">
          {product?.subCategory?.name}
        </h2>
        <h1 className="md:text-xl font-medium mb-5">{product?.name}</h1>

        <PriceTag
          regularPrice={product.regularPrice}
          price={product.price === 0 ? lowestPrice : product.price}
          discount={variant?.discount || product.discount || 0}
          variant={variant}
          hasVariant={product.hasVariant}
        />

        {product?.hasVariant && (
          <>
            <span className="uppercase tracking-widest text-sm">Variants:</span>
            <div className="flex gap-3 mt-3 flex-wrap">
              {product?.variants?.map((item) => (
                <div
                  key={item.id}
                  className="relative flex flex-col items-center gap-1 rounded-lg"
                  onClick={() => {
                    if (item.stock > 0) {
                      setVariant(item);
                      setMainImage(item.image);
                      setQuantity(1);
                    }
                  }}
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={200}
                    height={200}
                    className={cn(
                      "min-w-20 max-w-20 aspect-square object-cover rounded-md hover:border-2 hover:border-black/50 transition-all",
                      variant === item && "border-2 border-black/50",
                      true && ""
                    )}
                  />
                  <h3 className="text-xs text-neutral-500 dark:text-neutral-300">{item.name}</h3>
                  {item.stock < 1 && <div className="absolute inset-0 rounded-md bg-white/50" />}
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 mt-5 mb-10">
          {stock > 0 ? (
            <>
              <p>
                Stock: <span className="font-medium">{stock}</span>
              </p>
              <div className="flex items-center rounded-md border border-black w-fit py-1">
                <Button variant="ghost" disabled={isMinusDisabled} onClick={handleDecreaseQty}>
                  <Minus />
                </Button>
                <div className="py-1 w-16 text-center">{quantity}</div>
                <Button variant="ghost" disabled={isPlusDisabled} onClick={handleIncreaseQty}>
                  <Plus />
                </Button>
              </div>
            </>
          ) : (
            <p className="text-red-600 tracking-wider">Out of stock!</p>
          )}
          <div className="flex gap-2 my-5">
            <p>Sold</p>
            <p className="font-semibold">{sold} item(s)</p>
          </div>
          <Button
            className="uppercase tracking-widest rounded-full py-7 w-full"
            onClick={handleAddToCart}
            disabled={
              isLoading || (product.hasVariant ? !variant || variant.stock < 1 : product.stock < 1)
            }
          >
            {isLoading ? <Loader className="animate-spin" /> : "add to cart"}
          </Button>
        </div>

        <div className="mt-5">
          <p className="font-semibold text-foreground/60">Product Description:</p>
          <pre
            className="whitespace-pre-wrap text-sm text-neutral-500 dark:text-neutral-300 text-justify"
            style={{ fontFamily: "inherit" }}
          >
            {product?.description}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSection;

type PriceTagProps = {
  regularPrice?: number;
  price: number;
  discount?: number;
  variant?: Variant;
  hasVariant: boolean;
};

const PriceTag = ({ price, regularPrice, discount, variant, hasVariant }: PriceTagProps) => {
  const displayPrice = variant ? variant.price : price;
  const displayRegularPrice = variant
    ? variant.regularPrice
    : regularPrice === 0
      ? null
      : regularPrice;
  const hasDiscount = discount != null && discount > 0;
  return (
    <>
      {hasDiscount ? (
        <div className="flex flex-row md:flex-col lg:flex-row gap-3 md:gap-0 lg:gap-3 mb-5 items-center md:items-start lg:items-center">
          <p className="font-semibold md:text-lg tracking-wider">
            {/* IF VARIANT ISN'T CHOSEN, BUT HAS VARIANT THEN SHOW THIS */}
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
      ) : (
        <h4 className="font-semibold text-lg tracking-wider">Rp {displayPrice.toLocaleString()}</h4>
      )}
    </>
  );
};

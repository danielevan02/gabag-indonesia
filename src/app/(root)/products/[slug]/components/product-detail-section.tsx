"use client";

import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/actions/cart.action";
import { useCartStore } from "@/lib/stores/cart-store";
import { Variant } from "@/types";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { getProductBySlug } from "@/lib/actions/product.action";
import { useProductData } from "@/hooks/useProductData";
import { useQuantityControls } from "@/hooks/useQuantityControls";
import { ImageModal } from "./image-modal";
import { ImageGallery } from "./image-gallery";
import { VariantSection } from "./variant-section";
import { QuantityControl } from "./quantity-control";
import { PriceTag } from "./price-tag";

type Product = Awaited<ReturnType<typeof getProductBySlug>>;

interface ProductDetailSectionProps {
  product: Product;
}

// Main component
const ProductDetailSection = ({ product }: ProductDetailSectionProps) => {
  const router = useRouter();
  const { setOpenModal } = useCartStore();
  
  const [imageModal, setImageModal] = useState("");
  const [variant, setVariant] = useState<Variant>();
  const [isLoading, setIsLoading] = useState(false);
  
  // Computed values
  const { lowestPrice, imagesList, sold, stock } = useProductData(product);
  const [mainImage, setMainImage] = useState(imagesList[0]);
  
  const quantityControls = useQuantityControls(product, variant, isLoading);

  const handleVariantSelect = useCallback((selectedVariant: Variant) => {
    setVariant(selectedVariant);
    setMainImage(selectedVariant.image);
    quantityControls.resetQuantity();
  }, [quantityControls]);

  const handleAddToCart = useCallback(async () => {
    if (product.hasVariant && !variant) {
      return toast.error("Please select one variant");
    }

    setIsLoading(true);
    try {
      const res = await addToCart({
        image: variant?.image || product.images?.[0] || "/images/placeholder-product.png",
        name: variant ? `${product.name} - ${variant.name}` : product.name!,
        price: variant?.price || product.price!,
        productId: product.id!,
        variantId: variant?.id,
        qty: quantityControls.quantity,
        slug: product.slug!,
        weight: product.weight || 0,
        height: product.height,
        length: product.length,
        width: product.width,
      });

      setOpenModal(true);
      toast(res.message, {
        description: "Check out your cart to see the product",
        action: {
          label: "Go to Cart",
          onClick: () => router.push("/cart"),
        },
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [product, variant, quantityControls.quantity, setOpenModal, router]);

  const isAddToCartDisabled = 
    isLoading || 
    (product.hasVariant ? !variant || variant.stock < 1 : product.stock! < 1);

  return (
    <div className="relative flex flex-col md:flex-row md:gap-5 justify-center items-start w-full">
      {/* Image Section */}
      <ImageGallery
        imagesList={imagesList}
        mainImage={mainImage}
        onMainImageChange={setMainImage}
        onImageClick={setImageModal}
        productName={product?.name}
      />

      <ImageModal imageModal={imageModal} onClose={() => setImageModal("")} />

      {/* Product Details */}
      <div className="mt-5 min-w-80 flex-1 lg:max-w-96">
        <h2 className="uppercase text-foreground/40 text-sm font-semibold">
          {product?.subCategory?.name}
        </h2>
        <h1 className="md:text-xl font-medium mb-5">{product?.name}</h1>

        <PriceTag
          regularPrice={product.regularPrice}
          price={product.price === 0 ? lowestPrice : product.price!}
          discount={variant?.discount || product.discount || 0}
          variant={variant}
          hasVariant={product.hasVariant!}
        />

        {/* Variants Section */}
        {product?.hasVariant && (
          <VariantSection
            variants={product.variants || []}
            selectedVariant={variant}
            onVariantSelect={handleVariantSelect}
          />
        )}

        {/* Stock and Quantity Section */}
        <div className="mt-5 mb-10">
          <StockInfo stock={stock} sold={sold} />

          {stock > 0 && (
            <QuantityControl
              quantity={quantityControls.quantity}
              onDecrease={quantityControls.handleDecrease}
              onIncrease={quantityControls.handleIncrease}
              isMinusDisabled={quantityControls.isMinusDisabled}
              isPlusDisabled={quantityControls.isPlusDisabled}
            />
          )}

          <Button
            className="uppercase tracking-widest rounded-full py-7 w-full mt-5"
            onClick={handleAddToCart}
            disabled={isAddToCartDisabled}
          >
            {isLoading ? <Loader className="animate-spin" /> : "add to cart"}
          </Button>
        </div>

        {/* Product Description */}
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

const StockInfo = ({ stock, sold }: { stock: number; sold: number }) => (
  <div className="flex flex-col gap-3">
    {stock > 0 ? (
      <p>
        Stock: <span className="font-medium">{stock}</span>
      </p>
    ) : (
      <p className="text-red-600 tracking-wider">Out of stock!</p>
    )}
    <div className="flex gap-2 my-5">
      <p>Sold</p>
      <p className="font-semibold">{sold} item(s)</p>
    </div>
  </div>
);
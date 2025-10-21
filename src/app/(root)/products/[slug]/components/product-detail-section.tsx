"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart.store";
import { Loader, Circle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useProductData } from "@/hooks/useProductData";
import { useQuantityControls } from "@/hooks/useQuantityControls";
import { ImageModal } from "./image-modal";
import { ImageGallery } from "./image-gallery";
import { Variant, VariantSection } from "./variant-section";
import { QuantityControl } from "./quantity-control";
import { PriceTag } from "./price-tag";
import { RouterOutputs } from "@/trpc/routers/_app";
import { trpc } from "@/trpc/client";
import { StarRatingDisplay } from "@/components/shared/review/star-rating-display";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";

type Product = RouterOutputs["product"]["getBySlug"];

interface ProductDetailSectionProps {
  product: Product;
}

// Main component
const ProductDetailSection = ({ product }: ProductDetailSectionProps) => {
  const router = useRouter();
  const { setOpenModal } = useCartStore();
  const trpcUtils = trpc.useUtils();
  const { mutateAsync, isPending: isLoading } = trpc.cart.addToCart.useMutation({
    onSuccess: async (res) => {
      // Force refetch cart data to get latest state
      await trpcUtils.cart.getMyCart.refetch();
      setOpenModal(true);
      toast(res.message, {
        description: "Check out your cart to see the product",
        closeButton: true,
        duration: 1000,
      });
    },
  });
  const [imageModal, setImageModal] = useState("");
  const [variant, setVariant] = useState<Variant>();
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Computed values
  const { lowestPrice, imagesList, sold, stock } = useProductData(product);
  const [mainImage, setMainImage] = useState(imagesList[0]);

  const quantityControls = useQuantityControls(product, variant, isLoading);

  const handleVariantSelect = useCallback(
    (selectedVariant: Variant) => {
      setVariant(selectedVariant);
      setMainImage(selectedVariant.mediaFile.secure_url);
      quantityControls.resetQuantity();
    },
    [quantityControls]
  );

  const handleAddToCart = useCallback(async () => {
    if (product.hasVariant && !variant) {
      return toast.error("Please select one variant");
    }
    try {
      await mutateAsync({
        image:
          variant?.mediaFile.secure_url || product.images?.[0] || "/images/placeholder-product.png",
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
    } catch (error) {
      console.log(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, variant, quantityControls.quantity, setOpenModal, router]);

  const isAddToCartDisabled =
    isLoading || (product.hasVariant ? !variant || variant.stock < 1 : product.stock! < 1);

  const isOutOfStock = product.hasVariant ? variant && variant.stock < 1 : product.stock! < 1;

  const getButtonText = () => {
    if (isLoading) return <Loader className="animate-spin" />;
    if (isOutOfStock) return "out of stock";
    return "add to cart";
  };

  // Description truncate logic
  const description = product?.description || "";
  const words = description.trim().split(/\s+/);
  const wordCount = words.length;
  const shouldShowToggle = wordCount > 100;
  const truncatedDescription = shouldShowToggle
    ? words.slice(0, 100).join(" ")
    : description;

  return (
    <article className="relative flex flex-col lg:flex-row lg:gap-8 xl:gap-16 justify-center items-start w-full">
      <ImageGallery
        imagesList={imagesList}
        mainImage={mainImage}
        onMainImageChange={setMainImage}
        onImageClick={setImageModal}
        productName={product?.name}
      />

      <ImageModal imageModal={imageModal} onClose={() => setImageModal("")} />

      {/* Product Details */}
      <div className="mt-5 min-w-80 flex-1 w-full lg:max-w-md">
        <h2 className="capitalize text-foreground text-sm border rounded-full w-fit px-8 py-1 mb-4">
          {product?.subCategory?.name}
        </h2>
        <h1 className="text-xl font-medium mb-1 lg:mb-2">
          {product?.name}{" "}
          {(variant?.campaign || product?.campaign) && (
            <span className="px-2 py-0.5 text-xs font-semibold text-white bg-orange-600 rounded align-middle">
              {variant?.campaign?.name || product.campaign?.name}
            </span>
          )}
        </h1>

        {/* Product Metadata: Sold and Rating */}
        <dl className="my-3 lg:mb-5 flex items-center gap-2 text-sm">
          <div className="flex items-center gap-2">
            <dt className="sr-only">Units Sold</dt>
            <dd className="text-muted-foreground font-semibold">{sold.toLocaleString()} Sold</dd>
          </div>
          <Circle
            className="size-[6px] fill-muted-foreground text-muted-foreground"
            aria-hidden="true"
          />
          <div>
            <dt className="sr-only">Customer Rating</dt>
            <dd>
              <StarRatingDisplay
                rating={product?.reviewStats?.averageRating || 0}
                totalReviews={product?.reviewStats?.totalReviews || 0}
                size="md"
              />
            </dd>
          </div>
        </dl>

        <PriceTag
          regularPrice={product.regularPrice}
          price={product.price === 0 ? lowestPrice : product.price!}
          discount={variant?.discount || product.discount || 0}
          variant={variant}
          hasVariant={product.hasVariant!}
          campaign={product.campaign || undefined}
        />

        {/* Variants Section */}
        {product?.hasVariant && (
          <section aria-labelledby="variants-heading">
            <h2 id="variants-heading" className="sr-only">
              Product Variants
            </h2>
            <VariantSection
              variants={product.variants || []}
              selectedVariant={variant}
              onVariantSelect={handleVariantSelect}
            />
          </section>
        )}

        {/* Quantity and Add to Cart Section */}
        <section aria-labelledby="add-to-cart-heading" className="mt-5 mb-10">
          <h2 id="add-to-cart-heading" className="sr-only">
            Add to Cart
          </h2>
          <div className="flex flex-col md:flex-row justify-between gap-3">
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
              className="uppercase tracking-widest rounded-full py-3 md:py-6 flex-1"
              onClick={handleAddToCart}
              disabled={isAddToCartDisabled}
            >
              {getButtonText()}
            </Button>
          </div>
        </section>
        
          {/* Product Description */}
        <section aria-labelledby="description-heading" className="flex flex-col gap-1">
          <Label>About the product</Label>
          <div className="relative">
            <pre
              className="whitespace-pre-wrap text-sm text-neutral-500 dark:text-neutral-300 text-justify"
              style={{ fontFamily: "inherit" }}
            >
              {showFullDescription ? description : truncatedDescription}
              {!showFullDescription && shouldShowToggle && "..."}
            </pre>
            {shouldShowToggle && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-sm font-medium text-primary hover:underline mt-2"
                aria-expanded={showFullDescription}
              >
                {showFullDescription ? "Show Less" : "Read More"}
              </button>
            )}
          </div>
        </section>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-2">
            <AccordionTrigger>Shipping Details</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4 text-balance">
              <p>
                We offer shipping through trusted courier partners. Standard delivery takes 3-5
                business days, while express shipping ensures delivery within 1-2 business days.
              </p>
              <p>
                All orders are carefully packaged and fully insured. Track your shipment in
                real-time through our dedicated tracking portal.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Product Dimensions</AccordionTrigger>
            <AccordionContent className="flex flex-col gap-3">
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex flex-col">
                  <dt className="font-semibold text-foreground">Weight</dt>
                  <dd className="text-muted-foreground">
                    {product?.weight ? `${product.weight} gram` : "Not specified"}
                  </dd>
                </div>
                <div className="flex flex-col">
                  <dt className="font-semibold text-foreground">Dimensions</dt>
                  <dd className="text-muted-foreground">
                    {product?.length && product?.width && product?.height
                      ? `${product.length} × ${product.width} × ${product.height} cm`
                      : "Not specified"}
                  </dd>
                </div>
              </dl>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </article>
  );
};

export default ProductDetailSection;

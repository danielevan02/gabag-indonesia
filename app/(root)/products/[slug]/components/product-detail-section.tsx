"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/lib/actions/cart.action";
import { useCartStore } from "@/lib/stores/cart-store";
import { cn } from "@/lib/utils";
import { Variant } from "@/types";
import { Loader, Minus, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { getProductBySlug } from "@/lib/actions/product.action";

// Types
type Product = Awaited<ReturnType<typeof getProductBySlug>>;

interface ProductDetailSectionProps {
  product: Product;
}

interface PriceTagProps {
  regularPrice?: number;
  price: number;
  discount?: number;
  variant?: Variant;
  hasVariant: boolean;
}

interface QuantityControlProps {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  isMinusDisabled: boolean;
  isPlusDisabled: boolean;
}

interface ImageModalProps {
  imageModal: string;
  onClose: () => void;
}

interface VariantSectionProps {
  variants: Variant[];
  selectedVariant?: Variant;
  onVariantSelect: (variant: Variant) => void;
}

// Custom hooks
const useProductData = (product: Product) => {
  return useMemo(() => {
    const lowestPrice = Math.min(...(product.variants?.map((v) => Number(v.price)) ?? [0]));
    const imagesList = [
      ...(product?.images || []),
      ...(product?.variants?.map((v) => v.image ?? [""]) || []),
    ];
    const sold = product.orderItems?.reduce((initial, curr) => curr.qty + initial, 0) || 0;
    const stock = product.variants?.reduce((curr, v) => curr + v.stock, 0) || product.stock || 0;

    return { lowestPrice, imagesList, sold, stock };
  }, [product]);
};

const useQuantityControls = (product: Product, variant?: Variant, isLoading: boolean = false) => {
  const [quantity, setQuantity] = useState(1);

  const controls = useMemo(() => {
    const isMinusDisabled = (product.hasVariant && !variant) || isLoading || quantity === 1;
    const isPlusDisabled = 
      (product.hasVariant && !variant) || 
      isLoading || 
      (product.hasVariant ? variant?.stock === quantity : product.stock === quantity);

    return { isMinusDisabled, isPlusDisabled };
  }, [product, variant, isLoading, quantity]);

  const handleDecrease = useCallback(() => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  }, [quantity]);

  const handleIncrease = useCallback(() => {
    const maxStock = product.hasVariant ? variant?.stock : product.stock;
    if (maxStock && quantity < maxStock) {
      setQuantity(prev => prev + 1);
    }
  }, [quantity, product, variant]);

  const resetQuantity = useCallback(() => {
    setQuantity(1);
  }, []);

  return {
    quantity,
    setQuantity,
    resetQuantity,
    handleDecrease,
    handleIncrease,
    ...controls
  };
};

// Sub-components
const ImageModal = ({ imageModal, onClose }: ImageModalProps) => {
  if (!imageModal) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[99] flex items-center justify-center bg-black/40 backdrop-blur-md"
      onClick={onClose}
    >
      <div className="relative w-[90vw] lg:w-[30vw]">
        <Image
          src={imageModal}
          alt="Image Modal"
          width={700}
          height={700}
          className="w-full"
        />
        <X
          className="hover:scale-125 transition-all absolute top-3 right-3 cursor-pointer"
          onClick={onClose}
        />
      </div>
    </div>,
    document.body
  );
};

const ImageGallery = ({ 
  imagesList, 
  mainImage, 
  onMainImageChange, 
  onImageClick, 
  productName 
}: {
  imagesList: string[];
  mainImage: string;
  onMainImageChange: (image: string) => void;
  onImageClick: (image: string) => void;
  productName?: string;
}) => (
  <div className="image-section-container">
    <div className="image-list-container">
      {imagesList?.map((item, index) => (
        <div 
          key={index} 
          className="image-list-item" 
          onMouseEnter={() => onMainImageChange(item)}
        >
          <Image
            src={item}
            alt="Product Images"
            height={70}
            width={70}
            className="size-full object-cover"
          />
          <div
            className={cn("absolute inset-0 rounded-md", item === mainImage && "bg-black/30")}
          />
        </div>
      ))}
    </div>

    <div
      className="flex-1 min-h-full w-full cursor-pointer"
      onClick={() => onImageClick(mainImage)}
    >
      <Image
        src={mainImage}
        alt={productName || "Product Images"}
        height={400}
        width={400}
        className="main-image border"
        priority
      />
    </div>
  </div>
);

const VariantSection = ({ variants, selectedVariant, onVariantSelect }: VariantSectionProps) => (
  <>
    <span className="uppercase tracking-widest text-sm">Variants:</span>
    <div className="grid grid-cols-4 gap-2 mt-3">
      {variants?.map((variant) => (
        <VariantItem 
          key={variant.id}
          variant={variant}
          isSelected={selectedVariant === variant}
          onSelect={onVariantSelect}
        />
      ))}
    </div>
  </>
);

const VariantItem = ({ 
  variant, 
  isSelected, 
  onSelect 
}: {
  variant: Variant;
  isSelected: boolean;
  onSelect: (variant: Variant) => void;
}) => (
  <div
    className="relative col-span-1 flex flex-col items-center gap-1 rounded-lg"
    onClick={() => variant.stock > 0 && onSelect(variant)}
  >
    <div className="relative">
      <Image
        src={variant.image}
        alt={variant.name}
        width={100}
        height={100}
        className={cn(
          "size-full object-cover rounded-md hover:border-2 hover:border-black/50 transition-all",
          isSelected && "border-2 border-black/50"
        )}
      />
      {variant.stock < 1 && (
        <div className="absolute inset-0 rounded-md bg-white/70 flex items-center justify-center p-3">
          <p className="text-center text-sm text-red-600">Out of Stock!</p>
        </div>
      )}
    </div>
    <h3 className="text-xs text-neutral-500 dark:text-neutral-300">{variant.name}</h3>
  </div>
);

const QuantityControl = ({ 
  quantity, 
  onDecrease, 
  onIncrease, 
  isMinusDisabled, 
  isPlusDisabled 
}: QuantityControlProps) => (
  <div className="flex items-center rounded-md border border-black w-fit py-1">
    <Button variant="ghost" disabled={isMinusDisabled} onClick={onDecrease}>
      <Minus />
    </Button>
    <div className="py-1 w-16 text-center">{quantity}</div>
    <Button variant="ghost" disabled={isPlusDisabled} onClick={onIncrease}>
      <Plus />
    </Button>
  </div>
);

const PriceTag = ({ price, regularPrice, discount, variant, hasVariant }: PriceTagProps) => {
  const displayPrice = variant ? variant.price : price;
  const displayRegularPrice = variant
    ? variant.regularPrice
    : regularPrice === 0 ? null : regularPrice;
  const hasDiscount = discount != null && discount > 0;

  if (!hasDiscount) {
    return (
      <h4 className="font-semibold text-lg tracking-wider mb-5">
        {!variant && hasVariant && <span className="font-normal text-sm">from </span>}
        Rp {displayPrice.toLocaleString()}
      </h4>
    );
  }

  return (
    <div className="flex flex-row md:flex-col lg:flex-row gap-3 md:gap-0 lg:gap-3 mb-5 items-center md:items-start lg:items-center">
      <p className="font-semibold md:text-lg tracking-wider">
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
  );
};

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

// Main component
const ProductDetailSection = ({ product }: ProductDetailSectionProps) => {
  const router = useRouter();
  const { setOpenModal } = useCartStore();
  
  // State
  const [imageModal, setImageModal] = useState("");
  const [variant, setVariant] = useState<Variant>();
  const [isLoading, setIsLoading] = useState(false);
  
  // Computed values
  const { lowestPrice, imagesList, sold, stock } = useProductData(product);
  const [mainImage, setMainImage] = useState(imagesList[0]);
  
  // Quantity controls
  const quantityControls = useQuantityControls(product, variant, isLoading);

  // Handlers
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
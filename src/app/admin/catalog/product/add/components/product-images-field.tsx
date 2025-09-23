"use client"

import GalleryModal from "@/components/shared/gallery/gallery-modal";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { productSchema } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { ImagePlus } from "lucide-react";
import Image from "next/image";
import { Controller, get, type UseFormReturn, type ControllerRenderProps } from "react-hook-form";
import z from "zod";

type ProductFormType = z.infer<typeof productSchema>;

interface ProductImagesFieldProps {
  form: UseFormReturn<ProductFormType>;
  allMediaFiles?: {
    images: {
      id: string;
      secure_url: string;
    }[];
  };
}

export const ProductImagesField = ({ form, allMediaFiles }: ProductImagesFieldProps) => {
  const isImageError = !!get(form.formState.errors, "images");
  const errorMessage = String(get(form.formState.errors, "images.message"));

  return (
    <Controller
      control={form.control}
      name="images"
      render={({ field }) => (
        <ProductImagesSection
          field={field}
          isImageError={isImageError}
          allMediaFiles={allMediaFiles}
          errorMessage={errorMessage}
        />
      )}
    />
  );
};

// 2. Component untuk Section Images
interface ProductImagesSectionProps {
  field: ControllerRenderProps<ProductFormType, "images">;
  isImageError: boolean;
  allMediaFiles?: {
    images: {
      id: string;
      secure_url: string;
    }[];
  };
  errorMessage?: string;
}

const ProductImagesSection = ({ 
  field, 
  isImageError, 
  allMediaFiles,
  errorMessage
}: ProductImagesSectionProps) => {
  const hasImages = field.value && field.value.length > 0;
  
  return (
    <div className="flex gap-2 flex-col mb-5">
      <ProductImagesLabel isError={isImageError} />
      <ProductImagesContent 
        hasImages={hasImages}
        images={field.value}
        isError={isImageError}
      />
      <ProductImagesError isError={isImageError} errorMessage={errorMessage} />
      <ProductImagesGalleryModal 
        field={field}
        allMediaFiles={allMediaFiles}
      />
    </div>
  );
};

// 3. Component untuk Label
const ProductImagesLabel = ({ isError }: { isError: boolean }) => (
  <>
    <Label className={isError ? "text-destructive":undefined}>
      Product Photo(s)
    </Label>
    <p className="text-xs text-neutral-600">
      NOTE: You can add more than 1 image
    </p>
  </>
);

// 4. Component untuk Content (Images atau Placeholder)
interface ProductImagesContentProps {
  hasImages: boolean;
  images?: string[];
  isError: boolean;
}

const ProductImagesContent = ({ hasImages, images, isError }: ProductImagesContentProps) => {
  if (hasImages && images) {
    return <ProductImagesGrid images={images} />;
  }
  
  return <ProductImagesPlaceholder isError={isError} />;
};

// 5. Component untuk Grid Images
const ProductImagesGrid = ({ images }: { images: string[] }) => (
  <div className="w-full flex gap-2 justify-start flex-wrap">
    {images.map((imageId, index) => (
      <ProductImageDisplay
        key={imageId} // Gunakan imageId sebagai key untuk lebih stable
        imageId={imageId}
        alt={`product-image-${index}`}
      />
    ))}
  </div>
);

// Component to display product image by ID
const ProductImageDisplay = ({ imageId, alt }: { imageId: string; alt: string }) => {
  const { data: mediaFile } = trpc.gallery.getById.useQuery(
    { id: imageId },
    { enabled: !!imageId }
  );

  if (!mediaFile?.secure_url) {
    return <Skeleton className="size-32 rounded-md" />;
  }

  return (
    <div className="size-32 overflow-hidden rounded-md border">
      <Image
        src={mediaFile.secure_url}
        alt={alt}
        width={100}
        height={100}
        className="size-full object-cover"
      />
    </div>
  );
};

// 6. Component untuk Placeholder
const ProductImagesPlaceholder = ({ isError }: { isError: boolean }) => {
  const placeholderClasses = cn(
    "flex flex-col items-center justify-center size-44 rounded-md border gap-4",
    isError ? "bg-red-200 border-red-600" : "bg-accent"
  );
  
  return (
    <div className={placeholderClasses}>
      <ImagePlus />
      <span className="text-sm text-neutral-700">
        Add product images
      </span>
    </div>
  );
};


// 7. Component untuk Error Message
const ProductImagesError = ({ isError, errorMessage }: { isError: boolean, errorMessage?: string }) => {
  if (!isError) return null;
  
  return (
    <span className="text-sm text-destructive">
      {errorMessage}
    </span>
  );
};

// 8. Component untuk Gallery Modal dengan logic yang lebih clean
interface ProductImagesGalleryModalProps {
  field: ControllerRenderProps<ProductFormType, "images">;
  allMediaFiles?: {
    images: {
      id: string;
      secure_url: string;
    }[];
  };
}

const ProductImagesGalleryModal = ({ 
  field, 
  allMediaFiles,
}: ProductImagesGalleryModalProps) => {
  // Helper functions untuk konversi
  const getInitialSelectedImages = () => {
    if (!field.value || !allMediaFiles?.images) return [];

    return field.value
      .map((id: string) =>
        allMediaFiles.images.find((file) => file.id === id)?.secure_url
      )
      .filter(Boolean) as string[];
  };
  
  const handleImageSelection = (selectedUrls: string[] | string) => {
    if (!Array.isArray(selectedUrls) || !allMediaFiles?.images) {
      field.onChange([]);
      return;
    }
    
    const imageIds = selectedUrls
      .map((url) => 
        allMediaFiles.images.find((file) => file.secure_url === url)?.id
      )
      .filter(Boolean) as string[];
      
    field.onChange(imageIds);
  };
  
  return (
    <GalleryModal
      multiple={true}
      initialSelectedImages={getInitialSelectedImages()}
      setInitialSelectedImages={handleImageSelection}
    />
  );
};
"use client"

import GalleryModal from "@/components/shared/gallery/gallery-modal";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { Plus } from "lucide-react";
import Image from "next/image";
import { Controller, get, type UseFormReturn, type ControllerRenderProps } from "react-hook-form";

interface SubCategoryImageFieldProps {
  form: UseFormReturn<any>;
  fieldName: string;
  allMediaFiles?: {
    images: {
      id: string;
      secure_url: string;
    }[];
  };
}

export const SubCategoryImageField = ({ form, fieldName, allMediaFiles }: SubCategoryImageFieldProps) => {
  const isImageError = !!get(form.formState.errors, fieldName);
  const errorMessage = String(get(form.formState.errors, `${fieldName}.message`));

  return (
    <Controller
      control={form.control}
      name={fieldName}
      render={({ field }) => (
        <SubCategoryImageSection
          field={field}
          isImageError={isImageError}
          allMediaFiles={allMediaFiles}
          errorMessage={errorMessage}
        />
      )}
    />
  );
};

// 2. Component untuk Section Image
interface SubCategoryImageSectionProps {
  field: ControllerRenderProps<any, string>;
  isImageError: boolean;
  allMediaFiles?: {
    images: {
      id: string;
      secure_url: string;
    }[];
  };
  errorMessage?: string;
}

const SubCategoryImageSection = ({
  field,
  isImageError,
  allMediaFiles,
  errorMessage
}: SubCategoryImageSectionProps) => {
  const hasImage = field.value && field.value.length > 0;

  return (
    <div className="flex gap-2 flex-col mb-5">
      <SubCategoryImageLabel isError={isImageError} />
      <SubCategoryImageContent
        hasImage={hasImage}
        imageId={field.value}
        isError={isImageError}
      />
      <SubCategoryImageError isError={isImageError} errorMessage={errorMessage} />
      <SubCategoryImageGalleryModal
        field={field}
        allMediaFiles={allMediaFiles}
      />
    </div>
  );
};

// 3. Component untuk Label
const SubCategoryImageLabel = ({ isError }: { isError: boolean }) => (
  <>
    <Label className={isError ? "text-destructive" : undefined}>
      Sub-Category Image
    </Label>
    <p className="text-xs text-neutral-600">
      NOTE: Select one image for this sub-category
    </p>
  </>
);

// 4. Component untuk Content (Image atau Placeholder)
interface SubCategoryImageContentProps {
  hasImage: boolean;
  imageId?: string;
  isError: boolean;
}

const SubCategoryImageContent = ({ hasImage, imageId, isError }: SubCategoryImageContentProps) => {
  if (hasImage && imageId) {
    return <SubCategoryImageDisplay imageId={imageId} />;
  }

  return <SubCategoryImagePlaceholder isError={isError} />;
};

// 5. Component untuk Display Image
const SubCategoryImageDisplay = ({ imageId }: { imageId: string }) => {
  const { data: mediaFile } = trpc.gallery.getById.useQuery(
    { id: imageId },
    { enabled: !!imageId }
  );

  if (!mediaFile?.secure_url) {
    return <Skeleton className="size-36 rounded-md" />;
  }

  return (
    <div className="size-36 overflow-hidden rounded-md border">
      <Image
        src={mediaFile.secure_url}
        alt="sub-category-image"
        width={100}
        height={100}
        className="size-full object-cover"
      />
    </div>
  );
};

// 6. Component untuk Placeholder
const SubCategoryImagePlaceholder = ({ isError }: { isError: boolean }) => {
  const placeholderClasses = cn(
    "size-36 bg-accent border gap-3 text-xs rounded-md flex flex-col items-center justify-center p-5",
    isError ? "bg-red-200 border-red-600" : "bg-accent"
  );

  return (
    <div className={placeholderClasses}>
      <Plus />
      <span className="text-sm text-neutral-700">
        Add Image
      </span>
    </div>
  );
};

// 7. Component untuk Error Message
const SubCategoryImageError = ({ isError, errorMessage }: { isError: boolean, errorMessage?: string }) => {
  if (!isError) return null;

  return (
    <span className="text-sm text-destructive">
      {errorMessage}
    </span>
  );
};

// 8. Component untuk Gallery Modal dengan logic yang lebih clean
interface SubCategoryImageGalleryModalProps {
  field: ControllerRenderProps<any, string>;
  allMediaFiles?: {
    images: {
      id: string;
      secure_url: string;
    }[];
  };
}

const SubCategoryImageGalleryModal = ({
  field,
  allMediaFiles,
}: SubCategoryImageGalleryModalProps) => {
  // Helper functions untuk konversi
  const getInitialSelectedImage = () => {
    if (!field.value || !allMediaFiles?.images) return [];

    const selectedImage = allMediaFiles.images.find((file) => file.id === field.value);
    return selectedImage ? [selectedImage.secure_url] : [];
  };

  const handleImageSelection = (selectedUrl: string[] | string) => {
    if (typeof selectedUrl === "string" && selectedUrl && allMediaFiles?.images) {
      const selectedMediaFile = allMediaFiles.images.find(
        (file) => file.secure_url === selectedUrl
      );
      if (selectedMediaFile) {
        field.onChange(selectedMediaFile.id);
      }
    } else {
      field.onChange("");
    }
  };

  return (
    <GalleryModal
      multiple={false}
      initialSelectedImages={getInitialSelectedImage()}
      setInitialSelectedImages={handleImageSelection}
    />
  );
};
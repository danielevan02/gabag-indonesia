"use client";

import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

type Media = {
  id: string;
  secure_url: string;
};

interface AvailableImagesSectionProps {
  galleries: Media[];
  loading: boolean;
  onImageSelect: (url: string) => void;
}

export default function AvailableImagesSection({
  galleries,
  loading,
  onImageSelect,
}: AvailableImagesSectionProps) {
  const LoadingSkeleton = () => (
    <>
      {[...Array(7)].map((_, index) => (
        <Skeleton key={index} className="col-span-1 aspect-square border" />
      ))}
    </>
  );

  const EmptyState = () => (
    <div className="col-span-5 flex items-center">
      <p className="text-center italic text-sm text-neutral-600">
        There is no image, please upload a new image.
      </p>
    </div>
  );

  const ImageGrid = () => (
    <>
      {galleries.map((gallery) => (
        <div
          onClick={() => onImageSelect(gallery.secure_url)}
          key={gallery.id}
          className="col-span-1 cursor-pointer aspect-square rounded-md border overflow-hidden"
        >
          <Image
            src={gallery.secure_url}
            alt="gallery-image"
            height={100}
            width={100}
            className="size-full object-cover"
          />
        </div>
      ))}
    </>
  );

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-base">Image List</Label>
      <div className="gallery-image-container">
        {loading ? (
          <LoadingSkeleton />
        ) : galleries.length > 0 ? (
          <ImageGrid />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
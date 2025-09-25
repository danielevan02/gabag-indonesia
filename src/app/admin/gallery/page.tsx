"use client";

import Gallery from "./components/gallery";
import { trpc } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function GalleryPage() {
  const { data, isLoading } = trpc.gallery.getAll.useQuery();
  const images = data?.images || [];
  const haveImages = images && images.length !== 0;

  if (isLoading) {
    return (
      <div className="form-page">
        <p className="text-lg font-semibold">Image Gallery</p>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 p-2">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="col-span-1 aspect-square rounded-md border overflow-clip">
              <Skeleton className="size-full"/>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <p className="text-lg font-semibold">Image Gallery</p>
      {haveImages ? (
        <Gallery images={images}/>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-foreground/50 italic">There is no image uploaded.</p>
        </div>
      )}
    </div>
  );
}
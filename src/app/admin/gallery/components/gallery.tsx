"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteGalleryImages } from "@/lib/actions/gallery.action";
import { useEdgeStore } from "@/lib/edge-store";
import { cn } from "@/lib/utils";
import { GalleryImage } from "@prisma/client";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export default function Gallery({ images }: { images: GalleryImage[] }) {
  const [imageModal, setImageModal] = useState("");
  const [manage, setManage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { edgestore } = useEdgeStore();

  const handleImageModal = (url: string) => {
    if (manage) {
      if (selectedImage.includes(url)) {
        const newArray = selectedImage.filter((img) => img !== url);
        setSelectedImage(newArray);
      } else {
        setSelectedImage((prev) => [url, ...prev]);
      }
    } else {
      setImageModal(url);
    }
  };

  const handleActiveManage = () => {
    setManage((prev) => !prev);
    setSelectedImage([]);
  };

  const handleDelete = async () => {
    if (selectedImage.length === 0) return;
    
    setLoading(true)
    try {
      await Promise.all(selectedImage.map((url) => edgestore.publicImages.delete({ url })));
      const resp = await deleteGalleryImages(selectedImage);

      if (resp?.status === 200) {
        setSelectedImage([]);
        toast.success(resp.message);
      } else {
        toast.error(resp?.message);
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false)
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <Button
          className="w-fit my-3"
          onClick={handleActiveManage}
          variant={manage ? "outline" : "default"}
          disabled={loading}
        >
          {manage ? "Cancel Manage" : "Manage Gallery"}
        </Button>

        <p className="text-foreground/50 text-sm md:text-base">Total: {images.length} photo(s)</p>

        {manage ? (
          <Button
            variant="destructive"
            disabled={selectedImage.length === 0||loading}
            onClick={handleDelete}
          >
            Delete Selected {selectedImage.length !== 0 && `(${selectedImage.length})`}
          </Button>
        ) : (
          <div className="min-w-20"></div>
        )}
      </div>
      <div className="flex-1 overflow-y-scroll grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 p-2">
        {!loading ? (
          images?.map((image) => {
            const imageIncludedValidation = manage && selectedImage.includes(image.imageUrl);
            return (
              <div
                key={image.id}
                className={cn(
                  "relative cursor-pointer col-span-1 aspect-square rounded-md border overflow-clip select-none",
                  imageIncludedValidation && "bg-black/20 ring-2 ring-red-400"
                )}
                onClick={() => handleImageModal(image.imageUrl)}
              >
                <Image
                  src={image.imageUrl}
                  alt="Images Gallery"
                  width={200}
                  height={200}
                  className="size-full object-cover"
                />
                {manage && (
                  <Checkbox
                    checked={imageIncludedValidation}
                    className="absolute top-2 left-2 bg-white"
                  />
                )}
              </div>
            );
          })
        ) : (
          [...Array(30)].map((_, index) => (
            <div key={index} className="col-span-1 aspect-square rounded-md border overflow-clip">
              <Skeleton className="size-full"/>
            </div>
          ))
        )}
      </div>
      {imageModal && (
        <div
          className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-lg"
          onClick={() => setImageModal("")}
        >
          <div className="w-[90vw] lg:w-[30vw] relative overflow-clip rounded-md border z-20">
            <Image
              src={imageModal}
              alt="Image Modal"
              width={1000}
              height={1000}
              className="w-full"
              priority
            />
            <X
              className="absolute top-3 right-3 hover:scale-125 transition-all cursor-pointer"
              onClick={() => setImageModal("")}
            />
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

export default function Gallery({
  images,
}: {
  images: { id: string; public_id: string; secure_url: string }[];
}) {
  const [imageModal, setImageModal] = useState("");
  const [manage, setManage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string[]>([]);
  const utils = trpc.useUtils();
  const deleteImagesMutation = trpc.gallery.deleteImages.useMutation({
    onSuccess: () => {
      utils.gallery.getAll.invalidate();
    },
  });
  const [loading, setLoading] = useState(false);

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

  const deleteFromCloudinary = async (publicIds: string[]) => {
    try {
      const deletePromises = publicIds.map(async (publicId) => {
        const response = await fetch("/api/delete-cloudinary-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ publicId }),
        });
        return response.json();
      });

      await Promise.all(deletePromises);
    } catch (error) {
      console.error("Error deleting from Cloudinary:", error);
      throw error;
    }
  };

  const handleActiveManage = () => {
    setManage((prev) => !prev);
    setSelectedImage([]);
  };

  const handleDelete = async () => {
    if (selectedImage.length === 0) return;

    setLoading(true);
    try {
      // Get public_ids from selected images
      const selectedMediaFiles = images.filter((img) => selectedImage.includes(img.secure_url));
      const publicIds = selectedMediaFiles.map((img) => img.public_id);

      // Delete from Cloudinary first
      await deleteFromCloudinary(publicIds);

      // Delete from database
      const result = await deleteImagesMutation.mutateAsync({
        secure_urls: selectedImage,
      });

      if (result?.status === 200) {
        setSelectedImage([]);
        toast.success(result.message);
      } else {
        toast.error(result?.message || "Failed to delete images");
      }
    } catch (error) {
      console.error("Error deleting images:", error);
      toast.error("Failed to delete images");
    }
    setLoading(false);
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
            disabled={selectedImage.length === 0 || loading}
            onClick={handleDelete}
          >
            Delete Selected {selectedImage.length !== 0 && `(${selectedImage.length})`}
          </Button>
        ) : (
          <div className="min-w-20"></div>
        )}
      </div>
      <div className="flex-1 overflow-y-scroll grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-2 p-2">
        {!loading
          ? images?.map((image) => {
              const imageIncludedValidation = manage && selectedImage.includes(image.secure_url);
              return (
                <div
                  key={image.id}
                  className={cn(
                    "relative cursor-pointer col-span-1 aspect-square rounded-md border overflow-clip select-none",
                    imageIncludedValidation && "bg-black/20 ring-2 ring-red-400"
                  )}
                  onClick={() => handleImageModal(image.secure_url)}
                >
                  <Image
                    src={image.secure_url}
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
          : [...Array(30)].map((_, index) => (
              <div key={index} className="col-span-1 aspect-square rounded-md border overflow-clip">
                <Skeleton className="size-full" />
              </div>
            ))}
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

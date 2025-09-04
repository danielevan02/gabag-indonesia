"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { Loader, Plus, Upload } from "lucide-react";
import { Label } from "../ui/label";
import { GalleryImage } from "@prisma/client";
import { getGalleryImages, saveGalleryImages } from "@/lib/actions/gallery.action";
import { Skeleton } from "../ui/skeleton";
import { closestCorners, DndContext, DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import SortableImage from "./sortable-image";
import { useEdgeStore } from "@/lib/edge-store";
import { toast } from "sonner";

export default function GalleryModal({
  initialSelectedImages,
  setInitialSelectedImages,
  multiple=false,
}: {
  multiple?: boolean;
  setInitialSelectedImages: (val: string[]|string)=>void
  initialSelectedImages?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [allPhotos, setAllPhotos] = useState<GalleryImage[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<number>();
  const galleries = useMemo(
    () => allPhotos.filter((photo) => !images.includes(photo.imageUrl)),
    [allPhotos, images]
  );

  const { edgestore } = useEdgeStore();

  const singleImageValidation = (!multiple && images.length === 1)

  useEffect(() => {
    if (initialSelectedImages) {
      setImages(initialSelectedImages);
    }
    const fetchImage = async () => {
      try {
        const data = await getGalleryImages();
        if (data.success) {
          setAllPhotos(data.images ?? []);
        }
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    };

    fetchImage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getImageIndex = (id: UniqueIdentifier) => {
    return images?.findIndex((img) => img === id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id === over?.id) return;

    setImages((prev) => {
      const currentPosition = getImageIndex(active.id);
      const newPosition = getImageIndex(over!.id);

      return arrayMove(prev || [], currentPosition || 0, newPosition || 0);
    });
  };

  const handleChanges = () => {
    setInitialSelectedImages(multiple ? (images || []):(images[0]||""));
    setOpen(false);
  };

  const handleAddPhoto = (url: string) => {
    if(singleImageValidation) return
    setImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setLoadingImage(true);
      setUploadProgress(0);

      // Upload files to EdgeStore
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const newFileName = `gallery-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const renamedFile = new File([file], newFileName, {
          type: file.type,
        });

        try {
          const res = await edgestore.publicImages.upload({
            file: renamedFile,
            onProgressChange(progress) {
              setUploadProgress(progress);
            },
            options: {
              manualFileName: newFileName,
            },
          });

          return res.url;
        } catch (error) {
          console.error("Error uploading to EdgeStore:", error);
          throw new Error(`Failed to upload ${file.name}`);
        }
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      if (uploadedUrls.length === 0) {
        throw new Error("No images were uploaded successfully");
      }

      // Save URLs to database
      const { images, success, message } = await saveGalleryImages(uploadedUrls);

      if (success && images) {
        // Add new images to the gallery
        const newImages = images?.map((img) => img.imageUrl) || [];
        setImages((prev) => [...prev, ...newImages]);
        // Automatically select newly uploaded images
        setAllPhotos((prev) => [...prev, ...images]);
        toast.success(`Successfully uploaded ${images?.length} image(s)`);
      } else {
        throw new Error(message || "Failed to save images to database");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to upload images");
    } finally {
      setLoadingImage(false);
      setUploadProgress(undefined);
      // Reset the file input
      e.target.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="uppercase w-fit">{images.length !== 0 ? "change" : "add"} photo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm md:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Image Gallery</DialogTitle>
          {multiple && (
            <DialogDescription>You can add more than 1 picture for your product.</DialogDescription>
          )}
        </DialogHeader>

        <div className="relative flex flex-col gap-2 max-h-[67vh] overflow-scroll">
          <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
            <div className="flex flex-col gap-1">
              <Label className="text-base">Selected Image(s)</Label>
              <div className="gallery-image-container">
                <SortableContext items={images || []} strategy={rectSortingStrategy}>
                  {multiple ? (
                    // MODE MULTIPLE
                    images.length > 0 ? (
                      images.map((image) => (
                        <SortableImage
                          url={image}
                          key={image}
                          setImages={setImages}
                          multiple={multiple}
                        />
                      ))
                    ) : (
                      // NO SELECTED IMAGES
                      <div className="col-span-1 bg-accent aspect-square overflow-hidden rounded-md border flex items-center justify-center">
                        <Plus />
                      </div>
                    )
                  ) : // MODE SINGLE
                  images.length !== 0 ? (
                    <SortableImage
                      url={images[0]}
                      key={images[0]}
                      setImages={setImages}
                      multiple={multiple}
                    />
                  ) : (
                    <div className="col-span-1 bg-accent aspect-square overflow-hidden rounded-md border flex items-center justify-center">
                      <Plus />
                    </div>
                    // PLACEHOLDER
                  )}
                </SortableContext>
              </div>
            </div>
          </DndContext>

          <hr />

          <div className="flex flex-col gap-2">
            <Label className="text-base">Image List</Label>
            <div className="gallery-image-container">
              {!loading ? (
                galleries ? (
                  galleries.map((gallery) => (
                    <div
                      onClick={() => handleAddPhoto(gallery.imageUrl)}
                      key={gallery.id}
                      className="col-span-1 cursor-pointer aspect-square rounded-md border overflow-hidden"
                    >
                      <Image
                        src={gallery.imageUrl}
                        alt="gallery-image"
                        height={300}
                        width={300}
                        className="size-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-5 flex items-center">
                    <p className="text-center italic text-sm text-neutral-600">
                      There is no image, please upload a new image.
                    </p>
                  </div>
                )
              ) : (
                [...Array(7)].map((_, index) => (
                  <Skeleton key={index} className="col-span-1 aspect-square border" />
                ))
              )}
            </div>
          </div>

          {loadingImage && (
            <div className="absolute inset-0 bg-neutral-600/20 z-20 gap backdrop-blur-sm rounded-md overflow-hidden flex flex-col gap-2 items-center justify-center">
              <Loader className="animate-spin" />
              <p>Uploading... {Math.floor(uploadProgress?? 0)}%</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button asChild disabled={loading || loadingImage}>
            <label htmlFor="image-upload">
              Upload Image <Upload />
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                multiple={multiple}
                onChange={handleFileChange}
                disabled={loading || loadingImage}
              />
            </label>
          </Button>
          <Button type="submit" onClick={handleChanges} disabled={loading || loadingImage}>
            {loading ? <Loader className="animate-spin" /> : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
import { CldUploadWidget } from "next-cloudinary";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Loader, Plus, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { closestCorners, DndContext, DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import SortableImage from "./sortable-image";
import { toast } from "sonner";
import { trpc } from "@/trpc/client";
import z from "zod";
import { mediaFileSchema } from "@/lib/schema";

type MediaFilesFormType = z.infer<typeof mediaFileSchema>;
type Media = {
  id: string
  secure_url: string
}

export default function GalleryModal({
  initialSelectedImages,
  setInitialSelectedImages,
  multiple = false,
}: {
  multiple?: boolean;
  setInitialSelectedImages: (val: string[] | string) => void;
  initialSelectedImages?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [allPhotos, setAllPhotos] = useState<Media[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const galleries = useMemo(
    () => allPhotos.filter((photo) => !images.includes(photo.secure_url)),
    [allPhotos, images]
  );

  const singleImageValidation = !multiple && images.length === 1;

  const { data, isLoading: loadingImage, refetch } = trpc.gallery.getAll.useQuery();
  const { mutateAsync } = trpc.gallery.create.useMutation();

  useEffect(() => {
    if (initialSelectedImages) {
      setImages(initialSelectedImages);
    }
  }, [initialSelectedImages]);

  useEffect(() => {
    if (data?.images) {
      setAllPhotos(data.images);
    }
    setLoading(loadingImage);
  }, [data, loadingImage]);

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
    if (multiple) {
      setInitialSelectedImages(images || []);
    } else {
      setInitialSelectedImages(images[0] || "");
    }
    setOpen(false);
  };

  const handleAddPhoto = (url: string) => {
    if (singleImageValidation) return;
    setImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  const handleSuccessUpload = async (data?: any[]) => {
    const mediaFiles = data?.map((media) => {
      return {
        public_id: media.uploadInfo.public_id,
        resource_type: media.uploadInfo.resource_type,
        secure_url: media.uploadInfo.secure_url,
        thumbnail_url: media.uploadInfo.thumbnail_url,
        bytes: media.uploadInfo.bytes,
        format: media.uploadInfo.format,
        height: media.uploadInfo.height,
        original_filename: media.uploadInfo.original_filename,
        width: media.uploadInfo.width
      } satisfies MediaFilesFormType
    }) 

    if(!mediaFiles) return

    try {
      await mutateAsync(mediaFiles)
      refetch()
      toast.success(`Success upload ${mediaFiles.length} images`)
    } catch (error) {
      console.log(error)
      toast.error("Failed uploading image")
    }
    
    if (!mediaFiles) return;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        <Button className="uppercase w-fit">{images.length !== 0 ? "change" : "add"} photo</Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-sm md:max-w-2xl lg:max-w-3xl"
        onInteractOutside={(event) => event.preventDefault()}
      >
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
                      onClick={() => handleAddPhoto(gallery.secure_url)}
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
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <CldUploadWidget
            options={{
              multiple: multiple,
              clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
            }}
            signatureEndpoint="/api/sign-cloudinary-params"
            onQueuesEnd={(result, { widget }) => {
              handleSuccessUpload((result.info as any).files)
              widget.close();
            }}
          >
            {({ open }) => {
              return (
                <Button onClick={() => open()}>
                  {" "}
                  <Upload /> Upload Image
                </Button>
              );
            }}
          </CldUploadWidget>
          <Button type="submit" onClick={handleChanges} disabled={loading || loadingImage}>
            {loading ? <Loader className="animate-spin" /> : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

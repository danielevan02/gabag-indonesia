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
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import { Plus, Upload } from "lucide-react";
import { Label } from "../ui/label";
import { GalleryImage } from "@prisma/client";
import { getGalleryImages } from "@/lib/actions/gallery.action";
import { Skeleton } from "../ui/skeleton";

export default function GalleryModal({
  initialSelectedImages,
}: {
  initialSelectedImages?: string[];
}) {
  const [galleries, setGalleries] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const data = await getGalleryImages();
        if (data.success) {
          setGalleries(data.images ?? []);
        }
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    };

    fetchImage();
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="uppercase w-fit">add photo</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm md:max-w-2xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Image Gallery</DialogTitle>
          <DialogDescription>You can add more than 1 picture for your product.</DialogDescription>
        </DialogHeader>

        
          <div className="flex flex-col gap-2 max-h-[67vh] overflow-scroll">
            <div className="flex flex-col gap-1">
              <Label className="text-base">Selected Image(s)</Label>
              <div className="gallery-image-container">
                
                  {initialSelectedImages ? (
                    // SHOW THIS IF THERE IS SELECTED IMAGES
                    initialSelectedImages.map((image, index) => (
                      <div key={index} className="col-span-1 aspect-square overflow-hidden rounded-md border">
                        <Image
                          src={image}
                          alt={`product-image${index}`}
                          height={300}
                          width={300}
                          className="size-full object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    // SHOW THIS IF THERE IS NO SELECTED IMAGES
                    <div className="col-span-1 bg-accent aspect-square overflow-hidden rounded-md border flex items-center justify-center">
                      <Plus />
                    </div>
                  )}
              </div>
            </div>

            <hr />

            <div className="flex flex-col gap-2">
              <Label className="text-base">Image List</Label>
              <div className="gallery-image-container">
                {!loading ? (
                  galleries ? (
                    galleries.map((gallery) => (
                      <div
                        key={gallery.id}
                        className="col-span-1 aspect-square rounded-md border overflow-hidden"
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
                  [...Array(7)].map((_, index) => <Skeleton key={index} className="col-span-1" />)
                )}
              </div>
            </div>
          </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>
            Upload Photo <Upload />
          </Button>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

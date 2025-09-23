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
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { useGalleryState } from "../../../hooks/use-gallery-state";
import { useImageUpload } from "../../../hooks/use-image-upload";
import SelectedImagesSection from "./selected-images-section";
import AvailableImagesSection from "./available-images-section";
import UploadSection from "./upload-section";

export type Media = {
  id: string;
  secure_url: string;
};

interface GalleryModalProps {
  multiple?: boolean;
  setInitialSelectedImages: (val: string[] | string) => void;
  initialSelectedImages?: string[];
}

export default function GalleryModal({
  initialSelectedImages,
  setInitialSelectedImages,
  multiple = false,
}: GalleryModalProps) {
  const {
    open,
    setOpen,
    images,
    setImages,
    loading,
    galleries,
    handleDragEnd,
    handleAddPhoto,
    refetch,
  } = useGalleryState({ initialSelectedImages, multiple });

  const { handleSuccessUpload } = useImageUpload();

  const handleChanges = () => {
    if (multiple) {
      setInitialSelectedImages(images || []);
    } else {
      setInitialSelectedImages(images[0] || "");
    }
    setOpen(false);
  };

  const onSuccessUpload = async (data?: any[]) => {
    await handleSuccessUpload(data, refetch);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={false}>
      <DialogTrigger asChild>
        <Button className="uppercase w-fit">
          {images.length !== 0 ? "change" : "add"} photo
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-sm md:max-w-2xl lg:max-w-3xl"
        onInteractOutside={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Image Gallery</DialogTitle>
          {multiple && (
            <DialogDescription>
              You can add more than 1 picture for your product.
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="relative flex flex-col gap-2 max-h-[67vh] overflow-scroll">
          <SelectedImagesSection
            images={images}
            setImages={setImages}
            multiple={multiple}
            onDragEnd={handleDragEnd}
          />

          <hr />

          <AvailableImagesSection
            galleries={galleries}
            loading={loading}
            onImageSelect={handleAddPhoto}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <UploadSection multiple={multiple} onSuccessUpload={onSuccessUpload} />
          <Button type="submit" onClick={handleChanges} disabled={loading}>
            {loading ? <Loader className="animate-spin" /> : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

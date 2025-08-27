"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEdgeStore } from "@/lib/edge-store";
import { cn } from "@/lib/utils";
import { Loader, UploadCloudIcon, GripVertical, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getGalleryImages,
  saveGalleryImages,
} from "@/lib/actions/gallery.action";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DroppableProvided,
  DraggableProvided,
} from "@hello-pangea/dnd";

interface GalleryImage {
  id: string;
  imageUrl: string;
  createdAt: string;
}

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrls: string[]) => void;
  initialSelectedImages?: string[];
}

export const GalleryModal = ({
  isOpen,
  onClose,
  onSelect,
  initialSelectedImages = [],
}: GalleryModalProps) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>(
    initialSelectedImages
  );
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>();
  const { edgestore } = useEdgeStore();

  // Reset selectedImages setiap modal dibuka
  useEffect(() => {
    if (isOpen) {
      setSelectedImages(initialSelectedImages);
    }
  }, [isOpen, initialSelectedImages]);

  // Fetch images from the database
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const data = await getGalleryImages();
        if (data.success && data.images) {
          setImages(data.images);
        } else {
          toast.error(data.message || "Failed to fetch images");
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        toast.error("Failed to fetch images");
      }
    };

    if (isOpen) {
      fetchImages();
    }
  }, [isOpen]);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsLoading(true);
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
      console.log("Uploaded URLs:", uploadedUrls);

      if (uploadedUrls.length === 0) {
        throw new Error("No images were uploaded successfully");
      }

      // Save URLs to database
      const saveData = await saveGalleryImages(uploadedUrls);
      console.log("Save data:", saveData);

      if (saveData.success && saveData.images) {
        // Add new images to the gallery
        setImages((prev) => [...prev, ...saveData.images]);
        // Automatically select newly uploaded images
        setSelectedImages((prev) => [...prev, ...uploadedUrls]);
        toast.success(
          `Successfully uploaded ${saveData.images.length} image(s)`
        );
      } else {
        throw new Error(
          saveData.message || "Failed to save images to database"
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload images"
      );
    } finally {
      setIsLoading(false);
      setUploadProgress(undefined);
      // Reset the file input
      e.target.value = "";
    }
  };

  const handleSelect = () => {
    if (selectedImages.length > 0) {
      onSelect(selectedImages);
      onClose();
    }
  };

  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages((prev) => {
      if (prev.includes(imageUrl)) {
        return prev.filter((url) => url !== imageUrl);
      } else {
        return [...prev, imageUrl];
      }
    });
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(selectedImages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedImages(items);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-96">
        <DialogHeader>
          <DialogTitle>Media Library</DialogTitle>
        </DialogHeader>
        <div className="relative w-full overflow-scroll">
          {uploadProgress !== undefined && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80">
              <div className="text-center">
                <Loader className="mx-auto h-8 w-8 animate-spin" />
                <p className="mt-2 text-sm">Uploading... {uploadProgress}%</p>
              </div>
            </div>
          )}

          {/* Selected Images Section */}
          {selectedImages.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-4">
                Selected Images ({selectedImages.length})
              </h3>
              <div
                className="overflow-x-auto pb-2"
                style={{ maxWidth: "100%" }}
              >
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable
                    droppableId="selected-images"
                    direction="horizontal"
                  >
                    {(provided: DroppableProvided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="grid grid-cols-4 gap-1 min-h-[110px]"
                        style={{ paddingBottom: 8 }}
                      >
                        {selectedImages.map((imageUrl, index) => (
                          <Draggable
                            key={imageUrl}
                            draggableId={imageUrl}
                            index={index}
                          >
                            {(provided: DraggableProvided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="relative group flex flex-col items-center col-span-1"
                                style={{ minWidth: 96 }}
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute left-3 top-1 z-10 bg-background rounded-full p-1 shadow-md cursor-move opacity-80"
                                  style={{ pointerEvents: "auto" }}
                                >
                                  <GripVertical className="h-4 w-4" />
                                </div>
                                <div className="relative h-24 w-24">
                                  <Image
                                    src={imageUrl}
                                    alt="Selected image"
                                    fill
                                    className="object-cover rounded-md border border-primary"
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      toggleImageSelection(imageUrl)
                                    }
                                    className="absolute right-1 top-1 z-20 rounded-full p-px w-5 h-5"
                                    style={{ pointerEvents: "auto" }}
                                  >
                                    <X className="h-2 w-2" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>
          )}

          {/* Gallery Grid */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[320px] overflow-y-auto">
            {images
              .filter((img) => !selectedImages.includes(img.imageUrl))
              .map((image) => (
                <div
                  key={image.id}
                  className={cn(
                    "relative aspect-square cursor-pointer overflow-hidden rounded-md border-2 transition-all group",
                    selectedImages.includes(image.imageUrl)
                      ? "border-primary"
                      : "border-transparent hover:border-primary/50"
                  )}
                  onClick={() => toggleImageSelection(image.imageUrl)}
                >
                  <Image
                    src={image.imageUrl}
                    alt="Gallery image"
                    fill
                    className="object-cover"
                  />
                  {selectedImages.includes(image.imageUrl) && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="bg-primary text-primary-foreground rounded-full p-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-6 w-6"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        <DialogFooter>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="gallery-upload"
              onChange={handleFileChange}
              disabled={isLoading}
              multiple
            />
            <label
              htmlFor="gallery-upload"
              className={cn(
                "flex items-center gap-2 rounded-md bg-primary px-4 py-1 text-primary-foreground hover:bg-primary/90",
                isLoading && "cursor-not-allowed opacity-50"
              )}
            >
              {isLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <UploadCloudIcon className="h-4 w-4" />
              )}
              Upload Photos
            </label>
          </div>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={selectedImages.length === 0}>
            Select {selectedImages.length > 0 && `(${selectedImages.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

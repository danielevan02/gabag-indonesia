"use client";

import { Label } from "@/components/ui/label";
import { closestCorners, DndContext, DragEndEvent } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import SortableImage from "./sortable-image";

interface SelectedImagesSectionProps {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  multiple: boolean;
  onDragEnd: (event: DragEndEvent) => void;
}

export default function SelectedImagesSection({
  images,
  setImages,
  multiple,
  onDragEnd,
}: SelectedImagesSectionProps) {
  const EmptyPlaceholder = () => (
    <div className="col-span-1 bg-accent aspect-square overflow-hidden rounded-md border flex items-center justify-center">
      <Plus />
    </div>
  );

  return (
    <DndContext onDragEnd={onDragEnd} collisionDetection={closestCorners}>
      <div className="flex flex-col gap-1">
        <Label className="text-base">Selected Image(s)</Label>
        <div className="gallery-image-container">
          <SortableContext items={images || []} strategy={rectSortingStrategy}>
            {multiple ? (
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
                <EmptyPlaceholder />
              )
            ) : images.length !== 0 ? (
              <SortableImage
                url={images[0]}
                key={images[0]}
                setImages={setImages}
                multiple={multiple}
              />
            ) : (
              <EmptyPlaceholder />
            )}
          </SortableContext>
        </div>
      </div>
    </DndContext>
  );
}
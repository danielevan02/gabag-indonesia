"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";

export default function SortableImage({
  url,
  setImages,
  multiple
}: {
  multiple?: boolean;
  url: string;
  setImages: Dispatch<SetStateAction<string[]>>;
}) {
  const { transition, setNodeRef, attributes, listeners, transform } = useSortable({ id: url });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative col-span-1 aspect-square overflow-hidden rounded-md border"
    >
      <Image
        src={url}
        alt={`product-image`}
        height={200}
        width={200}
        className="size-full object-cover"
      />

      {multiple && (
        <div
          {...listeners}
          className="absolute top-1 left-1 z-10 rounded-full border bg-white size-7 flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 text-neutral-500" />
        </div>
      )}

      <div
        onClick={(e) => {
          e.stopPropagation()
          setImages(prev => prev.filter(img => img !== url));
        }}
        className="absolute top-1 right-1 z-10 rounded-full bg-red-500 size-5 flex items-center justify-center cursor-pointer hover:scale-110"
      >
        <X className="w-3 text-white" />
      </div>
    </div>
  );
}
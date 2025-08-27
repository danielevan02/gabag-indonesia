"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Image from "next/image";

export default function SortableImage({ url }: { url: string }) {
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
      {...listeners}
      className="size-32 overflow-hidden rounded-md border"
    >
      <Image
        src={url}
        alt={`image-product`}
        width={300}
        height={300}
        className="size-full object-cover"
      />
    </div>
  );
}

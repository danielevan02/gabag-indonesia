"use client";

import { DataTable } from "@/components/shared/table/data-table";
import { columns } from "./columns";
import { RouterOutputs } from "@/trpc/routers/_app";
import { useDeleteManyMutation } from "@/hooks/use-delete-mutation";

type Carousel = RouterOutputs['carousel']['getAll'][number];

interface CarouselDataTableWrapperProps {
  carousels: Carousel[]
}

export default function CarouselDataTableWrapper({ carousels }: CarouselDataTableWrapperProps) {
  const deleteManyCarouselMutation = useDeleteManyMutation({
    type: 'carousel'
  })
  return (
    <DataTable 
      columns={columns} 
      data={carousels} 
      deleteManyMutation={deleteManyCarouselMutation}
      searchPlaceholder="Search Carousels"
      deleteTitle="Delete Carousel"
    />
  )
}
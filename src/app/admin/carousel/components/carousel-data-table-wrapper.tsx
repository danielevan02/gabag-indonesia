"use client";

import { DataTable } from "@/components/shared/table/data-table";
import { columns } from "./columns";
import { RouterOutputs } from "@/trpc/routers/_app";

type Carousel = RouterOutputs['carousel']['getAll'][number];

interface CarouselDataTableWrapperProps {
  carousels: Carousel[]
}

export default function CarouselDataTableWrapper({ carousels }: CarouselDataTableWrapperProps) {
  return (
    <DataTable
      columns={columns}
      data={carousels}
      searchPlaceholder="Search Carousels"
      deleteTitle="Delete Carousel"
    />
  )
}
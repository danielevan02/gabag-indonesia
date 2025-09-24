"use client";

import ActionTable from "@/components/shared/table/action-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { RouterOutputs } from "@/trpc/routers/_app";
import { useDeleteMutation } from "@/hooks/use-delete-mutation";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

type CarouselPrisma = RouterOutputs["carousel"]["getAll"][number];

const CarouselActionCell = ({ carouselId }: { carouselId: string }) => {
  const deleteCarouselMutation = useDeleteMutation({ type: "carousel" });

  return (
    <ActionTable
      type="carousel"
      deleteMutation={deleteCarouselMutation}
      id={carouselId}
      title="Delete Carousel"
      desc="Are you sure you want to delete this carousel? This action cannot be undone"
      catalog={false}
    />
  );
};

export const columns: ColumnDef<CarouselPrisma>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomeRowsSelected() && "indeterminate")
        }
        onCheckedChange={(val) => table.toggleAllPageRowsSelected(!!val)}
        aria-label="select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(val) => row.toggleSelected(!!val)}
        aria-label="select row"
      />
    ),
  },
  {
    header: "#",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="line-clamp-1 capitalize font-medium">{row.getValue("name")}</div>,
  },
  {
    header: "Images",
    cell: ({ row }) => (
      <div className="flex gap-2">
        <div className="relative">
          <Image
            src={row.original.desktopImage.secure_url}
            alt="Desktop"
            width={40}
            height={20}
            className="rounded border object-cover"
          />
          <span className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[8px] px-1 rounded">D</span>
        </div>
        <div className="relative">
          <Image
            src={row.original.mobileImage.secure_url}
            alt="Mobile"
            width={20}
            height={20}
            className="rounded border object-cover"
          />
          <span className="absolute -bottom-1 -right-1 bg-green-500 text-white text-[8px] px-1 rounded">M</span>
        </div>
      </div>
    ),
  },
  {
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "secondary"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    header: "Schedule",
    cell: ({ row }) => {
      const { startDate, endDate } = row.original;
      if (!startDate && !endDate) {
        return <span className="text-muted-foreground italic">Always active</span>;
      }
      return (
        <div className="text-sm">
          {startDate && <div>From: {format(startDate, "d MMM yyyy")}</div>}
          {endDate && <div>To: {format(endDate, "d MMM yyyy")}</div>}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => <p className="text-sm">{format(row.original.createdAt, "d MMM yyyy")}</p>,
  },
  {
    id: "actions",
    cell: ({ row }) => <CarouselActionCell carouselId={row.original.id} />,
  },
];
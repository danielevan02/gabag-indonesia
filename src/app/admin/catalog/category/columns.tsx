"use client";

import { Button } from "@/components/ui/button";
import { RouterOutputs } from "@/trpc/routers/_app";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Edit } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Category = RouterOutputs['category']['getAll'][number]

const CategoryActionCell = ({ categoryId }: { categoryId: string }) => {
  return (
    <Link href={`/admin/catalog/category/${categoryId}`}>
      <Button variant="outline" size="sm">
        <Edit className="h-4 w-4" />
        Edit
      </Button>
    </Link>
  );
};

export const columns: ColumnDef<Category>[] = [
  {
    header: "#",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="line-clamp-1 capitalize">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "image",
    header: "Image",
    cell: ({ row }) => (
      <div className="w-56 h-32 rounded-lg overflow-clip border">
        <Image
          src={row.original.mediaFile.secure_url}
          alt={row.original.name}
          width={100}
          height={100}
          className="w-full h-full object-cover"
        />
      </div>
    )
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => <p>{format(row.original.createdAt, "EEEE, d MMMM yyyy")}</p>
  },
  {
    id: "actions",
    cell: ({ row }) => <CategoryActionCell categoryId={row.original.id} />
  },
];

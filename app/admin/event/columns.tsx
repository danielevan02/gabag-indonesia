
"use client";

import ActionTable from "@/components/shared/table/action-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Event as PrismaEvent } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { deleteEvent } from "@/lib/actions/event.action";

type FullEvent = PrismaEvent & {
  _count: {
    products: number
  }
}

export const columns: ColumnDef<FullEvent>[] = [
  {
    id: 'select',
    header: ({table}) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || table.getIsSomeRowsSelected() && 'indeterminate'}
        onCheckedChange={(val)=>table.toggleAllPageRowsSelected(!!val)}
        aria-label="select all"
      />
    ),
    cell: ({row}) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(val)=>row.toggleSelected(!!val)}
        aria-label="select row"
      />
    )
  },
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
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => <p>{row.original.discount}%</p>
  },
  {
    header: "Products",
    cell: ({ row }) => <p>{row.original._count.products}</p>
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => <p>{format(row.original.createdAt, "EEEE, d MMMM yyyy")}</p>
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionTable 
        type="event"
        catalog={false}
        deleteFunction={deleteEvent}
        id={row.original.id} 
        title="Delete Event" 
        desc="Are you sure you want to delete this event? this action cannot be undone" 
      />
    )
  },
];
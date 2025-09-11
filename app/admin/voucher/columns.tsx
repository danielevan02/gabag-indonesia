"use client";

import ActionTable from "@/components/shared/table/action-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Voucher } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { deleteEvent } from "@/lib/actions/event.action";


export const columns: ColumnDef<Voucher>[] = [
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
        title="Delete Voucher" 
        desc="Are you sure you want to delete this voucher? this action cannot be undone" 
      />
    )
  },
];
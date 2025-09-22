"use client";

import { DataTable } from "@/components/shared/table/data-table";
import { columns } from "./columns";
import { useDeleteManyMutation } from "@/hooks/use-delete-mutation";
import { RouterOutputs } from "@/trpc/routers/_app";

type EventPrisma = RouterOutputs['event']['getAll'][number];

interface EventDataTableWrapperProps {
  events: EventPrisma[];
}

export default function EventDataTableWrapper({ events }: EventDataTableWrapperProps) {
  const deleteManyEventMutation = useDeleteManyMutation({
    type: "event"
  });

  return (
    <DataTable
      columns={columns}
      data={events}
      deleteManyMutation={deleteManyEventMutation}
      searchPlaceholder="Search Event"
      deleteTitle="Delete Event"
    />
  );
}
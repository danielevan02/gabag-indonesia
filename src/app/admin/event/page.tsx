import { Button } from "@/components/ui/button";
import Link from "next/link";
import EventDataTableWrapper from "./event-data-table-wrapper";
import { trpc } from "@/trpc/server";

export default async function EventPage() {
  const events = await trpc.event.getAll();

  return (
    <div className="form-page">
      <div className="flex justify-between items-center">
        <h1 className="font-medium text-2xl">Event List</h1>
        <Button>
          <Link href="/admin/event/add">Add Event</Link>
        </Button>
      </div>

      <div className="overflow-hidden flex flex-col flex-1">
        <EventDataTableWrapper events={events} />
      </div>
    </div>
  );
}

import { DataTable } from "@/components/shared/table/data-table";
import { Button } from "@/components/ui/button";
import { deleteManyEvents, getAllEvents } from "@/lib/actions/event.action";
import Link from "next/link";
import { columns } from "./columns";

export default async function EventPage() {
  const subCategories = await getAllEvents();
  return (
    <div className="form-page">
      <div className="flex justify-between items-center">
        <h1 className="font-medium text-2xl">Event List</h1>
        <Button>
          <Link href='/admin/event/add'>Add Event</Link>
        </Button>
      </div>

      <div className='overflow-hidden flex flex-col flex-1'>
        <DataTable
          columns={columns}
          data={subCategories}
          deleteManyFn={deleteManyEvents}
          searchPlaceholder="Search Categories"
        />
      </div>
    </div>
  );
}
import EditEventForm from "./components/edit-event-form";
import { trpc } from "@/trpc/server";

type tParams = Promise<{ eventId: string }>;

export default async function EditEventPage({ params }: { params: tParams }) {
  const { eventId }: { eventId: string } = await params;

  const [event, products] = await Promise.all([
    trpc.event.getById({ id: eventId }),
    trpc.event.getProductForEvents(),
  ]);

  return event ? (
    <div className="form-page">
      <p className="text-lg">Edit Event</p>
      <EditEventForm event={event} products={products} />
    </div>
  ) : (
    <div className="p-5 flex items-center justify-center h-full">There is no Event</div>
  );
}
import EventForm from "./components/event-form";
import { trpc } from "@/trpc/server";

export default async function AddEventPage() {
  const products = await trpc.event.getProductForEvents()

  return (
    <div className="form-page">
      <p className="text-lg">Add New Event</p>
      <EventForm products={products}/>
    </div>
  )
}
import { getAllProducts } from "@/lib/actions/product.action";
import EventForm from "./components/event-form";

export default async function AddEventPage() {
  const products = await getAllProducts()

  const productsList = products.map((item) => ({
    value: item.id,
    label: item.name
  }))
  return (
    <div className="form-page">
      <p className="text-lg">Add New Event</p>
      <EventForm products={productsList}/>
    </div>
  )
}
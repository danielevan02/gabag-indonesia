import { trpc } from "@/trpc/server"
import OrderDataTableWrapper from "./order-data-table-wrapper"


export default async function OrderPage() {
  const orders = await trpc.order.getAll({})
  return (
    <div className="form-page">
      <div className="flex justify-between items-center">
        <h1 className="font-medium text-2xl">Order List</h1>
      </div>

      <div className='overflow-hidden flex flex-col flex-1'>
        <OrderDataTableWrapper orders={orders}/>
      </div>
    </div>
  )
}
import { DataTable } from "@/components/shared/table/data-table"
import { deleteManyOrders, getAllOrders } from "@/lib/actions/order.action"
import { columns } from "./columns"


export default async function OrderPage() {
  const orders = await getAllOrders()
  return (
    <div className="form-page">
      <div className="flex justify-between items-center">
        <h1 className="font-medium text-2xl">Order List</h1>
      </div>

      <div className='overflow-hidden flex flex-col flex-1'>
        <DataTable
          columns={columns}
          data={orders}
          deleteManyFn={deleteManyOrders}
          searchPlaceholder="Search Categories"
          searchColumn="id"
        />
      </div>
    </div>
  )
}
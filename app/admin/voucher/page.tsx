import { DataTable } from "@/components/shared/table/data-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { columns } from "./columns";
import { deleteManyVouchers, getAllVoucher } from "@/lib/actions/voucher.action";


export default async function VoucherPage() {
  const vouchers = await getAllVoucher();
  return (
    <div className="form-page">
      <div className="flex justify-between items-center">
        <h1 className="font-medium text-2xl">Event List</h1>
        <Button>
          <Link href='/admin/voucher/add'>Add Event</Link>
        </Button>
      </div>

      <div className='overflow-hidden flex flex-col flex-1'>
        <DataTable
          columns={columns}
          data={vouchers}
          deleteManyFn={deleteManyVouchers}
          searchPlaceholder="Search Categories"
        />
      </div>
    </div>
  );
}
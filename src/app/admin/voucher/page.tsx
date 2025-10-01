import { Button } from "@/components/ui/button";
import Link from "next/link";
import { trpc } from "@/trpc/server";
import VoucherDataTableWrapper from "./voucher-data-table-wrapper";


export default async function VoucherPage() {
  const vouchers = await trpc.voucher.getAll();
  return (
    <div className="form-page">
      <div className="flex justify-between items-center">
        <h1 className="font-medium text-2xl">Voucher List</h1>
        <Button>
          <Link href='/admin/voucher/add'>Add Voucher</Link>
        </Button>
      </div>

      <div className='overflow-hidden flex flex-col flex-1'>
        <VoucherDataTableWrapper vouchers={vouchers}/> 
      </div>
    </div>
  );
}
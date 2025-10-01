"use client";

import { use } from "react";
import VoucherEditForm from "./components/voucher-edit-form";
import { trpc } from "@/trpc/client";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditVoucherPage({ params }: { params: Promise<{ voucherId: string }> }) {
  const router = useRouter();
  const { voucherId } = use(params);
  const { data: voucher, isLoading } = trpc.voucher.getById.useQuery({ id: voucherId });

  if (isLoading) {
    return (
      <div className="p-5 h-full flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!voucher) {
    router.push("/admin/voucher");
    return null;
  }

  return (
    <div className="p-5 h-full max-h-screen flex flex-col overflow-hidden">
      <p className="text-lg">Edit Voucher: {voucher.code}</p>
      <VoucherEditForm voucher={voucher} />
    </div>
  );
}

import { trpc } from "@/trpc/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import BatchVoucherCodesTable from "./batch-voucher-codes-table";

export default async function BatchDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; filter?: string }>;
}) {
  const { id } = await params;
  const { page, filter } = await searchParams;

  const currentPage = page ? parseInt(page) : 1;
  const currentFilter = (filter as "all" | "used" | "available") || "all";

  const data = await trpc.voucher.getBatchDetail({
    id,
    page: currentPage,
    pageSize: 50,
    filter: currentFilter,
  });

  if (!data || !data.batch) {
    notFound();
  }

  const { batch, vouchers } = data;

  const usedCount = vouchers.filter((v) => v.usedCount > 0).length;
  const availableCount = vouchers.length - usedCount;
  const usagePercent = vouchers.length > 0
    ? Math.round((usedCount / vouchers.length) * 100)
    : 0;

  return (
    <div className="form-page">
      <div className="flex flex-col my-5 flex-1 overflow-scroll px-1 gap-3">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/voucher">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="font-medium text-2xl">{batch.name}</h1>
          </div>
          <Button asChild>
            <a href={`/api/admin/voucher-batch/${batch.id}/export`}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </a>
          </Button>
        </div>

        {/* Batch Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-500">Total Codes</p>
            <p className="text-2xl font-bold">{batch.generatedCount.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-500">Used</p>
            <p className="text-2xl font-bold text-green-600">{usedCount.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-500">Available</p>
            <p className="text-2xl font-bold text-blue-600">{availableCount.toLocaleString()}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-sm text-gray-500">Usage Rate</p>
            <p className="text-2xl font-bold">{usagePercent}%</p>
          </div>
        </div>

        {/* Batch Details */}
        <div className="bg-white p-6 rounded-lg border mb-6">
          <h2 className="font-semibold text-lg mb-4">Batch Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Prefix</p>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                {batch.prefix}-*
              </code>
            </div>
            <div>
              <p className="text-sm text-gray-500">Discount</p>
              <p className="font-medium">
                {batch.templateType === "PERCENT"
                  ? `${batch.templateValue}%`
                  : `Rp ${batch.templateValue.toLocaleString()}`}
                {batch.templateMaxDiscount && (
                  <span className="text-sm text-gray-500">
                    {" "}(Max: Rp {Number(batch.templateMaxDiscount).toLocaleString()})
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Application Type</p>
              <p className="font-medium">{batch.templateApplicationType.replace(/_/g, " ")}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Valid Period</p>
              <p className="font-medium">
                {format(batch.templateStartDate, "d MMM yyyy")} -{" "}
                {format(batch.templateExpires, "d MMM yyyy")}
              </p>
            </div>
            {batch.templateMinPurchase && (
              <div>
                <p className="text-sm text-gray-500">Min Purchase</p>
                <p className="font-medium">
                  Rp {Number(batch.templateMinPurchase).toLocaleString()}
                </p>
              </div>
            )}
            {batch.description && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Description</p>
                <p className="font-medium">{batch.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Voucher Codes Table */}
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="font-semibold text-lg mb-4">Voucher Codes</h2>
          <BatchVoucherCodesTable vouchers={vouchers} />
        </div>
      </div>
    </div>
  );
}

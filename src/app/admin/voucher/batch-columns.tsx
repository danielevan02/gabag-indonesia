"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { RouterOutputs } from "@/trpc/routers/_app";
import { Download, Eye, Trash } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Batch = RouterOutputs["voucher"]["getAllBatches"][number];

const BatchActionCell = ({ batch }: { batch: Batch }) => {
  const router = useRouter();
  const deleteBatchMutation = trpc.voucher.deleteBatch.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        router.refresh();
      } else {
        toast.error(data.message);
      }
    },
    onError: () => {
      toast.error("Failed to delete batch");
    },
  });

  const handleExport = () => {
    window.location.href = `/api/admin/voucher-batch/${batch.id}/export`;
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this batch? All unused vouchers will be deleted.")) {
      deleteBatchMutation.mutate({ id: batch.id });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="ghost" asChild>
        <Link href={`/admin/voucher/batch/${batch.id}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      <Button size="sm" variant="ghost" onClick={handleExport}>
        <Download className="h-4 w-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        disabled={deleteBatchMutation.isPending}
      >
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  );
};

export const batchColumns: ColumnDef<Batch>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomeRowsSelected() && "indeterminate")
        }
        onCheckedChange={(val) => table.toggleAllPageRowsSelected(!!val)}
        aria-label="select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(val) => row.toggleSelected(!!val)}
        aria-label="select row"
      />
    ),
  },
  {
    header: "#",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Batch Name",
  },
  {
    accessorKey: "prefix",
    header: "Prefix",
    cell: ({ row }) => (
      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
        {row.original.prefix}-*
      </code>
    ),
  },
  {
    header: "Discount",
    cell: ({ row }) => {
      const { templateType, templateValue } = row.original;
      return (
        <span>
          {templateType === "PERCENT" ? `${templateValue}%` : `Rp ${templateValue.toLocaleString()}`}
        </span>
      );
    },
  },
  {
    header: "Total Codes",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.generatedCount.toLocaleString()}</span>
    ),
  },
  {
    header: "Used / Available",
    cell: ({ row }) => {
      const { usedCount, availableCount } = row.original;
      const usagePercent = row.original.generatedCount > 0
        ? Math.round((usedCount / row.original.generatedCount) * 100)
        : 0;

      return (
        <div className="flex flex-col">
          <span className="text-sm">
            {usedCount} / {availableCount}
          </span>
          <span className="text-xs text-gray-500">{usagePercent}% used</span>
        </div>
      );
    },
  },
  {
    header: "Valid Period",
    cell: ({ row }) => (
      <div className="flex flex-col text-sm">
        <span>{format(row.original.templateStartDate, "d MMM yyyy")}</span>
        <span className="text-gray-500">to {format(row.original.templateExpires, "d MMM yyyy")}</span>
      </div>
    ),
  },
  {
    header: "Created",
    cell: ({ row }) => <p>{format(row.original.createdAt, "d MMM yyyy")}</p>,
  },
  {
    header: "Actions",
    cell: ({ row }) => <BatchActionCell batch={row.original} />,
  },
];

"use client";

import { DataTable } from "@/components/shared/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { RouterOutputs } from "@/trpc/routers/_app";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

type Voucher = RouterOutputs["voucher"]["getBatchDetail"]["vouchers"][number];

const CopyCodeCell = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <code className="bg-gray-100 px-2 py-1 rounded text-sm">{code}</code>
      <button
        onClick={handleCopy}
        className="p-1 hover:bg-gray-100 rounded"
        title="Copy code"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <Copy className="h-4 w-4 text-gray-600" />
        )}
      </button>
    </div>
  );
};

const columns: ColumnDef<Voucher>[] = [
  {
    header: "#",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "code",
    header: "Voucher Code",
    cell: ({ row }) => <CopyCodeCell code={row.original.code} />,
  },
  {
    header: "Status",
    cell: ({ row }) => {
      const isUsed = row.original.usedCount > 0;
      return isUsed ? (
        <Badge variant="secondary">Used</Badge>
      ) : (
        <Badge variant="outline" className="text-green-600 border-green-600">
          Available
        </Badge>
      );
    },
  },
  {
    header: "Used By",
    cell: ({ row }) => {
      const redemption = row.original.redemptions?.[0];
      if (!redemption) return <span className="text-gray-400">-</span>;
      return (
        <div className="flex flex-col">
          <span className="text-sm">{redemption.user?.name || "Guest"}</span>
          <span className="text-xs text-gray-500">{redemption.email}</span>
        </div>
      );
    },
  },
  {
    header: "Used At",
    cell: ({ row }) => {
      const redemption = row.original.redemptions?.[0];
      if (!redemption) return <span className="text-gray-400">-</span>;
      return (
        <span className="text-sm">
          {format(redemption.createdAt, "d MMM yyyy HH:mm")}
        </span>
      );
    },
  },
];

interface BatchVoucherCodesTableProps {
  vouchers: Voucher[];
}

export default function BatchVoucherCodesTable({
  vouchers,
}: BatchVoucherCodesTableProps) {
  return (
    <DataTable
      columns={columns}
      data={vouchers}
      searchPlaceholder="Search code..."
      searchColumn="code"
    />
  );
}

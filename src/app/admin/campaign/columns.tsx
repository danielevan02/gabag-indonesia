"use client";

import ActionTable from "@/components/shared/table/action-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { RouterOutputs } from "@/trpc/routers/_app";
import { useDeleteMutation } from "@/hooks/use-delete-mutation";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

type Campaign = RouterOutputs['campaign']['getAll'][number];

const CampaignActionCell = ({ campaignId }: { campaignId: string }) => {
  const deleteCampaignMutation = useDeleteMutation({ type: "campaign" });

  return (
    <ActionTable
      type="campaign"
      deleteMutation={deleteCampaignMutation}
      id={campaignId}
      title="Delete Campaign"
      catalog={false}
      desc="Are you sure you want to delete this campaign? This action cannot be undone."
    />
  );
};

const CAMPAIGN_TYPE_LABELS: Record<string, string> = {
  FLASH_SALE: "Flash Sale",
  DAILY_DEALS: "Daily Deals",
  PAYDAY_SALE: "Payday Sale",
  SEASONAL: "Seasonal",
  CLEARANCE: "Clearance",
  NEW_ARRIVAL: "New Arrival",
};

export const columns: ColumnDef<Campaign>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomeRowsSelected() && "indeterminate")}
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
    )
  },
  {
    header: "#",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "name",
    header: "Campaign Name",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        {row.original.description && (
          <span className="text-xs text-muted-foreground line-clamp-1">
            {row.original.description}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline">
        {CAMPAIGN_TYPE_LABELS[row.original.type] || row.original.type}
      </Badge>
    ),
  },
  {
    header: "Discount",
    cell: ({ row }) => {
      const { discountType, defaultDiscount } = row.original;
      return (
        <span className="font-medium">
          {discountType === "PERCENT"
            ? `${defaultDiscount}%`
            : `Rp ${defaultDiscount.toLocaleString()}`
          }
        </span>
      );
    },
  },
  {
    header: "Items",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original._count?.items || 0} item(s)
      </span>
    ),
  },
  {
    header: "Schedule",
    cell: ({ row }) => {
      const now = new Date();
      const startDate = new Date(row.original.startDate);
      const endDate = row.original.endDate ? new Date(row.original.endDate) : null;

      const isUpcoming = startDate > now;
      const isActive = endDate ? (startDate <= now && endDate >= now) : (startDate <= now);
      const isEnded = endDate ? (endDate < now) : false;

      return (
        <div className="flex flex-col gap-1 text-xs">
          <div className="flex items-center gap-1">
            {isUpcoming && <Clock className="h-3 w-3 text-yellow-600" />}
            {isActive && <CheckCircle2 className="h-3 w-3 text-green-600" />}
            {isEnded && <XCircle className="h-3 w-3 text-red-600" />}
            <span className="text-muted-foreground">
              {format(startDate, "dd MMM yyyy")}
            </span>
          </div>
          <div className="text-muted-foreground">
            to {endDate ? format(endDate, "dd MMM yyyy") : "Permanent"}
          </div>
        </div>
      );
    },
  },
  {
    header: "Status",
    cell: ({ row }) => {
      const now = new Date();
      const startDate = new Date(row.original.startDate);
      const endDate = row.original.endDate ? new Date(row.original.endDate) : null;

      // Calculate real-time active status based on dates
      const isActuallyActive = endDate
        ? (startDate <= now && endDate >= now && row.original.isActive)
        : (startDate <= now && row.original.isActive);

      return isActuallyActive ? (
        <Badge className="bg-green-600 hover:bg-green-700">Active</Badge>
      ) : (
        <Badge variant="secondary">Inactive</Badge>
      );
    },
  },
  {
    header: "Stock",
    cell: ({ row }) => {
      const { totalSoldCount, totalStockLimit } = row.original;
      if (totalStockLimit === null) {
        return <span className="text-xs text-muted-foreground">Unlimited</span>;
      }
      return (
        <span className="text-xs">
          {totalSoldCount} / {totalStockLimit}
        </span>
      );
    },
  },
  {
    header: "Priority",
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.priority}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CampaignActionCell campaignId={row.original.id} />,
  },
];

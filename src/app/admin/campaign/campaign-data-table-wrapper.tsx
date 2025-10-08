"use client";

import { DataTable } from "@/components/shared/table/data-table";
import { columns } from "./columns";
import { RouterOutputs } from "@/trpc/routers/_app";

type CampaignPrisma = RouterOutputs['campaign']['getAll'][number];

interface CampaignDataTableWrapperProps {
  campaigns: CampaignPrisma[];
}

export default function CampaignDataTableWrapper({ campaigns }: CampaignDataTableWrapperProps) {
  return (
    <DataTable
      columns={columns}
      data={campaigns}
      searchPlaceholder="Search Campaign"
      deleteTitle="Delete Campaign"
    />
  );
}

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/server";
import Link from "next/link";
import CampaignDataTableWrapper from "./campaign-data-table-wrapper";

export default async function CampaignPage() {
  const campaigns = await trpc.campaign.getAll();

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-bold">Campaign Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage flash sales, seasonal promos, and promotional campaigns
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/campaign/add">Add Campaign</Link>
        </Button>
      </div>

      <CampaignDataTableWrapper campaigns={campaigns} />
    </div>
  );
}

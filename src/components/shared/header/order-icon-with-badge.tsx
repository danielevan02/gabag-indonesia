"use client";

import { ClipboardList } from "lucide-react";
import Link from "next/link";
import { TooltipWrapper } from "../tooltip-wrapper";
import { trpc } from "@/trpc/client";

interface OrderIconWithBadgeProps {
  userId?: string;
}

export function OrderIconWithBadge({ userId }: OrderIconWithBadgeProps) {
  // Get unreviewed product count
  const { data: unreviewedData } = trpc.review.countUnreviewed.useQuery(
    { userId: userId || "" },
    { enabled: !!userId } // Only run query if userId exists
  );

  const unreviewedCount = unreviewedData?.count || 0;

  return (
    <TooltipWrapper text="Order List">
      <Link href="/orders" className="relative w-10 h-10 flex items-center justify-center transition-all hover:bg-accent rounded-lg">
        {unreviewedCount > 0 && (
          <div className="absolute bg-red-700 rounded-full text-white min-w-4 h-4 px-1 text-center text-xs -top-0.5 -right-px">
            {unreviewedCount > 99 ? "99+" : unreviewedCount}
          </div>
        )}
        <ClipboardList className="size-6" />
      </Link>
    </TooltipWrapper>
  );
}

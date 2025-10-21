"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReviewForm } from "@/components/shared/review/review-form";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface ReviewButtonProps {
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  isDelivered: boolean;
  isPaid: boolean;
  shippingInfo?: any;
}

export function ReviewButton({
  orderId,
  productId,
  productName,
  productImage,
  isDelivered,
  isPaid,
  shippingInfo,
}: ReviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Check if user can review this product
  const { data: canReviewData, isLoading } = trpc.review.canReview.useQuery({
    orderId,
    productId,
  });

  // Check actual delivery status from shippingInfo (prioritize this over isDelivered flag)
  // If shippingInfo exists, use its currentStatus, otherwise fall back to isDelivered
  const actuallyDelivered = shippingInfo?.currentStatus
    ? shippingInfo.currentStatus === "delivered"
    : isDelivered;

  // Don't show button if order is not actually delivered or not paid
  if (!actuallyDelivered || !isPaid) {
    return null;
  }

  if (isLoading) {
    return <Skeleton className="h-8 w-20" />;
  }

  // Show "Reviewed" badge if user already reviewed this product
  if (canReviewData && !canReviewData.canReview) {
    return (
      <Badge variant="secondary" className="text-xs gap-1 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 border-green-200">
        <CheckCircle2 className="w-3 h-3" />
        Reviewed
      </Badge>
    );
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="text-xs"
      >
        <MessageSquare className="w-3 h-3 mr-1" />
        Review
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Write a review</DialogTitle>
          </DialogHeader>
          <ReviewForm
            orderId={orderId}
            productId={productId}
            productName={productName}
            productImage={productImage}
            onSuccess={() => setIsOpen(false)}
            onCancel={() => setIsOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

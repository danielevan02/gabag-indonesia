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
import { MessageSquare } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

interface ReviewButtonProps {
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  isDelivered: boolean;
  isPaid: boolean;
}

export function ReviewButton({
  orderId,
  productId,
  productName,
  productImage,
  isDelivered,
  isPaid,
}: ReviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Check if user can review this product
  const { data: canReviewData, isLoading } = trpc.review.canReview.useQuery({
    orderId,
    productId,
  });

  // Don't show button if order is not delivered or not paid
  if (!isDelivered || !isPaid) {
    return null;
  }

  if (isLoading) {
    return <Skeleton className="h-8 w-20" />;
  }

  // Hide button if user cannot review (including already reviewed)
  if (canReviewData && !canReviewData.canReview) {
    return null;
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
            <DialogTitle>Tulis Review</DialogTitle>
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

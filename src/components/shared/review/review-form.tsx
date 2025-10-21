"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import Image from "next/image";

interface ReviewFormProps {
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  orderId,
  productId,
  productName,
  productImage,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const trpcUtils = trpc.useUtils();
  const { mutate: createReview, isPending } = trpc.review.create.useMutation({
    onSuccess: () => {
      toast.success("Review berhasil dikirim!", {
        description: "Terima kasih atas review Anda",
      });
      // Invalidate queries to refresh data
      trpcUtils.review.getByProduct.invalidate({ productId });
      trpcUtils.review.getOrdersForReview.invalidate();
      trpcUtils.review.canReview.invalidate({ orderId, productId });
      trpcUtils.review.countUnreviewed.invalidate(); // Update notification badge
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Gagal mengirim review", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Rating harus diisi");
      return;
    }

    if (!comment.trim()) {
      toast.error("Komentar harus diisi");
      return;
    }

    createReview({
      orderId,
      productId,
      rating,
      comment: comment.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Product Info Header */}
      <div className="flex gap-4 pb-4 border-b">
        {productImage && (
          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border">
            <Image
              src={productImage}
              alt={productName}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">Give this product a review!</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{productName}</p>
        </div>
      </div>

      {/* Rating Stars */}
      <div className="space-y-2">
        <Label htmlFor="rating">Rating</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-600 self-center">
              {rating} out of 5
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="comment">Your comment</Label>
        <Textarea
          id="comment"
          placeholder="Ceritakan pengalaman Anda dengan produk ini..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={1000}
          rows={5}
          className="resize-none"
        />
        <p className="text-xs text-gray-500 text-right">
          {comment.length}/1000 karakter
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Batal
          </Button>
        )}
        <Button type="submit" disabled={isPending || rating === 0}>
          {isPending ? "Mengirim..." : "Kirim Review"}
        </Button>
      </div>
    </form>
  );
}

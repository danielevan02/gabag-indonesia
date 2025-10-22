"use client";

import { Search, Star} from "lucide-react";
import { trpc } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ReviewListProps {
  productId: string;
  showLoadMore?: boolean;
}

export function ReviewList({ productId, showLoadMore = true }: ReviewListProps) {
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<string>("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setLimit(10); // Reset limit when search changes
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Reset limit when rating filter changes
  useEffect(() => {
    setLimit(10);
  }, [selectedRating]);

  const { data, isLoading, isFetching } = trpc.review.getByProduct.useQuery({
    productId,
    limit,
    offset: 0,
    search: searchQuery || undefined,
    rating: selectedRating && selectedRating !== "all" ? parseInt(selectedRating) : undefined,
  });

  if (isLoading) {
    return <ReviewListSkeleton />;
  }

  const { reviews, total, averageRating, ratingDistribution } = data || {
    reviews: [],
    total: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };

  // Check if there are no reviews due to filters
  const isFiltered = searchQuery || (selectedRating && selectedRating !== "all");
  const noResults = reviews.length === 0;
  const hasReviews = total > 0;

  const handleLoadMore = () => {
    setLimit((prev) => prev + 10);
  };

  const hasMore = reviews.length < total;

  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-x-8">
      {/* RATING SECTION */}
      <div className="flex flex-col gap-3 w-full md:w-fit">
        <div className="flex items-center gap-5 md:min-h-16">
          <div>
            <span className="text-4xl">{averageRating.toFixed(1)}</span>/5
          </div>

          <div className="flex flex-col">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => {
                const fillPercentage = Math.min(Math.max((averageRating - i) * 100, 0), 100);

                return (
                  <div key={i} className="relative size-3">
                    {/* Background star (empty) */}
                    <Star className="absolute inset-0 size-3 fill-gray-200 text-gray-200" />
                    {/* Foreground star (filled) */}
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${fillPercentage}%` }}
                    >
                      <Star className="size-3 fill-primary text-primary" />
                    </div>
                  </div>
                );
              })}
            </div>
            <span className="text-sm">Based on {total} reviews</span>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col-reverse gap-1 md:gap-3">
          {[...Array(5)].map((_, index) => {
            const rating = index + 1;
            const count = ratingDistribution[rating] || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div className="flex items-center text-xs gap-2" key={rating}>
                <span className="min-w-2 text-center">{rating}</span>
                <Star className="size-3 fill-primary text-primary" />
                <Progress value={percentage} />
                <span className="min-w-3 text-center">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* COMMENTS SECTION */}
      <div className="flex flex-col gap-3 flex-1">
        <div className="flex min-h-16 items-center gap-5">
          <div className="relative flex items-center">
            <Search className="absolute left-2 size-4" strokeWidth={1} />
            <Input
              className="rounded-none pl-8"
              placeholder="Search reviews..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              disabled={!hasReviews}
            />
          </div>
          <Select
            value={selectedRating}
            onValueChange={(value) => setSelectedRating(value)}
            disabled={!hasReviews}
          >
            <SelectTrigger className="rounded-none w-40">
              <SelectValue placeholder="All Ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Ratings</SelectLabel>
                <SelectItem value="all">All Ratings</SelectItem>
                <div className="flex flex-col-reverse">
                  {[...Array(5)].map((_, index) => (
                    <SelectItem value={String(index + 1)} key={index}>
                      <div className="flex items-center gap-1">
                        <Star className="size-3 fill-primary text-primary"/>
                        {index + 1}
                      </div>
                    </SelectItem>
                  ))}
                </div>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="flex flex-col gap-2 max-h-96 overflow-scroll gap-y-1">
          {isFetching && reviews.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-sm text-muted-foreground">Searching...</div>
            </div>
          ) : noResults ? (
            <div className="text-center py-8">
              {isFiltered ? (
                <>
                  <Search className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">No reviews found matching your search</p>
                  <Button
                    variant="link"
                    className="text-xs mt-2"
                    onClick={() => {
                      setSearchInput("");
                      setSearchQuery("");
                      setSelectedRating("");
                    }}
                  >
                    Clear filters
                  </Button>
                </>
              ) : (
                <>
                  <Star className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">No reviews yet</p>
                </>
              )}
            </div>
          ) : (
            <>
              {reviews.map((review, index) => (
                <div key={review.id} className={cn("flex flex-col pb-3", index !== reviews.length-1 && "border-b")}>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, i) => <Star key={i} className="size-3 fill-primary text-primary"/>)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <p className="font-semibold text-sm">{review.user.name}</p>
                    <p className="text-sm">{review.comment}</p>
                  </div>
                </div>
              ))}

              {showLoadMore && hasMore && (
                <Button
                  className="rounded-none text-primary/70 uppercase mt-3"
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isFetching}
                >
                  {isFetching ? "Loading..." : "Load more reviews"}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewListSkeleton() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start gap-x-8">
      {/* RATING SECTION SKELETON */}
      <div className="flex flex-col gap-3 w-full md:w-fit mb-8 md:mb-0">
        <div className="flex items-center gap-5 md:min-h-16">
          {/* Rating Number */}
          <Skeleton className="h-12 w-20" />

          <div className="flex flex-col gap-2">
            {/* Stars */}
            <Skeleton className="h-3 w-20" />
            {/* Based on text */}
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        <Separator />

        {/* Rating Distribution */}
        <div className="flex flex-col-reverse gap-3">
          {[...Array(5)].map((_, index) => (
            <div className="flex items-center text-xs gap-2" key={index}>
              <Skeleton className="h-3 w-2" />
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-2 w-32 md:w-40" />
              <Skeleton className="h-3 w-6" />
            </div>
          ))}
        </div>
      </div>

      {/* COMMENTS SECTION SKELETON */}
      <div className="flex flex-col gap-3 flex-1 w-full">
        {/* Search and Filter */}
        <div className="flex min-h-16 items-center gap-5 flex-col sm:flex-row">
          <Skeleton className="h-10 w-full sm:flex-1" />
          <Skeleton className="h-10 w-full sm:w-40" />
        </div>

        <Separator />

        {/* Review Items */}
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex flex-col pb-3 border-b">
              {/* Rating and Date */}
              <div className="flex justify-between items-center mb-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>

              {/* User Name and Comment */}
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

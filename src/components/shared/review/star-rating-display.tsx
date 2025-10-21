import { Star } from "lucide-react";

interface StarRatingDisplayProps {
  rating: number; // e.g., 3.4
  totalReviews: number; // e.g., 234
  showReviewCount?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StarRatingDisplay({
  rating,
  totalReviews,
  showReviewCount = true,
  size = "md",
  className = "",
}: StarRatingDisplayProps) {
  // Size configurations
  const sizeClasses = {
    sm: "size-3",
    md: "size-4",
    lg: "size-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const starSize = sizeClasses[size];
  const textSize = textSizeClasses[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Star Rating */}
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => {
          const fillPercentage = Math.min(Math.max((rating - i) * 100, 0), 100);

          return (
            <div key={i} className={`relative ${starSize}`}>
              {/* Background star (empty) */}
              <Star className={`absolute inset-0 ${starSize} fill-gray-200 text-gray-200`} />
              {/* Foreground star (filled) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <Star className={`${starSize} fill-primary text-primary`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Rating Number and Review Count */}
      {showReviewCount && (
        <span className={`text-muted-foreground ${textSize}`}>
          {rating.toFixed(1)} ({totalReviews})
        </span>
      )}
    </div>
  );
}

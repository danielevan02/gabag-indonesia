'use client';

import Image from "next/image";
import { useState } from "react";

// Default placeholder image as base64
const PLACEHOLDER_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PC9zdmc+";

interface CategoryImageProps {
  src?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default function CategoryImage({ src, alt, width, height, className }: CategoryImageProps) {
  const [imgSrc, setImgSrc] = useState(src || PLACEHOLDER_IMAGE);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setImgSrc(PLACEHOLDER_IMAGE);
      setHasError(true);
    }
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      placeholder="blur"
      blurDataURL={PLACEHOLDER_IMAGE}
      loading="lazy"
      onError={handleError}
    />
  );
}
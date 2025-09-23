"use client";

import { useState, useEffect, useMemo } from "react";
import { DragEndEvent, UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { trpc } from "@/trpc/client";

type Media = {
  id: string;
  secure_url: string;
};

interface UseGalleryStateProps {
  initialSelectedImages?: string[];
  multiple?: boolean;
}

export function useGalleryState({
  initialSelectedImages,
  multiple = false,
}: UseGalleryStateProps) {
  const [open, setOpen] = useState(false);
  const [allPhotos, setAllPhotos] = useState<Media[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const { data, isLoading: loadingImage, refetch } = trpc.gallery.getAll.useQuery();

  const galleries = useMemo(
    () => allPhotos.filter((photo) => !images.includes(photo.secure_url)),
    [allPhotos, images]
  );

  const singleImageValidation = !multiple && images.length === 1;

  useEffect(() => {
    if (initialSelectedImages) {
      setImages(initialSelectedImages);
    }
  }, [initialSelectedImages]);

  useEffect(() => {
    if (data?.images) {
      setAllPhotos(data.images);
    }
    setLoading(loadingImage);
  }, [data, loadingImage]);

  const getImageIndex = (id: UniqueIdentifier) => {
    return images?.findIndex((img) => img === id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id === over?.id) return;

    setImages((prev) => {
      const currentPosition = getImageIndex(active.id);
      const newPosition = getImageIndex(over!.id);

      return arrayMove(prev || [], currentPosition || 0, newPosition || 0);
    });
  };

  const handleAddPhoto = (url: string) => {
    if (singleImageValidation) return;
    setImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
  };

  return {
    // State
    open,
    setOpen,
    allPhotos,
    images,
    setImages,
    loading,
    galleries,
    singleImageValidation,

    // Actions
    handleDragEnd,
    handleAddPhoto,
    refetch,
  };
}
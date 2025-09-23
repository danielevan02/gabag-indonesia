"use client";

import { trpc } from "@/trpc/client";
import { mediaFileSchema } from "@/lib/schema";
import { toast } from "sonner";
import z from "zod";

type MediaFilesFormType = z.infer<typeof mediaFileSchema>;

export function useImageUpload() {
  const { mutateAsync } = trpc.gallery.create.useMutation();

  const handleSuccessUpload = async (data?: any[], refetch?: () => void) => {
    const mediaFiles = data?.map((media) => {
      return {
        public_id: media.uploadInfo.public_id,
        resource_type: media.uploadInfo.resource_type,
        secure_url: media.uploadInfo.secure_url,
        thumbnail_url: media.uploadInfo.thumbnail_url,
        bytes: media.uploadInfo.bytes,
        format: media.uploadInfo.format,
        height: media.uploadInfo.height,
        original_filename: media.uploadInfo.original_filename,
        width: media.uploadInfo.width,
      } satisfies MediaFilesFormType;
    });

    if (!mediaFiles) return;

    try {
      await mutateAsync(mediaFiles);
      refetch?.();
      toast.success(`Success upload ${mediaFiles.length} images`);
    } catch (error) {
      console.log(error);
      toast.error("Failed uploading image");
    }
  };

  return {
    handleSuccessUpload,
  };
}
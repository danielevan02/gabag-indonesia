"use client";

import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import Image from "next/image";

interface SingleImageUploadProps {
  value?: string;
  onChange: (mediaFileId: string) => void;
  disabled?: boolean;
  currentImage?: string;
}

export function SingleImageUpload({ value, onChange, disabled, currentImage }: SingleImageUploadProps) {

  const { data: mediaFiles } = trpc.gallery.getAll.useQuery();
  const selectedImage = mediaFiles?.images.find(file => file.id === value);

  const handleImageSelect = (mediaFileId: string) => {
    onChange(mediaFileId);
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-4">
      {(value && selectedImage) || currentImage ? (
        <div className="relative">
          <Image
            src={selectedImage?.secure_url || currentImage || ""}
            alt="Selected image"
            width={200}
            height={100}
            className="rounded border object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded p-4">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="text-sm text-gray-600 mt-2">No image selected</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
        {mediaFiles?.images.map((file) => (
          <div
            key={file.id}
            className={`relative cursor-pointer border-2 rounded ${
              value === file.id ? "border-blue-500" : "border-gray-200"
            }`}
            onClick={() => handleImageSelect(file.id)}
          >
            <Image
              src={file.secure_url}
              alt={file.public_id}
              width={80}
              height={80}
              className="rounded object-cover w-full h-20"
            />
          </div>
        ))}
      </div>

      {!mediaFiles?.images.length && (
        <p className="text-sm text-gray-500 text-center">
          No images available. Please upload images in the gallery first.
        </p>
      )}
    </div>
  );
}
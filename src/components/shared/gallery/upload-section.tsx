"use client";

import { Button } from "@/components/ui/button";
import { CldUploadWidget } from "next-cloudinary";
import { Upload } from "lucide-react";

interface UploadSectionProps {
  multiple: boolean;
  onSuccessUpload: (data?: any[]) => Promise<void>;
}

export default function UploadSection({
  multiple,
  onSuccessUpload,
}: UploadSectionProps) {
  return (
    <CldUploadWidget
      options={{
        multiple: multiple,
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp"],
      }}
      signatureEndpoint="/api/sign-cloudinary-params"
      onQueuesEnd={(result, { widget }) => {
        onSuccessUpload((result.info as any).files);
        widget.close();
      }}
    >
      {({ open }) => (
        <Button onClick={() => open()}>
          <Upload /> Upload Image
        </Button>
      )}
    </CldUploadWidget>
  );
}
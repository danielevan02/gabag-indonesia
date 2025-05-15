/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Button } from "@/components/ui/button";
import { SingleImageDropzone } from "@/components/upload/single-image";
import { useUploader } from "@/components/upload/uploader-provider";
import { useEffect } from "react";

interface UploadImageProps {
  initialPhoto?: string;
}

const UploadImage = ({ initialPhoto }: UploadImageProps) => {
  return (
    <>
      <SingleImageDropzone
        width={200}
        height={200}
        dropzoneOptions={{
          maxSize: 1024 * 1024 * 3, // 3 MB
        }}
        url={initialPhoto}
      />
    </>
  );
};

export default UploadImage;

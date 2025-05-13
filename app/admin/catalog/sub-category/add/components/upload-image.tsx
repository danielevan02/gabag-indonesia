/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { SingleImageDropzone } from "@/components/upload/single-image";
import { useUploader } from "@/components/upload/uploader-provider";
import { useEffect } from "react";

interface UploadImageProps {
  triggerUpload?: boolean;
  initialPhoto?: string;
}

const UploadImage = ({ triggerUpload, initialPhoto }: UploadImageProps) => {
  const { uploadFiles } = useUploader();

  useEffect(() => {
    if (triggerUpload) {
      uploadFiles();
    }
  }, [triggerUpload]);

  return (
    <SingleImageDropzone
      width={200}
      height={200}
      dropzoneOptions={{
        maxSize: 1024 * 1024 * 3, // 3 MB
      }}
      url={initialPhoto}
    />
  );
};

export default UploadImage;

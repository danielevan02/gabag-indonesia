/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { SingleImageDropzone } from "@/components/upload/single-image";

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

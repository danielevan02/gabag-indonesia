/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { SingleImageDropzone } from "@/components/upload/single-image";
import { useUploader } from "@/components/upload/uploader-provider";
import { useEffect } from "react";

const UploadImage = ({triggerUpload}:{triggerUpload: boolean}) => {
  const {uploadFiles} = useUploader()

  useEffect(()=>{
    uploadFiles()
  }, [triggerUpload])

  return (
    <SingleImageDropzone
      height={200}
      width={200}
      dropzoneOptions={{
        maxSize: 1024 * 1024 * 3, // 3 MB
      }}
    />
  );
};

export default UploadImage;

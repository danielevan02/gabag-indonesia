import { ImageUploader } from "@/components/upload/multi-image";

export const MultiImageUploader = ({ initialPhoto }: { initialPhoto?: string[] }) => {
  return (
    <ImageUploader
      maxFiles={10}
      maxSize={1024 * 1024 * 3} // 1 MB
      defaultValue={initialPhoto}
      
    />
  );
};

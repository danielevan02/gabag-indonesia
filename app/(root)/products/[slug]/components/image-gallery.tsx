import { cn } from "@/lib/utils";
import Image from "next/image";

export const ImageGallery = ({ 
  imagesList, 
  mainImage, 
  onMainImageChange, 
  onImageClick, 
  productName 
}: {
  imagesList: string[];
  mainImage: string;
  onMainImageChange: (image: string) => void;
  onImageClick: (image: string) => void;
  productName?: string;
}) => (
  <div className="image-section-container">
    <div className="image-list-container">
      {imagesList?.map((item, index) => (
        <div 
          key={index} 
          className="image-list-item" 
          onMouseEnter={() => onMainImageChange(item)}
        >
          <Image
            src={item}
            alt="Product Images"
            height={70}
            width={70}
            className="size-full object-cover"
          />
          <div
            className={cn("absolute inset-0 rounded-md", item === mainImage && "bg-black/30")}
          />
        </div>
      ))}
    </div>

    <div
      className="flex-1 min-h-full w-full cursor-pointer"
      onClick={() => onImageClick(mainImage)}
    >
      <Image
        src={mainImage}
        alt={productName || "Product Images"}
        height={400}
        width={400}
        className="main-image border"
        priority
      />
    </div>
  </div>
);
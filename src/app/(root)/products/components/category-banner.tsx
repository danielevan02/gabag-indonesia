import { trpc } from "@/trpc/server";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

interface CategoryBannerProps {
  categoryId: string;
}

const CategoryBanner = async ({ categoryId }: CategoryBannerProps) => {
  const category = await trpc.category.getById({ id: categoryId });

  return (
    <div className="flex justify-center mt-2 mb-10 w-full h-40 md:h-96">
      <Image
        src={category?.mediaFile.secure_url || ""}
        width={800}
        height={400}
        alt={category?.name || "category photo"}
        className="h-full w-full lg:w-[80%] object-cover"
        priority
      />
    </div>
  );
};

export const CategoryBannerFallback = () => {
  return (
    <div className="flex justify-center mt-2 mb-10 w-full h-40 md:h-96">
      <Skeleton className="h-full w-full lg:w-[80%]" />
    </div>
  );
};

export default CategoryBanner;
